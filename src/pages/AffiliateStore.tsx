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
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Types
type StoreSection =
  | "shopping"
  | "travel"
  | "insurance"
  | "bank_account"
  | "credit_cards"
  | "best_deals";

interface StoreItem {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  link: string; // maps to backend 'route'
  section: StoreSection;
}

export const AffiliateStore: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<StoreSection | "all">(
    "all"
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    link: "", // UI field that will be sent as 'route' to backend
    section: "shopping" as StoreSection,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // SAFE URL
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Invalid URL";
    }
  };

  // GET STORES
  const fetchStores = async () => {
    setLoading(true);

    try {
      const res = await fetch(`https://api.new.techember.in/api/affiliate/list`, {
        method: "GET",
        headers: { token: localStorage.getItem("token") || "" },
      });

      if (!res.ok) {
        console.error("Fetch stores returned non-ok status", res.status);
        setLoading(false);
        return;
      }

      const json = await res.json();

      if (json.Status && Array.isArray(json.Data)) {
        const formatted = json.Data.map((item: any) => ({
          id: item.id || item._id,
          name: item.name,
          description: item.description,
          link: item.route || item.link || "", // backend sends 'route'
          imageUrl: item.imageUrl || item.image || "/placeholder.svg",
          section: item.section,
        }));
        setStores(formatted);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error("Fetch stores failed:", err);
      setStores([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // VALIDATION
  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name || !form.name.trim()) e.name = "Store name is required";
    if (!form.description || !form.description.trim())
      e.description = "Description is required";
    if (!form.link || !String(form.link).trim()) e.link = "Link is required";

    if (form.link) {
      try {
        new URL(form.link);
      } catch {
        e.link = "Enter a valid URL";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // CREATE
  const handleCreate = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("route", form.link.trim()); // backend expects 'route'
      formData.append("section", form.section);

      if (form.imageFile) formData.append("image", form.imageFile);

      const res = await fetch(
        "https://api.new.techember.in/api/affiliate/create",
        {
          method: "POST",
          headers: { token: localStorage.getItem("token") || "" },
          body: formData,
        }
      );

      // backend returns json; handle it safely
      const json = await res.json().catch(() => null);
      if (res.ok && json && json.Status) {
        fetchStores();
      } else {
        console.error("Create store failed:", json || res.status);
      }
    } catch (err) {
      console.error("Create store failed:", err);
    }

    closeModal();
  };

  // UPDATE (image optional)
  const handleUpdate = async () => {
    if (!validate() || !editId) return;

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("route", form.link.trim()); // backend expects 'route'
      formData.append("section", form.section);

      // image optional: only append if selected
      if (form.imageFile) formData.append("image", form.imageFile);

      const res = await fetch(
        `https://api.new.techember.in/api/affiliate/update/${editId}`,
        {
          method: "PATCH",
          headers: { token: localStorage.getItem("token") || "" },
          body: formData,
        }
      );

      const json = await res.json().catch(() => null);
      if (res.ok && json && json.Status) {
        fetchStores();
      } else {
        console.error("Update failed:", json || res.status);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }

    closeModal();
  };

  // DELETE
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(
        `https://api.new.techember.in/api/affiliate/remove/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            token: `${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await res.json().catch(() => null);
      if (res.ok && json && json.Status) {
        fetchStores();
      } else {
        console.error("Delete failed:", json || res.status);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (item: StoreItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      imageFile: null,
      link: item.link || "",
      section: item.section || "shopping",
    });
    setErrors({});
    setShowModal(true);
  };

  // OPEN ADD MODAL
  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      name: "",
      description: "",
      imageFile: null,
      link: "",
      section: "shopping",
    });
    setErrors({});
    setShowModal(true);
  };

  // CLOSE
  const closeModal = () => {
    setShowModal(false);
    setErrors({});
    setEditId(null);
  };

  // FILTER
  const filteredStores = stores.filter((store) => {
    const matchSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSection =
      selectedSection === "all" || store.section === selectedSection;

    return matchSearch && matchSection;
  });

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredStores.length);
  const currentItems = filteredStores.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedSection]);

  return (
    <AdminLayout title="Affiliate Stores">
      <div className="p-6">
        <div className="admin-card">
          {/* HEADER */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <h2 className="text-xl font-semibold">Affiliate Stores</h2>

              <button
                onClick={openAddModal}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                NEW STORE
              </button>
            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>

              <div className="sm:w-48">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value as any)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="all">All Sections</option>
                  <option value="shopping">Shopping</option>
                  <option value="travel">Travel</option>
                  <option value="insurance">Insurance</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="credit_cards">Credit Cards</option>
                  <option value="best_deals">Best Deals</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          {loading ? (
            <p className="p-6 text-center">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Section</th>
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
                            alt={item.name}
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                      </td>

                      <td className="font-medium">{item.name}</td>
                      <td className="text-sm text-muted-foreground">
                        {item.description}
                      </td>

                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.section === "bank_account"
                            ? "Bank Account"
                            : item.section === "credit_cards"
                            ? "Credit Cards"
                            : item.section === "best_deals"
                            ? "Best Deals"
                            : item.section.charAt(0).toUpperCase() +
                              item.section.slice(1)}
                        </span>
                      </td>

                      <td>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <LinkIcon className="h-4 w-4" />
                          {getHostname(item.link)}
                        </a>
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
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
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of {filteredStores.length} results
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  <span className="text-sm font-medium px-3">
                    {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{isEditing ? "Edit Store" : "Add New Store"}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-accent rounded">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Store Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full p-3 border rounded-lg ${errors.name ? "border-destructive" : "border-border"}`}
                  placeholder="Store name"
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`w-full p-3 border rounded-lg ${errors.description ? "border-destructive" : "border-border"}`}
                  placeholder="Store description"
                  rows={3}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Section *</label>
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value as StoreSection })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="shopping">Shopping</option>
                  <option value="travel">Travel</option>
                  <option value="insurance">Insurance</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="credit_cards">Credit Cards</option>
                  <option value="best_deals">Best Deals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image Upload (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link (Route) *</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className={`w-full p-3 border rounded-lg ${errors.link ? "border-destructive" : "border-border"}`}
                  placeholder="https://example.com"
                />
                {errors.link && <p className="text-sm text-destructive mt-1">{errors.link}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <button onClick={handleUpdate} className="btn-primary flex-1">Update</button>
              ) : (
                <button onClick={handleCreate} className="btn-primary flex-1">Submit</button>
              )}
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
