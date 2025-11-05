import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { mockSupportTickets } from "@/mocks/data";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  assignedTo?: string;
  response?: string;
}

// Flag to switch between mock data and real backend
const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

export const Support = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_progress" | "resolved"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [response, setResponse] = useState("");

  // Load tickets based on mock flag
  useEffect(() => {
    if (useMock) {
      setTickets([...mockSupportTickets]);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/support-tickets`)
        .then((res) => res.json())
        .then((data) => setTickets(data))
        .catch((err) => {
          console.error("Failed to fetch tickets", err);
          setTickets([]); // no fallback
        });
    }
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = statusFilter === "all" || ticket.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const updateTicketStatus = (
    ticketId: string,
    newStatus: "open" | "in_progress" | "resolved"
  ) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
  };

  const markResolved = (ticketId: string) => {
    if (response.trim()) {
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: "resolved", response: response.trim() }
            : ticket
        )
      );
      setSelectedTicket(null);
      setResponse("");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "text-destructive bg-destructive/10 border-destructive/20",
      in_progress: "text-warning bg-warning/10 border-warning/20",
      resolved: "text-success bg-success/10 border-success/20",
    };
    return (
      colors[status as keyof typeof colors] ||
      "text-muted-foreground bg-muted/10 border-border"
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-success",
      medium: "text-warning",
      high: "text-destructive",
    };
    return colors[priority as keyof typeof colors] || "text-muted-foreground";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ExclamationCircleIcon className="h-4 w-4" />;
      case "medium":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    total: tickets.length,
  };

  return (
    <AdminLayout title="Support & Feedback">
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {statusCounts.total}
            </div>
            <div className="text-sm text-muted-foreground">Total Tickets</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {statusCounts.open}
            </div>
            <div className="text-sm text-muted-foreground">Open</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {statusCounts.in_progress}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {statusCounts.resolved}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card p-6 mb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "open" | "in_progress" | "resolved"
                  )
                }
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as "all" | "low" | "medium" | "high")
                }
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="admin-card divide-y divide-border">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-accent/5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Ticket Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          by <strong>{ticket.userName}</strong> ({ticket.userId}) • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-foreground line-clamp-2">{ticket.message}</p>
                        {ticket.response && (
                          <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                            <p className="text-sm text-success font-medium mb-1">Response:</p>
                            <p className="text-sm text-foreground">{ticket.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2">
                    <div className={`flex items-center gap-1 text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)}
                      <span className="capitalize">{ticket.priority}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" /> View
                      </button>

                      {ticket.status !== "resolved" && (
                        <>
                          {ticket.status === "open" && (
                            <button
                              onClick={() => updateTicketStatus(ticket.id, "in_progress")}
                              className="btn-primary text-sm"
                            >
                              Start
                            </button>
                          )}
                          {ticket.status === "in_progress" && (
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="bg-success hover:bg-success/90 text-success-foreground px-3 py-2 rounded-lg text-sm font-medium"
                            >
                              Resolve
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No tickets found matching your filters.
            </div>
          )}
        </div>

        {/* Response Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold">{selectedTicket.subject}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTicket.userName} ({selectedTicket.userId}) • {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 bg-accent/20 rounded-lg">
                  <p className="text-sm">{selectedTicket.message}</p>
                </div>

                {selectedTicket.status === "in_progress" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Response</label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Enter your response..."
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary h-32 resize-none"
                    />
                  </div>
                )}

                {selectedTicket.response && (
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                    <p className="text-sm font-medium text-success mb-2">Previous Response:</p>
                    <p className="text-sm">{selectedTicket.response}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setResponse("");
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
                {selectedTicket.status === "in_progress" && (
                  <button
                    onClick={() => markResolved(selectedTicket.id)}
                    disabled={!response.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Debug */}
        {/* <pre className="text-xs bg-gray-100 p-2 rounded mt-4">
          Mock mode: {String(useMock)}
        </pre> */}
      </div>
    </AdminLayout>
  );
};
