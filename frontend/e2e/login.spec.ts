import { test, expect } from "@playwright/test";

test.describe("Login gate", () => {
  test("redirects to /login when there is no session", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });

  test("logging in with any credentials reaches the MNDA creator", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("person@example.com");
    await page.getByLabel("Password").fill("anything");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
  });

  test("session persists across a reload", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("person@example.com");
    await page.getByLabel("Password").fill("anything");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
  });
});
