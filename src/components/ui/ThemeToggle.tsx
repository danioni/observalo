"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    if (current) setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--bg-card-border)",
        borderRadius: 6,
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: 16,
        lineHeight: 1,
        color: "var(--text-muted)",
        transition: "background 0.2s ease",
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
