import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import LangSwitch from "@/components/LangSwitch";
import Logo from "@/components/Logo";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireUser(true);
  const { t } = await getI18n();
  const labels = { dashboard: t("a.dashboard"), schedule: t("a.schedule"), attendance: t("a.attendance"), members: t("a.members"), qr: t("a.qr") };
  return (
    <div className="min-h-screen overflow-x-clip">
      <header className="bar sticky top-0 z-30 backdrop-blur print:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Logo href="/admin" />
          <AdminNav labels={labels} className="hidden md:flex" />
          <div className="flex items-center gap-2">
            <LangSwitch />
            <Link href="/app" aria-label={t("a.memberView")} className="btn-dark !px-3 !py-1.5 text-sm sm:!px-5">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current sm:hidden" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" /></svg>
              <span className="hidden sm:inline">{t("a.memberView")}</span>
            </Link>
          </div>
        </div>
        <AdminNav labels={labels} className="overflow-x-auto px-3 pb-2 md:hidden" />
      </header>
      <main className="rise mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
