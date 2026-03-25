import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggle() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl overflow-hidden transition-all duration-300 hover:bg-primary/10"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon */}
      <Sun
        className={`w-[18px] h-[18px] absolute transition-all duration-500 ease-out ${
          theme === "dark"
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      {/* Moon icon */}
      <Moon
        className={`w-[18px] h-[18px] absolute transition-all duration-500 ease-out ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
