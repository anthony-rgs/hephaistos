import { useState, useEffect } from "react";

const THEME_EVENT = "theme-change";

function applyTheme(dark: boolean) {
  document.body.classList.toggle("dark", dark);
  document.body.classList.toggle("light", !dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
  window.dispatchEvent(new CustomEvent<boolean>(THEME_EVENT, { detail: dark }));
}

export function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    document.body.classList.contains("dark"),
  );

  useEffect(() => {
    const handler = (e: Event) => setIsDark((e as CustomEvent<boolean>).detail);
    window.addEventListener(THEME_EVENT, handler);
    return () => window.removeEventListener(THEME_EVENT, handler);
  }, []);

  return { isDark, toggle: () => applyTheme(!isDark) };
}
