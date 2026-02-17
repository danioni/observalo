"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TabDistribucion from "@/components/tabs/TabDistribucion";
import TabOndas from "@/components/tabs/TabOndas";
import TabFlujos from "@/components/tabs/TabFlujos";
import TabMineria from "@/components/tabs/TabMineria";
import TabHolders from "@/components/tabs/TabHolders";
import TabSoberania from "@/components/tabs/TabSoberania";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function Dashboard() {
  const [tab, setTab] = useState("lared");
  const { isMobile, isTablet } = useBreakpoint();

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg,var(--bg-primary) 0%,var(--bg-secondary) 50%,var(--bg-primary) 100%)`,
      color: "var(--text-primary)",
      fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      <Header tab={tab} setTab={setTab} />
      <div style={{
        padding: isMobile ? "12px" : isTablet ? "16px" : "24px",
        maxWidth: 1280, margin: "0 auto",
      }}>
        {tab === "lared" && <TabMineria />}
        {tab === "distribucion" && <TabDistribucion />}
        {tab === "conviccion" && <TabOndas />}
        {tab === "flujos" && <TabFlujos />}
        {tab === "acumuladores" && <TabHolders />}
        {tab === "escasez" && <TabSoberania />}
      </div>
      <Footer />
    </div>
  );
}
