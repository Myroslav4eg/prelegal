import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MndaChat from "./MndaChat";
import { INITIAL_ASSISTANT_MESSAGE, type MndaChatFieldsResponse } from "@/lib/mndaChat";

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

describe("MndaChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows the fixed opening question without calling the backend", () => {
    render(<MndaChat setValue={vi.fn()} />);

    expect(screen.getByText(INITIAL_ASSISTANT_MESSAGE)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the full message history and applies extracted fields on success", async () => {
    const setValue = vi.fn();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          reply: "When does it start?",
          fields: { ...emptyFields, purpose: "Evaluating a deal" },
          done: false,
        }),
        { status: 200 },
      ),
    );
    const user = userEvent.setup();
    render(<MndaChat setValue={setValue} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "Evaluating a deal");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("When does it start?")).toBeInTheDocument();
    expect(setValue).toHaveBeenCalledWith("purpose", "Evaluating a deal");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options!.body as string);
    expect(body.messages).toEqual([
      { role: "assistant", content: INITIAL_ASSISTANT_MESSAGE },
      { role: "user", content: "Evaluating a deal" },
    ]);
  });

  it("shows the done banner once the backend reports done, without disabling input", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ reply: "All set!", fields: emptyFields, done: true }), { status: 200 }),
    );
    const user = userEvent.setup();
    render(<MndaChat setValue={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "None.");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/your agreement is ready/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type your answer...")).toBeEnabled();
  });

  it("shows an error with a retry option on failure, keeping the user message", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 502 }));
    const user = userEvent.setup();
    render(<MndaChat setValue={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Type your answer..."), "Evaluating a deal");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText("Evaluating a deal")).toBeInTheDocument();

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ reply: "Got it.", fields: emptyFields, done: false }), { status: 200 }),
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Got it.")).toBeInTheDocument();
  });
});
