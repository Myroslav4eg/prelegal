import { REGISTRY } from "@/lib/documents/registry";
import type { DocumentDetail } from "@/lib/documentHistory";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import DocumentPreview from "@/components/DocumentPreview";

export default function DocumentHistoryDetail({
  detail,
  templates,
}: {
  detail: DocumentDetail;
  templates: Record<string, string>;
}) {
  const module = REGISTRY[detail.slug];
  if (!module) {
    return <p className="text-sm text-foreground/60">Unknown document type &quot;{detail.slug}&quot;.</p>;
  }

  const values = { ...module.defaultValues, ...detail.fields };

  return (
    <>
      <DownloadPdfButton />
      <DocumentPreview module={module} values={values} rawStandardTerms={templates[module.slug]} />
    </>
  );
}
