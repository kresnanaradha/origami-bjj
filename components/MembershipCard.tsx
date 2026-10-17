import Image from "next/image";
import { getI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/supabase";

// Desain kartu dari Figma; teks (nama, paket, no. member, masa berlaku) diisi dari data member.
const art = (type: string | null) =>
  type?.startsWith("Annual") ? "annual" : type?.startsWith("3 Month") ? "3month" : "monthly";

export default async function MembershipCard({ p }: { p: Profile }) {
  const { t, dateShort } = await getI18n();
  const name = (p.full_name || "Member").toUpperCase();
  const nameSize = Math.min(4.4, (4.4 * 21) / name.length); // nama panjang mengecil, tidak menimpa burung
  const field = "absolute truncate bg-[#d9d9d9] px-[1.2cqw] py-[0.3cqw] font-semibold text-black";
  const label = "absolute font-semibold";

  return (
    <div className="relative w-full max-w-lg" style={{ containerType: "inline-size" }}>
      {/* glow merah di belakang kartu supaya tepinya terlihat jelas di latar gelap */}
      <div className="pointer-events-none absolute -inset-[4%] rounded-[6cqw] bg-brand/40 blur-3xl" aria-hidden="true" />
      <div className="group relative aspect-[1100/694] w-full overflow-hidden rounded-[4.5cqw] ring-1 ring-white/25 shadow-[0_0_0_1px_rgba(232,38,42,0.55),0_28px_70px_-18px_rgba(232,38,42,0.75),0_10px_30px_-10px_rgba(0,0,0,0.9)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(255,90,90,0.8),0_36px_90px_-16px_rgba(232,38,42,0.95),0_10px_30px_-10px_rgba(0,0,0,0.9)]">
        <Image src={`/cards/${art(p.membership_type)}.webp?v=2`} alt="" fill priority unoptimized sizes="512px" className="object-cover" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <p className="absolute left-[3.5%] top-[43%] w-[58%] whitespace-nowrap font-semibold leading-none" style={{ fontSize: `${nameSize}cqw` }}>{name}</p>
        <p className="absolute left-[3.5%] top-[54.5%] font-medium leading-none" style={{ fontSize: "3cqw" }}>
          {p.membership_type ? `${p.membership_type} ${t("mem.suffix")}` : t("mem.none")}
        </p>
        <p className={field} style={{ left: "3.5%", top: "72.5%", width: "16.6%", fontSize: "2.3cqw" }}>{p.member_no ?? "—"}</p>
        <p className={label} style={{ left: "3.5%", top: "80.5%", fontSize: "2.4cqw" }}>{t("mem.no")}</p>
        <p className={field} style={{ left: "30%", top: "72.5%", width: "19%", fontSize: "2.3cqw" }}>{p.valid_until ? dateShort(p.valid_until) : "—"}</p>
        <p className={label} style={{ left: "31.5%", top: "80.5%", fontSize: "2.4cqw" }}>{t("mem.valid")}</p>
      </div>
    </div>
  );
}
