import { getI18n, type Key } from "@/lib/i18n";

const body: Record<string, string> = {
  White: "linear-gradient(180deg,#ffffff,#e9ebef)",
  Blue: "linear-gradient(180deg,#2f6bd8,#1d4aa6)",
  Purple: "linear-gradient(180deg,#7b3fc4,#5a2a9a)",
  Brown: "linear-gradient(180deg,#8a5a34,#613c20)",
  Black: "linear-gradient(180deg,#1b1b1b,#050505)",
};

// Sabuk: ujung hitam bergaris (stripes) + badan sabuk sesuai warna, seperti di Figma.
export default async function BeltProgress({ belt, stripes }: { belt: string; stripes: number }) {
  const { t } = await getI18n();
  const n = Math.min(Math.max(stripes, 0), 4);
  const tip = belt === "Black" ? "linear-gradient(180deg,#e02a2e,#9d1519)" : "linear-gradient(180deg,#222,#000)";
  return (
    <div className="panel p-5 sm:p-7">
      <div className="flex h-24 gap-2 overflow-hidden rounded-xl sm:h-28" role="img" aria-label={`${belt} belt, ${n} stripes`}>
        <div className="flex w-[34%] items-center justify-center gap-2 rounded-lg ring-1 ring-white/10" style={{ background: tip }}>
          {Array.from({ length: n }, (_, i) => <span key={i} className="h-[55%] w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />)}
        </div>
        <div className="relative flex-1 rounded-lg shadow-inner ring-1 ring-black/20" style={{ background: body[belt] ?? body.White }}>
          <div className="absolute inset-x-0 top-[22%] h-px bg-black/10" />
          <div className="absolute inset-x-0 bottom-[22%] h-px bg-black/10" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-light text-white/50">{t("prof.currentBelt")}</p>
          <p className="mt-1 text-2xl font-bold sm:text-3xl">{t(`belt.${belt}` as Key)} {t("belt.word")}</p>
        </div>
        <div>
          <p className="text-sm font-light text-white/50">{t("prof.stripes")}</p>
          <p className="mt-1 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
            {n}
            <span className="flex gap-1">
              {Array.from({ length: n }, (_, i) => <span key={i} className="h-5 w-1 rounded-full bg-white/80" />)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
