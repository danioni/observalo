"use client";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { NARRATIVA } from "@/data/narrativa";

export default function Footer() {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "20px 24px", borderTop: "1px solid #161b22", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#3d4450", letterSpacing: "0.1em" }}>
        {NARRATIVA.footerAtribucion}
      </div>
      <div style={{ fontSize: 9, color: "#2a3040", marginTop: 6, lineHeight: 1.6 }}>
        {NARRATIVA.footerDisclaimer}
      </div>
      <div style={{ fontSize: 10, color: "#445566", marginTop: 8, lineHeight: 1.5 }}>
        {NARRATIVA.footerContexto}
      </div>
      <div style={{ fontSize: 9, color: "#3d4450", marginTop: 4, fontStyle: "italic" }}>
        &quot;Chancellor on brink of second bailout for banks&quot; — Satoshi Nakamoto, Bloque #0
      </div>
    </div>
  );
}
