# Mobile Debug MCP

**Mobile Debug MCP** is a minimal MCP server for AI-assisted mobile development. It allows you to **launch Android or iOS apps** and **read their logs** from an MCP-compatible AI client.

---

## Features

- Launch Android apps via package name.
- Launch iOS apps via bundle ID on a booted simulator.
- Fetch recent logs from Android or iOS apps.
- Terminate and restart apps.
- Clear app data for fresh installs.
- Capture screenshots.
- Cross-platform support (Android + iOS).
- Minimal, focused design for fast debugging loops.

---

## Requirements

- Node.js >= 18
- Android SDK (`adb` in PATH) for Android support
- Xcode command-line tools (`xcrun simctl`) for iOS support
- Booted iOS simulator for iOS testing

---

## Installation

You can install and use **Mobile Debug MCP** in one of two ways:

### 1. Clone the repository for local development

```bash
git clone https://github.com/YOUR_USERNAME/mobile-debug-mcp.git
cd mobile-debug-mcp
npm install
npm run build
```

This option is suitable if you want to modify or contribute to the code.

### 2. Install via npm for standard use

```bash
npm install -g mobile-debug-mcp
```

This option installs the package globally for easy use without cloning the repo.

---

## MCP Server Configuration

Example WebUI MCP config using `npx --yes` and environment variables:

```json
{
  "mcpServers": {
    "mobile-debug": {
      "command": "npx",
      "args": [
        "--yes",
        "mobile-debug-mcp",
        "server"
      ],
      "env": {
        "ADB_PATH": "/path/to/adb",
        "XCRUN_PATH": "/usr/bin/xcrun"
      }
    }
  }
}
```

> Make sure to set `ADB_PATH` (Android) and `XCRUN_PATH` (iOS) if the tools are not in your system PATH.

---

## Tools

All tools accept a JSON input payload and return a structured JSON response. **Every response includes a `device` object** (with information about the selected device/simulator used for the operation), plus the tool-specific output.

### start_app
Launch a mobile app.

**Input:**
```json
{
  "platform": "android" | "ios",
  "id": "com.example.app" // Android package or iOS bundle ID
}
```

**Response:**
```json
{
  "device": { /* device info */ },
  "result": "success" // or "error", etc.
}
```

### get_logs
Fetch recent logs from the app.

**Input:**
```json
{
  "platform": "android" | "ios",
  "id": "com.example.app", // Android package or iOS bundle ID (required)
  "lines": 200 // optional, Android only
}
```

**Response:**
```json
{
  "device": { /* device info */ },
  "logs": "..." // text log output
}
```

### capture_screenshot
Capture a screenshot of the current device screen.

**Input:**
```json
{
  "platform": "android" | "ios",
  "id": "com.example.app" // Android device/package or iOS simulator/bundle ID
}
```

**Response:**
```json
{
  "device": { /* device info */ },
  "screenshot": "<base64-encoded PNG data>",
  "resolution": { "width": 1080, "height": 1920 }
}
```

### terminate_app
Terminate a running app.

**Input:**
```json
{
  "platform": "android" | "ios",
  "id": "com.example.app" // Android package or iOS bundle ID
}
```

**Response:**
```json
{
  "device": { /* device info */ },
  "appTerminated": true
}
```

### restart_app
Restart an app (terminate then launch).

**Input:**
```json
{
  "platform": "android" | "ios",
  "id": "com.example.app" // Android package or iOS bundle ID
}
```

**Response:**
```json
{
  "device": { /* device info */ },
  "appRestarted": true,
  "launchTimeMs": 123
}
```

### reset_app_data
Clear app storage (reset to fresh install state).

**Input:**
```json
{
  "platform": "android" | "ios",
  "id": "com.example.app" // Android package or iOS bundle ID
}
```

**Response:**
```json
{
  "device": { /* device info */ },
  "dataCleared": true
}
```

---

## Recommended Workflow

1. Ensure Android device or iOS simulator is running.
2. Use `start_app` to launch the app.
3. Use `get_logs` to read the latest logs.
4. Use `capture_screenshot` to visually inspect the app if needed.
5. Use `reset_app_data` to clear state if debugging fresh install scenarios.
6. Use `restart_app` to quickly reboot the app during development cycles.

---

## Notes

- Ensure `adb` and `xcrun` are in your PATH or set `ADB_PATH` / `XCRUN_PATH` accordingly.
- For iOS, the simulator must be booted before using tools.
- Screenshot tool (`capture_screenshot`) returns a base64-encoded PNG image in the `screenshot` field, which some MCP clients can display directly.

---

## License

MIT License
