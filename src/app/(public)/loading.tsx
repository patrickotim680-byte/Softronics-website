/** Skeleton shown while a public page streams in. Mirrors the page rhythm. */
export default function PublicLoading() {
  return (
    <div className="shell py-16 md:py-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-24 rounded bg-line" />
        <div className="h-10 w-3/4 rounded bg-line md:h-14 md:w-2/3" />
        <div className="h-4 w-full max-w-prose rounded bg-hairline" />
        <div className="h-4 w-4/5 max-w-prose rounded bg-hairline" />
        <div className="mt-12 space-y-4">
          <div className="h-24 rounded-lg bg-hairline" />
          <div className="h-24 rounded-lg bg-hairline" />
        </div>
      </div>
    </div>
  );
}
