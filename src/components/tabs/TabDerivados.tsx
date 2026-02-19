"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar,
} from "recharts";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useLocalCache } from "@/hooks/useLocalCache";
import { fmt, fmtNum } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

interface MaxPainStrike {
  strike: number;
  callOI: number;
  putOI: number;
}

interface MaxPainData {
  maxPain: number;
  strikes: MaxPainStrike[];
  expiracion: string;
  expiracionLabel: string;
}

interface DeribitInstrument {
  instrument_name: string;
  open_interest: number;
  underlying_price?: number;
  mark_price?: number;
}

const DERIVADOS_CACHE_TTL = 5 * 60 * 1000; // 5 min

/* ══════════════════════════════════════════════════════════════════
   SIMULATED DATA (fallback when Deribit API fails)
   ══════════════════════════════════════════════════════════════════ */

function generarMaxPainSimulado(): MaxPainData {
  const strikes: MaxPainStrike[] = [];
  const centro = 95000;
  for (let s = centro - 20000; s <= centro + 20000; s += 2500) {
    const dist = Math.abs(s - centro) / 2500;
    strikes.push({
      strike: s,
      callOI: Math.max(10, Math.round(800 * Math.exp(-dist * 0.3) + Math.random() * 200)),
      putOI: Math.max(10, Math.round(600 * Math.exp(-dist * 0.25) + Math.random() * 150)),
    });
  }
  return {
    maxPain: centro,
    strikes,
    expiracion: "simulado",
    expiracionLabel: "Simulado",
  };
}

/* ══════════════════════════════════════════════════════════════════
   HOOK: useMaxPain (Deribit options data)
   ══════════════════════════════════════════════════════════════════ */

