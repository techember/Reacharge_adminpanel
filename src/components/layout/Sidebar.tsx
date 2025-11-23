import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  WalletIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  BellIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
  className?: string;
}

type NavItem = {
  name: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: Array<{
    name: string;
    href: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'User Management', href: '/users', icon: UsersIcon },
  { name: 'Wallet Management', href: '/wallet', icon: WalletIcon },
  { name: 'Commission Settings', href: '/commission', icon: CogIcon },
  {
    name: 'Master',
    icon: Squares2X2Icon,
    children: [
      { name: 'Service Control', href: '/master/services', icon: WrenchScrewdriverIcon },
      { name: 'Banner', href: '/master/banner', icon: PhotoIcon }
    ]
  },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Affiliate Store', href: '/affiliate-store', icon: BuildingStorefrontIcon }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isCollapsed, 
  onClose, 
  onToggleCollapsed, 
  className = '' 
}) => {

  const location = useLocation();
  const { logout } = useAuth();
  const focusTrapRef = useFocusTrap(isOpen);

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = () => logout();

  // ⭐ FIXED COLORS (WORK IMMEDIATELY)
  const SIDEBAR_BG = "bg-[#1E3A8A]";           // dark blue solid
  const SIDEBAR_TEXT = "text-white";
  const SIDEBAR_HOVER = "hover:bg-white/10";
  const SIDEBAR_ACTIVE = "bg-white/10 text-white";

  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        ref={focusTrapRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 ${SIDEBAR_BG} ${SIDEBAR_TEXT} transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
      >
        <SidebarContent isCollapsed={false} onItemClick={onClose} onToggleCollapsed={onToggleCollapsed} />
      </div>
    </>
  );

  const DesktopSidebar = () => (
    <div
      className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 ${SIDEBAR_BG} ${SIDEBAR_TEXT} transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      } ${className}`}
    >
      <SidebarContent isCollapsed={isCollapsed} onItemClick={() => {}} onToggleCollapsed={onToggleCollapsed} />
    </div>
  );

  const SidebarContent = ({ isCollapsed, onItemClick, onToggleCollapsed }: any) => (
    <div className="flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white text-[#1E3A8A] font-bold rounded-lg flex items-center justify-center">
              A
            </div>
            <span className="ml-2 text-lg font-bold">Admin Panel</span>
          </div>
        )}

        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex p-2 rounded-md bg-white/10 hover:bg-white/20"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {navigation.map((item) => {
          const isGroup = !!item.children;

          if (!isGroup) {
            const isActive = location.pathname.startsWith(item.href || "");

            return (
              <NavLink
                to={item.href!}
                key={item.name}
                onClick={onItemClick}
                className={`flex items-center px-3 py-2 rounded-lg transition ${isActive ? SIDEBAR_ACTIVE : SIDEBAR_HOVER}`}
              >
                {item.icon && <item.icon className="h-5 w-5 mr-3 text-white" />}
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          }

          const isOpen = openGroups[item.name] ?? true;

          return (
            <div key={item.name}>
              <button
                onClick={() => toggleGroup(item.name)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${SIDEBAR_HOVER}`}
              >
                {item.icon && <item.icon className="h-5 w-5 mr-3 text-white" />}
                {!isCollapsed && <span className="flex-1">{item.name}</span>}
                {!isCollapsed && (
                  <span className={`transform transition ${isOpen ? "" : "rotate-180"}`}>▼</span>
                )}
              </button>

              {isOpen && !isCollapsed && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childActive = location.pathname === child.href;

                    return (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        onClick={onItemClick}
                        className={`flex items-center px-3 py-2 rounded-md transition ${
                          childActive ? SIDEBAR_ACTIVE : SIDEBAR_HOVER
                        }`}
                      >
                        {child.icon && <child.icon className="h-4 w-4 mr-3 text-white" />}
                        <span>{child.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2 rounded-lg transition ${SIDEBAR_HOVER}`}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-white" />
          {!isCollapsed && "Logout"}
        </button>
      </div>

    </div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
};