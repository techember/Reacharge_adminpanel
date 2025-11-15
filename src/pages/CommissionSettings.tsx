import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { mockCommissionSettings } from '@/mocks/data';

interface SubService {
  name: string;
  commission: number;
  unit: '%' | 'fixed';
  minAmount: number;
  maxAmount: number;
}

interface CommissionSetting {
  service: string;
  commission: number;
  unit: '%' | 'fixed';
  minAmount: number;
  maxAmount: number;
  subServices?: SubService[];
}

export const CommissionSettings = () => {
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // === Fetch settings ===
  useEffect(() => {
  if (useMock) {
    setSettings(mockCommissionSettings);
  } else {
    axios
      .get(`${apiBaseUrl}/commission-settings`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // ✅ if backend actually returns something, use it
          setSettings(res.data);
        } else {
          // ✅ fallback to mock when backend is empty
          setSettings(mockCommissionSettings);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch settings, using mock', err);
        // ✅ fallback to mock on error
        setSettings(mockCommissionSettings);
      });
  }
}, [useMock, apiBaseUrl]);


  // === Edit handlers ===
  const startEdit = (id: string, data: any) => {
    setEditingId(id);
    setEditForm({ ...data });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = (isSubService = false, parentService?: string) => {
    if (!editForm || !editingId) return;

    setSettings((prev) =>
      prev.map((service) => {
        // Parent service edit
        if (!isSubService && service.service === editingId) {
          return editForm;
        }

        // Sub-service edit
        if (isSubService && service.service === parentService) {
          const updatedSubs = service.subServices?.map((sub) =>
            `${parentService}-${sub.name}` === editingId ? editForm : sub
          );
          return { ...service, subServices: updatedSubs };
        }

        return service;
      })
    );

    setEditingId(null);
    setEditForm(null);
  };

  const updateEditForm = (field: string, value: any) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  const toggleExpand = (service: string) => {
    setExpandedService((prev) => (prev === service ? null : service));
  };

  return (
    <AdminLayout title="Commission Settings">
      <div className="p-6">
        <div className="admin-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <CogIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">
                Service Commission Configuration
              </h2>
            </div>
            <p className="text-muted-foreground mt-2">
              Configure commission rates for each service and its operators.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-left">
                  <th className="p-3">Service</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Min Amount</th>
                  <th className="p-3">Max Amount</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting) => (
                  <React.Fragment key={setting.service}>
                    {/* === Main Row === */}
                    <tr className="border-b hover:bg-muted/10">
                      <td
                        className={`font-medium cursor-pointer ${
                          setting.subServices ? 'hover:text-primary' : ''
                        }`}
                        onClick={() =>
                          setting.subServices && toggleExpand(setting.service)
                        }
                      >
                        {setting.service}
                        {setting.subServices && (
                          <span className="ml-2 text-primary text-sm">
                            {expandedService === setting.service ? '▲' : '▼'}
                          </span>
                        )}
                      </td>

                      {/* Parent service edit cells */}
                      {['commission', 'unit', 'minAmount', 'maxAmount'].map(
                        (field) => (
                          <td className="p-3" key={field}>
                            {editingId === setting.service ? (
                              field === 'unit' ? (
                                <select
                                  value={editForm?.unit || '%'}
                                  onChange={(e) =>
                                    updateEditForm(
                                      'unit',
                                      e.target.value as '%' | 'fixed'
                                    )
                                  }
                                  className="p-1 text-sm border border-border rounded"
                                >
                                  <option value="%">Percentage (%)</option>
                                  <option value="fixed">Fixed (₹)</option>
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  value={editForm?.[field] || 0}
                                  onChange={(e) =>
                                    updateEditForm(
                                      field,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 p-1 text-sm border border-border rounded"
                                />
                              )
                            ) : (
                              <span>
                                {field === 'unit'
                                  ? setting.unit === '%'
                                    ? 'Percentage'
                                    : 'Fixed'
                                  : field === 'commission'
                                  ? setting[field]
                                  : `₹${setting[field]}`}
                              </span>
                            )}
                          </td>
                        )
                      )}

                      <td className="p-3 text-center">
                        {editingId === setting.service ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => saveEdit(false)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Save"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(setting.service, setting)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit Service"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* === Sub-Service Rows === */}
                    {expandedService === setting.service &&
                      setting.subServices?.map((sub) => (
                        <tr
                          key={sub.name}
                          className="bg-muted/10 border-t hover:bg-muted/20 grid grid-cols-6 items-center"
                          style={{
                            gridTemplateColumns:
                              '1.5fr 1fr 1fr 1fr 1fr 0.5fr',
                          }}
                        >
                          <div className="pl-10 text-sm font-medium text-gray-800">
                            {sub.name}
                          </div>

                          {['commission', 'unit', 'minAmount', 'maxAmount'].map(
                            (field) => (
                              <div className="p-3" key={field}>
                                {editingId ===
                                `${setting.service}-${sub.name}` ? (
                                  field === 'unit' ? (
                                    <select
                                      value={editForm?.unit || '%'}
                                      onChange={(e) =>
                                        updateEditForm(
                                          'unit',
                                          e.target.value as '%' | 'fixed'
                                        )
                                      }
                                      className="p-1 text-sm border border-border rounded"
                                    >
                                      <option value="%">Percentage (%)</option>
                                      <option value="fixed">Fixed (₹)</option>
                                    </select>
                                  ) : (
                                    <input
                                      type="number"
                                      value={editForm?.[field] || 0}
                                      onChange={(e) =>
                                        updateEditForm(
                                          field,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 p-1 text-sm border border-border rounded"
                                    />
                                  )
                                ) : (
                                  <span>
                                    {field === 'unit'
                                      ? sub.unit === '%'
                                        ? 'Percentage'
                                        : 'Fixed'
                                      : field === 'commission'
                                      ? sub[field]
                                      : `₹${sub[field]}`}
                                  </span>
                                )}
                              </div>
                            )
                          )}

                          <div className="text-right pr-4">
                            {editingId ===
                            `${setting.service}-${sub.name}` ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() =>
                                    saveEdit(true, setting.service)
                                  }
                                  className="p-1 text-green-600 hover:bg-green-100 rounded transition"
                                  title="Save"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                                  title="Cancel"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  startEdit(
                                    `${setting.service}-${sub.name}`,
                                    sub
                                  )
                                }
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                                title="Edit Sub-Service"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
