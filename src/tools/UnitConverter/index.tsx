import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getUnitCategories,
  convertUnits,
  convertToAllUnits,
  CategoryInfo,
  ConversionResult,
  AllConversionsResult,
} from "../../services/unitConverterService";
import CategoryPattern from "./CategoryPattern";
import "./unitConverter.css";

// SVG Category Icons helper
const CategoryIcon: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case "thermometer":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      );
    case "ruler":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4z" />
          <path d="m14.5 3.5 2 2" />
          <path d="m11.5 6.5 2 2" />
          <path d="m8.5 9.5 2 2" />
          <path d="m5.5 12.5 2 2" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "droplet":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
      );
    case "gauge":
    case "gauge-circle":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      );
    case "hard-drive":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="12" x2="2" y2="12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          <line x1="6" y1="16" x2="6.01" y2="16" />
          <line x1="10" y1="16" x2="10.01" y2="16" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "zap":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const CATEGORY_PRESETS: Record<string, number[]> = {
  temperature: [-40, 0, 20, 25, 37, 100],
  distance: [1, 5, 10, 50, 100, 1000],
  area: [1, 10, 100, 500, 1000, 10000],
  volume: [1, 2, 5, 10, 50, 100],
  mass: [1, 5, 10, 50, 100, 500],
  speed: [30, 50, 60, 80, 100, 120],
  digital: [1, 8, 16, 64, 128, 512, 1024],
  time: [1, 5, 15, 30, 60, 3600],
  pressure: [1, 2, 5, 10, 14.7, 100],
  energy: [100, 500, 1000, 2000, 5000],
};

