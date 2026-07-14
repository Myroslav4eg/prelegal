import type { DocumentModule } from "./types";
import { blankParty, formatLongDate, getParty, mergeSubstitutions, roleAliases, textValue } from "./common";

export const pilot: DocumentModule = {
  slug: "pilot-agreement",
  catalogName: "Pilot Agreement",
  templateFile: "Pilot-Agreement.md",
  documentTitle: "Pilot Agreement",
  subtitle: "Common Paper Pilot Agreement Standard Terms Version 1.1",
  defaultValues: {
    pilotPeriod: "",
    effectiveDate: "",
    generalCapAmount: "",
    governingLaw: "",
    chosenCourts: "",
    noticeAddress: "",
    customer: { ...blankParty },
    provider: { ...blankParty },
  },
  groups: [
    {
      title: "Order Form",
      fields: [
        { label: "Pilot Period", key: "pilotPeriod" },
        { label: "Effective Date", render: (v) => formatLongDate(v.effectiveDate) },
        { label: "General Cap Amount", key: "generalCapAmount" },
        { label: "Governing Law", key: "governingLaw" },
        { label: "Chosen Courts", key: "chosenCourts" },
        { label: "Notice Address", key: "noticeAddress" },
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
        orderform_link: {
          "Pilot Period": textValue(values, "pilotPeriod", "[Pilot Period]"),
          "Effective Date": formatLongDate(values.effectiveDate),
          "General Cap Amount": textValue(values, "generalCapAmount", "[General Cap Amount]"),
          "Governing Law": textValue(values, "governingLaw", "[Governing Law]"),
          "Chosen Courts": textValue(values, "chosenCourts", "[Chosen Courts]"),
          "Notice Address": textValue(values, "noticeAddress", "[Notice Address]"),
        },
      },
      { orderform_link: roleAliases("Customer", customer) },
      { orderform_link: roleAliases("Provider", provider) },
    );
  },
};
