import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  BellIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  title: string;
  message: string;
  popImage?: File | null;
  popImageUrl?: string;
}

export const NotificationManagement = () => {
  const [activeTab, setActiveTab] = useState<"notification" | "pop-image">("notification");

  const [notification, setNotification] = useState<Notification>({
    title: "",
    message: "",
    popImage: null,
    popImageUrl: "",
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch Notifications
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`https://api.new.techember.in/api/notification/list/admin`);
        const data = await res.json();
        setNotifications(data);
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, []);

  // Normal Notification
  const sendNotification = async () => {
    try {
      const res = await fetch(`https://api.new.techember.in/api/notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: notification.title,
          content: notification.message,
        }),
      });

      const data = await res.json();
      setNotifications((prev) => [...prev, data]);
    } catch (e) {
      console.log(e);
    }
  };

  // Pop Image Notification
  const sendPopImage = async () => {
    try {
      if (!notification.popImage) return alert("Upload an image");
      if (!notification.popImageUrl) return alert("Enter URL");

      const formData = new FormData();
      formData.append("image", notification.popImage);
      formData.append("url", notification.popImageUrl);

      await fetch(`https://api.new.techember.in/api/pop-image`, {
        method: "PUT",
        headers: {
          token: `${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      alert("Pop image sent!");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AdminLayout title="Notification Management">
      <div className="p-6 max-w-4xl mx-auto">

        {/* ========================= */}
        {/*       TAB SWITCHER        */}
        {/* ========================= */}
        <div className="flex gap-4 mb-6">

          {/* Notification Tab */}
          <button
            onClick={() => setActiveTab("notification")}
            className={`px-4 py-2 rounded-lg font-medium border 
            ${activeTab === "notification" ? "bg-primary text-white" : "bg-white"}`}
          >
            Notification
          </button>

          {/* Pop Image Tab */}
          <button
            onClick={() => setActiveTab("pop-image")}
            className={`px-4 py-2 rounded-lg font-medium border 
            ${activeTab === "pop-image" ? "bg-primary text-white" : "bg-white"}`}
          >
            Pop Image
          </button>
        </div>

        {/* ========================= */}
        {/*    COLUMN: NOTIFICATION   */}
        {/* ========================= */}
        {activeTab === "notification" && (
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
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={notification.message}
                  onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                  className="w-full p-3 border rounded-lg h-32 resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendNotification}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                Send Notification
              </button>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/*   COLUMN: POP IMAGE       */}
        {/* ========================= */}
        {activeTab === "pop-image" && (
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <PhotoIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Send Pop Image Notification</h2>
            </div>

            <div className="space-y-6">

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNotification({ ...notification, popImage: e.target.files?.[0] || null })
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Redirect URL
                </label>
                <input
                  type="text"
                  value={notification.popImageUrl}
                  onChange={(e) =>
                    setNotification({ ...notification, popImageUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              {/* Send Pop Image */}
              <button
                onClick={sendPopImage}
                className="btn-primary w-full"
              >
                Send Pop Image
              </button>
            </div>
          </div>
        )}

        {/* Notification list */}
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
    </AdminLayout>
  );
};
