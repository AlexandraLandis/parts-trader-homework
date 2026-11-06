import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGrid } from './components/ProductGrid';

export class HomePage extends BasePage {
  protected readonly path = '';
  readonly carouselHeading: Locator;
  readonly featuresItemsHeading: Locator;
  readonly recommendedHeading: Locator;
  /** The "Features Items" grid. It lists every product. */
  readonly products: ProductGrid;

  constructor(page: Page) {
    super(page);
    this.carouselHeading = page.getByRole('heading', { name: 'Full-Fledged practice website for Automation Engineers' });
    this.featuresItemsHeading = page.getByRole('heading', { name: 'Features Items' });
    this.recommendedHeading = page.getByRole('heading', { name: 'Recommended Items' });
    this.products = new ProductGrid(page);
  }
}
