export interface PartyDetails {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export const blankParty: PartyDetails = { name: "", title: "", company: "", noticeAddress: "" };

/** Loosely typed since each document has its own field shape (see architecture notes). */
export type DocumentValues = Record<string, unknown>;

export type FieldSpec =
  | { label: string; key: string; party?: false }
  | { label: string; key: string; party: true }
  | { label: string; render: (values: DocumentValues) => string };

export interface FieldGroup {
  title: string;
  fields: FieldSpec[];
}

/** spanClass -> label (exact span innerText) -> substitution value. */
export type Substitutions = Record<string, Record<string, string>>;

export interface DocumentModule {
  slug: string;
  catalogName: string;
  templateFile: string;
  documentTitle: string;
  subtitle: string;
  defaultValues: DocumentValues;
  groups: FieldGroup[];
  buildSubstitutions: (values: DocumentValues) => Substitutions;
}
