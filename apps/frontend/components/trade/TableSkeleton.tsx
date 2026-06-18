import { Skeleton } from "@/components/ui/Skeleton";

export function TableSkeleton({
  rows = 4,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
