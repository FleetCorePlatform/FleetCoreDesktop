export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Monitor fleet activity and system status
        </p>
      </div>
    </div>
  );
}
