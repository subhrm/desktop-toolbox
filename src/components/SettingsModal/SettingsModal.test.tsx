import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsModal from "./SettingsModal";

describe("SettingsModal Component", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <SettingsModal
        isOpen={false}
        onClose={vi.fn()}
        theme="system"
        onThemeChange={vi.fn()}
        effectiveTheme="light"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders properly when isOpen is true with system theme", () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        theme="system"
        onThemeChange={vi.fn()}
        effectiveTheme="dark"
      />
    );

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Theme & Appearance")).toBeTruthy();
    expect(screen.getByTestId("theme-option-system").className).toContain("selected");
    expect(screen.getByText(/currently active:/i)).toBeTruthy();
    expect(screen.getByText("Dark Mode")).toBeTruthy();
  });

  it("calls onThemeChange when theme options are clicked", () => {
    const handleThemeChange = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        theme="system"
        onThemeChange={handleThemeChange}
        effectiveTheme="light"
      />
    );

    fireEvent.click(screen.getByTestId("theme-option-light"));
    expect(handleThemeChange).toHaveBeenCalledWith("light");

    fireEvent.click(screen.getByTestId("theme-option-dark"));
    expect(handleThemeChange).toHaveBeenCalledWith("dark");

    fireEvent.click(screen.getByTestId("theme-option-system"));
    expect(handleThemeChange).toHaveBeenCalledWith("system");
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        theme="light"
        onThemeChange={vi.fn()}
        effectiveTheme="light"
      />
    );

    fireEvent.click(screen.getByLabelText("Close settings"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Done button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        theme="dark"
        onThemeChange={vi.fn()}
        effectiveTheme="dark"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /done/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay backdrop is clicked", () => {
    const handleClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        theme="system"
        onThemeChange={vi.fn()}
        effectiveTheme="light"
      />
    );

    fireEvent.click(screen.getByTestId("settings-modal-overlay"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the modal content", () => {
    const handleClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        theme="system"
        onThemeChange={vi.fn()}
        effectiveTheme="light"
      />
    );

    fireEvent.click(screen.getByRole("dialog"));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("closes modal on Escape key press", () => {
    const handleClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        theme="system"
        onThemeChange={vi.fn()}
        effectiveTheme="light"
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
