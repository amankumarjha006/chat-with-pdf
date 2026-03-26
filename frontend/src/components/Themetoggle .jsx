import { useState, useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ensureSweepOverlay() {
  let el = document.getElementById("theme-sweep");
  if (!el) {
    el = document.createElement("div");
    el.id = "theme-sweep";
    document.body.appendChild(el);
  }
  return el;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const sweepingRef = useRef(false);

  // Apply theme on mount without animation
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, []);

  function toggle() {
    if (sweepingRef.current) return;
    sweepingRef.current = true;

    const nextTheme = theme === "dark" ? "light" : "dark";
    const overlay = ensureSweepOverlay();

    // Set overlay color to the NEW theme's background
    overlay.className = nextTheme === "dark" ? "sweep-dark" : "sweep-light";

    // Force reflow so clip-path starts at 0%
    void overlay.offsetWidth;

    // Trigger sweep animation
    overlay.classList.add("sweeping");

    // Halfway through, swap actual theme (invisible under overlay)
    setTimeout(() => {
      const root = document.documentElement;
      if (nextTheme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      localStorage.setItem("theme", nextTheme);
      setTheme(nextTheme);
    }, 320);

    // After animation completes, reset overlay
    setTimeout(() => {
      overlay.classList.remove("sweeping");
      overlay.className = "";
      sweepingRef.current = false;
    }, 700);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl overflow-hidden hover:bg-primary/10 shrink-0"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        className={`w-[17px] h-[17px] absolute transition-all duration-400 ease-out ${
          theme === "dark"
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`w-[17px] h-[17px] absolute transition-all duration-400 ease-out ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}