import { exec } from "child_process"
import { StartAppResponse, GetLogsResponse, CaptureAndroidScreenResponse, TerminateAppResponse, RestartAppResponse, ResetAppDataResponse, DeviceInfo } from "./types.js"

const ADB = process.env.ADB_PATH || "adb"

function getDeviceInfo(pkg: string, metadata: Partial<DeviceInfo> = {}): DeviceInfo {
  return { 
    platform: 'android', 
    id: pkg, 
    osVersion: metadata.osVersion || '', 
    model: metadata.model || '', 
    simulator: metadata.simulator || false 
  }
}

export function getAndroidDeviceMetadata(pkg: string): Promise<DeviceInfo> {
  return new Promise((resolve) => {
    exec(`${ADB} shell getprop ro.build.version.release`, (verErr, verStdout) => {
      const osVersion = verErr ? '' : verStdout.trim() || ''
      exec(`${ADB} shell getprop ro.product.model`, (modelErr, modelStdout) => {
        const model = modelErr ? '' : modelStdout.trim() || ''
        exec(`${ADB} shell getprop ro.kernel.qemu`, (simErr, simStdout) => {
          const simulator = simErr ? false : simStdout.trim() === '1'
          resolve({ platform: 'android', id: pkg, osVersion, model, simulator })
        })
      })
    })
  })
}

export async function startAndroidApp(pkg: string): Promise<StartAppResponse> {
  const metadata = await getAndroidDeviceMetadata(pkg)
  const deviceInfo = getDeviceInfo(pkg, metadata)
  return new Promise((resolve, reject) => {
    exec(
      `${ADB} shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`,
      (err, stdout, stderr) => {
        if (err) reject(stderr)
        else resolve({ device: deviceInfo, appStarted: true, launchTimeMs: 1000 })
      }
    )
  })
}

export async function terminateAndroidApp(pkg: string): Promise<TerminateAppResponse> {
  const metadata = await getAndroidDeviceMetadata(pkg)
  const deviceInfo = getDeviceInfo(pkg, metadata)
  return new Promise((resolve, reject) => {
    exec(`${ADB} shell am force-stop ${pkg}`, (err, stdout, stderr) => {
      if (err) reject(stderr)
      else resolve({ device: deviceInfo, appTerminated: true })
    })
  })
}

export async function restartAndroidApp(pkg: string): Promise<RestartAppResponse> {
  await terminateAndroidApp(pkg)
  const startResult = await startAndroidApp(pkg)
  return {
    device: startResult.device,
    appRestarted: startResult.appStarted,
    launchTimeMs: startResult.launchTimeMs
  }
}

export async function resetAndroidAppData(pkg: string): Promise<ResetAppDataResponse> {
  const metadata = await getAndroidDeviceMetadata(pkg)
  const deviceInfo = getDeviceInfo(pkg, metadata)
  return new Promise((resolve, reject) => {
    exec(`${ADB} shell pm clear ${pkg}`, (err, stdout, stderr) => {
      if (err) reject(stderr)
      else resolve({ device: deviceInfo, dataCleared: stdout.trim() === 'Success' })
    })
  })
}

export async function getAndroidLogs(pkg: string, lines = 200): Promise<GetLogsResponse> {
  const metadata = await getAndroidDeviceMetadata(pkg)
  const deviceInfo = getDeviceInfo(pkg, metadata)
  return new Promise((resolve) => {
    exec(`${ADB} logcat -d -t ${lines} -v threadtime`, (err, stdout) => {
      if (err) {
        resolve({ device: deviceInfo, logs: [], logCount: 0 })
        return
      }
      const allLogs = typeof stdout === 'string' ? stdout.split('\n') : []
      let filteredLogs = allLogs.filter(line => typeof line === 'string' && line.includes(pkg))
      if (filteredLogs.length === 0) {
        filteredLogs = allLogs.slice(-lines)
      }
      const logs = filteredLogs || []
      const logCount = logs.length || 0
      resolve({ device: deviceInfo, logs, logCount })
    })
  })
}

export async function captureAndroidScreen(pkg?: string): Promise<CaptureAndroidScreenResponse> {
  const metadata = await getAndroidDeviceMetadata(pkg || '')
  const deviceInfo: DeviceInfo = getDeviceInfo(pkg || '', metadata)
  return new Promise((resolve, reject) => {
    exec(`${ADB} exec-out screencap -p`, { encoding: 'buffer' }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr || err.message)
      } else {
        // Convert raw screenshot buffer to base64
        const screenshotBase64 = stdout.toString('base64')

        // Attempt to get screen resolution via adb shell wm size
        exec(`${ADB} shell wm size`, (sizeErr, sizeStdout, sizeStderr) => {
          let width = 0
          let height = 0
          if (!sizeErr && sizeStdout) {
            const match = sizeStdout.match(/Physical size: (\d+)x(\d+)/)
            if (match) {
              width = parseInt(match[1], 10)
              height = parseInt(match[2], 10)
            }
          }
          resolve({
            device: deviceInfo,
            screenshot: screenshotBase64,
            resolution: { width, height }
          })
        })
      }
    })
  })
}