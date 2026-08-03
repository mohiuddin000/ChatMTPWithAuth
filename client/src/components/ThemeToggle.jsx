import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";

export default function ThemeToggle({ className = "" }) {
    const { theme, toggleTheme } = useContext(AppContent);
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            aria-label={
                isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`w-9 h-9 flex items-center justify-center rounded-full border border-border text-text-muted hover:text-text hover:border-accent transition-colors ${className}`}
        >
            {isDark ? (
                // sun icon (click to go light)
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="M4.93 4.93l1.41 1.41" />
                    <path d="M17.66 17.66l1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="M6.34 17.66l-1.41 1.41" />
                    <path d="M19.07 4.93l-1.41 1.41" />
                </svg>
            ) : (
                // moon icon (click to go dark)
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                </svg>
            )}
        </button>
    );
}
