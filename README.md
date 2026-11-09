# Desktop Toolbox

A modern, offline-first desktop application providing a suite of developer and power-user utilities built with **Tauri v2**, **Rust**, **React 19**, and **TypeScript**.

---

## Included Tools

### 1. Scientific Calculator
A dual-mode calculator designed for both everyday calculations and complex scientific / engineering workflows:
- **Basic & Scientific Modes**: Seamlessly toggle between a compact standard keypad and an expanded scientific layout.
- **Arithmetic & Precedence**: Full operator precedence support (`+`, `-`, `×`, `÷`, `%`, `±`, parentheses) with auto-closing parenthesis detection.
- **Scientific Operations**:
  - **Trigonometry**: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2` with exact quadrant handling (0°, 90°, 180°, 270°).
  - **Hyperbolic**: `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`.
  - **Angle Units**: Toggle between Degrees (`DEG`) and Radians (`RAD`).
  - **Powers & Roots**: $x^2$, $x^3$, $x^y$, $10^x$, $2^x$, $e^x$, $\sqrt{x}$, $\sqrt[3]{x}$, and arbitrary roots $\sqrt[y]{x}$.
  - **Logarithms**: Natural log (`ln`), base-10 log (`log10`), and base-2 log (`log2`).
  - **Advanced Functions**: Factorials ($x!$ up to $170!$), reciprocals ($1/x$), absolute value, percentages, and mathematical constants ($\pi$, $e$, $\tau$, $\phi$).
  - **Implicit Multiplication**: Natural expression parsing for `2pi`, `3(4+1)`, `(2)(3)`, etc.
  - **Smart Postfix Chaining**: Immediately apply functions to previous answers (e.g. `2 + 2 = 4`, then clicking `√` computes $\sqrt{4} = 2$).
- **Memory Storage**: Standard memory registers (`MS`, `MR`, `M+`, `M-`, `MC`) with indicator badge.
- **Interactive Calculation History**: Slide-over drawer recording all past calculations with timestamp and angle unit; click to re-insert previous results or expressions.
- **Full Keyboard Support**: Type directly or use standard keyboard shortcuts (`0`–`9`, `.`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`).

### 2. Unit Converter
An offline unit conversion tool supporting 10 measurement categories and over 70 unit types:
- **Left-Hand Category Navigation**: Quick-switch sidebar featuring dedicated icons for:
  - **Distance & Length**: Meter, Kilometer, Centimeter, Millimeter, Micrometer, Nanometer, Mile, Yard, Foot, Inch, Nautical Mile.
  - **Temperature**: Celsius (°C), Fahrenheit (°F), Kelvin (K), Rankine (°R) with absolute zero enforcement.
  - **Area**: Square Meter, Square Kilometer, Hectare, Acre, Square Mile, Square Foot, Square Inch, etc.
  - **Volume & Capacity**: Liter, Milliliter, US Gallon, US Quart, US Pint, US Cup, US Fluid Ounce, Cubic Meter, etc.
  - **Mass & Weight**: Kilogram, Gram, Milligram, Metric Ton, Pound, Ounce, Stone, etc.
  - **Speed**: Kilometer per hour, Meter per second, Mile per hour, Knot, Foot per second, Mach.
  - **Digital Storage**: Bits, Bytes, KB, MB, GB, TB, PB and binary units (KiB, MiB, GiB, TiB).
  - **Time**: Millisecond, Second, Minute, Hour, Day, Week, Year.
  - **Pressure**: Pascal, Kilopascal, Bar, Millibar, Atmosphere (atm), PSI, Torr (mmHg).
  - **Energy & Work**: Joule, Kilojoule, Calorie, Kilocalorie, Watt-hour, Kilowatt-hour, Electronvolt, BTU, Foot-pound.
- **Interactive Controls**:
  - Instant live conversions as you type or change units.
  - Quick two-way unit swap button (`⇄`).
  - Context-aware quick preset values for rapid conversion.
  - Comprehensive "All Units" breakdown grid with real-time text filter.
  - One-click copy buttons for main results and breakdown values with feedback notifications.

---

## Tech Stack & Architecture

- **Desktop Host & Runtime**: [Tauri v2](https://v2.tauri.app/)
- **Backend / Core Engine**: [Rust](https://www.rust-lang.org/) (2024 edition) under `src-tauri/`
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) under `src/`
- **Testing**: [Vitest](https://vitest.dev/) with V8 coverage for frontend; built-in `cargo test` with LLVM coverage for Rust.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) and `npm`
- [Rust](https://www.rust-lang.org/tools/install) (latest stable toolchain)
- OS-specific build dependencies for Tauri v2 (see [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Installation
Clone the repository and install frontend dependencies:
```bash
git clone https://github.com/subhendu/desktop-toolbox.git
cd desktop-toolbox
npm install
```

---

## Running the Application

### Development Mode (Full Desktop App)
Launches the Vite dev server and opens the native Tauri desktop window with hot reloading:
```bash
npm run tauri dev
```

### Frontend-Only Development (Web Browser)
If you only want to preview or develop UI components in the browser:
```bash
npm run dev
```

### Production Build
Build the optimized frontend assets and generate the native desktop installer/executable:
```bash
# Build desktop application package (.app / .dmg on macOS, .msi on Windows, .deb / AppImage on Linux)
npm run tauri build
```

---

## Running Tests & Coverage

The project maintains **>90% test coverage** across both frontend and backend suites.

### 1. Frontend Tests (React / TypeScript)
Execute all frontend unit and component tests:
```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests and generate code coverage report
npm run test:coverage
```

### 2. Backend Tests (Rust)
Execute all backend command and unit tests:
```bash
# Run Rust unit tests
cargo test --manifest-path src-tauri/Cargo.toml

# Check Rust code without building binaries
cargo check --manifest-path src-tauri/Cargo.toml

# Run Clippy linter
cargo clippy --manifest-path src-tauri/Cargo.toml
```

### 3. Backend Code Coverage (LLVM Source Instrumentation)
To generate detailed line-by-line coverage reports for Rust commands:
```bash
# Set instrument coverage and run tests
RUSTFLAGS="-C instrument-coverage" LLVM_PROFILE_FILE="coverage-rust-%p-%m.profraw" cargo test --manifest-path src-tauri/Cargo.toml

# Merge profile data (requires llvm-profdata and llvm-cov)
llvm-profdata merge -sparse coverage-rust-*.profraw -o coverage-rust.profdata

# Display coverage report for commands
llvm-cov report $(ls -t src-tauri/target/debug/deps/desktop_toolbox_lib-* | grep -v '\.dSYM' | head -n 1) -instr-profile=coverage-rust.profdata -sources src-tauri/src/commands/
```

### 4. Full Static Typecheck
Verify zero TypeScript compiler errors:
```bash
npx tsc --noEmit
```
