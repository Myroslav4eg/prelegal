import type { DocumentModule } from "./types";
import { blankParty, getParty, mergeSubstitutions, roleAliases, textValue } from "./common";

export const dpa: DocumentModule = {
  slug: "dpa",
  catalogName: "Data Processing Agreement",
  templateFile: "DPA.md",
  documentTitle: "Data Processing Agreement",
  subtitle: "Common Paper DPA Standard Terms",
  defaultValues: {
    categoriesOfPersonalData: "",
    categoriesOfDataSubjects: "",
    approvedSubprocessors: "None.",
    governingMemberState: "",
    providerSecurityContact: "",
    customer: { ...blankParty },
    provider: { ...blankParty },
  },
  groups: [
    {
      title: "Cover Page",
      fields: [
        { label: "Categories of Personal Data", key: "categoriesOfPersonalData" },
        { label: "Categories of Data Subjects", key: "categoriesOfDataSubjects" },
        { label: "Approved Subprocessors", key: "approvedSubprocessors" },
        { label: "Governing Member State", key: "governingMemberState" },
        { label: "Provider Security Contact", key: "providerSecurityContact" },
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
          "Categories of Personal Data": textValue(
            values,
            "categoriesOfPersonalData",
            "[Categories of Personal Data]",
          ),
          "Categories of Data Subjects": textValue(
            values,
            "categoriesOfDataSubjects",
            "[Categories of Data Subjects]",
          ),
          "Approved Subprocessors": textValue(values, "approvedSubprocessors", "None."),
          "Governing Member State": textValue(
            values,
            "governingMemberState",
            "[Governing Member State]",
          ),
          "Provider Security Contact": textValue(
            values,
            "providerSecurityContact",
            "[Provider Security Contact]",
          ),
          Agreement: "the primary product agreement",
          "Special Category Data": "None.",
          "Special Category Data Restrictions or Safeguards": "None.",
          "Frequency of Transfer": "as needed to provide the Service",
          "Nature and Purpose of Processing": "as described in this DPA",
          "Duration of Processing": "for the duration of the Agreement",
          "Security Policy": "Provider's standard security policy",
        },
      },
      { keyterms_link: roleAliases("Customer", customer) },
      { keyterms_link: roleAliases("Provider", provider) },
    );
  },
};
