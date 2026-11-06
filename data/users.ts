import { faker } from '@faker-js/faker';

export type Title = 'Mr' | 'Mrs';

export interface User {
  title: Title;
  /** Display name entered on the first signup step ("Logged in as <name>"). */
  name: string;
  email: string;
  password: string;
  birthDay: number;
  /** 1-12. */
  birthMonth: number;
  birthYear: number;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

// The site escapes characters like apostrophes ("O'Keefe") inconsistently, so random data avoids them.
const clean = (value: string): string => value.replace(/[^A-Za-z0-9 ,.-]/g, '').trim();

/** A unique email, so parallel tests and reruns don't clash. */
export function uniqueEmail(prefix = 'qa'): string {
  const local = clean(prefix).toLowerCase().replace(/[^a-z0-9]/g, '') || 'qa';
  const suffix = faker.string.alphanumeric({ length: 8, casing: 'lower' });
  return `${local}.${Date.now()}.${suffix}@example.com`;
}

export function buildUser(password: string, overrides: Partial<User> = {}): User {
  const firstName = clean(faker.person.firstName()).replace(/[^A-Za-z]/g, '') || 'Alex';
  const lastName = clean(faker.person.lastName()).replace(/[^A-Za-z]/g, '') || 'Tester';

  return {
    title: faker.helpers.arrayElement<Title>(['Mr', 'Mrs']),
    name: `${firstName} ${lastName}`,
    email: uniqueEmail(firstName),
    password,
    // 1-28 keeps every generated date valid in every month.
    birthDay: faker.number.int({ min: 1, max: 28 }),
    birthMonth: faker.number.int({ min: 1, max: 12 }),
    birthYear: faker.number.int({ min: 1950, max: 2005 }),
    firstName,
    lastName,
    company: clean(faker.company.name()),
    address1: clean(faker.location.streetAddress()),
    address2: clean(faker.location.secondaryAddress()),
    // Faker's default locale is US, so the state, city and zip code below are US-style. A random
    // country would give mismatched addresses like a California address in New Zealand, which
    // the site only accepts because it doesn't verify addresses (ISSUES.md, Issue 23). Pass a
    // different country as an override if a test needs one.
    country: 'United States',
    state: clean(faker.location.state()),
    city: clean(faker.location.city()),
    zipcode: faker.location.zipCode('#####'),
    mobileNumber: faker.string.numeric({ length: 10, allowLeadingZeros: false }),
    ...overrides,
  };
}
