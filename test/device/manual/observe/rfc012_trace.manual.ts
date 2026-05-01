import assert from 'assert'
import { ToolsInteract } from '../../../../src/interact/index.js'
import { ToolsObserve } from '../../../../src/observe/index.js'

async function verifyTrace(platform: 'android' | 'ios', deviceId?: string) {
  const fingerprint = await ToolsObserve.getScreenFingerprintHandler({ platform, deviceId }) as any
  assert.ok(fingerprint, `${platform}: missing fingerprint response`)
  assert.ok(fingerprint.fingerprint || fingerprint.activity, `${platform}: missing fingerprint or activity`)

  const expected = fingerprint.fingerprint
    ? { fingerprint: fingerprint.fingerprint }
    : { screen: fingerprint.activity }

  const response = await ToolsInteract.expectScreenHandler({
    platform,
    deviceId,
    ...expected
  })

  assert.strictEqual(response.success, true, `${platform}: expect_screen did not succeed`)
  assert.ok(response.trace, `${platform}: trace missing`)
  assert.strictEqual(response.trace.final_outcome, 'success', `${platform}: trace outcome mismatch`)
  assert.ok(Array.isArray(response.trace.steps) && response.trace.steps.length > 0, `${platform}: trace steps missing`)
  assert.strictEqual(response.trace.steps[0].stage, 'verify', `${platform}: expected verify stage`)

  console.log(`${platform}: RFC 012 trace verified`)
}

async function main() {
  const args = process.argv.slice(2)
  const platform = args[0] as 'android' | 'ios' | undefined
  const deviceId = args[1]

  if (platform === 'android') {
    await verifyTrace('android', deviceId)
    return
  }

  if (platform === 'ios') {
    await verifyTrace('ios', deviceId)
    return
  }

  await verifyTrace('android')
  await verifyTrace('ios')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
