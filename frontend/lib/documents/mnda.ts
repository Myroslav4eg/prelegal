import type { DocumentModule, DocumentValues } from "./types";
import { blankParty, formatLongDate, mergeSubstitutions, textValue } from "./common";

function safeYears(years: unknown): number {
  const n = typeof years === "number" ? years : Number(years);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function isExpires(values: DocumentValues): boolean {
  return values.mndaTermOption !== "until_terminated";
}

function isConfidentialityYears(values: DocumentValues): boolean {
  return values.confidentialityTermOption !== "perpetuity";
}

function mndaTermSummary(values: DocumentValues): string {
  return isExpires(values)
    ? `Expires ${safeYears(values.mndaTermYears)} year(s) from the Effective Date.`
    : "Continues until terminated in accordance with the terms of the MNDA.";
}

function mndaTermPhrase(values: DocumentValues): string {
  return isExpires(values)
    ? `${safeYears(values.mndaTermYears)}-year period following the Effective Date`
    : "period ending upon termination of this MNDA in accordance with its terms";
}

function confidentialityTermSummary(values: DocumentValues): string {
  return isConfidentialityYears(values)
    ? `${safeYears(values.confidentialityTermYears)} year(s) from the Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
    : "In perpetuity.";
}

function confidentialityTermPhrase(values: DocumentValues): string {
  return isConfidentialityYears(values)
    ? `${safeYears(values.confidentialityTermYears)}-year period following the Effective Date (except trade secrets, which remain protected for as long as they qualify as a trade secret under applicable law)`
    : "an indefinite period, in perpetuity";
}

export const mnda: DocumentModule = {
  slug: "mnda",
  catalogName: "Mutual Non-Disclosure Agreement",
  templateFile: "Mutual-NDA.md",
  documentTitle: "Mutual Non-Disclosure Agreement",
  subtitle: "Cover Page and Common Paper Mutual NDA Standard Terms Version 1.0",
  defaultValues: {
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
  },
  groups: [
    {
      title: "Cover Page",
      fields: [
        { label: "Purpose", key: "purpose" },
        { label: "Effective Date", render: (v) => formatLongDate(v.effectiveDate) },
        { label: "MNDA Term", render: mndaTermSummary },
        { label: "Term of Confidentiality", render: confidentialityTermSummary },
        { label: "Governing Law", key: "governingLaw" },
        { label: "Jurisdiction", key: "jurisdiction" },
        { label: "MNDA Modifications", key: "modifications" },
        { label: "Party 1", key: "party1", party: true },
        { label: "Party 2", key: "party2", party: true },
      ],
    },
  ],
  buildSubstitutions: (values) =>
    mergeSubstitutions({
      coverpage_link: {
        Purpose: textValue(values, "purpose", "the Purpose stated on the Cover Page"),
        "Effective Date": formatLongDate(values.effectiveDate),
        "MNDA Term": mndaTermPhrase(values),
        "Term of Confidentiality": confidentialityTermPhrase(values),
        "Governing Law": textValue(values, "governingLaw", "[Governing Law]"),
        Jurisdiction: textValue(values, "jurisdiction", "[Jurisdiction]"),
      },
    }),
};
