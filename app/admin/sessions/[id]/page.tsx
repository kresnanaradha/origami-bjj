import Link from "next/link";
import { notFound } from "next/navigation";
import { addGuest, addWalkIn, cancelSession, setAttendance } from "@/app/actions";
import GiOptions from "@/components/GiOptions";
import { BELTS } from "@/lib/format";
import { giLabel } from "@/components/GiOptions";
import { getI18n, type Key } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

const beltDot: Record<string, string> = { White: "#f5f5f5", Blue: "#2f6bd8", Purple: "#7b3fc4", Brown: "#8a5a34", Black: "#111" };
const badge: Record<string, string> = {
  booked: "bg-amber-500/15 text-amber-300",
  attended: "bg-emerald-500/15 text-emerald-300",
  no_show: "bg-red-500/15 text-red-300",
};

type P = { full_name: string; phone: string | null; belt: string; stripes: number; gi_size: string | null; is_guest: boolean };

export default async function SessionAttendance(props: PageProps<"/admin/sessions/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const q = sp.q;
  const { supabase } = await requireUser(true);
  const { t, date, range } = await getI18n();

  const [{ data: s }, { data: bookings }, { data: everyone }] = await Promise.all([
    supabase.from("sessions").select("id, starts_at, ends_at, instructor, capacity, classes(name)").eq("id", id).maybeSingle(),
    supabase.from("bookings").select("id, user_id, status, checked_in_at, profiles(full_name, phone, belt, stripes, gi_size, is_guest)").eq("session_id", id).neq("status", "cancelled").order("created_at"),
    supabase.from("profiles").select("id, full_name").order("full_name").limit(500),
  ]);
  if (!s) notFound();

  const cls = s.classes as unknown as { name: string };
  const all = (bookings ?? []).map((b) => ({ ...b, p: b.profiles as unknown as P }));
  const term = typeof q === "string" ? q.toLowerCase() : "";
  const rows = all.filter((b) => b.p.full_name.toLowerCase().includes(term));
  const present = all.filter((b) => b.status === "attended").length;
  const booked = all.filter((b) => b.status === "booked").length;

  // gi yang perlu disiapkan: peserta booked/hadir, dikelompokkan per ukuran ("own" = bawa sendiri, tidak dihitung)
  const giCount = new Map<string, number>();
  for (const b of all) {
    if (b.status === "no_show" || b.p.gi_size === "own") continue;
    const k = b.p.gi_size ?? "?";
    giCount.set(k, (giCount.get(k) ?? 0) + 1);
  }
  const giList = [...giCount.entries()].sort(([a], [b]) => a.localeCompare(b));
  const inSession = new Set(all.map((b) => b.user_id));
  const candidates = (everyone ?? []).filter((m) => !inSession.has(m.id));

  return (
    <>
      <Link href="/admin/sessions" className="text-sm text-white/55 transition hover:text-white">{t("a.ses.back")}</Link>
      <p className="mt-6 text-sm font-semibold text-brand">{date(s.starts_at)} · {range(s.starts_at, s.ends_at)}</p>
      <h1 className="text-4xl font-bold md:text-5xl">{cls.name}</h1>
      <p className="mt-1 text-white/55">{t("a.ses.instructor")}: {s.instructor || "—"}</p>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="panel p-3 sm:p-5"><p className="text-3xl font-bold sm:text-4xl">{present}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45 sm:text-xs">{t("a.ses.checked")}</p></div>
        <div className="panel p-3 sm:p-5"><p className="text-3xl font-bold sm:text-4xl">{booked}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45 sm:text-xs">{t("a.ses.booked")}</p></div>
        <div className="panel p-3 sm:p-5"><p className="text-3xl font-bold sm:text-4xl">{s.capacity}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45 sm:text-xs">{t("a.ses.capacity")}</p></div>
      </div>

      <section className="panel mt-4 p-5">
        <h2 className="font-semibold">{t("a.ses.giTitle")}</h2>
        <p className="text-xs text-white/45">{t("a.ses.giHelp")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!giList.length && <p className="text-sm text-white/50">{t("a.ses.giNone")}</p>}
          {giList.map(([size, n]) => (
            <span key={size} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm">
              <span className="font-bold text-brand">{n}×</span>{" "}
              {size === "?" ? t("a.ses.giUnknown") : giLabel(t, size)}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-xl font-bold">{t("a.ses.who")} <span className="text-sm font-normal text-white/45">· {t("a.ses.count", { n: all.length })}</span></h2>
        <form><input name="q" defaultValue={term} placeholder={t("a.ses.find")} className="input !w-64" /></form>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!rows.length && <li className="col-span-full text-white/55">{t("a.ses.empty")}</li>}
        {rows.map((b) => (
          <li key={b.id} className="panel lift overflow-hidden !rounded-2xl">
            <div className="flex items-start gap-3 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold">
                {b.p.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.p.full_name} {b.p.is_guest && <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60">{t("a.mem.guest")}</span>}</p>
                <p className="text-xs text-white/45">{b.p.phone ?? "-"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5">
                    <span className="h-2 w-2 rounded-full ring-1 ring-white/30" style={{ background: beltDot[b.p.belt] }} />
                    {t(`belt.${b.p.belt}` as Key)}{b.p.stripes > 0 && ` · ${b.p.stripes}`}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/70">Gi: {giLabel(t, b.p.gi_size)}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${badge[b.status]}`}>
                    {b.status === "attended" ? t("a.ses.present") : b.status === "no_show" ? t("a.ses.noshow") : t("a.ses.booked")}
                  </span>
                </div>
              </div>
            </div>
            <form action={setAttendance} className="flex gap-2 border-t border-white/10 bg-gradient-to-r from-brand/15 to-transparent p-3">
              <input type="hidden" name="booking" value={b.id} />
              <input type="hidden" name="session" value={id} />
              <input type="hidden" name="current" value={b.status} />
              <button
                name="status" value="attended" title={b.status === "attended" ? t("a.ses.undo") : undefined} aria-pressed={b.status === "attended"}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${b.status === "attended" ? "bg-emerald-500 text-black shadow-[0_8px_24px_-10px_rgba(16,185,129,0.9)]" : "btn !py-2"}`}
              >
                {b.status === "attended" ? "✓ " : ""}{t("a.ses.present")}
              </button>
              <button
                name="status" value="no_show" title={b.status === "no_show" ? t("a.ses.undo") : undefined} aria-pressed={b.status === "no_show"}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${b.status === "no_show" ? "bg-red-500 text-white shadow-[0_8px_24px_-10px_rgba(239,68,68,0.9)]" : "btn-ghost !py-2"}`}
              >
                {b.status === "no_show" ? "✓ " : ""}{t("a.ses.noshow")}
              </button>
            </form>
          </li>
        ))}
      </ul>

      {sp.error && <p className="mt-10 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{String(sp.error)}</p>}
      {sp.added && <p className="mt-10 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{t("a.ses.added")}</p>}

      <form action={addWalkIn} className="panel mt-10 flex flex-wrap items-end gap-3 p-5">
        <input type="hidden" name="session" value={id} />
        <label className="min-w-64 flex-1 text-sm text-white/60">
          {t("a.ses.walkin")}
          <select name="user" required defaultValue="" className="input mt-2">
            <option value="" disabled className="bg-neutral-900">{t("a.ses.pick")}</option>
            {candidates.map((m) => <option key={m.id} value={m.id} className="bg-neutral-900">{m.full_name}</option>)}
          </select>
        </label>
        <button className="btn">{t("a.ses.addPresent")}</button>
      </form>

      <details className="panel mt-4 p-5">
        <summary className="cursor-pointer text-sm font-medium text-white/80 transition hover:text-white">+ {t("a.ses.newPerson")}</summary>
        <p className="mt-3 text-xs text-white/45">{t("a.ses.guestHelp")}</p>
        <form action={addGuest} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="session" value={id} />
          <input name="name" required placeholder={t("a.ses.nameLbl")} className="input sm:col-span-2" />
          <input name="phone" type="tel" placeholder={t("a.ses.phoneLbl")} className="input" />
          <input name="email" type="email" placeholder={t("a.ses.emailLbl")} className="input" />
          <label className="text-xs text-white/50">{t("auth.belt")}
            <select name="belt" defaultValue="White" className="input mt-1">{BELTS.map((x) => <option key={x} value={x} className="bg-neutral-900">{t(`belt.${x}` as Key)}</option>)}</select>
          </label>
          <label className="text-xs text-white/50">{t("gi.label")}
            <select name="gi_size" defaultValue="" className="input mt-1"><GiOptions t={t} /></select>
          </label>
          <button className="btn sm:col-span-2">{t("a.ses.addPresent")}</button>
        </form>
      </details>

      <details className="panel mt-6 p-5">
        <summary className="cursor-pointer text-sm text-white/55 transition hover:text-white">{t("a.ses.cancelClass")}</summary>
        <p className="mt-3 text-sm text-white/55">{t("a.ses.cancelHelp")}</p>
        <form action={cancelSession} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <button className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">{t("a.ses.cancelConfirm")}</button>
        </form>
      </details>
    </>
  );
}
