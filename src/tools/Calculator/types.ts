import { AngleUnit, CalculationHistoryItem } from "../../services/calculatorService";

export type CalculatorMode = "basic" | "scientific";

export interface CalculatorState {
  expression: string;
  displayValue: string;
  previousExpression: string;
  result: number | null;
  error: string | null;
  mode: CalculatorMode;
  angleUnit: AngleUnit;
  isSecondFunction: boolean;
  memory: number;
  history: CalculationHistoryItem[];
  isHistoryOpen: boolean;
  justEvaluated: boolean;
}