function useMaxPain() {
  const [data, setData] = useState<MaxPainData | null>(null);
  const [expiraciones, setExpiraciones] = useState<{ value: string; label: string }[]>([]);
  const [expiracionSel, setExpiracionSel] = useState<string>("");
  const [precioBtc, setPrecioBtc] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  const [esSimulado, setEsSimulado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const allInstrumentsRef = useRef<DeribitInstrument[]>([]);
  const cacheInstruments = useLocalCache<{ instruments: DeribitInstrument[]; expiraciones: { value: string; label: string }[] }>("obs_deribit_instruments", DERIVADOS_CACHE_TTL);

  // Fetch all instruments once
  const fetchInstruments = useCallback(async () => {
    setCargando(true);
    setError(null);

    const cached = cacheInstruments.get();
    if (cached) {
      allInstrumentsRef.current = cached.instruments;
      setExpiraciones(cached.expiraciones);
      if (cached.expiraciones.length > 0) {
        setExpiracionSel(cached.expiraciones[0].value);
      }
      setCargando(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/deribit", { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const envelope = await res.json();
      if (!mountedRef.current) return;

      if (!envelope.data) throw new Error(envelope.message ?? "Sin datos");

      const instruments: DeribitInstrument[] = envelope.data;

      allInstrumentsRef.current = instruments;

      // Extract unique expirations from instrument names (BTC-27MAR26-80000-C)
      const expSet = new Map<string, number>();
      for (const inst of instruments) {
        const parts = inst.instrument_name.split("-");
        if (parts.length >= 4) {
          const expStr = parts[1]; // e.g. "27MAR26"
          if (!expSet.has(expStr)) {
            const dateStr = expStr;
            const day = parseInt(dateStr.slice(0, 2));
            const monStr = dateStr.slice(2, 5);
            const yearStr = dateStr.slice(5);
            const months: Record<string, number> = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
            const mon = months[monStr] ?? 0;
            const year = 2000 + parseInt(yearStr);
            const ts = new Date(year, mon, day).getTime();
            expSet.set(expStr, ts);
          }
        }
      }

      // Pick meaningful expirations: nearest + highest OI (monthly/quarterly)
      const ahora = Date.now();
      const futureExps = Array.from(expSet.entries())
        .filter(([, ts]) => ts > ahora)
        .sort((a, b) => a[1] - b[1]);

      // Calculate total OI per expiration for ranking
      const oiPorExp = new Map<string, number>();
      for (const inst of instruments) {
        const parts = inst.instrument_name.split("-");
        if (parts.length >= 4) {
          const expStr = parts[1];
          oiPorExp.set(expStr, (oiPorExp.get(expStr) ?? 0) + inst.open_interest);
        }
      }

      // Always include the nearest expiration, then top 4 by OI
      const nearest = futureExps[0];
      const restByOI = futureExps
        .slice(1)
        .sort((a, b) => (oiPorExp.get(b[0]) ?? 0) - (oiPorExp.get(a[0]) ?? 0))
        .slice(0, 4);

      // Combine and sort chronologically, deduplicate
      const seleccionadas = nearest ? [nearest, ...restByOI] : restByOI;
      const vistos = new Set<string>();
      const exps = seleccionadas
        .filter(([str]) => { if (vistos.has(str)) return false; vistos.add(str); return true; })
        .sort((a, b) => a[1] - b[1])
        .map(([str, ts]) => ({
          value: str,
          label: new Date(ts).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" }),
        }));

      setExpiraciones(exps);
      if (exps.length > 0) setExpiracionSel(exps[0].value);
      setEsSimulado(false);

      cacheInstruments.set({ instruments, expiraciones: exps });

      // Get BTC price from first instrument
      const firstWithPrice = instruments.find(i => i.underlying_price && i.underlying_price > 0);
      if (firstWithPrice?.underlying_price) {
        setPrecioBtc(firstWithPrice.underlying_price);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setEsSimulado(true);
      setError(err instanceof Error ? err.message : "Error de conexión");
      const sim = generarMaxPainSimulado();
      setData(sim);
      setPrecioBtc(96500);
      setExpiraciones([{ value: "simulado", label: "Simulado" }]);
      setExpiracionSel("simulado");
    } finally {
      if (mountedRef.current) setCargando(false);
    }
  }, [cacheInstruments]);

  // Recalculate max pain when expiration changes
  useEffect(() => {
    if (!expiracionSel || esSimulado || allInstrumentsRef.current.length === 0) return;

    const instruments = allInstrumentsRef.current.filter(inst =>
      inst.instrument_name.includes(`-${expiracionSel}-`) && inst.open_interest > 0
    );

    if (instruments.length === 0) {
      setData(null);
      return;
    }

    // Group by strike
    const strikeMap = new Map<number, { callOI: number; putOI: number }>();
    for (const inst of instruments) {
      const parts = inst.instrument_name.split("-");
      const strike = parseInt(parts[2]);
      const tipo = parts[3]; // C or P
      if (isNaN(strike)) continue;

      const entry = strikeMap.get(strike) ?? { callOI: 0, putOI: 0 };
      if (tipo === "C") entry.callOI += inst.open_interest;
      else if (tipo === "P") entry.putOI += inst.open_interest;
      strikeMap.set(strike, entry);
    }

    const strikesArr: MaxPainStrike[] = Array.from(strikeMap.entries())
      .map(([strike, { callOI, putOI }]) => ({ strike, callOI, putOI }))
      .sort((a, b) => a.strike - b.strike);

    // Calculate max pain
    let minDolor = Infinity;
    let maxPainPrice = 0;

    for (const candidate of strikesArr) {
      let dolorTotal = 0;
      for (const s of strikesArr) {
        if (candidate.strike > s.strike) {
          dolorTotal += (candidate.strike - s.strike) * s.callOI;
        }
        if (candidate.strike < s.strike) {
          dolorTotal += (s.strike - candidate.strike) * s.putOI;
        }
      }
      if (dolorTotal < minDolor) {
        minDolor = dolorTotal;
        maxPainPrice = candidate.strike;
      }
    }

    // Filter to strikes with meaningful OI for visualization
    const maxOI = Math.max(...strikesArr.map(s => Math.max(s.callOI, s.putOI)));
    const threshold = maxOI * 0.01;
    const filtered = strikesArr.filter(s => s.callOI > threshold || s.putOI > threshold);

    const expLabel = expiraciones.find(e => e.value === expiracionSel)?.label ?? expiracionSel;

    setData({
      maxPain: maxPainPrice,
      strikes: filtered,
      expiracion: expiracionSel,
      expiracionLabel: expLabel,
    });
  }, [expiracionSel, esSimulado, expiraciones]);

  useEffect(() => {
    mountedRef.current = true;
    fetchInstruments();
    return () => { mountedRef.current = false; };
  }, [fetchInstruments]);

  const reintentar = useCallback(() => {
    cacheInstruments.clear();
    fetchInstruments();
  }, [cacheInstruments, fetchInstruments]);

  return { data, expiraciones, expiracionSel, setExpiracionSel, precioBtc, cargando, esSimulado, error, reintentar };
}

/* ══════════════════════════════════════════════════════════════════
   HELPERS
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
   MAIN TAB COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function TabDerivados() {
  const { data, expiraciones, expiracionSel, setExpiracionSel, precioBtc, cargando, esSimulado, error, reintentar } = useMaxPain();
  const { isMobile } = useBreakpoint();

  if (cargando) {
    return (
      <div>
        <Concepto titulo="El precio de dolor revela dónde los market makers tienen ventaja">
          Las opciones de Bitcoin permiten apostar al precio futuro. El precio de dolor (max pain) es el nivel donde más opciones expiran sin valor — es decir, donde los vendedores de opciones ganan más. Es una referencia clave para anticipar zonas de gravedad del precio antes de cada vencimiento.
        </Concepto>
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>Consultando opciones en Deribit...</div>
          <div style={{ fontSize: 11 }}>Calculando precio de dolor para opciones BTC</div>
        </div>
      </div>
    );
  }

  const distanciaUsd = data && precioBtc ? data.maxPain - precioBtc : 0;
  const distanciaPct = precioBtc ? (distanciaUsd / precioBtc * 100) : 0;

  // Find nearest strike to BTC price for reference line
  const nearestStrikeToBtc = data?.strikes.reduce((prev, curr) =>
    Math.abs(curr.strike - precioBtc) < Math.abs(prev.strike - precioBtc) ? curr : prev
  , data.strikes[0])?.strike;

  return (
    <div>
      <Concepto titulo="El precio de dolor revela dónde los market makers tienen ventaja">
        Las opciones de Bitcoin permiten apostar al precio futuro. El precio de dolor (max pain) es el nivel donde más opciones expiran sin valor — es decir, donde los vendedores de opciones ganan más. Es una referencia clave para anticipar zonas de gravedad del precio antes de cada vencimiento.
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

      {/* Selector de expiración */}
      {expiraciones.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.06em" }}>
            EXPIRACIÓN
          </div>
          <div style={{ display: "flex", gap: 0, background: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)", overflow: "hidden", flexWrap: "wrap" }}>
            {expiraciones.map(exp => (
              <button key={exp.value} onClick={() => setExpiracionSel(exp.value)} style={{
                padding: isMobile ? "6px 10px" : "6px 14px", border: "none", cursor: "pointer",
                fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                background: expiracionSel === exp.value ? "rgba(168,85,247,0.15)" : "transparent",
                color: expiracionSel === exp.value ? "#a855f7" : "var(--text-muted)",
                transition: "all 0.15s ease",
              }}>{exp.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 20 }}>
        <Metrica
          etiqueta="Precio de Dolor"
          valor={data ? "$" + fmtNum(data.maxPain) : "—"}
          sub={data ? `Expiración: ${data.expiracionLabel}` : ""}
          acento="#a855f7"
        />
        <Metrica
          etiqueta="Precio actual BTC"
          valor={precioBtc ? "$" + fmtNum(Math.round(precioBtc)) : "—"}
          sub="Precio forward en Deribit"
          acento="#f0b429"
        />
        <Metrica
          etiqueta="Distancia"
          valor={data ? (distanciaPct >= 0 ? "+" : "") + distanciaPct.toFixed(1) + "%" : "—"}
          sub={data ? (distanciaUsd >= 0 ? "+" : "") + "$" + fmtNum(Math.round(Math.abs(distanciaUsd))) : ""}
          acento={distanciaPct >= 0 ? "#22c55e" : "#ef4444"}
        />
        <Metrica
          etiqueta="Opciones activas"
          valor={data ? data.strikes.length.toString() + " strikes" : "—"}
          sub="Con interés abierto significativo"
        />
      </div>

      {/* Señal */}
      {data && precioBtc > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Senal
            etiqueta="SEÑAL"
            estado={
              Math.abs(distanciaPct) < 2
                ? "Precio cerca del max pain — zona de equilibrio, posible lateralización hasta el vencimiento"
                : distanciaPct > 0
                  ? `Precio $${fmtNum(Math.round(Math.abs(distanciaUsd)))} por debajo del max pain — presión compradora probable antes del vencimiento`
                  : `Precio $${fmtNum(Math.round(Math.abs(distanciaUsd)))} por encima del max pain — presión vendedora probable antes del vencimiento`
            }
            color={Math.abs(distanciaPct) < 2 ? "#06b6d4" : distanciaPct > 0 ? "#22c55e" : "#ef4444"}
          />
        </div>
      )}

      {/* Gráfico: OI por strike */}
      {data && data.strikes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em", marginBottom: 12 }}>
            INTERÉS ABIERTO POR STRIKE — CALLS vs PUTS
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 320 : 400}>
            <BarChart
              data={data.strikes}
              margin={{ top: 30, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
              <XAxis
                dataKey="strike"
                tick={{ fill: "var(--text-muted)", fontSize: 9 }}
                tickFormatter={v => "$" + fmt(v)}
                interval={isMobile ? Math.max(1, Math.floor(data.strikes.length / 8)) : 0}
                angle={isMobile ? -45 : -30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                tickFormatter={v => fmt(v) + " BTC"}
              />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 11, color: "var(--text-tooltip)" }}>Strike: ${d?.strike != null ? fmtNum(d.strike) : "—"}</div>
                    <div style={{ fontSize: 12, color: "#22c55e", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>
                      Calls: {d?.callOI != null ? d.callOI.toFixed(1) : "—"} BTC
                    </div>
                    <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace", fontWeight: 600 }}>
                      Puts: {d?.putOI != null ? d.putOI.toFixed(1) : "—"} BTC
                    </div>
                  </>
                )} />
              )} />
              {/* Max Pain reference line */}
              <ReferenceLine
                x={data.maxPain}
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: `Max Pain $${fmtNum(data.maxPain)}`, fill: "#a855f7", fontSize: 9, position: "top", offset: 8 }}
              />
              {/* BTC price reference line */}
              {precioBtc > 0 && nearestStrikeToBtc && (
                <ReferenceLine
                  x={nearestStrikeToBtc}
                  stroke="#f0b429"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: `BTC $${fmtNum(Math.round(precioBtc))}`, fill: "#f0b429", fontSize: 9, position: "insideTopRight", offset: 4 }}
                />
              )}
              <Bar dataKey="callOI" name="Calls" fill="#22c55e" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="putOI" name="Puts" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e" }} /> Calls (alcistas)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444" }} /> Puts (bajistas)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
              <div style={{ width: 10, height: 2, background: "#a855f7", borderRadius: 1 }} /> Precio de Dolor
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
              <div style={{ width: 10, height: 2, background: "#f0b429", borderRadius: 1 }} /> Precio actual
            </div>
          </div>
        </div>
      )}

      {/* Panel educativo */}
      <PanelEdu icono="📊" titulo="¿Qué es el Precio de Dolor (Max Pain)?" color="#a855f7">
        <strong style={{ color: "#a855f7" }}>El precio de dolor es el nivel donde los compradores de opciones pierden más dinero.</strong> Es el strike price donde la suma del valor intrínseco de todas las opciones (calls + puts) es mínima — es decir, donde más opciones expiran sin valor.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>¿Por qué importa?</strong> La teoría del max pain sugiere que el precio tiende a gravitar hacia este nivel antes del vencimiento. Los vendedores de opciones (market makers) tienen incentivo económico para que el precio se acerque al max pain, ya que así cobran más primas sin pagar.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>¿Qué tan confiable es?</strong> No es una predicción exacta. Es una referencia probabilística. Funciona mejor para vencimientos mensuales con alto interés abierto. Para vencimientos diarios o semanales con poco volumen, la señal es más débil. Úsalo como un dato más dentro de tu análisis, nunca como señal única.
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Datos de opciones: Deribit (exchange líder en opciones BTC). El cálculo se actualiza cada vez que recargas la página.
        </span>
      </PanelEdu>

      {!esSimulado && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
          Fuente: Deribit Public API · Opciones BTC activas con interés abierto {"> "}0
        </div>
      )}
    </div>
  );
}
