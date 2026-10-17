import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

const witaDay = (offset = 0) => new Date(Date.now() + 8 * 3600e3 + offset * 864e5).toISOString().slice(0, 10);

export default async function AdminDashboard() {
  const { supabase } = await requireUser(true);
  const { t, range, dateShort } = await getI18n();
  const today = witaDay();
  const dayStart = new Date(`${today}T00:00:00+08:00`).toISOString();
  const dayEnd = new Date(`${today}T23:59:59+08:00`).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  const [members, active, expiring, week, todays, expList] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("valid_until", today),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("valid_until", today).lte("valid_until", witaDay(7)),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "attended").gte("checked_in_at", weekAgo),
    supabase.from("sessions").select("id, starts_at, ends_at, instructor, capacity, classes(name), bookings(status)").gte("starts_at", dayStart).lte("starts_at", dayEnd).order("starts_at"),
    supabase.from("profiles").select("id, full_name, membership_type, valid_until").gte("valid_until", today).lte("valid_until", witaDay(14)).order("valid_until").limit(6),
  ]);

  const kpis: [string, number][] = [
    [t("a.dash.members"), members.count ?? 0],
    [t("a.dash.active"), active.count ?? 0],
    [t("a.dash.expiring"), expiring.count ?? 0],
    [t("a.dash.week"), week.count ?? 0],
  ];
  const sessions = todays.data ?? [];

  return (
    <>
      <p className="eyebrow">{t("a.eyebrow")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("a.dash.title")}</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([k, v], i) => (
          <div key={k} className="panel relative overflow-hidden p-5">
            {i === 2 && v > 0 && <span className="absolute right-4 top-4 h-2 w-2 animate-pulse rounded-full bg-brand" />}
            <p className="text-4xl font-bold">{v}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/45">{k}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("a.dash.todayList")}</h2>
          <div className="space-y-3">
            {!sessions.length && <p className="panel p-5 text-sm text-white/55">{t("a.dash.noToday")}</p>}
            {sessions.map((s) => {
              const b = (s.bookings ?? []) as { status: string }[];
              const cls = s.classes as unknown as { name: string };
              return (
                <Link key={s.id} href={`/admin/sessions/${s.id}`} className="panel lift flex items-center justify-between gap-4 p-5 hover:border-brand/50">
                  <div>
                    <p className="text-xs font-semibold text-brand">{range(s.starts_at, s.ends_at)}</p>
                    <p className="mt-0.5 text-lg font-bold">{cls.name}</p>
                    <p className="text-xs text-white/45">{s.instructor || "—"}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p><span className="text-xl font-bold">{b.filter((x) => x.status === "attended").length}</span> <span className="text-white/45">{t("a.dash.present")}</span></p>
                    <p className="text-white/45">{b.filter((x) => x.status === "booked").length} {t("a.dash.booked")} · {s.capacity}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("a.dash.expList")}</h2>
          <ul className="panel divide-y divide-white/10">
            {!expList.data?.length && <li className="p-5 text-sm text-white/55">{t("a.dash.noExp")}</li>}
            {expList.data?.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/members/${m.id}`} className="flex items-center justify-between p-4 text-sm transition hover:bg-white/[0.04]">
                  <span>{m.full_name}<span className="block text-xs text-white/40">{m.membership_type}</span></span>
                  <span className="text-xs text-amber-400">{m.valid_until ? dateShort(m.valid_until) : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
