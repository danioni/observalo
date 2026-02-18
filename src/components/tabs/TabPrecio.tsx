"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { fmt, fmtNum } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

/* ══════════════════════════════════════════════════════════════════
   RAINBOW BANDS
   ══════════════════════════════════════════════════════════════════ */

// Rainbow bands from bottom (cold) to top (hot)
// Colors matched to BlockchainCenter.net original rainbow
const BANDAS_RAINBOW = [
  { id: "b0", nombre: "Básicamente una ganga", color: "#4527A0" },  // deep purple
  { id: "b1", nombre: "Compra", color: "#1565C0" },                 // blue
  { id: "b2", nombre: "Acumula", color: "#00897B" },                // teal
  { id: "b3", nombre: "Precio justo", color: "#2E7D32" },           // green
  { id: "b4", nombre: "Todavía barato", color: "#9ACD32" },         // yellow-green
  { id: "b5", nombre: "HODL!", color: "#FFD600" },                  // yellow
  { id: "b6", nombre: "¿Es una burbuja?", color: "#FF9800" },       // orange
  { id: "b7", nombre: "FOMO intenso", color: "#F44336" },           // red
  { id: "b8", nombre: "Burbuja máxima", color: "#B71C1C" },         // dark red
];

/* ══════════════════════════════════════════════════════════════════
   LOG REGRESSION MODEL
   ══════════════════════════════════════════════════════════════════

   The Bitcoin Rainbow Chart uses a logarithmic regression:
     log10(price) = a * ln(days_since_genesis) + b

   Parameters fitted to historical data (genesis = 2009-01-03).
   The base curve is the "fair value" center line, and bands are
   offset by multipliers above and below.
   ══════════════════════════════════════════════════════════════════ */

const GENESIS_TS = new Date("2009-01-03").getTime();

// Regression coefficients (fitted to BTC historical data)
const A = 2.0909;  // slope in log-log space
const B = -13.362; // intercept

function rainbowBase(ts: number): number {
  const days = (ts - GENESIS_TS) / 86_400_000;
  if (days <= 1) return 0;
  const logPrice = A * Math.log(days) + B;
  return Math.pow(10, logPrice);
}

// Band multipliers (9 bands + top boundary)
// Wide spacing to match historical cycles: peaks in hot bands, bottoms in cold bands.
// Calibrated against 2013/2017/2021/2025 peaks, Oct-2025 ATH, and 2015/2018/2022 bottoms.
// HODL!/¿Burbuja? boundary at 1.65× ensures recent ATH ($126k) reaches hot zone.
const BAND_MULTIPLIERS = [0.05, 0.12, 0.28, 0.55, 0.85, 1.25, 1.65, 2.8, 5.0, 12.0];

function calcularBandas(ts: number) {
  const base = rainbowBase(ts);
  const bandas: Record<string, number> = {};
  for (let i = 0; i < BANDAS_RAINBOW.length; i++) {
    bandas[`b${i}`] = base * BAND_MULTIPLIERS[i];
    bandas[`b${i}_top`] = base * BAND_MULTIPLIERS[i + 1];
  }
  return bandas;
}

// Determine which band the current price falls in
function bandaActual(precio: number, ts: number): { idx: number; nombre: string; color: string } | null {
  const base = rainbowBase(ts);
  if (base <= 0) return null;
  for (let i = BANDAS_RAINBOW.length - 1; i >= 0; i--) {
    if (precio >= base * BAND_MULTIPLIERS[i]) {
      return { idx: i, ...BANDAS_RAINBOW[i] };
    }
  }
  return { idx: 0, ...BANDAS_RAINBOW[0] };
}

/* ══════════════════════════════════════════════════════════════════
   CACHE
   ══════════════════════════════════════════════════════════════════ */

const CACHE_TTL = 30 * 60 * 1000; // 30 min for price data

function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch { return null; }
}

function cacheSet<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded */ }
}

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

interface PrecioDataPoint {
  ts: number;
  fecha: string;
  fechaRaw: string;
  precio: number;
  // Rainbow bands (b0..b8 bottom, b0_top..b8_top)
  [key: string]: number | string;
}

/* ══════════════════════════════════════════════════════════════════
   SIMULATED DATA
   ══════════════════════════════════════════════════════════════════ */

