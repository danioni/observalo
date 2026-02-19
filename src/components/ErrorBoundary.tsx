"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32,
          textAlign: "center",
          background: "var(--bg-surface)",
          borderRadius: 8,
          border: "1px solid var(--border-subtle)",
          margin: "24px 0",
        }}>
          <div style={{ fontSize: 14, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>
            Error al cargar esta sección
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            Algo salió mal al renderizar. Intenta recargar la página.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: "1px solid #ef4444",
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
