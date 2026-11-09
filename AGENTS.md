# AGENTS.md

Welcome to **desktop-toolbox**! This file serves as the operational guide and architecture reference for AI coding agents and developers contributing to this repository.

---

## 1. Project Overview & Architecture

`desktop-toolbox` is a desktop application designed to provide a suite of offline-first, developer/power-user utilities and tools.

### Core Stack
- **Desktop Runtime**: [Tauri v2](https://v2.tauri.app/) (`@tauri-apps/api` v2, `@tauri-apps/cli` v2, `tauri` crate v2)
- **Backend / Core Engine**: [Rust](https://www.rust-lang.org/) (Edition 2024) located in `src-tauri/`
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) located in `src/`
- **Testing**: [Vitest](https://vitest.dev/) (v8 coverage) + [React Testing Library](https://testing-library.com/) for frontend; native `cargo test` for Rust backend
- **IPC Layer**: Tauri v2 Invoke commands & Event system (`@tauri-apps/api/core`)

### Directory Layout
```
desktop-toolbox/
├── src/                          # Frontend React + TypeScript application
│   ├── assets/                   # Static images, icons, and SVG assets
│   ├── services/                 # Strongly-typed Tauri IPC wrapper functions
│   │   ├── calculatorService.ts  # Calculator invoke wrappers & types
│   │   ├── calculatorService.test.ts
│   │   ├── unitConverterService.ts # Unit converter invoke wrappers & types
│   │   └── unitConverterService.test.ts
│   ├── test/                     # Vitest setup & global mocks (clipboard, etc.)
│   │   └── setup.ts
│   ├── tools/                    # Modular feature/tool components
│   │   ├── Calculator/           # Scientific Calculator UI & History drawer
│   │   │   ├── index.tsx
│   │   │   ├── calculator.css
│   │   │   ├── types.ts
│   │   │   ├── HistoryDrawer.tsx
│   │   │   ├── HistoryDrawer.test.tsx
│   │   │   └── Calculator.test.tsx
│   │   └── UnitConverter/        # Multi-category Unit Converter UI & Breakdown
│   │       ├── index.tsx
│   │       ├── unitConverter.css
│   │       ├── types.ts
│   │       └── UnitConverter.test.tsx
│   ├── App.css                   # Global and layout styles
│   ├── App.tsx                   # Main application frame & tool navigation
│   ├── App.test.tsx
│   ├── main.tsx                  # React DOM bootstrap
│   └── vite-env.d.ts             # Vite client types
├── src-tauri/                    # Rust backend & desktop host
│   ├── capabilities/             # Tauri v2 security capabilities and permissions
│   │   └── default.json          # Main window permissions and plugin access
│   ├── icons/                    # Desktop application icons for all OS platforms
│   ├── src/
│   │   ├── commands/             # Dedicated backend tool modules
│   │   │   ├── mod.rs
│   │   │   ├── calculator.rs     # Math evaluator, parser, tokenizer & tests
│   │   │   └── unit_converter.rs # 10 unit categories, ratio logic & tests
│   │   ├── lib.rs                # Tauri app builder, plugin registration & command handlers
│   │   └── main.rs               # Desktop executable entrypoint
│   ├── Cargo.toml                # Rust crate configuration & dependencies
│   ├── tauri.conf.json           # Tauri v2 configuration (window size, bundle, dev URL)
│   └── build.rs                  # Tauri build script
├── package.json                  # Node dependencies and project scripts
├── tsconfig.json                 # TypeScript project configuration
├── vite.config.ts                # Vite configuration with Tauri-specific port & HMR settings
├── vitest.config.ts              # Vitest test runner configuration with V8 coverage thresholds
└── README.md                     # Human-facing project overview
```

---

## 2. Implemented Tools & Modules

The repository currently contains the following core tools:

1. **Calculator**
   - **Frontend**: [`src/tools/Calculator/`](file:///Users/subhendu/dev/desktop-toolbox/src/tools/Calculator/)
   - **Service IPC**: [`src/services/calculatorService.ts`](file:///Users/subhendu/dev/desktop-toolbox/src/services/calculatorService.ts)
   - **Rust Backend**: [`src-tauri/src/commands/calculator.rs`](file:///Users/subhendu/dev/desktop-toolbox/src-tauri/src/commands/calculator.rs)
   - **Capabilities**: Basic arithmetic, trigonometric & hyperbolic functions, angle unit switching (`DEG`/`RAD`), exponential & power operations, logarithms, factorials, postfix chaining, memory storage, calculation history drawer, and keyboard shortcuts.

2. **Unit Converter**
   - **Frontend**: [`src/tools/UnitConverter/`](file:///Users/subhendu/dev/desktop-toolbox/src/tools/UnitConverter/)
   - **Service IPC**: [`src/services/unitConverterService.ts`](file:///Users/subhendu/dev/desktop-toolbox/src/services/unitConverterService.ts)
   - **Rust Backend**: [`src-tauri/src/commands/unit_converter.rs`](file:///Users/subhendu/dev/desktop-toolbox/src-tauri/src/commands/unit_converter.rs)
   - **Capabilities**: 10 conversion categories (Distance, Temperature, Area, Volume, Mass, Speed, Digital Storage, Time, Pressure, Energy), left-hand category sidebar, two-way unit swap, quick preset values, comprehensive all-units breakdown with live search filter, and clipboard copy.

---

## 3. Development, Build & Test Commands

Always use standard commands to develop, build, test, and verify changes.

### Frontend Development & Build
- **Run Vite dev server only**:
  ```bash
  npm run dev
  ```
- **Typecheck & build frontend bundle**:
  ```bash
  npm run build
  ```
- **Typecheck only (fast verification)**:
  ```bash
  npx tsc --noEmit
  ```

### Automated Testing & Coverage (>90% Threshold)
The repository enforces a strict testing standard with **>90% line and statement coverage**:
- **Run all frontend tests**:
  ```bash
  npm run test
  ```
- **Run frontend tests with coverage report**:
  ```bash
  npm run test:coverage
  ```
- **Run Rust backend tests**:
  ```bash
  cargo test --manifest-path src-tauri/Cargo.toml
  ```
- **Check Rust code without compiling binaries**:
  ```bash
  cargo check --manifest-path src-tauri/Cargo.toml
  ```
- **Run Rust Clippy linter**:
  ```bash
  cargo clippy --manifest-path src-tauri/Cargo.toml
  ```

### Tauri Desktop App Commands
- **Run full desktop app in development mode**:
  ```bash
  npm run tauri dev
  ```
- **Build production desktop binary / installer**:
  ```bash
  npm run tauri build
  ```

---

## 4. Engineering Guidelines & Conventions

### 4.1. Tauri v2 Security & Capabilities
- Tauri v2 strictly enforces capabilities in `src-tauri/capabilities/default.json`.
- When adding new Tauri plugins (e.g. `dialog`, `fs`, `clipboard`, `shell`):
  1. Add the plugin crate to `src-tauri/Cargo.toml`.
  2. Register the plugin in `src-tauri/src/lib.rs` (e.g., `.plugin(tauri_plugin_xyz::init())`).
  3. Declare permission identifiers in `src-tauri/capabilities/default.json` (e.g., `"permissions": ["core:default", "xyz:default"]`).
- Never disable security boundaries or grant unrestricted permissions unless explicitly required.

### 4.2. Rust Backend (`src-tauri/`)
- **Modularity**: Place tool-specific commands in dedicated modules under `src-tauri/src/commands/<tool_name>.rs` and re-export them via `src-tauri/src/commands/mod.rs`.
- **Command Signatures**:
  - Annotate with `#[tauri::command]`.
  - Use `Result<T, E>` where `E: Serialize` (or `Result<T, String>`) for any operation that can fail.
  - **Never panic** or use `.unwrap()` in command handlers; always convert errors cleanly (e.g., `.map_err(|e| e.to_string())`).
  - Use `async fn` for long-running I/O or heavy operations to avoid blocking the Tauri main thread.
- **Unit Testing Convention**:
  - Follow the canonical Rust design pattern: embed unit tests at the bottom of the module in `#[cfg(test)] mod tests { use super::*; ... }`.
  - Ensure all error branches, edge cases, and command wrappers are covered.

### 4.3. Frontend (`src/`)
- **React 19 & TypeScript**:
  - Enforce strict typing; avoid `any`.
  - Prefer functional components and React standard hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Tauri IPC Encapsulation**:
  - **Do not call raw `invoke("...")` directly inside UI components**.
  - Always wrap IPC calls in strongly-typed service functions under `src/services/<toolName>Service.ts`.
- **Tool UI Organization**:
  - Structure each tool in a dedicated directory:
    ```
    src/tools/<ToolName>/
    ├── index.tsx          # Main tool UI component
    ├── <toolName>.css     # Tool-specific styles
    ├── types.ts           # Local UI state & prop types
    └── <ToolName>.test.tsx # Component unit & interaction tests
    ```
  - Register the tool in `src/App.tsx` navigation sidebar / tab switcher.

---

## 5. Recipe: Adding a New Tool to Desktop Toolbox

When asked to implement a new tool or feature, follow this systematic process:

1. **Backend Implementation (Rust)**:
   - Create a module in `src-tauri/src/commands/<tool_name>.rs`.
   - Implement `#[tauri::command]` functions with strong typing and error handling.
   - Add unit tests in `#[cfg(test)] mod tests` covering happy paths and edge cases.
   - Re-export the module in `src-tauri/src/commands/mod.rs` and register the command in `src-tauri/src/lib.rs` under `tauri::generate_handler![...]`.
   - Run `cargo test --manifest-path src-tauri/Cargo.toml` to verify.

2. **Tauri Capabilities**:
   - If the tool requires OS access (clipboard, files, etc.), configure permissions in `src-tauri/capabilities/default.json`.

3. **Frontend API Layer**:
   - Create `src/services/<toolName>Service.ts` defining request/response TypeScript interfaces and typed `invoke(...)` functions.
   - Create `src/services/<toolName>Service.test.ts` to mock and verify IPC invocations.

4. **Frontend UI Component**:
   - Create `src/tools/<ToolName>/index.tsx` and accompanying styles in `<toolName>.css`.
   - Implement user inputs, loading states, error boundaries, and output formatting.
   - Add the tool to the navigation switcher in `src/App.tsx`.

5. **Automated Tests**:
   - Create `src/tools/<ToolName>/<ToolName>.test.tsx` testing user interactions, edge cases, and keyboard shortcuts.
   - Run `npm run test:coverage` to verify the global **>90%** coverage threshold is maintained.

6. **Final Verification**:
   - Run `npx tsc --noEmit` to ensure zero TypeScript errors.
   - Run `cargo check --manifest-path src-tauri/Cargo.toml` to verify backend compilation.
   - Run `npm run build` to ensure the production frontend bundle builds cleanly.

---

## 6. Agent Rules & Operational Constraints

1. **Verify Before Finishing**: Always execute:
   - `npx tsc --noEmit`
   - `npm run test:coverage`
   - `cargo test --manifest-path src-tauri/Cargo.toml`
   - `cargo check --manifest-path src-tauri/Cargo.toml`
2. **Preserve Configuration Integrity**:
   - Do not alter `src-tauri/tauri.conf.json` port settings (`1420`) or `vite.config.ts` unless specifically instructed.
   - Keep `Cargo.lock` and `package-lock.json` consistent.
3. **Cross-Platform Awareness**: Tauri applications run on macOS, Windows, and Linux. Avoid OS-specific hardcoded paths or platform-exclusive shell assumptions.
4. **Clean Git State**: Do not commit temporary scratch files, `.profraw`, `.profdata`, or build artifacts outside `.gitignore`.
