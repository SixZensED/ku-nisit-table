import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getSiteUrl } from "../lib/seo";
import { ConsoleWarning } from "@/components/ui/console-warning";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KU Nisit Table",
    template: "%s | KU Nisit Table",
  },
  description: "ตารางเรียนสำหรับนิสิตที่ดึงข้อมูลตรงจากระบบของมหาวิทยาลัย",
  applicationName: "KU Nisit Table",
  keywords: [
    "KU Nisit Table",
    "Kasetsart University schedule",
    "KU timetable",
    "ตารางเรียน มก",
    "ตารางเรียนเกษตร",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/image/kunisittable.png", type: "image/png" },
      { url: "/image/kunisittable.png", sizes: "192x192", type: "image/png" },
      { url: "/image/kunisittable.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/image/kunisittable.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/image/kunisittable.png"],
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "/",
    siteName: "KU Nisit Table",
    title: "KU Nisit Table",
    description: "ตารางเรียนสำหรับนิสิตที่ดึงข้อมูลตรงจากระบบของมหาวิทยาลัย",
    images: [
      {
        url: "/image/kunisittable.png",
        width: 1200,
        height: 630,
        alt: "KU Nisit Table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KU Nisit Table",
    description: "ตารางเรียนสำหรับนิสิตที่ดึงข้อมูลตรงจากระบบของมหาวิทยาลัย",
    images: ["/image/kunisittable.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KU Nisit Table",
    url: siteUrl,
    inLanguage: "th",
    description: "ตารางเรียนสำหรับนิสิตที่ดึงข้อมูลตรงจากระบบของมหาวิทยาลัย",
    publisher: {
      "@type": "Organization",
      name: "KU Nisit Table",
      url: siteUrl,
    },
  };

  return (
    <html lang="th" className="h-full antialiased">
      <body className="line-seed-font min-h-full flex flex-col">
        <ConsoleWarning />
        <Script
          id="website-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        {children}
      </body>
    </html>
  );
}
