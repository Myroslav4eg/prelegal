import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AuthGate from "./AuthGate";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("AuthGate", () => {
  beforeEach(() => {
    replace.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders children once the session check succeeds", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

    render(
      <AuthGate>
        <p>Protected content</p>
      </AuthGate>,
    );

    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/auth/me", { credentials: "include" });
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /login and withholds children when the session check fails", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

    render(
      <AuthGate>
        <p>Protected content</p>
      </AuthGate>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to /login when the session check errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    render(
      <AuthGate>
        <p>Protected content</p>
      </AuthGate>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
