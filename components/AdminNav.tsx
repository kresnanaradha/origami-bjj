"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const items = [
  ["/admin", "dashboard"],
  ["/admin/schedule", "schedule"],
  ["/admin/sessions", "attendance"],
  ["/admin/members", "members"],
  ["/admin/qr", "qr"],
] as const;

export default function AdminNav({ labels, className = "" }: { labels: Record<(typeof items)[number][1], string>; className?: string }) {
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);

  // di HP menu bisa digeser; geser otomatis supaya tab yang aktif terlihat penuh
  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: "auto" });
  }, [path]);

  return (
    <nav ref={ref} className={`flex items-center gap-0.5 text-[13px] font-medium [scrollbar-width:none] sm:gap-1 sm:text-sm [&::-webkit-scrollbar]:hidden ${className}`}>
      {items.map(([href, key]) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 transition ${on ? "bg-black/40 text-white" : "text-white/80 hover:bg-black/20 hover:text-white"}`}>
            {labels[key]}
          </Link>
        );
      })}
      <span className="w-4 shrink-0 md:hidden" aria-hidden="true" />
    </nav>
  );
}
