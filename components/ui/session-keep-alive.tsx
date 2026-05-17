'use client';

import { useEffect } from 'react';

// Refresh the session cookie every INTERVAL_MS while the user is on the page.
// This prevents the 1-hour cookie from expiring mid-session.
const INTERVAL_MS = 45 * 60 * 1000; // 45 minutes

async function refreshSession() {
  try {
    await fetch('/api/auth/logout?mode=refresh', { method: 'POST', cache: 'no-store' });
  } catch {
    // Silent fail — if it fails the page will just redirect to login on next navigation
  }
}

export function SessionKeepAlive() {
  useEffect(() => {
    // Refresh immediately on mount (extends cookie from the moment the page loads)
    refreshSession();

    const id = setInterval(refreshSession, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
