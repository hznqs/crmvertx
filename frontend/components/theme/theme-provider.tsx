"use client";

import { createContext, useContext, useEffect } from "react";
import { crmTheme, type CrmTheme } from "@/lib/theme/tokens";

const ThemeContext = createContext<CrmTheme>(crmTheme);

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    document.documentElement.dataset.crmTheme = "enterprise-dark";
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={crmTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useCrmTheme() {
  return useContext(ThemeContext);
}
