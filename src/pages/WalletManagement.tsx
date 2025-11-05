import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { mockWalletRequests, mockUsers } from '@/mocks/data';
import axios from 'axios';

export const WalletManagement = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'credit' | 'debit' | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const isMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (isMock) {
        setRequests(mockWalletRequests);
        setUsers(mockUsers);
      } else {
        try {
          const [reqRes, usersRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/wallet/requests`),
            axios.get(`${API_BASE_URL}/users`)
          ]);
          setRequests(reqRes.data);
          setUsers(usersRes.data);
        } catch (error) {
          console.error('Failed to fetch wallet data', error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [isMock, API_BASE_URL]);

  const handleApprove = (requestId: string) => {
    setRequests(requests.map(request =>
      request.id === requestId 
        ? { ...request, status: 'approved' }
        : request
    ));
    // TODO: if not mock, call backend: axios.post(`${API_BASE_URL}/wallet/approve/${requestId}`)
  };

  const handleReject = (requestId: string) => {
    setRequests(requests.map(request =>
      request.id === requestId 
        ? { ...request, status: 'rejected' }
        : request
    ));
    // TODO: if not mock, call backend: axios.post(`${API_BASE_URL}/wallet/reject/${requestId}`)
  };

  const openModal = (type: 'credit' | 'debit') => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedUser('');
    setUserSearchTerm('');
    setFilteredUsers([]);
    setShowUserDropdown(false);
    setAmount('');
    setReason('');
  };

  const handleSubmit = () => {
    if (selectedUser && amount && reason) {
      if (!isMock) {
        // TODO: Call backend API to credit/debit wallet
        // axios.post(`${API_BASE_URL}/wallet/${modalType}`, { userId: selectedUser, amount, reason })
      }
      console.log(`${modalType}: ₹${amount} for user ${selectedUser}. Reason: ${reason}`);
      closeModal();
    }
  };

  const lowBalanceUsers = users.filter(user => user.walletBalance < 100);

  // User search functionality
  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm);
    if (searchTerm.length > 0) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  };

  const selectUser = (user: any) => {
    setSelectedUser(user.id);
    setUserSearchTerm(`${user.name} (${user.id}) - ₹${user.walletBalance.toFixed(2)}`);
    setShowUserDropdown(false);
  };

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
        {/* Quick Actions */}
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={() => openModal('credit')}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Credit Wallet
            </button>
            <button
              onClick={() => openModal('debit')}
              className="btn-secondary flex items-center gap-2"
            >
              <MinusIcon className="h-4 w-4" />
              Debit Wallet
            </button>
          </div>
        </div>

        {/* Low Balance Alerts */}
        {lowBalanceUsers.length > 0 && (
          <div className="admin-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-semibold text-warning">Low Balance Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowBalanceUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">Balance: ₹{user.walletBalance.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(user.id);
                      openModal('credit');
                    }}
                    className="btn-primary text-sm"
                  >
                    Top Up
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top-up Requests */}
        <div className="admin-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Wallet Top-up Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="font-mono">{request.id}</td>
                    <td>
                      <div>
                        <div className="font-medium">{request.userName}</div>
                        <div className="text-sm text-muted-foreground">{request.userId}</div>
                      </div>
                    </td>
                    <td className="font-mono">₹{request.amount.toFixed(2)}</td>
                    <td>{request.paymentMode}</td>
                    <td>
                      <span className={`badge-${request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : 'error'} capitalize`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                    <td>
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="p-1 text-success hover:bg-success/10 rounded"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                            title="Reject"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Credit/Debit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {modalType === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search User</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      onFocus={() => userSearchTerm.length > 0 && setShowUserDropdown(true)}
                      placeholder="Search by name, ID, or email..."
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {showUserDropdown && filteredUsers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => selectUser(user)}
                            className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.id} - ₹{user.walletBalance.toFixed(2)}
                            </div>
                            {user.email && (
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary h-24 resize-none"
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
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalType === 'credit' ? 'Credit' : 'Debit'} Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
