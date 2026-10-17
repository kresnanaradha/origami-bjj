import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import GiOptions from "@/components/GiOptions";
import { register } from "@/app/actions";
import { BELTS } from "@/lib/format";
import { getI18n, type Key } from "@/lib/i18n";

const beltColor: Record<string, string> = { White: "#f5f5f5", Blue: "#2f6bd8", Purple: "#7b3fc4", Brown: "#8a5a34", Black: "#111" };

export default async function Register({ searchParams }: PageProps<"/register">) {
  const { error } = await searchParams;
  const { t } = await getI18n();
  return (
    <AuthShell title={t("auth.registerTitle")} subtitle={t("auth.registerSub")}>
      <form action={register} className="space-y-4">
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <input name="full_name" placeholder={t("auth.fullName")} autoComplete="name" required className="input" />
        <input name="phone" type="tel" placeholder={t("auth.phone")} autoComplete="tel" required className="input" />
        <input name="email" type="email" placeholder={t("auth.email")} autoComplete="email" required className="input" />
        <input name="password" type="password" placeholder={t("auth.passwordHint")} autoComplete="new-password" minLength={6} required className="input" />

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-white/80">{t("auth.belt")}</legend>
          <div className="grid grid-cols-5 gap-2">
            {BELTS.map((b, i) => (
              <label key={b} className="cursor-pointer">
                <input type="radio" name="belt" value={b} defaultChecked={i === 0} className="peer sr-only" />
                <span className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-1 py-2.5 text-[11px] text-white/60 transition peer-checked:border-brand peer-checked:bg-brand/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                  <span className="h-2.5 w-full max-w-9 rounded-full ring-1 ring-white/20" style={{ background: beltColor[b] }} />
                  {t(`belt.${b}` as Key)}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">{t("auth.beltHelp")}</p>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-white/80">
            <span className="mb-2 block font-medium">{t("auth.stripes")}</span>
            <select name="stripes" defaultValue="0" className="input">
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n} className="bg-neutral-900">{n}</option>)}
            </select>
          </label>
          <label className="block text-sm text-white/80">
            <span className="mb-2 block font-medium">{t("auth.gi")}</span>
            <select name="gi_size" defaultValue="" className="input"><GiOptions t={t} /></select>
          </label>
        </div>
        <p className="-mt-2 text-xs text-white/40">{t("auth.giHelp")}</p>

        <button className="btn w-full !py-3">{t("auth.createAccount")}</button>
        <p className="text-center text-sm text-white/55">
          {t("auth.haveAccount")} <Link href="/login" className="font-semibold text-brand hover:underline">{t("auth.login")}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
