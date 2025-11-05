export const mockUsers = [
  {
    id: 'U001',
    name: 'John Doe',
    mobile: '+1234567890',
    email: 'john.doe@example.com',
    kycStatus: 'verified',
    walletBalance: 1250.50,
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
    referredBy: null,
    ipAddress: '192.168.1.100',
    address: '123 Main St, New York, NY 10001',
    mpin: '1234'
  },
  {
    id: 'U002',
    name: 'Jane Smith',
    mobile: '+1234567891',
    email: 'jane.smith@example.com',
    kycStatus: 'pending',
    walletBalance: 750.25,
    createdAt: '2024-01-16T14:20:00Z',
    status: 'active',
    referredBy: 'U001',
    ipAddress: '192.168.1.101',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    mpin: '5678'
  },
  {
    id: 'U003',
    name: 'Mike Johnson',
    mobile: '+1234567892',
    email: 'mike.johnson@example.com',
    kycStatus: 'rejected',
    walletBalance: 0.00,
    createdAt: '2024-01-17T09:15:00Z',
    status: 'suspended',
    referredBy: null,
    ipAddress: '192.168.1.102',
    address: '789 Pine Rd, Chicago, IL 60601',
    mpin: '9012'
  },
  {
    id: 'U004',
    name: 'Sarah Wilson',
    mobile: '+1234567893',
    email: 'sarah.wilson@example.com',
    kycStatus: 'verified',
    walletBalance: 2100.75,
    createdAt: '2024-01-18T16:45:00Z',
    status: 'active',
    referredBy: 'U002',
    ipAddress: '192.168.1.103',
    address: '321 Elm St, Houston, TX 77001',
    mpin: '3456'
  },
  {
    id: 'U005',
    name: 'David Brown',
    mobile: '+1234567894',
    email: 'david.brown@example.com',
    kycStatus: 'pending',
    walletBalance: 500.00,
    createdAt: '2024-01-19T11:30:00Z',
    status: 'active',
    referredBy: null,
    ipAddress: '192.168.1.104',
    address: '654 Maple Dr, Phoenix, AZ 85001',
    mpin: '7890'
  }
];

export const mockKycRequests = [
  {
    id: 'KYC001',
    userId: 'U002',
    userName: 'Jane Smith',
    documentType: 'Aadhaar',
    documentNumber: '1234-5678-9012',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300',
    status: 'pending',
    submittedAt: '2024-01-16T10:30:00Z',
    comments: ''
  },
  {
    id: 'KYC002',
    userId: 'U001',
    userName: 'John Doe',
    documentType: 'PAN Card',
    documentNumber: 'ABCDE1234F',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300',
    status: 'verified',
    submittedAt: '2024-01-15T14:20:00Z',
    comments: 'All documents verified successfully'
  }
];

export const mockTransactions = [
  {
    id: 'TXN001',
    userId: 'U001',
    userName: 'John Doe',
    type: 'recharge',
    service: 'Mobile Recharge',
    amount: 99.00,
    status: 'success',
    commission: 2.97,
    createdAt: '2024-01-18T09:15:00Z'
  },
  {
    id: 'TXN002',
    userId: 'U002',
    userName: 'Jane Smith',
    type: 'bill_payment',
    service: 'Electricity Bill',
    amount: 1500.00,
    status: 'pending',
    commission: 15.00,
    createdAt: '2024-01-18T10:30:00Z'
  }
];

export const mockWalletRequests = [
  {
    id: 'WR001',
    userId: 'U002',
    userName: 'Jane Smith',
    amount: 2000.00,
    status: 'pending',
    requestedAt: '2024-01-18T11:00:00Z',
    paymentMode: 'UPI'
  }
];

export const mockCommissionSettings = [
  { service: 'Mobile Recharge', commission: 3.0, unit: '%' as const, minAmount: 10, maxAmount: 500 },
  { service: 'DTH Recharge', commission: 2.5, unit: '%' as const, minAmount: 100, maxAmount: 2000 },
  { service: 'Electricity Bill', commission: 1.0, unit: '%' as const, minAmount: 100, maxAmount: 10000 },
  { service: 'Travel Booking', commission: 50, unit: 'fixed' as const, minAmount: 1000, maxAmount: 50000 }
];

export const mockReferrals = [
  {
    id: 'REF001',
    referrerId: 'U001',
    referrerName: 'John Doe',
    refereeId: 'U002',
    refereeName: 'Jane Smith',
    bonus: 50.00,
    status: 'credited',
    createdAt: '2024-01-16T15:30:00Z'
  }
];

export const mockSupportTickets = [
  {
    id: 'TICKET001',
    userId: 'U001',
    userName: 'John Doe',
    subject: 'Transaction Failed',
    message: 'My recharge transaction failed but money was deducted',
    status: 'open' as const,
    priority: 'high' as const,
    createdAt: '2024-01-18T12:00:00Z',
    response: undefined
  }
];

export const mockDashboardStats = {
  totalUsers: 15420,
  totalTransactions: 89340,
  totalRevenue: 245680.50,
  pendingKyc: 23,
  userGrowth: 12.5,
  transactionGrowth: 8.3,
  revenueGrowth: 15.7,
  kycGrowth: -5.2
};

export const mockChartData = {
  transactions: [
    { month: 'Jan', value: 12000 },
    { month: 'Feb', value: 19000 },
    { month: 'Mar', value: 15000 },
    { month: 'Apr', value: 25000 },
    { month: 'May', value: 22000 },
    { month: 'Jun', value: 30000 }
  ],
  walletLoads: [
    { day: 'Mon', amount: 45000 },
    { day: 'Tue', amount: 52000 },
    { day: 'Wed', amount: 48000 },
    { day: 'Thu', amount: 61000 },
    { day: 'Fri', amount: 55000 },
    { day: 'Sat', amount: 67000 },
    { day: 'Sun', amount: 43000 }
  ]
};