interface MetricaProps {
  etiqueta: string;
  valor: string;
  sub?: string;
  acento?: string;
}

export default function Metrica({ etiqueta, valor, sub, acento }: MetricaProps) {
  return (
    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 11, color: "#8899aa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{etiqueta}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: acento || "#e0e8f0", fontFamily: "'JetBrains Mono','Fira Code',monospace", letterSpacing: "-0.02em" }}>{valor}</div>
      {sub && <div style={{ fontSize: 11, color: "#667788", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
