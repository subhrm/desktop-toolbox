import { invoke } from "@tauri-apps/api/core";

export interface UnitInfo {
  id: string;
  name: string;
  symbol: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  default_from: string;
  default_to: string;
  units: UnitInfo[];
}

export interface ConversionResult {
  category: string;
  from_unit: string;
  to_unit: string;
  from_value: number;
  to_value: number;
  formatted_result: string;
  formula: string;
}

export interface UnitConversionRow {
  unit_id: string;
  unit_name: string;
  symbol: string;
  value: number;
  formatted: string;
}

export interface AllConversionsResult {
  category: string;
  from_unit: string;
  from_value: number;
  conversions: UnitConversionRow[];
}

export async function getUnitCategories(): Promise<CategoryInfo[]> {
  return await invoke<CategoryInfo[]>("get_unit_categories");
}

export async function convertUnits(
  category: string,
  fromUnit: string,
  toUnit: string,
  value: number
): Promise<ConversionResult> {
  return await invoke<ConversionResult>("convert_units", {
    category,
    fromUnit,
    toUnit,
    value,
  });
}

export async function convertToAllUnits(
  category: string,
  fromUnit: string,
  value: number
): Promise<AllConversionsResult> {
  return await invoke<AllConversionsResult>("convert_to_all_units", {
    category,
    fromUnit,
    value,
  });
}
