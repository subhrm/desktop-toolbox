import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  evaluateCalculatorExpression,
  CalculationHistoryItem,
  AngleUnit,
} from "../../services/calculatorService";
import { CalculatorMode } from "./types";
import { HistoryDrawer } from "./HistoryDrawer";
import "./calculator.css";

export const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>("");
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [previousExpr, setPreviousExpr] = useState<string>("");
  const [mode, setMode] = useState<CalculatorMode>("scientific");
  const [angleUnit, setAngleUnit] = useState<AngleUnit>("deg");
  const [isSecondFunction, setIsSecondFunction] = useState<boolean>(false);
  const [isHyperbolic, setIsHyperbolic] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Clear or reset error when user types or clicks
  const clearError = () => {
    if (error) setError(null);
  };

  // Perform calculation
  const handleCalculate = useCallback(async () => {
    const exprToEvaluate = expression.trim() || displayValue;
    if (!exprToEvaluate || exprToEvaluate === "0") return;

    try {
      clearError();
      const res = await evaluateCalculatorExpression(exprToEvaluate, angleUnit);
      setDisplayValue(res.formatted);
      setPreviousExpr(`${exprToEvaluate} =`);
      setJustEvaluated(true);

      // Add to history
      const historyItem: CalculationHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        expression: exprToEvaluate,
        result: res.formatted,
        numericResult: res.result,
        timestamp: new Date(),
        angleUnit,
      };
      setHistory((prev) => [historyItem, ...prev]);
    } catch (err: unknown) {
      const errMsg = typeof err === "string" ? err : (err as Error)?.message || "Calculation error";
      setError(errMsg);
    }
  }, [expression, displayValue, angleUnit]);

  // Append character or function token
  const handleAppend = (token: string, isFunction = false) => {
    clearError();
    if (justEvaluated) {
      // If user presses an operator after calculation, continue with the result
      if (["+", "-", "×", "÷", "*", "/", "^", "%"].includes(token)) {
        setExpression(displayValue + " " + token + " ");
        setDisplayValue(displayValue);
        setJustEvaluated(false);
        return;
      }
      // If user enters a number or function, start fresh
      if (isFunction) {
        setExpression(token + "(");
        setDisplayValue(token + "(");
      } else {
        setExpression(token);
        setDisplayValue(token);
      }
      setJustEvaluated(false);
      return;
    }

    if (isFunction) {
      setExpression((prev) => prev + token + "(");
      setDisplayValue((prev) => (prev === "0" ? token + "(" : prev + token + "("));
    } else {
      setExpression((prev) => prev + token);
      setDisplayValue((prev) => (prev === "0" && token !== "." ? token : prev + token));
    }
  };

  // Number input
  const handleNumber = (digit: string) => {
    clearError();
    if (justEvaluated) {
      setExpression(digit);
      setDisplayValue(digit);
      setJustEvaluated(false);
      return;
    }

    if (expression === "" || expression === "0") {
      setExpression(digit);
      setDisplayValue(digit);
    } else {
      setExpression((prev) => prev + digit);
      setDisplayValue((prev) => (prev === "0" ? digit : prev + digit));
    }
  };

  // Operator input
  const handleOperator = (op: string) => {
    clearError();
    const formattedOp = ` ${op} `;
    if (justEvaluated) {
      setExpression(displayValue + formattedOp);
      setJustEvaluated(false);
      return;
    }

    if (!expression) {
      setExpression(displayValue + formattedOp);
    } else {
      setExpression((prev) => prev + formattedOp);
    }
  };

  // Clear All
  const handleAllClear = () => {
    setExpression("");
    setDisplayValue("0");
    setPreviousExpr("");
    setError(null);
    setJustEvaluated(false);
  };

  // Clear Entry
  const handleClear = () => {
    setExpression("");
    setDisplayValue("0");
    setError(null);
    setJustEvaluated(false);
  };

  // Backspace
  const handleBackspace = () => {
    clearError();
    if (justEvaluated) {
      handleClear();
      return;
    }

    setExpression((prev) => {
      if (prev.length <= 1) return "";
      return prev.slice(0, -1);
    });

    setDisplayValue((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  // Negate current number (±)
  const handleNegate = () => {
    clearError();
    if (justEvaluated) {
      if (displayValue.startsWith("-")) {
        const positive = displayValue.slice(1);
        setDisplayValue(positive);
        setExpression(positive);
      } else {
        const negative = `-${displayValue}`;
        setDisplayValue(negative);
        setExpression(negative);
      }
      return;
    }

    if (!expression || expression === "0") {
      setExpression("-");
      setDisplayValue("-");
    } else if (expression.startsWith("-(") && expression.endsWith(")")) {
      const inner = expression.slice(2, -1);
      setExpression(inner);
      setDisplayValue(inner);
    } else {
      setExpression((prev) => `-(${prev})`);
      setDisplayValue((prev) => `-(${prev})`);
    }
  };

  // Percentage
  const handlePercentage = () => {
    clearError();
    handleAppend("%");
  };

  // Memory Functions
  const handleMemoryClear = () => setMemory(0);
  const handleMemoryRecall = () => {
    clearError();
    handleNumber(memory.toString());
  };
  const handleMemoryAdd = async () => {
    try {
      const res = await evaluateCalculatorExpression(displayValue || expression || "0", angleUnit);
      setMemory((prev) => prev + res.result);
    } catch {
      // Ignore evaluation failure for memory add
    }
  };
  const handleMemorySubtract = async () => {
    try {
      const res = await evaluateCalculatorExpression(displayValue || expression || "0", angleUnit);
      setMemory((prev) => prev - res.result);
    } catch {
      // Ignore
    }
  };
  const handleMemoryStore = async () => {
    try {
      const res = await evaluateCalculatorExpression(displayValue || expression || "0", angleUnit);
      setMemory(res.result);
    } catch {
      // Ignore
    }
  };

  // Copy result to clipboard
  const handleCopy = () => {
    const textToCopy = displayValue || expression;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 1500);
  };

  // Global Keyboard listener for physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is actively typing in a standard text field elsewhere
      if (e.target instanceof HTMLInputElement && e.target !== inputRef.current) {
        return;
      }

      const key = e.key;

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        handleNumber(key);
      } else if (key === ".") {
        e.preventDefault();
        handleAppend(".");
      } else if (key === "+" || key === "-") {
        e.preventDefault();
        handleOperator(key);
      } else if (key === "*") {
        e.preventDefault();
        handleOperator("*");
      } else if (key === "/") {
        e.preventDefault();
        handleOperator("/");
      } else if (key === "%") {
        e.preventDefault();
        handlePercentage();
      } else if (key === "^") {
        e.preventDefault();
        handleOperator("^");
      } else if (key === "(" || key === ")") {
        e.preventDefault();
        handleAppend(key);
      } else if (key === "!" && mode === "scientific") {
        e.preventDefault();
        handleAppend("!");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Escape") {
        e.preventDefault();
        handleAllClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCalculate, justEvaluated, displayValue, expression, mode]);

  // Adjust display font size based on string length
  const getDisplayClass = () => {
    const len = displayValue.length;
    if (len > 18) return "very-long-text";
    if (len > 11) return "long-text";
    return "";
  };

  return (
    <div className="calculator-container">
      {/* Top Controls Toolbar */}
      <div className="calculator-toolbar">
        <div className="mode-toggle-group">
          <button
            className={`mode-toggle-btn ${mode === "basic" ? "active" : ""}`}
            onClick={() => setMode("basic")}
            type="button"
          >
            Basic
          </button>
          <button
            className={`mode-toggle-btn ${mode === "scientific" ? "active" : ""}`}
            onClick={() => setMode("scientific")}
            type="button"
          >
            Scientific
          </button>
        </div>

        <div className="toolbar-actions">
          {mode === "scientific" && (
            <button
              className={`tool-icon-btn unit-chip ${angleUnit === "deg" ? "active" : ""}`}
              onClick={() => setAngleUnit((u) => (u === "deg" ? "rad" : "deg"))}
              type="button"
              title="Toggle Angle Unit (Degrees / Radians)"
            >
              {angleUnit.toUpperCase()}
            </button>
          )}

          <button
            className="tool-icon-btn"
            onClick={() => setIsHistoryOpen(true)}
            type="button"
            title="View calculation history"
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </button>
        </div>
      </div>

      {/* Main Calculator Body */}
      <div className={`calculator-card ${mode === "scientific" ? "scientific" : ""}`}>
        {/* Display Screen */}
        <div className="calculator-display-container">
          {showCopiedToast && <div className="copy-toast">Copied to clipboard!</div>}

          <div className="display-status-bar">
            <div className="status-badges">
              {mode === "scientific" && (
                <span className="badge active-badge">{angleUnit.toUpperCase()}</span>
              )}
              {mode === "scientific" && isSecondFunction && (
                <span className="badge active-badge">2nd</span>
              )}
              {mode === "scientific" && isHyperbolic && (
                <span className="badge active-badge">HYP</span>
              )}
              {memory !== 0 && <span className="badge active-badge">M</span>}
            </div>

            <div className="display-actions">
              <button
                className="display-action-btn"
                onClick={handleCopy}
                title="Copy current result"
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button
                className="display-action-btn"
                onClick={handleBackspace}
                title="Backspace (Delete last character)"
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Secondary Expression Row */}
          <div className="display-expression-row">
            <input
              ref={inputRef}
              type="text"
              className="display-expression-input"
              value={previousExpr || expression}
              onChange={(e) => {
                setExpression(e.target.value);
                setDisplayValue(e.target.value);
                clearError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCalculate();
                }
              }}
              placeholder=""
              aria-label="Calculator Expression"
            />
          </div>

          {/* Primary Result Row */}
          <div className="display-result-row">
            <div className={`display-result-text ${getDisplayClass()}`}>{displayValue}</div>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="calculator-error-banner" role="alert">
            <span>{error}</span>
            <button className="error-close-btn" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        )}

        {/* Memory Bar */}
        <div className="memory-bar">
          <button
            className="btn-memory"
            onClick={handleMemoryClear}
            disabled={memory === 0}
            title="Memory Clear"
            type="button"
          >
            MC
          </button>
          <button
            className="btn-memory"
            onClick={handleMemoryRecall}
            disabled={memory === 0}
            title="Memory Recall"
            type="button"
          >
            MR
          </button>
          <button
            className="btn-memory"
            onClick={handleMemoryAdd}
            title="Memory Add"
            type="button"
          >
            M+
          </button>
          <button
            className="btn-memory"
            onClick={handleMemorySubtract}
            title="Memory Subtract"
            type="button"
          >
            M-
          </button>
          <button
            className="btn-memory"
            onClick={handleMemoryStore}
            title="Memory Store"
            type="button"
          >
            MS
          </button>
        </div>

        {/* Keypad Container */}
        <div className="keypad-container">
          {/* Scientific Keypad (Visible in scientific mode) */}
          {mode === "scientific" && (
            <div className="scientific-keypad">
              {/* Row 1 */}
              <button
                className={`calc-btn btn-scientific ${isSecondFunction ? "active" : ""}`}
                onClick={() => setIsSecondFunction((prev) => !prev)}
                title="Toggle 2nd functions"
                type="button"
              >
                2<sup>nd</sup>
              </button>
              <button
                className={`calc-btn btn-scientific ${angleUnit === "rad" ? "active" : ""}`}
                onClick={() => setAngleUnit((u) => (u === "deg" ? "rad" : "deg"))}
                type="button"
              >
                {angleUnit.toUpperCase()}
              </button>
              <button
                className={`calc-btn btn-scientific ${isHyperbolic ? "active" : ""}`}
                onClick={() => setIsHyperbolic((prev) => !prev)}
                title="Toggle hyperbolic functions"
                type="button"
              >
                hyp
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("fact", true)}
                title="Factorial x!"
                type="button"
              >
                x!
              </button>

              {/* Row 2: Trig Functions */}
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isHyperbolic) {
                    handleAppend(isSecondFunction ? "asinh" : "sinh", true);
                  } else {
                    handleAppend(isSecondFunction ? "asin" : "sin", true);
                  }
                }}
                type="button"
              >
                {isHyperbolic
                  ? isSecondFunction
                    ? "sinh⁻¹"
                    : "sinh"
                  : isSecondFunction
                  ? "sin⁻¹"
                  : "sin"}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isHyperbolic) {
                    handleAppend(isSecondFunction ? "acosh" : "cosh", true);
                  } else {
                    handleAppend(isSecondFunction ? "acos" : "cos", true);
                  }
                }}
                type="button"
              >
                {isHyperbolic
                  ? isSecondFunction
                    ? "cosh⁻¹"
                    : "cosh"
                  : isSecondFunction
                  ? "cos⁻¹"
                  : "cos"}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isHyperbolic) {
                    handleAppend(isSecondFunction ? "atanh" : "tanh", true);
                  } else {
                    handleAppend(isSecondFunction ? "atan" : "tan", true);
                  }
                }}
                type="button"
              >
                {isHyperbolic
                  ? isSecondFunction
                    ? "tanh⁻¹"
                    : "tanh"
                  : isSecondFunction
                  ? "tan⁻¹"
                  : "tan"}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("inv", true)}
                title="Reciprocal 1/x"
                type="button"
              >
                1/x
              </button>

              {/* Row 3: Logarithms & Exponentials */}
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isSecondFunction) {
                    handleAppend("exp", true);
                  } else {
                    handleAppend("ln", true);
                  }
                }}
                type="button"
              >
                {isSecondFunction ? (
                  <span>
                    e<span className="btn-sup">x</span>
                  </span>
                ) : (
                  "ln"
                )}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isSecondFunction) {
                    handleAppend("10^");
                  } else {
                    handleAppend("log10", true);
                  }
                }}
                type="button"
              >
                {isSecondFunction ? (
                  <span>
                    10<span className="btn-sup">x</span>
                  </span>
                ) : (
                  "log"
                )}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isSecondFunction) {
                    handleAppend("2^");
                  } else {
                    handleAppend("log2", true);
                  }
                }}
                type="button"
              >
                {isSecondFunction ? (
                  <span>
                    2<span className="btn-sup">x</span>
                  </span>
                ) : (
                  <span>
                    log<span className="btn-sub">2</span>
                  </span>
                )}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("abs", true)}
                title="Absolute value |x|"
                type="button"
              >
                |x|
              </button>

              {/* Row 4: Powers & Roots */}
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isSecondFunction) {
                    handleAppend("sqrt", true);
                  } else {
                    handleAppend("^2");
                  }
                }}
                type="button"
              >
                {isSecondFunction ? "√x" : <span>x<sup>2</sup></span>}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isSecondFunction) {
                    handleAppend("cbrt", true);
                  } else {
                    handleAppend("^3");
                  }
                }}
                type="button"
              >
                {isSecondFunction ? "∛x" : <span>x<sup>3</sup></span>}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => {
                  if (isSecondFunction) {
                    handleAppend("root", true);
                  } else {
                    handleAppend("^");
                  }
                }}
                type="button"
              >
                {isSecondFunction ? "ʸ√x" : <span>x<sup>y</sup></span>}
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("sqrt", true)}
                type="button"
              >
                √
              </button>

              {/* Row 5: Constants & Brackets */}
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("pi")}
                title="Pi constant (3.14159...)"
                type="button"
              >
                π
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("e")}
                title="Euler's number (2.71828...)"
                type="button"
              >
                e
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend("(")}
                type="button"
              >
                (
              </button>
              <button
                className="calc-btn btn-scientific"
                onClick={() => handleAppend(")")}
                type="button"
              >
                )
              </button>
            </div>
          )}

          {/* Basic Standard Keypad */}
          <div className="basic-keypad">
            {/* Row 1 */}
            <button
              className="calc-btn btn-clear"
              onClick={handleAllClear}
              title="All Clear"
              type="button"
            >
              AC
            </button>
            <button
              className="calc-btn btn-function"
              onClick={handleNegate}
              title="Toggle Sign (+/-)"
              type="button"
            >
              ±
            </button>
            <button
              className="calc-btn btn-function"
              onClick={handlePercentage}
              title="Percent (%)"
              type="button"
            >
              %
            </button>
            <button
              className="calc-btn btn-operator"
              onClick={() => handleOperator("/")}
              title="Divide"
              type="button"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("7")}
              type="button"
            >
              7
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("8")}
              type="button"
            >
              8
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("9")}
              type="button"
            >
              9
            </button>
            <button
              className="calc-btn btn-operator"
              onClick={() => handleOperator("*")}
              title="Multiply"
              type="button"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("4")}
              type="button"
            >
              4
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("5")}
              type="button"
            >
              5
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("6")}
              type="button"
            >
              6
            </button>
            <button
              className="calc-btn btn-operator"
              onClick={() => handleOperator("-")}
              title="Subtract"
              type="button"
            >
              −
            </button>

            {/* Row 4 */}
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("1")}
              type="button"
            >
              1
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("2")}
              type="button"
            >
              2
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("3")}
              type="button"
            >
              3
            </button>
            <button
              className="calc-btn btn-operator"
              onClick={() => handleOperator("+")}
              title="Add"
              type="button"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              className="calc-btn btn-number"
              onClick={() => handleNumber("0")}
              type="button"
            >
              0
            </button>
            <button
              className="calc-btn btn-number"
              onClick={() => handleAppend(".")}
              type="button"
            >
              .
            </button>
            <button
              className="calc-btn btn-function"
              onClick={handleBackspace}
              title="Backspace"
              type="button"
            >
              ⌫
            </button>
            <button
              className="calc-btn btn-equals"
              onClick={handleCalculate}
              title="Calculate (Enter)"
              type="button"
            >
              =
            </button>
          </div>
        </div>
      </div>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(res) => {
          handleNumber(res);
          setIsHistoryOpen(false);
        }}
        onSelectExpression={(expr) => {
          setExpression(expr);
          setDisplayValue(expr);
          setJustEvaluated(false);
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
};

export default Calculator;
