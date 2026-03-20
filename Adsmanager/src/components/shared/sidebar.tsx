"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/providers/user-provider";
import {
  LayoutDashboard,
  Building2,
  Layers,
  FolderTree,
  Radio,
  CreditCard,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react";

const navSections = [
  {
    label: "Main",
    items: [
      { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Organization",
    items: [
      { href: "/app/organizations", label: "Organizations", icon: Building2 },
      { href: "/app/business-units", label: "Business Units", icon: Layers },
      { href: "/app/departments", label: "Departments", icon: FolderTree },
      { href: "/app/channels", label: "Channels", icon: Radio },
    ],
  },
  {
    label: "Advertising",
    items: [
      { href: "/app/ad-accounts", label: "Ad Accounts", icon: CreditCard },
      { href: "/app/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/app/metrics", label: "Metrics", icon: BarChart3 },
    ],
  },
  {
    label: "Automation",
    items: [
      { href: "/app/rules", label: "Budget Rules", icon: ShieldCheck },
    ],
  },
];

const settingsItem = {
  href: "/app/settings",
  label: "Settings",
  icon: Settings,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useUser();

  const roleBadge = user?.isSuperAdmin
    ? "Super Admin"
    : user?.canManage
      ? "Org Admin"
      : "Analyst";

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Ads Platform
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Operations Hub</p>
        </div>
        <button
          type="button"
          className="md:hidden rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
        aria-label="Main navigation"
      >
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
        {(() => {
          const isActive =
            pathname === settingsItem.href ||
            pathname.startsWith(settingsItem.href + "/");
          return (
            <Link
              href={settingsItem.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <settingsItem.icon
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {settingsItem.label}
            </Link>
          );
        })()}
        {user?.profile && (
          <div className="px-3 pt-2 pb-1">
            <p className="text-xs font-medium text-foreground truncate">
              {user.profile.full_name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user.profile.email}
            </p>
            <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {roleBadge}
            </span>
          </div>
        )}
        <p className="px-3 text-xs text-muted-foreground">v0.1.0 MVP</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-50 h-screen w-60 border-r border-sidebar-border bg-sidebar flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 z-50 h-screen w-60 border-r border-sidebar-border bg-sidebar flex flex-col md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
