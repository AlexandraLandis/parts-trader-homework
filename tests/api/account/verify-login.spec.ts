import { expect, test } from '../../../fixtures';

// API 7-10. The tests that need an account get one through API 11 (registeredUser), and
// every account is deleted afterwards through API 12.
test.describe('Verify login API', () => {
  test('confirms an account exists for valid credentials', { tag: ['@p1', '@API-7'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: registeredUser.email, password: registeredUser.password });

    expect(body).toEqual({ responseCode: 200, message: 'User exists!' });
  });

  test('rejects a request without an email', { tag: ['@p2', '@API-8'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ password: registeredUser.password });

    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, email or password parameter is missing in POST request.',
    });
  });

  test('rejects a request without a password', { tag: ['@p2', '@API-8'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: registeredUser.email });

    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, email or password parameter is missing in POST request.',
    });
  });

  test('rejects credentials sent as JSON instead of form data', { tag: ['@p2', '@API-8'] }, async ({ api, registeredUser }) => {
    const body = await api.sendJson('POST', 'api/verifyLogin', {
      email: registeredUser.email,
      password: registeredUser.password,
    });

    expect(body.responseCode).toBe(400);
  });

  // API 9 names DELETE; GET and PUT get the same answer. PATCH doesn't (ISSUES.md, Issue 20).
  for (const method of ['DELETE', 'GET', 'PUT']) {
    test(`rejects ${method} as an unsupported method`, { tag: ['@p3', '@API-9'] }, async ({ api }) => {
      const body = await api.send(method, 'api/verifyLogin');

      expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
    });
  }

  test('reports "User not found!" for an unregistered email', { tag: ['@p2', '@API-10'] }, async ({ api, newUser }) => {
    const body = await api.verifyLogin({ email: newUser.email, password: newUser.password });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('reports "User not found!" for a wrong password', { tag: ['@p1', '@API-10'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: registeredUser.email, password: `${registeredUser.password}x` });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('reports "User not found!" for the password in a different letter case', { tag: ['@p1', '@API-10'] }, async ({
    api, registeredUser,
  }) => {
    const password = registeredUser.password.toUpperCase();
    expect(password, 'the password needs lower-case letters for this test').not.toBe(registeredUser.password);

    const body = await api.verifyLogin({ email: registeredUser.email, password });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('reports "User not found!" once the account is deleted', { tag: ['@p1', '@API-10'] }, async ({ api, newUser }) => {
    expect((await api.createAccount(newUser)).responseCode).toBe(201);
    expect((await api.deleteAccount(newUser.email, newUser.password)).responseCode).toBe(200);

    const body = await api.verifyLogin({ email: newUser.email, password: newUser.password });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('reports "User not found!" for SQL injection in the password', { tag: ['@p1', '@API-10'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: registeredUser.email, password: "' OR '1'='1" });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('reports "User not found!" for SQL injection in the email', { tag: ['@p1', '@API-10'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: "' OR '1'='1", password: registeredUser.password });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  // Sent but blank, which is different from leaving the field out (API 8). The site treats these
  // as a failed login rather than a bad request.
  test('reports "User not found!" for an empty password', { tag: ['@p1', '@API-10'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: registeredUser.email, password: '' });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('reports "User not found!" for an empty email', { tag: ['@p2', '@API-10'] }, async ({ api, registeredUser }) => {
    const body = await api.verifyLogin({ email: '', password: registeredUser.password });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });
});
