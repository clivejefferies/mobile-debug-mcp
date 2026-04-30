import assert from 'assert'
import { buildActionExecutionResult, inferGenericFailure, requireBooleanArg } from '../../../src/server/common.js'

function run() {
  assert.strictEqual(requireBooleanArg({ exact: true }, 'exact'), true)
  assert.strictEqual(requireBooleanArg({ exact: false }, 'exact'), false)
  assert.throws(() => requireBooleanArg({}, 'exact'), /Missing or invalid boolean argument: exact/)
  assert.throws(() => requireBooleanArg({ exact: 'true' as unknown as boolean }, 'exact'), /Missing or invalid boolean argument: exact/)

  assert.deepStrictEqual(inferGenericFailure('semantic mismatch between inferred and raw state'), {
    failureCode: 'SEMANTIC_MISMATCH',
    retryable: false
  })

  const recoveryResult = buildActionExecutionResult({
    actionType: 'tap',
    sourceModule: 'server',
    selector: { x: 10, y: 20 },
    success: false,
    uiFingerprintBefore: 'fp_before',
    uiFingerprintAfter: 'fp_after',
    failure: { failureCode: 'SEMANTIC_MISMATCH', retryable: false }
  })
  assert.strictEqual(recoveryResult.failure_code, 'SEMANTIC_MISMATCH')
  assert.strictEqual(recoveryResult.recovery?.failure_class, 'SemanticMismatchFailure')
  assert.strictEqual(recoveryResult.recovery?.runtime_code, 'SEMANTIC_MISMATCH')
  assert.strictEqual(recoveryResult.recovery?.retry_allowed, false)
  assert.strictEqual(recoveryResult.recovery?.max_recovery_attempts, 3)
  assert.strictEqual(recoveryResult.recovery?.max_retry_depth, 3)

  console.log('server common tests passed')
}

try {
  run()
} catch (error) {
  console.error(error)
  process.exit(1)
}
