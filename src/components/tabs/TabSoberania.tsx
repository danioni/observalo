"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fmt } from "@/utils/format";
import {
  BTC_CAP, BTC_SOBERANO, BTC_CIRCULANTE, BTC_PERDIDO,
  BTC_ETFS, BTC_TREASURIES, BTC_EXCHANGES, BTC_GOBIERNOS,
  BTC_INSTITUCIONAL, BLOQUES_SUPPLY, EMBUDO,
  ADULTOS_MUNDIAL,
} from "@/data/soberania";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

const pct = (n: number, total: number = BTC_CAP) => (n / total * 100).toFixed(1);
const btcPorAdulto = BTC_SOBERANO / ADULTOS_MUNDIAL;

export default function TabSoberania() {
  // Datos para stacked bar (un solo registro con todos los bloques)
  const stackData = [
    BLOQUES_SUPPLY.reduce((obj, b) => {
      obj[b.nombre] = b.btc;
      return obj;
    }, { name: "Oferta 21M" } as Record<string, number | string>),
  ];

  return (
    <div>
      <Concepto titulo="El sistema monetario basado en reglas">
        Bitcoin es el primer dinero de la historia con una oferta fija e inmutable: exactamente 21 millones de unidades, sin excepciones, sin rescates, sin impresión.
        Pero no todos están disponibles. De esos 21 millones, hay que descontar lo que se perdió para siempre, lo que aún no se minó, y lo que ya acumularon instituciones, gobiernos y exchanges.
        <br /><strong style={{ color: "#22c55e" }}>¿Cuánto queda para quienes eligen la soberanía financiera?</strong>
      </Concepto>

      {/* Métricas principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <Metrica
          etiqueta="Oferta soberana"
          valor={fmt(BTC_SOBERANO) + " BTC"}
          sub={`${pct(BTC_SOBERANO)}% de los 21M`}
          acento="#22c55e"
        />
        <Metrica
          etiqueta="BTC por adulto"
          valor={btcPorAdulto.toFixed(6) + " BTC"}
          sub={`Si se repartiera entre ${fmt(ADULTOS_MUNDIAL)} adultos`}
        />
        <Metrica
          etiqueta="Bloqueado institucional"
          valor={fmt(BTC_INSTITUCIONAL + BTC_EXCHANGES + BTC_GOBIERNOS) + " BTC"}
          sub={`${pct(BTC_INSTITUCIONAL + BTC_EXCHANGES + BTC_GOBIERNOS)}% del cap`}
          acento="#818cf8"
        />
        <Metrica
          etiqueta="Inaccesible"
          valor={fmt(BTC_PERDIDO + (BTC_CAP - BTC_CIRCULANTE)) + " BTC"}
          sub="Perdido + no minado"
          acento="#3d4450"
        />
      </div>

      {/* Señales */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Senal etiqueta="OFERTA SOBERANA" estado={`${pct(BTC_SOBERANO)}% disponible para autocustodia`} color="#22c55e" />
        <Senal etiqueta="PRESIÓN INSTITUCIONAL" estado={`ETFs + treasuries: ${fmt(BTC_ETFS + BTC_TREASURIES)} BTC acumulados`} color="#818cf8" />
        <Senal etiqueta="ESCASEZ" estado={`Solo ${btcPorAdulto.toFixed(4)} BTC por adulto en el planeta`} color="#f0b429" />
      </div>

      {/* Stacked horizontal bar — Desglose completo de 21M */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>
          DESGLOSE DE LOS 21 MILLONES DE BTC
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={stackData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, BTC_CAP]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(_d, pl) => (
                <div>
                  {(pl as readonly { name: string; value: number; color: string }[])?.map((entry, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#e0e8f0" }}>{entry.name}:</span>
                      <span style={{ fontSize: 11, color: "#8899aa", fontFamily: "monospace" }}>{entry.value?.toLocaleString("es-CL")} BTC</span>
                    </div>
                  ))}
                </div>
              )} />
            )} />
            {BLOQUES_SUPPLY.map((b) => (
              <Bar key={b.nombre} dataKey={b.nombre} stackId="supply" fill={b.color} radius={0} />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda del stacked bar */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
          {BLOQUES_SUPPLY.map((b) => (
            <div key={b.nombre} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8899aa" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
              <span style={{ color: b.categoria === "soberano" ? "#22c55e" : "#8899aa", fontWeight: b.categoria === "soberano" ? 700 : 400 }}>
                {b.nombre}
              </span>
              <span style={{ fontFamily: "monospace", color: "#667788" }}>{pct(b.btc)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Embudo de escasez */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 16, letterSpacing: "0.08em" }}>
          EMBUDO DE ESCASEZ — DE 21M A LA OFERTA SOBERANA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {EMBUDO.map((paso, i) => {
            const ancho = (paso.btc / BTC_CAP) * 100;
            const esUltimo = i === EMBUDO.length - 1;
            return (
              <div key={i}>
                {/* Resta (entre pasos) */}
                {i > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "4px 0 4px 20px", fontSize: 11,
                  }}>
                    <span style={{ color: paso.color, fontWeight: 600 }}>−</span>
                    <span style={{ color: "#667788" }}>{EMBUDO[i].etiqueta}</span>
                    <span style={{ color: paso.color, fontFamily: "monospace", fontWeight: 600 }}>
                      −{fmt(paso.resta)} BTC
                    </span>
                  </div>
                )}
                {/* Barra */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    height: esUltimo ? 40 : 28,
                    width: `${Math.max(ancho, 8)}%`,
                    background: esUltimo
                      ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                      : `linear-gradient(90deg, ${i === 0 ? "#334155" : "#1e293b"} 0%, ${i === 0 ? "#1e293b" : "#0f172a"} 100%)`,
                    borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: esUltimo ? "1px solid #22c55e44" : "1px solid #1e293b",
                    boxShadow: esUltimo ? "0 0 20px rgba(34,197,94,0.15)" : "none",
                    transition: "all 0.3s ease",
                  }}>
                    <span style={{
                      fontSize: esUltimo ? 14 : 12,
                      fontWeight: 700,
                      color: esUltimo ? "#fff" : "#94a3b8",
                      fontFamily: "'JetBrains Mono',monospace",
                      letterSpacing: "-0.01em",
                    }}>
                      {paso.btc.toLocaleString("es-CL")} BTC
                    </span>
                  </div>
                  <span style={{
                    fontSize: esUltimo ? 12 : 10,
                    color: esUltimo ? "#22c55e" : "#667788",
                    fontWeight: esUltimo ? 700 : 400,
                    whiteSpace: "nowrap",
                  }}>
                    {i === 0 ? "Cap máximo" : esUltimo ? "⚡ OFERTA SOBERANA" : `${pct(paso.btc)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dato potente */}
      <div style={{
        padding: 20, borderRadius: 10, marginBottom: 28,
        background: "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 100%)",
        border: "1px solid rgba(34,197,94,0.15)",
      }}>
        <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>
          ⚡ La matemática de la escasez
        </div>
        <div style={{ fontSize: 12, color: "#c0c8d0", lineHeight: 1.7 }}>
          Si cada adulto del planeta (~{fmt(ADULTOS_MUNDIAL)}) quisiera Bitcoin, solo hay <strong style={{ color: "#22c55e" }}>{fmt(BTC_SOBERANO)}</strong> disponibles en autocustodia.
          Eso es <strong style={{ color: "#f0b429" }}>{btcPorAdulto.toFixed(6)} BTC</strong> por persona — menos de <strong style={{ color: "#f0b429" }}>{Math.round(btcPorAdulto * 1e8).toLocaleString("es-CL")} satoshis</strong>.
          <br /><br />
          Y cada día, las instituciones acumulan más. Los ETFs al contado ya controlan <strong style={{ color: "#818cf8" }}>{fmt(BTC_ETFS)} BTC</strong>.
          Las treasuries corporativas suman <strong style={{ color: "#f0b429" }}>{fmt(BTC_TREASURIES)} BTC</strong>.
          La oferta soberana se reduce con cada compra institucional.
          <br /><br />
          <span style={{ color: "#22c55e", fontWeight: 600 }}>
            Acumular Bitcoin hoy es asegurarse un lugar en el sistema monetario del futuro.
          </span>
        </div>
      </div>

      <PanelEdu icono="⚡" titulo="Soberanía financiera" color="#22c55e">
        <strong style={{ color: "#22c55e" }}>Autocustodia</strong> significa que tú — y solo tú — controlas tus llaves privadas.
        Bitcoin es el único activo monetario en la historia que permite soberanía total sin intermediarios: no necesita un banco, un gobierno, ni una empresa para funcionar.
        <br /><br />
        Cuando compras Bitcoin en un exchange pero no lo retiras, tu BTC forma parte de las reservas del exchange — no eres soberano aún.
        La verdadera soberanía financiera comienza cuando mueves tus satoshis a tu propia billetera.
        <br /><br />
        <strong style={{ color: "#e0e8f0" }}>21 millones. Sin excepciones. Sin rescates. Reglas, no gobernantes.</strong>
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo. Datos basados en estimaciones públicas y pueden variar según la fuente.
        </span>
      </PanelEdu>
    </div>
  );
}
