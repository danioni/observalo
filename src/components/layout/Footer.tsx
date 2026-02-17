export default function Footer() {
  return (
    <div style={{ padding: "20px 24px", borderTop: "1px solid #161b22", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#3d4450", letterSpacing: "0.1em" }}>
        OBSERVALO · Observatorio de Bitcoin · Datos: mempool.space + análisis curado
      </div>
      <div style={{ fontSize: 9, color: "#2a3040", marginTop: 6, lineHeight: 1.6 }}>
        Este sitio es solo informativo. No constituye asesoría financiera, tributaria ni de inversión de ningún tipo.
        <br />Los datos provienen de fuentes públicas (mempool.space, bitcoin-data.com, informes SEC) y pueden contener estimaciones.
      </div>
      <div style={{ fontSize: 9, color: "#2a3040", marginTop: 4, fontStyle: "italic" }}>
        &quot;Chancellor on brink of second bailout for banks&quot; — Satoshi Nakamoto, Bloque #0
      </div>
    </div>
  );
}
