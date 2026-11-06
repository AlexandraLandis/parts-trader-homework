import { faker } from '@faker-js/faker';

export interface PaymentCard {
  nameOnCard: string;
  number: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

/** A valid test card, using Visa's standard test number. */
export function buildCard(nameOnCard: string, overrides: Partial<PaymentCard> = {}): PaymentCard {
  const currentYear = new Date().getFullYear();
  return {
    nameOnCard,
    number: '4111111111111111',
    cvc: faker.string.numeric(3),
    expiryMonth: String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0'),
    expiryYear: String(faker.number.int({ min: currentYear + 1, max: currentYear + 6 })),
    ...overrides,
  };
}
