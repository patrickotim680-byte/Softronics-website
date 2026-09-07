export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-7 w-56 rounded bg-line" />
      <div className="h-4 w-80 rounded bg-hairline" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 rounded-lg bg-hairline" />
        <div className="h-24 rounded-lg bg-hairline" />
        <div className="h-24 rounded-lg bg-hairline" />
        <div className="h-24 rounded-lg bg-hairline" />
      </div>
      <div className="h-64 rounded-lg bg-hairline" />
    </div>
  );
}
