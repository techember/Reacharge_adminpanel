import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapsed = () => setSidebarCollapsed(!sidebarCollapsed);

  useKeyboardShortcuts({
    onEscape: closeSidebar,
    onToggleSidebar: toggleSidebar,
  });

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapsed={toggleCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        {/* Header */}
        <Header
          title={title}
          onSidebarToggle={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto admin-scrollbar p-6 bg-[hsl(var(--background))]">
          {children}
        </main>
      </div>
    </div>
  );
};
