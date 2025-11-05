import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  UserIcon, PencilIcon, CheckIcon, XMarkIcon,
  KeyIcon, ShieldCheckIcon, ClockIcon, DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { PinInput } from '@/components/ui/pin-input';

const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

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

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ActivityLog {
  action: string;
  timestamp: string;
  ip: string;
}

interface Permission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export const AdminProfile = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeMpin, setShowChangeMpin] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    role: '',
    lastLogin: '',
    accountCreated: '',
    status: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Fetch profile, activity, and permissions from backend (or mock)
  useEffect(() => {
    if (useMock) {
      setProfileData({
        name: user?.name || 'Admin User',
        email: user?.email || 'admin@gmail.com',
        phone: '+1 (555) 123-4567',
        department: 'IT Administration',
        employeeId: 'EMP001',
        role: user?.role || 'admin',
        lastLogin: '2024-01-18 10:30 AM',
        accountCreated: '2023-06-15',
        status: 'Active'
      });
      setActivityLogs([
        { action: 'Logged in', timestamp: '2024-01-18 10:30 AM', ip: '192.168.1.100' },
        { action: 'Updated user status', timestamp: '2024-01-18 09:45 AM', ip: '192.168.1.100' },
        { action: 'Exported transaction report', timestamp: '2024-01-17 04:20 PM', ip: '192.168.1.100' },
      ]);
      setPermissions([
        { module: 'User Management', read: true, write: true, delete: true },
        { module: 'KYC Management', read: true, write: true, delete: false },
        { module: 'Wallet Management', read: true, write: true, delete: false },
      ]);
    } else {
      // Fetch profile
      fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`)
        .then(res => res.json())
        .then(data => setProfileData(data))
        .catch(err => console.error('Failed to fetch profile', err));

      // Fetch activity logs
      fetch(`${import.meta.env.VITE_API_BASE_URL}/activity-logs`)
        .then(res => res.json())
        .then(data => setActivityLogs(data))
        .catch(err => console.error('Failed to fetch activity logs', err));

      // Fetch permissions
      fetch(`${import.meta.env.VITE_API_BASE_URL}/permissions`)
        .then(res => res.json())
        .then(data => setPermissions(data))
        .catch(err => console.error('Failed to fetch permissions', err));
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (useMock) {
      console.log('Saving profile (mock):', profileData);
      setIsEditing(false);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
        .then(res => res.json())
        .then(data => {
          setProfileData(data);
          setIsEditing(false);
        })
        .catch(err => console.error('Failed to save profile', err));
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (useMock) {
      console.log('Changing password (mock):', passwordData);
      setShowChangePassword(false);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      })
        .then(() => setShowChangePassword(false))
        .catch(err => console.error('Failed to change password', err));
    }

    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangeMpin = () => {
    if (newMpin.length !== 4 || confirmMpin.length !== 4) {
      alert('MPIN must be 4 digits');
      return;
    }
    if (newMpin !== confirmMpin) {
      alert('MPINs do not match');
      return;
    }

    if (useMock) {
      console.log('Changing MPIN (mock):', newMpin);
      setShowChangeMpin(false);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/change-mpin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpin: newMpin })
      })
        .then(() => setShowChangeMpin(false))
        .catch(err => console.error('Failed to change MPIN', err));
    }

    setNewMpin('');
    setConfirmMpin('');
  };

  return (
    <AdminLayout title="Admin Profile">
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="admin-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="h-12 w-12 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profileData.name}</h2>
            <p className="text-muted-foreground">{profileData.email}</p>
            <p className="text-sm text-muted-foreground mt-1">Role: {profileData.role}</p>
            <p className="text-sm text-muted-foreground">Status: {profileData.status}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Editable Profile Form */}
        {isEditing && (
          <div className="admin-card p-6 space-y-4">
            <label>Name</label>
            <input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <label>Email</label>
            <input
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <label>Phone</label>
            <input
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <label>Department</label>
            <input
              value={profileData.department}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <button onClick={handleSaveProfile} className="btn-primary mt-2">
              Save Changes
            </button>
          </div>
        )}

        {/* Activity Logs */}
        <div className="admin-card p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ClockIcon className="h-5 w-5" /> Recent Activity
          </h3>
          {activityLogs.length === 0 && <p>No activity logs found.</p>}
          <ul className="mt-2 space-y-2">
            {activityLogs.map((log, i) => (
              <li key={i} className="p-2 border rounded flex justify-between">
                <span>{log.action}</span>
                <span className="text-sm text-muted-foreground">{log.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Permissions */}
        <div className="admin-card p-6">
          <h3 className="font-semibold text-lg">Permissions</h3>
          <ul className="mt-2 space-y-2">
            {permissions.map((perm, i) => (
              <li key={i} className="p-2 border rounded flex justify-between">
                <span>{perm.module}</span>
                <span className="flex gap-1">
                  <span className={perm.read ? 'text-green-600' : 'text-gray-400'}>R</span>
                  <span className={perm.write ? 'text-yellow-600' : 'text-gray-400'}>W</span>
                  <span className={perm.delete ? 'text-red-600' : 'text-gray-400'}>D</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modals for Password & MPIN */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowChangePassword(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleChangePassword} className="btn-primary">Update</button>
              </div>
            </div>
          </div>
        )}

        {showChangeMpin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Change MPIN</h3>
              <PinInput length={4} onChange={setNewMpin} type="number" />
              <PinInput length={4} onChange={setConfirmMpin} type="number" />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowChangeMpin(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleChangeMpin} className="btn-primary">Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
