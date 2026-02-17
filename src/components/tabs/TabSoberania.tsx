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
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { NARRATIVA } from "@/data/narrativa";

const pct = (n: number, total: number = BTC_CAP) => (n / total * 100).toFixed(1);
const btcPorAdulto = BTC_SOBERANO / ADULTOS_MUNDIAL;

export default function TabSoberania() {
  const { isMobile, isDesktop } = useBreakpoint();

  // Datos para stacked bar (un solo registro con todos los bloques)
  const stackData = [
    BLOQUES_SUPPLY.reduce((obj, b) => {
      obj[b.nombre] = b.btc;
      return obj;
    }, { name: "Oferta 21M" } as Record<string, number | string>),
  ];

  return (
    <div>
      <Concepto titulo={NARRATIVA.tabs.soberania.concepto.titulo}>
        {NARRATIVA.tabs.soberania.concepto.cuerpo}
      </Concepto>

      {/* Métricas principales */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
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
          acento="var(--text-ghost)"
        />
      </div>

      {/* Señales */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {NARRATIVA.tabs.soberania.senales.map((s, i) => (
          <Senal key={i} etiqueta={s.etiqueta} estado={s.estado} color={["#22c55e", "#818cf8", "#f0b429"][i]} />
        ))}
      </div>

      {/* Stacked horizontal bar — Desglose completo de 21M */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, letterSpacing: "0.08em" }}>
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
                      <span style={{ fontSize: 11, color: "var(--text-primary)" }}>{entry.name}:</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace" }}>{entry.value?.toLocaleString("es-CL")} BTC</span>
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
            <div key={b.nombre} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-secondary)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
              <span style={{ color: b.categoria === "soberano" ? "#22c55e" : "var(--text-secondary)", fontWeight: b.categoria === "soberano" ? 700 : 400 }}>
                {b.nombre}
              </span>
              <span style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{pct(b.btc)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Embudo de escasez */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, letterSpacing: "0.08em" }}>
          EMBUDO DE ESCASEZ — DE 21M A LA OFERTA SOBERANA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {EMBUDO.map((paso, i) => {
            // Proporcional real (btc/21M * 100%)
            const ancho = (paso.btc / BTC_CAP) * 100;
            const esUltimo = i === EMBUDO.length - 1;
            return (
              <div key={i}>
                {/* Resta (entre pasos) */}
                {i > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: isMobile ? 6 : 12,
                    padding: isMobile ? "3px 0 3px 8px" : "4px 0 4px 20px", fontSize: isMobile ? 9 : 11,
                  }}>
                    <span style={{ color: paso.color, fontWeight: 600 }}>−</span>
                    <span style={{ color: "var(--text-muted)" }}>{EMBUDO[i].etiqueta}</span>
                    <span style={{ color: paso.color, fontFamily: "monospace", fontWeight: 600 }}>
                      −{fmt(paso.resta)} BTC
                    </span>
                  </div>
                )}
                {/* Barra + label al lado */}
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
                  <div style={{
                    height: esUltimo ? (isMobile ? 36 : 40) : (isMobile ? 26 : 28),
                    width: `${Math.max(ancho, 20)}%`,
                    flexShrink: 0,
                    background: esUltimo
                      ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                      : `linear-gradient(90deg, ${i === 0 ? "var(--bg-embudo)" : "var(--bg-embudo-mid)"} 0%, ${i === 0 ? "var(--bg-embudo-mid)" : "var(--bg-embudo-deep)"} 100%)`,
                    borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 8px",
                    border: esUltimo ? "1px solid #22c55e44" : "1px solid var(--border-embudo)",
                    boxShadow: esUltimo ? "0 0 20px rgba(34,197,94,0.15)" : "none",
                    transition: "all 0.3s ease",
                  }}>
                    <span style={{
                      fontSize: esUltimo ? (isMobile ? 11 : 14) : (isMobile ? 9 : 12),
                      fontWeight: 700,
                      color: esUltimo ? "#fff" : "var(--text-embudo)",
                      fontFamily: "'JetBrains Mono',monospace",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                    }}>
                      {isMobile ? fmt(paso.btc) : paso.btc.toLocaleString("es-CL")} BTC
                    </span>
                  </div>
                  <span style={{
                    fontSize: esUltimo ? (isMobile ? 10 : 12) : (isMobile ? 9 : 10),
                    color: esUltimo ? "#22c55e" : "var(--text-muted)",
                    fontWeight: esUltimo ? 700 : 400,
                    whiteSpace: "nowrap",
                  }}>
                    {i === 0 ? "Cap máximo" : esUltimo ? `⚡ OFERTA SOBERANA · ${pct(paso.btc)}%` : `${pct(paso.btc)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dato potente */}
      <div style={{
        padding: isMobile ? 14 : 20, borderRadius: 10, marginBottom: 28,
        background: "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 100%)",
        border: "1px solid rgba(34,197,94,0.15)",
      }}>
        <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>
          📐 La cuenta final
        </div>
        <div style={{ fontSize: 12, color: "var(--text-medium)", lineHeight: 1.7 }}>
          Si cada adulto del planeta (~{fmt(ADULTOS_MUNDIAL)}) quisiera Bitcoin, solo hay <strong style={{ color: "#22c55e" }}>{fmt(BTC_SOBERANO)}</strong> disponibles en autocustodia.
          Eso es <strong style={{ color: "#f0b429" }}>{btcPorAdulto.toFixed(6)} BTC</strong> por persona — menos de <strong style={{ color: "#f0b429" }}>{Math.round(btcPorAdulto * 1e8).toLocaleString("es-CL")} satoshis</strong>.
          <br /><br />
          Y cada día, las instituciones acumulan más. Los ETFs al contado ya controlan <strong style={{ color: "#818cf8" }}>{fmt(BTC_ETFS)} BTC</strong>.
          Las treasuries corporativas suman <strong style={{ color: "#f0b429" }}>{fmt(BTC_TREASURIES)} BTC</strong>.
          La oferta soberana se reduce con cada compra institucional.
          <br /><br />
          <span style={{ color: "#22c55e", fontWeight: 600 }}>
            No es una opinión — es aritmética verificable en cada bloque que se mina.
          </span>
        </div>
      </div>

      <PanelEdu icono="🔑" titulo="Autocustodia: la diferencia entre poseer y que te deban" color="#f0b429">
        Has recorrido todo el observatorio. Viste las reglas, la distribución, la convicción, los flujos, la acumulación. Todo converge en una decisión: ¿quién custodia tu Bitcoin? Cuando está en un exchange o un ETF, lo que tienes es una promesa — un número en la base de datos de otro.
        <br /><br />
        <strong style={{ color: "#f0b429" }}>Autocustodia</strong> cambia esa ecuación. Significa que tú controlas las llaves criptográficas, y nadie más puede mover tus fondos — ni un banco, ni un gobierno, ni un exchange. Es la diferencia entre poseer y que te deban.
        <br /><br />
        Cada Bitcoin que sale de un exchange hacia una billetera personal es un voto por la soberanía financiera. Y cada uno que entra a un ETF o treasury corporativa es oferta que deja de estar disponible para individuos.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>21 millones es el límite. Los datos están aquí para que decidas con información, no con fe.</strong>
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo.
        </span>
      </PanelEdu>
    </div>
  );
}
