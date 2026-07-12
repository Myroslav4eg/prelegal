export type MndaTermOption = "expires" | "until_terminated";
export type ConfidentialityTermOption = "years" | "perpetuity";

export interface PartyDetails {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export interface MndaFormValues {
  purpose: string;
  effectiveDate: string;
  mndaTermOption: MndaTermOption;
  mndaTermYears: number;
  confidentialityTermOption: ConfidentialityTermOption;
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyDetails;
  party2: PartyDetails;
}

const blankParty: PartyDetails = {
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
};

export const defaultMndaValues: MndaFormValues = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermOption: "expires",
  mndaTermYears: 1,
  confidentialityTermOption: "years",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "None.",
  party1: { ...blankParty },
  party2: { ...blankParty },
};

export function formatLongDate(dateStr: string): string {
  if (!dateStr) return "[Today’s date]";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "[Today’s date]";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The years inputs use `valueAsNumber`, which is `NaN` while the field is
 * empty (e.g. the user briefly clears it to type a new value). Falling back
 * to 1 avoids leaking a literal "NaN" into the rendered agreement.
 */
function safeYears(years: number): number {
  return Number.isFinite(years) && years > 0 ? years : 1;
}

export function mndaTermSummary(values: MndaFormValues): string {
  return values.mndaTermOption === "expires"
    ? `Expires ${safeYears(values.mndaTermYears)} year(s) from the Effective Date.`
    : "Continues until terminated in accordance with the terms of the MNDA.";
}

export function mndaTermPhrase(values: MndaFormValues): string {
  return values.mndaTermOption === "expires"
    ? `${safeYears(values.mndaTermYears)}-year period following the Effective Date`
    : "period ending upon termination of this MNDA in accordance with its terms";
}

export function confidentialityTermSummary(values: MndaFormValues): string {
  return values.confidentialityTermOption === "years"
    ? `${safeYears(values.confidentialityTermYears)} year(s) from the Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
    : "In perpetuity.";
}

export function confidentialityTermPhrase(values: MndaFormValues): string {
  return values.confidentialityTermOption === "years"
    ? `${safeYears(values.confidentialityTermYears)}-year period following the Effective Date (except trade secrets, which remain protected for as long as they qualify as a trade secret under applicable law)`
    : "an indefinite period, in perpetuity";
}

const COVERPAGE_LINK_RE = /<span class="coverpage_link">([^<]+)<\/span>/g;

/**
 * The Standard Terms markdown references cover-page fields via
 * `<span class="coverpage_link">Label</span>` placeholders. Replace each with
 * the actual value the user entered so the agreement reads as a filled-in
 * document rather than a blank form of cross-references.
 */
export function fillStandardTerms(raw: string, values: MndaFormValues): string {
  const substitutions: Record<string, string> = {
    Purpose: values.purpose.trim() || "the Purpose stated on the Cover Page",
    "Effective Date": formatLongDate(values.effectiveDate),
    "MNDA Term": mndaTermPhrase(values),
    "Term of Confidentiality": confidentialityTermPhrase(values),
    "Governing Law": values.governingLaw.trim() || "[Governing Law]",
    Jurisdiction: values.jurisdiction.trim() || "[Jurisdiction]",
  };

  return raw.replace(COVERPAGE_LINK_RE, (match, label: string) => {
    const value = substitutions[label.trim()];
    return value ? `**${value}**` : match;
  });
}
