"use client";

import { useState, useMemo } from "react";
import {
  Treemap, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { useHoldersData } from "@/hooks/useHoldersData";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { fmt } from "@/utils/format";
import type { CategoriaHolder } from "@/types";
import {
  COLORES_CATEGORIA, NOMBRES_CATEGORIA, ICONO_CATEGORIA, BTC_SUPPLY,
} from "@/data/holders";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { NARRATIVA } from "@/data/narrativa";

const TODAS: CategoriaHolder[] = ["treasury", "etf", "exchange", "minero", "gobierno", "protocolo"];

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

// Contenido personalizado del Treemap — estilo tile con texto arriba-izquierda
function TreemapContent(props: {
  x: number; y: number; width: number; height: number;
  name: string; btc: number; color: string;
}) {
  const { x, y, width, height, name, btc, color } = props;
  if (width < 6 || height < 6) return null;

  const isFirst = x === 0 && y === 0;
  const pad = 6;
  const showName = width > 36 && height > 20;
  const showBtc = width > 55 && height > 36;

  // Escalar fuente según tamaño de celda, con límites razonables
  const nameSz = Math.max(10, Math.min(18, width / 7, height / 3));
  const btcSz = Math.max(9, Math.min(14, width / 9, height / 4));

  // Recortar nombre si el ancho no alcanza
  const maxChars = Math.max(3, Math.floor(width / (nameSz * 0.6)));
  const label = name.length > maxChars ? name.substring(0, maxChars - 1) + "…" : name;

  return (
    <g>
      {/* Defs solo en el primer tile */}
      {isFirst && (
        <defs>
          <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0.05} />
            <stop offset="70%" stopColor="#000" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
          </linearGradient>
        </defs>
      )}
      {/* Tile de color */}
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={color} stroke="#0a0f18" strokeWidth={2} opacity={0.9} />
      {/* Gradiente oscuro — más oscuro abajo para contraste con texto arriba */}
      <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} rx={3}
        fill="url(#tileGrad)" style={{ pointerEvents: "none" }} />
      {/* Nombre — arriba izquierda */}
      {showName && (
        <text x={x + pad} y={y + pad + nameSz * 0.38}
          dominantBaseline="central"
          style={{
            fill: "#fff", fontSize: nameSz, fontWeight: 700,
            pointerEvents: "none", letterSpacing: "-0.01em",
          }}>
          {label}
        </text>
      )}
      {/* BTC — debajo del nombre */}
      {showBtc && (
        <text x={x + pad} y={y + pad + nameSz + btcSz * 0.45}
          dominantBaseline="central"
          style={{
            fill: "rgba(255,255,255,0.75)", fontSize: btcSz, fontWeight: 500,
            pointerEvents: "none", fontFamily: "'JetBrains Mono',monospace",
          }}>
          {fmt(btc)} ₿
        </text>
      )}
    </g>
  );
}


