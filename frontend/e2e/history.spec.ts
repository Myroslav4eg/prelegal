import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

// Document history is per-user and persists for the run, so (unlike the
// other specs) each test here signs up its own isolated user rather than
// sharing fixtures.ts's single e2e account - otherwise a document saved by
// one test would leak into another test's "empty" or "one document" checks.
async function loginAsNewUser(page: Page, email: string): Promise<void> {
  await page.request.post("/api/auth/signup", { data: { email, password: "a-strong-password" } });
}

async function mockMndaCompletion(page: Page): Promise<void> {
  await page.route("**/api/documents/chat", async (route) => {
    await route.fulfill({ json: { reply: "Let's build a Mutual NDA.", slug: "mnda" } });
  });
  await page.route("**/api/documents/mnda/chat", async (route) => {
    await route.fulfill({
      json: {
        reply: "All set!",
        fields: { purpose: "Evaluating a joint venture" },
        done: true,
      },
    });
  });
}

async function sendChatMessage(page: Page, text: string): Promise<void> {
  await page.getByPlaceholder("Type your answer...").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

test.describe("Document history", () => {
  test("shows an empty state before any document has been completed", async ({ page }) => {
    await loginAsNewUser(page, "history-empty@example.com");
    await page.goto("/documents");

    await expect(page.getByText("No documents yet")).toBeVisible();
  });

  test("completing a document in chat saves it, and it appears in history with the right preview", async ({
    page,
  }) => {
    await loginAsNewUser(page, "history-complete@example.com");
    await mockMndaCompletion(page);
    await page.goto("/");

    await sendChatMessage(page, "I need a mutual NDA");
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();

    await sendChatMessage(page, "Evaluating a joint venture");
    await expect(page.getByText(/your agreement is ready/i)).toBeVisible();

    await page.goto("/documents");

    await expect(page.getByRole("button", { name: /Mutual Non-Disclosure Agreement/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
    await expect(page.locator("body")).toContainText("Evaluating a joint venture");
  });
});
