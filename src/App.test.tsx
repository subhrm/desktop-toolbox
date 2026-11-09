import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

vi.mock("./tools/Calculator", () => ({
  default: () => <div data-testid="calculator-tool">Calculator Tool Mock</div>,
}));

vi.mock("./tools/UnitConverter", () => ({
  default: () => <div data-testid="unit-converter-tool">Unit Converter Tool Mock</div>,
}));

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders desktop toolbox branding and default calculator view", () => {
    render(<App />);
    expect(screen.getByText("Desktop Toolbox")).toBeTruthy();
    expect(screen.getByText("Offline Ready")).toBeTruthy();
    expect(screen.getByTestId("calculator-tool")).toBeTruthy();
    expect(screen.queryByTestId("unit-converter-tool")).toBeNull();
  });

  it("switches to Unit Converter when navigation tab is clicked", () => {
    render(<App />);

    const converterTab = screen.getByRole("button", { name: /unit converter/i });
    fireEvent.click(converterTab);

    expect(screen.getByTestId("unit-converter-tool")).toBeTruthy();
    expect(screen.queryByTestId("calculator-tool")).toBeNull();

    const calculatorTab = screen.getByRole("button", { name: /calculator/i });
    fireEvent.click(calculatorTab);

    expect(screen.getByTestId("calculator-tool")).toBeTruthy();
    expect(screen.queryByTestId("unit-converter-tool")).toBeNull();
  });
});
