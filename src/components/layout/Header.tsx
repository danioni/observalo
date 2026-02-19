"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pestana, ApiEnvelope, DatosVivosMineria } from "@/types";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { NARRATIVA } from "@/data/narrativa";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PESTANAS: Pestana[] = [
  { id: "lared", etiqueta: "LA RED", icono: "⛏" },
  { id: "distribucion", etiqueta: "DISTRIBUCIÓN", icono: "◆" },
  { id: "conviccion", etiqueta: "CONVICCIÓN", icono: "◈" },
  { id: "flujos", etiqueta: "FLUJOS", icono: "⇄" },
  { id: "acumuladores", etiqueta: "ACUMULADORES", icono: "⬡" },
  { id: "escasez", etiqueta: "ESCASEZ", icono: "⚡" },
  { id: "valoracion", etiqueta: "VALORACIÓN", icono: "◎" },
  { id: "precio", etiqueta: "PRECIO", icono: "₿" },
  { id: "derivados", etiqueta: "DERIVADOS", icono: "⟐" },
];

interface HeaderProps {
  tab: string;
  setTab: (tab: string) => void;
}

export default function Header({ tab, setTab }: HeaderProps) {
  const [ahora, setAhora] = useState<Date | null>(null);
  const [bloque, setBloque] = useState<number | null>(null);
  const { isMobile, isDesktop } = useBreakpoint();

  // Fetch block height from our API proxy
  const fetchBloque = useCallback(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    fetch("/api/mempool", { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then((envelope: ApiEnvelope<DatosVivosMineria> | null) => {
        clearTimeout(timeout);
        if (envelope?.data?.bloque?.height) {
          setBloque(envelope.data.bloque.height);
        }
      })
      .catch(() => { clearTimeout(timeout); });
  }, []);

  useEffect(() => {
    setAhora(new Date());
    const t = setInterval(() => setAhora(new Date()), 1000);
    fetchBloque();
    const b = setInterval(fetchBloque, 60_000);
    return () => { clearInterval(t); clearInterval(b); };
  }, [fetchBloque]);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: `linear-gradient(180deg,rgba(var(--bg-primary-rgb),1) 0%,rgba(var(--bg-primary-rgb),0.93) 80%,rgba(var(--bg-primary-rgb),0) 100%)`,
      padding: isMobile ? "12px 12px 8px" : "16px 24px 12px",
      borderBottom: "1px solid var(--border-primary)", backdropFilter: "blur(16px)",
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
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-bright)" }}>Observalo</h1>
            <div style={{ fontSize: isMobile ? 9 : 10, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {NARRATIVA.tagline}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <div style={{ textAlign: "right" }}>
            {bloque ? (
              <div style={{ fontSize: isMobile ? 11 : 13, color: "#f0b429", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, marginBottom: 2 }}>
                Altura: #{bloque.toLocaleString("es-CL")}
              </div>
            ) : (
              <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>
                Altura: consultando...
              </div>
            )}
            <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>{ahora ? ahora.toLocaleTimeString("es-CL") : "\u00A0"}</div>
            {isDesktop && (
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{ahora ? ahora.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "\u00A0"}</div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>

      {!isMobile && (
        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 10, lineHeight: 1.5 }}>
          {NARRATIVA.subtitulo}
        </div>
      )}

      <nav aria-label="Secciones del observatorio" className="tabs-scroll" style={{
        display: "flex", gap: isMobile ? 2 : 4,
        overflowX: "auto",
      }}>
        {PESTANAS.map((t2) => (
          <a
            key={t2.id}
            href={`#${t2.id}`}
            role="tab"
            aria-selected={tab === t2.id}
            onClick={(e) => { e.preventDefault(); setTab(t2.id); }}
            style={{
              padding: isMobile ? "6px 10px" : "8px 14px",
              borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: isMobile ? 10 : 11, fontWeight: 600,
              letterSpacing: "0.06em", transition: "all 0.2s ease",
              background: tab === t2.id ? "rgba(240,180,41,0.12)" : "transparent",
              color: tab === t2.id ? "#f0b429" : "var(--text-muted)",
              borderBottom: tab === t2.id ? "2px solid #f0b429" : "2px solid transparent",
              whiteSpace: "nowrap", flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <span aria-hidden="true" style={{ marginRight: isMobile ? 4 : 6 }}>{t2.icono}</span>
            {t2.etiqueta}
          </a>
        ))}
      </nav>
    </header>
  );
}
