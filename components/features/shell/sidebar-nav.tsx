"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  /** Milestone in which this route ships; rendered as a "Soon" hint. */
  comingSoon?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Documents", icon: FileText, comingSoon: true },
  { label: "Chat", icon: MessagesSquare, comingSoon: true },
  { label: "Analytics", icon: BarChart3, comingSoon: true },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex flex-col gap-1">
      {navItems.map((item) => {
        if (item.comingSoon || !item.href) {
          return (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
              <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
                Soon
              </span>
            </span>
          );
        }

        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-lg border border-white/10 bg-white/5"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                aria-hidden="true"
              />
            )}
            <item.icon className="relative size-4" aria-hidden="true" />
            <span className="relative">{item.label}</span>
            {isActive && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
