import type { DocumentModule } from "./types";
import { blankParty, mergeSubstitutions, roleAliases, textValue } from "./common";

const PARENT_PLACEHOLDER = "[see the primary product agreement]";

export const aiAddendum: DocumentModule = {
  slug: "ai-addendum",
  catalogName: "AI Addendum",
  templateFile: "AI-Addendum.md",
  documentTitle: "AI Addendum",
  subtitle: "Common Paper AI Addendum Standard Terms Version 1.0",
  defaultValues: {
    trainingData: "None.",
    trainingPurposes: "None.",
    trainingRestrictions: "None.",
    improvementRestrictions: "None.",
  },
  groups: [
    {
      title: "Cover Page",
      fields: [
        { label: "Training Data", key: "trainingData" },
        { label: "Training Purposes", key: "trainingPurposes" },
        { label: "Training Restrictions", key: "trainingRestrictions" },
        { label: "Improvement Restrictions", key: "improvementRestrictions" },
      ],
    },
  ],
  buildSubstitutions: (values) =>
    mergeSubstitutions(
      { coverpage_link: roleAliases("Customer", blankParty, PARENT_PLACEHOLDER) },
      { coverpage_link: roleAliases("Provider", blankParty, PARENT_PLACEHOLDER) },
      {
        coverpage_link: {
          "Training Data": textValue(values, "trainingData", "None."),
          "Training Purposes": textValue(values, "trainingPurposes", "None."),
          "Training Restrictions": textValue(values, "trainingRestrictions", "None."),
          "Improvement Restrictions": textValue(values, "improvementRestrictions", "None."),
        },
      },
    ),
};
