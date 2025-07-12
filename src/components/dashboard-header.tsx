"use client";

import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

type DashboardHeaderProps = {
  onDownload: () => void;
  canDownload: boolean;
};

export function DashboardHeader({ onDownload, canDownload }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="ml-auto">
        <Button onClick={onDownload} disabled={!canDownload}>
          <FileDown className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>
    </header>
  );
}
