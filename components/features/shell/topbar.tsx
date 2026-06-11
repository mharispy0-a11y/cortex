"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/features/shell/sidebar";
import { UserMenu } from "@/components/features/shell/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
};

export function Topbar() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer after navigating.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/5 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-white/10 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <h1 className="text-sm font-medium text-muted-foreground">
        <span className="text-foreground">
          {pageTitles[pathname] ?? "Cortex"}
        </span>
      </h1>

      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
