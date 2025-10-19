import { create } from 'zustand';

const initialTheme = localStorage.getItem("chatme-theme") || "coffee";
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", initialTheme);
}

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem("chatme-theme", theme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    set({ theme });
  }
}));