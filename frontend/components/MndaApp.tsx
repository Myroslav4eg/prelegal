"use client";

import { useForm, useWatch } from "react-hook-form";
import { defaultMndaValues, type MndaFormValues } from "@/lib/mnda";
import MndaForm from "@/components/MndaForm";
import MndaDocument from "@/components/MndaDocument";

export default function MndaApp({ rawStandardTerms }: { rawStandardTerms: string }) {
  const { register, control } = useForm<MndaFormValues>({
    defaultValues: defaultMndaValues,
  });
  // useWatch's type is DeepPartial because RHF can't statically prove every
  // field is registered, but MndaForm registers all of them via `register`,
  // and defaultValues supplies every field up front, so the result is always
  // a complete MndaFormValues in practice.
  const values = useWatch({ control, defaultValue: defaultMndaValues }) as MndaFormValues;

  return (
    <div className="mnda-scroll-pane grid grid-cols-1 gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
      <section
        data-testid="agreement-form-pane"
        className="mnda-scroll-pane flex flex-col gap-4 print:hidden lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2"
      >
        <div>
          <h2 className="text-lg font-semibold">Agreement details</h2>
          <p className="text-sm text-foreground/60">
            Fill in the fields below — the preview on the right updates as you type.
          </p>
        </div>
        <MndaForm
          register={register}
          mndaTermOption={values.mndaTermOption}
          confidentialityTermOption={values.confidentialityTermOption}
        />
      </section>

      <section
        data-testid="agreement-preview-pane"
        className="mnda-scroll-pane flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pl-2"
      >
        <div className="flex items-center justify-between print:hidden">
          <h2 className="text-lg font-semibold">Preview</h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Download PDF
          </button>
        </div>
        <MndaDocument values={values} rawStandardTerms={rawStandardTerms} />
      </section>
    </div>
  );
}
