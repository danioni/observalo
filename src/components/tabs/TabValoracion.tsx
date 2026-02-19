"use client";

import { useMemo } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useValoracionData, type ValoracionItem } from "@/hooks/useValoracionData";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { fmtNum } from "@/utils/format";
import Metrica from "@/components/ui/Metrica";
import Senal from "@/components/ui/Senal";
import PanelEdu from "@/components/ui/PanelEdu";
import Concepto from "@/components/ui/Concepto";
import CustomTooltip from "@/components/ui/CustomTooltip";

/* ══════════════════════════════════════════════════════════════════
   ZONE HELPERS
   ══════════════════════════════════════════════════════════════════ */

function mvrvZona(v: number): { texto: string; color: string } {
  if (v <= 1) return { texto: "Infravalorado — mercado por debajo del precio realizado", color: "#22c55e" };
  if (v <= 2) return { texto: "Zona neutral — valoración moderada", color: "#06b6d4" };
  if (v <= 3.5) return { texto: "Zona caliente — mercado recalentándose", color: "#f0b429" };
  return { texto: "Zona de euforia — históricamente insostenible", color: "#ef4444" };
}

function nuplZona(v: number): { texto: string; color: string } {
  if (v <= 0) return { texto: "Capitulación — la red en pérdida neta", color: "#ef4444" };
  if (v <= 0.25) return { texto: "Esperanza / Miedo — ganancias mínimas", color: "#f0b429" };
  if (v <= 0.5) return { texto: "Optimismo — ganancias moderadas no realizadas", color: "#22c55e" };
  if (v <= 0.75) return { texto: "Creencia — ganancias significativas, confianza alta", color: "#06b6d4" };
  return { texto: "Euforia / Codicia — históricamente cerca de techos", color: "#a855f7" };
}

function soprZona(v: number): { texto: string; color: string } {
  if (v < 0.95) return { texto: "Pérdida generalizada — los que venden están perdiendo dinero", color: "#ef4444" };
  if (v < 1.0) return { texto: "Pérdida leve — presión de venta con pérdidas", color: "#f0b429" };
  if (v <= 1.05) return { texto: "Equilibrio — ventas cercanas al costo", color: "#06b6d4" };
  return { texto: "Ganancia — los que venden están tomando ganancias", color: "#22c55e" };
}

/* ══════════════════════════════════════════════════════════════════
   BADGE
   ══════════════════════════════════════════════════════════════════ */

function BadgeSimulado() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: "rgba(239,68,68,0.15)", color: "#ef4444",
    }}>
      ⚠ Datos simulados
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CHART COMPONENT
   ══════════════════════════════════════════════════════════════════ */

interface ChartProps {
  titulo: string;
  dataKey: string;
  data: ValoracionItem[];
  color: string;
  zonas: { desde: number; hasta: number; color: string; label: string }[];
  refLines?: { y: number; label: string; color: string }[];
  domainMin?: number;
  domainMax?: number;
  isMobile: boolean;
}

