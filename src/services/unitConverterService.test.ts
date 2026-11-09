import { describe, it, expect, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  getUnitCategories,
  convertUnits,
  convertToAllUnits,
} from "./unitConverterService";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("unitConverterService", () => {
  it("fetches unit categories", async () => {
    const mockCategories = [
      {
        id: "distance",
        name: "Distance",
        icon: "ruler",
        default_from: "m",
        default_to: "ft",
        units: [{ id: "m", name: "Meter", symbol: "m" }],
      },
    ];
    vi.mocked(invoke).mockResolvedValueOnce(mockCategories);

    const res = await getUnitCategories();
    expect(invoke).toHaveBeenCalledWith("get_unit_categories");
    expect(res).toEqual(mockCategories);
  });

  it("converts units", async () => {
    const mockResult = {
      category: "distance",
      from_unit: "km",
      to_unit: "m",
      from_value: 1,
      to_value: 1000,
      formatted_result: "1000",
      formula: "multiply by 1000",
    };
    vi.mocked(invoke).mockResolvedValueOnce(mockResult);

    const res = await convertUnits("distance", "km", "m", 1);
    expect(invoke).toHaveBeenCalledWith("convert_units", {
      category: "distance",
      fromUnit: "km",
      toUnit: "m",
      value: 1,
    });
    expect(res).toEqual(mockResult);
  });

  it("converts to all units", async () => {
    const mockAll = {
      category: "distance",
      from_unit: "km",
      from_value: 1,
      conversions: [
        {
          unit_id: "m",
          unit_name: "Meter",
          symbol: "m",
          value: 1000,
          formatted: "1000",
        },
      ],
    };
    vi.mocked(invoke).mockResolvedValueOnce(mockAll);

    const res = await convertToAllUnits("distance", "km", 1);
    expect(invoke).toHaveBeenCalledWith("convert_to_all_units", {
      category: "distance",
      fromUnit: "km",
      value: 1,
    });
    expect(res).toEqual(mockAll);
  });
});
