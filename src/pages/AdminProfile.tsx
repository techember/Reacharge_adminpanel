import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  UserIcon,
  PencilIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  role: string;
  lastLogin: string;
  accountCreated: string;
  status: string;
}

export const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    employeeId: "",
    role: "",
    lastLogin: "",
    accountCreated: "",
    status: ""
  });

  const [loading, setLoading] = useState(true);

  // ✅ FETCHING LIVE PROFILE DATA FROM BACKEND
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      console.error("No token found");
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,  // ✅ TOKEN LIKE POSTMAN
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Profile API response:", data);

        // ✅ Map backend data → frontend expected structure
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          department: "",              // not available in backend
          employeeId: data._id || "",
          role: data.role || "",
          lastLogin: "",               // add when backend supports it
          accountCreated: data.createdAt || "",
          status: "Active"
        });

        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, []);

  // ✅ UPDATE PROFILE
  const handleSaveProfile = () => {
    const token = localStorage.getItem("adminToken");

    fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profileData)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Profile updated:", data);
        setIsEditing(false);
      })
      .catch(err => console.error("Failed to update profile", err));
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Profile">
        <div className="p-6">Loading profile...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Profile">
      <div className="p-6 space-y-6">

        {/* Profile Card */}
        <div className="admin-card p-6 flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="h-12 w-12 text-primary" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profileData.name}</h2>
            <p className="text-muted-foreground">{profileData.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Role: {profileData.role}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {profileData.status}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Editable Form */}
        {isEditing && (
          <div className="admin-card p-6 space-y-4">
            <label>Name</label>
            <input
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            <label>Email</label>
            <input
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            <label>Phone</label>
            <input
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            <label>Department</label>
            <input
              value={profileData.department}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  department: e.target.value
                })
              }
              className="w-full p-2 border rounded"
            />

            <button onClick={handleSaveProfile} className="btn-primary mt-2">
              Save Changes
            </button>
          </div>
        )}

        {/* Recent Activity - Placeholder */}
        <div className="admin-card p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ClockIcon className="h-5 w-5" /> Recent Activity
          </h3>
          <p className="text-muted-foreground">Feature coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};
