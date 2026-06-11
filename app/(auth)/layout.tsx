import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      <main id="main" className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
          <span className="sr-only">Back to the Cortex homepage</span>
        </Link>
        {children}
      </main>
    </div>
  );
}
