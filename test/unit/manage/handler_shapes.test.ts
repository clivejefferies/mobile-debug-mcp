import assert from 'assert'
import { ToolsManage } from '../../../src/manage/index.js'

async function run() {
  const originalBuildAppHandler = (ToolsManage as any).buildAppHandler
  const originalInstallAppHandler = (ToolsManage as any).installAppHandler

  try {
    ;(ToolsManage as any).buildAppHandler = async () => ({ artifactPath: '/tmp/fake.apk' })
    ;(ToolsManage as any).installAppHandler = async () => ({
      device: { platform: 'android', id: 'emulator-5554', osVersion: '14', model: 'Pixel', simulator: true },
      installed: true,
      output: 'Installed'
    })

    const response = await ToolsManage.buildAndInstallHandler({
      platform: 'android',
      projectPath: '/tmp/project',
      projectType: 'native'
    })

    const lines = response.ndjson.trim().split('\n').map((line) => JSON.parse(line))
    assert.deepStrictEqual(lines.map((line) => `${line.type}:${line.status}`), [
      'build:started',
      'build:finished',
      'install:started',
      'install:finished'
    ])
    assert.strictEqual(response.result.success, true)
    assert.strictEqual((response.result as any).artifactPath, '/tmp/fake.apk')
    assert.strictEqual((response.result as any).device.id, 'emulator-5554')

    console.log('manage handler shape tests passed')
  } finally {
    ;(ToolsManage as any).buildAppHandler = originalBuildAppHandler
    ;(ToolsManage as any).installAppHandler = originalInstallAppHandler
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
