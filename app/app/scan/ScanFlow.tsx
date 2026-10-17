"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { confirmScan, resolveScan, type OpenSession, type ScanResult } from "@/app/actions";
import Scanner from "./Scanner";

type Labels = {
  hint: string; camera: string; checking: string; pick: string; mine: string; confirm: string;
  done: string; none: string; again: string; home: string;
};

type State = { status: "scanning" } | { status: "busy" } | ScanResult;

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { timeZone: "Asia/Makassar", hour: "numeric", minute: "2-digit" });

// Satu alur tanpa pindah halaman: kamera langsung menyala -> scan -> langsung tercatat (atau pilih kelas kalau ambigu).
export default function ScanFlow({ initialToken, labels }: { initialToken?: string; labels: Labels }) {
  const [state, setState] = useState<State>(initialToken ? { status: "busy" } : { status: "scanning" });
  const [token, setToken] = useState(initialToken ?? "");
  const [choice, setChoice] = useState("");

  const handle = useCallback((r: ScanResult) => {
    setState(r);
    if (r.status === "pick") setChoice(r.preselect);
    if (r.status === "done") navigator.vibrate?.([40, 40, 40]);
  }, []);

  const onToken = useCallback(async (t: string) => {
    setToken(t);
    setState({ status: "busy" });
    handle(await resolveScan(t));
  }, [handle]);

  // QR dibuka lewat kamera bawaan HP (…/app/scan?t=…): proses otomatis saat halaman terbuka
  useEffect(() => {
    if (initialToken) onToken(initialToken);
  }, [initialToken, onToken]);

  const again = () => {
    window.history.replaceState(null, "", "/app/scan");
    setToken("");
    setState({ status: "scanning" });
  };

  if (state.status === "scanning") {
    return (
      <div className="mx-auto max-w-sm">
        <div className="relative rounded-3xl p-3 shadow-[0_0_80px_-20px_rgba(232,38,42,0.6)]">
          {["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"].map((c) => (
            <span key={c} className={`pointer-events-none absolute z-10 h-10 w-10 border-brand ${c}`} />
          ))}
          <Scanner cameraError={labels.camera} onToken={onToken} />
        </div>
        <p className="mt-6 text-center text-sm text-white/50">{labels.hint}</p>
      </div>
    );
  }

  const card = "panel mx-auto max-w-sm p-7 text-center shadow-[0_30px_70px_-25px_rgba(232,38,42,0.5)]";

  if (state.status === "busy") {
    return (
      <div className={card} role="status">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-brand" />
        <p className="mt-4 text-sm text-white/70">{labels.checking}</p>
      </div>
    );
  }

  if (state.status === "done") {
    return (
      <div className={card} role="status">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20">
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-emerald-300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
        </span>
        <p className="mt-5 text-sm text-white/60">{labels.done}</p>
        <p className="mt-1 text-2xl font-bold">{state.name}</p>
        <Link href="/app" className="btn mt-7 w-full !py-3">{labels.home}</Link>
      </div>
    );
  }

  if (state.status === "pick") {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setState({ status: "busy" });
      handle(await confirmScan(token, choice));
    };
    return (
      <form onSubmit={submit} className="panel mx-auto max-w-sm space-y-4 p-6 shadow-[0_30px_70px_-25px_rgba(232,38,42,0.5)]">
        <p className="text-center text-sm font-medium text-white/80">{labels.pick}</p>
        <div className="space-y-3">
          {state.sessions.map((o: OpenSession) => (
            <label key={o.sid} className="block cursor-pointer">
              <input type="radio" name="session" value={o.sid} checked={choice === o.sid} onChange={() => setChoice(o.sid)} className="peer sr-only" />
              <span className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition peer-checked:border-brand peer-checked:bg-brand/15 peer-checked:shadow-[0_0_30px_-10px_rgba(232,38,42,0.8)] peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                <span className="block text-xs font-semibold text-brand">{time(o.starts)} - {time(o.ends)}</span>
                <span className="mt-0.5 block text-lg font-bold leading-tight">{o.cname}</span>
                <span className="block text-xs text-white/50">{o.instr || "—"}</span>
                {o.is_booked && <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">{labels.mine}</span>}
              </span>
            </label>
          ))}
        </div>
        <button className="btn w-full !py-3 disabled:cursor-not-allowed" disabled={!choice}>{labels.confirm}</button>
      </form>
    );
  }

  // none / error
  return (
    <div className={card} role="alert">
      <p className={`text-sm ${state.status === "error" ? "text-red-300" : "text-white/70"}`}>
        {state.status === "error" ? state.message : labels.none}
      </p>
      <button onClick={again} className="btn-ghost mt-6 w-full">{labels.again}</button>
    </div>
  );
}
