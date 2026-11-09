use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnitInfo {
    pub id: String,
    pub name: String,
    pub symbol: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryInfo {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub default_from: String,
    pub default_to: String,
    pub units: Vec<UnitInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionResult {
    pub category: String,
    pub from_unit: String,
    pub to_unit: String,
    pub from_value: f64,
    pub to_value: f64,
    pub formatted_result: String,
    pub formula: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnitConversionRow {
    pub unit_id: String,
    pub unit_name: String,
    pub symbol: String,
    pub value: f64,
    pub formatted: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllConversionsResult {
    pub category: String,
    pub from_unit: String,
    pub from_value: f64,
    pub conversions: Vec<UnitConversionRow>,
}

struct UnitDef {
    id: &'static str,
    name: &'static str,
    symbol: &'static str,
    // Factor to multiply by to convert this unit into the category's base unit
    to_base: f64,
}

struct CategoryDef {
    id: &'static str,
    name: &'static str,
    icon: &'static str,
    default_from: &'static str,
    default_to: &'static str,
    units: &'static [UnitDef],
}

// Distance / Length (Base: Meter)
const LENGTH_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "km",
        name: "Kilometer",
        symbol: "km",
        to_base: 1000.0,
    },
    UnitDef {
        id: "m",
        name: "Meter",
        symbol: "m",
        to_base: 1.0,
    },
    UnitDef {
        id: "cm",
        name: "Centimeter",
        symbol: "cm",
        to_base: 0.01,
    },
    UnitDef {
        id: "mm",
        name: "Millimeter",
        symbol: "mm",
        to_base: 0.001,
    },
    UnitDef {
        id: "um",
        name: "Micrometer",
        symbol: "µm",
        to_base: 1e-6,
    },
    UnitDef {
        id: "nm",
        name: "Nanometer",
        symbol: "nm",
        to_base: 1e-9,
    },
    UnitDef {
        id: "mi",
        name: "Mile",
        symbol: "mi",
        to_base: 1609.344,
    },
    UnitDef {
        id: "yd",
        name: "Yard",
        symbol: "yd",
        to_base: 0.9144,
    },
    UnitDef {
        id: "ft",
        name: "Foot",
        symbol: "ft",
        to_base: 0.3048,
    },
    UnitDef {
        id: "in",
        name: "Inch",
        symbol: "in",
        to_base: 0.0254,
    },
    UnitDef {
        id: "nmi",
        name: "Nautical Mile",
        symbol: "NM",
        to_base: 1852.0,
    },
];

// Area (Base: Square Meter)
const AREA_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "sq_km",
        name: "Square Kilometer",
        symbol: "km²",
        to_base: 1_000_000.0,
    },
    UnitDef {
        id: "sq_m",
        name: "Square Meter",
        symbol: "m²",
        to_base: 1.0,
    },
    UnitDef {
        id: "sq_cm",
        name: "Square Centimeter",
        symbol: "cm²",
        to_base: 0.0001,
    },
    UnitDef {
        id: "sq_mm",
        name: "Square Millimeter",
        symbol: "mm²",
        to_base: 1e-6,
    },
    UnitDef {
        id: "ha",
        name: "Hectare",
        symbol: "ha",
        to_base: 10_000.0,
    },
    UnitDef {
        id: "ac",
        name: "Acre",
        symbol: "ac",
        to_base: 4046.8564224,
    },
    UnitDef {
        id: "sq_mi",
        name: "Square Mile",
        symbol: "mi²",
        to_base: 2_589_988.110336,
    },
    UnitDef {
        id: "sq_yd",
        name: "Square Yard",
        symbol: "yd²",
        to_base: 0.83612736,
    },
    UnitDef {
        id: "sq_ft",
        name: "Square Foot",
        symbol: "ft²",
        to_base: 0.09290304,
    },
    UnitDef {
        id: "sq_in",
        name: "Square Inch",
        symbol: "in²",
        to_base: 0.00064516,
    },
];

