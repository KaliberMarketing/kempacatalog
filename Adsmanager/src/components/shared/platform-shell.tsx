"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { TopHeader } from "@/components/shared/top-header";

export function PlatformShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-60 transition-[margin] duration-200">
        <TopHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
