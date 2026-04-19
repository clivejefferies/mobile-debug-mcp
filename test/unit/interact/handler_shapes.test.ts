import assert from 'assert'
import { ToolsInteract, AndroidInteract } from '../../../src/interact/index.js'

async function run() {
  const originalMockDevices = process.env.MCP_TEST_MOCK_DEVICES
  const originalTap = AndroidInteract.prototype.tap
  const originalScrollToElement = AndroidInteract.prototype.scrollToElement

  process.env.MCP_TEST_MOCK_DEVICES = '1'

  try {
    AndroidInteract.prototype.tap = async function (x: number, y: number, deviceId?: string) {
      return {
        device: { platform: 'android', id: deviceId || 'mock', osVersion: '14', model: 'Pixel', simulator: true },
        success: true,
        x,
        y
      } as any
    }

    const tapResponse = await ToolsInteract.tapHandler({ platform: 'android', x: 10, y: 20 })
    assert.strictEqual(tapResponse.success, true)
    assert.strictEqual(typeof tapResponse.device.id, 'string')
    assert.strictEqual(tapResponse.x, 10)
    assert.strictEqual(tapResponse.y, 20)

    AndroidInteract.prototype.scrollToElement = async function () {
      return {
        success: true,
        element: { text: 'Settings', bounds: [0, 0, 100, 50] },
        scrollsPerformed: 2
      } as any
    }

    const scrollResponse = await ToolsInteract.scrollToElementHandler({
      platform: 'android',
      selector: { text: 'Settings' }
    })
    assert.strictEqual(scrollResponse.success, true)
    assert.strictEqual(scrollResponse.scrollsPerformed, 2)
    assert.strictEqual(scrollResponse.element.text, 'Settings')

    console.log('interact handler shape tests passed')
  } finally {
    AndroidInteract.prototype.tap = originalTap
    AndroidInteract.prototype.scrollToElement = originalScrollToElement
    if (typeof originalMockDevices === 'undefined') delete process.env.MCP_TEST_MOCK_DEVICES
    else process.env.MCP_TEST_MOCK_DEVICES = originalMockDevices
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