// Temperature (Affine - special handling)
const TEMPERATURE_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "c",
        name: "Celsius",
        symbol: "°C",
        to_base: 1.0,
    },
    UnitDef {
        id: "f",
        name: "Fahrenheit",
        symbol: "°F",
        to_base: 1.0,
    },
    UnitDef {
        id: "k",
        name: "Kelvin",
        symbol: "K",
        to_base: 1.0,
    },
    UnitDef {
        id: "r",
        name: "Rankine",
        symbol: "°R",
        to_base: 1.0,
    },
];

// Mass / Weight (Base: Kilogram)
const MASS_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "t",
        name: "Metric Ton",
        symbol: "t",
        to_base: 1000.0,
    },
    UnitDef {
        id: "kg",
        name: "Kilogram",
        symbol: "kg",
        to_base: 1.0,
    },
    UnitDef {
        id: "g",
        name: "Gram",
        symbol: "g",
        to_base: 0.001,
    },
    UnitDef {
        id: "mg",
        name: "Milligram",
        symbol: "mg",
        to_base: 1e-6,
    },
    UnitDef {
        id: "ug",
        name: "Microgram",
        symbol: "µg",
        to_base: 1e-9,
    },
    UnitDef {
        id: "lb",
        name: "Pound",
        symbol: "lb",
        to_base: 0.45359237,
    },
    UnitDef {
        id: "oz",
        name: "Ounce",
        symbol: "oz",
        to_base: 0.028349523125,
    },
    UnitDef {
        id: "st",
        name: "Stone",
        symbol: "st",
        to_base: 6.35029318,
    },
    UnitDef {
        id: "ct",
        name: "Carat",
        symbol: "ct",
        to_base: 0.0002,
    },
];

// Volume (Base: Liter)
const VOLUME_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "cum",
        name: "Cubic Meter",
        symbol: "m³",
        to_base: 1000.0,
    },
    UnitDef {
        id: "l",
        name: "Liter",
        symbol: "L",
        to_base: 1.0,
    },
    UnitDef {
        id: "ml",
        name: "Milliliter",
        symbol: "mL",
        to_base: 0.001,
    },
    UnitDef {
        id: "cucm",
        name: "Cubic Centimeter",
        symbol: "cm³",
        to_base: 0.001,
    },
    UnitDef {
        id: "gal_us",
        name: "US Gallon",
        symbol: "gal (US)",
        to_base: 3.785411784,
    },
    UnitDef {
        id: "qt_us",
        name: "US Quart",
        symbol: "qt (US)",
        to_base: 0.946352946,
    },
    UnitDef {
        id: "pt_us",
        name: "US Pint",
        symbol: "pt (US)",
        to_base: 0.473176473,
    },
    UnitDef {
        id: "cup_us",
        name: "US Cup",
        symbol: "cup",
        to_base: 0.2365882365,
    },
    UnitDef {
        id: "floz_us",
        name: "US Fluid Ounce",
        symbol: "fl oz",
        to_base: 0.0295735295625,
    },
    UnitDef {
        id: "tbsp_us",
        name: "US Tablespoon",
        symbol: "tbsp",
        to_base: 0.01478676478125,
    },
    UnitDef {
        id: "tsp_us",
        name: "US Teaspoon",
        symbol: "tsp",
        to_base: 0.00492892159375,
    },
    UnitDef {
        id: "gal_uk",
        name: "Imperial Gallon",
        symbol: "gal (UK)",
        to_base: 4.54609,
    },
];

