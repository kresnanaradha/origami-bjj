import Image from "next/image";
import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import { InstagramIcon, MailIcon } from "@/components/ContactIcons";
import Logo from "@/components/Logo";
import WhatsAppButton from "@/components/WhatsAppButton";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getI18n, type Key } from "@/lib/i18n";
import { site, waLink } from "@/lib/site";
import { createClient } from "@/lib/supabase";

const nav: [Key, string][] = [
  ["nav.about", "#about"],
  ["nav.facility", "#facility"],
  ["nav.instructor", "#instructor"],
  ["nav.classes", "#classes"],
  ["nav.contact", "#contact"],
];

const stats = ["1", "2", "3", "4"] as const;
const pillars = ["1", "2", "3"] as const;

// Ulasan asli dari Google Maps (dikutip singkat, dibiarkan dalam bahasa aslinya)
const reviews = [
  { name: "Karim Arditi", guide: true, text: "What an awesome place to train! Coach Ronny and his team have opened a really nice academy here, clean, welcoming, with a great atmosphere and a slick gym design." },
  { name: "Mike Imbriglio", guide: false, text: "I’m from San Diego and needed a place to train while in Bali. Wanted to find a good gym that had a positive vibe. Origami did not disappoint. Awesome BJJ gym in Uluwatu." },
  { name: "Moncef Jabb", guide: true, text: "Coming from Morocco I had a really nice time in the gym. The class was good and the tatami is clean. Would recommend." },
] as const;

const studio = [
  ["studio-1-hd", "Main training area", "md:row-span-2"],
  ["studio-2-hd", "Lounge", ""],
  ["studio-3-hd", "Entrance", ""],
  ["studio-4-hd", "International-standard mats", "md:col-span-2"],
];

// Fallback bila tabel classes kosong / database belum tersambung
const fallbackClasses = [
  { id: "1", name: "Intro to BJJ", audience: "Adults", days: "Mon, Tue, Thu", duration: "1 hr", image_url: "/images/class-intro.jpg" },
  { id: "2", name: "Fundamentals", audience: "Adults", days: "Mon, Tue, Wed, Thu, Fri", duration: "1 hr", image_url: "/images/class-fundamentals.jpg" },
  { id: "3", name: "All Levels", audience: "Adults", days: "Mon, Tue, Wed, Thu, Fri, Sat", duration: "1 hr", image_url: "/images/class-all-levels.jpg" },
  { id: "4", name: "Kids Class", audience: "4+ yo and above", days: "Wed, Fri, Sat", duration: "1 hr", image_url: "/images/class-kids.jpg" },
  { id: "5", name: "Private Class", audience: "Kids, Adults, and Family", days: "By Appointment", duration: "1 hr", image_url: "/images/class-private.jpg" },
];

// Label bagian: "01 — About us"
const Label = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <p className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/55">
    <span className="font-semibold text-brand">{n}</span>
    <span className="h-px w-8 bg-white/25" />
    {children}
  </p>
);

