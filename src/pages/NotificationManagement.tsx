import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  BellIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { Videotape } from "lucide-react";

interface Notification {
  title: string;
  message: string;

  popImage?: File | null;
  popImageUrl?: string;

  popName?: string;
  popLink?: string;
  popStatus?: string;

  bannerImage?: File | null;
}

export const NotificationManagement = () => {
  const [activeTab, setActiveTab] = useState<
    "notification" | "pop-image" | "banner"
  >("notification");

  const [notification, setNotification] = useState<Notification>({
    title: "",
    message: "",
    popImage: null,
    popImageUrl: "",
    popName: "",
    popLink: "",
    popStatus: "true",
    bannerImage: null,
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  // =====================================
  // Fetch Notification List
  // =====================================
  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `https://api.new.techember.in/api/notification/list/admin`,
        {
          method: "GET",
          headers: {
            token: `${localStorage.getItem("token")}` || "",
          },
        }
      );

      const data = await res.json();

      setNotifications(
        Array.isArray(data?.notifications)
          ? data.notifications
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =====================================
  // Send Normal Notification
  // =====================================
  const sendNotification = async () => {
    try {
      const res = await fetch(
        `https://api.new.techember.in/api/notification/push`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: notification.title,
            content: notification.message,
          }),
        }
      );

      await res.json();

      setNotification((prev) => ({
        ...prev,
        title: "",
        message: "",
      }));

      fetchNotifications();
    } catch (e) {
      console.log(e);
    }
  };

  // =====================================
  // Update POP Image
  // =====================================
  const sendPopImage = async () => {
    try {
      const formData = new FormData();

      if (notification.popImage)
        formData.append("image", notification.popImage);
      if (notification.popName?.trim())
        formData.append("name", notification.popName);
      if (notification.popLink?.trim())
        formData.append("link", notification.popLink);
      if (notification.popStatus)
        formData.append("status", notification.popStatus);

      const res = await fetch(
        `https://api.new.techember.in/api/pop-image/update`,
        {
          method: "PUT",
          headers: {
            token: `${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      console.log("POP IMAGE UPDATE =>", data);

      alert("Pop image updated!");

      setNotification((prev) => ({
        ...prev,
        popImage: null,
        popName: "",
        popLink: "",
      }));
    } catch (e) {
      console.log(e);
    }
  };

  // =====================================
  // Upload Banner (NEW TAB)
  // API: POST /api/notification/push-image
  // =====================================
  const uploadBanner = async () => {
    try {
      if (!notification.bannerImage)
        return alert("Upload a banner image first");

      const formData = new FormData();
      formData.append("image", notification.bannerImage);
      formData.append("title", notification.title || "");
      formData.append("content", notification.message || "");

      const res = await fetch(
        `https://api.new.techember.in/api/notification/push-image`,
        {
          method: "POST",
          headers: {
            token: `${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      console.log("BANNER RESPONSE:", data);

      alert("Banner uploaded!");

      setNotification((prev) => ({
        ...prev,
        title: "",
        message: "",
        bannerImage: null,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AdminLayout title="Notification Management">
      <div className="p-6 max-w-4xl mx-auto">
        {/* =========================== */}
        {/* TAB SWITCHER */}
        {/* =========================== */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("notification")}
            className={`px-4 py-2 rounded-lg font-medium border ${
              activeTab === "notification"
                ? "bg-primary text-white"
                : "bg-white"
            }`}
          >
            Notification
          </button>

          <button
            onClick={() => setActiveTab("pop-image")}
            className={`px-4 py-2 rounded-lg font-medium border ${
              activeTab === "pop-image" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            Pop Image
          </button>

          <button
            onClick={() => setActiveTab("banner")}
            className={`px-4 py-2 rounded-lg font-medium border ${
              activeTab === "banner" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            Banner
          </button>
        </div>

        {/* =========================== */}
        {/* NORMAL NOTIFICATION */}
        {/* =========================== */}
        {activeTab === "notification" && (
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <BellIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Send Notification</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) =>
                    setNotification({ ...notification, title: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  value={notification.message}
                  onChange={(e) =>
                    setNotification({ ...notification, message: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg h-32 resize-none"
                />
              </div>

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

        {/* =========================== */}
        {/* POP IMAGE */}
        {/* =========================== */}
        {activeTab === "pop-image" && (
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <PhotoIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Update Pop Image</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      popImage: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={notification.popName}
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      popName: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Redirect Link
                </label>
                <input
                  type="text"
                  value={notification.popLink}
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      popLink: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={notification.popStatus}
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      popStatus: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <button onClick={sendPopImage} className="btn-primary w-full">
                Update Pop Image
              </button>
            </div>
          </div>
        )}

        {/* =========================== */}
        {/* BANNER UPLOAD */}
        {/* =========================== */}
        {activeTab === "banner" && (
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Videotape className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Upload Banner</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) =>
                    setNotification({ ...notification, title: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  value={notification.message}
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      message: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg h-32 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      bannerImage: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button
                onClick={uploadBanner}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                Upload Banner
              </button>
            </div>
          </div>
        )}

        {/* =========================== */}
        {/* Notification List */}
        {/* =========================== */}
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
