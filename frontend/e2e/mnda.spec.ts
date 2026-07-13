import { test, expect, type Locator } from "./fixtures";

async function scrollTopOf(locator: Locator): Promise<number> {
  return locator.evaluate((el) => el.scrollTop);
}

async function setScrollTop(locator: Locator, value: number): Promise<void> {
  await locator.evaluate((el, v) => {
    el.scrollTop = v;
  }, value);
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

  test("fills in the form and sees the values reflected in the live preview", async ({ page }) => {
    await page.goto("/");

    const preview = page.getByTestId("agreement-preview-pane");

    await page.getByLabel("Governing Law").fill("Delaware");
    await page.getByLabel("Jurisdiction").fill("New Castle, DE");
    const [party1Name] = await page.getByLabel("Print Name").all();
    await party1Name.fill("Jane Doe");

    await expect(preview.getByText("Governing Law: Delaware")).toBeVisible();
    await expect(preview.getByText("Jurisdiction: New Castle, DE")).toBeVisible();
    await expect(preview.getByText("Jane Doe")).toBeVisible();
    // Governing Law is also substituted inline into the Standard Terms body.
    await expect(preview.getByText(/laws of the State of Delaware/)).toBeVisible();
  });

  test("scrolls the form and preview panes independently on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const formPane = page.getByTestId("agreement-form-pane");
    const previewPane = page.getByTestId("agreement-preview-pane");

    // Both panes must actually have overflow to scroll, otherwise this test would pass vacuously.
    const [formOverflows, previewOverflows] = await Promise.all([
      formPane.evaluate((el) => el.scrollHeight > el.clientHeight),
      previewPane.evaluate((el) => el.scrollHeight > el.clientHeight),
    ]);
    expect(formOverflows).toBe(true);
    expect(previewOverflows).toBe(true);

    await setScrollTop(previewPane, 400);
    expect(await scrollTopOf(previewPane)).toBeGreaterThan(0);
    expect(await scrollTopOf(formPane)).toBe(0);

    await setScrollTop(formPane, 200);
    expect(await scrollTopOf(formPane)).toBeGreaterThan(0);
    // The preview pane must keep its own scroll position, unaffected by the form's scroll.
    expect(await scrollTopOf(previewPane)).toBeGreaterThan(0);
  });

  test("stacks into a single scrolling column on mobile viewports", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const formPane = page.getByTestId("agreement-form-pane");
    const overflowY = await formPane.evaluate((el) => getComputedStyle(el).overflowY);
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
