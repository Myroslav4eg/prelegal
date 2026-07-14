import type { DocumentModule } from "./types";
import { blankParty, formatLongDate, getParty, mergeSubstitutions, roleAliases, textValue } from "./common";

export const designPartner: DocumentModule = {
  slug: "design-partner-agreement",
  catalogName: "Design Partner Agreement",
  templateFile: "design-partner-agreement.md",
  documentTitle: "Design Partner Agreement",
  subtitle: "Common Paper Design Partner Agreement Standard Terms",
  defaultValues: {
    term: "",
    program: "",
    fees: "None.",
    effectiveDate: "",
    governingLaw: "",
    chosenCourts: "",
    noticeAddress: "",
    partner: { ...blankParty },
    provider: { ...blankParty },
  },
  groups: [
    {
      title: "Cover Page",
      fields: [
        { label: "Term", key: "term" },
        { label: "Program", key: "program" },
        { label: "Fees", key: "fees" },
        { label: "Effective Date", render: (v) => formatLongDate(v.effectiveDate) },
        { label: "Governing Law", key: "governingLaw" },
        { label: "Chosen Courts", key: "chosenCourts" },
        { label: "Notice Address", key: "noticeAddress" },
        { label: "Partner", key: "partner", party: true },
        { label: "Provider", key: "provider", party: true },
      ],
    },
  ],
  buildSubstitutions: (values) => {
    const partner = getParty(values, "partner");
    const provider = getParty(values, "provider");
    return mergeSubstitutions(
      {
        keyterms_link: {
          Term: textValue(values, "term", "[Term]"),
          Program: textValue(values, "program", "[Program]"),
          Fees: textValue(values, "fees", "None."),
          "Effective Date": formatLongDate(values.effectiveDate),
          "Governing Law": textValue(values, "governingLaw", "[Governing Law]"),
          "Chosen Courts": textValue(values, "chosenCourts", "[Chosen Courts]"),
          "Notice Address": textValue(values, "noticeAddress", "[Notice Address]"),
        },
      },
      { keyterms_link: roleAliases("Partner", partner) },
      { keyterms_link: roleAliases("Provider", provider) },
    );
  },
};
