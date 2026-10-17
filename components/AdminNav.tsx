"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "dashboard"],
  ["/admin/schedule", "schedule"],
  ["/admin/sessions", "attendance"],
  ["/admin/members", "members"],
  ["/admin/qr", "qr"],
] as const;

export default function AdminNav({ labels, className = "" }: { labels: Record<(typeof items)[number][1], string>; className?: string }) {
  const path = usePathname();
  return (
    <nav className={`flex items-center gap-0.5 text-[13px] font-medium sm:gap-1 sm:text-sm ${className}`}>
      {items.map(([href, key]) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-lg px-2 py-1.5 sm:px-3 transition ${on ? "bg-black/40 text-white" : "text-white/80 hover:bg-black/20 hover:text-white"}`}>
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
