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

export default function Dashboard() {
  const [tab, setTab] = useState("soberania");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#080c12 0%,#0a0f18 50%,#080c12 100%)",
      color: "#e0e8f0",
      fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      <Header tab={tab} setTab={setTab} />
      <div style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
        {tab === "distribucion" && <TabDistribucion />}
        {tab === "soberania" && <TabSoberania />}
        {tab === "ondas" && <TabOndas />}
        {tab === "flujos" && <TabFlujos />}
        {tab === "mineria" && <TabMineria />}
        {tab === "holders" && <TabHolders />}
      </div>
      <Footer />
    </div>
  );
}
