import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { mockTransactions } from '@/mocks/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Transaction {
  id: string;
  userName: string;
  userId: string;
  service: string;
  type: string;
  amount: number;
  commission: number;
  status: string;
  createdAt: string;
}

export const TransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRangeFilter, setAmountRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        if (USE_MOCK) {
          // ✅ Use mock data
          setTransactions(mockTransactions);
        } else {
          // ✅ Fetch from backend
          const res = await axios.get(`${API_BASE_URL}/transactions`);
          setTransactions(res.data);
        }

      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesService = serviceFilter === 'all' || transaction.type === serviceFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const transactionDate = new Date(transaction.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = transactionDate >= startDate && transactionDate <= endDate;
    } else if (dateRange.start) {
      const transactionDate = new Date(transaction.createdAt);
      const startDate = new Date(dateRange.start);
      matchesDateRange = transactionDate >= startDate;
    } else if (dateRange.end) {
      const transactionDate = new Date(transaction.createdAt);
      const endDate = new Date(dateRange.end);
      matchesDateRange = transactionDate <= endDate;
    }
    
    // Amount range filter
    let matchesAmountRange = true;
    if (amountRangeFilter !== 'all') {
      switch (amountRangeFilter) {
        case 'low':
          matchesAmountRange = transaction.amount < 100;
          break;
        case 'medium':
          matchesAmountRange = transaction.amount >= 100 && transaction.amount < 1000;
          break;
        case 'high':
          matchesAmountRange = transaction.amount >= 1000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesService && matchesDateRange && matchesAmountRange;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'user':
        comparison = a.userName.localeCompare(b.userName);
        break;
      case 'service':
        comparison = a.service.localeCompare(b.service);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const updateStatus = (transactionId: string, newStatus: string) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === transactionId 
          ? { ...transaction, status: newStatus }
          : transaction
      )
    );
  };

  const initiateRefund = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === transactionId 
          ? { ...transaction, status: 'refunded' }
          : transaction
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      success: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-error',
      refunded: 'badge-neutral'
    };
    return badges[status as keyof typeof badges] || 'badge-neutral';
  };

  const exportTransactions = () => {
    console.log('Exporting transactions...', filteredTransactions);
  };

  return (
    <AdminLayout title="Transaction Management">
      <div className="p-6">
        <div className="admin-card">
          {/* Header with Filters */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">All Services</option>
                  <option value="recharge">Recharge</option>
                  <option value="bill_payment">Bill Payment</option>
                  <option value="travel">Travel</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  Filters
                </button>

                <button
                  onClick={exportTransactions}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range Filter */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">From:</label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">To:</label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Range Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount Range</label>
                    <select
                      value={amountRangeFilter}
                      onChange={(e) => setAmountRangeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="all">All Amounts</option>
                      <option value="low">Under ₹100</option>
                      <option value="medium">₹100 - ₹1000</option>
                      <option value="high">Above ₹1000</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="user">User</option>
                      <option value="service">Service</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setServiceFilter('all');
                      setDateRange({ start: '', end: '' });
                      setAmountRangeFilter('all');
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                    className="btn-secondary text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>User</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Commission</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="font-mono">{transaction.id}</td>
                        <td>
                          <div>
                            <div className="font-medium">{transaction.userName}</div>
                            <div className="text-sm text-muted-foreground">{transaction.userId}</div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="font-medium">{transaction.service}</div>
                            <div className="text-sm text-muted-foreground capitalize">{transaction.type}</div>
                          </div>
                        </td>
                        <td className="font-mono">₹{transaction.amount.toFixed(2)}</td>
                        <td className="font-mono text-success">₹{transaction.commission.toFixed(2)}</td>
                        <td>
                          {transaction.status === 'pending' ? (
                            <select
                              value={transaction.status}
                              onChange={(e) => updateStatus(transaction.id, e.target.value)}
                              className="text-sm border border-border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="success">Success</option>
                              <option value="failed">Failed</option>
                            </select>
                          ) : (
                            <span className={`${getStatusBadge(transaction.status)} capitalize`}>
                              {transaction.status}
                            </span>
                          )}
                        </td>
                        <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {(transaction.status === 'success' || transaction.status === 'failed') && (
                              <button
                                onClick={() => initiateRefund(transaction.id)}
                                className="p-1 text-warning hover:bg-warning/10 rounded"
                                title="Refund"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <FunnelIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  No transactions found matching your filters.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
