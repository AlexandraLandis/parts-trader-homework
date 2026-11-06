import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { APIRequestContext } from '@playwright/test';

/**
 * The setup project and the test projects run in different processes, so the reachability
 * result is passed between them through this file.
 */
export interface EnvironmentStatus {
  baseURL: string;
  reachable: boolean;
  reason?: string;
  checkedAt: number;
}

const STATUS_FILE = join(__dirname, '..', 'playwright', '.cache', 'environment-status.json');
const MAX_AGE_MS = 15 * 60 * 1000;

/** Returns why the URL is unreachable, or undefined if it responds. */
export async function probe(request: APIRequestContext, url: string): Promise<string | undefined> {
  try {
    const response = await request.get(url, { timeout: 10_000 });
    // A 4xx still means the server is up.
    return response.status() >= 500 ? `${url} responded with HTTP ${response.status()}` : undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return `${url} is unreachable (${message})`;
  }
}

export function writeStatus(status: EnvironmentStatus): void {
  mkdirSync(dirname(STATUS_FILE), { recursive: true });
  writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

/**
 * The reason to skip, if this baseURL was found unreachable recently. A missing, stale or
 * mismatched file means "unknown" and tests run (e.g. UI mode, where setup is opt-in).
 */
export function unreachableReason(baseURL: string): string | undefined {
  let status: EnvironmentStatus;
  try {
    status = JSON.parse(readFileSync(STATUS_FILE, 'utf8')) as EnvironmentStatus;
  } catch {
    return undefined;
  }
  const isCurrent = status.baseURL === baseURL && Date.now() - status.checkedAt < MAX_AGE_MS;
  return isCurrent && !status.reachable ? status.reason : undefined;
}
