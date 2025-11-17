import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { BellIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Notification {
  title: string;
  message: string; // This will be used as "content"
  type: 'push' | 'sms' | 'email' | 'banner';
  audience: 'all' | 'single';
  targetUser: string;
  scheduled: boolean;
  scheduleDate: string;
  scheduleTime: string;
  bannerImage?: File | null;
  bannerLink?: string;
  bannerSection?: 'top' | 'middle' | 'bottom' | 'sidebar';
}

export const NotificationManagement = () => {
  const [notification, setNotification] = useState<Notification>({
    title: '',
    message: '',
    type: 'push',
    audience: 'all',
    targetUser: '',
    scheduled: false,
    scheduleDate: '',
    scheduleTime: '',
    bannerImage: null,
    bannerLink: '',
    bannerSection: 'top'
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  // 🔥 Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`https://api.new.techember.in/api/notification/list/admin`);
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // 🔥 POST Request with ONLY { title, content }
  const sendNotification = async () => {
    try {
      const apiUrl = `https://api.new.techember.in/api/notification`;

      const bodyData = JSON.stringify({
        title: notification.title,
        content: notification.message   // message → content
      });

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "token": `${localStorage.getItem("token")}`
        },
        body: bodyData,
      });

      const data = await res.json();
      console.log("Notification sent:", data);

      setNotifications((prev) => [...prev, data]);

      // Reset form
      setNotification({
        title: '',
        message: '',
        type: 'push',
        audience: 'all',
        targetUser: '',
        scheduled: false,
        scheduleDate: '',
        scheduleTime: '',
        bannerImage: null,
        bannerLink: '',
        bannerSection: 'top'
      });

    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <AdminLayout title="Notification Management">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <BellIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Send Notification</h2>
            </div>

            <div className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) =>
                    setNotification({ ...notification, title: e.target.value })
                  }
                  placeholder="Enter notification title..."
                  className="w-full p-3 border border-border rounded-lg"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={notification.message}
                  onChange={(e) =>
                    setNotification({ ...notification, message: e.target.value })
                  }
                  placeholder="Enter content..."
                  className="w-full p-3 border border-border rounded-lg h-32 resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendNotification}
                disabled={!notification.title || !notification.message}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                Send Notification
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 && (
            <div className="admin-card p-6 mt-6">
              <h3 className="font-semibold mb-4">Sent Notifications</h3>
              <ul className="space-y-2">
                {notifications.map((n, idx) => (
                  <li key={idx} className="p-3 border rounded-lg">
                    <strong>{n.title}</strong> – {n.content}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
