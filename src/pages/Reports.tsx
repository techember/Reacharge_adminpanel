import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  CalendarIcon, 
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// ✅ Mock Reports Data
const mockReportsData = {
  recharge: [
    { service: 'Mobile', count: 1240, revenue: 37200 },
    { service: 'DTH', count: 890, revenue: 178000 },
    { service: 'Electricity', count: 450, revenue: 675000 }
  ],
  commission: [
    { month: 'Jan', amount: 12450 },
    { month: 'Feb', amount: 15670 },
    { month: 'Mar', amount: 18920 },
    { month: 'Apr', amount: 22150 },
    { month: 'May', amount: 19800 },
    { month: 'Jun', amount: 24500 }
  ],
  wallet: [
    { day: 'Mon', credits: 45000, debits: 38000 },
    { day: 'Tue', credits: 52000, debits: 41000 },
    { day: 'Wed', credits: 48000, debits: 39000 },
    { day: 'Thu', credits: 61000, debits: 45000 },
    { day: 'Fri', credits: 55000, debits: 43000 },
    { day: 'Sat', credits: 67000, debits: 52000 },
    { day: 'Sun', credits: 43000, debits: 35000 }
  ]
};

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
  revenue: { label: "Revenue", color: "hsl(var(--success))" },
  amount: { label: "Amount", color: "hsl(var(--primary))" },
  credits: { label: "Credits", color: "hsl(var(--success))" },
  debits: { label: "Debits", color: "hsl(var(--destructive))" }
};

export const Reports = () => {
  const [activeTab, setActiveTab] = useState<'recharge' | 'commission' | 'wallet'>('recharge');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });
  const [reportsData, setReportsData] = useState(mockReportsData);

  const tabs = [
    { key: 'recharge' as const, label: 'Recharge Reports', icon: ChartBarIcon },
    { key: 'commission' as const, label: 'Commission Reports', icon: CurrencyDollarIcon },
    { key: 'wallet' as const, label: 'Wallet Reports', icon: WalletIcon }
  ];

  // ✅ Switch between Mock and Backend
  useEffect(() => {
    const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

    if (useMock) {
      setReportsData(mockReportsData);
    } else {
      const fetchReports = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reports?from=${dateRange.start}&to=${dateRange.end}`);
          if (!res.ok) throw new Error("Failed to fetch reports");
          const data = await res.json();
          setReportsData(data);
        } catch (err) {
          console.error("Error fetching reports:", err);
          setReportsData(mockReportsData); // Optional: fallback to mock
        }
      };
      fetchReports();
    }
  }, [dateRange]);

  const exportReport = (format: 'excel' | 'pdf') => {
    console.log(`Exporting ${activeTab} report as ${format}`, dateRange);
  };

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="p-6">
        {/* Date Range Selector */}
        <div className="admin-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Date Range</h3>
            </div>
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
        </div>

        <div className="admin-card">
          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold capitalize">{activeTab} Analytics</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('excel')}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Export Excel
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Recharge Reports */}
            {activeTab === 'recharge' && (
              <div className="space-y-6">
                <div className="h-80">
                  <h4 className="text-lg font-medium mb-4">Service Wise Recharge Count</h4>
                  <ChartContainer config={chartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportsData.recharge}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="service" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportsData.recharge.map((item) => (
                    <div key={item.service} className="bg-accent/20 p-4 rounded-lg">
                      <h5 className="font-semibold">{item.service}</h5>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Transactions: <span className="font-medium text-foreground">{item.count}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: <span className="font-medium text-success">₹{item.revenue.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commission Reports */}
            {activeTab === 'commission' && (
              <div className="h-80">
                <h4 className="text-lg font-medium mb-4">Monthly Commission Trends</h4>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportsData.commission}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}

            {/* Wallet Reports */}
            {activeTab === 'wallet' && (
              <div className="h-80">
                <h4 className="text-lg font-medium mb-4">Daily Wallet Activity</h4>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsData.wallet}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="credits" fill="hsl(var(--success))" />
                      <Bar dataKey="debits" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
