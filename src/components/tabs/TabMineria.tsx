"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useMempoolData } from "@/hooks/useMempoolData";
import { useMineriaHistorica } from "@/hooks/useMineriaHistorica";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { fmt } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { NARRATIVA } from "@/data/narrativa";

/* ── Selector de rango ── */
function Btn({ items, val, set, color }: {
  items: { id: string; l: string }[];
  val: string;
  set: (v: string) => void;
  color: string;
}) {
  return (
    <div style={{ display: "flex", gap: 0, background: "#0d1117", borderRadius: 6, border: "1px solid #21262d", overflow: "hidden" }}>
      {items.map(r => (
        <button key={r.id} onClick={() => set(r.id)} style={{
          padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
          background: val === r.id ? `${color}22` : "transparent", color: val === r.id ? color : "#667788", transition: "all 0.15s ease",
        }}>{r.l}</button>
      ))}
    </div>
  );
}

const RANGOS = [
  { id: "3m", l: "3M" }, { id: "6m", l: "6M" }, { id: "1a", l: "1A" },
  { id: "2a", l: "2A" }, { id: "5a", l: "5A" }, { id: "10a", l: "10A" },
  { id: "todo", l: "TODO" },
];

const HALVINGS = [
  { fecha: "2012-11", label: "1er Halving" },
  { fecha: "2016-07", label: "2do Halving" },
  { fecha: "2020-05", label: "3er Halving" },
  { fecha: "2024-04", label: "4to Halving" },
];

