"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TabDistribucion from "@/components/tabs/TabDistribucion";
import TabOndas from "@/components/tabs/TabOndas";
import TabFlujos from "@/components/tabs/TabFlujos";
import TabMineria from "@/components/tabs/TabMineria";
import TabHolders from "@/components/tabs/TabHolders";
import TabSoberania from "@/components/tabs/TabSoberania";
import TabDerivados from "@/components/tabs/TabDerivados";
import TabPrecio from "@/components/tabs/TabPrecio";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const VALID_TABS = new Set([
  "lared", "distribucion", "conviccion", "flujos",
  "acumuladores", "escasez", "precio", "derivados",
]);

function getTabFromHash(): string {
  if (typeof window === "undefined") return "lared";
  const hash = window.location.hash.slice(1); // remove #
  return VALID_TABS.has(hash) ? hash : "lared";
}

export default function Dashboard() {
  const [tab, setTabState] = useState(getTabFromHash);
  const { isMobile, isTablet } = useBreakpoint();
  const scrollPositions = useRef<Record<string, number>>({});
  const isRestoringScroll = useRef(false);

  // Sync hash → state on popstate (browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const newTab = getTabFromHash();
      if (newTab !== tab) {
        setTabState(newTab);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [tab]);

  // Save scroll position on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!isRestoringScroll.current) {
        scrollPositions.current[tab] = window.scrollY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tab]);

  // Restore scroll when tab changes
  useEffect(() => {
    isRestoringScroll.current = true;
    const saved = scrollPositions.current[tab] ?? 0;
    window.scrollTo(0, saved);
    // Small delay to let content render before allowing scroll tracking
    const t = setTimeout(() => { isRestoringScroll.current = false; }, 100);
    return () => clearTimeout(t);
  }, [tab]);

  // setTab: save scroll, update hash, update state
  const setTab = useCallback((newTab: string) => {
    scrollPositions.current[tab] = window.scrollY;
    window.history.pushState(null, "", `#${newTab}`);
    setTabState(newTab);
  }, [tab]);

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
        <ErrorBoundary key={tab}>
          {tab === "lared" && <TabMineria />}
          {tab === "distribucion" && <TabDistribucion />}
          {tab === "conviccion" && <TabOndas />}
          {tab === "flujos" && <TabFlujos />}
          {tab === "acumuladores" && <TabHolders />}
          {tab === "escasez" && <TabSoberania />}
          {tab === "precio" && <TabPrecio />}
          {tab === "derivados" && <TabDerivados />}
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}
