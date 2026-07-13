import { test as base, expect } from "@playwright/test";

// Overrides the built-in `page` fixture to log in first, via a direct API
// call that shares the browser context's cookie jar with `page`. Specs that
// need the unauthenticated flow (the login gate itself) import directly from
// "@playwright/test" instead of this file.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.request.post("/api/auth/login", {
      data: { email: "e2e@example.com", password: "anything" },
    });
    await use(page);
  },
});

export { expect };
