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

export const psa: DocumentModule = {
  slug: "psa",
  catalogName: "Professional Services Agreement",
  templateFile: "psa.md",
  documentTitle: "Professional Services Agreement",
  subtitle: "Common Paper PSA Standard Terms",
  defaultValues: {
    effectiveDate: "",
    governingLaw: "",
    chosenCourts: "",
    generalCapAmount: "",
    deliverables: "None.",
    rejectionPeriod: "",
    resubmissionPeriod: "",
    timeOfAssignment: "",
    fees: "",
    paymentPeriod: "",
    sowTerm: "",
    customerObligations: "None.",
    customer: { ...blankParty },
    provider: { ...blankParty },
  },
  groups: [
    {
      title: "Key Terms",
      fields: [
        { label: "Effective Date", render: (v) => formatLongDate(v.effectiveDate) },
        { label: "Governing Law", key: "governingLaw" },
        { label: "Chosen Courts", key: "chosenCourts" },
        { label: "General Cap Amount", key: "generalCapAmount" },
        { label: "SOW Term", key: "sowTerm" },
        { label: "Customer", key: "customer", party: true },
        { label: "Provider", key: "provider", party: true },
      ],
    },
    {
      title: "Statement of Work",
      fields: [
        { label: "Deliverables", key: "deliverables" },
        { label: "Rejection Period", key: "rejectionPeriod" },
        { label: "Resubmission Period", key: "resubmissionPeriod" },
        { label: "Time of Assignment", key: "timeOfAssignment" },
        { label: "Fees", key: "fees" },
        { label: "Payment Period", key: "paymentPeriod" },
        { label: "Customer Obligations", key: "customerObligations" },
      ],
    },
  ],
  buildSubstitutions: (values) => {
    const customer = getParty(values, "customer");
    const provider = getParty(values, "provider");
    return mergeSubstitutions(
      {
        keyterms_link: {
          "Effective Date": formatLongDate(values.effectiveDate),
          "Governing Law": textValue(values, "governingLaw", "[Governing Law]"),
          "Chosen Courts": textValue(values, "chosenCourts", "[Chosen Courts]"),
          "General Cap Amount": textValue(values, "generalCapAmount", "[General Cap Amount]"),
          "SOW Term": textValue(values, "sowTerm", "[SOW Term]"),
        },
        sow_link: {
          Deliverables: textValue(values, "deliverables", "None."),
          Deliverable: textValue(values, "deliverables", "None."),
          "Rejection Period": textValue(values, "rejectionPeriod", "[Rejection Period]"),
          "Resubmission Period": textValue(values, "resubmissionPeriod", "[Resubmission Period]"),
          "Time of Assignment": textValue(values, "timeOfAssignment", "[Time of Assignment]"),
          Fees: textValue(values, "fees", "[Fees]"),
          "Payment Period": textValue(values, "paymentPeriod", "[Payment Period]"),
          "Customer Obligations": textValue(values, "customerObligations", "None."),
        },
      },
      { keyterms_link: standardLiabilityDefaults("Provider", "Customer") },
      {
        keyterms_link: {
          "Customer Policies": "None.",
          "Security Policy": "Provider's standard security policy",
          "Insurance Minimums": "None.",
        },
      },
      { keyterms_link: roleAliases("Customer", customer) },
      { keyterms_link: roleAliases("Provider", provider) },
    );
  },
};
