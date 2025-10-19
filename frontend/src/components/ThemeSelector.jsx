import { PaletteIcon } from "lucide-react";
import { THEMES, } from "../constants/themeStore";
import { useThemeStore } from "../store/useThemeStore";

function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

 
  return (
    <div className="dropdown dropdown-end">
      {/* Dropdown Trigger */}
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <PaletteIcon className="size-5" />
      </div>

      {/* Dropdown Content */}
      <div
        tabIndex={0}
        className="dropdown-content z-[1] w-56 p-1 mt-2 overflow-y-auto border shadow-2xl bg-base-200 backdrop-blur-lg rounded-2xl border-base-content/10 max-h-80"
      >
        <div className="space-y-1">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              type="button"
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
                ${
                  theme === themeOption.label
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-base-content/5"
                }`}
              onClick={() => setTheme(themeOption.label)}
            >
              <PaletteIcon className="size-4" />
              <span className="text-sm font-medium">{themeOption.label}</span>
              
              {/* Theme Preview colors */}
              <div className="flex gap-1 ml-auto">
                {themeOption.colors.map((color, i) => (
                  <span
                    key={i}
                    className="rounded-full size-2"
                    style={{ backgroundColor: color }}
                  ></span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemeSelector;