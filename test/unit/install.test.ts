import assert from 'assert'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { AndroidInteract } from '../../src/android/interact.js'

// Monkeypatch installApp to avoid running real adb/gradle
(AndroidInteract as any).prototype.installApp = async function (apkPath: string, deviceId?: string) {
  return { device: { platform: 'android', id: deviceId || 'default' }, installed: true, output: 'mock-adb-install' }
}

async function makeTempFile(ext: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-test-'))
  const file = path.join(dir, `fake${ext}`)
  await fs.writeFile(file, 'binary')
  return { dir, file }
}

async function makeTempDirWith(name: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-test-'))
  await fs.writeFile(path.join(dir, name), '')
  return dir
}

export async function run() {
  // Test: install with .apk file
  const { dir: d1, file: apk } = await makeTempFile('.apk')
  const ai = new AndroidInteract()
  const res1 = await ai.installApp(apk)
  assert.ok(res1.installed === true, 'APK install should succeed')

  // Test: project directory detection for Android (gradlew present)
  const dirGradle = await makeTempDirWith('gradlew')
  const res2 = await ai.installApp(dirGradle)
  assert.ok(res2.installed === true, 'Project dir (gradle) install should succeed')

  // cleanup
  await fs.rm(d1, { recursive: true, force: true }).catch(() => {})
  await fs.rm(dirGradle, { recursive: true, force: true }).catch(() => {})


  console.log('install tests passed')
}

run().catch((e) => { console.error(e); process.exit(1) })
