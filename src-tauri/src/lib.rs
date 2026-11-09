pub mod commands;

use commands::calculator::{calculate_expression, calculate_scientific_op};
use commands::unit_converter::{convert_to_all_units, convert_units, get_unit_categories};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            calculate_expression,
            calculate_scientific_op,
            get_unit_categories,
            convert_units,
            convert_to_all_units
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
