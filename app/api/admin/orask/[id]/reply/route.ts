import { oraskReplySchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import { serializeOraskMessage } from "@/lib/content-serializers";
import { prisma } from "@/lib/db";
import { sendOraskReplyEmail } from "@/lib/mail";
import { getOraskReplySenderEmail } from "@/lib/orask-reply-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = oraskReplySchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  const [message, senderEmail] = await Promise.all([
    prisma.oraskMessage.findUnique({ where: { id: params.id } }),
    getOraskReplySenderEmail()
  ]);

  if (!message) {
    return errorJson("这条 Orask 留言不存在。", 404);
  }

  if (!senderEmail) {
    return errorJson("请先设置回复邮件的发件邮箱。", 409);
  }

  const pendingReply = await prisma.oraskReply.create({
    data: {
      messageId: message.id,
      senderEmail,
      recipientEmail: message.email,
      subject: parsed.data.subject,
      body: parsed.data.body
    }
  });

  try {
    await sendOraskReplyEmail({
      senderEmail,
      recipientEmail: message.email,
      visitorName: message.name,
      subject: parsed.data.subject,
      body: parsed.data.body
    });
  } catch (error) {
    console.error("Orask reply mail error:", error);
    await prisma.oraskReply.update({
      where: { id: pendingReply.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message.slice(0, 500) : "SMTP send failed"
      }
    });

    return errorJson("邮件发送失败，请检查 SMTP 配置后重试。", 502);
  }

  const sentAt = new Date();
  await prisma.$transaction([
    prisma.oraskReply.update({
      where: { id: pendingReply.id },
      data: {
        status: "sent",
        sentAt,
        error: null
      }
    }),
    prisma.oraskMessage.update({
      where: { id: message.id },
      data: {
        read: true,
        repliedAt: sentAt
      }
    })
  ]);

  const updatedMessage = await prisma.oraskMessage.findUnique({
    where: { id: message.id },
    include: {
      replies: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!updatedMessage) {
    return errorJson("回复已发送，但无法刷新留言状态。", 500);
  }

  return okJson(serializeOraskMessage(updatedMessage));
}
