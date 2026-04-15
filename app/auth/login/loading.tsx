export default function LoginLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />

      <section className="skeleton-shimmer w-full max-w-lg rounded-3xl border border-[#4fbf42]/40 bg-white/98 p-7 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="mb-6 space-y-3">
          <div className="skeleton-item h-8 w-56 rounded-lg bg-[#4fbf42]/20" />
          <div className="skeleton-item h-4 w-72 rounded-md bg-[#4fbf42]/15" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="skeleton-item h-4 w-32 rounded-md bg-[#4fbf42]/20" />
            <div className="skeleton-item h-12 w-full rounded-xl bg-[#4fbf42]/12" />
          </div>

          <div className="space-y-2">
            <div className="skeleton-item h-4 w-24 rounded-md bg-[#4fbf42]/20" />
            <div className="skeleton-item h-12 w-full rounded-xl bg-[#4fbf42]/12" />
          </div>

          <div className="skeleton-item h-14 w-full rounded-full bg-[#2f9e33]/35" />
        </div>

        <div className="mt-6 rounded-xl bg-gradient-to-r from-[#2f9e33]/65 to-[#1f7d27]/65 px-4 py-3">
          <div className="skeleton-item h-4 w-56 rounded-md bg-white/35" />
          <div className="skeleton-item mt-2 h-3 w-full rounded-md bg-white/30" />
          <div className="skeleton-item mt-2 h-3 w-11/12 rounded-md bg-white/30" />
        </div>
      </section>
    </main>
  );
}
