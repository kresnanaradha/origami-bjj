import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { login } from "@/app/actions";
import { getI18n } from "@/lib/i18n";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error, info } = await searchParams;
  const { t } = await getI18n();
  return (
    <AuthShell title={t("auth.welcome")} subtitle={t("auth.loginSub")}>
      <form action={login} className="space-y-4">
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        {info && <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{info}</p>}
        <input name="email" type="email" placeholder={t("auth.email")} autoComplete="email" required className="input" />
        <input name="password" type="password" placeholder={t("auth.password")} autoComplete="current-password" required className="input" />
        <button className="btn w-full !py-3">{t("auth.login")}</button>
        <p className="text-center text-sm text-white/55">
          {t("auth.noAccount")} <Link href="/register" className="font-semibold text-brand hover:underline">{t("auth.signup")}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
