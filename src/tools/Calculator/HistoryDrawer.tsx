import React from "react";
import { CalculationHistoryItem } from "../../services/calculatorService";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onSelectResult: (result: string) => void;
  onSelectExpression: (expression: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onSelectExpression,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="history-drawer-overlay" onClick={onClose}>
      <aside
        className="history-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Calculation History"
      >
        <div className="history-drawer-header">
          <div className="history-header-title">
            <svg
              className="history-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h3>Calculation History</h3>
          </div>
          <button
            className="history-close-btn"
            onClick={onClose}
            aria-label="Close History"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="history-drawer-content">
          {history.length === 0 ? (
            <div className="history-empty">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <p>There's no history yet</p>
              <span>Calculations you perform will be saved here for easy recall.</span>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-top">
                    <span className="history-unit-badge">{item.angleUnit.toUpperCase()}</span>
                    <span className="history-time">
                      {new Intl.DateTimeFormat([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(item.timestamp)}
                    </span>
                  </div>
                  <button
                    className="history-expr-btn"
                    onClick={() => onSelectExpression(item.expression)}
                    title="Click to load expression"
                  >
                    {item.expression} =
                  </button>
                  <button
                    className="history-result-btn"
                    onClick={() => onSelectResult(item.result)}
                    title="Click to insert result"
                  >
                    {item.result}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="history-drawer-footer">
            <button
              className="history-clear-btn"
              onClick={onClearHistory}
              title="Clear all saved history"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear History
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
