// "2026-10-24T18:00" yang diketik admin dianggap waktu WITA (UTC+8)
export const witaToIso = (local: string) => new Date(`${local}:00+08:00`).toISOString();

export const GI_SIZES = ["own", "M0", "M1", "M2", "M3", "M4", "A0", "A1", "A2", "A3", "A4", "A5"] as const;
export const BELTS = ["White", "Blue", "Purple", "Brown", "Black"] as const;
export const PLANS = ["Monthly", "3 Month", "Annual"] as const;
