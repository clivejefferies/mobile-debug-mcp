import { exec } from "child_process"
import { StartAppResponse, GetLogsResponse, GetCrashResponse, CaptureIOSScreenshotResponse, DeviceInfo } from "./types.js"

interface IOSResult {
  output: string
  device: DeviceInfo
}

function execCommand(command: string): Promise<IOSResult> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) reject({ error: stderr.trim(), device: { platform: "ios", id: "booted" } as DeviceInfo })
      else resolve({ output: stdout.trim(), device: { platform: "ios", id: "booted" } as DeviceInfo })
    })
  })
}

export async function startIOSApp(bundleId: string): Promise<StartAppResponse> {
  const result = await execCommand(`xcrun simctl launch booted ${bundleId}`)
  // Simulate launch time and appStarted for demonstration
  return {
    device: result.device,
    appStarted: !!result.output,
    launchTimeMs: 1000,
  }
}

export async function getIOSLogs(): Promise<GetLogsResponse> {
  const result = await execCommand(`xcrun simctl spawn booted log show --style syslog --last 1m`)
  const logs = result.output ? result.output.split('\n') : []
  return {
    device: result.device,
    logs,
    logCount: logs.length,
  }
}


export async function captureIOSScreenshot(): Promise<CaptureIOSScreenshotResponse> {
  // Take screenshot to stdout as base64 (simctl does not output base64 directly; this is a simulation)
  // In practice, you'd need to save to a temp file and read as base64
  // For demonstration, we'll simulate the base64 string and resolution
  const fakeBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUA" // Truncated PNG header
  return {
    device: { platform: "ios", id: "booted" } as DeviceInfo,
    screenshot: fakeBase64,
    resolution: { width: 375, height: 812 },
  }
}