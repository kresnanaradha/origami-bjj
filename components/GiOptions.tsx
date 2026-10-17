import { GI_SIZES } from "@/lib/format";
import type { I18n } from "@/lib/i18n";

export const giLabel = (t: I18n["t"], v: string | null | undefined) =>
  !v ? t("gi.none") : v === "own" ? t("gi.own") : `${v.startsWith("M") ? t("gi.kids") : t("gi.adult")} ${v}`;

export default function GiOptions({ t, empty }: { t: I18n["t"]; empty?: string }) {
  return (
    <>
      <option value="" className="bg-neutral-900">{empty ?? t("gi.none")}</option>
      {GI_SIZES.map((g) => <option key={g} value={g} className="bg-neutral-900">{giLabel(t, g)}</option>)}
    </>
  );
}
