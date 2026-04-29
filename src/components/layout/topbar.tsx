"use client";

import { Bell, Menu } from "lucide-react";
import { HeartbeatIndicator } from "./heartbeat-indicator";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
  userName?: string;
  onMenuClick?: () => void;
}

export function Topbar({ title, actions, userName = "User", onMenuClick }: TopbarProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 gap-3 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {actions}

        {/* Heartbeat */}
        <HeartbeatIndicator />

        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brick-500" />
        </button>

        <div className="h-8 w-8 rounded-full bg-soil-600 flex items-center justify-center text-white text-xs font-bold select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
