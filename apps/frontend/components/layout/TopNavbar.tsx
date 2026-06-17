type Props = {
  marketId: string;
};

export function TopNavbar({ marketId }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-8">
        <div>
          <p className="text-xs text-text-muted">Market</p>
          <h1 className="font-mono text-lg font-semibold">{marketId}</h1>
        </div>

        <div>
          <p className="text-xs text-text-muted">Last trade</p>
          <p className="font-mono text-sm text-bid">100,000.00</p>
        </div>

        <div>
          <p className="text-xs text-text-muted">Mark price</p>
          <p className="font-mono text-sm">100,120.25</p>
        </div>
      </div>

      <button className="rounded-md border border-border bg-surface-secondary px-4 py-2 text-sm hover:bg-surface-hover">
        Profile
      </button>
    </header>
  );
}
