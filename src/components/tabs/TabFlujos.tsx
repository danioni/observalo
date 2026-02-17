"use client";

import { useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { useFlujosData } from "@/hooks/useFlujosData";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { fmt } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { NARRATIVA } from "@/data/narrativa";

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

export default function TabFlujos() {
  const { diarios: FLUJOS_DIARIOS, semanales: FLUJOS_SEMANALES, esReal, cargando: cargandoFlujos, error, stale, reintentar } = useFlujosData();
  const [gran, setGran] = useState("semanal");
  const [rango, setRango] = useState("todo");
  const { isMobile, isDesktop } = useBreakpoint();

  const fuente = gran === "diario" ? FLUJOS_DIARIOS : FLUJOS_SEMANALES;
  const filtrado = (() => {
    if (rango === "todo") return fuente;
    const corte = new Date();
    if (rango === "10a") corte.setFullYear(corte.getFullYear() - 10);
    else if (rango === "5a") corte.setFullYear(corte.getFullYear() - 5);
    else if (rango === "2a") corte.setFullYear(corte.getFullYear() - 2);
    else if (rango === "1a") corte.setFullYear(corte.getFullYear() - 1);
    else if (rango === "6m") corte.setMonth(corte.getMonth() - 6);
    else if (rango === "3m") corte.setMonth(corte.getMonth() - 3);
    const corteTime = corte.getTime();
    return fuente.filter(d => d.fecha.getTime() >= corteTime);
  })();

  const ult = filtrado[filtrado.length - 1];
  const pri = filtrado[0];
  const cambioRes = ult && pri ? ((ult.reserva - pri.reserva) / pri.reserva * 100) : 0;
  const netoTotal = filtrado.reduce((s, d) => s + d.flujoNeto, 0);
  const totalRet = filtrado.filter(d => d.flujoNeto < 0).reduce((s, d) => s + Math.abs(d.flujoNeto), 0);
  const perSalida = filtrado.filter(d => d.flujoNeto < 0).length;
  const etPer = gran === "diario" ? "Días" : "Semanas";
  const intTick = Math.max(1, Math.floor(filtrado.length / 18));

  const eventos = [
    { et: "ETF al contado", f: new Date(2024, 0, 10) },
    { et: "Halving", f: new Date(2024, 3, 20) },
    { et: "Luna/UST", f: new Date(2022, 4, 10) },
    { et: "Colapso FTX", f: new Date(2022, 10, 8) },
  ].map(ev => {
    const idx = filtrado.findIndex(d => Math.abs(d.fecha.getTime() - ev.f.getTime()) < (gran === "diario" ? 172800000 : 604800000));
    return idx >= 0 ? { ...ev, ec: filtrado[idx]?.etCorta } : null;
  }).filter(Boolean) as { et: string; f: Date; ec: string }[];

  if (cargandoFlujos && fuente.length === 0) {
    return (
      <div>
        <Concepto titulo={NARRATIVA.tabs.flujos.concepto.titulo}>
          {NARRATIVA.tabs.flujos.concepto.cuerpo}
        </Concepto>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⇄</div>
            Cargando datos reales de flujos...
          </div>
        </div>
      </div>
    );
  }

  if (error && fuente.length === 0) {
    return (
      <div>
        <Concepto titulo={NARRATIVA.tabs.flujos.concepto.titulo}>
          {NARRATIVA.tabs.flujos.concepto.cuerpo}
        </Concepto>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14, gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⇄</div>
            {error}
          </div>
          <button onClick={reintentar} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", color: "#f0b429", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Concepto titulo={NARRATIVA.tabs.flujos.concepto.titulo}>
        {NARRATIVA.tabs.flujos.concepto.cuerpo}
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta="Reservas en exchanges" valor={ult ? fmt(ult.reserva) : "No disponible"} sub={`${cambioRes.toFixed(1)}% en el período`} acento={cambioRes < 0 ? "#22c55e" : "#ef4444"} />
        <Metrica etiqueta="Flujo neto del período" valor={fmt(netoTotal)} sub={netoTotal < 0 ? "Salida neta (alcista)" : "Entrada neta (bajista)"} acento={netoTotal < 0 ? "#22c55e" : "#ef4444"} />
        <Metrica etiqueta={`${etPer} con salida neta`} valor={`${perSalida}/${filtrado.length}`} sub={`${filtrado.length > 0 ? (perSalida / filtrado.length * 100).toFixed(0) : 0}% del período`} acento="#06b6d4" />
        <Metrica etiqueta="Total retirado" valor={fmt(totalRet)} sub="BTC sacados de exchanges" acento="#22c55e" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {NARRATIVA.tabs.flujos.senales.map((s, i) => (
          <Senal key={i} etiqueta={s.etiqueta} estado={s.estado} color={["#22c55e", "#06b6d4", "#a855f7"][i]} />
        ))}
        {cargandoFlujos && <Senal etiqueta="DATOS" estado="Cargando datos reales..." color="var(--text-secondary)" />}
        {error && !cargandoFlujos && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Senal etiqueta="ERROR" estado={error} color="#ef4444" />
            <button onClick={reintentar} style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", color: "#f0b429", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Reintentar</button>
          </div>
        )}
        {!cargandoFlujos && !error && <Senal etiqueta="FUENTE" estado={esReal ? "bitcoin-data.com + coinglass.com" : "Datos simulados (fallback)"} color={esReal ? "#f0b429" : "var(--text-muted)"} />}
        {stale && (
          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
            desactualizado
          </span>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 12, gap: isMobile ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em" }}>FLUJO NETO — {gran === "diario" ? "DIARIO" : "SEMANAL"} (BTC)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn items={[{ id: "3m", l: "3M" }, { id: "6m", l: "6M" }, { id: "1a", l: "1A" }, { id: "2a", l: "2A" }, { id: "5a", l: "5A" }, { id: "10a", l: "10A" }, { id: "todo", l: "TODO" }]} val={rango} set={setRango} color="#06b6d4" />
            <Btn items={[{ id: "diario", l: "DIARIO" }, { id: "semanal", l: "SEMANAL" }]} val={gran} set={setGran} color="#f0b429" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
          <BarChart data={filtrado} margin={{ top: 10, right: 20, bottom: 35, left: isMobile ? 10 : 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
            <XAxis dataKey="etCorta" tick={{ fill: "var(--text-muted)", fontSize: 9 }} interval={intTick} angle={-40} textAnchor="end" height={55} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => fmt(v)} />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 11, color: "var(--text-tooltip)", marginBottom: 6 }}>{d?.etDia}</div>
                  <div style={{ fontSize: 13, color: d?.flujoNeto < 0 ? "#22c55e" : "#ef4444", fontFamily: "monospace", fontWeight: 600 }}>Neto: {d?.flujoNeto?.toLocaleString("es-CL")} BTC</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Entrada: {d?.entrada?.toLocaleString("es-CL")} · Salida: {d?.salida?.toLocaleString("es-CL")}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Reservas: {d?.reserva?.toLocaleString("es-CL")} BTC</div>
                </>
              )} />
            )} />
            <ReferenceLine y={0} stroke="var(--refline-stroke)" strokeWidth={1} />
            {eventos.map((ev, i) => (
              <ReferenceLine key={i} x={ev.ec} stroke="#f0b42940" strokeDasharray="4 4" label={{ value: ev.et, fill: "#f0b429", fontSize: 9, position: "top" }} />
            ))}
            <Bar dataKey="flujoNeto" radius={[1, 1, 0, 0]} maxBarSize={gran === "diario" ? 3 : 10}>
              {filtrado.map((d, i) => (<Cell key={i} fill={d.flujoNeto < 0 ? "#22c55e" : "#ef4444"} opacity={0.75} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e" }} /> Salida neta (alcista — retiro a custodia propia)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444" }} /> Entrada neta (bajista — depositan para vender)
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 12, gap: isMobile ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em" }}>RESERVAS EN EXCHANGES — TENDENCIA ESTRUCTURAL</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{pri?.etDia} → {ult?.etDia}</div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
          <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
            <defs>
              <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
            <XAxis dataKey="etCorta" tick={{ fill: "var(--text-muted)", fontSize: 9 }} interval={intTick * 2} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => fmt(v)} domain={['dataMin-30000', 'dataMax+30000']} />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 11, color: "var(--text-tooltip)" }}>{d?.etDia}</div>
                  <div style={{ fontSize: 13, color: "#ef4444", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{d?.reserva?.toLocaleString("es-CL")} BTC</div>
                </>
              )} />
            )} />
            {eventos.map((ev, i) => (
              <ReferenceLine key={i} x={ev.ec} stroke="#f0b42930" strokeDasharray="4 4" />
            ))}
            <Area type="monotone" dataKey="reserva" stroke="#ef4444" fill="url(#gRes)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <PanelEdu icono={NARRATIVA.tabs.flujos.panelEdu.icono} titulo={NARRATIVA.tabs.flujos.panelEdu.titulo} color={NARRATIVA.tabs.flujos.panelEdu.color}>
        <strong style={{ color: "#ef4444" }}>2021:</strong> La euforia llenó los exchanges. Todo el mundo depositaba para vender en máximos.
        <br /><br />
        <strong style={{ color: "#ef4444" }}>2022:</strong> FTX demostró que &quot;confía en nosotros&quot; no es una garantía. Las salidas se aceleraron.
        <br /><br />
        <strong style={{ color: "#22c55e" }}>2023:</strong> Silencio en los titulares. Éxodo constante en los datos. El mercado acumulaba mientras los medios lo ignoraban.
        <br /><br />
        <strong style={{ color: "#06b6d4" }}>2024:</strong> Los ETFs al contado empezaron a absorber oferta. El halving recortó la emisión a la mitad. Dos fuerzas convergiendo sobre una oferta fija.
        <br /><br />
        <strong style={{ color: "#a855f7" }}>2025-26:</strong> Reservas en mínimos de 7 años. ¿Cuándo fue la última vez que la oferta de dólares, euros o pesos disminuyó?
        <br /><br />
        Pero los exchanges no son los únicos acumulando menos. La siguiente sección muestra quién está comprando a escala institucional.
        <br /><br />
        <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>{NARRATIVA.tabs.flujos.panelEdu.cierre}</span>
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo. Datos de flujos provienen de fuentes públicas y pueden contener estimaciones.
        </span>
      </PanelEdu>
    </div>
  );
}