export default function TabMineria() {
  const { vivo, cargando } = useMempoolData();
  const { datos, esReal, cargando: cargandoHistorico } = useMineriaHistorica();
  const [rango, setRango] = useState("todo");
  const { isMobile, isDesktop } = useBreakpoint();

  /* ── Filtrado temporal ── */
  const filtrado = useMemo(() => {
    if (rango === "todo") return datos;
    const ahora = new Date(), corte = new Date(ahora);
    if (rango === "10a") corte.setFullYear(corte.getFullYear() - 10);
    else if (rango === "5a") corte.setFullYear(corte.getFullYear() - 5);
    else if (rango === "2a") corte.setFullYear(corte.getFullYear() - 2);
    else if (rango === "1a") corte.setFullYear(corte.getFullYear() - 1);
    else if (rango === "6m") corte.setMonth(corte.getMonth() - 6);
    else if (rango === "3m") corte.setMonth(corte.getMonth() - 3);
    const corteISO = corte.toISOString().slice(0, 7);
    return datos.filter(d => (d.fechaRaw ?? "").slice(0, 7) >= corteISO);
  }, [datos, rango]);

  const intTick = Math.max(1, Math.floor(filtrado.length / 18));
  const ult = datos[datos.length - 1];
  const hashM = vivo?.hashrate || String(ult?.hashrate ?? "—");
  const diffM = vivo?.dificultad || String(ult?.dificultad ?? "—");
  const supplyActual = ult?.suministro ?? 19_820_000;
  const pctMinado = (supplyActual / 21_000_000 * 100).toFixed(1);

  /* ── Halvings visibles en el rango actual ── */
  const halvingsVisibles = useMemo(() => {
    if (filtrado.length === 0) return [];
    const inicio = (filtrado[0]?.fechaRaw ?? "").slice(0, 7);
    const fin = (filtrado[filtrado.length - 1]?.fechaRaw ?? "").slice(0, 7);
    return HALVINGS.filter(h => h.fecha >= inicio && h.fecha <= fin).map(h => {
      const match = filtrado.find(d => (d.fechaRaw ?? "").slice(0, 7) === h.fecha);
      return match ? { ...h, fechaLabel: match.fecha } : null;
    }).filter(Boolean) as { fecha: string; label: string; fechaLabel: string }[];
  }, [filtrado]);

  /* ── Rango dinámico del header ── */
  const rangoLabel = filtrado.length > 1
    ? `${filtrado[0].fecha.toUpperCase()} — ${filtrado[filtrado.length - 1].fecha.toUpperCase()}`
    : "";

  return (
    <div>
      <Concepto titulo={NARRATIVA.tabs.mineria.concepto.titulo}>
        {NARRATIVA.tabs.mineria.concepto.cuerpo}
      </Concepto>

      {/* ── Métricas ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta={vivo?.hashrate ? "Hashrate (EN VIVO)" : "Hashrate"} valor={hashM + " EH/s"} sub="Poder computacional de la red" acento="#f0b429" />
        <Metrica etiqueta="Dificultad" valor={diffM + "T"} sub={vivo?.ajuste ? `Último ajuste: ${(vivo.ajuste.diffChange * 100).toFixed(2)}%` : "Ajuste automático cada ~2 semanas"} />
        <Metrica etiqueta="Suministro emitido" valor={fmt(supplyActual) + " BTC"} sub={`${pctMinado}% de 21M minados`} acento="#f0b429" />
        <Metrica etiqueta="Último bloque" valor={vivo?.bloque ? `#${vivo.bloque.height.toLocaleString("es-CL")}` : "—"} sub={vivo?.bloque ? `${vivo.bloque.tx_count} tx · ${(vivo.bloque.size / 1e6).toFixed(2)} MB` : "Datos de mempool.space"} acento="#a855f7" />
      </div>

      {/* ── Señales ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {NARRATIVA.tabs.mineria.senales.map((s, i) => (
          <Senal key={i} etiqueta={s.etiqueta} estado={s.estado} color={["#22c55e", "#f0b429", "#06b6d4"][i]} />
        ))}
        <Senal etiqueta="SUMINISTRO" estado={`${pctMinado}% emitido de 21M — queda menos del 6% para los próximos 114 años`} color="#f0b429" />
        {cargando && <Senal etiqueta="DATOS EN VIVO" estado="Cargando desde mempool.space..." color="#8899aa" />}
        {cargandoHistorico && <Senal etiqueta="HISTÓRICO" estado="Cargando datos reales..." color="#8899aa" />}
        {!cargandoHistorico && <Senal etiqueta="FUENTE" estado={esReal ? "bitcoin-data.com (datos reales)" : "Datos estimados (fallback)"} color={esReal ? "#f0b429" : "#667788"} />}
      </div>

      {/* ── Gráfico principal: SUMINISTRO ACUMULADO ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 12, gap: isMobile ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "#8899aa", letterSpacing: "0.08em" }}>
            SUMINISTRO ACUMULADO — BTC MINADOS {rangoLabel && `(${rangoLabel})`}
          </div>
          <Btn items={RANGOS} val={rango} set={setRango} color="#f0b429" />
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
          <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
            <defs>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0b429" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f0b429" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick} />
            <YAxis
              tick={{ fill: "#667788", fontSize: 10 }}
              tickFormatter={v => fmt(v)}
              domain={[0, 21_000_000]}
            />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 11, color: "#8b949e" }}>{d?.fecha}</div>
                  <div style={{ fontSize: 14, color: "#f0b429", fontFamily: "monospace", fontWeight: 700, marginTop: 4 }}>
                    {d?.suministro?.toLocaleString("es-CL")} BTC
                  </div>
                  <div style={{ fontSize: 11, color: "#667788", marginTop: 2 }}>
                    {(((d?.suministro ?? 0) / 21_000_000) * 100).toFixed(2)}% del máximo
                  </div>
                  <div style={{ fontSize: 11, color: "#667788" }}>
                    Bloque ≈ #{d?.bloque?.toLocaleString("es-CL")} · Recompensa: {d?.recompensa} BTC
                  </div>
                </>
              )} />
            )} />
            <ReferenceLine
              y={21_000_000}
              stroke="#f0b42950"
              strokeDasharray="5 5"
              label={{ value: "21M", fill: "#f0b429", fontSize: 10, position: "left" }}
            />
            {halvingsVisibles.map((h, i) => (
              <ReferenceLine
                key={i}
                x={h.fechaLabel}
                stroke="#f0b42940"
                strokeDasharray="4 4"
                label={{ value: h.label, fill: "#f0b429", fontSize: 8, position: "top" }}
              />
            ))}
            <Area type="monotone" dataKey="suministro" stroke="#f0b429" fill="url(#gS)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899aa" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f0b429" }} /> BTC emitidos acumulados
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899aa" }}>
            <div style={{ width: 10, height: 2, background: "#f0b42960", borderRadius: 1 }} /> Línea punteada = halving
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899aa" }}>
            <div style={{ width: 10, height: 2, background: "#f0b42950", borderRadius: 1 }} /> Cap: 21.000.000 BTC
          </div>
        </div>
      </div>

      {/* ── Hashrate + Dificultad ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>HASHRATE — EH/s</div>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
            <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
              <defs>
                <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0b429" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f0b429" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => fmt(v)} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{d?.fecha}</div>
                    <div style={{ fontSize: 13, color: "#f0b429", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{d?.hashrate} EH/s</div>
                  </>
                )} />
              )} />
              {halvingsVisibles.map((h, i) => (
                <ReferenceLine key={i} x={h.fechaLabel} stroke="#f0b42930" strokeDasharray="4 4" />
              ))}
              <Area type="monotone" dataKey="hashrate" stroke="#f0b429" fill="url(#gH)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>DIFICULTAD — BILLONES</div>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
            <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
              <defs>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => fmt(v)} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{d?.fecha}</div>
                    <div style={{ fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{d?.dificultad}T</div>
                  </>
                )} />
              )} />
              {halvingsVisibles.map((h, i) => (
                <ReferenceLine key={i} x={h.fechaLabel} stroke="#06b6d430" strokeDasharray="4 4" />
              ))}
              <Area type="monotone" dataKey="dificultad" stroke="#06b6d4" fill="url(#gD)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Comisiones + Recompensa ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>COMISIONES — % DEL INGRESO MINERO</div>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
            <ComposedChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => v + "%"} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{d?.fecha}</div>
                    <div style={{ fontSize: 13, color: "#a855f7", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{d?.pctComisiones}% del ingreso</div>
                  </>
                )} />
              )} />
              {halvingsVisibles.map((h, i) => (
                <ReferenceLine key={i} x={h.fechaLabel} stroke="#a855f730" strokeDasharray="4 4" />
              ))}
              <Bar dataKey="pctComisiones" fill="#8b5cf6" opacity={0.6} radius={[2, 2, 0, 0]} maxBarSize={8} />
              <Line type="monotone" dataKey="pctComisiones" stroke="#a855f7" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>RECOMPENSA POR BLOQUE — BTC</div>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
            <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} domain={[0, 55]} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{d?.fecha}</div>
                    <div style={{ fontSize: 13, color: "#22c55e", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{d?.recompensa} BTC por bloque</div>
                  </>
                )} />
              )} />
              {halvingsVisibles.map((h, i) => (
                <ReferenceLine
                  key={i}
                  x={h.fechaLabel}
                  stroke="#f0b42940"
                  strokeDasharray="4 4"
                  label={{ value: h.label, fill: "#f0b429", fontSize: 8, position: "top" }}
                />
              ))}
              <Area type="stepAfter" dataKey="recompensa" stroke="#22c55e" fill="url(#gR)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <PanelEdu icono={NARRATIVA.tabs.mineria.panelEdu.icono} titulo={NARRATIVA.tabs.mineria.panelEdu.titulo} color={NARRATIVA.tabs.mineria.panelEdu.color}>
        <strong style={{ color: "#f0b429" }}>La emisión sigue un calendario público.</strong> 50 → 25 → 12,5 → 6,25 → 3,125 BTC por bloque. En 2028 será 1,5625. Ningún banco central del mundo ha publicado su calendario de emisión para los próximos 100 años. Bitcoin lo hizo en 2009.
        <br /><br />
        <strong style={{ color: "#e0e8f0" }}>La seguridad no depende de confianza.</strong> Cada segundo, la red procesa cientos de millones de billones de cálculos. La dificultad se ajusta sola para mantener un bloque cada 10 minutos — sin importar cuántos mineros se sumen o se retiren.
        <br /><br />
        <strong style={{ color: "#e0e8f0" }}>Cuando la recompensa baja, las comisiones compensan.</strong> El incentivo económico se recalibra con cada bloque. Los mineros ineficientes desaparecen, los eficientes sobreviven — selección natural económica.
        <br /><br />
        A lo largo de este observatorio vas a ver qué hace la gente con un sistema que funciona así. La siguiente sección muestra cómo se reparte la propiedad.
        <br /><br />
        <span style={{ color: "#8899aa", fontStyle: "italic" }}>{NARRATIVA.tabs.mineria.panelEdu.cierre}</span>
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo. Datos de minería provienen de mempool.space y bitcoin-data.com.
        </span>
      </PanelEdu>
    </div>
  );
}
