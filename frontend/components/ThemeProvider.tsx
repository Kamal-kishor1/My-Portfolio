import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ theme: string; toggle: () => void }>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const resolved = stored ?? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(resolved);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("light", theme === "light"); localStorage.setItem("theme", theme); }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme((value) => value === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
