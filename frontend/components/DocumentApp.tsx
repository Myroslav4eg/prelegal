"use client";

import { useForm, useWatch } from "react-hook-form";
import type { DocumentValues } from "@/lib/documents/types";
import { REGISTRY } from "@/lib/documents/registry";
import DocumentChat from "@/components/DocumentChat";
import DocumentPreview from "@/components/DocumentPreview";
import DocumentPlaceholder from "@/components/DocumentPlaceholder";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function DocumentApp({ templates }: { templates: Record<string, string> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const { setValue, control, reset } = useForm<DocumentValues>({ defaultValues: {} });
  const values = useWatch({ control, defaultValue: {} }) as DocumentValues;

  function handleDocumentSelected(selectedSlug: string) {
    reset(REGISTRY[selectedSlug].defaultValues);
    setSlug(selectedSlug);
  }

  const module = slug ? REGISTRY[slug] : null;

  return (
    <>
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-background py-2 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-dark-navy dark:text-foreground">Legal Agreement Creator</h1>
          <p className="text-sm text-foreground/60">
            Chat with the AI to build any of our supported legal agreements, then download it as a PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {module && (
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md bg-purple-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Download PDF
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="document-scroll-pane grid grid-cols-1 gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        <section
          data-testid="agreement-chat-pane"
          className="flex flex-col gap-4 print:hidden lg:h-full lg:min-h-0"
        >
          <div>
            <h2 className="text-lg font-semibold text-dark-navy dark:text-foreground">Agreement details</h2>
            <p className="text-sm text-foreground/60">
              Chat with the AI to choose and fill in your agreement — the preview on the right updates as
              you answer.
            </p>
          </div>
          <DocumentChat setValue={setValue} onDocumentSelected={handleDocumentSelected} />
        </section>

        <section
          data-testid="agreement-preview-pane"
          className="document-scroll-pane flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pl-2"
        >
          <h2 className="text-lg font-semibold text-dark-navy dark:text-foreground print:hidden">Preview</h2>
          {module ? (
            <DocumentPreview module={module} values={values} rawStandardTerms={templates[module.slug]} />
          ) : (
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-sm text-foreground/60">
                Tell the AI what kind of document you need — the preview will appear here once it's chosen.
              </p>
              <DocumentPlaceholder />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
