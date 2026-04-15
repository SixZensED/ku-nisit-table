export default function RootLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />

      <section className="skeleton-shimmer w-full max-w-lg rounded-3xl border border-[#4fbf42]/30 bg-white/95 p-7 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="skeleton-item mx-auto h-12 w-12 rounded-full bg-[#4fbf42]/20" />
        <div className="skeleton-item mx-auto mt-5 h-8 w-44 rounded-lg bg-[#4fbf42]/20" />
        <div className="skeleton-item mx-auto mt-3 h-4 w-64 rounded-md bg-[#4fbf42]/15" />
      </section>
    </main>
  );
}
