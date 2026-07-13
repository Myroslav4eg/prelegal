"use client";

import { useForm, useWatch } from "react-hook-form";
import { defaultMndaValues, type MndaFormValues } from "@/lib/mnda";
import MndaChat from "@/components/MndaChat";
import MndaDocument from "@/components/MndaDocument";

export default function MndaApp({ rawStandardTerms }: { rawStandardTerms: string }) {
  const { setValue, control } = useForm<MndaFormValues>({
    defaultValues: defaultMndaValues,
  });
  // useWatch's type is DeepPartial because RHF can't statically prove every
  // field is set, but MndaChat writes every field via `setValue` as the
  // conversation progresses, and defaultValues supplies every field up
  // front, so the result is always a complete MndaFormValues in practice.
  const values = useWatch({ control, defaultValue: defaultMndaValues }) as MndaFormValues;

  return (
    <div className="mnda-scroll-pane grid grid-cols-1 gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
      <section
        data-testid="agreement-chat-pane"
        className="mnda-scroll-pane flex flex-col gap-4 print:hidden lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2"
      >
        <div>
          <h2 className="text-lg font-semibold text-dark-navy dark:text-foreground">Agreement details</h2>
          <p className="text-sm text-foreground/60">
            Chat with the AI to fill in your agreement — the preview on the right updates as you answer.
          </p>
        </div>
        <MndaChat setValue={setValue} />
      </section>

      <section
        data-testid="agreement-preview-pane"
        className="mnda-scroll-pane flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pl-2"
      >
        <div className="flex items-center justify-between print:hidden">
          <h2 className="text-lg font-semibold text-dark-navy dark:text-foreground">Preview</h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-purple-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Download PDF
          </button>
        </div>
        <MndaDocument values={values} rawStandardTerms={rawStandardTerms} />
      </section>
    </div>
  );
}
