const LINE_WIDTHS = ["w-3/4", "w-full", "w-5/6", "w-2/3", "w-full", "w-1/2"];

/** A blurred mock document, shown before the user has picked a document type. */
export default function DocumentPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-1 flex-col gap-8 rounded-lg border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex flex-col gap-2 border-b border-black/10 pb-4 blur-[3px] dark:border-white/10">
        <div className="h-6 w-2/3 rounded bg-black/20 dark:bg-white/20" />
        <div className="h-3 w-1/3 rounded bg-black/10 dark:bg-white/10" />
      </div>

      <div className="flex flex-col gap-3 blur-[3px]">
        <div className="mb-2 h-4 w-1/4 rounded bg-black/15 dark:bg-white/15" />
        {LINE_WIDTHS.map((width, index) => (
          <div key={index} className={`h-3 ${width} rounded bg-black/10 dark:bg-white/10`} />
        ))}
      </div>

      <div className="flex flex-col gap-3 blur-[3px]">
        <div className="mb-2 h-4 w-1/3 rounded bg-black/15 dark:bg-white/15" />
        {LINE_WIDTHS.map((width, index) => (
          <div key={index} className={`h-3 ${width} rounded bg-black/10 dark:bg-white/10`} />
        ))}
      </div>
    </div>
  );
}
