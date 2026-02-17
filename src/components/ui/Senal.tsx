interface SenalProps {
  etiqueta: string;
  estado: string;
  color: string;
}

export default function Senal({ etiqueta, estado, color }: SenalProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: `${color}12`, borderRadius: 6, border: `1px solid ${color}30` }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}60` }} />
      <span style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.05em" }}>{etiqueta}</span>
      <span style={{ fontSize: 11, color: "#8899aa", marginLeft: "auto" }}>{estado}</span>
    </div>
  );
}
