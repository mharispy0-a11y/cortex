import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_20px_-4px] shadow-indigo-500/60",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 text-white"
      >
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M5.5 5.5l2.1 2.1" />
        <path d="M16.4 16.4l2.1 2.1" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="M5.5 18.5l2.1-2.1" />
        <path d="M16.4 7.6l2.1-2.1" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-base font-semibold tracking-tight text-foreground">
        Cortex
      </span>
    </span>
  );
}
