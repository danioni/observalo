"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { DATOS_ONDAS, COLORES_ONDAS, BANDAS, NOMBRES_BANDAS } from "@/data/ondas";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";

export default function TabOndas() {
  const u = DATOS_ONDAS[DATOS_ONDAS.length - 1];
  const corto = (u["<1m"] + u["1-3m"] + u["3-6m"]).toFixed(1);
  const largo = (u["3-5a"] + u["5-7a"] + u["7-10a"] + u["10a+"]).toFixed(1);
  const acero = (u["5-7a"] + u["7-10a"] + u["10a+"]).toFixed(1);

  return (
    <div>
      <Concepto titulo="¿Qué son las Ondas HODL?">
        Cada Bitcoin gastable (llamado UTXO) tiene un registro de cuándo fue movido por última vez.
        Las &quot;Ondas&quot; agrupan todos los BTC según su <strong style={{ color: "#e0e8f0" }}>antigüedad</strong> — cuánto tiempo llevan sin moverse.
        Cuando las bandas frías (azul/morado) crecen, más personas retienen a largo plazo.
        Cuando las bandas calientes (rojo/naranja) crecen, hay distribución y ventas activas.
        Es el indicador más directo de <strong style={{ color: "#e0e8f0" }}>convicción colectiva</strong> en la red.
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <Metrica etiqueta="Tenedores a corto plazo" valor={corto + "%"} sub="menos de 6 meses" acento="#ef4444" />
        <Metrica etiqueta="Tenedores a medio plazo" valor={(100 - parseFloat(corto) - parseFloat(largo)).toFixed(1) + "%"} sub="6 meses a 3 años" acento="#eab308" />
        <Metrica etiqueta="Tenedores a largo plazo" valor={largo + "%"} sub="más de 3 años" acento="#22c55e" />
        <Metrica etiqueta="Manos de acero" valor={acero + "%"} sub="más de 5 años — nunca vendieron" acento="#a855f7" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Senal etiqueta="CONVICCIÓN" estado="Máximos históricos en tenedores de largo plazo" color="#22c55e" />
        <Senal etiqueta="FASE DEL CICLO" estado="Acumulación post-halving" color="#06b6d4" />
      </div>

      <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>DISTRIBUCIÓN DE ANTIGÜEDAD DE UTXO (2020–2026)</div>
      <ResponsiveContainer width="100%" height={420}>
        <AreaChart data={DATOS_ONDAS} margin={{ top: 10, right: 20, bottom: 20, left: 20 }} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
          <XAxis dataKey="fecha" tick={{ fill: "#667788", fontSize: 9 }} interval={6} angle={-30} textAnchor="end" />
          <YAxis tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => (v * 100).toFixed(0) + "%"} />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div style={{ background: "#0d1117ee", border: "1px solid #21262d", borderRadius: 8, padding: "10px 14px", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6 }}>{label}</div>
                {payload.slice().reverse().map((p, i) => (
                  <div key={i} style={{ fontSize: 11, display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.color }} />
                    <span style={{ color: "#8899aa", width: 60 }}>{NOMBRES_BANDAS[p.name as string] || p.name}</span>
                    <span style={{ color: "#e0e8f0", fontFamily: "monospace" }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%</span>
                  </div>
                ))}
              </div>
            );
          }} />
          {BANDAS.map((b, i) => (
            <Area key={b} type="monotone" dataKey={b} stackId="1" fill={COLORES_ONDAS[i]} stroke="none" fillOpacity={0.85} name={b} />
          ))}
          <ReferenceLine x="abr. 24" stroke="#f0b42960" strokeDasharray="5 5" label={{ value: "HALVING", fill: "#f0b429", fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        {BANDAS.map((b, i) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORES_ONDAS[i] }} />
            <span style={{ fontSize: 10, color: "#8899aa" }}>{NOMBRES_BANDAS[b]}</span>
          </div>
        ))}
      </div>

      <PanelEdu icono="◈" titulo="Patrones clave en las Ondas" color="#a855f7">
        <strong style={{ color: "#ef4444" }}>Bandas calientes (rojo/naranja — menos de 6 meses):</strong> Se expanden en picos de mercado cuando nuevos compradores entran y tenedores antiguos distribuyen. Cuando se comprimen, el BTC recién comprado no se está vendiendo — señal de acumulación.<br /><br />
        <strong style={{ color: "#3b82f6" }}>Bandas frías (azul/morado — más de 3 años):</strong> Representan BTC que ha sobrevivido al menos un ciclo completo sin moverse. Su expansión constante es la evidencia más fuerte de convicción. El Bitcoin que entra en estas bandas rara vez sale.<br /><br />
        <strong style={{ color: "#f0b429" }}>Post-halving 2024:</strong> El patrón muestra compresión de bandas calientes y expansión de frías — consistente con acumulación institucional y minorista. Históricamente, los 12-18 meses después de cada halving han sido los períodos más explosivos en precio.
      </PanelEdu>
    </div>
  );
}
