import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  UsersIcon, CreditCardIcon, BanknotesIcon, 
  DocumentCheckIcon, WalletIcon, ClockIcon, 
  CurrencyDollarIcon, UserPlusIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { mockDashboardStats, mockChartData } from '@/mocks/data';

const StatCard = ({ 
  title, value, growth, icon: Icon, trend = 'up', onClick
}: { 
  title: string; 
  value: string | number; 
  growth: number; 
  icon: React.ComponentType<any>; 
  trend?: 'up' | 'down';
  onClick?: () => void;
}) => (
  <div 
    className="admin-card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-[1.02]"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
        <div className="flex items-center mt-2">
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            {growth > 0 ? '+' : ''}{growth}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last month</span>
        </div>
      </div>
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ 
  title, icon: Icon, onClick
}: { 
  title: string; 
  icon: React.ComponentType<any>; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className="admin-card p-4 hover:shadow-lg transition-shadow text-left group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="font-medium text-foreground">{title}</span>
    </div>
  </button>
);

const chartConfig = {
  value: { label: 'Value', color: 'hsl(var(--primary))' },
  amount: { label: 'Amount', color: 'hsl(var(--primary))' },
};

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    if (useMock) {
      console.log('⚡ Using mock data for dashboard');
      setStats(mockDashboardStats);
      setCharts(mockChartData);
    } else {
      console.log('🌐 Fetching real data from API');
      fetch(`${API_URL}/admin/dashboard`)   // <-- backend will implement this endpoint
        .then(res => res.json())
        .then(data => {
          setStats(data.stats);
          setCharts(data.charts);
        })
        .catch(err => console.error('Dashboard fetch failed', err));
    }
  }, []);

  if (!stats || !charts) return <div className="p-6">Loading...</div>;

  const quickActions = [
    { title: 'Wallet Management', icon: WalletIcon, action: () => navigate('/wallet') },
    { title: 'Transaction History', icon: ClockIcon, action: () => navigate('/transactions') },
    { title: 'Cashback Campaigns', icon: CurrencyDollarIcon, action: () => navigate('/referral') },
    { title: 'Refer & Earn', icon: UserPlusIcon, action: () => navigate('/affiliate-store') }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            growth={stats.userGrowth} 
            icon={UsersIcon}
            onClick={() => navigate('/users')}
          />
          <StatCard 
            title="Transactions" 
            value={stats.totalTransactions.toLocaleString()} 
            growth={stats.transactionGrowth} 
            icon={CreditCardIcon}
            onClick={() => navigate('/transactions')}
          />
          <StatCard 
            title="Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            growth={stats.revenueGrowth} 
            icon={BanknotesIcon}
            onClick={() => navigate('/reports')}
          />
          <StatCard 
            title="Pending KYC" 
            value={stats.pendingKyc} 
            growth={stats.kycGrowth} 
            icon={DocumentCheckIcon} 
            trend="down"
            onClick={() => navigate('/kyc')}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Trends</h3>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.transactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Wallet Loads</h3>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.walletLoads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} title={action.title} icon={action.icon} onClick={action.action} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
