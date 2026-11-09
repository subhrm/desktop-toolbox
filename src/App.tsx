import { useState } from "react";
import Calculator from "./tools/Calculator";
import UnitConverter from "./tools/UnitConverter";
import "./App.css";

type ActiveTool = "calculator" | "converter";

function App() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("calculator");

  return (
    <div className="app-layout">
      {/* Top Application Header / Toolbox Navigation */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon-wrapper" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span className="brand-title">Desktop Toolbox</span>
          <span className="brand-badge">v0.1</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="tools-nav" aria-label="Tool selection">
          <button
            className={`tool-tab-btn ${activeTool === "calculator" ? "active" : ""}`}
            onClick={() => setActiveTool("calculator")}
            type="button"
            aria-current={activeTool === "calculator" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="16" y1="14" x2="16" y2="18" />
              <path d="M16 10h.01" />
              <path d="M12 10h.01" />
              <path d="M8 10h.01" />
              <path d="M12 14h.01" />
              <path d="M8 14h.01" />
              <path d="M12 18h.01" />
              <path d="M8 18h.01" />
            </svg>
            Calculator
          </button>

          <button
            className={`tool-tab-btn ${activeTool === "converter" ? "active" : ""}`}
            onClick={() => setActiveTool("converter")}
            type="button"
            aria-current={activeTool === "converter" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 16-4-4 4-4" />
              <path d="M3 12h18" />
              <path d="m17 8 4 4-4 4" />
            </svg>
            Unit Converter
          </button>
        </nav>

        {/* Status / Quick Info */}
        <div className="header-status">
          <span>Offline Ready</span>
        </div>
      </header>

      {/* Main Tool View */}
      <main className="app-main">
        {activeTool === "calculator" && <Calculator />}
        {activeTool === "converter" && <UnitConverter />}
      </main>
    </div>
  );
}

export default App;
