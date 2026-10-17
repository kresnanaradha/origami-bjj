"use client";

import { useEffect, useState } from "react";

// QR gym berisi URL /app/scan?t=<token>; token diambil lalu diserahkan ke ScanFlow (tanpa pindah halaman).
export default function Scanner({ cameraError, onToken }: { cameraError: string; onToken: (token: string) => void }) {
  const [err, setErr] = useState("");

  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    (async () => {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      if (cancelled) return;
      // Hanya QR; pakai detektor bawaan browser kalau ada (lebih cepat & tahan buram/silau)
      const qr = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      });
      let done = false;
      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 15, videoConstraints: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } },
          (text) => {
            if (done) return;
            let token: string | null = null;
            try { token = new URL(text).searchParams.get("t"); } catch { token = text.trim(); }
            if (!token) return;
            done = true;
            navigator.vibrate?.(60);
            onToken(token);
          },
          () => {},
        );
        stop = () => { if (qr.isScanning) qr.stop().catch(() => {}); };
        if (cancelled) stop();
      } catch {
        setErr(cameraError);
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [onToken, cameraError]);

  return (
    <>
      <div id="qr-reader" className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-neutral-900" />
      {err && <p className="mt-4 text-center text-sm text-red-400">{err}</p>}
    </>
  );
}
