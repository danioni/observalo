/** Thousands separator using dots (es-CL style), no locale dependency */
function thousands(n: number): string {
  const s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const fmt = (n: number): string => {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + " mil M";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return thousands(n);
};

/** Format number with dot-thousands (safe for SSR hydration) */
export const fmtNum = (n: number): string => thousands(n);
