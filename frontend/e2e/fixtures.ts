import { test as base, expect } from "@playwright/test";

const CREDENTIALS = { email: "e2e@example.com", password: "e2e-test-password" };

// Overrides the built-in `page` fixture to log in first, via a direct API
// call that shares the browser context's cookie jar with `page`. The backend
// DB is reset once per test-server boot (not per test), so signup 409s after
// the first use within a run - fall back to login with the same password.
// Specs that need the unauthenticated flow (the login gate itself) import
// directly from "@playwright/test" instead of this file.
export const test = base.extend({
  page: async ({ page }, use) => {
    const signupResponse = await page.request.post("/api/auth/signup", { data: CREDENTIALS });
    if (signupResponse.status() === 409) {
      await page.request.post("/api/auth/login", { data: CREDENTIALS });
    }
    await use(page);
  },
});

export { expect };
