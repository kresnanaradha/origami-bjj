import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import Logo from "@/components/Logo";
import MemberNav from "@/components/MemberNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

export default async function MemberLayout({ children }: LayoutProps<"/app">) {
  const { profile } = await requireUser();
  const { t } = await getI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bar sticky top-0 z-30 flex items-center justify-between px-4 py-2 backdrop-blur sm:px-6">
        <Logo href="/app" />
        <div className="flex items-center gap-3">
          <LangSwitch />
          {profile.role === "admin" && <Link href="/admin" className="btn-dark !py-1.5">{t("a.eyebrow")}</Link>}
        </div>
      </header>
      <main className="rise mx-auto w-full max-w-4xl flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pb-36 sm:pt-8">{children}</main>
      <MemberNav labels={{ home: t("tab.home"), membership: t("tab.membership"), scan: t("tab.scan"), class: t("tab.class"), profile: t("tab.profile") }} />
      <WhatsAppButton />
    </div>
  );
}
