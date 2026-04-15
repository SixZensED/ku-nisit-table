function parseDelay(value: string | undefined) {
  if (!value) {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.floor(numeric);
}

function getSkeletonDelayMs() {
  const fromEnv = parseDelay(process.env.SKELETON_DELAY_MS);
  if (fromEnv !== null) {
    return fromEnv;
  }

  return process.env.NODE_ENV === "development" ? 500 : 0;
}

export async function waitForSkeleton() {
  const delayMs = getSkeletonDelayMs();

  if (delayMs <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}