// Digital Storage (Base: Byte)
const DIGITAL_STORAGE_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "b",
        name: "Bit",
        symbol: "b",
        to_base: 0.125,
    },
    UnitDef {
        id: "B",
        name: "Byte",
        symbol: "B",
        to_base: 1.0,
    },
    UnitDef {
        id: "KB",
        name: "Kilobyte (decimal)",
        symbol: "KB",
        to_base: 1_000.0,
    },
    UnitDef {
        id: "MB",
        name: "Megabyte (decimal)",
        symbol: "MB",
        to_base: 1_000_000.0,
    },
    UnitDef {
        id: "GB",
        name: "Gigabyte (decimal)",
        symbol: "GB",
        to_base: 1_000_000_000.0,
    },
    UnitDef {
        id: "TB",
        name: "Terabyte (decimal)",
        symbol: "TB",
        to_base: 1_000_000_000_000.0,
    },
    UnitDef {
        id: "PB",
        name: "Petabyte (decimal)",
        symbol: "PB",
        to_base: 1_000_000_000_000_000.0,
    },
    UnitDef {
        id: "KiB",
        name: "Kibibyte (binary)",
        symbol: "KiB",
        to_base: 1024.0,
    },
    UnitDef {
        id: "MiB",
        name: "Mebibyte (binary)",
        symbol: "MiB",
        to_base: 1_048_576.0,
    },
    UnitDef {
        id: "GiB",
        name: "Gibibyte (binary)",
        symbol: "GiB",
        to_base: 1_073_741_824.0,
    },
    UnitDef {
        id: "TiB",
        name: "Tebibyte (binary)",
        symbol: "TiB",
        to_base: 1_099_511_627_776.0,
    },
];

// Speed (Base: Meter per second)
const SPEED_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "mps",
        name: "Meter per second",
        symbol: "m/s",
        to_base: 1.0,
    },
    UnitDef {
        id: "kph",
        name: "Kilometer per hour",
        symbol: "km/h",
        to_base: 1.0 / 3.6,
    },
    UnitDef {
        id: "mph",
        name: "Mile per hour",
        symbol: "mph",
        to_base: 0.44704,
    },
    UnitDef {
        id: "knot",
        name: "Knot",
        symbol: "kn",
        to_base: 1852.0 / 3600.0,
    },
    UnitDef {
        id: "fps",
        name: "Foot per second",
        symbol: "ft/s",
        to_base: 0.3048,
    },
];

// Time (Base: Second)
const TIME_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "ns",
        name: "Nanosecond",
        symbol: "ns",
        to_base: 1e-9,
    },
    UnitDef {
        id: "us",
        name: "Microsecond",
        symbol: "µs",
        to_base: 1e-6,
    },
    UnitDef {
        id: "ms",
        name: "Millisecond",
        symbol: "ms",
        to_base: 0.001,
    },
    UnitDef {
        id: "s",
        name: "Second",
        symbol: "s",
        to_base: 1.0,
    },
    UnitDef {
        id: "min",
        name: "Minute",
        symbol: "min",
        to_base: 60.0,
    },
    UnitDef {
        id: "h",
        name: "Hour",
        symbol: "h",
        to_base: 3600.0,
    },
    UnitDef {
        id: "d",
        name: "Day",
        symbol: "d",
        to_base: 86400.0,
    },
    UnitDef {
        id: "wk",
        name: "Week",
        symbol: "wk",
        to_base: 604800.0,
    },
    UnitDef {
        id: "yr",
        name: "Year (calendar)",
        symbol: "yr",
        to_base: 31557600.0,
    },
];

// Pressure (Base: Pascal)
const PRESSURE_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "pa",
        name: "Pascal",
        symbol: "Pa",
        to_base: 1.0,
    },
    UnitDef {
        id: "kpa",
        name: "Kilopascal",
        symbol: "kPa",
        to_base: 1000.0,
    },
    UnitDef {
        id: "bar",
        name: "Bar",
        symbol: "bar",
        to_base: 100_000.0,
    },
    UnitDef {
        id: "mbar",
        name: "Millibar",
        symbol: "mbar",
        to_base: 100.0,
    },
    UnitDef {
        id: "atm",
        name: "Atmosphere",
        symbol: "atm",
        to_base: 101325.0,
    },
    UnitDef {
        id: "psi",
        name: "Pounds per square inch",
        symbol: "psi",
        to_base: 6894.757293168,
    },
    UnitDef {
        id: "torr",
        name: "Torr (mmHg)",
        symbol: "Torr",
        to_base: 133.322368421,
    },
];

