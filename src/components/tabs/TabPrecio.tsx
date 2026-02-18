"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import Concepto from "@/components/ui/Concepto";
import PanelEdu from "@/components/ui/PanelEdu";

const CHART_URL = "https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/";

export default function TabPrecio() {
  const { isMobile } = useBreakpoint();
  const [iframeError, setIframeError] = useState(false);

  return (
    <div>
      <Concepto titulo="El precio es ruidoso en el corto plazo — el patrón se revela en años">
        Bitcoin ha pasado por múltiples ciclos de auge y caída. El Rainbow Chart aplica una regresión logarítmica al precio histórico y dibuja bandas de color que ayudan a contextualizar si el precio actual está relativamente caro o barato — comparado con su propia historia, no con opiniones.
      </Concepto>

      {/* Rainbow Chart embed */}
      <div style={{
        marginBottom: 24,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "#fff",
      }}>
        {!iframeError ? (
          <iframe
            src={CHART_URL}
            title="Bitcoin Rainbow Chart — BlockchainCenter.net"
            style={{
              width: "100%",
              height: isMobile ? 500 : 700,
              border: "none",
              display: "block",
            }}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            onError={() => setIframeError(true)}
          />
        ) : (
          <div style={{
            padding: 40,
            textAlign: "center",
            background: "var(--bg-surface)",
          }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
              No se pudo cargar el chart embebido
            </div>
            <a
              href={CHART_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 20px", borderRadius: 8,
                background: "rgba(240,180,41,0.15)", color: "#f0b429",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                border: "1px solid rgba(240,180,41,0.3)",
              }}
            >
              Abrir Rainbow Chart en BlockchainCenter.net
            </a>
          </div>
        )}
      </div>

      {/* Link directo siempre visible */}
      <div style={{
        textAlign: "center", marginBottom: 24,
      }}>
        <a
          href={CHART_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 6,
            background: "var(--bg-surface)", color: "#f0b429",
            fontSize: 11, fontWeight: 600, textDecoration: "none",
            border: "1px solid var(--border-subtle)",
            transition: "all 0.15s ease",
          }}
        >
          Abrir en BlockchainCenter.net ↗
        </a>
      </div>

      {/* Panel Educativo */}
      <PanelEdu icono="🌈" titulo="¿Qué es el Rainbow Chart?" color="#f0b429">
        <strong style={{ color: "#f0b429" }}>Es una herramienta visual de contexto, no de predicción.</strong> El Rainbow Chart aplica una curva de regresión logarítmica al precio histórico de Bitcoin y dibuja bandas de color alrededor. Cada banda representa una zona relativa: desde &quot;ganga&quot; (azul) hasta &quot;burbuja&quot; (rojo).
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>¿Por qué funciona?</strong> Bitcoin ha seguido un patrón de adopción logarítmica — crecimiento explosivo al inicio que se va desacelerando con el tiempo. La curva base captura esa tendencia de largo plazo. Las bandas muestran las desviaciones cíclicas (euforia y pánico) respecto a esa tendencia.
        <br /><br />
        <strong style={{ color: "var(--text-primary)" }}>¿Qué NO es?</strong> No es una predicción. No es asesoría financiera. La regresión puede dejar de funcionar si Bitcoin cambia fundamentalmente de patrón de adopción. Es un mapa del pasado que sugiere — pero no garantiza — el futuro.
        <br /><br />
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          Este análisis es informativo. No constituye asesoría financiera. Chart por BlockchainCenter.net.
        </span>
      </PanelEdu>

      <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
        Fuente: BlockchainCenter.net · Bitcoin Rainbow Chart (The Original)
      </div>
    </div>
  );
}
