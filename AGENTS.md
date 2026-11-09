# AGENTS.md

Welcome to **desktop-toolbox**! This file serves as the operational guide and architecture reference for AI coding agents and developers contributing to this repository.

---

## 1. Project Overview & Architecture

`desktop-toolbox` is a desktop application designed to provide a suite of offline-first, developer/power-user utilities and tools.

### Core Stack
- **Desktop Runtime**: [Tauri v2](https://v2.tauri.app/) (`@tauri-apps/api` v2, `@tauri-apps/cli` v2, `tauri` crate v2)
- **Backend / Core Engine**: [Rust](https://www.rust-lang.org/) (Edition 2024) located in `src-tauri/`
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) located in `src/`
- **IPC Layer**: Tauri v2 Invoke commands & Event system (`@tauri-apps/api/core`)

### Directory Layout
```
desktop-toolbox/
├── src/                          # Frontend React + TypeScript application
│   ├── assets/                   # Static images, icons, and SVG assets
│   ├── App.css                   # Global and layout styles
│   ├── App.tsx                   # Main application frame / entry view
│   ├── main.tsx                  # React DOM bootstrap
│   └── vite-env.d.ts             # Vite client types
├── src-tauri/                    # Rust backend & desktop host
│   ├── capabilities/             # Tauri v2 security capabilities and permissions
│   │   └── default.json          # Main window permissions and plugin access
│   ├── icons/                    # Desktop application icons for all OS platforms
│   ├── src/
│   │   ├── lib.rs                # Tauri app builder, plugin registration & command handlers
│   │   └── main.rs               # Desktop executable entrypoint
│   ├── Cargo.toml                # Rust crate configuration & dependencies
│   ├── tauri.conf.json           # Tauri v2 configuration (window size, bundle, dev URL)
│   └── build.rs                  # Tauri build script
├── package.json                  # Node dependencies and project scripts
├── tsconfig.json                 # TypeScript project configuration
├── vite.config.ts                # Vite configuration with Tauri-specific port & HMR settings
└── README.md                     # Human-facing project overview
```

---

## 2. Development & Build Commands

Always use standard commands to develop, build, and verify changes.

### Node / Frontend Commands
- **Run Vite dev server only**:
  ```bash
  npm run dev
  ```
- **Typecheck & build frontend**:
  ```bash
  npm run build
  ```
- **Typecheck only (fast TypeScript verification)**:
  ```bash
  npx tsc --noEmit
  ```

### Tauri / Desktop App Commands
- **Run full desktop app in development mode** (launches Vite + Tauri dev window):
  ```bash
  npm run tauri dev
  ```
- **Build production desktop binary / installer**:
  ```bash
  npm run tauri build
  ```

### Rust Backend Commands
Execute inside the workspace using the `--manifest-path` flag or from within `src-tauri/`:
- **Compile & check Rust code**:
  ```bash
  cargo check --manifest-path src-tauri/Cargo.toml
  ```
- **Run Rust tests**:
  ```bash
  cargo test --manifest-path src-tauri/Cargo.toml
  ```
- **Run Clippy linter**:
  ```bash
  cargo clippy --manifest-path src-tauri/Cargo.toml
  ```
- **Format Rust code**:
  ```bash
  cargo fmt --manifest-path src-tauri/Cargo.toml
  ```

---

## 3. Engineering Guidelines & Conventions

### 3.1. Tauri v2 Security & Capabilities
- Tauri v2 strictly enforces capabilities in `src-tauri/capabilities/default.json`.
- When adding new Tauri plugins (e.g. `dialog`, `fs`, `clipboard`, `shell`), you must:
  1. Add the plugin crate to `src-tauri/Cargo.toml`.
  2. Register the plugin in `src-tauri/src/lib.rs` (e.g., `.plugin(tauri_plugin_xyz::init())`).
  3. Declare permission identifiers in `src-tauri/capabilities/default.json` (e.g., `"permissions": ["core:default", "xyz:default"]`).
- Never disable security boundaries or grant unrestricted permissions unless explicitly required.

### 3.2. Rust Backend (`src-tauri/`)
- **Modularity**: Do not bloat `src-tauri/src/lib.rs`. Place tool-specific commands in dedicated modules:
  ```
  src-tauri/src/
  ├── commands/         # Or `tools/`
  │   ├── mod.rs
  │   └── text_tools.rs
  ├── lib.rs
  └── main.rs
  ```
- **Command Signatures**:
  - Annotate with `#[tauri::command]`.
  - Use `Result<T, E>` where `E: Serialize` (or `Result<T, String>`) for any operation that can fail.
  - **Never panic** or use `.unwrap()` in command handlers; always convert errors cleanly (e.g., `.map_err(|e| e.to_string())` or custom error enums via `thiserror`).
  - Use `async fn` for long-running I/O or heavy operations to avoid blocking the Tauri main thread.
- **State Management**:
  - Use `tauri::State<'_, AppState>` for shared backend state.
  - Ensure shared types are thread-safe (`Send + Sync`, typically wrapped in `Arc<Mutex<T>>` or `tokio::sync::Mutex<T>`).

### 3.3. Frontend (`src/`)
- **React 19 & TypeScript**:
  - Always enforce strict typing; avoid `any`.
  - Prefer functional components and React standard hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Tauri IPC Encapsulation**:
  - **Do not call raw `invoke("...")` directly inside UI components**.
  - Wrap IPC calls in typed service functions or custom hooks under `src/services/` or `src/api/`.
  - Example:
    ```typescript
    // src/services/greetService.ts
    import { invoke } from "@tauri-apps/api/core";

    export async function greetUser(name: string): Promise<string> {
      return await invoke<string>("greet", { name });
    }
    ```
- **Tool UI Organization**:
  - Structure new tools in a dedicated directory:
    ```
    src/
    ├── components/       # Shared UI components (Button, Modal, Input, etc.)
    ├── services/         # Typed Tauri IPC wrappers
    ├── tools/            # Feature / Tool modules
    │   ├── TextDiff/
    │   ├── JsonFormatter/
    │   └── ...
    └── App.tsx           # Tool selector / Navigation layout
    ```

---

## 4. Recipe: Adding a New Tool to Desktop Toolbox

When asked to implement a new tool/feature, follow this systematic process:

1. **Backend Implementation (Rust)**:
   - Create a module in `src-tauri/src/commands/<tool_name>.rs`.
   - Implement the necessary `#[tauri::command]` functions with strong typing and error handling.
   - Export and register the command in `src-tauri/src/lib.rs` under `tauri::generate_handler![...]`.
   - Run `cargo check --manifest-path src-tauri/Cargo.toml` to verify compilation.

2. **Tauri Capabilities**:
   - If the tool requires OS access (file system, dialogs, clipboard, etc.), ensure the relevant Tauri plugin and capability permissions are configured in `src-tauri/capabilities/default.json`.

3. **Frontend API Layer**:
   - Create `src/services/<toolName>.ts` defining request/response TypeScript interfaces and typed `invoke(...)` functions.

4. **Frontend UI Component**:
   - Create `src/tools/<ToolName>/index.tsx`.
   - Implement user inputs, loading states, error boundaries, and output formatting.
   - Integrate the tool into the application's navigation or tool-switcher in `src/App.tsx`.

5. **Verification**:
   - Run `npx tsc --noEmit` to ensure zero TypeScript errors.
   - Run `cargo test --manifest-path src-tauri/Cargo.toml` if Rust tests are present.
   - Run `npm run build` to ensure the production frontend bundle builds cleanly.

---

## 5. Agent Rules & Operational Constraints

1. **Verify Before Finishing**: Always execute `npx tsc --noEmit` and `cargo check --manifest-path src-tauri/Cargo.toml` after modifying code to verify that both the frontend and backend compile without errors.
2. **Preserve Configuration Integrity**:
   - Do not alter `src-tauri/tauri.conf.json` port settings (`1420`) or `vite.config.ts` unless specifically required.
   - Keep `Cargo.lock` and `package-lock.json` consistent.
3. **Cross-Platform Awareness**: Tauri applications run on macOS, Windows, and Linux. Avoid OS-specific hardcoded paths or platform-exclusive shell assumptions in Rust and TypeScript code.
4. **Clean Git State**: Do not leave temporary scratch files or build artifacts outside `.gitignore`.
