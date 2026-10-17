import BeltProgress from "@/components/BeltProgress";
import GiOptions from "@/components/GiOptions";
import { logout, setMyGi } from "@/app/actions";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireUser();
  const { t, date, dateShort } = await getI18n();
  const { data: history } = await supabase
    .from("bookings")
    .select("id, status, sessions(starts_at, classes(name))")
    .eq("user_id", user.id)
    .in("status", ["attended", "no_show"])
    .order("created_at", { ascending: false })
    .limit(20);

  const attended = history?.filter((h) => h.status === "attended").length ?? 0;
  const words = (profile.full_name || "Member").split(" ");
  const last = words.length > 1 ? words.pop() : "";
  const first = words.join(" ");
  const initials = (profile.full_name || "M").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <section className="panel overflow-hidden shadow-[0_30px_70px_-30px_rgba(232,38,42,0.45)]">
        <div className="relative flex items-center gap-4 p-5 sm:gap-6 sm:p-8">
          <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xl font-bold ring-4 ring-brand/30 sm:h-28 sm:w-28 sm:text-3xl">
            {initials}
          </div>
          <div className="relative">
            <p className="text-base font-light text-white/80 sm:text-xl">{last ? first : ""}</p>
            <h1 className="text-2xl font-bold sm:text-4xl">{last || first}</h1>
            <p className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/45">
              {t("prof.waiver")}
              <span className={`flex items-center gap-1 normal-case tracking-normal ${profile.waiver_filled ? "text-emerald-400" : "text-amber-400"}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {profile.waiver_filled ? t("prof.filled") : t("prof.notFilled")}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col divide-white/10 border-t border-white/10 bg-white/[0.03] text-sm sm:flex-row sm:divide-x">
          <p className="flex-1 truncate px-6 py-4 text-center text-white/85">✉ {user.email}</p>
          <p className="flex-1 px-6 py-4 text-center text-white/85">☎ {profile.phone ?? "-"}</p>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-lg font-bold sm:mb-4 sm:mt-10 sm:text-xl">{t("prof.belt")}</h2>
      <BeltProgress belt={profile.belt} stripes={profile.stripes} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="panel flex items-center justify-between p-6">
          <div><p className="text-sm font-light text-white/50">{t("prof.attended")}</p><p className="text-3xl font-bold">{attended}</p></div>
          <div className="text-right"><p className="text-sm font-light text-white/50">{t("prof.since")}</p><p className="text-lg font-semibold">{dateShort(user.created_at)}</p></div>
        </div>
        <form action={setMyGi} className="panel flex items-end gap-3 p-6">
          <label className="flex-1 text-sm font-light text-white/50">
            {t("prof.gi")}
            <select name="gi_size" defaultValue={profile.gi_size ?? ""} className="input mt-2 !py-2.5 font-medium text-white"><GiOptions t={t} /></select>
          </label>
          <button className="btn !py-2.5">{t("prof.giSave")}</button>
        </form>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold sm:mb-4 sm:mt-10 sm:text-xl">{t("prof.history")}</h2>
      <ul className="panel divide-y divide-white/10">
        {!history?.length && <li className="p-5 text-sm text-white/50">{t("prof.noHistory")}</li>}
        {history?.map((h) => {
          const s = h.sessions as unknown as { starts_at: string; classes: { name: string } };
          return (
            <li key={h.id} className="flex items-center justify-between p-4 text-sm">
              <span>{s.classes.name} <span className="text-white/45">· {date(s.starts_at)}</span></span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${h.status === "attended" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                {h.status === "attended" ? t("prof.present") : t("prof.noshow")}
              </span>
            </li>
          );
        })}
      </ul>

      <form action={logout} className="mt-10"><button className="btn-ghost">{t("c.logout")}</button></form>
    </>
  );
}
