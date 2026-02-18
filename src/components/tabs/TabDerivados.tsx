"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, BarChart,
} from "recharts";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { fmt } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

interface OIHistItem {
  fecha: string;
  fechaRaw: string;
  oiBtc: number;
  oiUsd: number;
}

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

/* ══════════════════════════════════════════════════════════════════
   CACHE HELPERS (localStorage, 5 min TTL)
   ══════════════════════════════════════════════════════════════════ */

const CACHE_TTL = 5 * 60 * 1000;

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
  } catch { /* quota exceeded — ignore */ }
}

/* ══════════════════════════════════════════════════════════════════
   SIMULATED DATA (fallback when APIs fail)
   ══════════════════════════════════════════════════════════════════ */

function generarOISimulado(): OIHistItem[] {
  const items: OIHistItem[] = [];
  const hoy = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const base = 75000 + Math.sin(i * 0.07) * 15000 + Math.random() * 5000;
    items.push({
      fecha: d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" }),
      fechaRaw: d.toISOString().slice(0, 10),
      oiBtc: Math.round(base),
      oiUsd: Math.round(base * 96500),
    });
  }
  return items;
}

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
   HOOKS
   ══════════════════════════════════════════════════════════════════ */

function useOpenInterest() {
  const [hist, setHist] = useState<OIHistItem[]>([]);
  const [oiActual, setOiActual] = useState<{ btc: number; usd: number } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [esSimulado, setEsSimulado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setCargando(true);
    setError(null);

    // Check cache first
    const cachedHist = cacheGet<OIHistItem[]>("obs_oi_hist");
    const cachedActual = cacheGet<{ btc: number; usd: number }>("obs_oi_actual");
    if (cachedHist && cachedActual) {
      setHist(cachedHist);
      setOiActual(cachedActual);
      setEsSimulado(false);
      setCargando(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const [histRes, actualRes] = await Promise.all([
        fetch("https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=90", { signal: controller.signal }),
        fetch("https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT", { signal: controller.signal }),
      ]);

      clearTimeout(timeout);

      if (!histRes.ok || !actualRes.ok) throw new Error("HTTP error");

      const histJson = await histRes.json();
      const actualJson = await actualRes.json();

      if (!mountedRef.current) return;

      const histData: OIHistItem[] = histJson.map((item: { timestamp: number; sumOpenInterest: string; sumOpenInterestValue: string }) => {
        const d = new Date(item.timestamp);
        return {
          fecha: d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" }),
          fechaRaw: d.toISOString().slice(0, 10),
          oiBtc: parseFloat(item.sumOpenInterest),
          oiUsd: parseFloat(item.sumOpenInterestValue),
        };
      });

      const actual = {
        btc: parseFloat(actualJson.openInterest),
        usd: parseFloat(actualJson.openInterest) * (histData.length > 0 ? histData[histData.length - 1].oiUsd / histData[histData.length - 1].oiBtc : 96500),
      };

      setHist(histData);
      setOiActual(actual);
      setEsSimulado(false);
      cacheSet("obs_oi_hist", histData);
      cacheSet("obs_oi_actual", actual);
    } catch (err) {
      if (!mountedRef.current) return;
      setEsSimulado(true);
      setError(err instanceof Error ? err.message : "Error de conexión");
      const sim = generarOISimulado();
      setHist(sim);
      const ult = sim[sim.length - 1];
      setOiActual({ btc: ult.oiBtc, usd: ult.oiUsd });
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
    localStorage.removeItem("obs_oi_hist");
    localStorage.removeItem("obs_oi_actual");
    fetchData();
  }, [fetchData]);

  // Cambio 24h
  const cambio24h = useMemo(() => {
    if (hist.length < 2) return null;
    const hoy = hist[hist.length - 1].oiBtc;
    const ayer = hist[hist.length - 2].oiBtc;
    return ((hoy - ayer) / ayer * 100);
  }, [hist]);

  return { hist, oiActual, cargando, esSimulado, error, cambio24h, reintentar };
}

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

  // Fetch all instruments once
  const fetchInstruments = useCallback(async () => {
    setCargando(true);
    setError(null);

    const cached = cacheGet<{ instruments: DeribitInstrument[]; expiraciones: { value: string; label: string }[] }>("obs_deribit_instruments");
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
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        "https://deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option",
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!res.ok) throw new Error("HTTP error");

      const json = await res.json();
      if (!mountedRef.current) return;

      const instruments: DeribitInstrument[] = (json.result || []).map((item: {
        instrument_name: string;
        open_interest: number;
        underlying_price?: number;
        mark_price?: number;
      }) => ({
        instrument_name: item.instrument_name,
        open_interest: item.open_interest || 0,
        underlying_price: item.underlying_price,
        mark_price: item.mark_price,
      }));

      allInstrumentsRef.current = instruments;

      // Extract unique expirations from instrument names (BTC-27MAR26-80000-C)
      const expSet = new Map<string, number>();
      for (const inst of instruments) {
        const parts = inst.instrument_name.split("-");
        if (parts.length >= 4) {
          const expStr = parts[1]; // e.g. "27MAR26"
          if (!expSet.has(expStr)) {
            // Parse date for sorting
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

      // Sort by date, take next 5 future expirations
      const ahora = Date.now();
      const exps = Array.from(expSet.entries())
        .filter(([, ts]) => ts > ahora)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 5)
        .map(([str, ts]) => ({
          value: str,
          label: new Date(ts).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" }),
        }));

      setExpiraciones(exps);
      if (exps.length > 0) setExpiracionSel(exps[0].value);
      setEsSimulado(false);

      cacheSet("obs_deribit_instruments", { instruments, expiraciones: exps });

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
  }, []);

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
        // Calls: ITM when candidate price > strike
        if (candidate.strike > s.strike) {
          dolorTotal += (candidate.strike - s.strike) * s.callOI;
        }
        // Puts: ITM when candidate price < strike
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
    localStorage.removeItem("obs_deribit_instruments");
    fetchInstruments();
  }, [fetchInstruments]);

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

