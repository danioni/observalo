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
    <div style={{ padding: isMobile ? 12 : 14, background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--bg-card-border)", marginBottom: 12 }}>
      <div style={{ fontSize: isMobile ? 10 : 11, color: "#f0b429", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>💡 {titulo}</div>
      <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
