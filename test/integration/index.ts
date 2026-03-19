// Integration test runner (auto-generated)
// Runs a minimal set of tests by default. Device-dependent tests are gated
// behind the RUN_DEVICE_TESTS environment variable to avoid failing on CI
// systems without simulators or devices.

// Always-run (fast) integration tests
import './utils/test-dist';

// Device-dependent tests (simulators / real devices)
(async () => {
  if (process.env.RUN_DEVICE_TESTS === 'true') {
    console.log('RUN_DEVICE_TESTS=true: running device integration tests');
    await Promise.all([
      import('../device/manage/install.integration'),
      import('../device/manage/run-install-android'),
      import('../device/manage/run-install-ios'),
      import('../device/observe/logstream-real'),
      import('../device/observe/test-ui-tree'),
      import('../device/observe/wait_for_element_real'),
      import('../device/interact/run-real-test'),
      import('../device/interact/smoke-test')
    ]);
    console.log('Device integration imports complete');
  } else {
    console.log('Skipping device-dependent integration tests. Set RUN_DEVICE_TESTS=true to enable them.');
  }
})();

console.log('Integration tests runner imports complete');
