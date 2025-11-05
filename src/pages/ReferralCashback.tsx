import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  UserPlusIcon, 
  CurrencyDollarIcon, 
  GiftIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { mockReferrals } from '@/mocks/data';

interface CashbackCampaign {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minTransaction: number;
  maxCashback: number;
  validUntil: string;
  active: boolean;
  totalUsers: number;
  totalCashback: number;
}

const mockCampaigns: CashbackCampaign[] = [
  {
    id: 'CB001',
    name: 'Mobile Recharge Cashback',
    type: 'percentage',
    value: 2.5,
    minTransaction: 100,
    maxCashback: 50,
    validUntil: '2024-02-28',
    active: true,
    totalUsers: 1240,
    totalCashback: 15600
  },
  {
    id: 'CB002',
    name: 'Bill Payment Bonus',
    type: 'fixed',
    value: 25,
    minTransaction: 500,
    maxCashback: 25,
    validUntil: '2024-03-15',
    active: false,
    totalUsers: 890,
    totalCashback: 22250
  }
];

export const ReferralCashback = () => {
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  const [activeTab, setActiveTab] = useState<'referrals' | 'cashback'>('referrals');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<CashbackCampaign[]>([]);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minTransaction: 0,
    maxCashback: 0,
    validUntil: ''
  });

  // Load data based on mock/real
  useEffect(() => {
    if (useMock) {
      setReferrals(mockReferrals);
      setCampaigns(mockCampaigns);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/referrals`)
        .then((res) => {
          if (!res.ok) throw new Error(`referrals: ${res.status}`);
          return res.json();
        })
        .then((data) => setReferrals(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Failed to fetch referrals, using mock:", err);
          setReferrals(mockReferrals);
        });

      fetch(`${import.meta.env.VITE_API_BASE_URL}/cashback-campaigns`)
        .then((res) => {
          if (!res.ok) throw new Error(`campaigns: ${res.status}`);
          return res.json();
        })
        .then((data) => setCampaigns(Array.isArray(data) ? data : mockCampaigns))
        .catch((err) => {
          console.error("Failed to fetch campaigns, using mock:", err);
          setCampaigns(mockCampaigns);
        });
    }
  }, [useMock]);

  const toggleCampaign = (campaignId: string) => {
    setCampaigns(campaigns.map(campaign =>
      campaign.id === campaignId 
        ? { ...campaign, active: !campaign.active }
        : campaign
    ));
  };

  const createCampaign = () => {
    if (newCampaign.name && newCampaign.value > 0) {
      const campaign: CashbackCampaign = {
        id: `CB${String(campaigns.length + 1).padStart(3, '0')}`,
        ...newCampaign,
        active: true,
        totalUsers: 0,
        totalCashback: 0
      };
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        name: '',
        type: 'percentage',
        value: 0,
        minTransaction: 0,
        maxCashback: 0,
        validUntil: ''
      });
    }
  };

  const tabs = [
    { key: 'referrals' as const, label: 'Referral Program', icon: UserPlusIcon },
    { key: 'cashback' as const, label: 'Cashback Campaigns', icon: CurrencyDollarIcon }
  ];

  return (
    <AdminLayout title="Referral & Cashback">
      <div className="p-6">
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

          {/* Referrals Content */}
          {activeTab === 'referrals' && (
            <div className="p-6">
              {/* Referral Settings */}
              <div className="mb-6 p-4 bg-accent/20 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Referral Bonus Configuration</h3>
                  <button
                    onClick={() => setShowBonusForm(!showBonusForm)}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Configure
                  </button>
                </div>
                
                {showBonusForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bonus Amount (₹)</label>
                      <input
                        type="number"
                        value={bonusAmount}
                        onChange={(e) => setBonusAmount(e.target.value)}
                        placeholder="Enter bonus amount..."
                        className="w-full max-w-xs p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          console.log('Referral bonus set to:', bonusAmount);
                          setShowBonusForm(false);
                        }}
                        disabled={!bonusAmount}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Configuration
                      </button>
                      <button
                        onClick={() => setShowBonusForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p>Current referral bonus: <span className="font-semibold text-success">₹50</span> per successful referral</p>
                    <p>Minimum conditions: New user must complete first transaction of ₹100 or more</p>
                  </div>
                )}
              </div>

              {/* Referrals Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Referral ID</th>
                        <th>Referrer</th>
                        <th>Referee</th>
                        <th>Bonus Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr key={referral.id}>
                          <td className="font-mono">{referral.id}</td>
                          <td>
                            <div>
                              <div className="font-medium">{referral.referrerName}</div>
                              <div className="text-sm text-muted-foreground">{referral.referrerId}</div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="font-medium">{referral.refereeName}</div>
                              <div className="text-sm text-muted-foreground">{referral.refereeId}</div>
                            </div>
                          </td>
                          <td className="font-mono text-success">₹{referral.bonus.toFixed(2)}</td>
                          <td>
                            <span className={`badge-${referral.status === 'credited' ? 'success' : 'warning'} capitalize`}>
                              {referral.status}
                            </span>
                          </td>
                          <td>{new Date(referral.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cashback Content */}
          {activeTab === 'cashback' && (
            <div className="p-6">
              {/* Create New Campaign */}
              <div className="mb-6 p-4 bg-accent/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Create New Cashback Campaign</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      placeholder="Enter campaign name..."
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Value</label>
                    <input
                      type="number"
                      value={newCampaign.value || ''}
                      onChange={(e) => setNewCampaign({ ...newCampaign, value: parseFloat(e.target.value) || 0 })}
                      placeholder={newCampaign.type === 'percentage' ? 'Enter %' : 'Enter ₹'}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Transaction</label>
                    <input
                      type="number"
                      value={newCampaign.minTransaction || ''}
                      onChange={(e) => setNewCampaign({ ...newCampaign, minTransaction: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter minimum amount..."
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Cashback</label>
                    <input
                      type="number"
                      value={newCampaign.maxCashback || ''}
                      onChange={(e) => setNewCampaign({ ...newCampaign, maxCashback: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter max cashback..."
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={newCampaign.validUntil}
                      onChange={(e) => setNewCampaign({ ...newCampaign, validUntil: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={createCampaign}
                  disabled={!newCampaign.name || newCampaign.value <= 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Campaign
                </button>
              </div>

              {/* Active Campaigns */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cashback Campaigns</h3>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <GiftIcon className={`h-5 w-5 ${campaign.active ? 'text-success' : 'text-muted-foreground'}`} />
                          <h4 className="font-semibold">{campaign.name}</h4>
                        </div>
                        <button
                          onClick={() => toggleCampaign(campaign.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            campaign.active ? 'bg-success' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              campaign.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Campaign Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {/* ... campaign details unchanged ... */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
