import { faker } from '@faker-js/faker';

export interface Product {
  id: number;
  name: string;
  /** Price in rupees, without the "Rs." prefix. */
  price: number;
}

/**
 * A number picks that many different products at random; a list of names picks those products.
 * The API doesn't say whether a product is in stock (ISSUES.md, Enhancement 1); today every product is.
 */
export type ProductChoice = number | string[];

export function chooseProducts(catalog: Product[], choice: ProductChoice): Product[] {
  if (typeof choice === 'number') {
    return faker.helpers.arrayElements(catalog, choice);
  }
  return choice.map((name) => {
    const product = catalog.find((p) => p.name === name);
    if (!product) throw new Error(`No product named "${name}" in the catalog`);
    return product;
  });
}
