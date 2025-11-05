import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  CogIcon, 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon,
  WifiIcon,
  BanknotesIcon,
  PhoneIcon,
  TvIcon,
  BoltIcon,
  FireIcon,
  MapIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Service {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  active: boolean;
  apiKey?: string;
  provider: string;
  description: string;
  percentageOffer?: number;
  route?: string;
  section?: string;
}

const initialServices: Service[] = [
  {
    id: 'mobile',
    name: 'Mobile Recharge',
    icon: PhoneIcon,
    active: true,
    apiKey: 'sk_live_****7890',
    provider: 'Airtel API',
    description: 'Prepaid mobile recharge services',
    percentageOffer: 2.5,
    route: '/mobile-recharge',
    section: 'Recharge'
  },
  {
    id: 'dth',
    name: 'DTH Recharge',
    icon: TvIcon,
    active: true,
    apiKey: 'sk_live_****5432',
    provider: 'Dish TV API',
    description: 'Direct-to-Home television recharge',
    percentageOffer: 3.0,
    route: '/dth-recharge',
    section: 'Recharge'
  },
  {
    id: 'electricity',
    name: 'Electricity Bill',
    icon: BoltIcon,
    active: false,
    provider: 'State Electricity Board',
    description: 'Electricity bill payment services',
    percentageOffer: 1.5,
    route: '/electricity-bill',
    section: 'Finance'
  },
  {
    id: 'gas',
    name: 'LPG Booking',
    icon: FireIcon,
    active: true,
    apiKey: 'sk_live_****9876',
    provider: 'Indian Oil API',
    description: 'LPG gas cylinder booking',
    percentageOffer: 2.0,
    route: '/lpg-booking',
    section: 'Finance'
  },
  {
    id: 'travel',
    name: 'Travel Booking',
    icon: MapIcon,
    active: false,
    provider: 'Travel Partner API',
    description: 'Bus and flight booking services',
    percentageOffer: 5.0,
    route: '/travel-booking',
    section: 'Travel'
  }
];

const sectionOptions = ['Finance', 'Travel', 'Recharge'];

