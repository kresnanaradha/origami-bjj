import MembershipCard from "@/components/MembershipCard";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

export default async function Membership() {
  const { profile } = await requireUser();
  const { t } = await getI18n();
  const active = profile.valid_until && new Date(profile.valid_until) >= new Date();
  return (
    <>
      <p className="eyebrow">{t("mem.eyebrow")}</p>
      <h1 className="mb-10 mt-2 text-3xl font-bold">{t("mem.title")}</h1>
      <MembershipCard p={profile} />
      <div className="panel mt-12 flex items-center justify-between p-5">
        <p className="text-sm text-white/60">{t("mem.status")}</p>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${active ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
          {active ? t("mem.active") : t("mem.inactive")}
        </span>
      </div>
      <p className="mt-4 text-xs text-white/45">{t("mem.hint")}</p>
    </>
  );
}
