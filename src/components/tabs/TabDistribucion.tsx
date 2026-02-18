"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { DATOS_DISTRIBUCION } from "@/data/distribucion";
import { BANDAS_DIST, COLORES_DIST, NOMBRES_DIST } from "@/data/distribucion-historica";
import { useDistribucionHistorica } from "@/hooks/useDistribucionHistorica";
import { fmt } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint";
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

export default function TabDistribucion() {
  const { isMobile, isDesktop } = useBreakpoint();
  const { datos: datosHist, esReal, cargando, error, stale, reintentar } = useDistribucionHistorica();

  // ── Snapshot estático (sección original) ──
  const totalBTC = DATOS_DISTRIBUCION.reduce((s, d) => s + d.btcRetenido, 0);
  const totalDir = DATOS_DISTRIBUCION.reduce((s, d) => s + d.direcciones, 0);
  const concTop = DATOS_DISTRIBUCION.filter(d => ["Ballena", "Jorobada", "Mega"].includes(d.cohorte)).reduce((s, d) => s + d.pctSupply, 0);
  const partRetail = DATOS_DISTRIBUCION.filter(d => ["Plancton", "Camarón", "Cangrejo"].includes(d.cohorte)).reduce((s, d) => s + d.pctSupply, 0);
  const barras = DATOS_DISTRIBUCION.map(d => ({ ...d, dirLog: Math.log10(Math.max(d.direcciones, 1)) }));

  const chartHeight = isMobile ? 280 : 340;
  const chartLeftMargin = isMobile ? 45 : 75;

  // ── Histórico ──
  const [rango, setRango] = useState("todo");
  const [posSlider, setPosSlider] = useState(-1); // -1 = último

  const filtrado = useMemo(() => {
    if (rango === "todo" || datosHist.length === 0) return datosHist;
    const corte = new Date();
    if (rango === "1a") corte.setFullYear(corte.getFullYear() - 1);
    else if (rango === "2a") corte.setFullYear(corte.getFullYear() - 2);
    else if (rango === "5a") corte.setFullYear(corte.getFullYear() - 5);
    // Estimar el índice de corte basado en meses
    const mesesAtras = rango === "1a" ? 12 : rango === "2a" ? 24 : 60;
    const inicio = Math.max(0, datosHist.length - mesesAtras);
    return datosHist.slice(inicio);
  }, [datosHist, rango]);

  const sliderMax = filtrado.length - 1;
  const sliderVal = posSlider < 0 || posSlider > sliderMax ? sliderMax : posSlider;
  const puntoActual = filtrado[sliderVal];

  // Calcular % normalizados del punto actual para el panel de detalle
  const detalleActual = useMemo(() => {
    if (!puntoActual) return [];
    const total = BANDAS_DIST.reduce((s, b) => s + puntoActual[b], 0);
    if (total === 0) return [];
    return BANDAS_DIST.map((b, i) => ({
      banda: b,
      nombre: NOMBRES_DIST[b],
      btc: puntoActual[b],
      pct: (puntoActual[b] / total) * 100,
      color: COLORES_DIST[i],
    }));
  }, [puntoActual]);

  return (
    <div>
      <Concepto titulo={NARRATIVA.tabs.distribucion.concepto.titulo}>
        {NARRATIVA.tabs.distribucion.concepto.cuerpo}
        <br /><strong style={{ color: "#f0b429" }}>Importante:</strong> una dirección no es una persona. Un exchange puede tener una sola dirección con millones de BTC que representan a miles de usuarios. Las direcciones de los ETF también aparecen como &quot;Mega&quot; pero son vehículos colectivos.
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta="Total de direcciones" valor={fmt(totalDir)} sub="con saldo mayor a 0" />
        <Metrica etiqueta="Oferta rastreada" valor={fmt(totalBTC) + " BTC"} sub="de 19,82M en circulación" />
        <Metrica etiqueta="Concentración grandes" valor={concTop.toFixed(1) + "%"} sub="Ballena + Jorobada + Mega" acento="#f0b429" />
        <Metrica etiqueta="Participación minoristas" valor={partRetail.toFixed(1) + "%"} sub="Plancton + Camarón + Cangrejo" acento="#5a7a8a" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {NARRATIVA.tabs.distribucion.senales.map((s, i) => (
          <Senal key={i} etiqueta={s.etiqueta} estado={s.estado} color={["#22c55e", "#f0b429", "#06b6d4"][i]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, letterSpacing: "0.08em" }}>% DE LA OFERTA POR COHORTE</div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={DATOS_DISTRIBUCION} layout="vertical" margin={{ left: chartLeftMargin, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" horizontal={false} />
              <XAxis type="number" domain={[0, 25]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => v + "%"} />
              <YAxis type="category" dataKey="cohorte" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={isMobile ? 40 : 70} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{d?.cohorte} ({d?.rango})</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{d?.pctSupply?.toFixed(2)}% de la oferta total</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d?.btcRetenido?.toLocaleString("es-CL")} BTC retenidos</div>
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
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, letterSpacing: "0.08em" }}>DIRECCIONES POR COHORTE (ESCALA LOG)</div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={barras} layout="vertical" margin={{ left: chartLeftMargin, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => v <= 0 ? "1" : fmt(Math.pow(10, v))} />
              <YAxis type="category" dataKey="cohorte" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={isMobile ? 40 : 70} />
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{d?.cohorte} ({d?.rango})</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Direcciones: {d?.direcciones?.toLocaleString("es-CL")}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Promedio: {(d?.btcRetenido / d?.direcciones)?.toFixed(4)} BTC/dir.</div>
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

      {/* ── Tabla de detalle (snapshot) ── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, letterSpacing: "0.08em" }}>DETALLE POR COHORTE</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Cohorte", "Rango", "Direcciones", "% Dir.", "BTC retenido", "% oferta", "BTC/Dir."].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-muted)", fontWeight: 500, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATOS_DISTRIBUCION.map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{d.cohorte}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{d.rango}</td>
                  <td style={{ padding: "8px 12px", color: "var(--text-medium)", fontFamily: "monospace" }}>{d.direcciones.toLocaleString("es-CL")}</td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{(d.direcciones / totalDir * 100).toFixed(2)}%</td>
                  <td style={{ padding: "8px 12px", color: "var(--text-medium)", fontFamily: "monospace" }}>{d.btcRetenido.toLocaleString("es-CL")}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: "var(--bg-bar-track)", borderRadius: 2 }}>
                        <div style={{ width: `${Math.min(d.pctSupply / 25 * 100, 100)}%`, height: "100%", background: d.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 600 }}>{d.pctSupply.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{(d.btcRetenido / d.direcciones).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
           SECCIÓN HISTÓRICA — Evolución de distribución por cohorte
         ════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 16, gap: isMobile ? 10 : 0 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em" }}>BTC ACUMULADO POR COHORTE (2020–2026)</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Btn
              items={[
                { id: "1a", l: "1A" }, { id: "2a", l: "2A" },
                { id: "5a", l: "5A" }, { id: "todo", l: "TODO" },
              ]}
              val={rango}
              set={(v) => { setRango(v); setPosSlider(-1); }}
              color="#f0b429"
            />
          </div>
        </div>

        {/* Estado de carga / error / fuente */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {cargando && <Senal etiqueta="DATOS" estado="Cargando datos reales..." color="var(--text-secondary)" />}
          {error && !cargando && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Senal etiqueta="ERROR" estado={error} color="#ef4444" />
              <button onClick={reintentar} style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", color: "#f0b429", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Reintentar</button>
            </div>
          )}
          {!cargando && !error && <Senal etiqueta="FUENTE" estado={esReal ? "bitcoin-data.com (datos reales)" : "Datos simulados (fallback)"} color={esReal ? "#f0b429" : "var(--text-muted)"} />}
          {stale && (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
              desactualizado
            </span>
          )}
        </div>

        {/* Chart de áreas apiladas (valores absolutos BTC) */}
        {filtrado.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={isMobile ? 320 : 420}>
              <AreaChart data={filtrado} margin={{ top: 10, right: 20, bottom: isMobile ? 12 : 20, left: isMobile ? 10 : 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
                <XAxis dataKey="fecha" tick={{ fill: "var(--text-muted)", fontSize: 9 }} interval={Math.max(1, Math.floor(filtrado.length / (isMobile ? 6 : 10)))} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => fmt(v)} width={isMobile ? 45 : 55} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: "var(--tooltip-bg)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "10px 14px", backdropFilter: "blur(12px)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-tooltip)", marginBottom: 6 }}>{label}</div>
                      {payload.slice().reverse().map((p, i) => (
                        <div key={i} style={{ fontSize: 11, display: "flex", gap: 6, alignItems: "center" }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.color }} />
                          <span style={{ color: "var(--text-secondary)", width: 90 }}>{NOMBRES_DIST[p.name as string] || p.name}</span>
                          <span style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>
                            {typeof p.value === "number" ? fmt(p.value) : p.value} BTC
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }} />
                {BANDAS_DIST.map((b, i) => (
                  <Area key={b} type="monotone" dataKey={b} stackId="1" fill={COLORES_DIST[i]} stroke="none" fillOpacity={0.85} name={b} />
                ))}
                {puntoActual && (
                  <ReferenceLine x={puntoActual.fecha} stroke="#f0b42980" strokeDasharray="5 5" />
                )}
              </AreaChart>
            </ResponsiveContainer>

            {/* Slider temporal */}
            <div style={{ margin: "12px 0 8px", padding: "0 20px" }}>
              <input
                type="range"
                min={0}
                max={sliderMax}
                value={sliderVal}
                onChange={(e) => setPosSlider(Number(e.target.value))}
                style={{
                  width: "100%", cursor: "pointer",
                  accentColor: "#f0b429",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                <span>{filtrado[0]?.fecha}</span>
                <span style={{ color: "#f0b429", fontWeight: 600, fontSize: 11 }}>
                  {puntoActual?.fecha ?? "—"}
                </span>
                <span>{filtrado[sliderMax]?.fecha}</span>
              </div>
            </div>

            {/* Panel de detalle del punto seleccionado */}
            {detalleActual.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                gap: 8, marginTop: 12,
                background: "var(--bg-surface)", borderRadius: 8,
                border: "1px solid var(--border-subtle)", padding: 12,
              }}>
                {detalleActual.map((d) => (
                  <div key={d.banda} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 600 }}>
                        {d.pct.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                        {fmt(Math.round(d.btc))} BTC
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leyenda */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              {BANDAS_DIST.map((b, i) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORES_DIST[i] }} />
                  <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{NOMBRES_DIST[b]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Estado vacío mientras carga */}
        {filtrado.length === 0 && cargando && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>◈</div>
              Cargando datos históricos de distribución...
            </div>
          </div>
        )}
      </div>

      <PanelEdu icono={NARRATIVA.tabs.distribucion.panelEdu.icono} titulo={NARRATIVA.tabs.distribucion.panelEdu.titulo} color={NARRATIVA.tabs.distribucion.panelEdu.color}>
        Las mega-direcciones pierden peso. Las cohortes medianas y pequeñas ganan. No es un trimestre — es una tendencia de más de una década.
        <br /><br />
        Una dirección no es una persona. Un exchange puede tener millones de usuarios detrás de una sola dirección. Pero lo inverso es más revelador: cada nueva billetera pequeña con saldo sí representa una decisión individual de acumular.
        <br /><br />
        En ningún otro sistema monetario puedes verificar públicamente la distribución de la propiedad. En el dinero tradicional, los balances son privados y las reglas cambian sin aviso.
        <br /><br />
        Pero tener Bitcoin es una cosa. No venderlo es otra. La siguiente sección muestra quién decidió retener — incluso durante los peores crashes.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>{NARRATIVA.tabs.distribucion.panelEdu.cierre}</strong>
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo.
        </span>
      </PanelEdu>
    </div>
  );
}
