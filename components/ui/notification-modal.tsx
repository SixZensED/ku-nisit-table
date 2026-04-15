"use client";

type NotificationVariant = "success" | "error";

type NotificationModalProps = {
  open: boolean;
  variant: NotificationVariant;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
};

const VARIANT_STYLES = {
  success: {
    iconWrap: "bg-[#4fbf42]/25 text-[#1f7d27]",
    title: "text-[#14532d]",
    message: "text-[#14532d]/80",
    button:
      "bg-gradient-to-b from-[#4fbf42] via-[#2f9e33] to-[#1f7d27] hover:brightness-105",
    accent: "border-[#4fbf42]/40",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 fill-current">
        <path d="M9.55 16.7 5.3 12.45l-1.4 1.4 5.65 5.65L20.1 8.95l-1.4-1.4z" />
      </svg>
    ),
  },
  error: {
    iconWrap: "bg-rose-100 text-rose-700",
    title: "text-rose-900",
    message: "text-rose-900/80",
    button: "bg-rose-600 hover:bg-rose-700",
    accent: "border-rose-200",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 fill-current">
        <path d="M12 2a10 10 0 1 0 10 10A10.012 10.012 0 0 0 12 2Zm0 15a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 12 17Zm1-4.25h-2l-.25-7h2.5Z" />
      </svg>
    ),
  },
} as const;

export function NotificationModal({
  open,
  variant,
  title,
  message,
  actionLabel,
  onAction,
  actionDisabled = false,
}: NotificationModalProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-white/75 px-4 backdrop-blur-sm transition-all duration-200 ease-out ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={title}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border ${styles.accent} bg-white p-6 text-center shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] transition-all duration-200 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${styles.iconWrap}`}>
          {styles.icon}
        </div>
        <h2 className={`mt-4 text-2xl font-bold ${styles.title}`}>{title}</h2>
        <p className={`mt-2 text-sm leading-6 ${styles.message}`}>{message}</p>
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className={`mt-5 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition ${styles.button} disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
