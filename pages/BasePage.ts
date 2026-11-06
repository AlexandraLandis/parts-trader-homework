import type { Page } from '@playwright/test';
import { Header } from './components/Header';

export abstract class BasePage {
  readonly header: Header;

  /** Path relative to baseURL, without a leading slash. */
  protected abstract readonly path: string;

  constructor(readonly page: Page) {
    this.header = new Header(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
