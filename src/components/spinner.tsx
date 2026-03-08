import clsx from "clsx";

const sizeStyles = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

const colorStyles = {
  current: "text-current",
  zinc: "text-zinc-400 dark:text-zinc-500",
  white: "text-white",
  emerald: "text-emerald-500",
};

interface SpinnerProps {
  size?: keyof typeof sizeStyles;
  color?: keyof typeof colorStyles;
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", color = "zinc", className, label = "Loading" }: SpinnerProps) {
  return (
    <svg
      className={clsx("animate-spinner", sizeStyles[size], colorStyles[color], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={label}
      role="status"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Centered spinner with optional label text — for page/section loading */
export function SpinnerOverlay({
  label,
  size = "lg",
  className,
}: {
  label?: string;
  size?: keyof typeof sizeStyles;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-3 py-16", className)}>
      <Spinner size={size} />
      {label && <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>}
    </div>
  );
}
