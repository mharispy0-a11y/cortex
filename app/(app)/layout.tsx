import { Sidebar } from "@/components/features/shell/sidebar";
import { Topbar } from "@/components/features/shell/topbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 bg-white/[0.015] md:block">
        <Sidebar />
      </aside>
      <div className="md:pl-64">
        <Topbar />
        <main id="main" className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
