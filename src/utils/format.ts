export const fmt = (n: number): string => {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + " mil M";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString("es-CL");
};
