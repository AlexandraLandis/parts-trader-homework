// Uses the base `test`: the project fixtures would try to skip this very check.
import { test as setup } from '@playwright/test';
import { probe, writeStatus } from '../../config/environment-status';
import { getEnvironment } from '../../config/environments';

// Always passes: an unreachable environment is recorded, and the fixtures skip each test.
setup('records whether the environment is reachable', async ({ request }) => {
  const { name, baseURL } = getEnvironment();
  const reason = await probe(request, baseURL);

  writeStatus({ baseURL, reachable: !reason, reason, checkedAt: Date.now() });
  setup.info().annotations.push({
    type: 'environment',
    description: reason ? `[${name}] ${reason}; all tests will be skipped` : `[${name}] ${baseURL} is reachable`,
  });
});