// Energy (Base: Joule)
const ENERGY_UNITS: &[UnitDef] = &[
    UnitDef {
        id: "j",
        name: "Joule",
        symbol: "J",
        to_base: 1.0,
    },
    UnitDef {
        id: "kj",
        name: "Kilojoule",
        symbol: "kJ",
        to_base: 1000.0,
    },
    UnitDef {
        id: "cal",
        name: "Gram Calorie",
        symbol: "cal",
        to_base: 4.184,
    },
    UnitDef {
        id: "kcal",
        name: "Kilocalorie / Food Cal",
        symbol: "kcal",
        to_base: 4184.0,
    },
    UnitDef {
        id: "wh",
        name: "Watt-hour",
        symbol: "Wh",
        to_base: 3600.0,
    },
    UnitDef {
        id: "kwh",
        name: "Kilowatt-hour",
        symbol: "kWh",
        to_base: 3_600_000.0,
    },
    UnitDef {
        id: "ev",
        name: "Electronvolt",
        symbol: "eV",
        to_base: 1.602176634e-19,
    },
    UnitDef {
        id: "btu",
        name: "British Thermal Unit",
        symbol: "BTU",
        to_base: 1055.05585262,
    },
    UnitDef {
        id: "ftlb",
        name: "Foot-pound",
        symbol: "ft⋅lb",
        to_base: 1.3558179483314,
    },
];

const CATEGORIES: &[CategoryDef] = &[
    CategoryDef {
        id: "temperature",
        name: "Temperature",
        icon: "thermometer",
        default_from: "c",
        default_to: "f",
        units: TEMPERATURE_UNITS,
    },
    CategoryDef {
        id: "distance",
        name: "Distance & Length",
        icon: "ruler",
        default_from: "m",
        default_to: "ft",
        units: LENGTH_UNITS,
    },
    CategoryDef {
        id: "area",
        name: "Area",
        icon: "grid",
        default_from: "sq_m",
        default_to: "sq_ft",
        units: AREA_UNITS,
    },
    CategoryDef {
        id: "volume",
        name: "Volume & Capacity",
        icon: "droplet",
        default_from: "l",
        default_to: "gal_us",
        units: VOLUME_UNITS,
    },
    CategoryDef {
        id: "mass",
        name: "Mass & Weight",
        icon: "scale",
        default_from: "kg",
        default_to: "lb",
        units: MASS_UNITS,
    },
    CategoryDef {
        id: "speed",
        name: "Speed",
        icon: "gauge",
        default_from: "kph",
        default_to: "mph",
        units: SPEED_UNITS,
    },
    CategoryDef {
        id: "digital",
        name: "Digital Storage",
        icon: "hard-drive",
        default_from: "GB",
        default_to: "GiB",
        units: DIGITAL_STORAGE_UNITS,
    },
    CategoryDef {
        id: "time",
        name: "Time",
        icon: "clock",
        default_from: "h",
        default_to: "min",
        units: TIME_UNITS,
    },
    CategoryDef {
        id: "pressure",
        name: "Pressure",
        icon: "gauge-circle",
        default_from: "bar",
        default_to: "psi",
        units: PRESSURE_UNITS,
    },
    CategoryDef {
        id: "energy",
        name: "Energy & Work",
        icon: "zap",
        default_from: "kcal",
        default_to: "kj",
        units: ENERGY_UNITS,
    },
];

pub fn get_categories_info() -> Vec<CategoryInfo> {
    CATEGORIES
        .iter()
        .map(|cat| CategoryInfo {
            id: cat.id.to_string(),
            name: cat.name.to_string(),
            icon: cat.icon.to_string(),
            default_from: cat.default_from.to_string(),
            default_to: cat.default_to.to_string(),
            units: cat
                .units
                .iter()
                .map(|u| UnitInfo {
                    id: u.id.to_string(),
                    name: u.name.to_string(),
                    symbol: u.symbol.to_string(),
                })
                .collect(),
        })
        .collect()
}

