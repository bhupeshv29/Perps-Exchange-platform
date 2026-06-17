export function ChartPanel() {
  return (
    <section className="min-h-0 rounded-md border border-border bg-surface">
      <div className="flex h-10 items-center border-b border-border px-3">
        <p className="text-sm font-medium">Chart</p>
      </div>

      <div className="flex h-[calc(100%-40px)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-text-primary">Chart</p>
          <p className="mt-2 text-sm text-text-muted">
            Fake chart data for now
          </p>
        </div>
      </div>
    </section>
  );
}
