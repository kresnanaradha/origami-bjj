import Image from "next/image";
import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import { getI18n } from "@/lib/i18n";

// Halaman login/daftar: foto studio blur di belakang, logo Origami di atas form.
export default async function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-14">
      <Image src="/images/studio-1-hd.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-30 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-brand-dark/50" />
      <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
      <LangSwitch className="absolute right-5 top-5 z-10" />
      <div className="rise relative w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 block w-fit">
          <Image src="/logo-white.png" alt="Origami Brazilian Jiu-Jitsu" width={275} height={113} priority className="h-24 w-auto drop-shadow-[0_8px_24px_rgba(232,38,42,0.45)]" />
        </Link>
        <div className="panel bg-black/50 p-7 shadow-[0_30px_80px_-20px_rgba(232,38,42,0.35)] sm:p-9">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <Link href="/" className="mt-6 block text-center text-xs text-white/50 transition hover:text-white">{t("auth.back")}</Link>
      </div>
    </main>
  );
}
