import { Noto_Serif_Thai } from "next/font/google";
import Link from "next/link";

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

type PolicyLink = { href: string; label: string };

type PolicyLayoutProps = {
  title: string;
  lastUpdated: string;
  notice?: React.ReactNode;
  children: React.ReactNode;
  links: PolicyLink[];
};

export function PolicyLayout({ title, lastUpdated, notice, children, links }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-neutral-800">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-[#1f7d27]" />

      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-3xl items-center justify-end px-6 py-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
            </svg>
            กลับหน้าหลัก
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* Title block — Line Seed (สืบทอดจาก body) */}
        <div className="mb-10 border-b border-neutral-200 pb-8">
          <h1 className="mb-3 text-4xl font-bold leading-tight text-neutral-900">{title}</h1>
          <p className="text-sm text-neutral-400">{lastUpdated}</p>
        </div>

        {notice ? <div className={`mb-8 ${notoSerifThai.className}`} style={{ fontStretch: "semi-condensed" }}>{notice}</div> : null}

        {/* Body — Noto Serif Thai SemiCondensed */}
        <div className={`${notoSerifThai.className} space-y-10 text-[16px] leading-[1.9] text-neutral-700`} style={{ fontStretch: "semi-condensed" }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">© KU Nisit Table — โปรเจคอิสระ ไม่ใช่เว็บทางการของมหาวิทยาลัย</p>
          <div className="flex flex-wrap gap-5 text-xs text-neutral-400">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[#1f7d27]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
