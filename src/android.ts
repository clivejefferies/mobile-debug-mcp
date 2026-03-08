import { exec } from "child_process"
import { StartAppResponse, GetLogsResponse, CaptureAndroidScreenResponse, DeviceInfo } from "./types.js"

const ADB = process.env.ADB_PATH || "adb"

function getDeviceInfo(pkg: string): DeviceInfo {
  return { platform: 'android', id: pkg }
}

export async function startAndroidApp(pkg: string): Promise<StartAppResponse> {
  const deviceInfo = getDeviceInfo(pkg)
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

export async function getAndroidLogs(pkg: string, lines = 200): Promise<GetLogsResponse> {
  const deviceInfo = getDeviceInfo(pkg)
  return new Promise((resolve, reject) => {
    exec(`${ADB} shell pidof -s ${pkg}`, (pidErr, pidStdout, pidStderr) => {
      if (pidErr || !pidStdout.trim()) {
        reject(pidStderr || "App process not running")
        return
      }

      const pid = pidStdout.trim()

      exec(`${ADB} logcat -d --pid=${pid} -t ${lines} -v threadtime`, (err, stdout, stderr) => {
        if (err) reject(stderr || err.message)
        else {
          const logsArray = stdout.split('\n')
          resolve({ device: deviceInfo, logs: logsArray, logCount: logsArray.length })
        }
      })
    })
  })
}

export async function captureAndroidScreen(pkg?: string): Promise<CaptureAndroidScreenResponse> {
  const deviceInfo: DeviceInfo = getDeviceInfo(pkg || '')
  return new Promise((resolve, reject) => {
    exec(`${ADB} exec-out screencap -p`, { encoding: 'buffer' }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr || err.message)
      } else {
        const base64Screenshot = stdout.toString('base64')
        resolve({ device: deviceInfo, screenshot: base64Screenshot, resolution: { width: 1080, height: 2400 } })
      }
    })
  })
}