export default async function Home() {
  const { t, x } = await getI18n();
  const supabase = await createClient();
  const { data } = await supabase.from("classes").select("*").order("sort");
  const classes = data?.length ? data : fallbackClasses;

  return (
    <main id="top">
      <header className="sticky top-0 z-30 border-b border-brand/40 bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <Logo />
          <nav className="hidden gap-10 text-xs font-medium uppercase tracking-[0.18em] text-white/65 md:flex">
            {nav.map(([k, href]) => (
              <a key={href} href={href} className="transition hover:text-white">{t(k)}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LangSwitch />
            <Link href="/login" className="btn-flat !px-4 !py-2 text-sm">{t("nav.login")}</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate flex min-h-[88vh] flex-col justify-end overflow-hidden">
        <Image src="/images/hero-hd.jpg" alt="" fill priority quality={90} sizes="100vw" className="-z-10 object-cover grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-32">
          <Label n="—">{t("hero.eyebrow")}</Label>
          <h1 className="rise mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl">
            {t("hero.t1")}
            <br />
            <span className="text-brand">{t("hero.t2")}</span>
          </h1>
          <p className="rise mt-6 max-w-xl text-lg font-light leading-relaxed text-white/75" style={{ animationDelay: "0.1s" }}>{t("hero.sub")}</p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.2s" }}>
            <Link href="/register" className="btn-flat">{t("hero.book")}</Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-ink border border-white/25 hover:border-white/50"><WhatsAppIcon className="h-5 w-5 text-[#25D366]" />{t("hero.wa")}</a>
          </div>
        </div>
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 border-t border-brand/70 px-6 md:grid-cols-4">
          {stats.map((n, i) => (
            <div key={n} className={`py-6 ${i > 0 ? "md:border-l md:border-white/15 md:pl-8" : ""} ${i % 2 === 1 ? "pl-6" : ""}`}>
              <dt className="text-lg font-semibold md:text-xl">{t(`stat.${n}k` as Key)}</dt>
              <dd className="mt-0.5 text-xs uppercase tracking-wider text-white/45">{t(`stat.${n}v` as Key)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-brand to-transparent" />

      {/* ABOUT */}
      <section id="about" className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-28 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div className="glow-red relative aspect-[4/5] overflow-hidden rounded-md">
          <Image src="/images/team-hd.jpg" alt="Origami BJJ students lined up for class" fill quality={90} sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
        </div>
        <div>
          <Label n="01">{t("about.eyebrow")}</Label>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">{t("about.title")}</h2>
          <div className="mt-6 space-y-4 font-light leading-relaxed text-white/70">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
          </div>
          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {pillars.map((n) => (
              <li key={n} className="border-t-2 border-brand pt-4">
                <h3 className="font-semibold">{t(`pillar.${n}t` as Key)}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/55">{t(`pillar.${n}d` as Key)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FACILITY */}
      <section id="facility" className="border-y border-brand/30 bg-neutral-950 px-6 py-20">
        <div className="mx-auto grid max-w-7xl auto-rows-[240px] gap-3 md:grid-cols-3 md:auto-rows-[280px]">
          {studio.map(([img, alt, span]) => (
            <div key={img} className={`glow-red-sm relative overflow-hidden rounded-md ${span}`}>
              <Image src={`/images/${img}.jpg`} alt={alt} fill quality={90} sizes="(min-width:1280px) 42vw, (min-width:768px) 60vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="instructor" className="relative overflow-hidden bg-gradient-to-br from-[#a3161b] via-[#5c0e11] to-[#120305] px-6 py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_26rem_at_0%_0%,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[380px_1fr] md:gap-20">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/20">
            <Image src="/images/ronny-hd.jpg" alt="Coach Ronny" fill quality={90} sizes="380px" className="object-cover" />
          </div>
          <div>
            <p className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="font-semibold text-white">02</span><span className="h-px w-8 bg-white/40" />{t("inst.eyebrow")}
            </p>
            <h2 className="mt-5 text-5xl font-semibold tracking-tight md:text-6xl">Coach Ronny</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {(["inst.c1", "inst.c2", "inst.c3"] as Key[]).map((c) => (
                <li key={c} className="border-l-2 border-white pl-4 text-sm font-medium leading-snug">{t(c)}</li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl font-light leading-relaxed text-white/85">{t("inst.bio")}</p>
          </div>
        </div>
      </section>

      {/* CLASSES */}
      <section id="classes" className="relative border-b border-brand/30 bg-neutral-950 px-6 py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(44rem_22rem_at_100%_0%,rgba(232,38,42,0.16),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl">
          <Label n="03">{t("classes.eyebrow")}</Label>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{t("classes.title")}</h2>
          <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <article key={c.id} className="group">
                <div className="glow-red-sm relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-900">
                  {c.image_url && <Image src={c.image_url} alt={c.name} fill quality={85} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />}
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{c.name}</h3>
                    <p className="mt-1 text-sm text-white/55">{x(c.audience)}</p>
                  </div>
                  {c.days === "By Appointment" ? (
                    <a href={waLink(t("priv.msgGuest"))} target="_blank" rel="noopener noreferrer" className="shrink-0 border-b border-brand pb-0.5 text-sm font-medium text-white transition hover:text-brand">{t("priv.btn")} →</a>
                  ) : (
                    <Link href="/register" className="shrink-0 border-b border-brand pb-0.5 text-sm font-medium text-white transition hover:text-brand">{t("classes.book")} →</Link>
                  )}
                </div>
                <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/45">{x(c.days)} · {x(c.duration)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: pita merah */}
      <section className="relative z-10 bg-brand px-6 py-12 shadow-[0_0_60px_-10px_rgba(232,38,42,0.6)] md:py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("cta.title")}</h2>
            <p className="mt-2 max-w-xl text-sm font-light text-white/85">{t("cta.sub")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-light">{t("hero.book")}</Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-ink"><WhatsAppIcon className="h-5 w-5 text-[#25D366]" />{t("cta.wa")}</a>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="mx-auto max-w-7xl px-6 py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Label n="04">{t("rev.eyebrow")}</Label>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{t("rev.title")}</h2>
          </div>
          <p className="flex items-baseline gap-3 text-sm text-white/60">
            <span className="text-4xl font-semibold text-white">{site.rating}</span>
            <span><span className="block tracking-widest text-brand">★★★★★</span>{t("rev.count", { n: site.reviewCount })}</span>
          </p>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.name} className="flex flex-col border-t-2 border-brand pt-6">
              <span className="text-5xl font-semibold leading-none text-brand">&ldquo;</span>
              <p className="mt-2 flex-1 font-light leading-relaxed text-white/80">{r.text}</p>
              <footer className="mt-6 text-sm">
                <span className="font-semibold">{r.name}</span>
                {r.guide && <span className="ml-2 text-xs text-white/40">{t("rev.guide")}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
        <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-12 inline-block border-b border-brand pb-0.5 text-sm font-medium transition hover:text-brand">{t("rev.all")} →</a>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="relative overflow-hidden bg-gradient-to-r from-brand via-[#b01a1f] to-[#6a0f12] px-6 pb-10 pt-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-80 w-80 rounded-full border border-white/10" />
        <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-sm font-light leading-relaxed text-white/85">{site.address}</p>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block border-b border-white/60 pb-0.5 text-sm font-medium transition hover:border-white">Google Maps →</a>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-white/65">{t("foot.contact")}</p>
            <ul className="mt-4 space-y-3 text-white/95">
              <li><a className="flex items-center gap-3 transition hover:text-white hover:underline" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon className="h-5 w-5 shrink-0" />{site.phone}</a></li>
              <li><a className="flex items-center gap-3 transition hover:text-white hover:underline" href={`mailto:${site.email}`} aria-label="Email"><MailIcon />{site.email}</a></li>
              <li><a className="flex items-center gap-3 transition hover:text-white hover:underline" href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon />@origamibjj</a></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-white/65">{t("foot.pages")}</p>
            <ul className="mt-4 space-y-2 text-white/95">
              {nav.slice(0, 4).map(([k, h]) => <li key={h}><a className="transition hover:text-white hover:underline" href={h}>{t(k)}</a></li>)}
              <li><Link className="transition hover:text-white hover:underline" href="/login">{t("nav.login")}</Link></li>
            </ul>
          </div>
        </div>
        <p className="relative mx-auto mt-14 max-w-7xl border-t border-white/25 pt-6 text-xs text-white/75">© {new Date().getFullYear()} Origami Brazilian Jiu-Jitsu. {t("foot.rights")}</p>
      </footer>
      <WhatsAppButton />
    </main>
  );
}
