import Link from "next/link";
import { getI18n, type Key } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

const beltDot: Record<string, string> = { White: "#f5f5f5", Blue: "#2f6bd8", Purple: "#7b3fc4", Brown: "#8a5a34", Black: "#111" };

export default async function Members({ searchParams }: PageProps<"/admin/members">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const f = sp.f === "active" || sp.f === "expired" ? sp.f : "all";
  const { supabase } = await requireUser(true);
  const { t, dateShort } = await getI18n();
  const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);

  const { data: counts } = await supabase.rpc("admin_attendance_counts");
  const visits = new Map<string, { total: number; month: number }>(
    ((counts ?? []) as { member_id: string; total: number; this_month: number }[]).map((r) => [r.member_id, { total: r.total, month: r.this_month }]),
  );
  const { data } = await supabase.from("profiles").select("id, full_name, email, phone, belt, stripes, membership_type, valid_until, member_no, role, is_guest").order("full_name").limit(500);
  const rows = (data ?? []).filter((m) => {
    const active = !!m.valid_until && m.valid_until >= today;
    if (f === "active" && !active) return false;
    if (f === "expired" && active) return false;
    return !q || [m.full_name, m.email, m.phone, m.member_no].some((v) => v?.toLowerCase().includes(q));
  });

  const chip = (key: string, label: string) => (
    <Link key={key} href={`/admin/members?f=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
      className={`rounded-lg px-4 py-1.5 text-sm transition ${f === key ? "bg-brand text-white shadow" : "text-white/60 hover:text-white"}`}>{label}</Link>
  );

  return (
    <>
      <p className="eyebrow">{t("a.eyebrow")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("a.mem.title")} <span className="text-lg font-normal text-white/40">· {rows.length}</span></h1>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {chip("all", t("a.mem.all"))}{chip("active", t("a.mem.activeF"))}{chip("expired", t("a.mem.expiredF"))}
        </div>
        <form className="flex flex-1 gap-2">
          <input type="hidden" name="f" value={f} />
          <input name="q" defaultValue={q} placeholder={t("a.mem.search")} className="input max-w-md" />
          <button className="btn-ghost">{t("c.search")}</button>
        </form>
      </div>

      <ul className="panel mt-6 divide-y divide-white/10 overflow-hidden">
        {!rows.length && <li className="p-6 text-white/55">{t("a.mem.empty")}</li>}
        {rows.map((m) => {
          const active = !!m.valid_until && m.valid_until >= today;
          return (
            <li key={m.id}>
              <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3 px-4 py-4 transition hover:bg-white/[0.04] sm:gap-4 sm:px-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold">
                  {m.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.full_name} {m.role === "admin" && <span className="ml-1 rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand">admin</span>} {m.is_guest && <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60">{t("a.mem.guest")}</span>}</p>
                  <p className="truncate text-xs text-white/45">{m.email ?? "—"}</p>
                  <p className="truncate text-xs text-white/35">{m.phone ?? "-"}</p>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/70 sm:hidden">
                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30" style={{ background: beltDot[m.belt] }} />
                    {t(`belt.${m.belt}` as Key)}{m.stripes > 0 && ` · ${m.stripes}`}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/50 sm:hidden">{visits.get(m.id)?.total ?? 0}× {t("a.mem.visits").toLowerCase()}</span>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-white/70 sm:inline-flex">
                  <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30" style={{ background: beltDot[m.belt] }} />
                  {t(`belt.${m.belt}` as Key)}{m.stripes > 0 && ` · ${m.stripes}`}
                </span>
                <span className="hidden w-14 shrink-0 text-center sm:block" title={t("a.mem.thisMonth", { n: visits.get(m.id)?.month ?? 0 })}>
                  <span className="block text-xl font-semibold leading-none">{visits.get(m.id)?.total ?? 0}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wider text-white/40">{t("a.mem.visits")}</span>
                </span>
                <span className="w-28 shrink-0 text-right text-xs sm:w-36">
                  <span className={`inline-block rounded-full px-2.5 py-1 font-medium ${active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/50"}`}>
                    {m.membership_type ?? t("a.md.noPlan")}
                  </span>
                  <span className="mt-1 block text-white/40">{m.valid_until ? dateShort(m.valid_until) : "—"}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
