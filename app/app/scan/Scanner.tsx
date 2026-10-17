"use client";

import { useEffect, useRef, useState } from "react";

// QR gym berisi URL /app/scan?t=<token>; token diambil lalu diserahkan ke ScanFlow (tanpa pindah halaman).
// Memakai qr-scanner: detektor bawaan browser bila ada (Chrome/Android), kalau tidak (iPhone/Safari) pembaca
// berbasis worker yang lebih tahan terhadap QR buram atau bergaris dari layar.
export default function Scanner({ cameraError, onToken }: { cameraError: string; onToken: (token: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let scanner: { start(): Promise<void>; stop(): void; destroy(): void } | null = null;
    let cancelled = false;
    let done = false;
    (async () => {
      const { default: QrScanner } = await import("qr-scanner");
      if (cancelled || !videoRef.current) return;
      const s = new QrScanner(
        videoRef.current,
        (result) => {
          if (done) return;
          let token: string | null = null;
          try { token = new URL(result.data).searchParams.get("t"); } catch { token = result.data.trim(); }
          if (!token) return;
          done = true;
          navigator.vibrate?.(60);
          s.stop();
          onToken(token);
        },
        { preferredCamera: "environment", maxScansPerSecond: 25, highlightScanRegion: false, highlightCodeOutline: false, returnDetailedScanResult: true },
      );
      scanner = s;
      try {
        await s.start();
      } catch {
        setErr(cameraError);
      }
    })();
    return () => { cancelled = true; scanner?.destroy(); };
  }, [onToken, cameraError]);

  return (
    <>
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-neutral-900">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
      </div>
      {err && <p className="mt-4 text-center text-sm text-red-400">{err}</p>}
    </>
  );
}
