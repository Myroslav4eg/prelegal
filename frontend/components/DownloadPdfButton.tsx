import { HeaderAction } from "@/components/AppShell";

export default function DownloadPdfButton() {
  return (
    <HeaderAction>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-purple-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Download PDF
      </button>
    </HeaderAction>
  );
}
