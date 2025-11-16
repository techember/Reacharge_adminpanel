import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("name");
  const [sortFilter, setSortFilter] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [visibleMpin, setVisibleMpin] = useState<Record<string, boolean>>({});
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [selectedUserForReferral, setSelectedUserForReferral] = useState<string | null>(null);
  const [referralInput, setReferralInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // 🔐 Use your Postman token here (replace or fetch from localStorage if stored)
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwYjRmOTczZTFkMTc3M2Q0MmQ1MjEiLCJpYXQiOjE3NjI5MzEwOTJ9.iqzXVR7p9u0yPOvUq_Zi7l6RnPHjhn4SPsKsi4MUdQU";

        const res = await fetch(`https://api.new.techember.in/api/user/list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'token': `${token}`,
          },
          body: JSON.stringify({})
        });
        if (!res.ok) throw new Error("Failed to fetch users");

        const json = await res.json();
        console.log("User list:", json);
        const userList = json?.Data?.data ?? [];
 
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error loading users",
          description: "Could not load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // ✅ Filtering, sorting & pagination
  const filteredUsers = users.filter((user) => {
      let matchesSearch = true;
      if (searchTerm) {
        switch (searchFilter) {
          case "name":
            matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
            break;
          case "id":
            matchesSearch = user.id?.toLowerCase().includes(searchTerm.toLowerCase());
            break;
          case "email":
            matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            break;
          case "phone":
            matchesSearch = user.mobile?.includes(searchTerm);
            break;
        }
      }

      let matchesStatus = true;
      if (sortFilter === "active") matchesStatus = user.status === "active";
      else if (sortFilter === "inactive") matchesStatus = user.status !== "active";

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortFilter) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "latest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
  try {
    // 🔐 Use your Postman token here (replace or fetch from localStorage if stored)
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwYjRmOTczZTFkMTc3M2Q0MmQ1MjEiLCJpYXQiOjE3NjI5MzEwOTJ9.iqzXVR7p9u0yPOvUq_Zi7l6RnPHjhn4SPsKsi4MUdQU";
    // 1️⃣ Update UI immediately
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, status: newStatus } : user
      )
    );

    // 2️⃣ Send PATCH request to backend
    const response = await fetch("https://api.new.techember.in/api/user/status-update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        'token': `${token}`, 
      },
      body: JSON.stringify({
        userId,
        status: newStatus, // true or false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    console.log("Updated status:", data);

    } catch (error) {
    console.error("Error updating status:", error);

    // 3️⃣ rollback UI if backend fails
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, status: !newStatus } : user
      )
    );
  }
};

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied successfully` });
  };

  const toggleMpinVisibility = (userId: string) => {
    setVisibleMpin((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleAddReferral = (userId: string) => {
    setSelectedUserForReferral(userId);
    setReferralInput("");
    setReferralModalOpen(true);
  };

  const saveReferral = () => {
    if (!selectedUserForReferral || !referralInput.trim()) return;

    setUsers(
      users.map((user) =>
        user.id === selectedUserForReferral ? { ...user, referredBy: referralInput.trim() } : user
      )
    );

    toast({ title: "Referral added", description: "Referrer assigned" });
    setReferralModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredUsers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `users_${new Date().toISOString().split("T")[0]}.csv`);
  };

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="p-6">Loading users...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="p-6">
        {/* Filters and Search */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Select value={searchFilter} onValueChange={setSearchFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={`Search by ${searchFilter}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sort/Filter</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Referred By</th>
                <th>Registered</th>
                <th>IP</th>
                {/*<th>Address</th>*/}
                <th>Status</th>
                <th>MPIN</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <button onClick={() => copyToClipboard(user.id, "User ID")}>
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </td>

                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>

                  <td>
                    {user.referredBy || (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddReferral(user.id)}
                      >
                        Add
                      </Button>
                    )}
                  </td>

                  <td>{formatDate(user.createdAt)}</td>

                  <td>{user.ipAddress}</td>
                  {/*<td>{user.address}</td>*/}

                  <td>
                    <button
                      aria-pressed={user.status}
                      onClick={() => handleStatusChange(user._id, !user.status)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 p-1"
                      >
                      <span
                        className={`
                          block h-4 w-4 rounded-full transform transition-transform duration-200
                          ${user.status ? "translate-x-5 bg-green-500" : "translate-x-0 bg-gray-400"}
                        `}
                      />
                    </button>
                  </td>



                  <td>
                    {visibleMpin[user.id] ? user.mPin : "****"}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMpinVisibility(user.id)}
                    >
                      <EyeIcon className="h-3 w-3" />
                    </Button>
                  </td>

                  <td>₹{Number(user.wallet.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between mt-4">
            <p>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
