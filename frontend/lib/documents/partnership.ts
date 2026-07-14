import type { DocumentModule } from "./types";
import {
  blankParty,
  formatLongDate,
  getParty,
  mergeSubstitutions,
  roleAliases,
  standardLiabilityDefaults,
  textValue,
} from "./common";

export const partnership: DocumentModule = {
  slug: "partnership-agreement",
  catalogName: "Partnership Agreement",
  templateFile: "Partnership-Agreement.md",
  documentTitle: "Partnership Agreement",
  subtitle: "Common Paper Partnership Agreement Standard Terms Version 1.0",
  defaultValues: {
    effectiveDate: "",
    endDate: "",
    governingLaw: "",
    chosenCourts: "",
    obligations: "",
    paymentProcess: "None.",
    paymentSchedule: "None.",
    territory: "",
    generalCapAmount: "",
    company: { ...blankParty },
    partner: { ...blankParty },
  },
  groups: [
    {
      title: "Cover Page",
      fields: [
        { label: "Effective Date", render: (v) => formatLongDate(v.effectiveDate) },
        { label: "End Date", render: (v) => formatLongDate(v.endDate) },
        { label: "Governing Law", key: "governingLaw" },
        { label: "Chosen Courts", key: "chosenCourts" },
        { label: "Obligations", key: "obligations" },
        { label: "Payment Process", key: "paymentProcess" },
        { label: "Payment Schedule", key: "paymentSchedule" },
        { label: "Territory", key: "territory" },
        { label: "General Cap Amount", key: "generalCapAmount" },
        { label: "Company", key: "company", party: true },
        { label: "Partner", key: "partner", party: true },
      ],
    },
  ],
  buildSubstitutions: (values) => {
    const company = getParty(values, "company");
    const partner = getParty(values, "partner");
    return mergeSubstitutions(
      {
        keyterms_link: {
          "Effective Date": formatLongDate(values.effectiveDate),
          "Governing Law": textValue(values, "governingLaw", "[Governing Law]"),
          "Chosen Courts": textValue(values, "chosenCourts", "[Chosen Courts]"),
          "General Cap Amount": textValue(values, "generalCapAmount", "[General Cap Amount]"),
        },
        businessterms_link: {
          Obligations: textValue(values, "obligations", "[Obligations]"),
          "Payment Process": textValue(values, "paymentProcess", "None."),
          "Payment Schedule": textValue(values, "paymentSchedule", "None."),
          Territory: textValue(values, "territory", "[Territory]"),
          "End Date": formatLongDate(values.endDate),
        },
      },
      { keyterms_link: standardLiabilityDefaults("Company", "Partner") },
      { keyterms_link: { "Brand Guidelines": "Company's standard brand guidelines" } },
      { keyterms_link: roleAliases("Company", company) },
      { keyterms_link: roleAliases("Partner", partner) },
    );
  },
};