function ValoracionChart({ titulo, dataKey, data, color, zonas, refLines, domainMin, domainMax, isMobile }: ChartProps) {
  const intTick = Math.max(1, Math.floor(data.length / (isMobile ? 8 : 16)));

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em", marginBottom: 12 }}>
        {titulo}
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 360}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ComposedChart data={data as any[]} margin={{ top: 10, right: 20, bottom: 10, left: isMobile ? 10 : 20 }}>
          <defs>
            {zonas.map((z, i) => (
              <linearGradient key={i} id={`zone-${dataKey}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={z.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={z.color} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-grid)" />
          <XAxis dataKey="fecha" tick={{ fill: "var(--text-muted)", fontSize: 9 }} interval={intTick} />
          <YAxis
            domain={[domainMin ?? "auto", domainMax ?? "auto"]}
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickFormatter={(v: number) => v.toFixed(v >= 10 ? 0 : v >= 1 ? 1 : 2)}
          />
          <Tooltip content={({ active, payload }) => (
            <CustomTooltip active={active} payload={payload} render={(d) => {
              if (!d) return null;
              const val = d[dataKey] as number | null;
              return (
                <>
                  <div style={{ fontSize: 11, color: "var(--text-tooltip)" }}>{d.d ?? d.fecha}</div>
                  <div style={{ fontSize: 15, color, fontFamily: "monospace", fontWeight: 700, marginTop: 4 }}>
                    {val != null ? val.toFixed(4) : "—"}
                  </div>
                </>
              );
            }} />
          )} />

          {/* Zone backgrounds via ReferenceAreas — using ReferenceLine for zone labels */}
          {refLines?.map((rl, i) => (
            <ReferenceLine
              key={i}
              y={rl.y}
              stroke={rl.color}
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={!isMobile ? { value: rl.label, fill: rl.color, fontSize: 9, position: "right" } : undefined}
            />
          ))}

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="none"
            fill={`${color}18`}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function TabValoracion() {
  const { items, esReal, cargando, error, reintentar } = useValoracionData();
  const { isMobile } = useBreakpoint();

  const ultimo = useMemo(() => {
    if (items.length === 0) return null;
    // Find the last item with at least one non-null value
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].mvrv != null || items[i].nupl != null || items[i].sopr != null) return items[i];
    }
    return null;
  }, [items]);

  const mvrvActual = ultimo?.mvrv;
  const nuplActual = ultimo?.nupl;
  const soprActual = ultimo?.sopr;

  const mvrvSenal = mvrvActual != null ? mvrvZona(mvrvActual) : null;
  const nuplSenal = nuplActual != null ? nuplZona(nuplActual) : null;
  const soprSenal = soprActual != null ? soprZona(soprActual) : null;

  // MVRV chart data
  const mvrvData = useMemo(() => items.filter(d => d.mvrv != null), [items]);
  const nuplData = useMemo(() => items.filter(d => d.nupl != null), [items]);
  const soprData = useMemo(() => items.filter(d => d.sopr != null), [items]);

  if (cargando) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Cargando métricas de valoración...</div>
        <div style={{ fontSize: 11 }}>Fuente: bitcoin-data.com · MVRV, NUPL, SOPR</div>
      </div>
    );
  }

  return (
    <div>
      <Concepto titulo="El precio miente en el corto plazo — la valoración revela el estado real de la red">
        Estas métricas comparan el precio de mercado con el comportamiento real de los participantes de la red. No predicen el futuro, pero revelan si el mercado está en zona de euforia, miedo o equilibrio — basándose en datos verificables, no en opiniones.
      </Concepto>

      {!esReal && (
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <BadgeSimulado />
          <button onClick={reintentar} style={{
            padding: "4px 12px", borderRadius: 4, border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)", color: "#f0b429", fontSize: 10, fontWeight: 600, cursor: "pointer",
          }}>Reintentar</button>
          {error && <span style={{ fontSize: 10, color: "#ef4444" }}>{error}</span>}
        </div>
      )}

      {/* ── Métricas resumen ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: isMobile ? 8 : 12, marginBottom: 20 }}>
        <Metrica
          etiqueta="MVRV Ratio"
          valor={mvrvActual != null ? mvrvActual.toFixed(2) + "×" : "—"}
          sub="Mercado vs. Precio Realizado"
          acento={mvrvSenal?.color}
        />
        <Metrica
          etiqueta="NUPL"
          valor={nuplActual != null ? (nuplActual * 100).toFixed(1) + "%" : "—"}
          sub="Ganancia/Pérdida no realizada"
          acento={nuplSenal?.color}
        />
        <Metrica
          etiqueta="SOPR"
          valor={soprActual != null ? soprActual.toFixed(4) : "—"}
          sub="Ratio de ganancia al gastar"
          acento={soprSenal?.color}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
         MVRV
         ══════════════════════════════════════════════════════════════ */}

      {mvrvSenal && (
        <div style={{ marginBottom: 16 }}>
          <Senal etiqueta="MVRV" estado={mvrvSenal.texto} color={mvrvSenal.color} />
        </div>
      )}

      {mvrvData.length > 0 && (
        <ValoracionChart
          titulo="MVRV RATIO — VALOR DE MERCADO / VALOR REALIZADO"
          dataKey="mvrv"
          data={mvrvData}
          color="#f0b429"
          zonas={[]}
          refLines={[
            { y: 1, label: "MVRV = 1 (Precio Realizado)", color: "#22c55e" },
            { y: 3.5, label: "Zona de euforia", color: "#ef4444" },
          ]}
          domainMin={0}
          isMobile={isMobile}
        />
      )}

      <PanelEdu icono="📐" titulo="¿Qué es el MVRV?" color="#f0b429">
        <strong style={{ color: "#f0b429" }}>El MVRV compara lo que vale el mercado con lo que los participantes realmente pagaron.</strong> El &quot;Valor Realizado&quot; (Realized Cap) suma el precio al que se movió por última vez cada moneda — es el &quot;costo base&quot; agregado de toda la red.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>MVRV &gt; 3.5:</strong> <span style={{ color: "#ef4444" }}>Históricamente zona de euforia.</span> El mercado vale más de 3.5 veces lo que los participantes pagaron. Ganancias no realizadas masivas incentivan la toma de beneficios.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>MVRV &lt; 1:</strong> <span style={{ color: "#22c55e" }}>El mercado vale menos que el precio realizado.</span> En promedio, los participantes están en pérdida. Históricamente zona de acumulación.
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este indicador es informativo. No constituye asesoría financiera.
        </span>
      </PanelEdu>

      {/* ══════════════════════════════════════════════════════════════
         NUPL
         ══════════════════════════════════════════════════════════════ */}

      {nuplSenal && (
        <div style={{ marginBottom: 16, marginTop: 24 }}>
          <Senal etiqueta="NUPL" estado={nuplSenal.texto} color={nuplSenal.color} />
        </div>
      )}

      {nuplData.length > 0 && (
        <ValoracionChart
          titulo="NUPL — GANANCIA/PÉRDIDA NETA NO REALIZADA"
          dataKey="nupl"
          data={nuplData}
          color="#a855f7"
          zonas={[]}
          refLines={[
            { y: 0, label: "Punto de equilibrio", color: "#ef4444" },
            { y: 0.5, label: "Optimismo → Creencia", color: "#06b6d4" },
            { y: 0.75, label: "Euforia", color: "#a855f7" },
          ]}
          isMobile={isMobile}
        />
      )}

      <PanelEdu icono="📊" titulo="¿Qué es el NUPL?" color="#a855f7">
        <strong style={{ color: "#a855f7" }}>NUPL mide cuánta ganancia o pérdida no realizada existe en la red.</strong> Si la mayoría de las monedas valen más de lo que sus dueños pagaron, el NUPL es positivo (ganancias). Si vale menos, es negativo (pérdidas).
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>NUPL &gt; 0.75:</strong> <span style={{ color: "#a855f7" }}>Euforia/Codicia.</span> La mayoría está sentado sobre enormes ganancias no realizadas. Históricamente precede correcciones.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>NUPL &lt; 0:</strong> <span style={{ color: "#ef4444" }}>Capitulación.</span> La red entera está en pérdida neta. Históricamente zona de suelo.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>NUPL 0.25–0.5:</strong> <span style={{ color: "#22c55e" }}>Optimismo.</span> Ganancias moderadas, mercado saludable.
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este indicador es informativo. No constituye asesoría financiera.
        </span>
      </PanelEdu>

      {/* ══════════════════════════════════════════════════════════════
         SOPR
         ══════════════════════════════════════════════════════════════ */}

      {soprSenal && (
        <div style={{ marginBottom: 16, marginTop: 24 }}>
          <Senal etiqueta="SOPR" estado={soprSenal.texto} color={soprSenal.color} />
        </div>
      )}

      {soprData.length > 0 && (
        <ValoracionChart
          titulo="SOPR — RATIO DE GANANCIA AL GASTAR"
          dataKey="sopr"
          data={soprData}
          color="#06b6d4"
          zonas={[]}
          refLines={[
            { y: 1, label: "SOPR = 1 (costo base)", color: "#f0b429" },
          ]}
          domainMin={0.9}
          domainMax={1.15}
          isMobile={isMobile}
        />
      )}

      <PanelEdu icono="💰" titulo="¿Qué es el SOPR?" color="#06b6d4">
        <strong style={{ color: "#06b6d4" }}>SOPR mide si las monedas que se mueven hoy se venden con ganancia o pérdida.</strong> Cada vez que alguien gasta un UTXO, se compara el precio al que lo recibió con el precio actual. SOPR = precio de venta / precio de compra.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>SOPR &gt; 1:</strong> <span style={{ color: "#22c55e" }}>Las monedas se venden con ganancia.</span> En mercados alcistas, SOPR &gt; 1 actúa como soporte: cuando baja a 1, los participantes dejan de vender (no quieren vender a pérdida).
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>SOPR &lt; 1:</strong> <span style={{ color: "#ef4444" }}>Ventas con pérdida.</span> Indica capitulación. En mercados bajistas, SOPR &lt; 1 actúa como resistencia: cuando sube a 1, los participantes venden para salir a mano.
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este indicador es informativo. No constituye asesoría financiera.
        </span>
      </PanelEdu>

      {/* ── Fuente ── */}
      {esReal && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
          Fuente: bitcoin-data.com (BGeometrics) · Datos mensuales desde 2014
        </div>
      )}
    </div>
  );
}
