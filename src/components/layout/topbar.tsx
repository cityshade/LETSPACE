"use client";

import { Bell, Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
  userName?: string;
  userImage?: string;
}

export function Topbar({ title, actions, userName = "User" }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 gap-4">
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        )}
      </div>

      {/* Global Search */}
      <div className="w-64 hidden md:block">
        <Input
          placeholder="Search properties, tenants..."
          prefix={<Search className="h-3.5 w-3.5" />}
          className="h-8 text-xs"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}

        {/* AI Quick Access */}
        <Link href="/dashboard/ai">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            Ask AI
          </Button>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {userName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