export const ServiceControl = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    percentageOffer: '',
    route: '',
    section: '',
    apiKey: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const iconMap: Record<string, React.ComponentType<any>> = {
    PhoneIcon,
    TvIcon,
    BoltIcon,
    FireIcon,
    MapIcon,
    CogIcon,
    WifiIcon,
    BanknotesIcon
  };

  const coerceService = (raw: any): Service => {
    const iconValue = raw.icon;
    let iconComponent: React.ComponentType<any> = CogIcon;
    if (typeof iconValue === 'string' && iconMap[iconValue]) {
      iconComponent = iconMap[iconValue];
    } else if (iconValue && typeof iconValue === 'function') {
      iconComponent = iconValue as React.ComponentType<any>;
    }
    return {
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      icon: iconComponent,
      active: Boolean(raw.active),
      apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : undefined,
      provider: String(raw.provider ?? 'Unknown Provider'),
      description: String(raw.description ?? ''),
      percentageOffer: raw.percentageOffer != null ? Number(raw.percentageOffer) : undefined,
      route: typeof raw.route === 'string' ? raw.route : undefined,
      section: typeof raw.section === 'string' ? raw.section : undefined
    };
  };

  const loadServices = async (): Promise<Service[]> => {
    try {
      const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true';
      if (useMock) {
        return initialServices;
      }
      const response = await fetch('/api/services', { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid services payload');
      }
      return data.map(coerceService);
    } catch (error) {
      console.error('Error loading services, falling back to mock:', error);
      return initialServices;
    }
  };

  useEffect(() => {
    loadServices().then(setServices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleService = (serviceId: string) => {
    setServices(services.map(service =>
      service.id === serviceId 
        ? { ...service, active: !service.active }
        : service
    ));
  };

  const startEditingApiKey = (serviceId: string, currentKey: string = '') => {
    setEditingService(serviceId);
    setApiKeyInput(currentKey);
  };

  const saveApiKey = () => {
    if (editingService && apiKeyInput.trim()) {
      setServices(services.map(service =>
        service.id === editingService 
          ? { ...service, apiKey: apiKeyInput.trim() }
          : service
      ));
      setEditingService(null);
      setApiKeyInput('');
    }
  };

  const cancelEditing = () => {
    setEditingService(null);
    setApiKeyInput('');
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '****' + key.substring(key.length - 4);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newService.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (!newService.percentageOffer || isNaN(Number(newService.percentageOffer))) {
      newErrors.percentageOffer = 'Valid percentage offer is required';
    }
    
    if (!newService.route.trim()) {
      newErrors.route = 'Route is required';
    }
    
    if (!newService.section) {
      newErrors.section = 'Section is required';
    }
    
    if (!newService.apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = () => {
    if (!validateForm()) return;
    
    const service: Service = {
      id: `service_${Date.now()}`,
      name: newService.name.trim(),
      icon: CogIcon,
      active: true,
      apiKey: newService.apiKey.trim(),
      provider: 'Custom Provider',
      description: newService.description.trim() || 'Custom service',
      percentageOffer: Number(newService.percentageOffer),
      route: newService.route.trim(),
      section: newService.section
    };
    
    setServices([...services, service]);
    setShowAddModal(false);
    setNewService({
      name: '',
      percentageOffer: '',
      route: '',
      section: '',
      apiKey: '',
      description: ''
    });
    setErrors({});
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewService({
      name: '',
      percentageOffer: '',
      route: '',
      section: '',
      apiKey: '',
      description: ''
    });
    setErrors({});
  };

  return (
    <AdminLayout title="Service Control">
      <div className="p-6">
        <div className="admin-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CogIcon className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Service Management</h2>
                  <p className="text-muted-foreground mt-1">
                    Activate/deactivate services and configure API keys
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                 ADD SERVICE
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div key={service.id} className="border border-border rounded-lg p-6">
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          service.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleService(service.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          service.active ? 'bg-success' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            service.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium">{service.provider}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-medium ${
                          service.active ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {service.percentageOffer && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Offer:</span>
                          <span className="font-medium">{service.percentageOffer}%</span>
                        </div>
                      )}

                      {service.section && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Section:</span>
                          <span className="font-medium">{service.section}</span>
                        </div>
                      )}

                      {/* API Key Configuration */}
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <KeyIcon className="h-4 w-4" />
                            API Key
                          </span>
                          {service.apiKey && (
                            <button
                              onClick={() => setShowApiKey(
                                showApiKey === service.id ? null : service.id
                              )}
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              {showApiKey === service.id ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {editingService === service.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={apiKeyInput}
                              onChange={(e) => setApiKeyInput(e.target.value)}
                              placeholder="Enter API key..."
                              className="w-full p-2 text-sm border border-border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveApiKey}
                                disabled={!apiKeyInput.trim()}
                                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="btn-secondary text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {service.apiKey ? (
                              <>
                                <code className="flex-1 text-sm bg-muted p-2 rounded font-mono">
                                  {showApiKey === service.id ? service.apiKey : maskApiKey(service.apiKey)}
                                </code>
                                <button
                                  onClick={() => startEditingApiKey(service.id, service.apiKey)}
                                  className="btn-secondary text-sm"
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditingApiKey(service.id)}
                                className="btn-primary text-sm"
                              >
                                Configure API Key
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Status Summary */}
          <div className="p-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Service Status Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {services.filter(s => s.active).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {services.filter(s => !s.active).length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {services.filter(s => s.apiKey).length}
                </div>
                <div className="text-sm text-muted-foreground">Configured APIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {services.filter(s => s.active && !s.apiKey).length}
                </div>
                <div className="text-sm text-muted-foreground">Need Configuration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add New Service</h3>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-accent rounded"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Name *</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      errors.name ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter service name"
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Percentage Offer *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newService.percentageOffer}
                    onChange={(e) => setNewService({ ...newService, percentageOffer: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      errors.percentageOffer ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter percentage offer"
                  />
                  {errors.percentageOffer && <p className="text-sm text-destructive mt-1">{errors.percentageOffer}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Route *</label>
                  <input
                    type="text"
                    value={newService.route}
                    onChange={(e) => setNewService({ ...newService, route: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      errors.route ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter route (e.g., /mobile-recharge)"
                  />
                  {errors.route && <p className="text-sm text-destructive mt-1">{errors.route}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Section *</label>
                  <select
                    value={newService.section}
                    onChange={(e) => setNewService({ ...newService, section: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      errors.section ? 'border-destructive' : 'border-border'
                    }`}
                  >
                    <option value="">Select section</option>
                    {sectionOptions.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  {errors.section && <p className="text-sm text-destructive mt-1">{errors.section}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">API Key *</label>
                  <input
                    type="text"
                    value={newService.apiKey}
                    onChange={(e) => setNewService({ ...newService, apiKey: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      errors.apiKey ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter API key"
                  />
                  {errors.apiKey && <p className="text-sm text-destructive mt-1">{errors.apiKey}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter service description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddService}
                  className="btn-primary flex-1"
                >
                  Add Service
                </button>
                <button
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
