# Mobile Debug Tools

A minimal, secure MCP server for AI-assisted mobile development. Build, install, interact and inspect Android/iOS apps from an MCP-compatible client.

> **Support:**
> * KMP
> * Android
> * iOS
> * Flutter - not tested
> * React native - not tested

## Requirements

- Node.js >= 18
- [Android SDK](https://developer.android.com/studio) (adb) for Android support
- Xcode command-line tools for iOS support
- [idb](https://github.com/facebook/idb) for iOS device support

## Configuration

<details>

<summary>Android Studio</summary>

```json
{
  "mcpServers": {
    "mobile-debug": {
      "command": "npx",
      "args": ["--yes","mobile-debug-mcp","server"],
      "env": { "ADB_PATH": "/path/to/adb", "XCRUN_PATH": "/usr/bin/xcrun", "IDB_PATH": "/path/to/idb" }
    }
  }
}
```

</details>

<details>

<summary>Copilot</summary>

```json
{
  "mcpServers": {
    "mobile-debug": {
      "command": "npx",
      "args": ["--yes","mobile-debug-mcp","server"],
      "env": { "ADB_PATH": "/path/to/adb", "XCRUN_PATH": "/usr/bin/xcrun", "IDB_PATH": "/path/to/idb" }
    }
  }
}
```

</details>

<details>

<summary>Codex</summary>

Use STDIO

command: npx

args: 
* --yes
* mobile-debug-mcp

environment variables:
* ADB_PATH: /path/to/adb
* XCRUN_PATH: /usr/bin/xcrun
* IDC_PATH: /path/to/idb"

</details>

## Usage

Examples: 

Crash fixing:
> I have a crash on the app, can you diagnose it, fix and validate using the mcp tools available

Feature building:
> Add a button, hook into the repository and confirm API request successful

## Docs

- Tools: [Tools](docs/tools/TOOLS.md) — full input/response examples
- Changelog: [Changelog](docs/CHANGELOG.md)
- Agents: [AGENTS.md](AGENTS.md) — cold-start guidance for autonomous agents entering the public repo
- Skills: [skills/README.md](skills/README.md) — portable Markdown skill packages for agents such as Copilot, Codex, Claude, or custom systems

## Agent skills

- `skills/mcp-builder/` contains reusable build/install guidance for agents
- `skills/test-authoring/` contains reusable test-creation guidance aligned to this repo's current test structure
- Skills are written as plain Markdown packages so they can be consumed by different agent systems rather than one vendor-specific runtime

## License

MIT
