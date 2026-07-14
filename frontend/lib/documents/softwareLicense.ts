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

export const softwareLicense: DocumentModule = {
  slug: "software-license-agreement",
  catalogName: "Software License Agreement",
  templateFile: "Software-License-Agreement.md",
  documentTitle: "Software License Agreement",
  subtitle: "Common Paper Software License Standard Terms Version 1.1",
  defaultValues: {
    effectiveDate: "",
    orderDate: "",
    subscriptionPeriod: "",
    nonRenewalNoticeDate: "",
    permittedUses: "",
    paymentProcess: "",
    warrantyPeriod: "",
    licenseLimits: "None.",
    deletionProcedure: "",
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
        { label: "Permitted Uses", key: "permittedUses" },
        { label: "Payment Process", key: "paymentProcess" },
        { label: "Warranty Period", key: "warrantyPeriod" },
        { label: "License Limits", key: "licenseLimits" },
        { label: "Deletion Procedure", key: "deletionProcedure" },
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
          "Permitted Uses": textValue(values, "permittedUses", "[Permitted Uses]"),
          "Payment Process": textValue(values, "paymentProcess", "[Payment Process]"),
          "Warranty Period": textValue(values, "warrantyPeriod", "[Warranty Period]"),
          "License Limits": textValue(values, "licenseLimits", "None."),
          "Deletion Procedure": textValue(values, "deletionProcedure", "[Deletion Procedure]"),
        },
      },
      { keyterms_link: standardLiabilityDefaults("Provider", "Customer") },
      { coverpage_link: roleAliases("Customer", customer) },
      { coverpage_link: roleAliases("Provider", provider) },
    );
  },
};
