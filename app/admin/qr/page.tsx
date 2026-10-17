import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import PrintButton from "@/components/PrintButton";
import Qr from "@/components/Qr";
import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";

// Token QR berganti otomatis tiap hari (WITA). Untuk dicetak, admin bisa mencetak QR hari ini atau 7 hari ke depan.
export default async function DailyQr({ searchParams }: PageProps<"/admin/qr">) {
  const sp = await searchParams;
  const week = sp.days === "7";
  const { supabase } = await requireUser(true);
  const { t, dateLong } = await getI18n();
  const h = await headers();
  // NEXT_PUBLIC_SITE_URL: isi dengan domain asli supaya QR yang dicetak tidak mengarah ke localhost
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const days = Array.from({ length: week ? 7 : 1 }, (_, i) => new Date(Date.now() + 8 * 3600e3 + i * 864e5).toISOString().slice(0, 10));
  const posters = await Promise.all(
    days.map(async (d) => {
      const { data } = await supabase.rpc("get_daily_qr", { p_day: d });
      return { day: d, token: data as string | null };
    }),
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="eyebrow">{t("a.eyebrow")}</p>
          <h1 className="mt-1 text-3xl font-bold">{week ? t("a.qr.title") : t("a.qr.today")}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/55">{week ? t("a.qr.sheetHint") : t("a.qr.hint")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrintButton label={t("a.qr.print")} />
          {week
            ? <Link href="/admin/qr" className="btn-ghost">{t("a.qr.today")}</Link>
            : <Link href="/admin/qr?days=7" className="btn-ghost">{t("a.qr.printWeek")}</Link>}
        </div>
      </div>

      <div className={`mt-10 grid gap-8 print:mt-0 ${week ? "md:grid-cols-2" : "justify-items-center"} print:block`}>
        {posters.map(({ day, token }) => (
          <section key={day} className="poster w-full max-w-md rounded-3xl bg-white p-8 text-center text-black shadow-[0_30px_80px_-25px_rgba(232,38,42,0.6)] print:mx-auto print:mb-0 print:max-w-none print:rounded-none print:p-16 print:shadow-none">
            <Image src="/logo-color.png" alt="Origami Brazilian Jiu-Jitsu" width={315} height={177} className="mx-auto h-24 w-auto print:h-32" />
            <p className="mt-6 text-2xl font-extrabold uppercase tracking-wide">Scan to check in</p>
            <p className="text-sm font-medium text-neutral-500">Scan untuk absen</p>
            <div className="mt-6 print:mt-10">
              {token ? <Qr value={`${origin}/app/scan?t=${token}`} size={week ? 200 : 260} /> : <p className="text-red-600">{t("a.qr.unavailable")}</p>}
            </div>
            <p className="mt-6 text-xs uppercase tracking-widest text-neutral-400">{t("a.qr.day")}</p>
            <p className="text-lg font-bold">{dateLong(`${day}T12:00:00+08:00`)}</p>
            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-[#e8262a]" />
          </section>
        ))}
      </div>
    </>
  );
}