pub fn format_converted_number(val: f64) -> String {
    if val.is_nan() {
        return "NaN".to_string();
    }
    if val.is_infinite() {
        return if val > 0.0 {
            "Infinity".to_string()
        } else {
            "-Infinity".to_string()
        };
    }
    if val == 0.0 || val.abs() < 1e-15 {
        return "0".to_string();
    }

    let abs_val = val.abs();
    if abs_val >= 1e12 || (abs_val < 1e-5 && abs_val > 0.0) {
        return format!("{:e}", val);
    }

    // Format with up to 8 significant decimal places, trimming trailing zeros
    let rounded = (val * 1e8).round() / 1e8;
    let mut s = format!("{:.8}", rounded);
    if s.contains('.') {
        while s.ends_with('0') {
            s.pop();
        }
        if s.ends_with('.') {
            s.pop();
        }
    }
    s
}

// Convert temperature values
fn convert_temperature(from: &str, to: &str, value: f64) -> Result<(f64, String), String> {
    // First convert to Celsius
    let celsius = match from {
        "c" => value,
        "f" => (value - 32.0) * 5.0 / 9.0,
        "k" => value - 273.15,
        "r" => (value - 491.67) * 5.0 / 9.0,
        _ => return Err(format!("Unknown temperature unit: {}", from)),
    };

    // Absolute zero check (Celsius cannot be < -273.15)
    if celsius < -273.15 - 1e-5 {
        return Err("Temperature cannot be below absolute zero (0 K / -273.15 °C)".to_string());
    }

    // Then convert Celsius to target unit
    let (target_val, formula) = match to {
        "c" => (
            celsius,
            match from {
                "c" => "1 : 1".to_string(),
                "f" => "(°F - 32) × 5/9".to_string(),
                "k" => "K - 273.15".to_string(),
                "r" => "(°R - 491.67) × 5/9".to_string(),
                _ => "".to_string(),
            },
        ),
        "f" => {
            let f = celsius * 9.0 / 5.0 + 32.0;
            let formula = match from {
                "c" => "(°C × 9/5) + 32".to_string(),
                "f" => "1 : 1".to_string(),
                "k" => "(K - 273.15) × 9/5 + 32".to_string(),
                "r" => "°R - 459.67".to_string(),
                _ => "".to_string(),
            };
            (f, formula)
        }
        "k" => {
            let k = celsius + 273.15;
            let formula = match from {
                "c" => "°C + 273.15".to_string(),
                "f" => "(°F - 32) × 5/9 + 273.15".to_string(),
                "k" => "1 : 1".to_string(),
                "r" => "°R × 5/9".to_string(),
                _ => "".to_string(),
            };
            (k, formula)
        }
        "r" => {
            let r = (celsius + 273.15) * 9.0 / 5.0;
            let formula = match from {
                "c" => "(°C + 273.15) × 9/5".to_string(),
                "f" => "°F + 459.67".to_string(),
                "k" => "K × 9/5".to_string(),
                "r" => "1 : 1".to_string(),
                _ => "".to_string(),
            };
            (r, formula)
        }
        _ => return Err(format!("Unknown temperature target unit: {}", to)),
    };

    Ok((target_val, formula))
}

pub fn convert(
    category_id: &str,
    from_unit: &str,
    to_unit: &str,
    value: f64,
) -> Result<ConversionResult, String> {
    let cat = CATEGORIES
        .iter()
        .find(|c| c.id == category_id)
        .ok_or_else(|| format!("Unknown category: {}", category_id))?;

    if category_id == "temperature" {
        let (to_val, formula) = convert_temperature(from_unit, to_unit, value)?;
        let formatted = format_converted_number(to_val);
        return Ok(ConversionResult {
            category: category_id.to_string(),
            from_unit: from_unit.to_string(),
            to_unit: to_unit.to_string(),
            from_value: value,
            to_value: to_val,
            formatted_result: formatted,
            formula,
        });
    }

    let from_def = cat
        .units
        .iter()
        .find(|u| u.id == from_unit)
        .ok_or_else(|| format!("Unknown unit '{}' in category '{}'", from_unit, category_id))?;

    let to_def = cat
        .units
        .iter()
        .find(|u| u.id == to_unit)
        .ok_or_else(|| format!("Unknown unit '{}' in category '{}'", to_unit, category_id))?;

    // Ratio conversion: value * from_factor / to_factor
    let base_value = value * from_def.to_base;
    let target_value = base_value / to_def.to_base;

    let multiplier = from_def.to_base / to_def.to_base;
    let formula = if (multiplier - 1.0).abs() < 1e-12 {
        "1 : 1".to_string()
    } else {
        format!("multiply by {}", format_converted_number(multiplier))
    };

    Ok(ConversionResult {
        category: category_id.to_string(),
        from_unit: from_unit.to_string(),
        to_unit: to_unit.to_string(),
        from_value: value,
        to_value: target_value,
        formatted_result: format_converted_number(target_value),
        formula,
    })
}

