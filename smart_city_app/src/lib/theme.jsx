import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export const PALETTES = [
  { id: "terra",    name: "Terra",    tagline: "Earthy · Civic",  swatch: ["#2b5c3f", "#c96a3a", "#f6f2e8", "#1e2a24"] },
  { id: "ocean",    name: "Ocean",    tagline: "Cool · Trust",    swatch: ["#1f3b8b", "#3fb8c6", "#eef4fb", "#0d1a3a"] },
  { id: "midnight", name: "Midnight", tagline: "Deep · Modern",   swatch: ["#3a1b6e", "#e34ba0", "#f3f0f8", "#141024"] },
  { id: "sunset",   name: "Sunset",   tagline: "Warm · Vivid",    swatch: ["#c1362f", "#f0a835", "#fdf3e6", "#231512"] },
];

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => localStorage.getItem("nagarik-mode") || "light");
  const [palette, setPaletteState] = useState(() => localStorage.getItem("nagarik-palette") || "terra");

  // Apply theme to <html> element whenever mode or palette changes
  useEffect(() => {
    const root = document.documentElement;

    // Set data-theme attribute for palette
    root.setAttribute("data-theme", palette);

    // Toggle dark class
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Persist
    localStorage.setItem("nagarik-mode", mode);
    localStorage.setItem("nagarik-palette", palette);
  }, [mode, palette]);

  const setMode = (m) => setModeState(m);
  const setPalette = (p) => setPaletteState(p);
  const toggleMode = () => setModeState((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <Ctx.Provider value={{ mode, palette, setMode, setPalette, toggleMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be inside ThemeProvider");
  return c;
}
