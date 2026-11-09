import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryDrawer } from "./HistoryDrawer";
import { CalculationHistoryItem } from "../../services/calculatorService";

describe("HistoryDrawer", () => {
  const mockHistory: CalculationHistoryItem[] = [
    {
      id: "1",
      expression: "2 + 2",
      result: "4",
      numericResult: 4,
      timestamp: new Date(2026, 0, 1, 12, 0, 0),
      angleUnit: "deg",
    },
    {
      id: "2",
      expression: "sqrt(16)",
      result: "4",
      numericResult: 4,
      timestamp: new Date(2026, 0, 1, 12, 5, 0),
      angleUnit: "rad",
    },
  ];

  it("does not render when closed", () => {
    const { container } = render(
      <HistoryDrawer
        isOpen={false}
        onClose={vi.fn()}
        history={mockHistory}
        onSelectResult={vi.fn()}
        onSelectExpression={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders empty state when history is empty", () => {
    render(
      <HistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        history={[]}
        onSelectResult={vi.fn()}
        onSelectExpression={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );
    expect(screen.getByText("There's no history yet")).toBeTruthy();
  });

  it("renders history items and handles clicks", () => {
    const onSelectResult = vi.fn();
    const onSelectExpression = vi.fn();
    const onClearHistory = vi.fn();
    const onClose = vi.fn();

    render(
      <HistoryDrawer
        isOpen={true}
        onClose={onClose}
        history={mockHistory}
        onSelectResult={onSelectResult}
        onSelectExpression={onSelectExpression}
        onClearHistory={onClearHistory}
      />
    );

    expect(screen.getByText("2 + 2 =")).toBeTruthy();
    expect(screen.getByText("sqrt(16) =")).toBeTruthy();

    fireEvent.click(screen.getByText("2 + 2 ="));
    expect(onSelectExpression).toHaveBeenCalledWith("2 + 2");

    const resultButtons = screen.getAllByText("4");
    fireEvent.click(resultButtons[0]);
    expect(onSelectResult).toHaveBeenCalledWith("4");

    const clearBtn = screen.getByText("Clear History");
    fireEvent.click(clearBtn);
    expect(onClearHistory).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByLabelText("Close History");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when clicking the overlay", () => {
    const onClose = vi.fn();
    const { container } = render(
      <HistoryDrawer
        isOpen={true}
        onClose={onClose}
        history={mockHistory}
        onSelectResult={vi.fn()}
        onSelectExpression={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );

    const overlay = container.querySelector(".history-drawer-overlay");
    expect(overlay).toBeTruthy();
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
