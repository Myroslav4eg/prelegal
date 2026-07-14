import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

interface SelectionTurn {
  reply: string;
  slug?: string | null;
}

interface DocumentTurn {
  reply: string;
  fields?: Record<string, unknown>;
  done?: boolean;
}

/** Stubs the selection endpoint, resolving to "mnda" on the given user turn index (0-based). */
async function mockSelectionChat(page: Page, turns: SelectionTurn[]): Promise<void> {
  let call = 0;
  await page.route("**/api/documents/chat", async (route) => {
    const turn = turns[Math.min(call, turns.length - 1)];
    call++;
    await route.fulfill({ json: { reply: turn.reply, slug: turn.slug ?? null } });
  });
}

async function mockMndaChat(page: Page, turns: DocumentTurn[]): Promise<void> {
  let call = 0;
  await page.route("**/api/documents/mnda/chat", async (route) => {
    const turn = turns[Math.min(call, turns.length - 1)];
    call++;
    await route.fulfill({
      json: { reply: turn.reply, fields: turn.fields ?? {}, done: turn.done ?? false },
    });
  });
}

async function sendChatMessage(page: Page, text: string): Promise<void> {
  await page.getByPlaceholder("Type your answer...").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

async function selectMnda(page: Page): Promise<void> {
  await mockSelectionChat(page, [{ reply: "Let's build a Mutual NDA.", slug: "mnda" }]);
  await page.goto("/");
  await sendChatMessage(page, "I need a mutual NDA");
  // Wait for the selection response to actually land client-side before the
  // caller sends the next message, otherwise a fast follow-up can race and
  // hit the selection endpoint again instead of the per-document one.
  await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
}

test.describe("Legal Agreement Creator", () => {
  test("shows a placeholder preview until a document is chosen", async ({ page }) => {
    await mockSelectionChat(page, [{ reply: "What kind of document do you need?", slug: null }]);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "New agreement" })).toBeVisible();
    await expect(page.getByTestId("agreement-preview-pane")).toContainText(
      "Tell the AI what kind of document you need",
    );
  });

  test("explains an unsupported document request and suggests the closest match", async ({ page }) => {
    await mockSelectionChat(page, [
      { reply: "We can't generate that, but a Professional Services Agreement is close.", slug: null },
    ]);
    await page.goto("/");

    await sendChatMessage(page, "I need an employment contract");

    await expect(page.getByText(/Professional Services Agreement is close/)).toBeVisible();
  });

  test("selecting the Mutual NDA switches the preview to that document", async ({ page }) => {
    await selectMnda(page);

    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
    await expect(page.getByTestId("agreement-preview-pane")).toContainText(
      "Common Paper Mutual Non-Disclosure Agreement",
    );
  });

  test("chats with the AI and sees extracted values reflected in the live preview", async ({ page }) => {
    await selectMnda(page);
    await mockMndaChat(page, [
      { reply: "Got it, and party 1?", fields: { governingLaw: "Delaware", jurisdiction: "New Castle, DE" } },
      { reply: "Thanks!", fields: { party1: { name: "Jane Doe" } } },
    ]);

    const preview = page.getByTestId("agreement-preview-pane");

    await sendChatMessage(page, "Governed by Delaware law, New Castle DE jurisdiction");
    await expect(preview.getByText("Governing Law", { exact: true })).toBeVisible();
    await expect(preview.getByText("Jurisdiction", { exact: true })).toBeVisible();
    // Governing Law is also substituted inline into the Standard Terms body.
    await expect(preview.getByText(/laws of the State of Delaware/)).toBeVisible();

    await sendChatMessage(page, "Party 1 is Jane Doe");
    await expect(preview.getByText("Jane Doe")).toBeVisible();
  });

  test("shows the done banner once every field is extracted, and stays open for corrections", async ({
    page,
  }) => {
    await selectMnda(page);
    await mockMndaChat(page, [{ reply: "All set!", fields: { governingLaw: "Delaware" }, done: true }]);

    await sendChatMessage(page, "That's everything");

    await expect(page.getByText(/your agreement is ready/i)).toBeVisible();
    await expect(page.getByPlaceholder("Type your answer...")).toBeEnabled();
  });

  test("keeps the chat widget's height fixed and scrolls messages internally as the conversation grows", async ({
    page,
  }) => {
    const longReply =
      "Here is a fairly long follow-up question meant to pad out the chat transcript so the message list actually overflows and becomes scrollable in this test.";
    await selectMnda(page);
    await mockMndaChat(
      page,
      Array.from({ length: 8 }, () => ({ reply: longReply })),
    );

    const chatMessages = page.getByTestId("chat-messages");
    const heightBefore = (await chatMessages.boundingBox())?.height;

    for (let i = 0; i < 8; i++) {
      await sendChatMessage(page, `Answer number ${i}`);
    }
    // The loop above never waits for the final reply, since there is no
    // subsequent send to block on the input being re-enabled - wait for it
    // explicitly so the last message (and its auto-scroll) has landed before
    // the snapshots below.
    await expect(page.getByPlaceholder("Type your answer...")).toBeEnabled();

    const heightAfter = (await chatMessages.boundingBox())?.height;
    // The widget's own height must not grow with the conversation - only its
    // internal scroll region should, which is exactly the "pinned, not
    // drifting down the page" behavior this test guards.
    expect(heightAfter).toBe(heightBefore);

    const overflows = await chatMessages.evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(overflows).toBe(true);

    const previewPane = page.getByTestId("agreement-preview-pane");
    const chatScrollBefore = await chatMessages.evaluate((el) => el.scrollTop);
    await previewPane.evaluate((el) => {
      el.scrollTop = 400;
    });
    expect(await previewPane.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    // Scrolling the preview pane must not move the chat's own scroll position.
    expect(await chatMessages.evaluate((el) => el.scrollTop)).toBe(chatScrollBefore);
  });

  test("Download PDF triggers the print dialog without a JS error", async ({ page }) => {
    let printInvoked = false;
    await page.exposeFunction("__onPrint", () => {
      printInvoked = true;
    });
    await page.addInitScript(() => {
      window.print = () => (window as unknown as { __onPrint: () => void }).__onPrint();
    });

    await selectMnda(page);

    await page.getByRole("button", { name: "Download PDF" }).click();
    await expect.poll(() => printInvoked).toBe(true);
  });
});
