// Select with TEST_ENV (default `dev`). BASE_URL and USER_PASSWORD override the stored values.

export interface Environment {
  name: EnvironmentName;
  baseURL: string;
  userPassword: string;
}

const ENVIRONMENTS = {
  /** Working instance. */
  dev: {
    baseURL: 'https://automationexercise.com/',
    userPassword: 'D3v3nv1r0m3nt',
  },
  /** Doesn't work. This is how we test skipping when an environment is down. */
  test: {
    baseURL: 'https://test.automationexercise.com/',
    userPassword: 'T35t3nv1r0m3nt',
  },
} as const satisfies Record<string, Omit<Environment, 'name'>>;

export type EnvironmentName = keyof typeof ENVIRONMENTS;

export const DEFAULT_ENVIRONMENT: EnvironmentName = 'dev';

function isEnvironmentName(value: string): value is EnvironmentName {
  return Object.hasOwn(ENVIRONMENTS, value);
}

/** Resolves the active environment from TEST_ENV. Fails fast on an unknown name. */
export function getEnvironment(name: string = process.env.TEST_ENV ?? DEFAULT_ENVIRONMENT): Environment {
  const normalized = name.trim().toLowerCase();
  if (!isEnvironmentName(normalized)) {
    throw new Error(
      `Unknown TEST_ENV "${name}". Valid values: ${Object.keys(ENVIRONMENTS).join(', ')}.`,
    );
  }

  const settings = ENVIRONMENTS[normalized];
  return {
    name: normalized,
    baseURL: process.env.BASE_URL || settings.baseURL,
    userPassword: process.env.USER_PASSWORD || settings.userPassword,
  };
}
