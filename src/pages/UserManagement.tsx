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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinusIcon, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);

        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwYjRmOTczZTFkMTc3M2Q0MmQ1MjEiLCJpYXQiOjE3NjI5MzEwOTJ9.iqzXVR7p9u0yPOvUq_Zi7l6RnPHjhn4SPsKsi4MUdQU";

        const res = await fetch(`https://api.new.techember.in/api/user/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({}),
        });

        const json = await res.json();
        setUsers(json?.Data?.data ?? []);
      } catch (err) {
        toast({
          title: "Error loading users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // -------------------------
  // FILTER + SORT + PAGINATION
  // -------------------------
  const filteredUsers = users
    .filter((user) => {
      let matches = true;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        switch (searchFilter) {
          case "name":
            matches = `${user.firstName} ${user.lastName}`.toLowerCase().includes(term);
            break;
          case "id":
            matches = user._id?.toLowerCase().includes(term);
            break;
          case "email":
            matches = user.email?.toLowerCase().includes(term);
            break;
          case "phone":
            matches = user.phone?.includes(searchTerm);
            break;
        }
      }

      return matches;
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
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // -------------------------
  // STATUS TOGGLE
  // -------------------------
  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwYjRmOTczZTFkMTc3M2Q0MmQ1MjEiLCJpYXQiOjE3NjI5MzEwOTJ9.iqzXVR7p9u0yPOvUq_Zi7l6RnPHjhn4SPsKsi4MUdQU";

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );

      await fetch(`https://api.new.techember.in/api/user/status-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ userId, status: newStatus }),
      });
    } catch (err) {
      toast({ title: "Status update failed", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <AdminLayout title="User Management"><div className="p-6">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="User Management">
      <div className="p-6">

        {/* ------------------------ */}
        {/* TOP FILTER BAR UI FIXED */}
        {/* ------------------------ */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-3">

            {/* SEARCH FILTER */}
            <Select value={searchFilter} onValueChange={setSearchFilter}>
              <SelectTrigger className="w-32 bg-white border border-gray-300 shadow-sm rounded-md">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-md text-gray-900">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>

            {/* SEARCH INPUT */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <Input
                placeholder={`Search by ${searchFilter}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white border border-gray-300 shadow-sm"
              />
            </div>

            {/* SORT FILTER */}
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="w-40 bg-white border border-gray-300 shadow-sm rounded-md">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-md text-gray-900">
                <SelectItem value="none">No Sort</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => {}}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* ------------------------ */}
        {/* USER TABLE (UNCHANGED) */}
        {/* ------------------------ */}
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
                <th>Status</th>
                <th>MPIN</th>
                <th>Balance</th>
                <th>Wallet</th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer" />
                  </td>

                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>

                  <td>
                    {user.referredBy ? (
                      user.referredBy
                    ) : (
                      <Button size="sm" variant="outline">Add</Button>
                    )}
                  </td>

                  <td>{formatDate(user.createdAt)}</td>
                  <td>{user.ipAddress}</td>

                  <td>
                    <button
                      onClick={() => handleStatusChange(user._id, !user.status)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
                    >
                      <span
                        className={`block h-4 w-4 rounded-full transform transition-all ${
                          user.status ? "translate-x-5 bg-green-500" : "translate-x-0 bg-gray-400"
                        }`}
                      />
                    </button>
                  </td>

                  <td>
                    {visibleMpin[user._id] ? user.mPin : "****"}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setVisibleMpin((p) => ({ ...p, [user._id]: !p[user._id] }))
                      }
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </td>

                  <td>₹{Number(user.wallet.balance).toFixed(2)}</td>

                  <td>
                    <button className="p-2 rounded hover:bg-gray-100">
                      <Wallet className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between mt-4">
            <p>
              Showing {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <span>Page {currentPage} of {totalPages}</span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
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