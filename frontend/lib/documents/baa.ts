import type { DocumentModule } from "./types";
import { blankParty, formatLongDate, getParty, mergeSubstitutions, roleAliases, textValue } from "./common";

export const baa: DocumentModule = {
  slug: "baa",
  catalogName: "Business Associate Agreement",
  templateFile: "BAA.md",
  documentTitle: "Business Associate Agreement",
  subtitle: "Common Paper BAA Standard Terms Version 1.0",
  defaultValues: {
    baaEffectiveDate: "",
    limitations: "None.",
    breachNotificationPeriod: "",
    provider: { ...blankParty },
    company: { ...blankParty },
  },
  groups: [
    {
      title: "Cover Page",
      fields: [
        { label: "BAA Effective Date", render: (v) => formatLongDate(v.baaEffectiveDate) },
        { label: "Limitations", key: "limitations" },
        { label: "Breach Notification Period", key: "breachNotificationPeriod" },
        { label: "Provider (Business Associate)", key: "provider", party: true },
        { label: "Company (Covered Entity)", key: "company", party: true },
      ],
    },
  ],
  buildSubstitutions: (values) => {
    const provider = getParty(values, "provider");
    const company = getParty(values, "company");
    return mergeSubstitutions(
      {
        keyterms_link: {
          "BAA Effective Date": formatLongDate(values.baaEffectiveDate),
          Limitations: textValue(values, "limitations", "None."),
          "Breach Notification Period": textValue(
            values,
            "breachNotificationPeriod",
            "[Breach Notification Period]",
          ),
          Agreement: "the primary product agreement",
        },
      },
      { keyterms_link: roleAliases("Provider", provider) },
      { keyterms_link: roleAliases("Company", company) },
    );
  },
};
