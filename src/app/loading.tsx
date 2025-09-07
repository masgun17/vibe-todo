export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <svg
          className="animate-spin h-6 w-6 text-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-sm text-neutral-600">Loading…</span>
      </div>
    </div>
  );
}

