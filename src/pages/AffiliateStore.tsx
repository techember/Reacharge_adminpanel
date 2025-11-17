import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  EyeIcon,
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
  link: string;
  section: StoreSection;
}

// Env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AffiliateStore: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    StoreSection | "all"
  >("all");

  const [newStore, setNewStore] = useState<{
    name: string;
    description: string;
    imageFile?: File | null;
    link: string;
    section: StoreSection;
  }>({
    name: "",
    description: "",
    imageFile: null,
    link: "",
    section: "shopping",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // -----------------------------
  // REAL GET REQUEST (async/await)
  // -----------------------------
  const fetchStores = async () => {
    setLoading(true);

    try {
      const res = await fetch(`https://api.new.techember.in/api/affiliate/list`, {
        method: "GET",
        headers: {
          "token": localStorage.getItem("token") || "",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch stores");

      const json = await res.json();

      if (!json.Status) {
        console.error("API error:", json.Remarks);
        setStores([]);
        return;
      }

      const apiStores = json.Data || [];

      const formatted = apiStores.map((item: any) => ({
        id: item.id || item._id,
        name: item.name,
        description: item.description,
        link: item.link,
        imageUrl: item.imageUrl || item.image || "/placeholder.svg",
        section: item.section,
      }));

      setStores(formatted);
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchStores();
  }, []);

  // -------------------------------------
// PATCH - UPDATE STORE (async/await)
// -------------------------------------
  const handleUpdate = async (id: string) => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("name", newStore.name.trim());
      formData.append("description", newStore.description.trim());
      formData.append("link", newStore.link.trim());
      formData.append("section", newStore.section);

      // Only append image if user selected a new one
      if (newStore.imageFile) {
        formData.append("image", newStore.imageFile);
      }

      const res = await fetch(
        `https://api.new.techember.in/api/affiliate/update/${id}`,
        {
          method: "PATCH",
          headers: {
            token: localStorage.getItem("token") || "",
          },
          body: formData, // IMPORTANT: Do NOT set Content-Type manually
        }
      );

      if (!res.ok) throw new Error("Failed to update store");

      fetchStores(); // reload updated list
    } catch (err) {
      console.error("Update store failed:", err);
    }

    // Reset modal state
    setShowAddModal(false);
    setNewStore({
      name: "",
      description: "",
      imageFile: null,
      link: "",
      section: "shopping",
    });
    setErrors({});
  };


  // Filter + pagination
  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSection =
      selectedSection === "all" || store.section === selectedSection;

    return matchesSearch && matchesSection;
  });

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredStores.length);
  const currentItems = filteredStores.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSection]);

  // -----------------------------
  // DELETE STORE
  // -----------------------------
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`https://api.new.techember.in/api/affiliate/remove/${id}`, {
        method: "DELETE",
        headers: {
          "token": localStorage.getItem("token") || "",
        },
      });

      if (!res.ok) throw new Error("Failed to delete store");

      fetchStores();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };


  // Validation
  const validate = () => {
    const e: Record<string, string> = {};

    if (!newStore.name.trim()) e.name = "Store name is required";
    if (!newStore.description.trim()) e.description = "Description is required";
    if (!newStore.link.trim()) e.link = "Link is required";

    try {
      if (newStore.link) new URL(newStore.link);
    } catch {
      e.link = "Enter a valid URL";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -------------------------------------
  // POST - ADD NEW STORE (async/await)
  // -------------------------------------
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("name", newStore.name.trim());
      formData.append("description", newStore.description.trim());
      formData.append("link", newStore.link.trim());
      formData.append("section", newStore.section);

      if (newStore.imageFile) {
        formData.append("image", newStore.imageFile);
      }

      const res = await fetch(`https://api.new.techember.in/api/affiliate/create`, {
        method: "POST",
        headers: {
          "token": localStorage.getItem("token") || "",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add store");

      fetchStores();
    } catch (err) {
      console.error("Add store failed:", err);
    }

    setShowAddModal(false);
    setNewStore({
      name: "",
      description: "",
      imageFile: null,
      link: "",
      section: "shopping",
    });
    setErrors({});
  };


  return (
    <AdminLayout title="Affiliate Stores">
      <div className="p-6">
        <div className="admin-card">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <h2 className="text-xl font-semibold">Affiliate Stores</h2>

              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                NEW STORE
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
                  />
                </div>
              </div>

              {/* Section Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedSection}
                  onChange={(e) =>
                    setSelectedSection(e.target.value as StoreSection | "all")
                  }
                  className="w-full p-2 border border-border rounded-lg"
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

          {/* Table */}
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
                      {/* Image */}
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

                      {/* Section badge */}
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
                          {new URL(item.link).hostname}
                        </a>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-primary hover:bg-primary/10 rounded">
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-foreground hover:bg-accent rounded">
                            <EyeIcon className="h-4 w-4" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of{" "}
                  {filteredStores.length} results
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-border rounded-lg disabled:opacity-50"
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
                    className="p-2 border border-border rounded-lg disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add New Store</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Inputs */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) =>
                    setNewStore({ ...newStore, name: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg ${
                    errors.name ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Store name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={newStore.description}
                  onChange={(e) =>
                    setNewStore({ ...newStore, description: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg ${
                    errors.description ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Store description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Section *
                </label>
                <select
                  value={newStore.section}
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      section: e.target.value as StoreSection,
                    })
                  }
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
                <label className="block text-sm font-medium mb-2">
                  Image Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full p-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Link *
                </label>
                <input
                  type="url"
                  value={newStore.link}
                  onChange={(e) =>
                    setNewStore({ ...newStore, link: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg ${
                    errors.link ? "border-destructive" : "border-border"
                  }`}
                  placeholder="https://example.com"
                />
                {errors.link && (
                  <p className="text-sm text-destructive mt-1">{errors.link}</p>
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
