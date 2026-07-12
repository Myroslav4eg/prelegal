import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MndaApp from "./MndaApp";

const rawStandardTerms =
  'Confidential Information is disclosed for the <span class="coverpage_link">Purpose</span>.';

describe("MndaApp", () => {
  it("reflects form input in the live preview", async () => {
    const user = userEvent.setup();
    render(<MndaApp rawStandardTerms={rawStandardTerms} />);

    const [purposeTextarea] = screen.getAllByRole("textbox");
    await user.clear(purposeTextarea);
    await user.type(purposeTextarea, "Evaluating a joint venture");

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

  it("never renders NaN when the MNDA Term years field is cleared mid-edit", async () => {
    const user = userEvent.setup();
    render(<MndaApp rawStandardTerms={rawStandardTerms} />);

    const [mndaYearsInput] = screen.getAllByRole("spinbutton");
    await user.clear(mndaYearsInput);

    const coverPage = within(screen.getByText("Cover Page", { selector: "h2" }).closest("section")!);
    await waitFor(() => expect(coverPage.getByText(/Expires \d+ year\(s\)/)).toBeInTheDocument());
    expect(coverPage.queryByText(/NaN/)).not.toBeInTheDocument();

    await user.type(mndaYearsInput, "5");
    await waitFor(() => expect(coverPage.getByText("Expires 5 year(s) from the Effective Date.")).toBeInTheDocument());
  });

  it("keeps party names entered in the form out of each other's fields", async () => {
    const user = userEvent.setup();
    render(<MndaApp rawStandardTerms={rawStandardTerms} />);

    const printNameInputs = screen.getAllByLabelText("Print Name");
    await user.type(printNameInputs[0], "Jane Doe");
    await user.type(printNameInputs[1], "John Smith");

    const coverPage = within(screen.getByText("Cover Page", { selector: "h2" }).closest("section")!);
    expect(await coverPage.findByText("Jane Doe")).toBeInTheDocument();
    expect(await coverPage.findByText("John Smith")).toBeInTheDocument();
  });
});
