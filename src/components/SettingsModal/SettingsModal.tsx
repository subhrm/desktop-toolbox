import React, { useEffect, useRef } from "react";
import "./SettingsModal.css";

export type ThemeMode = "system" | "light" | "dark";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  effectiveTheme: "light" | "dark";
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  effectiveTheme,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="settings-modal-overlay"
      onClick={onClose}
      data-testid="settings-modal-overlay"
    >
      <div
        className="settings-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* Modal Header */}
        <div className="settings-modal-header">
          <div className="settings-title-group">
            <div className="settings-header-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h2 id="settings-dialog-title" className="settings-modal-title">
              Settings
            </h2>
          </div>
          <button
            className="settings-close-btn"
            onClick={onClose}
            aria-label="Close settings"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="settings-modal-body">
          {/* Theme Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-title">Theme & Appearance</span>
              <span className="settings-section-subtitle">
                Choose light, dark, or sync automatically with your system appearance.
              </span>
            </div>

            <div className="theme-switcher-grid" role="radiogroup" aria-label="Theme switcher">
              {/* System Option */}
              <button
                type="button"
                role="radio"
                aria-checked={theme === "system"}
                className={`theme-card ${theme === "system" ? "selected" : ""}`}
                onClick={() => onThemeChange("system")}
                data-testid="theme-option-system"
              >
                <div className="theme-card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="theme-card-content">
                  <div className="theme-card-header">
                    <span className="theme-card-name">System</span>
                    <span className="theme-badge-default">Default</span>
                  </div>
                  <span className="theme-card-desc">Matches OS appearance</span>
                </div>
                {theme === "system" && (
                  <div className="theme-selected-indicator" aria-hidden="true">
                    ✓
                  </div>
                )}
              </button>

              {/* Light Option */}
              <button
                type="button"
                role="radio"
                aria-checked={theme === "light"}
                className={`theme-card ${theme === "light" ? "selected" : ""}`}
                onClick={() => onThemeChange("light")}
                data-testid="theme-option-light"
              >
                <div className="theme-card-icon light-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </div>
                <div className="theme-card-content">
                  <span className="theme-card-name">Light</span>
                  <span className="theme-card-desc">Clean, warm daylight</span>
                </div>
                {theme === "light" && (
                  <div className="theme-selected-indicator" aria-hidden="true">
                    ✓
                  </div>
                )}
              </button>

              {/* Dark Option */}
              <button
                type="button"
                role="radio"
                aria-checked={theme === "dark"}
                className={`theme-card ${theme === "dark" ? "selected" : ""}`}
                onClick={() => onThemeChange("dark")}
                data-testid="theme-option-dark"
              >
                <div className="theme-card-icon dark-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
                <div className="theme-card-content">
                  <span className="theme-card-name">Dark</span>
                  <span className="theme-card-desc">Deep obsidian slate</span>
                </div>
                {theme === "dark" && (
                  <div className="theme-selected-indicator" aria-hidden="true">
                    ✓
                  </div>
                )}
              </button>
            </div>

            {/* Current Active Status Pill */}
            <div className="theme-status-note">
              <span className="status-indicator-dot" />
              <span>
                Currently active:{" "}
                <strong>
                  {effectiveTheme === "dark" ? "Dark Mode" : "Light Mode"}
                </strong>
                {theme === "system" && " (controlled by device system theme)"}
              </span>
            </div>
          </section>

          {/* Color Palette Information */}
          <section className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-title">Color Palette</span>
              <span className="settings-section-subtitle">
                Vibrant, functional color coding with zero purple.
              </span>
            </div>

            <div className="palette-highlights-row">
              <div className="palette-pill pill-orange">
                <span className="palette-swatch swatch-orange" />
                <div className="palette-info">
                  <strong>Warm Orange</strong>
                  <span>Equals (=) & Brand Hero</span>
                </div>
              </div>

              <div className="palette-pill pill-green">
                <span className="palette-swatch swatch-green" />
                <div className="palette-info">
                  <strong>Emerald Green</strong>
                  <span>Operators (÷, ×, −, +) & Chips</span>
                </div>
              </div>

              <div className="palette-pill pill-red">
                <span className="palette-swatch swatch-red" />
                <div className="palette-info">
                  <strong>Light Red</strong>
                  <span>All Clear (AC) & Reset Actions</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Shortcuts & App Info */}
          <section className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-title">App & Shortcuts</span>
            </div>

            <div className="shortcuts-list">
              <div className="shortcut-row">
                <span className="shortcut-label">Calculate result</span>
                <kbd className="shortcut-kbd">Enter</kbd>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-label">Clear / Close drawer</span>
                <kbd className="shortcut-kbd">Esc</kbd>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-label">Basic operators</span>
                <kbd className="shortcut-kbd">+ - * /</kbd>
              </div>
            </div>

            <div className="app-info-footer">
              <span>Desktop Toolbox v0.1 • Offline-first • Tauri v2 & Rust</span>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="settings-modal-footer">
          <button
            className="settings-done-btn"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
