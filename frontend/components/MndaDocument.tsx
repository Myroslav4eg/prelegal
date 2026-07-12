import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  confidentialityTermSummary,
  fillStandardTerms,
  formatLongDate,
  mndaTermSummary,
  type MndaFormValues,
} from "@/lib/mnda";

const fieldLabelClasses = "text-xs uppercase tracking-wide text-black/60";

const PARTY_FIELDS: { key: keyof MndaFormValues["party1"]; label: string }[] = [
  { key: "name", label: "Print Name" },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "noticeAddress", label: "Notice Address" },
];

function PartyColumn({ party, label }: { party: MndaFormValues["party1"]; label: string }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="font-semibold">{label}</div>
      {PARTY_FIELDS.map((field) => (
        <div key={field.key}>
          <div className="text-xs text-foreground/60">{field.label}</div>
          <div>{party[field.key] || "—"}</div>
        </div>
      ))}
    </div>
  );
}

export default function MndaDocument({
  values,
  rawStandardTerms,
}: {
  values: MndaFormValues;
  rawStandardTerms: string;
}) {
  const standardTerms = fillStandardTerms(rawStandardTerms, values);

  return (
    <article className="mnda-document flex flex-col gap-8 rounded-lg border border-black/10 bg-white p-8 text-sm leading-6 text-black shadow-sm dark:border-white/10 dark:bg-white dark:text-black print:border-none print:p-0 print:shadow-none">
      <header className="flex flex-col gap-1 border-b border-black/10 pb-4">
        <h1 className="text-2xl font-bold">Mutual Non-Disclosure Agreement</h1>
        <p className="text-xs text-black/60">
          Cover Page and Common Paper Mutual NDA Standard Terms Version 1.0
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cover Page</h2>

        <div>
          <div className={fieldLabelClasses}>Purpose</div>
          <p>{values.purpose || "—"}</p>
        </div>

        <div>
          <div className={fieldLabelClasses}>Effective Date</div>
          <p>{formatLongDate(values.effectiveDate)}</p>
        </div>

        <div>
          <div className={fieldLabelClasses}>MNDA Term</div>
          <p>{mndaTermSummary(values)}</p>
        </div>

        <div>
          <div className={fieldLabelClasses}>Term of Confidentiality</div>
          <p>{confidentialityTermSummary(values)}</p>
        </div>

        <div>
          <div className={fieldLabelClasses}>Governing Law & Jurisdiction</div>
          <p>Governing Law: {values.governingLaw || "—"}</p>
          <p>Jurisdiction: {values.jurisdiction || "—"}</p>
        </div>

        <div>
          <div className={fieldLabelClasses}>MNDA Modifications</div>
          <p>{values.modifications || "None."}</p>
        </div>

        <p className="text-xs text-black/60">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>

        <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-4">
          <PartyColumn party={values.party1} label="Party 1" />
          <PartyColumn party={values.party2} label="Party 2" />
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-black/10 pt-6">
        <h2 className="text-lg font-semibold">Standard Terms</h2>
        <div className="standard-terms">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{standardTerms}</ReactMarkdown>
        </div>
      </section>
    </article>
  );
}
