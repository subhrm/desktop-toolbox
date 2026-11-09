import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders desktop toolbox branding and default calculator view", () => {
    render(<App />);
    expect(screen.getByText("Desktop Toolbox")).toBeTruthy();
    expect(screen.getByText("Offline Ready")).toBeTruthy();
    expect(screen.getByTestId("calculator-tool")).toBeTruthy();
    expect(screen.queryByTestId("unit-converter-tool")).toBeNull();
    expect(screen.getByRole("button", { name: /settings/i })).toBeTruthy();
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

  it("opens and closes the Settings modal", () => {
    render(<App />);

    // Initially modal is closed
    expect(screen.queryByRole("dialog")).toBeNull();

    // Click settings button
    const settingsBtn = screen.getByRole("button", { name: /settings/i });
    fireEvent.click(settingsBtn);

    // Modal is opened
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Theme & Appearance")).toBeTruthy();

    // Close settings modal
    const closeBtn = screen.getByLabelText("Close settings");
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("switches theme between system, light, and dark", () => {
    render(<App />);

    // Open settings modal
    const settingsBtn = screen.getByRole("button", { name: /settings/i });
    fireEvent.click(settingsBtn);

    // Default theme is system (which evaluates to light when matchMedia prefers-color-scheme is false)
    expect(screen.getByTestId("theme-option-system").className).toContain("selected");

    // Click dark theme
    const darkOption = screen.getByTestId("theme-option-dark");
    fireEvent.click(darkOption);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("desktop-toolbox:theme")).toBe("dark");
    expect(screen.getByTestId("theme-option-dark").className).toContain("selected");

    // Click light theme
    const lightOption = screen.getByTestId("theme-option-light");
    fireEvent.click(lightOption);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("desktop-toolbox:theme")).toBe("light");
    expect(screen.getByTestId("theme-option-light").className).toContain("selected");

    // Click system theme back
    const systemOption = screen.getByTestId("theme-option-system");
    fireEvent.click(systemOption);

    expect(localStorage.getItem("desktop-toolbox:theme")).toBe("system");
    expect(screen.getByTestId("theme-option-system").className).toContain("selected");
  });

  it("loads saved theme from localStorage on initial render", () => {
    localStorage.setItem("desktop-toolbox:theme", "dark");
    render(<App />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    const settingsBtn = screen.getByRole("button", { name: /settings/i });
    fireEvent.click(settingsBtn);

    expect(screen.getByTestId("theme-option-dark").className).toContain("selected");
  });

  it("updates effective theme when system OS theme changes", () => {
    let changeListener: (() => void) | null = null;
    let mockDark = false;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return mockDark;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_evt, cb) => {
        changeListener = cb;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // Simulate system theme change to dark
    mockDark = true;
    act(() => {
      if (changeListener) {
        changeListener();
      }
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