pub fn convert_all(
    category_id: &str,
    from_unit: &str,
    value: f64,
) -> Result<AllConversionsResult, String> {
    let cat = CATEGORIES
        .iter()
        .find(|c| c.id == category_id)
        .ok_or_else(|| format!("Unknown category: {}", category_id))?;

    let mut rows = Vec::with_capacity(cat.units.len());

    for u in cat.units {
        if category_id == "temperature" {
            let (converted, _) = convert_temperature(from_unit, u.id, value)?;
            rows.push(UnitConversionRow {
                unit_id: u.id.to_string(),
                unit_name: u.name.to_string(),
                symbol: u.symbol.to_string(),
                value: converted,
                formatted: format_converted_number(converted),
            });
        } else {
            let from_def = cat
                .units
                .iter()
                .find(|unit| unit.id == from_unit)
                .ok_or_else(|| format!("Unknown unit: {}", from_unit))?;
            let base_val = value * from_def.to_base;
            let target_val = base_val / u.to_base;
            rows.push(UnitConversionRow {
                unit_id: u.id.to_string(),
                unit_name: u.name.to_string(),
                symbol: u.symbol.to_string(),
                value: target_val,
                formatted: format_converted_number(target_val),
            });
        }
    }

    Ok(AllConversionsResult {
        category: category_id.to_string(),
        from_unit: from_unit.to_string(),
        from_value: value,
        conversions: rows,
    })
}

// Tauri commands
#[tauri::command]
pub fn get_unit_categories() -> Vec<CategoryInfo> {
    get_categories_info()
}

#[tauri::command]
pub fn convert_units(
    category: String,
    from_unit: String,
    to_unit: String,
    value: f64,
) -> Result<ConversionResult, String> {
    convert(&category, &from_unit, &to_unit, value)
}