function generarPrecioSimulado(): PrecioDataPoint[] {
  const puntos: PrecioDataPoint[] = [];
  const inicio = new Date("2011-01-01");
  const hoy = new Date();
  const d = new Date(inicio);
  // Sample weekly to keep size reasonable
  while (d <= hoy) {
    const ts = d.getTime();
    const base = rainbowBase(ts);
    // Simulate price oscillating around fair value
    const dayIdx = (ts - GENESIS_TS) / 86_400_000;
    const noise = Math.sin(dayIdx * 0.01) * 0.4 + Math.sin(dayIdx * 0.003) * 0.3 + (Math.random() - 0.5) * 0.2;
    const precio = Math.max(0.1, base * Math.pow(10, noise * 0.3));
    const bandas = calcularBandas(ts);
    puntos.push({
      ts,
      fecha: d.toLocaleDateString("es-CL", { month: "short", year: "2-digit" }),
      fechaRaw: d.toISOString().slice(0, 10),
      precio,
      ...bandas,
    });
    d.setDate(d.getDate() + 7);
  }
  return puntos;
}

/* ══════════════════════════════════════════════════════════════════
   HOOK
   ══════════════════════════════════════════════════════════════════ */

function usePrecioHistorico() {
  const [datos, setDatos] = useState<PrecioDataPoint[]>([]);
  const [cargando, setCargando] = useState(true);
  const [esSimulado, setEsSimulado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setCargando(true);
    setError(null);

    const cached = cacheGet<PrecioDataPoint[]>("obs_precio_hist");
    if (cached) {
      setDatos(cached);
      setEsSimulado(false);
      setCargando(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/precio", { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const envelope = await res.json();
      if (!mountedRef.current) return;

      if (!envelope.data) throw new Error(envelope.message ?? "Sin datos");

      const values: { x: number; y: number }[] = envelope.data;

      // Sample to weekly for chart performance (daily = ~6000 points is too many)
      const sampled: PrecioDataPoint[] = [];
      let lastWeek = -1;

      for (const v of values) {
        if (v.y <= 0) continue; // skip zero-price days
        const ts = v.x * 1000;
        const d = new Date(ts);
        const weekNum = Math.floor(ts / (7 * 86_400_000));
        if (weekNum === lastWeek) continue;
        lastWeek = weekNum;

        const bandas = calcularBandas(ts);
        sampled.push({
          ts,
          fecha: d.toLocaleDateString("es-CL", { month: "short", year: "2-digit" }),
          fechaRaw: d.toISOString().slice(0, 10),
          precio: v.y,
          ...bandas,
        });
      }

      setDatos(sampled);
      setEsSimulado(false);
      cacheSet("obs_precio_hist", sampled);
    } catch (err) {
      if (!mountedRef.current) return;
      setEsSimulado(true);
      setError(err instanceof Error ? err.message : "Error de conexión");
      setDatos(generarPrecioSimulado());
    } finally {
      if (mountedRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const reintentar = useCallback(() => {
    localStorage.removeItem("obs_precio_hist");
    fetchData();
  }, [fetchData]);

  return { datos, cargando, esSimulado, error, reintentar };
}

/* ══════════════════════════════════════════════════════════════════
   RANGE SELECTOR
   ══════════════════════════════════════════════════════════════════ */

const RANGOS = [
  { id: "1a", l: "1A" },
  { id: "2a", l: "2A" },
  { id: "4a", l: "4A" },
  { id: "todo", l: "TODO" },
];

function Btn({ items, val, set, color }: {
  items: { id: string; l: string }[];
  val: string;
  set: (v: string) => void;
  color: string;
}) {
  return (
    <div style={{ display: "flex", gap: 0, background: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
      {items.map(r => (
        <button key={r.id} onClick={() => set(r.id)} style={{
          padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
          background: val === r.id ? `${color}22` : "transparent", color: val === r.id ? color : "var(--text-muted)", transition: "all 0.15s ease",
        }}>{r.l}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HALVINGS
   ══════════════════════════════════════════════════════════════════ */

const HALVINGS = [
  { fecha: "2012-11-28", label: "1er Halving" },
  { fecha: "2016-07-09", label: "2do Halving" },
  { fecha: "2020-05-11", label: "3er Halving" },
  { fecha: "2024-04-20", label: "4to Halving" },
];

/* ══════════════════════════════════════════════════════════════════
   BADGE
   ══════════════════════════════════════════════════════════════════ */

function BadgeSimulado() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: "rgba(239,68,68,0.15)", color: "#ef4444",
    }}>
      ⚠ Datos simulados
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function TabPrecio() {
  const { datos, cargando, esSimulado, error, reintentar } = usePrecioHistorico();
  const [rango, setRango] = useState("todo");
  const { isMobile } = useBreakpoint();

  // Filter by range
  const filtrado = useMemo(() => {
    if (rango === "todo") return datos;
    const ahora = new Date();
    const corte = new Date(ahora);
    if (rango === "4a") corte.setFullYear(corte.getFullYear() - 4);
    else if (rango === "2a") corte.setFullYear(corte.getFullYear() - 2);
    else if (rango === "1a") corte.setFullYear(corte.getFullYear() - 1);
    const corteTs = corte.getTime();
    return datos.filter(d => d.ts >= corteTs);
  }, [datos, rango]);

  // Current price & band
  const ultimo = datos.length > 0 ? datos[datos.length - 1] : null;
  const precioActual = ultimo?.precio ?? 0;
  const bandaInfo = ultimo ? bandaActual(precioActual, ultimo.ts) : null;

  // Price change calculations
  const stats = useMemo(() => {
    if (datos.length < 2) return null;
    const ult = datos[datos.length - 1];
    const hace7d = datos.find(d => d.ts >= ult.ts - 7 * 86_400_000) ?? datos[datos.length - 8];
    const hace30d = datos.find(d => d.ts >= ult.ts - 30 * 86_400_000) ?? datos[datos.length - 5];
    const hace1a = datos.find(d => d.ts >= ult.ts - 365 * 86_400_000);
    const athData = Math.max(...datos.map(d => d.precio));
    // blockchain.info reports daily averages which understate exchange ATHs.
    // Known ATH: $126,211 (6 Oct 2025). Update when new ATH is reached.
    const ATH_KNOWN = 126211;
    const ath = Math.max(athData, ATH_KNOWN);

    return {
      cambio7d: hace7d ? ((ult.precio - hace7d.precio) / hace7d.precio * 100) : null,
      cambio30d: hace30d ? ((ult.precio - hace30d.precio) / hace30d.precio * 100) : null,
      cambio1a: hace1a ? ((ult.precio - hace1a.precio) / hace1a.precio * 100) : null,
      ath,
      distanciaAth: ((ult.precio - ath) / ath * 100),
    };
  }, [datos]);

  // Halvings visible in range
  const halvingsVisibles = useMemo(() => {
    if (filtrado.length === 0) return [];
    const inicio = filtrado[0].fechaRaw;
    const fin = filtrado[filtrado.length - 1].fechaRaw;
    return HALVINGS.filter(h => h.fecha >= inicio && h.fecha <= fin).map(h => {
      const match = filtrado.reduce((best, d) =>
        Math.abs(new Date(d.fechaRaw).getTime() - new Date(h.fecha).getTime()) <
        Math.abs(new Date(best.fechaRaw).getTime() - new Date(h.fecha).getTime()) ? d : best
      , filtrado[0]);
      return { ...h, fechaLabel: match.fecha };
    });
  }, [filtrado]);

  // Band distribution: % of time the price spent in each band
  const distribucion = useMemo(() => {
    if (datos.length < 10) return null;
    const counts = new Array(BANDAS_RAINBOW.length).fill(0);
    for (const d of datos) {
      const info = bandaActual(d.precio, d.ts);
      if (info) counts[info.idx]++;
    }
    const total = datos.length;
    return BANDAS_RAINBOW.map((b, i) => ({
      ...b,
      count: counts[i],
      pct: (counts[i] / total) * 100,
    }));
  }, [datos]);

  const intTick = Math.max(1, Math.floor(filtrado.length / (isMobile ? 8 : 16)));

  if (cargando) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Cargando precio histórico de Bitcoin...</div>
        <div style={{ fontSize: 11 }}>Fuente: blockchain.info · Datos diarios desde 2010</div>
      </div>
    );
  }

  return (
    <div>
      <Concepto titulo="El precio es ruidoso en el corto plazo — el patrón se revela en años">
        Bitcoin ha pasado por múltiples ciclos de auge y caída. El Rainbow Chart aplica una regresión logarítmica al precio histórico y dibuja bandas de color que ayudan a contextualizar si el precio actual está relativamente caro o barato — comparado con su propia historia, no con opiniones.
      </Concepto>

      {esSimulado && (
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <BadgeSimulado />
          <button onClick={reintentar} style={{
            padding: "4px 12px", borderRadius: 4, border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)", color: "#f0b429", fontSize: 10, fontWeight: 600, cursor: "pointer",
          }}>Reintentar</button>
          {error && <span style={{ fontSize: 10, color: "#ef4444" }}>{error}</span>}
        </div>
      )}

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 20 }}>
        <Metrica
          etiqueta="Precio BTC"
          valor={precioActual ? "$" + fmtNum(Math.round(precioActual)) : "—"}
          sub="Promedio mercados principales"
          acento="#f0b429"
        />
        <Metrica
          etiqueta="Zona Rainbow"
          valor={bandaInfo?.nombre ?? "—"}
          sub={`Banda ${(bandaInfo?.idx ?? 0) + 1} de ${BANDAS_RAINBOW.length}`}
          acento={bandaInfo?.color}
        />
        <Metrica
          etiqueta="Cambio 1 año"
          valor={stats?.cambio1a != null ? (stats.cambio1a >= 0 ? "+" : "") + stats.cambio1a.toFixed(1) + "%" : "—"}
          sub={stats?.cambio30d != null ? `30d: ${stats.cambio30d >= 0 ? "+" : ""}${stats.cambio30d.toFixed(1)}%` : ""}
          acento={stats?.cambio1a != null ? (stats.cambio1a >= 0 ? "#22c55e" : "#ef4444") : undefined}
        />
        <Metrica
          etiqueta="Máximo histórico"
          valor={stats?.ath ? "$" + fmtNum(Math.round(stats.ath)) : "—"}
          sub={stats?.distanciaAth != null ? `${stats.distanciaAth.toFixed(1)}% del ATH` : ""}
          acento="#a855f7"
        />
      </div>

      {/* Señal */}
      {bandaInfo && (
        <div style={{ marginBottom: 16 }}>
          <Senal
            etiqueta="RAINBOW"
            estado={
              bandaInfo.idx <= 2
                ? `Zona fría (${bandaInfo.nombre}) — históricamente zona de acumulación`
                : bandaInfo.idx <= 4
                  ? `Zona neutra (${bandaInfo.nombre}) — precio en rango medio histórico`
                  : bandaInfo.idx <= 6
                    ? `Zona caliente (${bandaInfo.nombre}) — precaución, acercándose a territorio de euforia`
                    : `Zona de máxima euforia (${bandaInfo.nombre}) — históricamente insostenible`
            }
            color={bandaInfo.color}
          />
        </div>
      )}

      {/* Rainbow Chart */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex", flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between", marginBottom: 12, gap: isMobile ? 8 : 0,
        }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
            BITCOIN RAINBOW CHART — ESCALA LOGARÍTMICA
          </div>
          <Btn items={RANGOS} val={rango} set={setRango} color="#f0b429" />
        </div>

        <ResponsiveContainer width="100%" height={isMobile ? 340 : 440}>
          <ComposedChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
            <XAxis
              dataKey="fecha"
              tick={{ fill: "var(--text-muted)", fontSize: 9 }}
              interval={intTick}
            />
            <YAxis
              scale="log"
              domain={["auto", "auto"]}
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickFormatter={(v: number) => v >= 1000 ? "$" + fmt(v) : "$" + v.toFixed(v < 1 ? 2 : 0)}
              allowDataOverflow
            />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => {
                if (!d) return null;
                const banda = bandaActual(d.precio, d.ts);
                return (
                  <>
                    <div style={{ fontSize: 11, color: "var(--text-tooltip)" }}>{d.fechaRaw}</div>
                    <div style={{ fontSize: 15, color: "#f0b429", fontFamily: "monospace", fontWeight: 700, marginTop: 4 }}>
                      ${fmtNum(Math.round(d.precio))}
                    </div>
                    {banda && (
                      <div style={{ fontSize: 11, color: banda.color, marginTop: 4, fontWeight: 600 }}>
                        ● {banda.nombre}
                      </div>
                    )}
                  </>
                );
              }} />
            )} />

            {/* Rainbow bands — top band first so lower bands paint over it */}
            {[...BANDAS_RAINBOW].reverse().map((banda) => (
              <Area
                key={banda.id}
                type="monotone"
                dataKey={`${banda.id}_top`}
                stroke="none"
                fill={banda.color}
                fillOpacity={0.85}
                baseLine={0}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {/* Halving lines */}
            {halvingsVisibles.map((h, i) => (
              <ReferenceLine
                key={i}
                x={h.fechaLabel}
                stroke="#f0b42950"
                strokeDasharray="4 4"
                label={{ value: h.label, fill: "#f0b429", fontSize: 8, position: "top" }}
              />
            ))}

            {/* Price line */}
            <Line
              type="monotone"
              dataKey="precio"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: isMobile ? 6 : 10, marginTop: 10,
        }}>
          {BANDAS_RAINBOW.map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-secondary)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
              {b.nombre}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 2, background: "#fff", borderRadius: 1 }} /> Precio
          </div>
        </div>
      </div>

      {/* Band time distribution tracker */}
      {distribucion && (
        <div style={{
          marginBottom: 24, padding: isMobile ? 12 : 16,
          background: "var(--bg-surface)", borderRadius: 8,
          border: "1px solid var(--border-subtle)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.08em", marginBottom: 12, fontWeight: 600 }}>
            TIEMPO EN CADA ZONA — DISTRIBUCIÓN HISTÓRICA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {distribucion.map((b) => {
              const maxPct = Math.max(...distribucion.map(d => d.pct));
              const barWidth = maxPct > 0 ? (b.pct / maxPct) * 100 : 0;
              const isActive = bandaInfo?.idx === distribucion.indexOf(b);
              return (
                <div key={b.id} style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "90px 1fr 38px" : "140px 1fr 50px",
                  alignItems: "center", gap: 8,
                  opacity: b.pct === 0 ? 0.4 : 1,
                }}>
                  <div style={{
                    fontSize: isMobile ? 9 : 10, color: b.color, fontWeight: isActive ? 700 : 500,
                    display: "flex", alignItems: "center", gap: 4,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0,
                      boxShadow: isActive ? `0 0 6px ${b.color}` : "none",
                    }} />
                    {b.nombre}
                    {isActive && <span style={{ fontSize: 7, verticalAlign: "super" }}>◄</span>}
                  </div>
                  <div style={{
                    height: 14, background: "var(--bg-base)", borderRadius: 3,
                    overflow: "hidden", position: "relative",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, ${b.color}cc, ${b.color}88)`,
                      borderRadius: 3,
                      transition: "width 0.5s ease",
                      minWidth: b.pct > 0 ? 3 : 0,
                    }} />
                  </div>
                  <div style={{
                    fontSize: isMobile ? 9 : 10,
                    color: b.pct === 0 ? "var(--text-muted)" : "var(--text-secondary)",
                    fontFamily: "monospace", fontWeight: 600, textAlign: "right",
                  }}>
                    {b.pct.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            Basado en {fmtNum(datos.length)} puntos semanales desde 2010.
            Los extremos (ganga y burbuja) son eventos raros — si no aparecen, el modelo necesita ajuste.
          </div>
        </div>
      )}

      {/* ATH distance context */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: isMobile ? 8 : 12, marginBottom: 24,
        }}>
          <Metrica
            etiqueta="Cambio 7 días"
            valor={stats.cambio7d != null ? (stats.cambio7d >= 0 ? "+" : "") + stats.cambio7d.toFixed(1) + "%" : "—"}
            acento={stats.cambio7d != null ? (stats.cambio7d >= 0 ? "#22c55e" : "#ef4444") : undefined}
          />
          <Metrica
            etiqueta="Cambio 30 días"
            valor={stats.cambio30d != null ? (stats.cambio30d >= 0 ? "+" : "") + stats.cambio30d.toFixed(1) + "%" : "—"}
            acento={stats.cambio30d != null ? (stats.cambio30d >= 0 ? "#22c55e" : "#ef4444") : undefined}
          />
          <Metrica
            etiqueta="Cambio 1 año"
            valor={stats.cambio1a != null ? (stats.cambio1a >= 0 ? "+" : "") + stats.cambio1a.toFixed(1) + "%" : "—"}
            acento={stats.cambio1a != null ? (stats.cambio1a >= 0 ? "#22c55e" : "#ef4444") : undefined}
          />
          <Metrica
            etiqueta="Desde el ATH"
            valor={stats.distanciaAth.toFixed(1) + "%"}
            sub={`ATH: $${fmtNum(Math.round(stats.ath))}`}
            acento={stats.distanciaAth >= -5 ? "#22c55e" : "#ef4444"}
          />
        </div>
      )}

      {/* Panel Educativo */}
      <PanelEdu icono="🌈" titulo="¿Qué es el Rainbow Chart?" color="#f0b429">
        <strong style={{ color: "#f0b429" }}>Es una herramienta visual de contexto, no de predicción.</strong> El Rainbow Chart aplica una curva de regresión logarítmica al precio histórico de Bitcoin y dibuja bandas de color alrededor. Cada banda representa una zona relativa: desde &quot;ganga&quot; (azul) hasta &quot;burbuja&quot; (rojo).
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>¿Por qué funciona?</strong> Bitcoin ha seguido un patrón de adopción logarítmica — crecimiento explosivo al inicio que se va desacelerando con el tiempo. La curva base captura esa tendencia de largo plazo. Las bandas muestran las desviaciones cíclicas (euforia y pánico) respecto a esa tendencia.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>¿Qué NO es?</strong> No es una predicción. No es asesoría financiera. La regresión puede dejar de funcionar si Bitcoin cambia fundamentalmente de patrón de adopción. Es un mapa del pasado que sugiere — pero no garantiza — el futuro.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>Halvings marcados.</strong> Las líneas punteadas amarillas indican los halvings (reducciones a la mitad de la emisión). Históricamente, cada halving ha sido seguido por un ciclo alcista 12-18 meses después — pero correlación no implica causalidad.
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este análisis es informativo. No constituye asesoría financiera. Precio promedio de mercados vía blockchain.info.
        </span>
      </PanelEdu>

      {/* Technical coefficients detail for nerds */}
      <PanelEdu icono="🔢" titulo="Detalle técnico del modelo" color="#a855f7">
        <details style={{ cursor: "pointer" }}>
          <summary style={{ fontSize: 11, color: "#a855f7", fontWeight: 600, marginBottom: 8 }}>
            Ver coeficientes de regresión y bandas
          </summary>
          <div style={{ marginTop: 10, fontFamily: "monospace", fontSize: 11, lineHeight: 1.8 }}>
            <strong style={{ color: "var(--text-primary)" }}>Modelo:</strong>{" "}
            <code>log₁₀(precio) = A × ln(días) + B</code>
            <br />
            <strong style={{ color: "var(--text-primary)" }}>Génesis:</strong> 3 enero 2009 (día 0)
            <br />
            <strong style={{ color: "var(--text-primary)" }}>A =</strong> {A} &nbsp;|&nbsp;{" "}
            <strong style={{ color: "var(--text-primary)" }}>B =</strong> {B}
            <br /><br />
            <strong style={{ color: "var(--text-primary)" }}>Multiplicadores de banda</strong> (sobre la curva base):
            <table style={{ marginTop: 6, borderCollapse: "collapse", width: "100%", maxWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ textAlign: "left", padding: "4px 8px", fontSize: 10, color: "var(--text-muted)" }}>#</th>
                  <th style={{ textAlign: "left", padding: "4px 8px", fontSize: 10, color: "var(--text-muted)" }}>Banda</th>
                  <th style={{ textAlign: "left", padding: "4px 8px", fontSize: 10, color: "var(--text-muted)" }}>Desde</th>
                  <th style={{ textAlign: "left", padding: "4px 8px", fontSize: 10, color: "var(--text-muted)" }}>Hasta</th>
                </tr>
              </thead>
              <tbody>
                {BANDAS_RAINBOW.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "3px 8px", color: b.color, fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: "3px 8px", color: b.color }}>{b.nombre}</td>
                    <td style={{ padding: "3px 8px" }}>{BAND_MULTIPLIERS[i].toFixed(2)}×</td>
                    <td style={{ padding: "3px 8px" }}>{BAND_MULTIPLIERS[i + 1].toFixed(2)}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
              Curva base hoy: ${ultimo ? "$" + fmtNum(Math.round(rainbowBase(ultimo.ts))) : "—"} · Ratio actual: {ultimo ? (precioActual / rainbowBase(ultimo.ts)).toFixed(2) + "×" : "—"}
            </span>
          </div>
        </details>
      </PanelEdu>

      {!esSimulado && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
          Fuente: blockchain.info · Precio promedio diario USD · Datos desde 2010
        </div>
      )}
    </div>
  );
}
