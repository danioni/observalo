"use client";

import {
  AreaChart, Area, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { HISTORIAL_MINERIA } from "@/data/mineria";
import { useMempoolData } from "@/hooks/useMempoolData";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

export default function TabMineria() {
  const { vivo, cargando } = useMempoolData();

  const ult = HISTORIAL_MINERIA[HISTORIAL_MINERIA.length - 1];
  const hashM = vivo?.hashrate || String(ult.hashrate);
  const diffM = vivo?.dificultad || String(ult.dificultad);

  return (
    <div>
      <Concepto titulo="¿Qué mide la minería?">
        La minería es el mecanismo de seguridad de Bitcoin. Los mineros compiten resolviendo problemas matemáticos y validando transacciones, gastando electricidad real a cambio de BTC.
        El <strong style={{ color: "#e0e8f0" }}>hashrate</strong> mide el poder computacional total protegiendo la red — más hashrate = más caro atacarla.
        La <strong style={{ color: "#e0e8f0" }}>dificultad</strong> se ajusta cada ~2 semanas para mantener bloques cada 10 minutos, sin importar cuántos mineros haya.
        Las <strong style={{ color: "#e0e8f0" }}>comisiones</strong> como porcentaje del ingreso minero son clave: garantizan que la red sea sostenible cuando la recompensa por bloque sea marginal.
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <Metrica etiqueta={vivo?.hashrate ? "Hashrate (EN VIVO)" : "Hashrate"} valor={hashM + " EH/s"} sub="Poder computacional de la red" acento="#f0b429" />
        <Metrica etiqueta="Dificultad" valor={diffM + "T"} sub={vivo?.ajuste ? `Último ajuste: ${(vivo.ajuste.diffChange * 100).toFixed(2)}%` : "Ajuste automático cada ~2 semanas"} />
        <Metrica etiqueta="Comisión recomendada" valor={vivo?.comisiones ? vivo.comisiones.halfHourFee + " sat/vB" : "—"} sub={vivo?.comisiones ? `Rápida: ${vivo.comisiones.fastestFee} · Económica: ${vivo.comisiones.economyFee}` : "Datos de mempool.space"} acento="#06b6d4" />
        <Metrica etiqueta="Último bloque" valor={vivo?.bloque ? `#${vivo.bloque.height.toLocaleString("es-CL")}` : "—"} sub={vivo?.bloque ? `${vivo.bloque.tx_count} transacciones · ${(vivo.bloque.size / 1e6).toFixed(2)} MB` : "—"} acento="#a855f7" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Senal etiqueta="HASHRATE" estado="Máximos históricos — seguridad máxima" color="#22c55e" />
        <Senal etiqueta="POST-HALVING" estado="Recompensa: 3,125 BTC por bloque" color="#f0b429" />
        <Senal etiqueta="COMISIONES" estado="Ingreso complementario en crecimiento" color="#06b6d4" />
        {cargando && <Senal etiqueta="DATOS EN VIVO" estado="Cargando desde mempool.space..." color="#8899aa" />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>HASHRATE — EH/s (JUL 2023 — PRESENTE)</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={HISTORIAL_MINERIA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <defs>
                <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0b429" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f0b429" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={3} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} />
              <Tooltip content={({ active, payload, label }) => (
                <CustomTooltip active={active} payload={payload} render={() => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#f0b429", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{payload?.[0]?.value} EH/s</div>
                  </>
                )} />
              )} />
              <Area type="monotone" dataKey="hashrate" stroke="#f0b429" fill="url(#gH)" strokeWidth={2} />
              <ReferenceLine x="abr. 24" stroke="#f0b42950" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>DIFICULTAD — BILLONES</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={HISTORIAL_MINERIA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <defs>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={3} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} />
              <Tooltip content={({ active, payload, label }) => (
                <CustomTooltip active={active} payload={payload} render={() => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{payload?.[0]?.value}T</div>
                  </>
                )} />
              )} />
              <Area type="monotone" dataKey="dificultad" stroke="#06b6d4" fill="url(#gD)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>COMISIONES — % DEL INGRESO MINERO</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={HISTORIAL_MINERIA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={3} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => v + "%"} />
              <Tooltip content={({ active, payload, label }) => (
                <CustomTooltip active={active} payload={payload} render={() => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#a855f7", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{payload?.[0]?.value}% del ingreso</div>
                  </>
                )} />
              )} />
              <Bar dataKey="pctComisiones" fill="#8b5cf6" opacity={0.6} radius={[2, 2, 0, 0]} maxBarSize={10} />
              <Line type="monotone" dataKey="pctComisiones" stroke="#a855f7" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>RECOMPENSA POR BLOQUE — BTC</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={HISTORIAL_MINERIA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
              <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={3} />
              <YAxis tick={{ fill: "#667788", fontSize: 10 }} domain={[0, 7]} />
              <Tooltip content={({ active, payload, label }) => (
                <CustomTooltip active={active} payload={payload} render={() => (
                  <>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#22c55e", fontFamily: "monospace", fontWeight: 600, marginTop: 4 }}>{payload?.[0]?.value} BTC por bloque</div>
                  </>
                )} />
              )} />
              <Area type="stepAfter" dataKey="recompensa" stroke="#22c55e" fill="url(#gR)" strokeWidth={2} />
              <ReferenceLine x="abr. 24" stroke="#f0b42950" strokeDasharray="5 5" label={{ value: "HALVING", fill: "#f0b429", fontSize: 9, position: "top" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <PanelEdu icono="⛏" titulo="Análisis de seguridad y sustentabilidad" color="#f0b429">
        <strong style={{ color: "#e0e8f0" }}>Seguridad:</strong> El hashrate en máximos históricos significa que el costo de atacar la red nunca ha sido más alto. Un ataque del 51% requeriría controlar más de la mitad del poder computacional mundial dedicado a Bitcoin — inversión de miles de millones de dólares sin garantía de éxito.<br /><br />
        <strong style={{ color: "#e0e8f0" }}>Sustentabilidad:</strong> Post-halving 2024, la recompensa se redujo a 3,125 BTC por bloque, pero el hashrate sigue creciendo. Mineros más eficientes reemplazan a los ineficientes — selección natural económica. El incremento gradual de las comisiones valida que la red será sostenible cuando la recompensa por bloque sea marginal.<br /><br />
        <strong style={{ color: "#e0e8f0" }}>Datos en vivo:</strong> El hashrate, la dificultad, las comisiones y el último bloque se obtienen directamente de mempool.space, un explorador de código abierto de la red Bitcoin.
      </PanelEdu>
    </div>
  );
}
