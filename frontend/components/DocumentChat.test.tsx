import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentChat from "./DocumentChat";
import { INITIAL_ASSISTANT_MESSAGE } from "@/lib/documentChat";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("DocumentChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows the fixed opening question without calling the backend", () => {
    render(<DocumentChat setValue={vi.fn()} onDocumentSelected={vi.fn()} />);

    expect(screen.getByText(INITIAL_ASSISTANT_MESSAGE)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts to the selection endpoint first, then calls onDocumentSelected once a slug is chosen", async () => {
    const onDocumentSelected = vi.fn();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ reply: "Let's build a Pilot Agreement.", slug: "pilot-agreement" }),
    );
    const user = userEvent.setup();
    render(<DocumentChat setValue={vi.fn()} onDocumentSelected={onDocumentSelected} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "I want a pilot agreement");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Let's build a Pilot Agreement.")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/documents/chat", expect.objectContaining({ method: "POST" }));
    expect(onDocumentSelected).toHaveBeenCalledWith("pilot-agreement");
  });

  it("switches to the document endpoint and applies fields after a document is selected", async () => {
    const setValue = vi.fn();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ reply: "Great, a Mutual NDA it is.", slug: "mnda" }))
      .mockResolvedValueOnce(
        jsonResponse({ reply: "What's the effective date?", fields: { purpose: "Evaluating a deal" }, done: false }),
      );
    const user = userEvent.setup();
    render(<DocumentChat setValue={setValue} onDocumentSelected={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "A mutual NDA");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Great, a Mutual NDA it is.");

    await user.type(screen.getByPlaceholderText("Type your answer..."), "Evaluating a deal");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("What's the effective date?")).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/documents/mnda/chat",
      expect.objectContaining({ method: "POST" }),
    );
    expect(setValue).toHaveBeenCalledWith("purpose", "Evaluating a deal");
  });

  it("shows the done banner without disabling input, and shows an error with retry on failure", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ reply: "Great, a Mutual NDA it is.", slug: "mnda" }))
      .mockResolvedValueOnce(jsonResponse({ reply: "All set!", fields: {}, done: true }));
    const user = userEvent.setup();
    render(<DocumentChat setValue={vi.fn()} onDocumentSelected={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "A mutual NDA");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Great, a Mutual NDA it is.");

    await user.type(screen.getByPlaceholderText("Type your answer..."), "Everything");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/your agreement is ready/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type your answer...")).toBeEnabled();

    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 502 }));
    await user.type(screen.getByPlaceholderText("Type your answer..."), "One more thing");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();

    vi.mocked(fetch).mockResolvedValue(jsonResponse({ reply: "Got it.", fields: {}, done: true }));
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Got it.")).toBeInTheDocument();
  });
});
