"use client";

import { useState, useEffect } from "react";
import { Pestana } from "@/types";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { NARRATIVA } from "@/data/narrativa";

const PESTANAS: Pestana[] = [
  { id: "soberania", etiqueta: "SOBERANÍA", icono: "⚡" },
  { id: "distribucion", etiqueta: "DISTRIBUCIÓN", icono: "◆" },
  { id: "mineria", etiqueta: "MINERÍA", icono: "⛏" },
  { id: "ondas", etiqueta: "ONDAS HODL", icono: "◈" },
  { id: "flujos", etiqueta: "FLUJOS EXCHANGES", icono: "⇄" },
  { id: "holders", etiqueta: "ACUMULADORES", icono: "⬡" },
];

interface HeaderProps {
  tab: string;
  setTab: (tab: string) => void;
}

export default function Header({ tab, setTab }: HeaderProps) {
  const [ahora, setAhora] = useState<Date | null>(null);
  const [bloque, setBloque] = useState<number | null>(null);
  const { isMobile, isDesktop } = useBreakpoint();

  useEffect(() => {
    setAhora(new Date());
    const t = setInterval(() => setAhora(new Date()), 1000);

    const fetchBloque = () => {
      fetch("https://mempool.space/api/blocks/tip/height")
        .then(r => r.ok ? r.text() : null)
        .then(h => { if (h) setBloque(parseInt(h, 10)); })
        .catch(() => {});
    };
    fetchBloque();
    const b = setInterval(fetchBloque, 60_000);

    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "linear-gradient(180deg,#080c12 0%,#080c12ee 80%,#080c1200 100%)",
      padding: isMobile ? "12px 12px 8px" : "16px 24px 12px",
      borderBottom: "1px solid #161b22", backdropFilter: "blur(16px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 6 : 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <div style={{
            width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: 8,
            background: "linear-gradient(135deg,#f0b429 0%,#f97316 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "#0a0f18",
          }}>₿</div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, letterSpacing: "-0.02em", color: "#f0f4f8" }}>Observalo</h1>
            <div style={{ fontSize: isMobile ? 9 : 10, color: "#667788", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {NARRATIVA.tagline}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {bloque && (
            <div style={{ fontSize: isMobile ? 11 : 13, color: "#f0b429", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, marginBottom: 2 }}>
              ⛏ bloque #{bloque.toLocaleString("es-CL")}
            </div>
          )}
          <div style={{ fontSize: isMobile ? 11 : 12, color: "#e0e8f0", fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>{ahora ? ahora.toLocaleTimeString("es-CL") : "\u00A0"}</div>
          {isDesktop && (
            <div style={{ fontSize: 10, color: "#667788" }}>{ahora ? ahora.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "\u00A0"}</div>
          )}
        </div>
      </div>

      {!isMobile && (
        <div style={{ fontSize: 11, color: "#556677", marginBottom: 10, lineHeight: 1.5 }}>
          {NARRATIVA.subtitulo}
        </div>
      )}

      <div className="tabs-scroll" style={{
        display: "flex", gap: isMobile ? 2 : 4,
        overflowX: isDesktop ? "visible" : "auto",
      }}>
        {PESTANAS.map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{
            padding: isMobile ? "6px 10px" : "8px 16px",
            borderRadius: 6, border: "none", cursor: "pointer",
            fontSize: isMobile ? 10 : 11, fontWeight: 600,
            letterSpacing: "0.06em", transition: "all 0.2s ease",
            background: tab === t2.id ? "rgba(240,180,41,0.12)" : "transparent",
            color: tab === t2.id ? "#f0b429" : "#667788",
            borderBottom: tab === t2.id ? "2px solid #f0b429" : "2px solid transparent",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span style={{ marginRight: isMobile ? 4 : 6 }}>{t2.icono}</span>
            {isMobile ? t2.etiqueta.split(" ")[0] : t2.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
