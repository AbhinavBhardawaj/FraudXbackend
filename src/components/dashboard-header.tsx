
"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-2xl font-semibold">AI-Driven Fraud Detection</h1>
      </div>
    </header>
  );
}
