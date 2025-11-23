import React from "react";

interface Props {
  service: any;
  onToggle: (name: string, status: boolean) => void;
}

const ServiceCard: React.FC<Props> = ({ service, onToggle }) => {
  const IconComponent = service.icon;
  return (
    <div className="border border-border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
              service.status
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-semibold text-lg">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.description}</p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(service.id, service.status)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
            service.status ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
              service.status ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span
            className={`font-medium ${
              service.status ? "text-green-600" : "text-gray-500"
            }`}
          >
            {service.status ? "Active" : "Inactive"}
          </span>
        </div>

        {service.percentageOffer && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Offer</span>
            <span className="font-medium">{service.percentageOffer}%</span>
          </div>
        )}

        {service.section && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Section</span>
            <span className="font-medium">{service.section}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;