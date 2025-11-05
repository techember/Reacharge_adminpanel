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

interface GameItem {
  id: string;
  imageUrl: string;
  name: string;
  link: string;
}

// Mock Data
const mockGames: GameItem[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `game_${i + 1}`,
  imageUrl: "/placeholder.svg",
  name: `Game ${i + 1}`,
  link: "https://example.com/game",
}));

// Env variables
const useMock = (import.meta.env.VITE_USE_MOCK_AUTH || "false") === "true";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Games: React.FC = () => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGame, setNewGame] = useState<{
    name: string;
    imageFile?: File | null;
    link: string;
  }>({
    name: "",
    imageFile: null,
    link: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  const fetchGames = async () => {
    if (useMock) {
      setGames(mockGames);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/games`);
      if (!res.ok) throw new Error("Failed to fetch games");
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, games.length);
  const currentItems = games.slice(startIndex, endIndex);

  const handleDelete = async (id: string) => {
    if (useMock) {
      setGames((prev) => prev.filter((g) => g.id !== id));
    } else {
      try {
        const res = await fetch(`${API_BASE_URL}/games/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        await fetchGames();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }

    if (startIndex >= games.length - 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!newGame.name.trim()) e.name = "Game name is required";
    if (!newGame.link.trim()) e.link = "Link is required";
    try {
      if (newGame.link) new URL(newGame.link);
    } catch {
      e.link = "Enter a valid URL";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (useMock) {
      const imageUrl = newGame.imageFile
        ? URL.createObjectURL(newGame.imageFile)
        : "/placeholder.svg";
      const item: GameItem = {
        id: `game_${Date.now()}`,
        name: newGame.name.trim(),
        link: newGame.link.trim(),
        imageUrl,
      };
      setGames((prev) => [item, ...prev]);
    } else {
      try {
        const formData = new FormData();
        formData.append("name", newGame.name.trim());
        formData.append("link", newGame.link.trim());
        if (newGame.imageFile) formData.append("image", newGame.imageFile);

        const res = await fetch(`${API_BASE_URL}/games`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to add game");

        await fetchGames();
      } catch (err) {
        console.error("Add game failed:", err);
      }
    }

    setShowAddModal(false);
    setNewGame({ name: "", imageFile: null, link: "" });
    setErrors({});
  };

  return (
    <AdminLayout title="Games">
      <div className="p-6">
        <div className="admin-card">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <h2 className="text-xl font-semibold">Games</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                NEW GAME
              </button>
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of {games.length}{" "}
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

      {/* Add Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add New Game</h3>
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
                  Game Name *
                </label>
                <input
                  type="text"
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame({ ...newGame, name: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.name ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Enter game name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewGame({
                      ...newGame,
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
                  value={newGame.link}
                  onChange={(e) =>
                    setNewGame({ ...newGame, link: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.link ? "border-destructive" : "border-border"
                  }`}
                  placeholder="https://example.com/game"
                />
                {errors.link && (
                  <p className="text-sm text-destructive mt-1">{errors.link}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1"
                disabled={loading}
              >
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