export default function TabHolders() {
  const { datos, esReal, cargando } = useHoldersData();
  const [filtro, setFiltro] = useState<string>("todos");
  const { isMobile, isDesktop } = useBreakpoint();

  const filtrados = useMemo(() =>
    filtro === "todos" ? datos : datos.filter(h => h.categoria === filtro),
    [datos, filtro]
  );

  const totalBtc = datos.reduce((s, h) => s + h.btc, 0);
  const totalEntidades = datos.length;
  const pctSupply = (totalBtc / BTC_SUPPLY * 100);
  const mayor = datos.reduce((a, b) => a.btc > b.btc ? a : b);

  // Resúmenes por categoría
  const porCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of datos) {
      map[h.categoria] = (map[h.categoria] || 0) + h.btc;
    }
    return TODAS.map(cat => ({
      categoria: cat,
      nombre: NOMBRES_CATEGORIA[cat],
      btc: map[cat] || 0,
      pct: ((map[cat] || 0) / BTC_SUPPLY * 100),
      color: COLORES_CATEGORIA[cat],
    }));
  }, [datos]);

  const totalEtf = porCategoria.find(c => c.categoria === "etf")?.btc || 0;
  const totalTreasury = porCategoria.find(c => c.categoria === "treasury")?.btc || 0;
  const totalExchange = porCategoria.find(c => c.categoria === "exchange")?.btc || 0;

  // Datos para treemap
  const treemapData = useMemo(() =>
    filtrados
      .filter(h => h.btc > 0)
      .sort((a, b) => b.btc - a.btc)
      .map(h => ({
        name: h.nombre,
        size: h.btc,
        btc: h.btc,
        color: h.color,
        categoria: NOMBRES_CATEGORIA[h.categoria],
        pct: (h.btc / BTC_SUPPLY * 100).toFixed(2),
      })),
    [filtrados]
  );

  // Datos para barchart horizontal por categoría
  const barData = [...porCategoria].sort((a, b) => b.btc - a.btc);

  const maxBtcTabla = filtrados.length > 0 ? Math.max(...filtrados.map(h => h.btc)) : 1;

  return (
    <div>
      <Concepto titulo={NARRATIVA.tabs.holders.concepto.titulo}>
        {NARRATIVA.tabs.holders.concepto.cuerpo}
      </Concepto>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        <Metrica etiqueta="BTC identificado" valor={fmt(totalBtc) + " BTC"} sub={`${pctSupply.toFixed(1)}% de la oferta`} acento="#f0b429" />
        <Metrica etiqueta="Entidades" valor={String(totalEntidades)} sub="holders identificados" />
        <Metrica etiqueta="ETFs Spot US" valor={fmt(totalEtf) + " BTC"} sub={`${(totalEtf / BTC_SUPPLY * 100).toFixed(1)}% de la oferta`} acento="#818cf8" />
        <Metrica etiqueta="Mayor holder" valor={mayor.nombre} sub={fmt(mayor.btc) + " BTC"} acento="#f0b429" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Senal
          etiqueta="FUENTE"
          estado={cargando ? "Cargando datos reales…" : esReal ? "ETFs actualizados vía API" : "Datos curados estáticos"}
          color={cargando ? "#667788" : esReal ? "#f0b429" : "#667788"}
        />
        {NARRATIVA.tabs.holders.senales.map((s, i) => (
          <Senal key={i} etiqueta={s.etiqueta} estado={s.estado} color={["#818cf8", "#f0b429", "#ef4444"][i]} />
        ))}
        <Senal etiqueta="EXCHANGES" estado={fmt(totalExchange) + " BTC en custodia"} color="#06b6d4" />
      </div>

      {/* Treemap — ancho completo */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 12, gap: isMobile ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "#8899aa", letterSpacing: "0.08em" }}>MAPA DE ACUMULADORES (PROPORCIONAL A BTC)</div>
          <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : undefined }}>
            <Btn
              items={[
                { id: "todos", l: "TODOS" },
                ...TODAS.map(c => ({ id: c, l: NOMBRES_CATEGORIA[c].toUpperCase() })),
              ]}
              val={filtro}
              set={setFiltro}
              color="#f0b429"
            />
          </div>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={isMobile ? 350 : 520}>
            <Treemap
              data={treemapData}
              dataKey="size"
              stroke="#0a0f18"
              content={<TreemapContent x={0} y={0} width={0} height={0} name="" btc={0} color="" />}
            >
              <Tooltip content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload} render={(d) => (
                  <>
                    <div style={{ fontSize: 14, color: "#e0e8f0", fontWeight: 600 }}>{d?.name}</div>
                    <div style={{ fontSize: 12, color: "#8899aa", marginTop: 4 }}>{d?.categoria}</div>
                    <div style={{ fontSize: 13, color: "#e0e8f0", marginTop: 2, fontFamily: "monospace" }}>{d?.btc?.toLocaleString("es-CL")} BTC</div>
                    <div style={{ fontSize: 11, color: "#667788" }}>{d?.pct}% de la oferta</div>
                  </>
                )} />
              )} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BarChart por categoría — debajo del treemap */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>BTC POR CATEGORÍA</div>
        <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
          <BarChart data={barData} layout="vertical" margin={{ left: isMobile ? 65 : 80, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#667788", fontSize: 10 }} tickFormatter={v => fmt(v)} />
            <YAxis type="category" dataKey="nombre" tick={{ fill: "#8899aa", fontSize: 11 }} width={isMobile ? 60 : 75} />
            <Tooltip content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} render={(d) => (
                <>
                  <div style={{ fontSize: 13, color: "#e0e8f0", fontWeight: 600 }}>{d?.nombre}</div>
                  <div style={{ fontSize: 12, color: "#8899aa", marginTop: 4 }}>{d?.btc?.toLocaleString("es-CL")} BTC</div>
                  <div style={{ fontSize: 11, color: "#667788" }}>{d?.pct?.toFixed(2)}% de la oferta</div>
                </>
              )} />
            )} />
            <Bar dataKey="btc" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda de categorías */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {TODAS.map(cat => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8899aa" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORES_CATEGORIA[cat] }} />
            <span>{ICONO_CATEGORIA[cat]} {NOMBRES_CATEGORIA[cat]}</span>
            <span style={{ color: "#667788", fontFamily: "monospace" }}>
              ({(porCategoria.find(c => c.categoria === cat)?.pct || 0).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>

      {/* Tabla detallada */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12, letterSpacing: "0.08em" }}>
          DETALLE POR ENTIDAD {filtro !== "todos" ? `— ${NOMBRES_CATEGORIA[filtro as CategoriaHolder].toUpperCase()}` : ""}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #21262d" }}>
                {["#", "Nombre", "Ticker", "Categoría", "País", "BTC", "% Oferta"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left", color: "#667788", fontWeight: 500,
                    fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtrados].sort((a, b) => b.btc - a.btc).map((h, i) => {
                const pct = (h.btc / BTC_SUPPLY * 100);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #161b22" }}>
                    <td style={{ padding: "8px 12px", color: "#667788", fontFamily: "monospace", fontSize: 10 }}>{i + 1}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: h.color }} />
                        <span style={{ color: "#e0e8f0", fontWeight: 600 }}>{h.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#8899aa", fontFamily: "monospace" }}>{h.ticker || "—"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: `${h.color}18`, color: h.color, fontWeight: 600,
                      }}>
                        {ICONO_CATEGORIA[h.categoria]} {NOMBRES_CATEGORIA[h.categoria]}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#8899aa", fontSize: 11 }}>{h.pais}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 4, background: "#161b22", borderRadius: 2, flexShrink: 0 }}>
                          <div style={{
                            width: `${Math.min(h.btc / maxBtcTabla * 100, 100)}%`,
                            height: "100%", background: h.color, borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ color: "#e0e8f0", fontFamily: "monospace", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {h.btc.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#8899aa", fontFamily: "monospace" }}>{pct.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PanelEdu icono={NARRATIVA.tabs.holders.panelEdu.icono} titulo={NARRATIVA.tabs.holders.panelEdu.titulo} color={NARRATIVA.tabs.holders.panelEdu.color}>
        BlackRock, Fidelity, Strategy, gobiernos — cada uno acumulando por razones distintas pero con el mismo efecto: comprimen la oferta disponible.
        <br /><br />
        Mientras tanto, los bancos centrales repiten que Bitcoin &quot;no tiene valor intrínseco&quot;. Las instituciones que ellos regulan lo acumulan a ritmo récord.
        <br /><br />
        Esta tabla muestra solo la punta visible. La mayoría del Bitcoin está en billeteras anónimas de individuos que no reportan a ningún regulador. Ambas fuerzas — la institucional visible y la individual silenciosa — aprietan la oferta desde los dos lados.
        <br /><br />
        ¿Cuánto queda después de restar todo lo que ya está acumulado? La última sección hace la cuenta.
        <br /><br />
        <span style={{ color: "#8899aa", fontStyle: "italic" }}>{NARRATIVA.tabs.holders.panelEdu.cierre}</span>
        <br /><br />
        <span style={{ color: "#667788", fontSize: 11 }}>
          Este análisis es informativo y no constituye asesoría financiera de ningún tipo. Datos basados en informes públicos (SEC, bitcointreasuries.net) y pueden contener estimaciones.
        </span>
      </PanelEdu>
    </div>
  );
}
