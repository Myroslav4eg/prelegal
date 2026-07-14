/** Pass `inverted` when placed on a fixed dark-navy background, regardless of the app theme. */
export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2 text-lg font-bold ${
        inverted ? "text-white" : "text-dark-navy dark:text-foreground"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-md text-sm ${
          inverted
            ? "bg-accent-yellow text-dark-navy"
            : "bg-dark-navy text-accent-yellow dark:bg-accent-yellow dark:text-dark-navy"
        }`}
      >
        P
      </span>
      Prelegal
    </span>
  );
}
