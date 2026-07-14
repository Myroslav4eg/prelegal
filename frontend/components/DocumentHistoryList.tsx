import type { DocumentSummary } from "@/lib/documentHistory";

function formatDate(iso: string): string {
  return new Date(iso.replace(" ", "T") + "Z").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentHistoryList({
  entries,
  selectedId,
  onSelect,
}: {
  entries: DocumentSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            onClick={() => onSelect(entry.id)}
            className={`flex w-full flex-col gap-0.5 rounded-md border px-4 py-3 text-left text-sm transition-colors ${
              entry.id === selectedId
                ? "border-blue-primary bg-blue-primary/10"
                : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            }`}
          >
            <span className="font-medium text-dark-navy dark:text-foreground">{entry.documentTitle}</span>
            <span className="text-xs text-foreground/60">{formatDate(entry.createdAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
