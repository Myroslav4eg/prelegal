import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

async function scrollTopOf(locator: Locator): Promise<number> {
  return locator.evaluate((el) => el.scrollTop);
}

async function setScrollTop(locator: Locator, value: number): Promise<void> {
  await locator.evaluate((el, v) => {
    el.scrollTop = v;
  }, value);
}

const emptyFields = {
  purpose: null,
  effectiveDate: null,
  mndaTermOption: null,
  mndaTermYears: null,
  confidentialityTermOption: null,
  confidentialityTermYears: null,
  governingLaw: null,
  jurisdiction: null,
  modifications: null,
  party1: null,
  party2: null,
};

interface MockTurn {
  reply: string;
  fields?: Record<string, unknown>;
  done?: boolean;
}

/**
 * Stubs the chat endpoint with a scripted sequence of responses, so the e2e
 * suite never depends on a real, nondeterministic LLM call. The last turn
 * repeats if the test sends more messages than were scripted.
 */
async function mockChatTurns(page: Page, turns: MockTurn[]): Promise<void> {
  let call = 0;
  await page.route("**/api/mnda/chat", async (route) => {
    const turn = turns[Math.min(call, turns.length - 1)];
    call++;
    await route.fulfill({
      json: { reply: turn.reply, fields: { ...emptyFields, ...turn.fields }, done: turn.done ?? false },
    });
  });
}

async function sendChatMessage(page: Page, text: string): Promise<void> {
  await page.getByPlaceholder("Type your answer...").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

test.describe("Mutual NDA creator", () => {
  test("loads and shows the default agreement preview", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
    await expect(page.getByTestId("agreement-preview-pane")).toContainText(
      "Common Paper Mutual Non-Disclosure Agreement",
    );
  });

  test("chats with the AI and sees extracted values reflected in the live preview", async ({ page }) => {
    await mockChatTurns(page, [
      {
        reply: "Got it, and party 1?",
        fields: { governingLaw: "Delaware", jurisdiction: "New Castle, DE" },
      },
      {
        reply: "Thanks!",
        fields: { party1: { name: "Jane Doe", title: null, company: null, noticeAddress: null } },
      },
    ]);
    await page.goto("/");

    const preview = page.getByTestId("agreement-preview-pane");

    await sendChatMessage(page, "Governed by Delaware law, New Castle DE jurisdiction");
    await expect(preview.getByText("Governing Law: Delaware")).toBeVisible();
    await expect(preview.getByText("Jurisdiction: New Castle, DE")).toBeVisible();
    // Governing Law is also substituted inline into the Standard Terms body.
    await expect(preview.getByText(/laws of the State of Delaware/)).toBeVisible();

    await sendChatMessage(page, "Party 1 is Jane Doe");
    await expect(preview.getByText("Jane Doe")).toBeVisible();
  });

  test("shows the done banner once every field is extracted, and stays open for corrections", async ({
    page,
  }) => {
    await mockChatTurns(page, [{ reply: "All set!", fields: { governingLaw: "Delaware" }, done: true }]);
    await page.goto("/");

    await sendChatMessage(page, "That's everything");

    await expect(page.getByText(/your agreement is ready/i)).toBeVisible();
    await expect(page.getByPlaceholder("Type your answer...")).toBeEnabled();
  });

  test("scrolls the chat and preview panes independently on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const longReply =
      "Here is a fairly long follow-up question meant to pad out the chat transcript so the pane actually overflows and becomes scrollable in this test.";
    await mockChatTurns(
      page,
      Array.from({ length: 8 }, () => ({ reply: longReply })),
    );
    await page.goto("/");

    const chatPane = page.getByTestId("agreement-chat-pane");
    const previewPane = page.getByTestId("agreement-preview-pane");

    for (let i = 0; i < 8; i++) {
      await sendChatMessage(page, `Answer number ${i}`);
    }

    // Both panes must actually have overflow to scroll, otherwise this test would pass vacuously.
    const [chatOverflows, previewOverflows] = await Promise.all([
      chatPane.evaluate((el) => el.scrollHeight > el.clientHeight),
      previewPane.evaluate((el) => el.scrollHeight > el.clientHeight),
    ]);
    expect(chatOverflows).toBe(true);
    expect(previewOverflows).toBe(true);

    // The chat pane may already be scrolled (the input auto-scrolls into view
    // as messages accumulate), so compare against its own starting position
    // rather than assuming 0.
    const chatScrollBeforePreviewScroll = await scrollTopOf(chatPane);
    await setScrollTop(previewPane, 400);
    expect(await scrollTopOf(previewPane)).toBeGreaterThan(0);
    expect(await scrollTopOf(chatPane)).toBe(chatScrollBeforePreviewScroll);

    await setScrollTop(chatPane, 200);
    expect(await scrollTopOf(chatPane)).toBeGreaterThan(0);
    // The preview pane must keep its own scroll position, unaffected by the chat pane's scroll.
    expect(await scrollTopOf(previewPane)).toBeGreaterThan(0);
  });

  test("stacks into a single scrolling column on mobile viewports", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const chatPane = page.getByTestId("agreement-chat-pane");
    const overflowY = await chatPane.evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflowY).toBe("visible");

    const scrollYBefore = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 1000);
    // The browser applies wheel-triggered scrolling asynchronously, so poll
    // rather than reading window.scrollY immediately after dispatching.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollYBefore);
  });

  test("Download PDF triggers the print dialog without a JS error", async ({ page }) => {
    await page.goto("/");

    let printInvoked = false;
    await page.exposeFunction("__onPrint", () => {
      printInvoked = true;
    });
    await page.addInitScript(() => {
      window.print = () => (window as unknown as { __onPrint: () => void }).__onPrint();
    });
    await page.reload();

    await page.getByRole("button", { name: "Download PDF" }).click();
    await expect.poll(() => printInvoked).toBe(true);
  });
});
