import { test, expect } from "@playwright/test";

test.describe("Login gate", () => {
  test("redirects to /login when there is no session", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("signing up creates an account and reaches the app", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

    await page.getByLabel("Email").fill("signup-flow@example.com");
    await page.getByLabel("Password").fill("a-strong-password");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "New agreement" })).toBeVisible();
  });

  test("signing up twice with the same email shows a conflict error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.getByLabel("Email").fill("duplicate@example.com");
    await page.getByLabel("Password").fill("a-strong-password");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "New agreement" })).toBeVisible();

    await page.request.post("/api/auth/logout");
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.getByLabel("Email").fill("duplicate@example.com");
    await page.getByLabel("Password").fill("a-different-password");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test("logging in with the correct password reaches the app, session persists across reload", async ({
    page,
  }) => {
    await page.request.post("/api/auth/signup", {
      data: { email: "login-flow@example.com", password: "a-strong-password" },
    });
    await page.request.post("/api/auth/logout");

    await page.goto("/login");
    await page.getByLabel("Email").fill("login-flow@example.com");
    await page.getByLabel("Password").fill("a-strong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("heading", { name: "New agreement" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("heading", { name: "New agreement" })).toBeVisible();
  });

  test("logging in with the wrong password shows an error and does not navigate", async ({ page }) => {
    await page.request.post("/api/auth/signup", {
      data: { email: "wrong-password@example.com", password: "a-strong-password" },
    });
    await page.request.post("/api/auth/logout");

    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong-password@example.com");
    await page.getByLabel("Password").fill("not-the-right-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login\/?$/);
  });
});
