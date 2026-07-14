import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MndaApp from "./MndaApp";
import type { MndaChatFieldsResponse } from "@/lib/mndaChat";

const rawStandardTerms =
  'Confidential Information is disclosed for the <span class="coverpage_link">Purpose</span>.';

const emptyFields: MndaChatFieldsResponse = {
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

function mockChatResponse(fields: Partial<MndaChatFieldsResponse>, done = false) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(
      JSON.stringify({ reply: "Got it.", fields: { ...emptyFields, ...fields }, done }),
      { status: 200 },
    ),
  );
}

async function sendChatMessage(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText("Type your answer...");
  await user.type(input, text);
  await user.click(screen.getByRole("button", { name: "Send" }));
}

describe("MndaApp", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("reflects chat-extracted fields in the live preview", async () => {
    const user = userEvent.setup();
    mockChatResponse({ purpose: "Evaluating a joint venture" });
    render(<MndaApp rawStandardTerms={rawStandardTerms} />);

    await sendChatMessage(user, "Evaluating a joint venture");

    const coverPage = within(screen.getByText("Cover Page", { selector: "h2" }).closest("section")!);
    expect(await coverPage.findByText("Evaluating a joint venture")).toBeInTheDocument();

    const standardTermsSection = screen.getByText("Standard Terms", { selector: "h2" }).closest("section")!;
    await waitFor(() =>
      expect(standardTermsSection).toHaveTextContent(
        "Confidential Information is disclosed for the Evaluating a joint venture.",
      ),
    );
  });

  it("invokes window.print when the Download PDF button is clicked", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<MndaApp rawStandardTerms={rawStandardTerms} />);

    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it("keeps party fields extracted from chat independent of each other", async () => {
    const user = userEvent.setup();
    mockChatResponse({ party1: { name: "Jane Doe", title: null, company: null, noticeAddress: null } });
    render(<MndaApp rawStandardTerms={rawStandardTerms} />);
    await sendChatMessage(user, "Party 1 is Jane Doe");

    mockChatResponse({ party2: { name: "John Smith", title: null, company: null, noticeAddress: null } });
    await sendChatMessage(user, "Party 2 is John Smith");

    const coverPage = within(screen.getByText("Cover Page", { selector: "h2" }).closest("section")!);
    expect(await coverPage.findByText("Jane Doe")).toBeInTheDocument();
    expect(await coverPage.findByText("John Smith")).toBeInTheDocument();
  });
});
