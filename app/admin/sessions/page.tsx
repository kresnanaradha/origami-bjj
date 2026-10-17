import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

type S = { id: string; starts_at: string; ends_at: string; instructor: string; capacity: number; classes: { name: string }; bookings: { status: string }[] };

export default async function Sessions({ searchParams }: PageProps<"/admin/sessions">) {
  const sp = await searchParams;
  const tab = sp.tab === "past" ? "past" : "upcoming";
  const classFilter = typeof sp.class === "string" ? sp.class : "";
  const { supabase } = await requireUser(true);
  const { t, date, range } = await getI18n();
  const now = new Date().toISOString();

  let q = supabase.from("sessions").select("id, starts_at, ends_at, instructor, capacity, classes(name), bookings(status)");
  if (classFilter) q = q.eq("class_id", classFilter);
  q = tab === "past" ? q.lt("ends_at", now).order("starts_at", { ascending: false }).limit(60) : q.gte("ends_at", now).order("starts_at").limit(60);
  const [{ data }, { data: classes }] = await Promise.all([q, supabase.from("classes").select("id, name").order("sort")]);
  const sessions = (data ?? []) as unknown as S[];

  const byDay = new Map<string, S[]>();
  for (const s of sessions) byDay.set(date(s.starts_at), [...(byDay.get(date(s.starts_at)) ?? []), s]);

  return (
    <>
      <p className="eyebrow">{t("a.eyebrow")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("a.att.title")}</h1>
      <p className="mt-2 text-sm text-white/55">{t("a.att.intro")}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm">
          {(["upcoming", "past"] as const).map((tb) => (
            <Link key={tb} href={`/admin/sessions?tab=${tb}${classFilter ? `&class=${classFilter}` : ""}`} className={`rounded-lg px-4 py-1.5 transition ${tab === tb ? "bg-brand text-white shadow" : "text-white/60 hover:text-white"}`}>
              {t(tb === "upcoming" ? "a.sch.upcoming" : "a.sch.past")}
            </Link>
          ))}
        </div>
        <form className="flex items-center gap-2">
          <input type="hidden" name="tab" value={tab} />
          <select name="class" defaultValue={classFilter} className="input !w-auto !py-2">
            <option value="" className="bg-neutral-900">{t("a.sch.allClasses")}</option>
            {classes?.map((c) => <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>)}
          </select>
          <button className="btn-ghost !py-2">{t("c.search")}</button>
        </form>
      </div>

      <div className="mt-6 space-y-8">
        {!sessions.length && <p className="text-white/55">{t("a.sch.empty")}</p>}
        {[...byDay.entries()].map(([day, list]) => (
          <section key={day}>
            <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-white/70"><span className="h-px w-6 bg-brand" />{day}</h2>
            <ul className="panel divide-y divide-white/10 overflow-hidden">
              {list.map((s) => {
                const present = s.bookings.filter((b) => b.status === "attended").length;
                const booked = s.bookings.filter((b) => b.status === "booked").length;
                return (
                  <li key={s.id}>
                    <Link href={`/admin/sessions/${s.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-white/[0.04]">
                      <div>
                        <p className="font-semibold">{s.classes.name} <span className="ml-2 text-xs font-normal text-brand">{range(s.starts_at, s.ends_at)}</span></p>
                        <p className="text-xs text-white/40">{s.instructor || "—"}</p>
                      </div>
                      <p className="text-sm text-white/70">
                        <span className="font-semibold text-white">{present}</span> {t("a.dash.present")} · {booked} {t("a.dash.booked")} · {s.capacity}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
