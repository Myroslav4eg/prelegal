import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentHistoryApp from "./DocumentHistoryApp";
import { HeaderActionsContext } from "./AppShell";

const templates = {
  mnda: 'Confidential Information is disclosed for the <span class="coverpage_link">Purpose</span>.',
  "pilot-agreement": "During the <span class=\"orderform_link\">Pilot Period</span>, access is granted.",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

const summaries = [
  { id: 2, slug: "pilot-agreement", documentTitle: "Pilot Agreement", createdAt: "2026-01-02 00:00:00" },
  { id: 1, slug: "mnda", documentTitle: "Mutual Non-Disclosure Agreement", createdAt: "2026-01-01 00:00:00" },
];

const details: Record<number, unknown> = {
  1: {
    id: 1,
    slug: "mnda",
    documentTitle: "Mutual Non-Disclosure Agreement",
    createdAt: "2026-01-01 00:00:00",
    updatedAt: "2026-01-01 00:00:00",
    fields: { purpose: "Evaluating a deal" },
  },
  2: {
    id: 2,
    slug: "pilot-agreement",
    documentTitle: "Pilot Agreement",
    createdAt: "2026-01-02 00:00:00",
    updatedAt: "2026-01-02 00:00:00",
    fields: {},
  },
};

function renderWithHeaderSlot(ui: React.ReactElement) {
  return render(<HeaderActionsContext.Provider value={null}>{ui}</HeaderActionsContext.Provider>);
}

describe("DocumentHistoryApp", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows an empty state when the user has no documents yet", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([]));
    renderWithHeaderSlot(<DocumentHistoryApp templates={templates} />);

    expect(await screen.findByText("No documents yet")).toBeInTheDocument();
  });

  it("lists documents newest first and shows the first one's detail by default", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === "/api/history") return Promise.resolve(jsonResponse(summaries));
      const id = Number(String(url).split("/").pop());
      return Promise.resolve(jsonResponse(details[id]));
    });
    renderWithHeaderSlot(<DocumentHistoryApp templates={templates} />);

    expect(await screen.findByRole("heading", { name: "Pilot Agreement" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pilot Agreement/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mutual Non-Disclosure Agreement/ })).toBeInTheDocument();
  });

  it("switches the detail view when a different entry is selected", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === "/api/history") return Promise.resolve(jsonResponse(summaries));
      const id = Number(String(url).split("/").pop());
      return Promise.resolve(jsonResponse(details[id]));
    });
    const user = userEvent.setup();
    renderWithHeaderSlot(<DocumentHistoryApp templates={templates} />);

    await screen.findByRole("heading", { name: "Pilot Agreement" });
    await user.click(screen.getByRole("button", { name: /Mutual Non-Disclosure Agreement/ }));

    expect(await screen.findByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeInTheDocument();
  });

  it("shows an error message when the history list fails to load", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    renderWithHeaderSlot(<DocumentHistoryApp templates={templates} />);

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
