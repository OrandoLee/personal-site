import { OraskReplyWorkspace } from "@/components/admin/OraskReplyWorkspace";
import { serializeOraskMessage } from "@/lib/content-serializers";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  getOraskReplySenderEmail,
  isReplySmtpConfigured
} from "@/lib/orask-reply-settings";

export const metadata = {
  title: "Orask 回复工作台"
};

export const dynamic = "force-dynamic";

export default async function OraskReplyPage() {
  const session = requireAdminPage("/login/ans");
  const [messages, senderEmail] = await Promise.all([
    prisma.oraskMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    getOraskReplySenderEmail()
  ]);

  return (
    <OraskReplyWorkspace
      initialItems={messages.map(serializeOraskMessage)}
      initialSenderEmail={senderEmail}
      smtpConfigured={isReplySmtpConfigured()}
      username={session.username}
    />
  );
}
