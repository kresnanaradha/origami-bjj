import { setLang } from "@/app/actions";
import { getLang } from "@/lib/i18n";

export default async function LangSwitch({ className = "" }: { className?: string }) {
  const lang = await getLang();
  return (
    <form action={setLang} className={`inline-flex rounded-full border border-white/15 bg-black/40 p-0.5 text-[11px] font-semibold backdrop-blur ${className}`}>
      {(["id", "en"] as const).map((l) => (
        <button
          key={l}
          name="lang"
          value={l}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 uppercase tracking-wider transition ${lang === l ? "bg-brand text-white shadow" : "text-white/60 hover:text-white"}`}
        >
          {l}
        </button>
      ))}
    </form>
  );
}