#[tauri::command]
pub fn convert_to_all_units(
    category: String,
    from_unit: String,
    value: f64,
) -> Result<AllConversionsResult, String> {
    convert_all(&category, &from_unit, value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_temperature_conversions() {
        // 0 C = 32 F
        let res1 = convert("temperature", "c", "f", 0.0).unwrap();
        assert_eq!(res1.to_value, 32.0);

        // 100 C = 212 F
        let res2 = convert("temperature", "c", "f", 100.0).unwrap();
        assert_eq!(res2.to_value, 212.0);

        // -40 C = -40 F
        let res3 = convert("temperature", "c", "f", -40.0).unwrap();
        assert_eq!(res3.to_value, -40.0);

        // 0 C = 273.15 K
        let res4 = convert("temperature", "c", "k", 0.0).unwrap();
        assert_eq!(res4.to_value, 273.15);

        // Below absolute zero error
        let err = convert("temperature", "c", "k", -300.0);
        assert!(err.is_err());
    }

    #[test]
    fn test_distance_conversions() {
        // 1 km = 1000 m
        let res1 = convert("distance", "km", "m", 1.0).unwrap();
        assert!((res1.to_value - 1000.0).abs() < 1e-12);
        assert_eq!(res1.formatted_result, "1000");

        // 1 mi = 1609.344 m
        let res2 = convert("distance", "mi", "m", 1.0).unwrap();
        assert!((res2.to_value - 1609.344).abs() < 1e-12);
        assert_eq!(res2.formatted_result, "1609.344");

        // 1 ft = 12 in
        let res3 = convert("distance", "ft", "in", 1.0).unwrap();
        assert!((res3.to_value - 12.0).abs() < 1e-12);
        assert_eq!(res3.formatted_result, "12");
    }

    #[test]
    fn test_area_conversions() {
        // 1 ha = 10,000 sq m
        let res1 = convert("area", "ha", "sq_m", 1.0).unwrap();
        assert_eq!(res1.to_value, 10000.0);

        // 1 sq km = 1,000,000 sq m
        let res2 = convert("area", "sq_km", "sq_m", 1.0).unwrap();
        assert_eq!(res2.to_value, 1_000_000.0);
    }

    #[test]
    fn test_digital_storage_conversions() {
        // 1 GB = 1000 MB
        let res1 = convert("digital", "GB", "MB", 1.0).unwrap();
        assert_eq!(res1.to_value, 1000.0);

        // 1 GiB = 1024 MiB
        let res2 = convert("digital", "GiB", "MiB", 1.0).unwrap();
        assert_eq!(res2.to_value, 1024.0);
    }

    #[test]
    fn test_convert_all() {
        let res = convert_all("distance", "m", 1000.0).unwrap();
        assert_eq!(res.conversions.len(), LENGTH_UNITS.len());
        let km_row = res.conversions.iter().find(|r| r.unit_id == "km").unwrap();
        assert_eq!(km_row.value, 1.0);

        // Convert all for temperature
        let temp_res = convert_all("temperature", "c", 100.0).unwrap();
        assert_eq!(temp_res.conversions.len(), TEMPERATURE_UNITS.len());
        let f_row = temp_res.conversions.iter().find(|r| r.unit_id == "f").unwrap();
        assert_eq!(f_row.value, 212.0);
    }

    #[test]
    fn test_all_categories_conversions() {
        // Volume: 1 L = 1000 mL
        let res_vol = convert("volume", "l", "ml", 1.0).unwrap();
        assert_eq!(res_vol.to_value, 1000.0);
        let res_gal = convert("volume", "gal_us", "l", 1.0).unwrap();
        assert!((res_gal.to_value - 3.785411784).abs() < 1e-6);

        // Mass: 1 kg = 1000 g, 1 lb to oz
        let res_mass = convert("mass", "kg", "g", 1.0).unwrap();
        assert_eq!(res_mass.to_value, 1000.0);
        let res_lb = convert("mass", "lb", "oz", 1.0).unwrap();
        assert!((res_lb.to_value - 16.0).abs() < 1e-6);

        // Speed: 100 kph to mph, mps to kph
        let res_spd = convert("speed", "kph", "mps", 36.0).unwrap();
        assert_eq!(res_spd.to_value, 10.0);
        let res_mph = convert("speed", "mph", "kph", 60.0).unwrap();
        assert!((res_mph.to_value - 96.56064).abs() < 1e-4);

        // Time: 1 day = 24 hours, 1 hour = 60 minutes
        let res_time = convert("time", "d", "h", 1.0).unwrap();
        assert_eq!(res_time.to_value, 24.0);
        let res_min = convert("time", "h", "min", 2.0).unwrap();
        assert_eq!(res_min.to_value, 120.0);

        // Pressure: 1 bar to kpa, 1 atm to psi
        let res_press = convert("pressure", "bar", "kpa", 1.0).unwrap();
        assert_eq!(res_press.to_value, 100.0);
        let res_atm = convert("pressure", "atm", "psi", 1.0).unwrap();
        assert!((res_atm.to_value - 14.6959487755).abs() < 1e-4);

        // Energy: 1 kcal = 4.184 kJ, 1 kWh to J
        let res_energy = convert("energy", "kcal", "kj", 1.0).unwrap();
        assert_eq!(res_energy.to_value, 4.184);
        let res_kwh = convert("energy", "kwh", "j", 1.0).unwrap();
        assert_eq!(res_kwh.to_value, 3_600_000.0);

        // Ratio 1:1 formula
        let res_same = convert("distance", "m", "m", 5.0).unwrap();
        assert_eq!(res_same.formula, "1 : 1");
    }

    #[test]
    fn test_temperature_exhaustive_matrix() {
        // From Kelvin
        let k_to_c = convert("temperature", "k", "c", 300.0).unwrap();
        assert!((k_to_c.to_value - 26.85).abs() < 1e-10);
        let k_to_f = convert("temperature", "k", "f", 300.0).unwrap();
        assert!((k_to_f.to_value - 80.33).abs() < 1e-2);
        let k_to_k = convert("temperature", "k", "k", 300.0).unwrap();
        assert_eq!(k_to_k.to_value, 300.0);
        let k_to_r = convert("temperature", "k", "r", 300.0).unwrap();
        assert!((k_to_r.to_value - 540.0).abs() < 1e-2);

        // From Rankine
        let r_to_c = convert("temperature", "r", "c", 491.67).unwrap();
        assert!(r_to_c.to_value.abs() < 1e-5);
        let r_to_f = convert("temperature", "r", "f", 491.67).unwrap();
        assert!((r_to_f.to_value - 32.0).abs() < 1e-5);
        let r_to_k = convert("temperature", "r", "k", 491.67).unwrap();
        assert!((r_to_k.to_value - 273.15).abs() < 1e-5);
        let r_to_r = convert("temperature", "r", "r", 491.67).unwrap();
        assert!((r_to_r.to_value - 491.67).abs() < 1e-4);

        // From Celsius to C and R
        let c_to_c = convert("temperature", "c", "c", 25.0).unwrap();
        assert_eq!(c_to_c.to_value, 25.0);
        let c_to_r = convert("temperature", "c", "r", 0.0).unwrap();
        assert!((c_to_r.to_value - 491.67).abs() < 1e-2);

        // From Fahrenheit to F and R
        let f_to_f = convert("temperature", "f", "f", 72.0).unwrap();
        assert_eq!(f_to_f.to_value, 72.0);
        let f_to_r = convert("temperature", "f", "r", 32.0).unwrap();
        assert!((f_to_r.to_value - 491.67).abs() < 1e-2);

        // Errors
        assert!(convert("temperature", "unknown", "c", 10.0).is_err());
        assert!(convert("temperature", "c", "unknown", 10.0).is_err());
    }

    #[test]
    fn test_unit_converter_errors_and_edge_cases() {
        assert!(convert("nonexistent", "m", "ft", 1.0).is_err());
        assert!(convert("distance", "unknown_from", "ft", 1.0).is_err());
        assert!(convert("distance", "m", "unknown_to", 1.0).is_err());
        assert!(convert_all("nonexistent", "m", 1.0).is_err());
        assert!(convert_all("distance", "unknown_from", 1.0).is_err());
    }

    #[test]
    fn test_format_converted_number_edge_cases() {
        assert_eq!(format_converted_number(f64::NAN), "NaN");
        assert_eq!(format_converted_number(f64::INFINITY), "Infinity");
        assert_eq!(format_converted_number(f64::NEG_INFINITY), "-Infinity");
        assert_eq!(format_converted_number(0.0), "0");
        assert_eq!(format_converted_number(1e-16), "0");
        assert!(format_converted_number(1e13).contains('e'));
        assert!(format_converted_number(1e-6).contains('e'));
        assert_eq!(format_converted_number(12.5), "12.5");
        assert_eq!(format_converted_number(100.0), "100");
    }

    #[test]
    fn test_tauri_command_handlers() {
        let cats = get_unit_categories();
        assert_eq!(cats.len(), 10);

        let res = convert_units("distance".into(), "km".into(), "m".into(), 2.0).unwrap();
        assert_eq!(res.to_value, 2000.0);

        let all_res = convert_to_all_units("mass".into(), "kg".into(), 5.0).unwrap();
        assert_eq!(all_res.conversions.len(), MASS_UNITS.len());
    }
}
