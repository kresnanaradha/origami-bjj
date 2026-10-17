import { deleteTemplate, saveTemplate } from "@/app/actions";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Senin dulu

type Tpl = { id: string; class_id: string; weekday: number; start_time: string; end_time: string; instructor: string; capacity: number; active: boolean; classes: { name: string } };
type Cls = { id: string; name: string };

export default async function Schedule({ searchParams }: PageProps<"/admin/schedule">) {
  const sp = await searchParams;
  const { supabase } = await requireUser(true);
  const { t, weekday } = await getI18n();

  const [{ data: tpl }, { data: classes }] = await Promise.all([
    supabase.from("class_schedules").select("id, class_id, weekday, start_time, end_time, instructor, capacity, active, classes(name)").order("start_time"),
    supabase.from("classes").select("id, name").order("sort"),
  ]);
  const rows = (tpl ?? []) as unknown as Tpl[];
  const cls = (classes ?? []) as Cls[];

  // satu form dipakai untuk "tambah" (tanpa id) dan "ubah" (dengan id)
  const form = (r: Partial<Tpl> & { weekday: number }) => (
    <form action={saveTemplate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {r.id && <input type="hidden" name="id" value={r.id} />}
      <label className="text-xs text-white/50 lg:col-span-2">{t("a.sch.class")}
        <select name="class_id" defaultValue={r.class_id ?? cls[0]?.id} required className="input mt-1">
          {cls.map((c) => <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>)}
        </select>
      </label>
      <label className="text-xs text-white/50">{t("a.sch.day")}
        <select name="weekday" defaultValue={r.weekday} className="input mt-1">
          {WEEK_ORDER.map((d) => <option key={d} value={d} className="bg-neutral-900">{weekday(d)}</option>)}
        </select>
      </label>
      <label className="text-xs text-white/50">{t("a.sch.start")}
        <input name="start_time" type="time" required defaultValue={r.start_time?.slice(0, 5) ?? "18:00"} className="input mt-1" />
      </label>
      <label className="text-xs text-white/50">{t("a.sch.end")}
        <input name="end_time" type="time" required defaultValue={r.end_time?.slice(0, 5) ?? "19:00"} className="input mt-1" />
      </label>
      <label className="text-xs text-white/50">{t("a.sch.capacity")}
        <input name="capacity" type="number" min={1} defaultValue={r.capacity ?? 30} className="input mt-1" />
      </label>
      <label className="text-xs text-white/50 sm:col-span-2 lg:col-span-3">{t("a.sch.instructor")}
        <input name="instructor" defaultValue={r.instructor ?? "Coach Ronny"} className="input mt-1" />
      </label>
      {r.id && (
        <label className="flex items-end gap-2 pb-3 text-sm text-white/80 lg:col-span-1">
          <input name="active" type="checkbox" defaultChecked={r.active} className="h-4 w-4 accent-[#e8262a]" /> {t("a.sch.active")}
        </label>
      )}
      <div className="flex items-end sm:col-span-2 lg:col-span-2"><button className="btn w-full sm:w-auto">{t("a.sch.saveBtn")}</button></div>
    </form>
  );

  return (
    <>
      <p className="eyebrow">{t("a.eyebrow")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("a.sch.title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/55">{t("a.sch.intro")} {t("a.sch.note")}</p>
      {sp.error && <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{String(sp.error)}</p>}
      {sp.saved && <p className="mt-5 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{t("a.sch.saved")}</p>}

      <div className="mt-8 space-y-6">
        {WEEK_ORDER.map((d) => {
          const day = rows.filter((r) => r.weekday === d);
          if (!day.length && d === 0) return null; // Minggu disembunyikan kalau kosong; tetap bisa dipilih di form
          return (
            <section key={d} className="panel overflow-hidden">
              <h2 className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5 text-sm font-semibold uppercase tracking-widest">
                <span className="h-px w-5 bg-brand" />{weekday(d)}
              </h2>
              <ul className="divide-y divide-white/10">
                {!day.length && <li className="px-5 py-4 text-sm text-white/40">{t("a.sch.noClass")}</li>}
                {day.map((r) => (
                  <li key={r.id}>
                    <details className="group">
                      <summary className={`grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-4 py-4 transition hover:bg-white/[0.04] sm:grid-cols-[8rem_1fr_auto_auto] sm:gap-y-0 sm:px-5 ${r.active ? "" : "opacity-50"}`}>
                        <span className="text-sm font-semibold text-brand">{r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}</span>
                        <span className="font-semibold">{r.classes.name}</span>
                        <span className="text-xs text-white/45">{r.instructor || "—"} · {r.capacity}</span>
                        <span className="col-start-2 row-span-3 row-start-1 self-center rounded-lg border border-white/15 px-3 py-1 text-xs text-white/70 group-open:bg-brand group-open:text-white sm:col-start-auto sm:row-span-1 sm:row-start-auto">{t("a.sch.edit")}</span>
                      </summary>
                      <div className="space-y-4 border-t border-white/10 bg-black/30 px-4 py-5 sm:px-5">
                        {form(r)}
                        <form action={deleteTemplate}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="text-sm text-red-300 underline-offset-2 hover:underline">{t("a.sch.deleteBtn")}</button>
                        </form>
                      </div>
                    </details>
                  </li>
                ))}
                <li>
                  <details className="group">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium sm:px-5 text-white/60 transition hover:bg-white/[0.04] hover:text-white">{t("a.sch.addClass")}</summary>
                    <div className="border-t border-white/10 bg-black/30 px-4 py-5 sm:px-5">{form({ weekday: d })}</div>
                  </details>
                </li>
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
