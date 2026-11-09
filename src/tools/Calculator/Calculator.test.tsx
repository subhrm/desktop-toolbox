import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Calculator } from "./index";
import * as calculatorService from "../../services/calculatorService";

vi.mock("../../services/calculatorService", () => ({
  evaluateCalculatorExpression: vi.fn(),
  executeScientificOperation: vi.fn(),
}));

describe("Calculator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default state and mode switcher", () => {
    render(<Calculator />);
    expect(screen.getByText("Basic")).toBeTruthy();
    expect(screen.getByText("Scientific")).toBeTruthy();
    expect(screen.getAllByText("DEG").length).toBeGreaterThan(0);
  });

  it("switches between Basic and Scientific modes", () => {
    render(<Calculator />);
    const basicBtn = screen.getByText("Basic");
    const scientificBtn = screen.getByText("Scientific");

    fireEvent.click(basicBtn);
    expect(basicBtn.className).toContain("active");
    expect(screen.queryByRole("button", { name: "sin" })).toBeNull();

    fireEvent.click(scientificBtn);
    expect(scientificBtn.className).toContain("active");
    expect(screen.getByRole("button", { name: "sin" })).toBeTruthy();
  });

  it("toggles angle unit between DEG and RAD", () => {
    render(<Calculator />);
    const unitBtns = screen.getAllByText("DEG");
    fireEvent.click(unitBtns[0]);
    expect(screen.getAllByText("RAD").length).toBeGreaterThan(0);
  });

  it("toggles 2nd function and hyperbolic modes", () => {
    render(<Calculator />);
    const secondBtn = screen.getByTitle("Toggle 2nd functions");
    const hypBtn = screen.getByTitle("Toggle hyperbolic functions");

    fireEvent.click(secondBtn);
    expect(screen.getByText("sin⁻¹")).toBeTruthy();

    fireEvent.click(hypBtn);
    expect(screen.getByText("sinh⁻¹")).toBeTruthy();

    fireEvent.click(secondBtn);
    expect(screen.getByText("sinh")).toBeTruthy();
  });

  it("enters numbers and calculates basic arithmetic", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "7 + 8",
      result: 15,
      formatted: "15",
    });

    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalledWith(
        "7 + 8",
        "deg"
      );
      const display = container.querySelector(".display-result-text");
      expect(display?.textContent).toBe("15");
    });
  });

  it("evaluates unary function immediately on previous answer (2+2=4, then sqrt -> 2)", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression)
      .mockResolvedValueOnce({
        expression: "2 + 2",
        result: 4,
        formatted: "4",
      })
      .mockResolvedValueOnce({
        expression: "sqrt(4)",
        result: 2,
        formatted: "2",
      });

    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      const display = container.querySelector(".display-result-text");
      expect(display?.textContent).toBe("4");
    });

    // Now click sqrt (button √)
    const sqrtBtns = screen.getAllByRole("button", { name: "√" });
    fireEvent.click(sqrtBtns[0]);

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalledWith(
        "sqrt(4)",
        "deg"
      );
      const display = container.querySelector(".display-result-text");
      expect(display?.textContent).toBe("2");
    });
  });

  it("handles consecutive operators by replacing the previous one", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByTitle("Multiply"));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("5 * ");
  });

  it("handles decimal points and prevents duplicate dots", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "." }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "." })); // Duplicate dot ignored
    fireEvent.click(screen.getByRole("button", { name: "3" }));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("5.23");
  });

  it("handles decimal point when expression ends with operator", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "." }));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("5 + 0.");
  });

  it("handles decimal point after evaluation", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "5",
      result: 5,
      formatted: "5",
    });

    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      const display = container.querySelector(".display-result-text");
      expect(display?.textContent).toBe("5");
    });

    fireEvent.click(screen.getByRole("button", { name: "." }));
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("0.");
  });

  it("handles negate button (±)", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByTitle("Toggle Sign (+/-)"));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("-9");

    fireEvent.click(screen.getByTitle("Toggle Sign (+/-)"));
    expect(input.value).toBe("9");
  });

  it("handles negate button on formula expressions", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Toggle Sign (+/-)"));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("-(1 + 2)");

    fireEvent.click(screen.getByTitle("Toggle Sign (+/-)"));
    expect(input.value).toBe("1 + 2");
  });

  it("handles percentage button (%)", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "(50)%",
      result: 0.5,
      formatted: "0.5",
    });

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByTitle("Percent (%)"));

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalledWith(
        "(50)%",
        "deg"
      );
    });
  });

  it("handles backspace and clear", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));

    fireEvent.click(screen.getByTitle("Backspace"));
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("12");

    fireEvent.click(screen.getByTitle("All Clear"));
    expect(input.value).toBe("");
  });

  it("handles backspace after evaluation resets to 0", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "8",
      result: 8,
      formatted: "8",
    });

    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      const display = container.querySelector(".display-result-text");
      expect(display?.textContent).toBe("8");
    });

    fireEvent.click(screen.getByTitle("Backspace"));
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("handles memory operations (MS, MR, M+, M-, MC)", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValue({
      expression: "10",
      result: 10,
      formatted: "10",
    });

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));

    // Store in memory
    fireEvent.click(screen.getByTitle("Memory Store"));
    await waitFor(() => {
      expect(screen.getByText("M")).toBeTruthy();
    });

    // Add to memory
    fireEvent.click(screen.getByTitle("Memory Add"));

    // Subtract from memory
    fireEvent.click(screen.getByTitle("Memory Subtract"));

    // Clear and Recall
    fireEvent.click(screen.getByTitle("All Clear"));
    fireEvent.click(screen.getByTitle("Memory Recall"));

    // Clear memory
    fireEvent.click(screen.getByTitle("Memory Clear"));
    expect(screen.queryByText("M")).toBeNull();
  });

  it("handles memory failures gracefully", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockRejectedValue(
      new Error("Evaluation error")
    );

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByTitle("Memory Store"));
    fireEvent.click(screen.getByTitle("Memory Add"));
    fireEvent.click(screen.getByTitle("Memory Subtract"));
  });

  it("handles error in calculation gracefully and allows dismissing", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockRejectedValueOnce(
      "Division by zero"
    );

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Divide"));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      expect(screen.getByText("Division by zero")).toBeTruthy();
    });

    const closeBtn = screen.getByText("✕");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Division by zero")).toBeNull();
  });

  it("handles copy to clipboard", async () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByTitle("Copy current result"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("9");
    await waitFor(() => {
      expect(screen.getByText("Copied to clipboard!")).toBeTruthy();
    });
  });

  it("opens history drawer and recalls previous calculations", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "3 * 3",
      result: 9,
      formatted: "9",
    });

    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByTitle("Multiply"));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      const display = container.querySelector(".display-result-text");
      expect(display?.textContent).toBe("9");
    });

    fireEvent.click(screen.getByTitle("View calculation history"));
    expect(screen.getByText("Calculation History")).toBeTruthy();
    expect(screen.getByText("3 * 3 =")).toBeTruthy();

    // Click expression to recall
    fireEvent.click(screen.getByText("3 * 3 ="));
    expect(screen.queryByText("Calculation History")).toBeNull();
  });

  it("handles physical keyboard shortcuts", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValue({
      expression: "4 + 5",
      result: 9,
      formatted: "9",
    });

    render(<Calculator />);
    fireEvent.keyDown(window, { key: "4" });
    fireEvent.keyDown(window, { key: "+" });
    fireEvent.keyDown(window, { key: "5" });
    fireEvent.keyDown(window, { key: "Enter" });

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalled();
    });

    fireEvent.keyDown(window, { key: "Backspace" });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "." });
    fireEvent.keyDown(window, { key: "-" });
    fireEvent.keyDown(window, { key: "*" });
    fireEvent.keyDown(window, { key: "/" });
    fireEvent.keyDown(window, { key: "%" });
    fireEvent.keyDown(window, { key: "^" });
    fireEvent.keyDown(window, { key: "(" });
    fireEvent.keyDown(window, { key: ")" });
    fireEvent.keyDown(window, { key: "!" });
    fireEvent.keyDown(window, { key: "r" });
    fireEvent.keyDown(window, { key: "s" });
    fireEvent.keyDown(window, { key: "c" });
    fireEvent.keyDown(window, { key: "t" });
  });

  it("handles unary scientific buttons: sqr, cube, inv, fact, ln, log, abs, trig", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValue({
      expression: "(4)^2",
      result: 16,
      formatted: "16",
    });

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "4" }));

    // Square button x^2
    const sqrBtn = screen.getByText("2", { selector: "sup" }).closest("button")!;
    fireEvent.click(sqrBtn);

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalled();
    });

    // Cube button x^3
    const cubeBtn = screen.getByText("3", { selector: "sup" }).closest("button")!;
    fireEvent.click(cubeBtn);

    // 1/x button
    fireEvent.click(screen.getByRole("button", { name: "1/x" }));

    // x! button
    fireEvent.click(screen.getByRole("button", { name: "x!" }));

    // ln button
    fireEvent.click(screen.getByRole("button", { name: "ln" }));

    // log button
    fireEvent.click(screen.getByRole("button", { name: "log" }));

    // |x| button
    fireEvent.click(screen.getByRole("button", { name: "|x|" }));

    // sin, cos, tan
    fireEvent.click(screen.getByRole("button", { name: "sin" }));
    fireEvent.click(screen.getByRole("button", { name: "cos" }));
    fireEvent.click(screen.getByRole("button", { name: "tan" }));
  });

  it("handles 2nd function scientific buttons: asin, acos, atan, e^x, 10^x, 2^x, sqrt, cbrt, root", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValue({
      expression: "exp(2)",
      result: 7.389,
      formatted: "7.389",
    });

    render(<Calculator />);
    // Enable 2nd functions
    fireEvent.click(screen.getByTitle("Toggle 2nd functions"));

    // e^x, 10^x, 2^x
    const supXList = screen.getAllByText("x", { selector: ".btn-sup" });
    const expBtn = supXList[0].closest("button")!;
    fireEvent.click(expBtn);

    const pow10Btn = supXList[1].closest("button")!;
    fireEvent.click(pow10Btn);

    const pow2Btn = supXList[2].closest("button")!;
    fireEvent.click(pow2Btn);

    // asin, acos, atan
    fireEvent.click(screen.getByRole("button", { name: "sin⁻¹" }));
    fireEvent.click(screen.getByRole("button", { name: "cos⁻¹" }));
    fireEvent.click(screen.getByRole("button", { name: "tan⁻¹" }));

    // sqrt, cbrt, y√x
    fireEvent.click(screen.getByRole("button", { name: "√x" }));
    fireEvent.click(screen.getByRole("button", { name: "∛x" }));
    fireEvent.click(screen.getByRole("button", { name: "ʸ√x" }));
  });

  it("handles hyperbolic functions when both 2nd and hyp are active", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValue({
      expression: "asinh(1)",
      result: 0.88,
      formatted: "0.88",
    });

    render(<Calculator />);
    fireEvent.click(screen.getByTitle("Toggle 2nd functions"));
    fireEvent.click(screen.getByTitle("Toggle hyperbolic functions"));

    fireEvent.click(screen.getByRole("button", { name: "sinh⁻¹" }));
    fireEvent.click(screen.getByRole("button", { name: "cosh⁻¹" }));
    fireEvent.click(screen.getByRole("button", { name: "tanh⁻¹" }));
  });

  it("handles constants pi, e, and parentheses", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTitle("Pi constant (3.14159...)"));
    fireEvent.click(screen.getByTitle("Euler's number (2.71828...)"));
    fireEvent.click(screen.getByRole("button", { name: "(" }));
    fireEvent.click(screen.getByRole("button", { name: ")" }));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toContain("pi");
    expect(input.value).toContain("e");
  });

  it("handles unary function when expression ends with operator", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Add"));
    // Expression is "5 + "
    fireEvent.click(screen.getByRole("button", { name: "sin" }));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("5 + sin(");
  });

  it("handles unary function when expression ends with a trailing number in formula", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    // Expression is "5 + 16"
    const sqrtBtns = screen.getAllByRole("button", { name: "√" });
    fireEvent.click(sqrtBtns[0]);

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("5 + sqrt(16)");
  });

  it("handles unary function on initial blank / zero state", () => {
    render(<Calculator />);
    // From 0, click sin
    fireEvent.click(screen.getByRole("button", { name: "sin" }));
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("sin(");
  });

  it("handles direct typing in expression input bar", () => {
    render(<Calculator />);
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "10 + 20" } });
    expect(input.value).toBe("10 + 20");

    fireEvent.keyDown(input, { key: "Enter" });
  });

  it("formats long display text responsive sizing", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "12345678901234567890",
      result: 1.23e19,
      formatted: "12345678901234567890",
    });

    const { container } = render(<Calculator />);
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12345678901234567890" } });
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      const display = container.querySelector(".display-result-text");
      expect(display?.className).toContain("very-long-text");
    });
  });

  it("auto-closes unclosed parentheses upon calculation", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "(2 + 3)",
      result: 5,
      formatted: "5",
    });

    render(<Calculator />);
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "(2 + 3" } });
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalledWith(
        "(2 + 3)",
        "deg"
      );
    });
  });

  it("handles pow10 and pow2 on blank, operator trailing, and standalone number", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValue({
      expression: "10^(3)",
      result: 1000,
      formatted: "1000",
    });

    render(<Calculator />);
    const secondBtn = screen.getByTitle("Toggle 2nd functions");
    fireEvent.click(secondBtn);

    // On blank/zero
    const pow10Btn = screen.getByText((_, el) => el?.tagName.toLowerCase() === "button" && el.textContent === "10x");
    fireEvent.click(pow10Btn);
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(input.value).toBe("10^(");

    // Clear
    fireEvent.click(screen.getByTitle("All Clear"));

    // pow2 on blank/zero
    const pow2Btn = screen.getByText((_, el) => el?.tagName.toLowerCase() === "button" && el.textContent === "2x");
    fireEvent.click(pow2Btn);
    expect(input.value).toBe("2^(");

    // Clear
    fireEvent.click(screen.getByTitle("All Clear"));

    // After operator
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(pow10Btn);
    expect(input.value).toBe("5 + 10^(");

    // Clear
    fireEvent.click(screen.getByTitle("All Clear"));

    // On standalone number
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(pow10Btn);

    await waitFor(() => {
      expect(calculatorService.evaluateCalculatorExpression).toHaveBeenCalledWith(
        "10^(3)",
        "deg"
      );
    });
  });

  it("handles standalone number unary function failure cleanly", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockRejectedValueOnce(
      new Error("Invalid operation")
    );

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    const sqrtBtns = screen.getAllByRole("button", { name: "√" });
    fireEvent.click(sqrtBtns[0]);

    await waitFor(() => {
      expect(screen.getByText("Invalid operation")).toBeTruthy();
    });
  });

  it("handles justEvaluated state transitions with operator, paren, number, and function", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "2 + 2",
      result: 4,
      formatted: "4",
    });

    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    await waitFor(() => {
      expect(input.value).toBe("2 + 2 =");
    });

    // Press subtract operator: should continue from "4 - "
    fireEvent.click(screen.getByTitle("Subtract"));
    expect(input.value).toBe("4 - ");

    // Clear and re-evaluate
    fireEvent.click(screen.getByTitle("All Clear"));
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "2 + 2",
      result: 4,
      formatted: "4",
    });
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Add"));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      expect(input.value).toBe("2 + 2 =");
    });

    // Pressing a number directly replaces answer
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(input.value).toBe("9");

    // Re-evaluate
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "9",
      result: 9,
      formatted: "9",
    });
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));
    await waitFor(() => {
      expect(input.value).toBe("9 =");
    });

    // Pressing paren opens a fresh paren
    fireEvent.click(screen.getByRole("button", { name: "(" }));
    expect(input.value).toBe("(");
  });

  it("handles x^y power button, toggle sign on empty, and history drawer callbacks", async () => {
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "5",
      result: 5,
      formatted: "5",
    });

    render(<Calculator />);
    const input = screen.getByLabelText("Calculator Expression") as HTMLInputElement;

    // Toggle sign on 0
    fireEvent.click(screen.getByTitle("Toggle Sign (+/-)"));
    expect(input.value).toBe("-");

    // Clear
    fireEvent.click(screen.getByTitle("All Clear"));

    // Power button x^y
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    const powerBtn = screen.getByRole("button", { name: "xy" });
    fireEvent.click(powerBtn);
    expect(input.value).toBe("2 ^ ");

    // Calculate to produce history
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    vi.mocked(calculatorService.evaluateCalculatorExpression).mockResolvedValueOnce({
      expression: "2 ^ 3",
      result: 8,
      formatted: "8",
    });
    fireEvent.click(screen.getByTitle("Calculate (Enter)"));

    await waitFor(() => {
      expect(input.value).toBe("2 ^ 3 =");
    });

    // Open History Drawer
    const historyBtn = screen.getByTitle("View calculation history");
    fireEvent.click(historyBtn);
    expect(screen.getByText("Calculation History")).toBeTruthy();

    // Select result from history
    const resultItem = screen.getByTitle("Click to insert result");
    fireEvent.click(resultItem);
    expect(screen.queryByText("Calculation History")).toBeNull();

    // Reopen and clear history
    fireEvent.click(historyBtn);
    const clearBtn = screen.getByRole("button", { name: /Clear History/i });
    fireEvent.click(clearBtn);
    expect(screen.getByText("There's no history yet")).toBeTruthy();

    // Close history drawer
    const closeBtn = screen.getByLabelText("Close History");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Calculation History")).toBeNull();
  });

  it("ignores global keyboard shortcuts when typing in a different input element", () => {
    render(<Calculator />);
    const otherInput = document.createElement("input");
    document.body.appendChild(otherInput);

    fireEvent.keyDown(otherInput, { key: "5" });
    const calcInput = screen.getByLabelText("Calculator Expression") as HTMLInputElement;
    expect(calcInput.value).toBe("");

    document.body.removeChild(otherInput);
  });
});
