import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export const WalletManagement = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [txnType, setTxnType] = useState("");

  const [filteredList, setFilteredList] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // --------------------------------------------
  // FETCH WALLET HISTORY
  // --------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          "https://api.new.techember.in/api/wallet/wallet-txn",
          {
            headers: { token },
          },
        );

        const safeData = res.data?.Data?.txn ?? [];

        setRequests(safeData);
        setFilteredList(safeData); // DEFAULT LIST
      } catch (error) {
        console.error("Failed to fetch wallet history", error);
        setRequests([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // --------------------------------------------
  // APPLY FILTERS
  // --------------------------------------------
  const applyFilters = () => {
    let filtered = [...requests];

    if (userId.trim() !== "") {
      filtered = filtered.filter((i) =>
        i.userId?.toLowerCase().includes(userId.toLowerCase()),
      );
    }

    if (txnType.trim() !== "") {
      filtered = filtered.filter(
        (i) => i.txnType?.toLowerCase() === txnType.toLowerCase(),
      );
    }

    if (fromDate) {
      filtered = filtered.filter(
        (i) => new Date(i.createdAt) >= new Date(fromDate),
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (i) => new Date(i.createdAt) <= new Date(toDate),
      );
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setUserId("");
    setTxnType("");
    setFromDate("");
    setToDate("");
    setFilteredList(requests);
    setCurrentPage(1);
  };

  // --------------------------------------------
  // PAGINATION LOGIC
  // --------------------------------------------
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredList.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredList.length / rowsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --------------------------------------------
  // MODAL LOGIC (unchanged)
  // --------------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"credit" | "debit" | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const openModal = (type: "credit" | "debit") => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setAmount("");
    setReason("");
    setSelectedUser("");
  };

  const handleSubmit = async () => {
    if (!selectedUser || !amount || !reason) return;

    try {
      const res = await axios.post(
        "https://api.new.techember.in/api/wallet/wallet-txn",
        {
          userId: selectedUser,
          amount: Number(amount),
          type: modalType,
          reason,
        },
        { headers: { token } },
      );

      const newTxn = res.data?.data;
      if (newTxn) {
        setRequests((prev) => [newTxn, ...prev]);
        setFilteredList((prev) => [newTxn, ...prev]);
      }

      closeModal();
    } catch (error) {
      console.error("Wallet Transaction Error:", error);
      alert("Wallet transaction failed.");
    }
  };

  // --------------------------------------------
  // UI
  // --------------------------------------------
  if (loading) {
    return (
      <AdminLayout title="Wallet Management">
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Wallet Management">
      <div className="p-6 space-y-6">
        {/* ⭐ FILTER SECTION */}
        <div
          className="admin-card p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <h3 className="text-lg font-semibold">Filters</h3>
          <span>{isFilterOpen ? "▲" : "▼"}</span>
        </div>

        {isFilterOpen && (
          <div className="admin-card p-6 space-y-4">
            {/* User ID */}
            <div>
              <label className="text-sm text-muted-foreground">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border p-2 rounded-lg"
                placeholder="Search userId"
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-sm text-muted-foreground">
                Transaction Type
              </label>
              <select
                value={txnType}
                onChange={(e) => setTxnType(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={applyFilters} className="btn-primary flex-1">
                Apply Filters
              </button>
              <button onClick={resetFilters} className="btn-secondary flex-1">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ⭐ Quick Actions (unchanged) */}
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={() => openModal("credit")}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Credit Wallet
            </button>

            <button
              onClick={() => openModal("debit")}
              className="btn-secondary flex items-center gap-2"
            >
              <MinusIcon className="h-4 w-4" /> Debit Wallet
            </button>
          </div>
        </div>

        {/* ⭐ WALLET HISTORY TABLE */}
        <div className="admin-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Wallet History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>User ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((txn: any) => (
                  <tr key={txn._id}>
                    <td className="font-mono">{txn.txnId}</td>
                    <td className="font-mono">{txn.userId}</td>
                    <td>₹{txn.txnAmount}</td>
                    <td className="capitalize">{txn.txnType}</td>
                    <td>{txn.txnDesc}</td>
                    <td>
                      {txn.createdAt
                        ? new Date(txn.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ⭐ PAGINATION */}
          <div className="p-4 flex justify-center items-center gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* MODAL (unchanged) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {modalType === "credit" ? "Credit Wallet" : "Debit Wallet"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter userId"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border rounded-lg h-24"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedUser || !amount || !reason}
                  className="btn-primary disabled:opacity-50"
                >
                  {modalType === "credit" ? "Credit" : "Debit"} Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};