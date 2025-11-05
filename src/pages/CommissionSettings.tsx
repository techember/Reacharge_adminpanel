import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { mockCommissionSettings } from '@/mocks/data';

interface CommissionSetting {
  service: string;
  commission: number;
  unit: '%' | 'fixed';
  minAmount: number;
  maxAmount: number;
}

export const CommissionSettings = () => {
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CommissionSetting | null>(null);

  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      if (useMock) {
        // Use mock data
        setSettings(mockCommissionSettings);
      } else {
        try {
          const response = await axios.get(`${apiBaseUrl}/commission-settings`);
          setSettings(response.data);
        } catch (error) {
          console.error('Failed to fetch commission settings', error);
        }
      }
    };

    fetchSettings();
  }, [useMock, apiBaseUrl]);

  const startEdit = (setting: CommissionSetting) => {
    setEditingId(setting.service);
    setEditForm({ ...setting });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (editForm && editingId) {
      if (useMock) {
        // Update local state only
        setSettings(settings.map(s => 
          s.service === editingId ? editForm : s
        ));
      } else {
        try {
          await axios.put(`${apiBaseUrl}/commission-settings/${editingId}`, editForm);
          setSettings(settings.map(s => 
            s.service === editingId ? editForm : s
          ));
        } catch (error) {
          console.error('Failed to update commission setting', error);
        }
      }
      setEditingId(null);
      setEditForm(null);
    }
  };

  const updateEditForm = (field: keyof CommissionSetting, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  return (
    <AdminLayout title="Commission Settings">
      <div className="p-6">
        <div className="admin-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <CogIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Service Commission Configuration</h2>
            </div>
            <p className="text-muted-foreground mt-2">
              Configure commission rates for different services. Changes take effect immediately.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Commission</th>
                  <th>Unit</th>
                  <th>Min Amount</th>
                  <th>Max Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting) => (
                  <tr key={setting.service}>
                    <td className="font-medium">{setting.service}</td>
                    
                    {/* Commission */}
                    <td>
                      {editingId === setting.service ? (
                        <input
                          type="number"
                          value={editForm?.commission || 0}
                          onChange={(e) => updateEditForm('commission', parseFloat(e.target.value) || 0)}
                          className="w-20 p-1 text-sm border border-border rounded"
                          step="0.1"
                          min="0"
                        />
                      ) : (
                        <span className="font-mono">{setting.commission}</span>
                      )}
                    </td>

                    {/* Unit */}
                    <td>
                      {editingId === setting.service ? (
                        <select
                          value={editForm?.unit || '%'}
                          onChange={(e) => updateEditForm('unit', e.target.value as '%' | 'fixed')}
                          className="p-1 text-sm border border-border rounded"
                        >
                          <option value="%">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      ) : (
                        <span className="capitalize">
                          {setting.unit === '%' ? 'Percentage' : 'Fixed'}
                        </span>
                      )}
                    </td>

                    {/* Min Amount */}
                    <td>
                      {editingId === setting.service ? (
                        <input
                          type="number"
                          value={editForm?.minAmount || 0}
                          onChange={(e) => updateEditForm('minAmount', parseFloat(e.target.value) || 0)}
                          className="w-24 p-1 text-sm border border-border rounded"
                          min="0"
                        />
                      ) : (
                        <span className="font-mono">₹{setting.minAmount}</span>
                      )}
                    </td>

                    {/* Max Amount */}
                    <td>
                      {editingId === setting.service ? (
                        <input
                          type="number"
                          value={editForm?.maxAmount || 0}
                          onChange={(e) => updateEditForm('maxAmount', parseFloat(e.target.value) || 0)}
                          className="w-24 p-1 text-sm border border-border rounded"
                          min="0"
                        />
                      ) : (
                        <span className="font-mono">₹{setting.maxAmount.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      {editingId === setting.service ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveEdit}
                            className="p-1 text-success hover:bg-success/10 rounded"
                            title="Save"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                            title="Cancel"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(setting)}
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commission Preview */}
          <div className="p-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Commission Calculator Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {settings.map((setting) => (
                <div key={setting.service} className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">{setting.service}</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Rate: {setting.commission}{setting.unit === '%' ? '%' : '₹'}</div>
                    <div>Range: ₹{setting.minAmount} - ₹{setting.maxAmount.toLocaleString()}</div>
                    <div className="pt-2 border-t border-border/50">
                      Example on ₹1000:
                      <span className="font-semibold text-foreground ml-1">
                        ₹{setting.unit === '%' ? (1000 * setting.commission / 100).toFixed(2) : setting.commission}
                      </span>
                    </div>
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
