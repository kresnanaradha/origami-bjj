import { getI18n } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase";
import ScanFlow from "./ScanFlow";

export default async function Scan({ searchParams }: PageProps<"/app/scan">) {
  const { t: token } = await searchParams;
  await requireUser();
  const { t } = await getI18n();

  return (
    <>
      <p className="eyebrow text-center">{t("scan.eyebrow")}</p>
      <h1 className="mb-6 mt-2 text-center text-2xl font-bold sm:mb-8 sm:text-3xl">{t("scan.title")}</h1>
      <ScanFlow
        initialToken={typeof token === "string" ? token : undefined}
        labels={{
          hint: t("scan.hint"), camera: t("scan.camera"), checking: t("scan.checking"), pick: t("scan.pick"), mine: t("scan.mine"),
          confirm: t("scan.confirm"), done: t("scan.done"), none: t("scan.none"), again: t("scan.again"), home: t("scan.home"),
        }}
      />
    </>
  );
}
