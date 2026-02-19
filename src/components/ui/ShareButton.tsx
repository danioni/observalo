"use client";

import { useCallback } from "react";

interface ShareButtonProps {
  text: string;
  url?: string;
}

export default function ShareButton({ text, url = "https://observalo.com" }: ShareButtonProps) {
  const handleClick = useCallback(() => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [text, url]);

  return (
    <button
      onClick={handleClick}
      aria-label="Compartir en X / Twitter"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 6,
        background: "transparent",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-muted)",
        fontSize: 11, fontWeight: 600, cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: "0.03em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#1d9bf0";
        e.currentTarget.style.borderColor = "#1d9bf0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    >
      {/* X / Twitter logo */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Compartir
    </button>
  );
}
