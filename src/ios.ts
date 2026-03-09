import { exec } from "child_process"
import { promises as fs } from "fs"
import { pathToFileURL } from "url"
import { StartAppResponse, GetLogsResponse, GetCrashResponse, CaptureIOSScreenshotResponse, TerminateAppResponse, RestartAppResponse, ResetAppDataResponse, DeviceInfo } from "./types.js"

const XCRUN = process.env.XCRUN_PATH || "xcrun"

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

export async function getIOSDeviceMetadata(): Promise<DeviceInfo> {
  return {
    platform: "ios",
    id: "booted",
    osVersion: "iOS 16.4",
    model: "iPhone 14",
    simulator: true,
  }
}

export async function startIOSApp(bundleId: string): Promise<StartAppResponse> {
  const result = await execCommand(`${XCRUN} simctl launch booted ${bundleId}`)
  const device = await getIOSDeviceMetadata()
  // Simulate launch time and appStarted for demonstration
  return {
    device,
    appStarted: !!result.output,
    launchTimeMs: 1000,
  }
}

export async function terminateIOSApp(bundleId: string): Promise<TerminateAppResponse> {
  await execCommand(`${XCRUN} simctl terminate booted ${bundleId}`)
  const device = await getIOSDeviceMetadata()
  return {
    device,
    appTerminated: true
  }
}

export async function restartIOSApp(bundleId: string): Promise<RestartAppResponse> {
  await terminateIOSApp(bundleId)
  const startResult = await startIOSApp(bundleId)
  return {
    device: startResult.device,
    appRestarted: startResult.appStarted,
    launchTimeMs: startResult.launchTimeMs
  }
}

export async function resetIOSAppData(bundleId: string): Promise<ResetAppDataResponse> {
  await terminateIOSApp(bundleId)
  const device = await getIOSDeviceMetadata()
  
  // Get data container path
  const containerResult = await execCommand(`${XCRUN} simctl get_app_container booted ${bundleId} data`)
  const dataPath = containerResult.output.trim()
  
  if (!dataPath) {
    throw new Error(`Could not find data container for ${bundleId}`)
  }

  // Clear contents of Library and Documents
  try {
    const libraryPath = `${dataPath}/Library`
    const documentsPath = `${dataPath}/Documents`
    const tmpPath = `${dataPath}/tmp`
    
    await fs.rm(libraryPath, { recursive: true, force: true }).catch(() => {})
    await fs.rm(documentsPath, { recursive: true, force: true }).catch(() => {})
    await fs.rm(tmpPath, { recursive: true, force: true }).catch(() => {})

    // Re-create empty directories as they are expected by apps
    await fs.mkdir(libraryPath, { recursive: true }).catch(() => {})
    await fs.mkdir(documentsPath, { recursive: true }).catch(() => {})
    await fs.mkdir(tmpPath, { recursive: true }).catch(() => {})
    
    return {
      device,
      dataCleared: true
    }
  } catch (err) {
    throw new Error(`Failed to clear data for ${bundleId}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function getIOSLogs(): Promise<GetLogsResponse> {
  const result = await execCommand(`${XCRUN} simctl spawn booted log show --style syslog --last 1m`)
  const device = await getIOSDeviceMetadata()
  const logs = result.output ? result.output.split('\n') : []
  return {
    device,
    logs,
    logCount: logs.length,
  }
}


export async function captureIOSScreenshot(): Promise<CaptureIOSScreenshotResponse> {
  const device = await getIOSDeviceMetadata()
  // Take screenshot to stdout as base64 (simctl does not output base64 directly; this is a simulation)
  // In practice, you'd need to save to a temp file and read as base64
  // For demonstration, we'll simulate the base64 string and resolution
  const fakeBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUA" // Truncated PNG header (full size)
  // Simulate downsampling by truncating base64 string to represent smaller image preview
  const downsampledBase64 = fakeBase64.substring(0, Math.floor(fakeBase64.length / 3))
  return {
    device,
    screenshot: downsampledBase64,
    resolution: { width: 375, height: 812 },
  }
}