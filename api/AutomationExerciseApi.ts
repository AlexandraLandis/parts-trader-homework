import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Product } from '../data/catalog';
import type { User } from '../data/users';
import { parsePrice } from '../utils/format';

/** Every response is HTTP 200; the real status is in `responseCode`. */
export interface ApiBody {
  responseCode: number;
  message?: string;
}

type Form = Record<string, string>;

interface ProductsBody extends ApiBody {
  products: { id: number; name: string; price: string }[];
}

/** Client for the endpoints the tests use. Paths are relative to baseURL. */
export class AutomationExerciseApi {
  constructor(private readonly request: APIRequestContext) {}

  // API 1. Every product on the site, with its price as a number.
  async getProducts(): Promise<Product[]> {
    const body = (await this.send('GET', 'api/productsList')) as ProductsBody;
    return body.products.map(({ id, name, price }) => ({ id, name, price: parsePrice(price) }));
  }

  // API 7, 8 and 10. The form is sent as-is so tests can leave fields out.
  verifyLogin(form: Form): Promise<ApiBody> {
    return this.send('POST', 'api/verifyLogin', form);
  }

  // API 11
  createAccount(user: User): Promise<ApiBody> {
    return this.send('POST', 'api/createAccount', toAccountForm(user));
  }

  // API 12
  deleteAccount(email: string, password: string): Promise<ApiBody> {
    return this.send('DELETE', 'api/deleteAccount', { email, password });
  }

  /** Any method against any endpoint, e.g. API 9 (DELETE to verifyLogin). The API expects form data, not JSON. */
  async send(method: string, path: string, form?: Form): Promise<ApiBody> {
    return parse(await this.request.fetch(path, { method, form }));
  }

  /** Sends a JSON body instead of a form, to check the API rejects it. */
  async sendJson(method: string, path: string, data: object): Promise<ApiBody> {
    return parse(await this.request.fetch(path, { method, data }));
  }
}

async function parse(response: APIResponse): Promise<ApiBody> {
  const text = await response.text();
  try {
    return JSON.parse(text) as ApiBody;
  } catch {
    throw new Error(`Expected JSON from ${response.url()} but got: ${text.slice(0, 200)}`);
  }
}

function toAccountForm(user: User): Form {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    title: user.title,
    birth_date: String(user.birthDay),
    birth_month: String(user.birthMonth),
    birth_year: String(user.birthYear),
    firstname: user.firstName,
    lastname: user.lastName,
    company: user.company,
    address1: user.address1,
    address2: user.address2,
    country: user.country,
    zipcode: user.zipcode,
    state: user.state,
    city: user.city,
    mobile_number: user.mobileNumber,
  };
}
