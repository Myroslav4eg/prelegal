import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { defaultMndaValues, type MndaFormValues } from "@/lib/mnda";
import MndaDocument from "./MndaDocument";

const rawStandardTerms =
  'Confidential Information is disclosed for the <span class="coverpage_link">Purpose</span> ' +
  'and governed by the laws of <span class="coverpage_link">Governing Law</span>.';

function makeValues(overrides: Partial<MndaFormValues> = {}): MndaFormValues {
  return {
    ...defaultMndaValues,
    party1: { ...defaultMndaValues.party1 },
    party2: { ...defaultMndaValues.party2 },
    ...overrides,
  };
}

describe("MndaDocument", () => {
  it("renders the cover-page values entered by the user", () => {
    const values = makeValues({
      purpose: "Evaluating a joint venture",
      effectiveDate: "2026-03-01",
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
      modifications: "Section 4 waived.",
    });

    render(<MndaDocument values={values} rawStandardTerms={rawStandardTerms} />);

    const coverPage = within(screen.getByText("Cover Page", { selector: "h2" }).closest("section")!);
    expect(coverPage.getByText("Evaluating a joint venture")).toBeInTheDocument();
    expect(coverPage.getByText("March 1, 2026")).toBeInTheDocument();
    expect(coverPage.getByText("Governing Law: Delaware")).toBeInTheDocument();
    expect(coverPage.getByText("Jurisdiction: New Castle, DE")).toBeInTheDocument();
    expect(coverPage.getByText("Section 4 waived.")).toBeInTheDocument();
  });

  it("shows an em dash for blank party fields instead of leaving them empty", () => {
    render(<MndaDocument values={makeValues()} rawStandardTerms={rawStandardTerms} />);

    const dashes = screen.getAllByText("—");
    // Governing Law, Jurisdiction, and 4 fields each for Party 1 and Party 2.
    expect(dashes.length).toBeGreaterThanOrEqual(8);
  });

  it("renders party details when provided", () => {
    const values = makeValues({
      party1: { name: "Jane Doe", title: "CEO", company: "Acme Inc.", noticeAddress: "jane@acme.com" },
    });

    render(<MndaDocument values={values} rawStandardTerms={rawStandardTerms} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("CEO")).toBeInTheDocument();
    expect(screen.getByText("Acme Inc.")).toBeInTheDocument();
    expect(screen.getByText("jane@acme.com")).toBeInTheDocument();
  });

  it("substitutes coverpage_link placeholders inline in the Standard Terms markdown", () => {
    const values = makeValues({ purpose: "Evaluating a joint venture", governingLaw: "Delaware" });

    render(<MndaDocument values={values} rawStandardTerms={rawStandardTerms} />);

    const standardTermsSection = screen.getByText("Standard Terms", { selector: "h2" }).closest("section");
    expect(standardTermsSection).not.toBeNull();
    expect(standardTermsSection).toHaveTextContent(
      "Confidential Information is disclosed for the Evaluating a joint venture and governed by the laws of Delaware.",
    );
    expect(standardTermsSection?.innerHTML).not.toContain("coverpage_link");
  });
});
