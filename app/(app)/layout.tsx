import { redirect } from "next/navigation";

import { Sidebar } from "@/components/features/shell/sidebar";
import { Topbar } from "@/components/features/shell/topbar";
import { getSessionContext } from "@/server/queries";

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.activeWorkspace) redirect("/onboarding");

  const workspaces = session.workspaces.map((w) => ({
    id: w.id,
    name: w.name,
  }));
  const user = {
    name: session.profile.full_name ?? session.profile.email,
    email: session.profile.email,
    initials: initials(session.profile.full_name, session.profile.email),
  };

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 bg-white/[0.015] md:block">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={session.activeWorkspace.id}
        />
      </aside>
      <div className="md:pl-64">
        <Topbar
          user={user}
          workspaces={workspaces}
          activeWorkspaceId={session.activeWorkspace.id}
        />
        <main id="main" className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
