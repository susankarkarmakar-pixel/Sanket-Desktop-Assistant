# Sanket Desktop Assistant: Windows UI and Performance Improvements

## Scope

This update focuses on the Electron/React shell used by the Windows desktop application. It improves startup behavior, navigation responsiveness, Windows window controls, keyboard accessibility, and global search latency without changing the feature-specific data APIs.

## Implemented changes

| Area | Improvement | Expected effect |
| --- | --- | --- |
| Renderer startup | Feature modules are loaded with `React.lazy` and `Suspense` instead of being bundled and mounted eagerly. | Smaller initial JavaScript payload and faster first paint; feature code loads when opened. |
| Global search | Search sources are queried in parallel, cached for five seconds, and protected from stale asynchronous results. | Lower typing latency and fewer repeated IPC calls while searching. |
| Electron window | Windows uses an opaque compositor path, while macOS retains vibrancy/transparency behavior. | Lower GPU/compositor overhead and more predictable Windows rendering. |
| Electron startup | Background services initialize on the next event-loop turn after the window is created. | The shell can paint and become interactive before backend setup completes. |
| Window controls | Replaced tiny traffic-light-style dots with larger Windows-friendly controls and accessible labels. | Better hit targets, clearer behavior, and improved keyboard/screen-reader support. |
| Navigation | Added active-page semantics, focus rings, explicit button types, and a stable view-label map. | More predictable navigation and better accessibility. |
| Visual system | Switched the default typeface to Segoe UI Variable/Segoe UI, reduced costly blur surfaces, and added reduced-motion handling. | More native Windows appearance and less visual/compositor work. |
| IPC lifecycle | Added an unsubscribe function for the `set-view` listener. | Prevents listener accumulation during reloads or renderer lifecycle changes. |

## Validation

The following checks passed:

- `npm run build`
- `node --check main.js`
- `node --check preload.js`
- `git diff --check`

The initial renderer bundle was approximately **577 kB** minified JavaScript. After lazy-loading the feature modules, the main renderer chunk is approximately **402 kB**, with feature modules emitted as separate chunks.

The Windows NSIS installer build completed successfully after installing the required Wine runtime. The generated installer is `dist/Sanket Desktop Assistant Setup 1.0.0.exe`, with a size of approximately **108.2 MB** and SHA-256 checksum `5ce18b328499d2bb6d1170efa9eae7d8cff283021885105d5e3a4c03a7a68290`.

## Changed files

- `main.js`
- `preload.js`
- `src/App.jsx`
- `src/components/Sidebar.jsx`
- `src/components/TopBar.jsx`
- `src/index.css`
