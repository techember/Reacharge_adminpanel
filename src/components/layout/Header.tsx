import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onSidebarToggle, sidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Mock notification data
  const notifications = [
    { id: 1, title: 'New KYC Request', message: 'John Doe submitted KYC documents', time: '2 min ago', unread: true },
    { id: 2, title: 'Wallet Top-up', message: 'User U002 added ₹500 to wallet', time: '15 min ago', unread: true },
    { id: 3, title: 'Transaction Failed', message: 'Mobile recharge failed for U003', time: '1 hour ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  const handleNotificationItemClick = (notificationId: number) => {
    // Mark as read and navigate to relevant page
    console.log('Notification clicked:', notificationId);
    setNotificationDropdownOpen(false);
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setNotificationDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    if (notificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationDropdownOpen]);

  return (
    <header className="h-16 bg-primary text-primary-foreground flex items-center justify-between px-4 lg:px-6 shadow-lg relative z-30">
      {/* Left - Profile Avatar (Sidebar Toggle) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          aria-label="Toggle sidebar menu"
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full border-2 border-primary-foreground/20"
          />
        </button>
        
        {/* Page Title */}
        <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
      </div>

      {/* Center - Page Title (Mobile) */}
      <div className="flex-1 text-center sm:hidden">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* Right - Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-foreground/60" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-primary-hover text-primary-foreground placeholder-primary-foreground/60 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 focus:border-transparent"
          />
        </div>

        {/* Mobile Search */}
        <button className="md:hidden p-2 rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={handleNotificationClick}
            className="p-2 rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-warning text-warning-foreground rounded-full text-xs font-semibold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={handleViewAllNotifications}
                    className="text-sm text-primary hover:text-primary-hover"
                  >
                    View All
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};