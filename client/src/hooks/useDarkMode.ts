import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference on mount
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    
    // We default to dark mode for this site unless light is explicitly set
    if (storedTheme === "light" || (!storedTheme && prefersLight)) {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggle = () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  return { isDark, toggle };
}