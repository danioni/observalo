"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { DATOS_DISTRIBUCION } from "@/data/distribucion";
import { fmt } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { NARRATIVA } from "@/data/narrativa";

export default function TabDistribucion() {
  const { isMobile, isDesktop } = useBreakpoint();

  const totalBTC = DATOS_DISTRIBUCION.reduce((s, d) => s + d.btcRetenido, 0);
  const totalDir = DATOS_DISTRIBUCION.reduce((s, d) => s + d.direcciones, 0);
  const concTop = DATOS_DISTRIBUCION.filter(d => ["Ballena", "Jorobada", "Mega"].includes(d.cohorte)).reduce((s, d) => s + d.pctSupply, 0);
  const partRetail = DATOS_DISTRIBUCION.filter(d => ["Plancton", "Camarón", "Cangrejo"].includes(d.cohorte)).reduce((s, d) => s + d.pctSupply, 0);
  const barras = DATOS_DISTRIBUCION.map(d => ({ ...d, dirLog: Math.log10(Math.max(d.direcciones, 1)) }));

  const chartHeight = isMobile ? 280 : 340;
  const chartLeftMargin = isMobile ? 45 : 75;

  return (
    <div>
      <Concepto titulo="¿De quién es realmente la red?">
        El dinero tradicional no publica quién tiene cuánto. Bitcoin sí. Cada dirección tiene un saldo público, verificable, en tiempo real. Al clasificarlas por tamaño — desde las más pequeñas hasta las ballenas — se revela un patrón que se repite ciclo tras ciclo: las cohortes pequeñas y medianas crecen, las mega-direcciones se comprimen. En un sistema donde nadie coordina la distribución, la propiedad se dispersa por millones de decisiones individuales. En Soberanía viste cuánto BTC queda disponible. Aquí ves cómo se reparte.
        <br /><strong style={{ color: "#f0b429" }}>Importante:</strong> una dirección no es una persona. Un exchange puede tener una sola dirección con millones de BTC que representan a miles de usuarios. Las direcciones de los ETF también aparecen como &quot;Mega&quot; pero son vehículos colectivos.
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta="Total de direcciones" valor={fmt(totalDir)} sub="con saldo mayor a 0" />
        <Metrica etiqueta="Oferta rastreada" valor={fmt(totalBTC) + " BTC"} sub="de 19,82M en circulación" />
        <Metrica etiqueta="Concentración grandes" valor={concTop.toFixed(1) + "%"} sub="Ballena + Jorobada + Mega" acento="#f0b429" />
        <Metrica etiqueta="Participación minoristas" valor={partRetail.toFixed(1) + "%"} sub="Plancton + Camarón + Cangrejo" acento="#5a7a8a" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Senal etiqueta="DISTRIBUCIÓN" estado="La propiedad se dispersa — sin que nadie lo ordene" color="#22c55e" />
        <Senal etiqueta="GRANDES TENEDORES" estado="Las ballenas pesan menos ciclo tras ciclo" color="#f0b429" />
        <Senal etiqueta="MINORISTAS" estado="Más billeteras individuales que nunca" color="#06b6d4" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>% DE LA OFERTA POR COHORTE</div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={DATOS_DISTRIBUCION} layout="vertical" margin={{ left: chartLeftMargin, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" horizontal={false} />
              <XAxis type="number" domain={[0, 25]} tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => v + "%"} />
              <YAxis type="category" dataKey="cohorte" tick={{ fill: "#8899aa", fontSize: 11 }} width={isMobile ? 40 : 70} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 13, color: "#e0e8f0", fontWeight: 600 }}>{d?.cohorte} ({d?.rango})</div>
                    <div style={{ fontSize: 12, color: "#8899aa", marginTop: 4 }}>{d?.pctSupply?.toFixed(2)}% de la oferta total</div>
                    <div style={{ fontSize: 12, color: "#8899aa" }}>{d?.btcRetenido?.toLocaleString("es-CL")} BTC retenidos</div>
                  </>
                )} />
              )} />
              <Bar dataKey="pctSupply" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {DATOS_DISTRIBUCION.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>DIRECCIONES POR COHORTE (ESCALA LOG)</div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={barras} layout="vertical" margin={{ left: chartLeftMargin, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => v <= 0 ? "1" : fmt(Math.pow(10, v))} />
              <YAxis type="category" dataKey="cohorte" tick={{ fill: "#8899aa", fontSize: 11 }} width={isMobile ? 40 : 70} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 13, color: "#e0e8f0", fontWeight: 600 }}>{d?.cohorte} ({d?.rango})</div>
                    <div style={{ fontSize: 12, color: "#8899aa", marginTop: 4 }}>Direcciones: {d?.direcciones?.toLocaleString("es-CL")}</div>
                    <div style={{ fontSize: 12, color: "#8899aa" }}>Promedio: {(d?.btcRetenido / d?.direcciones)?.toFixed(4)} BTC/dir.</div>
                  </>
                )} />
              )} />
              <Bar dataKey="dirLog" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {barras.map((d, i) => <Cell key={i} fill={d.color} opacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>DETALLE POR COHORTE</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #21262d" }}>
                {["Cohorte", "Rango", "Direcciones", "% Dir.", "BTC retenido", "% oferta", "BTC/Dir."].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#667788", fontWeight: 500, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATOS_DISTRIBUCION.map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #161b22" }}>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span style={{ color: "#e0e8f0", fontWeight: 600 }}>{d.cohorte}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#8899aa", fontFamily: "monospace" }}>{d.rango}</td>
                  <td style={{ padding: "8px 12px", color: "#c0c8d0", fontFamily: "monospace" }}>{d.direcciones.toLocaleString("es-CL")}</td>
                  <td style={{ padding: "8px 12px", color: "#8899aa", fontFamily: "monospace" }}>{(d.direcciones / totalDir * 100).toFixed(2)}%</td>
                  <td style={{ padding: "8px 12px", color: "#c0c8d0", fontFamily: "monospace" }}>{d.btcRetenido.toLocaleString("es-CL")}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: "#161b22", borderRadius: 2 }}>
                        <div style={{ width: `${Math.min(d.pctSupply / 25 * 100, 100)}%`, height: "100%", background: d.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ color: "#e0e8f0", fontFamily: "monospace", fontWeight: 600 }}>{d.pctSupply.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#8899aa", fontFamily: "monospace" }}>{(d.btcRetenido / d.direcciones).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PanelEdu icono="◆" titulo="Lo que la distribución revela" color="#06b6d4">
        Las mega-direcciones pierden peso. Las cohortes medianas y pequeñas ganan. No es un trimestre — es una tendencia de más de una década. Los exchanges acumulan menos, los ETF redistribuyen propiedad fraccional, y millones de billeteras individuales suman fracciones que, en conjunto, desplazan a los grandes tenedores.
        <br /><br />
        Una dirección no es una persona — un exchange puede tener millones de usuarios detrás de una sola dirección. Pero la dirección inversa es más reveladora: cada nueva billetera pequeña con saldo sí es una decisión individual.
        <br /><br />
        En ningún otro sistema monetario se puede verificar públicamente quién tiene cuánto. En el dinero tradicional, los balances son privados, las reglas cambian sin aviso, y la distribución es opaca por diseño.
        <br /><br />
        <strong style={{ color: "#e0e8f0" }}>Aquí, las decisiones se acumulan bloque a bloque — sin que nadie las coordine, sin que nadie las pueda revertir.</strong>
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo.
        </span>
      </PanelEdu>
    </div>
  );
}
