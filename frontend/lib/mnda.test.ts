import { describe, expect, it } from "vitest";
import {
  confidentialityTermPhrase,
  confidentialityTermSummary,
  fillStandardTerms,
  formatLongDate,
  mndaTermPhrase,
  mndaTermSummary,
} from "./mnda";
import { makeValues } from "./mnda.testHelpers";

describe("formatLongDate", () => {
  it("returns a bracketed placeholder for an empty date", () => {
    expect(formatLongDate("")).toBe("[Today’s date]");
  });

  it("returns a bracketed placeholder for an invalid date", () => {
    expect(formatLongDate("not-a-date")).toBe("[Today’s date]");
  });

  it("formats a valid ISO date as a long-form date", () => {
    expect(formatLongDate("2026-07-13")).toBe("July 13, 2026");
  });
});

describe("mndaTermSummary", () => {
  it("describes an expiring term with the entered year count", () => {
    const values = makeValues({ mndaTermOption: "expires", mndaTermYears: 3 });
    expect(mndaTermSummary(values)).toBe("Expires 3 year(s) from the Effective Date.");
  });

  it("describes an until-terminated term", () => {
    const values = makeValues({ mndaTermOption: "until_terminated" });
    expect(mndaTermSummary(values)).toBe(
      "Continues until terminated in accordance with the terms of the MNDA.",
    );
  });

  it("falls back to 1 year instead of rendering NaN when the years field is cleared", () => {
    const values = makeValues({ mndaTermOption: "expires", mndaTermYears: NaN });
    expect(mndaTermSummary(values)).toBe("Expires 1 year(s) from the Effective Date.");
  });
});

describe("mndaTermPhrase", () => {
  it("renders an inline phrase for an expiring term", () => {
    const values = makeValues({ mndaTermOption: "expires", mndaTermYears: 2 });
    expect(mndaTermPhrase(values)).toBe("2-year period following the Effective Date");
  });

  it("renders an inline phrase for an until-terminated term", () => {
    const values = makeValues({ mndaTermOption: "until_terminated" });
    expect(mndaTermPhrase(values)).toBe(
      "period ending upon termination of this MNDA in accordance with its terms",
    );
  });

  it("falls back to 1 year instead of NaN when the years field is cleared", () => {
    const values = makeValues({ mndaTermOption: "expires", mndaTermYears: NaN });
    expect(mndaTermPhrase(values)).toBe("1-year period following the Effective Date");
  });
});

describe("confidentialityTermSummary", () => {
  it("describes a fixed-years term", () => {
    const values = makeValues({ confidentialityTermOption: "years", confidentialityTermYears: 5 });
    expect(confidentialityTermSummary(values)).toContain("5 year(s) from the Effective Date");
  });

  it("describes a perpetual term", () => {
    const values = makeValues({ confidentialityTermOption: "perpetuity" });
    expect(confidentialityTermSummary(values)).toBe("In perpetuity.");
  });

  it("falls back to 1 year instead of NaN when the years field is cleared", () => {
    const values = makeValues({ confidentialityTermOption: "years", confidentialityTermYears: NaN });
    expect(confidentialityTermSummary(values)).toContain("1 year(s) from the Effective Date");
  });
});

describe("confidentialityTermPhrase", () => {
  it("renders an inline phrase for a fixed-years term", () => {
    const values = makeValues({ confidentialityTermOption: "years", confidentialityTermYears: 4 });
    expect(confidentialityTermPhrase(values)).toBe(
      "4-year period following the Effective Date (except trade secrets, which remain protected for as long as they qualify as a trade secret under applicable law)",
    );
  });

  it("renders an inline phrase for a perpetual term", () => {
    const values = makeValues({ confidentialityTermOption: "perpetuity" });
    expect(confidentialityTermPhrase(values)).toBe("an indefinite period, in perpetuity");
  });

  it("falls back to 1 year instead of NaN when the years field is cleared", () => {
    const values = makeValues({ confidentialityTermOption: "years", confidentialityTermYears: NaN });
    expect(confidentialityTermPhrase(values)).toContain("1-year period following the Effective Date");
  });
});

describe("fillStandardTerms", () => {
  const raw =
    'Disclosed for the <span class="coverpage_link">Purpose</span> as of the ' +
    '<span class="coverpage_link">Effective Date</span>, governed by ' +
    '<span class="coverpage_link">Governing Law</span> and ' +
    '<span class="coverpage_link">Jurisdiction</span>, term ' +
    '<span class="coverpage_link">MNDA Term</span>, confidentiality ' +
    '<span class="coverpage_link">Term of Confidentiality</span>.';

  it("substitutes every coverpage_link placeholder with the entered value, bolded", () => {
    const values = makeValues({
      purpose: "Evaluating a joint venture",
      effectiveDate: "2026-01-15",
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
      mndaTermOption: "expires",
      mndaTermYears: 2,
      confidentialityTermOption: "years",
      confidentialityTermYears: 3,
    });

    const result = fillStandardTerms(raw, values);

    expect(result).toContain("**Evaluating a joint venture**");
    expect(result).toContain("**January 15, 2026**");
    expect(result).toContain("**Delaware**");
    expect(result).toContain("**New Castle, DE**");
    expect(result).toContain("**2-year period following the Effective Date**");
    expect(result).toContain(
      "**3-year period following the Effective Date (except trade secrets, which remain protected for as long as they qualify as a trade secret under applicable law)**",
    );
    expect(result).not.toContain("coverpage_link");
  });

  it("falls back to bracketed placeholders when governing law and jurisdiction are blank", () => {
    const values = makeValues({ governingLaw: "", jurisdiction: "  " });
    const result = fillStandardTerms(raw, values);
    expect(result).toContain("**[Governing Law]**");
    expect(result).toContain("**[Jurisdiction]**");
  });

  it("falls back to a generic Purpose phrase when purpose is blank", () => {
    const values = makeValues({ purpose: "   " });
    const result = fillStandardTerms(raw, values);
    expect(result).toContain("**the Purpose stated on the Cover Page**");
  });

  it("leaves unrelated markdown content untouched", () => {
    const values = makeValues();
    const withProse = `Intro text.\n\n${raw}\n\nMore prose with **existing bold** and a [link](https://example.com).`;
    const result = fillStandardTerms(withProse, values);
    expect(result).toContain("Intro text.");
    expect(result).toContain("**existing bold**");
    expect(result).toContain("[link](https://example.com)");
  });

  it("ignores coverpage_link labels it does not recognize", () => {
    const values = makeValues();
    const withUnknownLabel = 'See <span class="coverpage_link">Unknown Field</span> for details.';
    const result = fillStandardTerms(withUnknownLabel, values);
    expect(result).toBe(withUnknownLabel);
  });
});
