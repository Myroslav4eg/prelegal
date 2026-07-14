import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "./SignupForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("SignupForm", () => {
  beforeEach(() => {
    push.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("submits the entered credentials and navigates home on success", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 201 }));
    const user = userEvent.setup();

    render(<SignupForm />);
    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/signup",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "person@example.com", password: "password123" }),
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows a duplicate-email error and does not navigate on 409", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 409 }));
    const user = userEvent.setup();

    render(<SignupForm />);
    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a validation error for a short password without calling the backend", async () => {
    const user = userEvent.setup();

    render(<SignupForm />);
    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
