export default function ScheduleLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-2 py-3 sm:px-4 lg:px-6">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />

      <div className="skeleton-shimmer mx-auto w-full max-w-[1600px]">
        <div className="skeleton-item mb-4 h-11 w-44 rounded-full bg-[#2f9e33]/35" />

        <section className="overflow-hidden rounded-xl border border-[#4fbf42]/35 bg-white/95 p-3 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="grid grid-cols-[96px_repeat(12,minmax(0,1fr))] gap-1">
            <div className="skeleton-item col-span-1 h-9 rounded-md bg-[#1f7d27]/65" />
            <div className="skeleton-item col-span-12 h-9 rounded-md bg-[#4fbf42]/20" />
          </div>

          <div className="mt-2 space-y-1">
            {Array.from({ length: 7 }).map((_, row) => (
              <div key={row} className="grid grid-cols-[96px_repeat(12,minmax(0,1fr))] gap-1">
                <div className="skeleton-item col-span-1 h-24 rounded-md bg-[#4fbf42]/25" />
                <div className="skeleton-item col-span-12 h-24 rounded-md bg-[#4fbf42]/12" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
