"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

interface BreakpointState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    breakpoint: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const bp: Breakpoint = w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
      setState({
        breakpoint: bp,
        isMobile: bp === "mobile",
        isTablet: bp === "tablet",
        isDesktop: bp === "desktop",
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return state;
}
