"use client";

import { useBreakpoint } from "@/hooks/useBreakpoint";

interface MetricaProps {
  etiqueta: string;
  valor: string;
  sub?: string;
  acento?: string;
}

export default function Metrica({ etiqueta, valor, sub, acento }: MetricaProps) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ padding: isMobile ? "10px 12px" : "12px 16px", background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--bg-card-border)" }}>
      <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{etiqueta}</div>
      <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: acento || "var(--text-primary)", fontFamily: "'JetBrains Mono','Fira Code',monospace", letterSpacing: "-0.02em" }}>{valor}</div>
      {sub && <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
