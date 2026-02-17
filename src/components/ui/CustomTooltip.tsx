import { ReactNode } from "react";

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (data: any, payload: readonly any[]) => ReactNode;
}

export default function CustomTooltip({ active, payload, render }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "var(--tooltip-bg)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "10px 14px", backdropFilter: "blur(12px)" }}>
      {render(d, payload)}
    </div>
  );
}
