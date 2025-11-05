import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {Wrench} from 'lucide-react';
import {
  HomeIcon,
  UsersIcon,
  DocumentCheckIcon,
  WalletIcon,
  CreditCardIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  PhotoIcon
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
  { name: 'KYC Management', href: '/kyc', icon: DocumentCheckIcon },
  { name: 'Wallet Management', href: '/wallet', icon: WalletIcon },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
  { name: 'Service Providers', href: '/serviceproviders', icon: Wrench },
  { name: 'Travel Bookings', href: '/travel-bookings', icon: Wrench },
  { name: 'Commission Settings', href: '/commission', icon: CogIcon },
  {
    name: 'Master',
    icon: Squares2X2Icon,
    children: [
      { name: 'Service Control', href: '/master/services', icon: WrenchScrewdriverIcon },
      { name: 'Games', href: '/master/games', icon: Squares2X2Icon },
      { name: 'Banner', href: '/master/banner', icon: PhotoIcon }
    ]
  },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Referral & Cashback', href: '/referral', icon: UserPlusIcon },
  { name: 'Support & Feedback', href: '/support', icon: ChatBubbleLeftRightIcon },
  { name: 'CMS Management', href: '/cms', icon: DocumentTextIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Admin Profile', href: '/profile', icon: UserIcon },
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

  const handleLogout = () => {
    logout();
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Mobile overlay
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        ref={focusTrapRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary text-primary-foreground transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
        id="sidebar"
      >
        <SidebarContent onItemClick={onClose} isCollapsed={false} onToggleCollapsed={onToggleCollapsed} />
      </div>
    </>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div
      className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 bg-primary text-primary-foreground transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${className}`}
      id="sidebar"
    >
      <SidebarContent onItemClick={() => {}} isCollapsed={isCollapsed} onToggleCollapsed={onToggleCollapsed} />
    </div>
  );

  const SidebarContent = ({ 
    onItemClick, 
    isCollapsed, 
    onToggleCollapsed 
  }: { 
    onItemClick: () => void; 
    isCollapsed: boolean; 
    onToggleCollapsed: () => void; 
  }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-foreground/10">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">A</span>
            </div>
            <span className="ml-2 text-xl font-bold">Admin Panel</span>
          </div>
        )}
        
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-primary-hover transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto admin-scrollbar p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isGroup = !!item.children?.length;
            

            if (!isGroup) {
              const isActive = item.href ? location.pathname.startsWith(item.href) : false;
              return (
                <NavLink
                  key={item.name}
                  to={item.href as string}
                  onClick={onItemClick}
                  className={({ isActive: navIsActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive || navIsActive
                        ? 'bg-primary-foreground/10 text-primary-foreground'
                        : 'text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                    }`
                  }
                >
                  {item.icon && (
                    <item.icon 
                      className={`h-5 w-5 flex-shrink-0 ${
                        isCollapsed ? '' : 'mr-3'
                      } ${isActive ? 'text-primary-foreground' : 'text-primary-foreground/70'}`} 
                    />
                  )}
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {isCollapsed && (
                    <span className="sr-only">{item.name}</span>
                  )}
                </NavLink>
              );
            }

            const isOpen = openGroups[item.name] ?? true;

            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.name)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    'text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                  }`}
                >
                  {item.icon && (
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} text-primary-foreground/70`} />
                  )}
                  {!isCollapsed && <span className="flex-1 text-left truncate">{item.name}</span>}
                  {!isCollapsed && (
                    <svg
                      className={`h-4 w-4 transition-transform ${isOpen ? '' : 'rotate-180'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isCollapsed && <span className="sr-only">{item.name}</span>}
                </button>
                {isOpen && !isCollapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const childActive = location.pathname === child.href;
                      return (
                        <NavLink
                          key={child.name}
                          to={child.href}
                          onClick={onItemClick}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                              isActive || childActive
                                ? 'bg-primary-foreground/10 text-primary-foreground'
                                : 'text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                            }`
                          }
                        >
                          {child.icon && (
                            <child.icon className={`h-4 w-4 mr-3 ${childActive ? 'text-primary-foreground' : 'text-primary-foreground/70'}`} />
                          )}
                          <span className="truncate">{child.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary-foreground/10">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon 
            className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} 
          />
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && <span className="sr-only">Logout</span>}
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