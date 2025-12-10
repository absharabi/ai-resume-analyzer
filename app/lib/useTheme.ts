import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "resumind-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, next);
    }
  };

  return { theme, toggleTheme };
}

function applyTheme(next: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (next === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

