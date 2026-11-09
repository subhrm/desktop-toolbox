import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UnitConverter } from "./index";
import * as unitConverterService from "../../services/unitConverterService";

vi.mock("../../services/unitConverterService", () => ({
  getUnitCategories: vi.fn(),
  convertUnits: vi.fn(),
  convertToAllUnits: vi.fn(),
}));

const mockCategories: unitConverterService.CategoryInfo[] = [
  {
    id: "distance",
    name: "Distance & Length",
    icon: "ruler",
    default_from: "m",
    default_to: "ft",
    units: [
      { id: "m", name: "Meter", symbol: "m" },
      { id: "ft", name: "Foot", symbol: "ft" },
      { id: "km", name: "Kilometer", symbol: "km" },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    icon: "thermometer",
    default_from: "c",
    default_to: "f",
    units: [
      { id: "c", name: "Celsius", symbol: "°C" },
      { id: "f", name: "Fahrenheit", symbol: "°F" },
      { id: "k", name: "Kelvin", symbol: "K" },
    ],
  },
  {
    id: "area",
    name: "Area",
    icon: "grid",
    default_from: "sq_m",
    default_to: "sq_ft",
    units: [{ id: "sq_m", name: "Square Meter", symbol: "m²" }],
  },
  {
    id: "volume",
    name: "Volume & Capacity",
    icon: "droplet",
    default_from: "l",
    default_to: "gal_us",
    units: [{ id: "l", name: "Liter", symbol: "L" }],
  },
  {
    id: "mass",
    name: "Mass & Weight",
    icon: "scale",
    default_from: "kg",
    default_to: "lb",
    units: [{ id: "kg", name: "Kilogram", symbol: "kg" }],
  },
  {
    id: "speed",
    name: "Speed",
    icon: "gauge",
    default_from: "kph",
    default_to: "mph",
    units: [{ id: "kph", name: "Kilometer per hour", symbol: "km/h" }],
  },
  {
    id: "digital",
    name: "Digital Storage",
    icon: "hard-drive",
    default_from: "GB",
    default_to: "GiB",
    units: [{ id: "GB", name: "Gigabyte", symbol: "GB" }],
  },
  {
    id: "time",
    name: "Time",
    icon: "clock",
    default_from: "h",
    default_to: "min",
    units: [{ id: "h", name: "Hour", symbol: "h" }],
  },
  {
    id: "energy",
    name: "Energy & Work",
    icon: "zap",
    default_from: "kcal",
    default_to: "kj",
    units: [{ id: "kcal", name: "Kilocalorie", symbol: "kcal" }],
  },
];

describe("UnitConverter Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unitConverterService.getUnitCategories).mockResolvedValue(mockCategories);
    vi.mocked(unitConverterService.convertUnits).mockResolvedValue({
      category: "distance",
      from_unit: "m",
      to_unit: "ft",
      from_value: 1,
      to_value: 3.28084,
      formatted_result: "3.28084",
      formula: "multiply by 3.28084",
    });
    vi.mocked(unitConverterService.convertToAllUnits).mockResolvedValue({
      category: "distance",
      from_unit: "m",
      from_value: 1,
      conversions: [
        { unit_id: "m", unit_name: "Meter", symbol: "m", value: 1, formatted: "1" },
        { unit_id: "ft", unit_name: "Foot", symbol: "ft", value: 3.28084, formatted: "3.28084" },
        { unit_id: "km", unit_name: "Kilometer", symbol: "km", value: 0.001, formatted: "0.001" },
      ],
    });
  });

  it("loads categories and renders in left-hand sidebar", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Distance & Length")).toBeTruthy();
      expect(screen.getByText("Temperature")).toBeTruthy();
      expect(screen.getByText("Area")).toBeTruthy();
    });

    expect(screen.getByText("Categories")).toBeTruthy();
  });

  it("switches category when clicking sidebar item", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Temperature")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Temperature"));

    await waitFor(() => {
      expect(unitConverterService.convertUnits).toHaveBeenCalledWith(
        "temperature",
        "c",
        "f",
        25
      );
    });
  });

  it("handles input change and recalculates", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByLabelText("Value to convert from")).toBeTruthy();
    });

    const input = screen.getByLabelText("Value to convert from");
    fireEvent.change(input, { target: { value: "100" } });

    await waitFor(() => {
      expect(unitConverterService.convertUnits).toHaveBeenCalledWith(
        "distance",
        "m",
        "ft",
        100
      );
    });
  });

  it("handles unit dropdown changes", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByLabelText("Select source unit")).toBeTruthy();
    });

    const fromSelect = screen.getByLabelText("Select source unit");
    fireEvent.change(fromSelect, { target: { value: "km" } });

    await waitFor(() => {
      expect(unitConverterService.convertUnits).toHaveBeenCalledWith(
        "distance",
        "km",
        "ft",
        1
      );
    });

    const toSelect = screen.getByLabelText("Select target unit");
    fireEvent.change(toSelect, { target: { value: "m" } });

    await waitFor(() => {
      expect(unitConverterService.convertUnits).toHaveBeenCalledWith(
        "distance",
        "km",
        "m",
        1
      );
    });
  });

  it("swaps units using the swap button", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByTitle("Swap units")).toBeTruthy();
    });

    const swapBtn = screen.getByTitle("Swap units");
    fireEvent.click(swapBtn);

    await waitFor(() => {
      expect(unitConverterService.convertUnits).toHaveBeenCalledWith(
        "distance",
        "ft",
        "m",
        3.28084
      );
    });
  });

  it("handles quick value preset buttons", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Quick Values:")).toBeTruthy();
    });

    const preset10 = screen.getByText("10");
    fireEvent.click(preset10);

    const input = screen.getByLabelText("Value to convert from") as HTMLInputElement;
    expect(input.value).toBe("10");
  });

  it("filters units in All Units Breakdown using search input", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Meter")).toBeTruthy();
      expect(screen.getByText("Foot")).toBeTruthy();
      expect(screen.getByText("Kilometer")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("Filter units...");
    fireEvent.change(searchInput, { target: { value: "kilo" } });

    expect(screen.getByText("Kilometer")).toBeTruthy();
    expect(screen.queryByText("Foot")).toBeNull();
  });

  it("clicks a breakdown card to set as target and copies value", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Kilometer")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Kilometer"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0.001");
    await waitFor(() => {
      expect(screen.getByText("Copied to clipboard!")).toBeTruthy();
    });
  });

  it("copies converted result to clipboard", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Copy Result")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Copy Result"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("3.28084");
    await waitFor(() => {
      expect(screen.getByText("Copied to clipboard!")).toBeTruthy();
    });
  });

  it("displays error banner on conversion error", async () => {
    vi.mocked(unitConverterService.convertUnits).mockRejectedValueOnce(
      "Temperature below absolute zero"
    );

    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Temperature below absolute zero")).toBeTruthy();
    });
  });

  it("handles category load failure", async () => {
    vi.mocked(unitConverterService.getUnitCategories).mockRejectedValueOnce("Failed to fetch");

    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeTruthy();
    });
  });

  it("handles invalid number input", async () => {
    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getAllByText("3.28084").length).toBeGreaterThan(0);
    });

    const input = screen.getByLabelText("Value to convert from") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "invalid_num" } });

    await waitFor(() => {
      expect(screen.queryAllByText("3.28084").length).toBe(0);
    });
  });

  it("handles category with unknown icon and non-temperature selection", async () => {
    const customCats = [
      ...mockCategories,
      {
        id: "custom",
        name: "Custom Category",
        icon: "other_icon",
        default_from: "c1",
        default_to: "c2",
        units: [
          { id: "c1", name: "Custom 1", symbol: "c1" },
          { id: "c2", name: "Custom 2", symbol: "c2" },
        ],
      },
    ];
    vi.mocked(unitConverterService.getUnitCategories).mockResolvedValueOnce(customCats);

    render(<UnitConverter />);

    await waitFor(() => {
      expect(screen.getByText("Custom Category")).toBeTruthy();
    });

    // Select custom category (non-temperature)
    fireEvent.click(screen.getByText("Custom Category"));

    const input = screen.getByLabelText("Value to convert from") as HTMLInputElement;
    expect(input.value).toBe("1");
  });
});
