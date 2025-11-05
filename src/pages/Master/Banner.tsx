import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface BannerItem {
  id: string;
  imageUrl: string;
  section: string;
  type: string;
  link: string;
}

const mockBanners: BannerItem[] = Array.from({ length: 22 }).map((_, i) => ({
  id: `banner_${i + 1}`,
  imageUrl: "/placeholder.svg",
  section: ["Top", "Middle", "Bottom", "Sidebar"][i % 4],
  type: ["Image", "Carousel", "Popup"][i % 3],
  link: "https://example.com/banner",
}));

const sectionOptions = ["Top", "Middle", "Bottom", "Sidebar"];

export const Banner: React.FC = () => {
  const useMock =
    (import.meta.env.VITE_USE_MOCK_AUTH || "false").toLowerCase() === "true";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBanner, setNewBanner] = useState<{
    imageFile?: File | null;
    section: string;
    type: string;
    link: string;
  }>({
    imageFile: null,
    section: "",
    type: "",
    link: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Fetch banners from backend or mock
  useEffect(() => {
    if (useMock) {
      setBanners(mockBanners);
    } else {
      fetch(`${apiBaseUrl}/banners`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch banners");
          return res.json();
        })
        .then((data) => setBanners(data))
        .catch((err) => console.error("Error fetching banners:", err));
    }
  }, [useMock, apiBaseUrl]);

  const totalPages = Math.ceil(banners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, banners.length);
  const currentItems = banners.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    if (useMock) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } else {
      fetch(`${apiBaseUrl}/banners/${id}`, { method: "DELETE" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to delete banner");
          setBanners((prev) => prev.filter((b) => b.id !== id));
        })
        .catch((err) => console.error("Error deleting banner:", err));
    }

    if (startIndex >= banners.length - 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!newBanner.section) e.section = "Section is required";
    if (!newBanner.type.trim()) e.type = "Type is required";
    if (!newBanner.link.trim()) e.link = "Link is required";
    try {
      if (newBanner.link) new URL(newBanner.link);
    } catch {
      e.link = "Enter a valid URL";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const imageUrl = newBanner.imageFile
      ? URL.createObjectURL(newBanner.imageFile)
      : "/placeholder.svg";

    const item: BannerItem = {
      id: `banner_${Date.now()}`,
      imageUrl,
      section: newBanner.section,
      type: newBanner.type.trim(),
      link: newBanner.link.trim(),
    };

    if (useMock) {
      setBanners((prev) => [item, ...prev]);
    } else {
      fetch(`${apiBaseUrl}/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to add banner");
          return res.json();
        })
        .then((data) => setBanners((prev) => [data, ...prev]))
        .catch((err) => console.error("Error adding banner:", err));
    }

    setShowAddModal(false);
    setNewBanner({ imageFile: null, section: "", type: "", link: "" });
    setErrors({});
  };

  return (
    <AdminLayout title="Banners">
      <div className="p-6">
        <div className="admin-card">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <h2 className="text-xl font-semibold">Banners</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                 NEW BANNER
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Section</th>
                  <th>Type</th>
                  <th>Link</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="h-10 w-10 rounded overflow-hidden bg-accent flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={`${item.section} ${item.type}`}
                          className="h-10 w-10 object-cover"
                        />
                      </div>
                    </td>
                    <td className="font-medium">{item.section}</td>
                    <td>{item.type}</td>
                    <td>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {new URL(item.link).hostname}
                      </a>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of {banners.length}{" "}
                  results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium px-3">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add New Banner</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewBanner({
                      ...newBanner,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full p-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Section *
                </label>
                <select
                  value={newBanner.section}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, section: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.section ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="">Select section</option>
                  {sectionOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
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
                <label className="block text-sm font-medium mb-2">Type *</label>
                <input
                  type="text"
                  value={newBanner.type}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, type: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.type ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Image, Carousel, Popup, etc."
                />
                {errors.type && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link *</label>
                <input
                  type="url"
                  value={newBanner.link}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, link: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.link ? "border-destructive" : "border-border"
                  }`}
                  placeholder="https://example.com"
                />
                {errors.link && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.link}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="btn-primary flex-1">
                Submit
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

