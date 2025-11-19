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

const sectionOptions = ["Top", "Middle", "Bottom", "Sidebar"];

export const Banner: React.FC = () => {
  const useMock =
    (import.meta.env.VITE_USE_MOCK_AUTH || "false").toLowerCase() === "true";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editBanner, setEditBanner] = useState<BannerItem | null>(null);

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

  // ---------------- FETCH BANNERS --------------------
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`https://api.new.techember.in/api/banner/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token ? token : "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch banners");

        const data = await res.json();
        if (data?.Status && Array.isArray(data.Data)) {
          setBanners(data.Data);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, [apiBaseUrl]);

  const totalPages = Math.ceil(banners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, banners.length);
  const currentItems = banners.slice(startIndex, endIndex);

  // ---------------- DELETE --------------------
  const handleDelete = async (id: string) => {
    if (useMock) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://api.new.techember.in/api/banner/delete/${id}`, {
        method: "DELETE",
        headers: {
          token: token ? token : "",
        },
      });

      if (!res.ok) throw new Error("Failed to delete banner");

      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting banner:", error);
    }

    if (startIndex >= banners.length - 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  // ---------------- OPEN EDIT MODAL --------------------
  const handleEditClick = (item: BannerItem) => {
    setEditBanner(item);
    setShowEditModal(true);
  };

  // ---------------- UPDATE BANNER (PATCH) --------------------
  const handleUpdate = async () => {
    if (!editBanner) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`https://api.new.techember.in/api/banner/update/${editBanner.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: token ? token : "",
        },
        body: JSON.stringify({
          type: editBanner.type,
          link: editBanner.link,
        }),
      });

      if (!res.ok) throw new Error("Failed to update banner");

      const data = await res.json();

      if (data?.Status) {
        setBanners((prev) =>
          prev.map((b) =>
            b.id === editBanner.id
              ? { ...b, type: editBanner.type, link: editBanner.link }
              : b
          )
        );
      }
    } catch (error) {
      console.error("Error updating banner:", error);
    }

    setShowEditModal(false);
  };

  // ---------------- VALIDATIONS & CREATE --------------------
  const validate = () => {
    const e: Record<string, string> = {};
    if (!newBanner.section) e.section = "Section is required";
    if (!newBanner.type.trim()) e.type = "Type is required";
    if (!newBanner.link.trim()) e.link = "Link is required";

    try {
      new URL(newBanner.link);
    } catch {
      e.link = "Enter a valid URL";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (useMock) {
      const item: BannerItem = {
        id: `banner_${Date.now()}`,
        imageUrl: "/placeholder.svg",
        section: newBanner.section,
        type: newBanner.type.trim(),
        link: newBanner.link.trim(),
      };

      setBanners((prev) => [item, ...prev]);
      setShowAddModal(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (newBanner.imageFile)
        formData.append("image", newBanner.imageFile);
      formData.append("section", newBanner.section);
      formData.append("type", newBanner.type.trim());
      formData.append("link", newBanner.link.trim());

      const res = await fetch(`https://api.new.techember.in/api/banner/create`, {
        method: "POST",
        headers: { token: token ? token : "" },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create banner");

      const data = await res.json();

      if (data?.Status && data?.Data) {
        setBanners((prev) => [data.Data, ...prev]);
      }
    } catch (error) {
      console.error("Error adding banner:", error);
    }

    setShowAddModal(false);
    setNewBanner({ imageFile: null, section: "", type: "", link: "" });
  };

  // ---------------- UI --------------------
  return (
    <AdminLayout title="Banners">
      <div className="p-6">
        <div className="admin-card">
          <div className="p-6 border-b border-border flex justify-between">
            <h2 className="text-xl font-semibold">Banners</h2>
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              NEW BANNER
            </button>
          </div>

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
                      <img src={item.imageUrl} className="h-10 w-10 rounded object-cover" />
                    </td>
                    <td>{item.section}</td>
                    <td>{item.type}</td>
                    <td>
                      <a href={item.link} target="_blank" className="text-primary underline">
                        {new URL(item.link).hostname}
                      </a>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
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
            <div className="p-6 border-t border-border flex justify-between">
              <p className="text-sm">
                Showing {startIndex + 1} to {endIndex} of {banners.length}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                <span>{currentPage} / {totalPages}</span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      {showEditModal && editBanner && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Edit Banner</h3>
              <button onClick={() => setShowEditModal(false)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editBanner.type}
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, type: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Link</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editBanner.link}
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, link: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleUpdate} className="btn-primary flex-1">
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
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
