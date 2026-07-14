import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DocumentModule, FieldSpec } from "@/lib/documents/types";
import { getParty, getValue, substituteTemplate } from "@/lib/documents/common";
import type { DocumentValues } from "@/lib/documents/types";

const fieldLabelClasses = "text-xs uppercase tracking-wide text-black/60";

const PARTY_FIELDS: { key: "name" | "title" | "company" | "noticeAddress"; label: string }[] = [
  { key: "name", label: "Print Name" },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "noticeAddress", label: "Notice Address" },
];

function PartyColumn({ values, field }: { values: DocumentValues; field: FieldSpec & { key: string } }) {
  const party = getParty(values, field.key);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="font-semibold">{field.label}</div>
      {PARTY_FIELDS.map((partyField) => (
        <div key={partyField.key}>
          <div className="text-xs text-foreground/60">{partyField.label}</div>
          <div>{party[partyField.key] || "—"}</div>
        </div>
      ))}
    </div>
  );
}

function FieldRow({ values, field }: { values: DocumentValues; field: FieldSpec }) {
  const text =
    "render" in field ? field.render(values) : String(getValue(values, field.key) ?? "") || "—";
  return (
    <div>
      <div className={fieldLabelClasses}>{field.label}</div>
      <p>{text}</p>
    </div>
  );
}

export default function DocumentPreview({
  module,
  values,
  rawStandardTerms,
}: {
  module: DocumentModule;
  values: DocumentValues;
  rawStandardTerms: string;
}) {
  const substitutions = module.buildSubstitutions(values);
  const standardTerms = substituteTemplate(rawStandardTerms, substitutions);

  return (
    <article className="document-article flex flex-col gap-8 rounded-lg border border-black/10 bg-white p-8 text-sm leading-6 text-black shadow-sm dark:border-white/10 dark:bg-white dark:text-black print:border-none print:p-0 print:shadow-none">
      <header className="flex flex-col gap-1 border-b border-black/10 pb-4">
        <h1 className="text-2xl font-bold">{module.documentTitle}</h1>
        <p className="text-xs text-black/60">{module.subtitle}</p>
      </header>

      {module.groups.map((group) => {
        const partyFields = group.fields.filter((f): f is FieldSpec & { key: string; party: true } =>
          "party" in f ? f.party === true : false,
        );
        const plainFields = group.fields.filter((f) => !("party" in f && f.party));

        return (
          <section key={group.title} className="flex flex-col gap-4 border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            {plainFields.map((field) => (
              <FieldRow key={field.label} values={values} field={field} />
            ))}
            {partyFields.length > 0 && (
              <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-4">
                {partyFields.map((field) => (
                  <PartyColumn key={field.label} values={values} field={field} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section className="flex flex-col gap-4 border-t border-black/10 pt-6">
        <h2 className="text-lg font-semibold">Standard Terms</h2>
        <div className="standard-terms">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{standardTerms}</ReactMarkdown>
        </div>
      </section>
    </article>
  );
}
