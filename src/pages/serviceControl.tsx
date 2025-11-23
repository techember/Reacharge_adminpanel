import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ServiceCard from "@/components/ServiceCard";

interface Service {
  _id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: boolean;
  apiKey?: string;
  provider: string;
  description: string;
  percentageOffer?: number;
  route?: string;
  section?: string;
}

const sectionOptions = ["Finance", "Travel", "Recharge"];

export const ServiceControl = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    percentageOffer: "",
    route: "",
    section: "",
    apiKey: "",
    description: "",
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
    BanknotesIcon,
  };

  const coerceService = (raw: any): Service => {
    const iconValue = raw.icon;
    let iconComponent: React.ComponentType<any> = CogIcon;

    if (typeof iconValue === "string" && iconMap[iconValue]) {
      iconComponent = iconMap[iconValue];
    }

    return {
      _id: String(raw._id), // 👈 FIXED HERE
      name: String(raw.name || raw.serviceName || "Unnamed Service"),
      icon: iconComponent,
      status: Boolean(raw.status),
      apiKey: raw.apiKey,
      provider: raw.provider || "Unknown Provider",
      description: raw.description || "",
      percentageOffer: raw.percentageOffer
        ? Number(raw.percentageOffer)
        : undefined,
      route: raw.route,
      section: raw.section,
    };
  };

  const loadServices = async () => {
    try {
      const response = await fetch(
        "https://api.new.techember.in/api/service/list"
      );

      const data = await response.json();

      console.log("Fetched service data:", data);

      // REAL DATA
      const finance = data?.Data || [];

      const formatted = finance.map(coerceService);
      console.log("Loaded services:", formatted);

      setServices(formatted);
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  useEffect(() => {
    loadServices();
    console.log("Service Control Page Loaded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleService = async (serviceId: string, status: boolean) => {
    try {
      const response = await fetch(
        `https://api.new.techember.in/api/service/${serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ service: name, status: !status }),
        }
      );
      console.log("Toggle response:", response);

      if (!response.ok) {
        throw new Error("Failed to toggle service status");
      }

      // Update local state
      window.location.reload();
    } catch (err) {
      console.error("Error toggling service:", err);
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newService.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (
      !newService.percentageOffer ||
      isNaN(Number(newService.percentageOffer))
    ) {
      newErrors.percentageOffer = "Valid percentage offer is required";
    }

    if (!newService.route.trim()) {
      newErrors.route = "Route is required";
    }

    if (!newService.section) {
      newErrors.section = "Section is required";
    }

    if (!newService.apiKey.trim()) {
      newErrors.apiKey = "API key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = () => {
    if (!validateForm()) return;

    const service: Service = {
      _id: `service_${Date.now()}`,
      name: newService.name.trim(),
      icon: CogIcon,
      status: true,
      apiKey: newService.apiKey.trim(),
      provider: "Custom Provider",
      description: newService.description.trim() || "Custom service",
      percentageOffer: Number(newService.percentageOffer),
      route: newService.route.trim(),
      section: newService.section,
    };

    setServices([...services, service]);
    setShowAddModal(false);
    setNewService({
      name: "",
      percentageOffer: "",
      route: "",
      section: "",
      apiKey: "",
      description: "",
    });
    setErrors({});
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewService({
      name: "",
      percentageOffer: "",
      route: "",
      section: "",
      apiKey: "",
      description: "",
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
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onToggle={toggleService}
                />
              ))}
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
                    <label className="block text-sm font-medium mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.name ? "border-destructive" : "border-border"
                      }`}
                      placeholder="Enter service name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Percentage Offer *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newService.percentageOffer}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          percentageOffer: e.target.value,
                        })
                      }
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.percentageOffer
                          ? "border-destructive"
                          : "border-border"
                      }`}
                      placeholder="Enter percentage offer"
                    />
                    {errors.percentageOffer && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.percentageOffer}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Route *
                    </label>
                    <input
                      type="text"
                      value={newService.route}
                      onChange={(e) =>
                        setNewService({ ...newService, route: e.target.value })
                      }
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.route ? "border-destructive" : "border-border"
                      }`}
                      placeholder="Enter route (e.g., /mobile-recharge)"
                    />
                    {errors.route && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.route}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section *
                    </label>
                    <select
                      value={newService.section}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          section: e.target.value,
                        })
                      }
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.section ? "border-destructive" : "border-border"
                      }`}
                    >
                      <option value="">Select section</option>
                      {sectionOptions.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                    {errors.section && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.section}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      API Key *
                    </label>
                    <input
                      type="text"
                      value={newService.apiKey}
                      onChange={(e) =>
                        setNewService({ ...newService, apiKey: e.target.value })
                      }
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.apiKey ? "border-destructive" : "border-border"
                      }`}
                      placeholder="Enter API key"
                    />
                    {errors.apiKey && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.apiKey}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
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
                  <button onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};