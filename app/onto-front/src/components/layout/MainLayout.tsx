'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ToastContainer } from '@/components/common/Toast';
import { useToast } from '@/lib/hooks/useToast';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  sidebarProps?: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    nodeTypes: string[];
    selectedTypes: string[];
    onTypeToggle: (type: string) => void;
    relationshipTypes: string[];
    selectedRelationships: string[];
    onRelationshipToggle: (rel: string) => void;
    nodeCount: number;
    edgeCount: number;
  };
}

export default function MainLayout({
  children,
  showSidebar = false,
  sidebarProps,
}: MainLayoutProps) {
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && sidebarProps && <Sidebar {...sidebarProps} />}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
          {children}
        </main>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

