import { invoke } from "@tauri-apps/api/core";

export type AngleUnit = "deg" | "rad";

export interface CalculatorResponse {
  expression: string;
  result: number;
  formatted: string;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  numericResult: number;
  timestamp: Date;
  angleUnit: AngleUnit;
}

/**
 * Evaluates a complete mathematical expression using the Rust backend engine.
 */
export async function evaluateCalculatorExpression(
  expression: string,
  angleUnit: AngleUnit = "deg"
): Promise<CalculatorResponse> {
  return await invoke<CalculatorResponse>("calculate_expression", {
    expression,
    angleUnit,
  });
}

/**
 * Performs a single unary or binary scientific operation using the Rust backend.
 */
export async function executeScientificOperation(
  operation: string,
  value: number,
  secondValue: number | null = null,
  angleUnit: AngleUnit = "deg"
): Promise<number> {
  return await invoke<number>("calculate_scientific_op", {
    operation,
    value,
    secondValue,
    angleUnit,
  });
}
