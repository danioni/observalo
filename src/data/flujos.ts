import { FlujosDiarios, FlujosSemanales } from "@/types";

export const FLUJOS_DIARIOS: FlujosDiarios[] = (() => {
  const datos: FlujosDiarios[] = [];
  const base = new Date(2021, 0, 1);
  const sem = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  let reserva = 3_210_000;
  for (let i = 0; i < 1875; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    if (d > new Date(2026, 1, 16)) break;
    const etDia = d.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" });
    const etCorta = d.toLocaleDateString("es-CL", { month: "short", day: "numeric" });
    const numSem = Math.floor(i / 7);
    const mes = d.getMonth();
    let sesgo = 0, vol = 3500;
    if (i < 90) { sesgo = 1500 + sem(i) * 2000; vol = 5000; }
    else if (i < 135) { sesgo = 2500 + Math.sin((i - 90) / 45 * Math.PI) * 3000; vol = 7000; }
    else if (i < 180) { sesgo = -500 + Math.sin((i - 135) / 45 * Math.PI) * 4000; vol = 8000; }
    else if (i < 275) { sesgo = -1200 - sem(i + 100) * 1000; vol = 4000; }
    else if (i < 335) { sesgo = 1800 + Math.sin((i - 275) / 60 * Math.PI) * 2500; vol = 6000; }
    else if (i < 365) { sesgo = 800 + sem(i + 200) * 1500; vol = 4500; }
    else if (i < 500) { sesgo = 600 + (i - 365) / 135 * 1200; vol = 5000; }
    else if (i < 545) { sesgo = 4000 + Math.sin((i - 500) / 45 * Math.PI) * 8000; vol = 10000; }
    else if (i < 640) { sesgo = -800 - (i - 545) / 95 * 1500; vol = 5000; }
    else if (i < 680) { sesgo = -500; vol = 3000; }
    else if (i < 710) {
      const f = (i - 680) / 30;
      if (f < 0.3) { sesgo = 6000 + f / 0.3 * 10000; vol = 12000; }
      else { sesgo = -3000 - (f - 0.3) / 0.7 * 5000; vol = 9000; }
    }
    else if (i < 730) { sesgo = -3000; vol = 5000; }
    else if (i < 910) { sesgo = -1800 - sem(i + 300) * 800; vol = 3500; }
    else if (i < 1000) { sesgo = -1500 + Math.sin((i - 910) / 90 * Math.PI) * 1000; vol = 4000; }
    else if (i < 1095) { sesgo = -2000 - (i - 1000) / 95 * 800; vol = 4500; }
    else if (i < 1106) { sesgo = -2500 - sem(i + 400) * 2000; vol = 6000; }
    else if (i < 1190) { sesgo = -3500 * Math.min((i - 1106) / 60, 1) - 1500; vol = 5500; }
    else if (i < 1215) { sesgo = -2800 - Math.sin((i - 1190) / 25 * Math.PI) * 2000; vol = 5000; }
    else if (i < 1310) { sesgo = -1500 + Math.sin((i - 1215) / 95 * Math.PI * 2) * 1500; vol = 4000; }
    else if (i < 1400) { sesgo = -800 + Math.sin((i - 1310) / 90 * Math.PI) * 2500; vol = 6000; }
    else if (i < 1460) { sesgo = -500 + sem(i + 500) * 2000; vol = 5000; }
    else if (i < 1555) { sesgo = -2200 - sem(i + 600) * 1000; vol = 4000; }
    else if (i < 1645) { sesgo = -2500 - Math.sin((i - 1555) / 90 * Math.PI * 0.5) * 1000; vol = 3800; }
    else if (i < 1735) { sesgo = -1800 + Math.sin((i - 1645) / 90 * Math.PI) * 800; vol = 3500; }
    else if (i < 1830) { sesgo = -2000 - sem(i + 700) * 1200; vol = 4200; }
    else { sesgo = -2200 - sem(i + 800) * 800; vol = 3800; }
    const dSem = d.getDay();
    const multFS = (dSem === 0 || dSem === 6) ? 0.35 : 1;
    const estac = [300, -200, -100, -300, 200, -100, -400, -200, 100, 200, -100, 100][mes];
    const ruido = (sem(i) - 0.5) * vol + (sem(i + 1000) - 0.5) * vol * 0.5;
    const neto = Math.round((sesgo + estac + ruido) * multFS);
    const absN = Math.abs(neto);
    const ent = Math.round(absN * (neto > 0 ? 0.65 : 0.3) + (sem(i + 500) * 2500 + 3500) * multFS);
    const sal = Math.round(absN * (neto < 0 ? 0.65 : 0.3) + (sem(i + 700) * 2500 + 3500) * multFS);
    reserva += neto * 0.15;
    reserva = Math.max(reserva, 1_950_000);
    reserva = Math.min(reserva, 3_250_000);
    datos.push({
      fecha: d,
      etDia,
      etCorta,
      numSem,
      mes,
      flujoNeto: neto,
      entrada: ent,
      salida: sal,
      reserva: Math.round(reserva),
    });
  }
  return datos;
})();

export const FLUJOS_SEMANALES: FlujosSemanales[] = (() => {
  const semanas: FlujosSemanales[] = [];
  let bucket: FlujosDiarios[] = [];
  let actual = FLUJOS_DIARIOS[0]?.numSem;
  for (const d of FLUJOS_DIARIOS) {
    if (d.numSem !== actual) {
      if (bucket.length) {
        const p = bucket[0], u = bucket[bucket.length - 1];
        semanas.push({
          fecha: p.fecha,
          etDia: p.etDia,
          etCorta: p.etCorta,
          mes: p.mes,
          flujoNeto: Math.round(bucket.reduce((s, b) => s + b.flujoNeto, 0)),
          entrada: Math.round(bucket.reduce((s, b) => s + b.entrada, 0)),
          salida: Math.round(bucket.reduce((s, b) => s + b.salida, 0)),
          reserva: u.reserva,
        });
      }
      bucket = [d];
      actual = d.numSem;
    } else {
      bucket.push(d);
    }
  }
  if (bucket.length) {
    const p = bucket[0], u = bucket[bucket.length - 1];
    semanas.push({
      fecha: p.fecha,
      etDia: p.etDia,
      etCorta: p.etCorta,
      mes: p.mes,
      flujoNeto: Math.round(bucket.reduce((s, b) => s + b.flujoNeto, 0)),
      entrada: Math.round(bucket.reduce((s, b) => s + b.entrada, 0)),
      salida: Math.round(bucket.reduce((s, b) => s + b.salida, 0)),
      reserva: u.reserva,
    });
  }
  return semanas;
})();