function SubSelector({ items, val, set }: {
  items: { id: string; l: string }[];
  val: string;
  set: (v: string) => void;
}) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{
      display: "flex", gap: 0, background: "var(--bg-surface)", borderRadius: 8,
      border: "1px solid var(--border-subtle)", overflow: "hidden", marginBottom: 20,
    }}>
      {items.map(r => (
        <button key={r.id} onClick={() => set(r.id)} style={{
          padding: isMobile ? "10px 16px" : "10px 24px", border: "none", cursor: "pointer",
          fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: "0.06em",
          background: val === r.id ? "rgba(240,180,41,0.15)" : "transparent",
          color: val === r.id ? "#f0b429" : "var(--text-muted)",
          borderBottom: val === r.id ? "2px solid #f0b429" : "2px solid transparent",
          transition: "all 0.15s ease",
        }}>{r.l}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION: INTERÉS ABIERTO
   ══════════════════════════════════════════════════════════════════ */

function SeccionInteresAbierto() {
  const { hist, oiActual, cargando, esSimulado, error, cambio24h, reintentar } = useOpenInterest();
  const { isMobile } = useBreakpoint();

  // Señal interpretativa
  const senal = useMemo(() => {
    if (hist.length < 3) return null;
    const ult = hist[hist.length - 1];
    const prev = hist[hist.length - 3];
    const oiSube = ult.oiBtc > prev.oiBtc;
    const oiBaja = ult.oiBtc < prev.oiBtc;

    // We don't have price in the OI data from Binance, so base signal on OI trend
    if (oiSube) {
      return {
        texto: "Interés abierto en aumento — los operadores están tomando nuevas posiciones apalancadas",
        color: "#f0b429",
      };
    }
    if (oiBaja) {
      return {
        texto: "Interés abierto en descenso — desapalancamiento en curso, menor riesgo de liquidaciones masivas",
        color: "#06b6d4",
      };
    }
    return { texto: "Interés abierto estable", color: "var(--text-muted)" };
  }, [hist]);

  if (cargando) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Consultando datos de Binance Futures...</div>
        <div style={{ fontSize: 11 }}>Interés abierto de BTCUSDT perpetuo</div>
      </div>
    );
  }

  const intTick = Math.max(1, Math.floor(hist.length / (isMobile ? 8 : 14)));

  return (
    <div>
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
          etiqueta="Interés Abierto (BTC)"
          valor={oiActual ? fmt(Math.round(oiActual.btc)) + " BTC" : "—"}
          sub="Posiciones abiertas en Binance"
          acento="#f0b429"
        />
        <Metrica
          etiqueta="Interés Abierto (USD)"
          valor={oiActual ? "$" + fmt(Math.round(oiActual.usd)) : "—"}
          sub="Valor notional total"
          acento="#06b6d4"
        />
        <Metrica
          etiqueta="Cambio 24h"
          valor={cambio24h !== null ? (cambio24h >= 0 ? "+" : "") + cambio24h.toFixed(2) + "%" : "—"}
          sub="Variación del interés abierto"
          acento={cambio24h !== null ? (cambio24h >= 0 ? "#22c55e" : "#ef4444") : undefined}
        />
        <Metrica
          etiqueta="Fuente"
          valor="Binance"
          sub="Futuros BTCUSDT perpetuo"
        />
      </div>

      {/* Señal interpretativa */}
      {senal && (
        <div style={{ marginBottom: 16 }}>
          <Senal etiqueta="SEÑAL" estado={senal.texto} color={senal.color} />
        </div>
      )}

      {/* Gráfico: OI histórico */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em", marginBottom: 12 }}>
          INTERÉS ABIERTO HISTÓRICO — BTCUSDT (90 días)
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
          <ComposedChart data={hist} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
            <defs>
              <linearGradient id="gOI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0b429" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f0b429" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
            <XAxis dataKey="fecha" tick={{ fill: "var(--text-muted)", fontSize: 9 }} interval={intTick} />
            <YAxis
              yAxisId="left"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickFormatter={v => fmt(v)}
              label={{ value: "BTC", angle: -90, position: "insideLeft", fill: "var(--text-muted)", fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickFormatter={v => "$" + fmt(v)}
              label={{ value: "USD", angle: 90, position: "insideRight", fill: "var(--text-muted)", fontSize: 10 }}
            />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 11, color: "var(--text-tooltip)" }}>{d?.fecha}</div>
                  <div style={{ fontSize: 13, color: "#f0b429", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>
                    {d?.oiBtc?.toLocaleString("es-CL", { maximumFractionDigits: 0 })} BTC
                  </div>
                  <div style={{ fontSize: 12, color: "#06b6d4", fontFamily: "monospace" }}>
                    ${d?.oiUsd?.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
                  </div>
                </>
              )} />
            )} />
            <Line yAxisId="right" type="monotone" dataKey="oiUsd" stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            <Bar yAxisId="left" dataKey="oiBtc" fill="url(#gOI)" stroke="#f0b429" strokeWidth={0.5} radius={[2, 2, 0, 0]} maxBarSize={12} />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f0b429" }} /> OI en BTC
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 2, background: "#06b6d4", borderRadius: 1 }} /> OI en USD
          </div>
        </div>
      </div>

      {!esSimulado && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
          Fuente: Binance Futures API (solo posiciones en Binance, no agregado multi-exchange)
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION: PRECIO DE DOLOR (MAX PAIN)
   ══════════════════════════════════════════════════════════════════ */

function SeccionMaxPain() {
  const { data, expiraciones, expiracionSel, setExpiracionSel, precioBtc, cargando, esSimulado, error, reintentar } = useMaxPain();
  const { isMobile } = useBreakpoint();

  if (cargando) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Consultando opciones en Deribit...</div>
        <div style={{ fontSize: 11 }}>Calculando precio de dolor para opciones BTC</div>
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
          valor={data ? "$" + data.maxPain.toLocaleString("es-CL") : "—"}
          sub={data ? `Expiración: ${data.expiracionLabel}` : ""}
          acento="#a855f7"
        />
        <Metrica
          etiqueta="Precio actual BTC"
          valor={precioBtc ? "$" + Math.round(precioBtc).toLocaleString("es-CL") : "—"}
          sub="Precio forward en Deribit"
          acento="#f0b429"
        />
        <Metrica
          etiqueta="Distancia"
          valor={data ? (distanciaPct >= 0 ? "+" : "") + distanciaPct.toFixed(1) + "%" : "—"}
          sub={data ? (distanciaUsd >= 0 ? "+" : "") + "$" + Math.round(Math.abs(distanciaUsd)).toLocaleString("es-CL") : ""}
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
                  ? `Precio $${Math.round(Math.abs(distanciaUsd)).toLocaleString("es-CL")} por debajo del max pain — presión compradora probable antes del vencimiento`
                  : `Precio $${Math.round(Math.abs(distanciaUsd)).toLocaleString("es-CL")} por encima del max pain — presión vendedora probable antes del vencimiento`
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
              margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}
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
                    <div style={{ fontSize: 11, color: "var(--text-tooltip)" }}>Strike: ${d?.strike?.toLocaleString("es-CL")}</div>
                    <div style={{ fontSize: 12, color: "#22c55e", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>
                      Calls: {d?.callOI?.toLocaleString("es-CL", { maximumFractionDigits: 1 })} BTC
                    </div>
                    <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace", fontWeight: 600 }}>
                      Puts: {d?.putOI?.toLocaleString("es-CL", { maximumFractionDigits: 1 })} BTC
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
                label={{ value: `Max Pain $${data.maxPain.toLocaleString("es-CL")}`, fill: "#a855f7", fontSize: 10, position: "top" }}
              />
              {/* BTC price reference line */}
              {precioBtc > 0 && nearestStrikeToBtc && (
                <ReferenceLine
                  x={nearestStrikeToBtc}
                  stroke="#f0b429"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: `BTC $${Math.round(precioBtc).toLocaleString("es-CL")}`, fill: "#f0b429", fontSize: 10, position: "top" }}
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

/* ══════════════════════════════════════════════════════════════════
   MAIN TAB COMPONENT
   ══════════════════════════════════════════════════════════════════ */

const SUB_TABS = [
  { id: "oi", l: "INTERÉS ABIERTO" },
  { id: "maxpain", l: "PRECIO DE DOLOR" },
];

export default function TabDerivados() {
  const [sub, setSub] = useState("oi");

  return (
    <div>
      <Concepto titulo="Los derivados amplifican los movimientos — aquí puedes ver las posiciones abiertas">
        Los derivados financieros de Bitcoin (futuros y opciones) permiten apostar al precio con apalancamiento. El interés abierto muestra cuánto capital está comprometido en estas apuestas. El precio de dolor revela dónde los market makers tienen ventaja. Juntos, estos datos ayudan a anticipar zonas de volatilidad y posibles liquidaciones.
      </Concepto>

      <SubSelector items={SUB_TABS} val={sub} set={setSub} />

      {sub === "oi" && <SeccionInteresAbierto />}
      {sub === "maxpain" && <SeccionMaxPain />}

      {sub === "oi" && (
        <PanelEdu icono="📈" titulo="¿Cómo leer el Interés Abierto?" color="#f0b429">
          <strong style={{ color: "#f0b429" }}>El interés abierto (Open Interest) mide el total de contratos de futuros activos.</strong> Cada contrato tiene un comprador y un vendedor — el OI cuenta las posiciones que aún no se han cerrado.
          <br /><br />
          <strong style={{ color: "var(--text-primary)" }}>OI sube + precio sube</strong> = dinero nuevo entrando a posiciones largas (alcista). Confirma la tendencia.
          <br /><br />
          <strong style={{ color: "var(--text-primary)" }}>OI sube + precio baja</strong> = acumulación de posiciones cortas apalancadas. <span style={{ color: "#ef4444" }}>Riesgo de short squeeze</span> si el precio rebota.
          <br /><br />
          <strong style={{ color: "var(--text-primary)" }}>OI baja + precio baja</strong> = desapalancamiento. Los operadores están cerrando posiciones. Menos peligroso — el mercado se limpia.
          <br /><br />
          <strong style={{ color: "var(--text-primary)" }}>OI baja + precio sube</strong> = cierre de cortos (short covering). Movimiento puede ser temporal.
          <br /><br />
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
            Este análisis es informativo y no constituye asesoría financiera. Datos de Binance Futures (solo BTCUSDT perpetuo).
          </span>
        </PanelEdu>
      )}
    </div>
  );
}
