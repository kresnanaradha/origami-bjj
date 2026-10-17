"use client";

import { usePathname } from "next/navigation";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/site";

export default function WhatsAppButton() {
  const path = usePathname();
  if (path === "/app/scan") return null; // menutupi kamera dan petunjuk scan
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 md:bottom-6"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
