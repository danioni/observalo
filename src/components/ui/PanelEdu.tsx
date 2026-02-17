"use client";

import { ReactNode } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface PanelEduProps {
  icono: string;
  titulo: string;
  color: string;
  children: ReactNode;
}

export default function PanelEdu({ icono, titulo, color, children }: PanelEduProps) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ padding: isMobile ? 12 : 16, background: `${color}08`, borderRadius: 8, border: `1px solid ${color}20`, marginTop: 20 }}>
      <div style={{ fontSize: isMobile ? 11 : 12, color, fontWeight: 600, marginBottom: 8 }}>{icono} {titulo}</div>
      <div style={{ fontSize: isMobile ? 11 : 12, color: "#8899aa", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
