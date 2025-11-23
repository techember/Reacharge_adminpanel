import React, { useState, useEffect } from "react";
import axios from "axios"; // ⭐ ADDED
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  PhoneIcon,
  TvIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const Reports = () => {
  const [activeTab, setActiveTab] = useState<"mobile" | "dth" | "bills">(
    "mobile"
  );

  // ⭐ NEW: Live API data list
  const [apiTransactions, setApiTransactions] = useState<any[]>([]);

  const tabs = [
    { key: "mobile", label: "Mobile Recharge", icon: PhoneIcon },
    { key: "dth", label: "DTH", icon: TvIcon },
    { key: "bills", label: "Bill Payments", icon: BoltIcon },
  ];

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const [providerOptions, setProviderOptions] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const statusOptions = ["Success", "Failed", "Pending"];

  const [filteredList, setFilteredList] = useState<any[]>([]);

  // ⭐ UPDATED: now transactions come from the API
  const getTransactions = () => {
    return apiTransactions;
  };

  // ⭐ NEW API CALL
  const fetchAllTransactions = async () => {
    try {
      const token = localStorage.getItem("token"); // adjust if needed

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/txn/list/all`,
        {
          headers: {
            token: token,
          },
        }
      );

      if (res.data?.Data?.data) {
        const mapped = res.data.Data.data.map((item: any) => ({
          id: item.txnId,
          number: item.userId?.phone || "N/A",
          amount: item.txnAmount,
          status:
            item.txnStatus === "TXN_SUCCESS"
              ? "Success"
              : item.txnStatus === "PENDING"
              ? "Pending"
              : "Failed",
          date: item.createdAt?.substring(0, 10),
          txnName: item.txnName,
          raw: item,
        }));

        setApiTransactions(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  // ⭐ CALL API ON LOAD
  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // ⭐ UPDATE PROVIDER LIST BASED ON API
  useEffect(() => {
    const list = getTransactions();

    const uniqueProviders = [
      ...new Set(list.map((item) => item.number?.trim()).filter(Boolean)),
    ];

    setProviderOptions(uniqueProviders);
  }, [apiTransactions, activeTab]);

  const applyFilter = () => {
    let filtered = getTransactions();

    if (provider) {
      filtered = filtered.filter((item) =>
        item.number.toLowerCase().includes(provider.toLowerCase())
      );
    }

    if (amount.trim() !== "") {
      filtered = filtered.filter(
        (item) => String(item.amount) === String(amount)
      );
    }

    if (status) {
      filtered = filtered.filter(
        (item) => item.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (fromDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(fromDate)
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(toDate)
      );
    }

    setFilteredList(filtered);
  };

  const resetFilters = () => {
    setProvider("");
    setAmount("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setFilteredList([]);
  };

  const finalList = filteredList.length > 0 ? filteredList : getTransactions();

  return (
    <AdminLayout title="Reports">
      <div className="p-6">
        <div className="admin-card">
          <div className="border-b border-border">
            <div
              className="admin-card p-4 flex justify-between items-center cursor-pointer mb-4"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <h3 className="text-lg font-semibold">Filters</h3>
              <span>{isFilterOpen ? "▲" : "▼"}</span>
            </div>

            {isFilterOpen && (
              <div className="admin-card p-6 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full border border-border p-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full border border-border p-2 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full border border-border p-2 rounded-lg"
                  >
                    <option value="">Select Provider</option>
                    {providerOptions.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-border p-2 rounded-lg"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-border p-2 rounded-lg"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={applyFilter} className="btn-primary flex-1">
                    Apply Filters
                  </button>

                  <button
                    onClick={resetFilters}
                    className="btn-secondary flex-1"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-1 flex items-center gap-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              {tabs.find((t) => t.key === activeTab)?.label} Transactions
            </h3>

            <div className="bg-accent/20 rounded-lg divide-y divide-border">
              {finalList.map((txn) => (
                <div
                  key={txn.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-semibold">{txn.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {txn.number}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">₹{txn.amount}</p>
                    <p
                      className={`text-xs ${
                        txn.status === "Success"
                          ? "text-green-600"
                          : txn.status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {txn.status}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {txn.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
