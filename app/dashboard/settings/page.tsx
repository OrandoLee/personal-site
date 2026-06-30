import { EmailSettingsManager } from "@/components/admin/EmailSettingsManager";
import { PasswordManager } from "@/components/admin/PasswordManager";
import { uiText } from "@/content/uiText";
import {
  getOraskReplySenderEmail,
  isReplySmtpConfigured
} from "@/lib/orask-reply-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const senderEmail = await getOraskReplySenderEmail();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-zinc-500">{uiText.site.adminBrand}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-white">
          {uiText.admin.settingsTitle}
        </h1>
      </section>
      <EmailSettingsManager
        initialSenderEmail={senderEmail}
        smtpConfigured={isReplySmtpConfigured()}
      />
      <PasswordManager />
    </div>
  );
}
