import React from 'react';
import { Palette, LogOut, Loader2, ChevronUp, Moon, Sun } from 'lucide-react';
import { showToast } from '../Toast';

const SidebarFooter = ({
    theme,
    themes,
    popularThemes,
    showThemeSelector,
    onThemeToggle,
    onThemeChange,
    onLogout,
    isLoggingOut
}) => {

    const handleThemeChange = (newTheme) => {
        onThemeChange(newTheme);
        showToast.success(`Theme changed to ${newTheme}`);
    };

    const isDarkTheme = ['dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'night'].includes(theme);

    return (
        <div className="p-4 border-t border-base-300 space-y-3">

            {/* Theme Selector */}
            <div className="relative">
                <button
                    onClick={onThemeToggle}
                    className="btn btn-ghost btn-sm w-full justify-between group"
                >
                    <div className="flex items-center gap-2">
                        {isDarkTheme ? (
                            <Moon className="w-4 h-4" />
                        ) : (
                            <Sun className="w-4 h-4" />
                        )}
                        <span className="capitalize">Theme: {theme}</span>
                    </div>
                    <ChevronUp className={`w-4 h-4 transition-transform ${showThemeSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Theme Dropdown */}
                {showThemeSelector && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-64 overflow-hidden z-50">

                        {/* Popular Themes Section */}
                        {popularThemes && popularThemes.length > 0 && (
                            <div className="p-2 border-b border-base-300">
                                <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 px-2">
                                    Popular Themes
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {popularThemes.map((themeName) => {
                                        const isCurrentTheme = theme === themeName;
                                        const isThemeDark = ['dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'night'].includes(themeName);

                                        return (
                                            <button
                                                key={themeName}
                                                onClick={() => handleThemeChange(themeName)}
                                                className={`
                                                    flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors
                                                    ${isCurrentTheme
                                                        ? 'bg-primary text-primary-content'
                                                        : 'hover:bg-base-200 text-base-content'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isThemeDark ? (
                                                        <Moon className="w-3 h-3" />
                                                    ) : (
                                                        <Sun className="w-3 h-3" />
                                                    )}
                                                    <span className="capitalize">{themeName}</span>
                                                </div>

                                                {isCurrentTheme && (
                                                    <div className="w-2 h-2 bg-primary-content rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* All Themes Section */}
                        <div className="p-2">
                            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 px-2">
                                All Themes
                            </div>

                            <div className="max-h-40 overflow-y-auto">
                                <div className="grid grid-cols-1 gap-1">
                                    {themes.map((themeName) => {
                                        const isCurrentTheme = theme === themeName;
                                        const isThemeDark = ['dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'night'].includes(themeName);

                                        return (
                                            <button
                                                key={themeName}
                                                onClick={() => handleThemeChange(themeName)}
                                                className={`
                                                    flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors
                                                    ${isCurrentTheme
                                                        ? 'bg-primary text-primary-content'
                                                        : 'hover:bg-base-200 text-base-content'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isThemeDark ? (
                                                        <Moon className="w-3 h-3" />
                                                    ) : (
                                                        <Sun className="w-3 h-3" />
                                                    )}
                                                    <span className="capitalize">{themeName}</span>
                                                </div>

                                                {isCurrentTheme && (
                                                    <div className="w-2 h-2 bg-primary-content rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* App Info */}
            <div className="px-2 py-1 text-center">
                <div className="text-xs text-base-content/40">
                    ChatMe v1.0.0
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={onLogout}
                disabled={isLoggingOut}
                className="btn btn-ghost btn-sm w-full justify-start text-error hover:bg-error/10 hover:text-error"
            >
                {isLoggingOut ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging out...
                    </>
                ) : (
                    <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </>
                )}
            </button>
        </div>
    );
};

export default SidebarFooter;