import type { DocumentModule } from "./types";
import { blankParty, mergeSubstitutions, roleAliases, textValue } from "./common";

const PARENT_PLACEHOLDER = "[see the primary Cloud Service Agreement]";

export const sla: DocumentModule = {
  slug: "sla",
  catalogName: "Service Level Agreement",
  templateFile: "sla.md",
  documentTitle: "Service Level Agreement",
  subtitle: "Common Paper Service Level Agreement Standard Terms Version 2.0",
  defaultValues: {
    targetUptime: "",
    targetResponseTime: "",
    supportChannel: "",
    uptimeCredit: "",
    responseTimeCredit: "",
    scheduledDowntime: "None.",
  },
  groups: [
    {
      title: "Order Form",
      fields: [
        { label: "Target Uptime", key: "targetUptime" },
        { label: "Target Response Time", key: "targetResponseTime" },
        { label: "Support Channel", key: "supportChannel" },
        { label: "Uptime Credit", key: "uptimeCredit" },
        { label: "Response Time Credit", key: "responseTimeCredit" },
        { label: "Scheduled Downtime", key: "scheduledDowntime" },
      ],
    },
  ],
  buildSubstitutions: (values) =>
    mergeSubstitutions(
      { coverpage_link: roleAliases("Customer", blankParty, PARENT_PLACEHOLDER) },
      { coverpage_link: roleAliases("Provider", blankParty, PARENT_PLACEHOLDER) },
      {
        orderform_link: {
          "Target Uptime": textValue(values, "targetUptime", "[Target Uptime]"),
          "Target Response Time": textValue(values, "targetResponseTime", "[Target Response Time]"),
          "Support Channel": textValue(values, "supportChannel", "[Support Channel]"),
          "Uptime Credit": textValue(values, "uptimeCredit", "[Uptime Credit]"),
          "Response Time Credit": textValue(values, "responseTimeCredit", "[Response Time Credit]"),
          "Scheduled Downtime": textValue(values, "scheduledDowntime", "None."),
          "Subscription Period": PARENT_PLACEHOLDER,
        },
      },
    ),
};
