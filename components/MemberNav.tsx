"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/app", "home", "M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11Z"],
  ["/app/membership", "membership", "M3 6h18v12H3zM3 10h18"],
  ["/app/scan", "scan", "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"],
  ["/app/classes", "class", "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"],
  ["/app/profile", "profile", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0"],
] as const;

export default function MemberNav({ labels }: { labels: Record<(typeof tabs)[number][1], string> }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(92vw,26rem)] justify-between rounded-2xl border border-white/10 bg-neutral-950/80 p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(232,38,42,0.3)] backdrop-blur-xl">
      {tabs.map(([href, key, d]) => {
        const on = href === "/app" ? path === "/app" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition ${on ? "bg-brand/20 text-white shadow-[inset_0_0_0_1px_rgba(232,38,42,0.4)]" : "text-white/55 hover:text-white"}`}
          >
            <svg viewBox="0 0 24 24" className={`h-5 w-5 fill-none stroke-current ${on ? "text-brand" : ""}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={d} />
            </svg>
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
