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

export const csa: DocumentModule = {
  slug: "csa",
  catalogName: "Cloud Service Agreement",
  templateFile: "CSA.md",
  documentTitle: "Cloud Service Agreement",
  subtitle: "Common Paper Cloud Service Agreement Standard Terms Version 2.1",
  defaultValues: {
    effectiveDate: "",
    orderDate: "",
    subscriptionPeriod: "",
    nonRenewalNoticeDate: "",
    technicalSupport: "",
    paymentProcess: "",
    useLimitations: "None.",
    governingLaw: "",
    chosenCourts: "",
    generalCapAmount: "",
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
      ],
    },
    {
      title: "Order Form",
      fields: [
        { label: "Order Date", render: (v) => formatLongDate(v.orderDate) },
        { label: "Subscription Period", key: "subscriptionPeriod" },
        { label: "Non-Renewal Notice Date", key: "nonRenewalNoticeDate" },
        { label: "Technical Support", key: "technicalSupport" },
        { label: "Payment Process", key: "paymentProcess" },
        { label: "Use Limitations", key: "useLimitations" },
        { label: "Customer", key: "customer", party: true },
        { label: "Provider", key: "provider", party: true },
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
        },
        orderform_link: {
          "Order Date": formatLongDate(values.orderDate),
          "Subscription Period": textValue(values, "subscriptionPeriod", "[Subscription Period]"),
          "Subscription Periods": textValue(values, "subscriptionPeriod", "[Subscription Period]"),
          "Non-Renewal Notice Date": textValue(
            values,
            "nonRenewalNoticeDate",
            "[Non-Renewal Notice Date]",
          ),
          "Technical Support": textValue(values, "technicalSupport", "[Technical Support]"),
          "Payment Process": textValue(values, "paymentProcess", "[Payment Process]"),
          "Use Limitations": textValue(values, "useLimitations", "None."),
        },
      },
      { keyterms_link: standardLiabilityDefaults("Provider", "Customer") },
      { coverpage_link: roleAliases("Customer", customer) },
      { coverpage_link: roleAliases("Provider", provider) },
    );
  },
};
