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
    onToggleSidebar: toggleSidebar
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={title}
        onSidebarToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapsed={toggleCollapsed}
      />

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } pt-0`}
      >
        <div className="admin-scrollbar overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
