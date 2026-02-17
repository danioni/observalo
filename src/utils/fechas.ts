/**
 * Centralized date formatting — Spanish locale (es-CL).
 * Avoids ambiguous labels like "ENE 09" (2009? Jan 9?).
 */

const LOCALE = "es-CL";

/** "ene 2009", "feb 2026" — unambiguous month+year */
export function fechaMesAnio(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(LOCALE, { year: "numeric", month: "short" });
}

/** "12 ene 2024" — day month year */
export function fechaCompleta(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "numeric" });
}

/** "ene 2009 — feb 2026" for chart range labels */
export function rangoFechas(inicio: Date | string, fin: Date | string): string {
  return `${fechaMesAnio(inicio)} — ${fechaMesAnio(fin)}`;
}

/** "14:32:05 UTC" — time for "Actualizado:" label */
export function horaUTC(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }) + " UTC";
}

/** Short label for chart X-axis ticks: "ene 09" (2-digit year) for older data */
export function fechaCorta(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(LOCALE, { year: "2-digit", month: "short" });
}
