import Link from "next/link";
import MembershipCard from "@/components/MembershipCard";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

const icons = {
  cal: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8.5 14 7 21l5-3 5 3-1.5-7",
};

export default async function MemberHome() {
  const { supabase, user, profile } = await requireUser();
  const { t, date, range, dateShort } = await getI18n();

  const wita = new Date(Date.now() + 8 * 3600e3);
  const monthStart = new Date(Date.UTC(wita.getUTCFullYear(), wita.getUTCMonth(), 1) - 8 * 3600e3).toISOString();

  const [{ data: next }, { count: month }, { count: total }] = await Promise.all([
    supabase
      .from("bookings")
      .select("status, sessions!inner(id, starts_at, ends_at, classes(name))")
      .eq("user_id", user.id)
      .eq("status", "booked")
      .gte("sessions.ends_at", new Date().toISOString())
      .order("starts_at", { referencedTable: "sessions", ascending: true })
      .limit(1),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "attended").gte("checked_in_at", monthStart),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "attended"),
  ]);
  const upcoming = next?.[0]?.sessions as unknown as { starts_at: string; ends_at: string; classes: { name: string } } | undefined;

  const stats: [string, string | number][] = [
    [t("m.stat.month"), month ?? 0],
    [t("m.stat.total"), total ?? 0],
    [t("m.stat.valid"), profile.valid_until ? dateShort(profile.valid_until) : "—"],
  ];

  return (
    <>
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-12">
        <div>
          <p className="eyebrow">{t("m.eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:mt-3 sm:text-5xl">{t("m.welcome")}</h1>
          <p className="bg-gradient-to-r from-red-200 via-red-400 to-brand bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-6xl">
            {profile.full_name.split(" ")[0] || "Member"}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60 sm:mt-5">{t("m.tagline")}</p>
        </div>
        <MembershipCard p={profile} />
      </div>

      <section className="panel relative mt-10 flex flex-wrap items-center justify-between gap-4 overflow-hidden p-4 sm:mt-14 sm:p-6">
        <div className="absolute -left-10 top-0 h-full w-40 bg-brand/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <p className="eyebrow">{t("m.next")}</p>
          {upcoming ? (
            <p className="mt-2 text-lg font-semibold sm:text-xl">
              {upcoming.classes.name}
              <span className="mt-1 block text-sm font-normal text-white/55">{date(upcoming.starts_at)} · {range(upcoming.starts_at, upcoming.ends_at)}</span>
            </p>
          ) : (
            <p className="mt-2 text-white/60">{t("m.noBooking")}</p>
          )}
        </div>
        <Link href={upcoming ? "/app/scan" : "/app/classes"} className="btn relative">{upcoming ? t("m.scanIn") : t("m.bookClass")}</Link>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map(([k, v]) => (
          <div key={k} className="panel p-4 sm:p-5">
            <p className="text-2xl font-bold sm:text-3xl">{v}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/45">{k}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold sm:mt-14 sm:text-xl">{t("m.benefits")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {([["m.b1t", "m.b1d", icons.cal], ["m.b2t", "m.b2d", icons.award]] as const).map(([tt, d, icon]) => (
          <div key={tt} className="panel lift p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>
            </span>
            <h3 className="mt-4 font-semibold">{t(tt)}</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/55">{t(d)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
