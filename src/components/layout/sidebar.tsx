"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard, Building2, Users, FileText, Wrench,
  BarChart3, MessageSquare, Settings, CreditCard, Megaphone,
  ChevronDown, Sparkles, LogOut, HelpCircle, X,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Properties", href: "/dashboard/properties", icon: Building2 },
  { title: "Tenants", href: "/dashboard/tenants", icon: Users },
  { title: "Leases", href: "/dashboard/leases", icon: FileText },
  {
    title: "Financials",
    href: "/dashboard/financials",
    icon: CreditCard,
    children: [
      { title: "Invoices", href: "/dashboard/financials/invoices" },
      { title: "Payments", href: "/dashboard/financials/payments" },
      { title: "Reconciliation", href: "/dashboard/financials/reconciliation" },
    ],
  },
  { title: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  {
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
    children: [
      { title: "Listings", href: "/dashboard/marketing/listings" },
      { title: "Leads", href: "/dashboard/marketing/leads" },
    ],
  },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "AI Assistant", href: "/dashboard/ai", icon: Sparkles, badge: "NEW" },
  { title: "Reports", href: "/dashboard/reports", icon: MessageSquare },
];

const bottomItems = [
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Help", href: "/dashboard/support", icon: HelpCircle },
];

interface SidebarProps {
  orgName?: string;
  plan?: string;
  onClose?: () => void;
}

export function Sidebar({ orgName = "My Organization", plan = "FREE", onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-5">
        <Link href="/dashboard">
          <Logo variant="horizontal" size="sm" />
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Org switcher */}
      <div className="border-b px-4 py-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50 transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-soil-100 text-soil-700 font-bold text-xs flex-shrink-0">
            {orgName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-gray-900 text-xs truncate">{orgName}</p>
            <p className="text-xs text-gray-500">{plan} Plan</p>
          </div>
          <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-soil-50 text-soil-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-soil-600" : "text-gray-400")} />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="rounded-full bg-soil-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>

              {item.children && active && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-xs transition-colors",
                        pathname === child.href
                          ? "text-soil-700 font-medium"
                          : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t px-3 py-3 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-brick-600 hover:bg-brick-50 transition-colors">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
