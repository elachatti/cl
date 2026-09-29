export default function EventCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="aspect-[16/9] w-full bg-ink-100 dark:bg-ink-800" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/2 rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-5 w-4/5 rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-3 w-1/3 rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-3 w-full rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-3 w-2/3 rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-10 w-full rounded-lg bg-ink-100 dark:bg-ink-800" />
      </div>
    </div>
  );
}
