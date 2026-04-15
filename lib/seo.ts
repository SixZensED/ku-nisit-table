const DEFAULT_SITE_URL = "https://ku-nisit-table.vercel.app";

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawUrl) {
    return DEFAULT_SITE_URL;
  }

  return rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
}
