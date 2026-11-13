export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="h-16 animate-pulse rounded-xl bg-secondary" />
      <div className="
        grid grid-cols-1 gap-6
        @xl:grid-cols-2
      "
      >
        <div className="h-64 animate-pulse rounded-xl bg-secondary" />
        <div className="h-64 animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  );
}