export const UnitConverter: React.FC = () => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("distance");
  const [fromUnitId, setFromUnitId] = useState<string>("m");
  const [toUnitId, setToUnitId] = useState<string>("ft");
  const [inputValue, setInputValue] = useState<string>("1");
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [allConversions, setAllConversions] = useState<AllConversionsResult | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getUnitCategories();
        setCategories(cats);
        if (cats.length > 0) {
          const firstCat = cats[0];
          setActiveCategoryId(firstCat.id);
          setFromUnitId(firstCat.default_from);
          setToUnitId(firstCat.default_to);
        }
      } catch (err: unknown) {
        setError(typeof err === "string" ? err : "Failed to load unit categories");
      }
    }
    loadCategories();
  }, []);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  // Handle category change
  const handleSelectCategory = (cat: CategoryInfo) => {
    setActiveCategoryId(cat.id);
    setFromUnitId(cat.default_from);
    setToUnitId(cat.default_to);
    setError(null);
    // Sensible default value per category
    if (cat.id === "temperature") {
      setInputValue("25");
    } else {
      setInputValue("1");
    }
  };

  // Convert whenever parameters change
  const runConversion = useCallback(async () => {
    if (!activeCategoryId || !fromUnitId || !toUnitId) return;

    const numericVal = parseFloat(inputValue);
    if (isNaN(numericVal)) {
      setConversionResult(null);
      setAllConversions(null);
      return;
    }

    try {
      setError(null);
      const [resSingle, resAll] = await Promise.all([
        convertUnits(activeCategoryId, fromUnitId, toUnitId, numericVal),
        convertToAllUnits(activeCategoryId, fromUnitId, numericVal),
      ]);
      setConversionResult(resSingle);
      setAllConversions(resAll);
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : (err as Error)?.message || "Conversion failed";
      setError(msg);
      setConversionResult(null);
    }
  }, [activeCategoryId, fromUnitId, toUnitId, inputValue]);

  useEffect(() => {
    runConversion();
  }, [runConversion]);

  // Swap From and To units
  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
    if (conversionResult) {
      setInputValue(conversionResult.formatted_result);
    }
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    if (!conversionResult) return;
    navigator.clipboard.writeText(conversionResult.formatted_result);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 1500);
  };

  const handleCopyValue = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 1500);
  };

  // Filter breakdown units
  const filteredConversions = useMemo(() => {
    if (!allConversions) return [];
    if (!searchQuery.trim()) return allConversions.conversions;
    const q = searchQuery.toLowerCase().trim();
    return allConversions.conversions.filter(
      (c) =>
        c.unit_name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.unit_id.toLowerCase().includes(q)
    );
  }, [allConversions, searchQuery]);

  const presets = CATEGORY_PRESETS[activeCategoryId] || [1, 5, 10, 50, 100];

  return (
    <div className="converter-page-container">
      {/* Full-Page Category Background Geometric Pattern */}
      <CategoryPattern
        categoryId={activeCategoryId}
        idPrefix="page"
        className="converter-page-pattern"
      />

      <div className="converter-layout">
        {/* Left Sidebar: Categories Navigation */}
        <aside className="converter-sidebar" aria-label="Unit categories">
          <div className="converter-sidebar-header">
            <span className="sidebar-section-title">Categories</span>
            <span className="sidebar-count">{categories.length}</span>
          </div>
          <nav className="converter-category-list" role="tablist" aria-label="Conversion categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`converter-category-item ${cat.id === activeCategoryId ? "active" : ""}`}
                onClick={() => handleSelectCategory(cat)}
                role="tab"
                aria-selected={cat.id === activeCategoryId}
                type="button"
              >
                <span className="category-icon">
                  <CategoryIcon icon={cat.icon} />
                </span>
                <span className="category-name">{cat.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Column: Main Converter Workspace */}
        <div className="converter-main-workspace">
          {/* Error Banner */}
          {error && (
            <div className="converter-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Main Conversion Card */}
          <div className="converter-main-card">
            {/* Category Background Geometric Pattern inside card */}
            <CategoryPattern
              categoryId={activeCategoryId}
              idPrefix="card"
              className="converter-card-pattern"
            />

          {/* Card Header Category Badge */}
          <div className="converter-card-header">
            <div className="category-badge-chip">
              <span className="category-badge-icon">
                <CategoryIcon icon={activeCategory?.icon || "grid"} />
              </span>
              <span className="category-badge-title">{activeCategory?.name}</span>
            </div>
            <span className="category-units-count">
              {activeCategory?.units.length || 0} units
            </span>
          </div>

          {showCopiedToast && <div className="copy-toast">Copied to clipboard!</div>}

        <div className="conversion-panels-row">
          {/* FROM Panel */}
          <div className="conversion-panel">
            <span className="conversion-panel-label">From</span>
            <div className="conversion-input-wrapper">
              <input
                type="number"
                className="conversion-value-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                aria-label="Value to convert from"
              />
            </div>
            <select
              className="unit-select"
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              aria-label="Select source unit"
            >
              {activeCategory?.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* SWAP Button */}
          <div className="swap-button-wrapper">
            <button
              className="swap-btn"
              onClick={handleSwap}
              title="Swap units"
              aria-label="Swap units"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 16-4-4 4-4" />
                <path d="M3 12h18" />
                <path d="m17 8 4 4-4 4" />
              </svg>
            </button>
          </div>

          {/* TO Panel */}
          <div className="conversion-panel">
            <span className="conversion-panel-label">To</span>
            <div className="conversion-input-wrapper">
              <div className="conversion-value-display">
                {conversionResult ? conversionResult.formatted_result : "—"}
              </div>
            </div>
            <select
              className="unit-select"
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              aria-label="Select target unit"
            >
              {activeCategory?.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula & Actions Footer */}
        <div className="conversion-info-bar">
          <div className="conversion-formula">
            <span>Formula:</span>
            <span className="formula-highlight">
              {conversionResult ? conversionResult.formula : "—"}
            </span>
          </div>

          <button
            className="card-action-btn"
            onClick={handleCopyResult}
            disabled={!conversionResult}
            type="button"
            title="Copy converted value"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Result
          </button>
        </div>

        {/* Quick Presets */}
        <div className="presets-container">
          <span className="presets-label">Quick Values:</span>
          {presets.map((val) => (
            <button
              key={val}
              className="preset-chip"
              onClick={() => setInputValue(val.toString())}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* All Units Breakdown Section */}
      <section className="breakdown-section" aria-label="All units breakdown">
        <div className="breakdown-header">
          <div className="breakdown-title-group">
            <h3>All Units Breakdown</h3>
            <p>
              Converted values for {inputValue || "0"}{" "}
              {activeCategory?.units.find((u) => u.id === fromUnitId)?.symbol || ""} across all{" "}
              {activeCategory?.name} units:
            </p>
          </div>

          <input
            type="text"
            className="breakdown-search-input"
            placeholder="Filter units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter units"
          />
        </div>

        <div className="breakdown-grid">
          {filteredConversions.map((row) => {
            const isCurrentTarget = row.unit_id === toUnitId;
            return (
              <div
                key={row.unit_id}
                className={`breakdown-card ${isCurrentTarget ? "active-unit" : ""}`}
                onClick={() => {
                  setToUnitId(row.unit_id);
                  handleCopyValue(row.formatted);
                }}
                title={`Click to set as target and copy value (${row.formatted})`}
                role="button"
                tabIndex={0}
              >
                <div className="breakdown-card-top">
                  <span className="breakdown-unit-name">{row.unit_name}</span>
                  <span className="breakdown-unit-symbol">{row.symbol}</span>
                </div>
                <div className="breakdown-value">{row.formatted}</div>
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
    </div>
  );
};

export default UnitConverter;
