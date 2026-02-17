"use client";

import { useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { useFlujosData } from "@/hooks/useFlujosData";
import { fmt } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

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

export default function TabFlujos() {
  const { diarios: FLUJOS_DIARIOS, semanales: FLUJOS_SEMANALES, esReal, cargando: cargandoFlujos } = useFlujosData();
  const [gran, setGran] = useState("semanal");
  const [rango, setRango] = useState("todo");

  const fuente = gran === "diario" ? FLUJOS_DIARIOS : FLUJOS_SEMANALES;
  const filtrado = (() => {
    if (rango === "todo") return fuente;
    const ahora = new Date(), corte = new Date(ahora);
    if (rango === "10a") corte.setFullYear(corte.getFullYear() - 10);
    else if (rango === "5a") corte.setFullYear(corte.getFullYear() - 5);
    else if (rango === "2a") corte.setFullYear(corte.getFullYear() - 2);
    else if (rango === "1a") corte.setFullYear(corte.getFullYear() - 1);
    else if (rango === "6m") corte.setMonth(corte.getMonth() - 6);
    else if (rango === "3m") corte.setMonth(corte.getMonth() - 3);
    return fuente.filter(d => d.fecha >= corte);
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
        <Concepto titulo="¿Qué muestran los flujos de exchanges?">
          Cuando BTC sale de los exchanges (salida neta), las personas retiran a billeteras propias — señal alcista, indica acumulación y custodia propia.
          Cuando BTC entra a los exchanges (entrada neta), depositan para vender — señal bajista, indica presión de venta.
        </Concepto>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#667788", fontSize: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⇄</div>
            Cargando datos reales de flujos desde CoinGlass...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Concepto titulo="¿Qué muestran los flujos de exchanges?">
        Cuando BTC sale de los exchanges (salida neta), las personas retiran a billeteras propias — <strong style={{ color: "#22c55e" }}>señal alcista</strong>, indica acumulación y custodia propia.
        Cuando BTC entra a los exchanges (entrada neta), depositan para vender — <strong style={{ color: "#ef4444" }}>señal bajista</strong>, indica presión de venta.
        Las reservas totales son el &quot;tanque de combustible disponible para vender&quot;. Cuando se vacía, hay menos oferta y el precio tiende a subir.
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <Metrica etiqueta="Reservas en exchanges" valor={ult ? fmt(ult.reserva) : "—"} sub={`${cambioRes.toFixed(1)}% en el período`} acento={cambioRes < 0 ? "#22c55e" : "#ef4444"} />
        <Metrica etiqueta="Flujo neto del período" valor={fmt(netoTotal)} sub={netoTotal < 0 ? "Salida neta (alcista)" : "Entrada neta (bajista)"} acento={netoTotal < 0 ? "#22c55e" : "#ef4444"} />
        <Metrica etiqueta={`${etPer} con salida neta`} valor={`${perSalida}/${filtrado.length}`} sub={`${filtrado.length > 0 ? (perSalida / filtrado.length * 100).toFixed(0) : 0}% del período`} acento="#06b6d4" />
        <Metrica etiqueta="Total retirado" valor={fmt(totalRet)} sub="BTC sacados de exchanges" acento="#22c55e" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Senal etiqueta="RESERVAS" estado="Repunte reciente tras mínimos de +5 años" color="#f0b429" />
        <Senal etiqueta="EFECTO ETF" estado="Salidas aceleradas desde aprobación" color="#06b6d4" />
        <Senal etiqueta="CUSTODIA PROPIA" estado="Tendencia irreversible post-FTX" color="#a855f7" />
        {cargandoFlujos && <Senal etiqueta="DATOS" estado="Cargando datos reales..." color="#8899aa" />}
        {!cargandoFlujos && <Senal etiqueta="FUENTE" estado={esReal ? "coinglass.com (datos reales)" : "Datos simulados (fallback)"} color={esReal ? "#f0b429" : "#667788"} />}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#8899aa", letterSpacing: "0.08em" }}>FLUJO NETO — {gran === "diario" ? "DIARIO" : "SEMANAL"} (BTC)</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn items={[{ id: "3m", l: "3M" }, { id: "6m", l: "6M" }, { id: "1a", l: "1A" }, { id: "2a", l: "2A" }, { id: "5a", l: "5A" }, { id: "10a", l: "10A" }, { id: "todo", l: "TODO" }]} val={rango} set={setRango} color="#06b6d4" />
            <Btn items={[{ id: "diario", l: "DIARIO" }, { id: "semanal", l: "SEMANAL" }]} val={gran} set={setGran} color="#f0b429" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={filtrado} margin={{ top: 10, right: 20, bottom: 35, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis dataKey="etCorta" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick} angle={-40} textAnchor="end" height={55} />
            <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => fmt(v)} />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6 }}>{d?.etDia}</div>
                  <div style={{ fontSize: 13, color: d?.flujoNeto < 0 ? "#22c55e" : "#ef4444", fontFamily: "monospace", fontWeight: 600 }}>Neto: {d?.flujoNeto?.toLocaleString("es-CL")} BTC</div>
                  <div style={{ fontSize: 11, color: "#667788", marginTop: 2 }}>Entrada: {d?.entrada?.toLocaleString("es-CL")} · Salida: {d?.salida?.toLocaleString("es-CL")}</div>
                  <div style={{ fontSize: 11, color: "#667788" }}>Reservas: {d?.reserva?.toLocaleString("es-CL")} BTC</div>
                </>
              )} />
            )} />
            <ReferenceLine y={0} stroke="#3d4450" strokeWidth={1} />
            {eventos.map((ev, i) => (
              <ReferenceLine key={i} x={ev.ec} stroke="#f0b42940" strokeDasharray="4 4" label={{ value: ev.et, fill: "#f0b429", fontSize: 9, position: "top" }} />
            ))}
            <Bar dataKey="flujoNeto" radius={[1, 1, 0, 0]} maxBarSize={gran === "diario" ? 3 : 10}>
              {filtrado.map((d, i) => (<Cell key={i} fill={d.flujoNeto < 0 ? "#22c55e" : "#ef4444"} opacity={0.75} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899aa" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e" }} /> Salida neta (alcista — retiro a custodia propia)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899aa" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444" }} /> Entrada neta (bajista — depositan para vender)
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#8899aa", letterSpacing: "0.08em" }}>RESERVAS EN EXCHANGES — TENDENCIA ESTRUCTURAL</div>
          <div style={{ fontSize: 10, color: "#667788" }}>{pri?.etDia} → {ult?.etDia}</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <defs>
              <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis dataKey="etCorta" tick={{ fill: "#667788", fontSize: 9 }} interval={intTick * 2} />
            <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => fmt(v)} domain={['dataMin-30000', 'dataMax+30000']} />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 11, color: "#8b949e" }}>{d?.etDia}</div>
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

      <PanelEdu icono="⇄" titulo="Narrativa del ciclo — 5 años de flujos" color="#06b6d4">
        <strong style={{ color: "#ef4444" }}>2021 (Alcista):</strong> Entradas masivas por FOMO. Prohibición en China (mayo) generó crash. Máximo histórico de ~$69.000 en noviembre inició distribución.{" "}
        <strong style={{ color: "#ef4444" }}>2022 (Bajista):</strong> Dos shocks: colapso de Luna/UST (mayo) y colapso de FTX (noviembre). Después de FTX, &quot;si no son tus llaves, no son tus monedas&quot; se volvió dominante.{" "}
        <strong style={{ color: "#22c55e" }}>2023 (Recuperación):</strong> Éxodo sostenido de exchanges. Custodia propia se normaliza. Acumulación silenciosa.{" "}
        <strong style={{ color: "#06b6d4" }}>2024 (Halving + ETF):</strong> ETF al contado aprobado en enero aceleró salidas institucionales. Halving en abril redujo emisión a 3,125 BTC por bloque.{" "}
        <strong style={{ color: "#a855f7" }}>2025-26:</strong> Tras tocar mínimos de más de 5 años, las reservas han repuntado — posible redistribución institucional vía ETFs y nuevos depósitos. La tendencia de largo plazo sigue siendo de salida neta.
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo. Datos de flujos provienen de fuentes públicas y pueden contener estimaciones.
        </span>
      </PanelEdu>
    </div>
  );
}
