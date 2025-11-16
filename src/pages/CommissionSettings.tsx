import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  CogIcon,
} from '@heroicons/react/24/outline';


interface SubService {
  name: string;
  commission: number;
  icon?: string;
  status?: boolean;
  _id?: string;
}

interface CommissionSetting {
  service: string;
  commission: number;
  subServices?: SubService[];
  _id?: string;
}

export const CommissionSettings = () => {
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newService, setNewService] = useState<boolean>(false);
  const [newSubService, setNewSubService] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // ===== Transform API response to component format =====
  const transformApiData = (apiData: any): CommissionSetting[] => {
    const transformed: CommissionSetting[] = [];

    // Iterate through each service category (mobile, dth, bbps)
    Object.keys(apiData).forEach((category) => {
      const operators = apiData[category];
      const subServices: SubService[] = [];

      // Convert each operator to a sub-service
      Object.keys(operators).forEach((operatorName) => {
        const operator = operators[operatorName];
        subServices.push({
          name: operatorName,
          commission: operator.commission,
          icon: operator.icon,
          status: operator.status,
          _id: operator._id,
        });
      });

      // Create service entry with sub-services
      transformed.push({
        service: category.toUpperCase(), // mobile -> MOBILE
        commission: 0, // Parent level commission
        subServices: subServices,
      });
    });

    return transformed;
  };

  // ===== Fetch settings with async/await =====
  useEffect(() => {
    const fetchCommissionSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://api.new.techember.in/api/commission/admin/list?page=1&limit=20`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': `${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Check if API returned success
        if (result.Error === false && result.Status === true && result.Data) {
          const transformedData = transformApiData(result.Data);
          setSettings(transformedData);
        } else {
          throw new Error(result.Remarks || 'Invalid API response');
        }
      } catch (err) {
        console.error('Error fetching commission settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionSettings();
  }, [apiBaseUrl]);

  // ===== Save settings to API =====
  const saveToApi = async (updatedSettings: CommissionSetting[]) => {
    try {
      const response = await fetch(`${apiBaseUrl}/commission-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const result = await response.json();
      console.log('Settings saved successfully:', result);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  };

  // ===== Create new commission =====
  const createCommission = async (commission: string, name: string, operatorType: string, icon: File | null) => {
    try {
      const formData = new FormData();
      formData.append('commission', commission);
      formData.append('name', name);
      formData.append('operatorType', operatorType);
      
      if (icon) {
        formData.append('icon', icon);
      }

      const response = await fetch(`https://api.new.techember.in/api/commission/create`, {
        method: 'POST',
        headers: {
          'token': `${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Error === false && result.Status === true) {
        console.log('Commission created successfully:', result);
        // Refresh the commission settings after creation
        const fetchResponse = await fetch(`https://api.new.techember.in/api/commission/admin/list?page=1&limit=20`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': `${localStorage.getItem("token")}`,
          },
        });

        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          if (fetchResult.Error === false && fetchResult.Status === true && fetchResult.Data) {
            const transformedData = transformApiData(fetchResult.Data);
            setSettings(transformedData);
          }
        }
        
        return true;
      } else {
        throw new Error(result.Remarks || 'Failed to create commission');
      }
    } catch (err) {
      console.error('Error creating commission:', err);
      setError(err instanceof Error ? err.message : 'Failed to create commission');
      return false;
    }
  };

  // ===== Update existing commission =====
  const updateCommission = async (id: string, commission: string, name: string, operatorType: string, icon: File | null) => {
    try {
      const formData = new FormData();
      formData.append('commission', commission);
      formData.append('name', name);
      formData.append('operatorType', operatorType);
      
      if (icon) {
        formData.append('icon', icon);
      }

      const response = await fetch(`https://api.new.techember.in/api/commission/update/${id}`, {
        method: 'PUT',
        headers: {
          'token': `${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Error === false && result.Status === true) {
        console.log('Commission updated successfully:', result);
        // Refresh the commission settings after update
        const fetchResponse = await fetch(`https://api.new.techember.in/api/commission/admin/list?page=1&limit=20`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': `${localStorage.getItem("token")}`,
          },
        });

        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          if (fetchResult.Error === false && fetchResult.Status === true && fetchResult.Data) {
            const transformedData = transformApiData(fetchResult.Data);
            setSettings(transformedData);
          }
        }
        
        return true;
      } else {
        throw new Error(result.Remarks || 'Failed to update commission');
      }
    } catch (err) {
      console.error('Error updating commission:', err);
      setError(err instanceof Error ? err.message : 'Failed to update commission');
      return false;
    }
  };

  
  // ===== Delete commission =====
  const deleteCommission = async (id: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/commission/delete/${id}`, {
        method: 'DELETE',
        headers: { 'token': `${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete commission");
      const result = await response.json();
      console.log("Deleted:", result);
      // refresh
      const res2 = await fetch(`https://api.new.techember.in/api/commission/admin/list?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': `${localStorage.getItem("token")}`,
        },
      });
      if (res2.ok){
        const r2 = await res2.json();
        if(!r2.Error && r2.Status && r2.Data){
          setSettings(transformApiData(r2.Data));
        }
      }
    } catch(err){
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };


  // ===============================
  // EDIT HANDLERS
  // ===============================
  const startEdit = (id: string, data: any) => {
    setEditingId(id);
    setEditForm({ ...data });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setNewService(false);
    setNewSubService(null);
    setIconFile(null);
  };

  const saveEdit = async (isSubService = false, parentService?: string) => {
    if (!editForm) return;

    let updatedSettings: CommissionSetting[] = [];

    if (newService) {
      // Use the new create commission API
      const success = await createCommission(
        editForm.commission?.toString() || '0',
        editForm.service || '',
        editForm.operatorType || 'mobile',
        iconFile
      );
      
      if (success) {
        cancelEdit();
      }
      return;
    }

    if (newSubService) {
      updatedSettings = settings.map((service) =>
        service.service === parentService
          ? {
              ...service,
              subServices: [...(service.subServices || []), editForm],
            }
          : service
      );
      setSettings(updatedSettings);
      await saveToApi(updatedSettings);
      cancelEdit();
      return;
    }

    // Handle updating sub-service (operator) with _id
    if (isSubService && parentService) {
      const service = settings.find(s => s.service === parentService);
      const subService = service?.subServices?.find(sub => 
        `${parentService}-${sub.name}` === editingId
      );
      
      if (subService && subService._id) {
        const success = await updateCommission(
          subService._id,
          editForm.commission?.toString() || '0',
          editForm.name || subService.name,
          parentService.toLowerCase(),
          iconFile
        );
        
        if (success) {
          cancelEdit();
        }
        return;
      }
    }

    // Fallback to old update method for services without _id
    updatedSettings = settings.map((service) => {
      if (!isSubService && service.service === editingId) {
        return editForm;
      }

      if (isSubService && service.service === parentService) {
        const updatedSubs = service.subServices?.map((sub) =>
          `${parentService}-${sub.name}` === editingId ? editForm : sub
        );
        return { ...service, subServices: updatedSubs };
      }

      return service;
    });

    setSettings(updatedSettings);
    await saveToApi(updatedSettings);
    cancelEdit();
  };

  const updateEditForm = (field: string, value: any) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  // ===============================
  // DELETE HANDLERS
  // ===============================

  const deleteService = async (serviceName: string) => {
    const updatedSettings = settings.filter(
      (service) => service.service !== serviceName
    );
    setSettings(updatedSettings);
    await saveToApi(updatedSettings);
  };

  
  const deleteSubService = async (parent: string, subName: string) => {
    const parentService = settings.find(s => s.service === parent);
    const sub = parentService?.subServices?.find(s => s.name === subName);
    if(sub && sub._id){
      await deleteCommission(sub._id);
      return;
    }
    const updatedSettings = settings.map((service) =>
      service.service === parent
        ? {
            ...service,
            subServices: service.subServices?.filter(
              (sub) => sub.name !== subName
            ),
          }
        : service
    );
    setSettings(updatedSettings);
    await saveToApi(updatedSettings);
  };


  // ===============================
  // EXPAND SERVICE
  // ===============================

  const toggleExpand = (service: string) => {
    setExpandedService((prev) => (prev === service ? null : service));
  };

  // ===============================
  // RENDER PAGE
  // ===============================

  if (loading) {
    return (
      <AdminLayout title="Commission Settings">
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading commission settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Commission Settings">
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="admin-card">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CogIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">
                Service Commission Configuration
              </h2>
            </div>

            {/* ADD SERVICE BUTTON */}
            <button
              className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded text-sm"
              onClick={() => {
                setNewService(true);
                setEditForm({
                  service: '',
                  commission: 0,
                  operatorType: 'mobile',
                  subServices: [],
                });
                setIconFile(null);
              }}
            >
              <PlusIcon className="h-4 w-4" /> Add Service
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-left">
                  <th className="p-3">Service</th>
                  <th className="p-3">Operator Type</th>
                  <th className="p-3">Commission (%)</th>
                  <th className="p-3">Icon</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* NEW SERVICE FORM */}
                {newService && (
                  <tr className="bg-muted/10">
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Service name"
                        className="p-1 border rounded w-full"
                        onChange={(e) => updateEditForm('service', e.target.value)}
                      />
                    </td>

                    <td className="p-3">
                      <select
                        className="p-1 border rounded w-full"
                        value={editForm?.operatorType || 'mobile'}
                        onChange={(e) => updateEditForm('operatorType', e.target.value)}
                      >
                        <option value="mobile">Mobile</option>
                        <option value="dth">DTH</option>
                        <option value="bbps">BBPS</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        placeholder="Commission %"
                        className="p-1 border rounded"
                        onChange={(e) =>
                          updateEditForm('commission', Number(e.target.value))
                        }
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="p-1 border rounded text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIconFile(file);
                          }
                        }}
                      />
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() => saveEdit(false)}
                          className="text-green-600 p-1 hover:bg-green-100 rounded"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="text-red-600 p-1 hover:bg-red-100 rounded"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* EXISTING SERVICES */}
                {settings.map((setting) => (
                  <React.Fragment key={setting.service}>
                    <tr className="border-b hover:bg-muted/10">
                      <td
                        className={`p-3 font-medium cursor-pointer ${
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

                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {setting.service.toLowerCase()}
                        </span>
                      </td>

                      {/* Editable fields */}
                      <td className="p-3">
                        {editingId === setting.service ? (
                          <input
                            type="number"
                            value={editForm?.commission || 0}
                            onChange={(e) =>
                              updateEditForm(
                                'commission',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 p-1 text-sm border rounded"
                          />
                        ) : (
                          <span>{setting.commission}%</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">-</span>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          {editingId === setting.service ? (
                            <>
                              <button
                                onClick={() => saveEdit(false)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(setting.service, setting)}
                                className="p-1 text-blue-600 hover:bg-blue-200 rounded"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>

                              {/* DELETE SERVICE */}
                              <button
                                onClick={() => deleteService(setting.service)}
                                className="p-1 text-red-600 hover:bg-red-200 rounded"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>

                              {/* ADD SUB-SERVICE */}
                              <button
                                onClick={() => {
                                  setNewSubService(setting.service);
                                  setEditForm({
                                    name: '',
                                    commission: 0,
                                  });
                                }}
                                className="p-1 text-green-600 hover:bg-green-200 rounded"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* ADD SUB-SERVICE ROW */}
                    {newSubService === setting.service && (
                      <tr className="bg-muted/10">
                        <td className="p-3 pl-10">
                          <input
                            className="p-1 border rounded w-full"
                            placeholder="Sub-service name"
                            onChange={(e) => updateEditForm('name', e.target.value)}
                          />
                        </td>

                        <td className="p-3">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            placeholder="Commission %"
                            onChange={(e) =>
                              updateEditForm('commission', Number(e.target.value))
                            }
                            className="border p-1 rounded"
                          />
                        </td>

                        <td className="p-3">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => saveEdit(true, setting.service)}
                              className="text-green-600 hover:bg-green-100 p-1 rounded"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* SUB-SERVICES */}
                    {expandedService === setting.service &&
                      setting.subServices?.map((sub) => (
                        <tr
                          key={sub.name}
                          className="bg-muted/10 border-t hover:bg-muted/20"
                        >
                          <td className="p-3 pl-10 font-medium">
                            {sub.name}
                          </td>

                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">-</span>
                          </td>

                          <td className="p-3">
                            {editingId === `${setting.service}-${sub.name}` ? (
                              <input
                                type="number"
                                value={editForm?.commission}
                                onChange={(e) =>
                                  updateEditForm('commission', Number(e.target.value))
                                }
                                className="border p-1 rounded w-20"
                              />
                            ) : (
                              <span>{sub.commission}%</span>
                            )}
                          </td>

                          <td className="p-3">
                            {editingId === `${setting.service}-${sub.name}` ? (
                              <input
                                type="file"
                                accept="image/*"
                                className="p-1 border rounded text-xs"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setIconFile(file);
                                  }
                                }}
                              />
                            ) : (
                              sub.icon && (
                                <img
                                  src={`${apiBaseUrl}/${sub.icon}`}
                                  alt={sub.name}
                                  className="h-6 w-6 object-contain"
                                />
                              )
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              {editingId === `${setting.service}-${sub.name}` ? (
                                <>
                                  <button
                                    onClick={() => saveEdit(true, setting.service)}
                                    className="text-green-600 p-1 hover:bg-green-200 rounded"
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 p-1 hover:bg-red-200 rounded"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      startEdit(`${setting.service}-${sub.name}`, sub)
                                    }
                                    className="text-blue-600 p-1 hover:bg-blue-200 rounded"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() =>
                                      deleteSubService(setting.service, sub.name)
                                    }
                                    className="text-red-600 p-1 hover:bg-red-200 rounded"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
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