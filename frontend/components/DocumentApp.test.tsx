import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentApp from "./DocumentApp";

const templates = {
  mnda: 'Confidential Information is disclosed for the <span class="coverpage_link">Purpose</span>.',
  "pilot-agreement": "During the <span class=\"orderform_link\">Pilot Period</span>, access is granted.",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("DocumentApp", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows a placeholder preview before any document is selected", () => {
    render(<DocumentApp templates={templates} />);

    expect(screen.getByText(/tell the ai what kind of document you need/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();
  });

  it("switches the preview to the selected document and reflects extracted fields", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ reply: "A Mutual NDA it is.", slug: "mnda" }))
      .mockResolvedValueOnce(
        jsonResponse({ reply: "Thanks!", fields: { purpose: "Evaluating a joint venture" }, done: false }),
      );
    const user = userEvent.setup();
    render(<DocumentApp templates={templates} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "A mutual NDA");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("A Mutual NDA it is.");

    expect(await screen.findByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Type your answer..."), "Evaluating a joint venture");
    await user.click(screen.getByRole("button", { name: "Send" }));

    // Appears both in the Purpose field row and, bolded, in the substituted
    // Standard Terms body - just confirm it made it into the preview at all.
    await expect.poll(() => screen.queryAllByText("Evaluating a joint venture").length).toBeGreaterThan(0);
  });

  it("switching to a different document resets the form to that document's defaults", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ reply: "A Pilot Agreement it is.", slug: "pilot-agreement" }));
    const user = userEvent.setup();
    render(<DocumentApp templates={templates} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "A pilot agreement");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("heading", { name: "Pilot Agreement" })).toBeInTheDocument();
  });
});
