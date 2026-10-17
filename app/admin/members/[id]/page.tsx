import Link from "next/link";
import { notFound } from "next/navigation";
import { activatePlan, mergeGuest, updateMember } from "@/app/actions";
import GiOptions from "@/components/GiOptions";
import { BELTS, PLANS } from "@/lib/format";
import { getI18n, type Key } from "@/lib/i18n";
import { requireUser, type Profile } from "@/lib/supabase";

export default async function MemberDetail(props: PageProps<"/admin/members/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const { supabase } = await requireUser(true);
  const { t, date, dateShort } = await getI18n();

  const [{ data: m }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle<Profile>(),
    supabase.from("bookings").select("id, status, sessions(starts_at, classes(name))").eq("user_id", id).in("status", ["attended", "no_show"]).order("created_at", { ascending: false }).limit(30),
  ]);
  if (!m) notFound();
  const targets = m.is_guest
    ? ((await supabase.from("profiles").select("id, full_name, email").eq("is_guest", false).order("full_name").limit(500)).data ?? [])
    : [];
  const attended = history?.filter((h) => h.status === "attended").length ?? 0;
  const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
  const active = !!m.valid_until && m.valid_until >= today;

  return (
    <>
      <Link href="/admin/members" className="text-sm text-white/55 transition hover:text-white">← {t("a.mem.title")}</Link>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-2xl font-bold ring-4 ring-brand/30">
          {m.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div>
          <p className="eyebrow">{t("a.md.title")}</p>
          <h1 className="text-3xl font-bold">{m.full_name} {m.is_guest && <span className="ml-1 align-middle rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/60">{t("a.mem.guest")}</span>}</h1>
          <p className="text-sm text-white/50">{m.email} · {m.phone ?? "-"}</p>
        </div>
        <span className={`ml-auto rounded-full px-4 py-1.5 text-sm font-medium ${active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/50"}`}>
          {active ? t("mem.active") : t("mem.inactive")}
        </span>
      </div>
      {sp.error && <p className="mt-6 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{String(sp.error)}</p>}
      {sp.saved && <p className="mt-6 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{t("a.md.saved")}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">{t("a.md.activate")}</h2>
          <p className="mt-1 text-xs text-white/45">{t("a.md.activateHint")}</p>
          <p className="mt-4 text-sm text-white/70">
            {m.membership_type ?? t("a.md.noPlan")} · {m.valid_until ? dateShort(m.valid_until) : "—"}
          </p>
          <form action={activatePlan} className="mt-4 flex flex-wrap gap-3">
            <input type="hidden" name="id" value={m.id} />
            <select name="plan" className="input !w-auto flex-1">
              {PLANS.map((p) => <option key={p} value={p} className="bg-neutral-900">{t(`a.md.plan.${p}` as Key)}</option>)}
            </select>
            <button className="btn">{t("a.md.apply")}</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">{t("a.md.history")}</h2>
          <p className="mt-1 text-xs text-white/45">{attended} {t("a.md.attended")}</p>
          <ul className="mt-3 max-h-56 divide-y divide-white/10 overflow-y-auto text-sm">
            {!history?.length && <li className="py-3 text-white/45">{t("prof.noHistory")}</li>}
            {history?.map((h) => {
              const s = h.sessions as unknown as { starts_at: string; classes: { name: string } };
              return (
                <li key={h.id} className="flex items-center justify-between py-2.5">
                  <span>{s.classes.name} <span className="text-white/40">· {date(s.starts_at)}</span></span>
                  <span className={h.status === "attended" ? "text-emerald-300" : "text-red-300"}>{h.status === "attended" ? t("prof.present") : t("prof.noshow")}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {m.is_guest && (
        <section className="panel mt-6 border-amber-500/30 p-6">
          <h2 className="text-lg font-semibold">{t("a.md.merge")}</h2>
          <p className="mt-1 text-xs text-white/50">{t("a.md.mergeHelp")}</p>
          <form action={mergeGuest} className="mt-4 flex flex-wrap gap-3">
            <input type="hidden" name="guest" value={m.id} />
            <select name="into" required defaultValue="" className="input !w-auto min-w-64 flex-1">
              <option value="" disabled className="bg-neutral-900">{t("a.md.mergePick")}</option>
              {targets.map((x) => <option key={x.id} value={x.id} className="bg-neutral-900">{x.full_name}{x.email ? ` · ${x.email}` : ""}</option>)}
            </select>
            <button className="btn">{t("a.md.mergeBtn")}</button>
          </form>
        </section>
      )}

      <form action={updateMember} className="panel mt-6 p-6">
        <input type="hidden" name="id" value={m.id} />
        <h2 className="text-lg font-semibold">{t("a.md.manual")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-white/60">{t("auth.fullName")}<input name="full_name" defaultValue={m.full_name} required className="input mt-2" /></label>
          <label className="text-sm text-white/60">{t("auth.phone")}<input name="phone" defaultValue={m.phone ?? ""} className="input mt-2" /></label>
          <label className="text-sm text-white/60">{t("prof.currentBelt")}
            <select name="belt" defaultValue={m.belt} className="input mt-2">{BELTS.map((b) => <option key={b} value={b} className="bg-neutral-900">{t(`belt.${b}` as Key)}</option>)}</select>
          </label>
          <label className="text-sm text-white/60">{t("prof.stripes")}
            <select name="stripes" defaultValue={m.stripes} className="input mt-2">{[0, 1, 2, 3, 4].map((n) => <option key={n} value={n} className="bg-neutral-900">{n}</option>)}</select>
          </label>
          <label className="text-sm text-white/60">{t("a.mem.plan")}
            <select name="membership_type" defaultValue={m.membership_type ?? ""} className="input mt-2">
              <option value="" className="bg-neutral-900">{t("a.md.noPlan")}</option>
              {PLANS.map((p) => <option key={p} value={p} className="bg-neutral-900">{p}</option>)}
            </select>
          </label>
          <label className="text-sm text-white/60">{t("a.mem.until")}<input name="valid_until" type="date" defaultValue={m.valid_until ?? ""} className="input mt-2" /></label>
          <label className="text-sm text-white/60">{t("a.md.memberNo")}<input name="member_no" defaultValue={m.member_no ?? ""} placeholder="OBJ-0001" className="input mt-2" /></label>
          <label className="text-sm text-white/60">{t("gi.label")}
            <select name="gi_size" defaultValue={m.gi_size ?? ""} className="input mt-2"><GiOptions t={t} /></select>
          </label>
          <label className="flex items-center gap-3 text-sm text-white/80 sm:col-span-2">
            <input name="waiver" type="checkbox" defaultChecked={m.waiver_filled} className="h-4 w-4 accent-[#e8262a]" />
            {t("a.md.waiver")}
          </label>
        </div>
        <button className="btn mt-6">{t("a.md.save")}</button>
      </form>
    </>
  );
}
