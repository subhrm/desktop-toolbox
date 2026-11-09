import { describe, it, expect, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  evaluateCalculatorExpression,
  executeScientificOperation,
} from "./calculatorService";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("calculatorService", () => {
  it("evaluates calculator expression with default deg angle unit", async () => {
    const mockResponse = {
      expression: "2 + 2",
      result: 4,
      formatted: "4",
    };
    vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

    const res = await evaluateCalculatorExpression("2 + 2");
    expect(invoke).toHaveBeenCalledWith("calculate_expression", {
      expression: "2 + 2",
      angleUnit: "deg",
    });
    expect(res).toEqual(mockResponse);
  });

  it("evaluates calculator expression with specified rad angle unit", async () => {
    const mockResponse = {
      expression: "sin(pi / 2)",
      result: 1,
      formatted: "1",
    };
    vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

    const res = await evaluateCalculatorExpression("sin(pi / 2)", "rad");
    expect(invoke).toHaveBeenCalledWith("calculate_expression", {
      expression: "sin(pi / 2)",
      angleUnit: "rad",
    });
    expect(res).toEqual(mockResponse);
  });

  it("executes scientific operation with defaults and options", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(16);

    const res = await executeScientificOperation("sqrt", 256);
    expect(invoke).toHaveBeenCalledWith("calculate_scientific_op", {
      operation: "sqrt",
      value: 256,
      secondValue: null,
      angleUnit: "deg",
    });
    expect(res).toBe(16);
  });

  it("executes binary scientific operation with secondValue and rad", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(8);

    const res = await executeScientificOperation("power", 2, 3, "rad");
    expect(invoke).toHaveBeenCalledWith("calculate_scientific_op", {
      operation: "power",
      value: 2,
      secondValue: 3,
      angleUnit: "rad",
    });
    expect(res).toBe(8);
  });
});
