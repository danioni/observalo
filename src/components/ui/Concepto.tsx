"use client";

import { ReactNode } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface ConceptoProps {
  titulo: string;
  children: ReactNode;
}

export default function Concepto({ titulo, children }: ConceptoProps) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ padding: isMobile ? 12 : 14, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
      <div style={{ fontSize: isMobile ? 10 : 11, color: "#f0b429", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>💡 {titulo}</div>
      <div style={{ fontSize: isMobile ? 11 : 12, color: "#8899aa", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
