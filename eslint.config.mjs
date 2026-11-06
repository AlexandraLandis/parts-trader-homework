// @ts-check
import eslint from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', '.playwright-mcp/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.mjs'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Catches a missing await on an action or assertion.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Assertions live in specs, sometimes inside helper functions; these count as assertions.
      'playwright/expect-expect': ['warn', { assertFunctionNames: ['signUp', 'checkProducts', 'checkCart', 'checkOrder', 'placeOrderAndPay', 'checkCartIsEmpty', 'deleteAccount'] }],
      // Data-driven tests build titles in loops (e.g. one per request method); the rule can't see they're unique.
      'playwright/valid-title': 'off',
      'playwright/no-conditional-in-test': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/prefer-to-have-count': 'error',
      'playwright/prefer-to-have-length': 'error',
    },
  },
  {
    // The setup project records the environment's status for the tests; it asserts nothing.
    files: ['tests/setup/**/*.ts'],
    rules: { 'playwright/expect-expect': 'off' },
  },
  {
    // `{}` is Playwright's required syntax for fixtures that use no other fixtures.
    files: ['fixtures/**/*.ts'],
    rules: { 'no-empty-pattern': 'off' },
  },
);
