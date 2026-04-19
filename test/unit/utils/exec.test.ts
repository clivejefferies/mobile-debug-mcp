import assert from 'assert'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { execAdbWithDiagnostics } from '../../../src/utils/diagnostics.js'
import { execCmd } from '../../../src/utils/exec.js'

async function run() {
  const envResult = await execCmd(process.execPath, ['-e', 'console.log(process.env.MCP_EXEC_TEST); console.error("warn");'], {
    env: { MCP_EXEC_TEST: 'hello' }
  })
  assert.strictEqual(envResult.exitCode, 0)
  assert.strictEqual(envResult.stdout, 'hello')
  assert.strictEqual(envResult.stderr, 'warn')

  const timeoutResult = await execCmd(process.execPath, ['-e', 'setTimeout(() => console.log("late"), 200)'], {
    timeout: 50
  })
  assert.strictEqual(timeoutResult.exitCode, null)
  assert.strictEqual(timeoutResult.stdout, '')

  const binDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-exec-adb-'))
  const adbPath = path.join(binDir, 'adb')
  const script = `#!/bin/sh
echo "device not found" >&2
exit 1
`
  const originalAdbPath = process.env.ADB_PATH

  try {
    await fs.writeFile(adbPath, script, { mode: 0o755 })
    process.env.ADB_PATH = adbPath

    const adbResult = execAdbWithDiagnostics(['shell', 'getprop'], 'emulator-5554')
    assert.strictEqual(adbResult.runResult.command, adbPath)
    assert.deepStrictEqual(adbResult.runResult.args.slice(0, 2), ['-s', 'emulator-5554'])
    assert.match(adbResult.runResult.stderr, /device not found/)
    assert(adbResult.runResult.suggestedFixes?.some((fix) => fix.includes('adb devices')))

    console.log('exec utility tests passed')
  } finally {
    if (typeof originalAdbPath === 'undefined') delete process.env.ADB_PATH
    else process.env.ADB_PATH = originalAdbPath
    await fs.rm(binDir, { recursive: true, force: true }).catch(() => {})
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
