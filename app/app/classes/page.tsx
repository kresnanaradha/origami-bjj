import { book, cancel } from "@/app/actions";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/site";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

type Row = {
  id: string; starts_at: string; ends_at: string; instructor: string; capacity: number;
  classes: { name: string; audience: string };
};

export default async function Classes({ searchParams }: PageProps<"/app/classes">) {
  const { error } = await searchParams;
  const { supabase, user, profile } = await requireUser();
  const { t, x, date, time, dateLong } = await getI18n();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("sessions")
    .select("id, starts_at, ends_at, instructor, capacity, classes(name, audience)")
    .gte("ends_at", now)
    .order("starts_at")
    .limit(60);
  const sessions = (data ?? []) as unknown as Row[];
  const ids = sessions.map((s) => s.id);

  const [{ data: mine }, { data: taken }] = await Promise.all([
    supabase.from("bookings").select("session_id, status").eq("user_id", user.id),
    ids.length ? supabase.rpc("session_taken", { p_ids: ids }) : Promise.resolve({ data: [] as { session_id: string; taken: number }[] }),
  ]);
  const status = new Map(mine?.map((b) => [b.session_id, b.status]));
  const count = new Map<string, number>(((taken ?? []) as { session_id: string; taken: number }[]).map((r) => [r.session_id, r.taken]));

  // kelompokkan per hari (WITA)
  const dayKey = (iso: string) => new Date(new Date(iso).getTime() + 8 * 3600e3).toISOString().slice(0, 10);
  const todayKey = dayKey(now);
  const tomorrowKey = dayKey(new Date(Date.now() + 864e5).toISOString());
  const groups = new Map<string, Row[]>();
  for (const s of sessions) groups.set(dayKey(s.starts_at), [...(groups.get(dayKey(s.starts_at)) ?? []), s]);

  return (
    <>
      <p className="eyebrow">{t("cls.eyebrow")}</p>
      <h1 className="mb-6 mt-2 text-2xl font-bold sm:mb-8 sm:text-3xl">{t("cls.title")}</h1>
      {error && <p className="mb-6 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      <section className="panel mb-10 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="max-w-xl">
          <h2 className="text-lg font-bold">{t("priv.title")}</h2>
          <p className="mt-1 text-sm text-white/60">{t("priv.sub")}</p>
        </div>
        <a href={waLink(t("priv.msg", { name: profile.full_name }))} target="_blank" rel="noopener noreferrer" className="btn-wa">
          <WhatsAppIcon className="h-5 w-5" />{t("priv.btn")}
        </a>
      </section>
      {!sessions.length && <p className="text-white/60">{t("cls.empty")}</p>}

      <div className="space-y-10">
        {[...groups.entries()].map(([key, list]) => (
          <section key={key}>
            <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-white/70">
              <span className="h-px w-6 bg-brand" />
              {key === todayKey ? t("cls.today") : key === tomorrowKey ? t("cls.tomorrow") : dateLong(list[0].starts_at)}
              {(key === todayKey || key === tomorrowKey) && <span className="normal-case tracking-normal text-white/40">· {date(list[0].starts_at)}</span>}
            </h2>
            <div className="panel overflow-hidden !rounded-2xl">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-white/10">
                  {list.map((s) => {
                    const cls = s.classes;
                    const st = status.get(s.id);
                    const left = s.capacity - (count.get(s.id) ?? 0);
                    const full = left <= 0 && st !== "booked" && st !== "attended";
                    return (
                      <tr key={s.id} className="transition hover:bg-white/[0.04]">
                        <td className="whitespace-nowrap py-4 pl-4 pr-2 align-top sm:pl-5 sm:pr-3 text-xs font-semibold text-brand sm:text-sm">
                          {time(s.starts_at)}<span className="block font-normal text-white/40">{time(s.ends_at)}</span>
                        </td>
                        <td className="px-2 py-4 align-top sm:px-3">
                          <p className="font-bold">{cls.name}</p>
                          <p className="text-xs text-white/50">{x(cls.audience)}{s.instructor && <span className="sm:hidden"> · {s.instructor}</span>}</p>
                          <p className={`mt-1 text-[11px] sm:hidden ${st === "booked" ? "font-semibold text-emerald-300" : left <= 5 ? "text-amber-400" : "text-white/40"}`}>{st === "booked" ? t("cls.youBooked") : full ? t("cls.full") : t("cls.spots", { n: Math.max(left, 0) })}</p>
                        </td>
                        <td className="hidden px-3 py-4 align-top text-white/60 sm:table-cell">{s.instructor || "—"}</td>
                        <td className={`hidden whitespace-nowrap px-3 py-4 align-top text-xs sm:table-cell ${st === "booked" ? "font-semibold text-emerald-300" : left <= 5 ? "text-amber-400" : "text-white/40"}`}>{st === "booked" ? t("cls.youBooked") : full ? t("cls.full") : t("cls.spots", { n: Math.max(left, 0) })}</td>
                        <td className="py-3 pl-2 pr-3 text-right align-top sm:pl-3 sm:pr-4">
                          <form action={st === "booked" ? cancel : book}>
                            <input type="hidden" name="session" value={s.id} />
                            {st === "attended" ? (
                              <span className="inline-block w-20 sm:w-28 whitespace-nowrap rounded-xl bg-emerald-500/15 px-2 py-2.5 text-center text-xs font-semibold text-emerald-300">{t("cls.attended")}</span>
                            ) : st === "no_show" ? (
                              <span className="inline-block w-20 sm:w-28 whitespace-nowrap rounded-xl bg-red-500/15 px-2 py-2.5 text-center text-xs font-semibold text-red-300">{t("cls.noshow")}</span>
                            ) : st === "booked" ? (
                              <button className="btn-ghost h-10 w-20 sm:w-28 whitespace-nowrap !px-2 !py-0 text-xs">{t("cls.booked")}</button>
                            ) : (
                              <button className="btn h-10 w-20 sm:w-28 whitespace-nowrap !px-2 !py-0 text-xs" disabled={full}>{t("cls.book")}</button>
                            )}
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
