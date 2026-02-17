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
        <Concepto titulo="Los exchanges se vacían. ¿A dónde va el Bitcoin?">
          En el sistema bancario, tu dinero es una promesa del banco — un número en su base de datos. Cuando retiras BTC de un exchange, dejas de depender de promesas.
        </Concepto>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#667788", fontSize: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⇄</div>
            Cargando datos reales de flujos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Concepto titulo="Los exchanges se vacían. ¿A dónde va el Bitcoin?">
        En el sistema bancario, tu dinero es una promesa del banco — un número en su base de datos. Cuando retiras BTC de un exchange a tu propia billetera, dejas de depender de promesas. Después del colapso de FTX, millones aprendieron la diferencia entre custodiar y confiar. Las reservas en exchanges están en niveles no vistos desde 2018. Los ETFs al contado aceleran las salidas desde enero 2024. El patrón es estructural, no cíclico. En Ondas viste que la convicción crece — aquí ves cómo se materializa: el capital migra de custodios hacia soberanía individual.
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta="Reservas en exchanges" valor={ult ? fmt(ult.reserva) : "—"} sub={`${cambioRes.toFixed(1)}% en el período`} acento={cambioRes < 0 ? "#22c55e" : "#ef4444"} />
        <Metrica etiqueta="Flujo neto del período" valor={fmt(netoTotal)} sub={netoTotal < 0 ? "Salida neta (alcista)" : "Entrada neta (bajista)"} acento={netoTotal < 0 ? "#22c55e" : "#ef4444"} />
        <Metrica etiqueta={`${etPer} con salida neta`} valor={`${perSalida}/${filtrado.length}`} sub={`${filtrado.length > 0 ? (perSalida / filtrado.length * 100).toFixed(0) : 0}% del período`} acento="#06b6d4" />
        <Metrica etiqueta="Total retirado" valor={fmt(totalRet)} sub="BTC sacados de exchanges" acento="#22c55e" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Senal etiqueta="RESERVAS" estado="El tanque de venta se vacía. Mínimos de 7 años." color="#22c55e" />
        <Senal etiqueta="EFECTO ETF" estado="Los ETFs drenan exchanges a ritmo industrial" color="#06b6d4" />
        <Senal etiqueta="CUSTODIA PROPIA" estado="Después de FTX, la gente eligió sus propias llaves" color="#a855f7" />
        {cargandoFlujos && <Senal etiqueta="DATOS" estado="Cargando datos reales..." color="#8899aa" />}
        {!cargandoFlujos && <Senal etiqueta="FUENTE" estado={esReal ? "bitcoin-data.com + coinglass.com" : "Datos simulados (fallback)"} color={esReal ? "#f0b429" : "#667788"} />}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 12, gap: isMobile ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "#8899aa", letterSpacing: "0.08em" }}>FLUJO NETO — {gran === "diario" ? "DIARIO" : "SEMANAL"} (BTC)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn items={[{ id: "3m", l: "3M" }, { id: "6m", l: "6M" }, { id: "1a", l: "1A" }, { id: "2a", l: "2A" }, { id: "5a", l: "5A" }, { id: "10a", l: "10A" }, { id: "todo", l: "TODO" }]} val={rango} set={setRango} color="#06b6d4" />
            <Btn items={[{ id: "diario", l: "DIARIO" }, { id: "semanal", l: "SEMANAL" }]} val={gran} set={setGran} color="#f0b429" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
          <BarChart data={filtrado} margin={{ top: 10, right: 20, bottom: 35, left: isMobile ? 10 : 20 }}>
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
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 12, gap: isMobile ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "#8899aa", letterSpacing: "0.08em" }}>RESERVAS EN EXCHANGES — TENDENCIA ESTRUCTURAL</div>
          <div style={{ fontSize: 10, color: "#667788" }}>{pri?.etDia} → {ult?.etDia}</div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
          <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
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

      <PanelEdu icono="⇄" titulo="Cómo se vació la tubería — cinco años en datos" color="#06b6d4">
        <strong style={{ color: "#ef4444" }}>2021:</strong> La euforia llenó los exchanges. Todo el mundo depositaba para vender en máximos.
        <br /><br />
        <strong style={{ color: "#ef4444" }}>2022:</strong> FTX demostró que &quot;confía en nosotros&quot; no es una garantía — es lo mismo que prometen los bancos, con la misma fragilidad. Las salidas se aceleraron.
        <br /><br />
        <strong style={{ color: "#22c55e" }}>2023:</strong> Silencio en los titulares. Éxodo constante en los datos. El mercado acumulaba mientras los medios lo ignoraban.
        <br /><br />
        <strong style={{ color: "#06b6d4" }}>2024:</strong> Los ETFs al contado empezaron a absorber oferta a escala industrial. El halving recortó la emisión a la mitad. Dos fuerzas convergiendo.
        <br /><br />
        <strong style={{ color: "#a855f7" }}>2025-26:</strong> Reservas en mínimos de 7 años. Compare esto con cualquier moneda fiduciaria: ¿cuándo fue la última vez que la oferta de dólares, euros o pesos disminuyó?
        <br /><br />
        <span style={{ color: "#8899aa", fontStyle: "italic" }}>El sistema diseñado para tener un suministro fijo está mostrando exactamente lo que pasa cuando la demanda es estructural y la oferta no negocia.</span>
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo. Datos de flujos provienen de fuentes públicas y pueden contener estimaciones.
        </span>
      </PanelEdu>
    </div>
  );
}
