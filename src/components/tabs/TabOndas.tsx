"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { COLORES_ONDAS, BANDAS, NOMBRES_BANDAS } from "@/data/ondas";
import { useOndasData } from "@/hooks/useOndasData";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { NARRATIVA } from "@/data/narrativa";

export default function TabOndas() {
  const { datos: DATOS_ONDAS, esReal, cargando } = useOndasData();
  const { isMobile, isDesktop } = useBreakpoint();

  if (cargando && DATOS_ONDAS.length === 0) {
    return (
      <div>
        <Concepto titulo={NARRATIVA.tabs.ondas.concepto.titulo}>
          {NARRATIVA.tabs.ondas.concepto.cuerpo}
        </Concepto>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#667788", fontSize: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>◈</div>
            Cargando datos reales de ondas HODL desde bitcoin-data.com...
          </div>
        </div>
      </div>
    );
  }

  const u = DATOS_ONDAS[DATOS_ONDAS.length - 1];
  if (!u) return null;
  const corto = (u["<1m"] + u["1-3m"] + u["3-6m"]).toFixed(1);
  const largo = (u["3-5a"] + u["5-7a"] + u["7-10a"] + u["10a+"]).toFixed(1);
  const acero = (u["5-7a"] + u["7-10a"] + u["10a+"]).toFixed(1);

  return (
    <div>
      <Concepto titulo={NARRATIVA.tabs.ondas.concepto.titulo}>
        {NARRATIVA.tabs.ondas.concepto.cuerpo}
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta="Tenedores a corto plazo" valor={corto + "%"} sub="menos de 6 meses" acento="#ef4444" />
        <Metrica etiqueta="Tenedores a medio plazo" valor={(100 - parseFloat(corto) - parseFloat(largo)).toFixed(1) + "%"} sub="6 meses a 3 años" acento="#eab308" />
        <Metrica etiqueta="Tenedores a largo plazo" valor={largo + "%"} sub="más de 3 años" acento="#22c55e" />
        <Metrica etiqueta="Manos de acero" valor={acero + "%"} sub="más de 5 años — nunca vendieron" acento="#a855f7" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {NARRATIVA.tabs.ondas.senales.map((s, i) => (
          <Senal key={i} etiqueta={s.etiqueta} estado={s.estado} color={["#22c55e", "#06b6d4"][i]} />
        ))}
        {cargando && <Senal etiqueta="DATOS" estado="Cargando datos reales..." color="#8899aa" />}
        {!cargando && <Senal etiqueta="FUENTE" estado={esReal ? "bitcoin-data.com (datos reales)" : "Datos simulados (fallback)"} color={esReal ? "#f0b429" : "#667788"} />}
      </div>

      <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>DISTRIBUCIÓN DE ANTIGÜEDAD DE UTXO (2020–2026)</div>
      <ResponsiveContainer width="100%" height={isMobile ? 320 : 420}>
        <AreaChart data={DATOS_ONDAS} margin={{ top: 10, right: 20, bottom: isMobile ? 12 : 20, left: 20 }} stackOffset="expand">
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

      <PanelEdu icono={NARRATIVA.tabs.ondas.panelEdu.icono} titulo={NARRATIVA.tabs.ondas.panelEdu.titulo} color={NARRATIVA.tabs.ondas.panelEdu.color}>
        <strong style={{ color: "#ef4444" }}>Bandas calientes (menos de 6 meses):</strong> Cuando se expanden, hay dinero nuevo entrando — compradores recientes. Cuando se comprimen, nadie está vendiendo lo que acaba de comprar.<br /><br />
        <strong style={{ color: "#3b82f6" }}>Bandas frías (más de 3 años):</strong> Capital que sobrevivió caídas del 80%, la quiebra de FTX, el pánico de Luna/UST — y no se movió. Estas bandas crecen con cada ciclo. Nunca se han contraído de forma sostenida.<br /><br />
        En los mercados tradicionales, los crashes generan capitulación masiva. En Bitcoin, cada crash deja una base más grande de personas que deciden no vender.
        <br /><br />
        Pero retener no es lo mismo que retirar. La siguiente sección muestra hacia dónde se mueve físicamente el Bitcoin — y de dónde está saliendo.
        <br /><br />
        <strong style={{ color: "#e0e8f0" }}>{NARRATIVA.tabs.ondas.panelEdu.cierre}</strong>
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo.
        </span>
      </PanelEdu>
    </div>
  );
}
