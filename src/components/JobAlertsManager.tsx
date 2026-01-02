// src/components/JobAlertsManager.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Pause,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  BellRing,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface JobAlert {
  id: string;
  user_id: string;
  name: string;
  job_title: string;
  location?: string;
  is_remote: boolean;
  skills: string[];
  frequency: "daily" | "weekly";
  telegram_target?: string;
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

interface JobAlertsManagerProps {
  userId: string;
}

export default function JobAlertsManager({ userId }: JobAlertsManagerProps) {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<JobAlert | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingAlertId, setTestingAlertId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<JobAlert>>({});
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    location: "",
    isRemote: false,
    skills: [] as string[],
    frequency: "daily" as "daily" | "weekly",
    telegramTarget: "",
  });

  // Refs untuk mencegah memory leaks
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    fetchAlerts();

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Event listener untuk esc key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showEditModal) setShowEditModal(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showCreateModal, showEditModal]);

  const fetchAlerts = async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/job-alerts");
      const data = await res.json();
      if (data.alerts && isMounted.current) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      if (isMounted.current) {
        toast.error("Failed to fetch alerts");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const createAlert = async () => {
    if (!formData.name || !formData.jobTitle) {
      toast.error("Please fill in all required fields");
      return;
    }

    const toastId = toast.loading("Creating alert...");

    try {
      const res = await fetch("/api/job-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: "",
          jobTitle: "",
          location: "",
          isRemote: false,
          skills: [],
          frequency: "daily",
          telegramTarget: "",
        });
        fetchAlerts();
        toast.success("Alert created successfully!", { id: toastId });
      } else {
        toast.error(`Error: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Failed to create alert", { id: toastId });
    }
  };

  const updateAlert = async (alertData: Partial<JobAlert> & { id: string }) => {
    const toastId = toast.loading("Updating alert...");

    try {
      const res = await fetch(`/api/job-alerts/${alertData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: alertData.name,
          jobTitle: alertData.job_title,
          location: alertData.location,
          isRemote: alertData.is_remote,
          skills: alertData.skills,
          frequency: alertData.frequency,
          telegramTarget: alertData.telegram_target,
          isActive: alertData.is_active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update alert");
      }

      if (data.success) {
        setShowEditModal(null);
        setEditFormData({});
        fetchAlerts();
        toast.success("Alert updated successfully!", { id: toastId });
      } else {
        toast.error(`Error: ${data.error}`, { id: toastId });
      }
    } catch (error: any) {
      console.error("Error updating alert:", error);
      toast.error(`Failed to update alert: ${error.message}`, { id: toastId });
    }
  };

  const handleEditAlert = (alert: JobAlert) => {
    setShowEditModal(alert);
    setEditFormData({
      ...alert,
      name: alert.name,
      job_title: alert.job_title,
      location: alert.location,
      is_remote: alert.is_remote,
      skills: alert.skills,
      frequency: alert.frequency,
      telegram_target: alert.telegram_target,
      is_active: alert.is_active,
    });
  };

  const handleSaveEdit = async () => {
    if (showEditModal && editFormData.name && editFormData.job_title) {
      await updateAlert({
        id: showEditModal.id,
        ...editFormData,
      });
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const deleteAlert = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Delete Alert</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete this alert? This action cannot
                be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                await performDeleteAlert(id);
              }}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    );
  };

  const performDeleteAlert = async (id: string) => {
    if (!isMounted.current) return;
    
    setDeletingId(id);
    const toastId = toast.loading("Deleting alert...");

    try {
      const res = await fetch(`/api/job-alerts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete alert");
      }

      if (data.success) {
        fetchAlerts();
        toast.success("Alert deleted successfully!", { id: toastId });
      } else {
        toast.error(`Error: ${data.error}`, { id: toastId });
      }
    } catch (error: any) {
      console.error("Error deleting alert:", error);
      toast.error(`Failed to delete alert: ${error.message}`, { id: toastId });
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
      }
    }
  };

  const toggleAlertActive = async (alert: JobAlert) => {
    const updatedAlert = { ...alert, is_active: !alert.is_active };

    const toastId = toast.loading(
      `${alert.is_active ? "Pausing" : "Activating"} alert...`
    );

    try {
      await updateAlert(updatedAlert);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const testTelegramConnection = async (telegramTarget: string): Promise<boolean> => {
    const toastId = toast.loading("Testing Telegram connection...");
    
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramTarget }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("✅ Telegram connection successful!", { id: toastId });
        return true;
      } else {
        toast.error(`Connection failed: ${data.error}`, { id: toastId });
        return false;
      }
    } catch (error) {
      console.error("Error testing Telegram connection:", error);
      toast.error("Failed to test Telegram connection", { id: toastId });
      return false;
    }
  };

  const triggerTestAlert = async (alertId: string) => {
    if (!isMounted.current) return;
    
    setTestingAlertId(alertId);
    
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert?.telegram_target) {
      toast.error("Please set Telegram username or Chat ID first");
      setTestingAlertId(null);
      return;
    }

    const isConnected = await testTelegramConnection(alert.telegram_target);
    
    if (!isConnected) {
      if (isMounted.current) {
        setTestingAlertId(null);
      }
      return;
    }

    const toastId = toast.loading("Sending test alert...");

    try {
      const res = await fetch("/api/job-alerts/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("✅ Test alert sent! Check your Telegram.", { id: toastId });
      } else {
        toast.error(`Error: ${data.error || "Failed to send test alert"}`, { id: toastId });
      }
    } catch (error) {
      console.error("Error triggering alert:", error);
      toast.error("Failed to send test alert", { id: toastId });
    } finally {
      if (isMounted.current) {
        setTestingAlertId(null);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render modal dengan createPortal
  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div 
          className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col"
          ref={modalContainerRef}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Create Job Alert
            </h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
              type="button"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> To receive Telegram notifications:
                <br />
                1. Start{" "}
                <a 
                  href="https://t.me/YuanJobMatcher_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  @YuanJobMatcher_bot <ExternalLink className="w-3 h-3" />
                </a>{" "}
                on Telegram
                <br />
                2. Send <code className="bg-white px-1 py-0.5 rounded border text-xs">/id</code> to get your username
                <br />
                3. Enter it below and click "Test Alert" to verify
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Frontend Developer London"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  placeholder="e.g., Frontend Developer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., London, Remote"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRemote"
                  checked={formData.isRemote}
                  onChange={(e) =>
                    setFormData({ ...formData, isRemote: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isRemote"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remote positions only
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, frequency: "daily" })
                    }
                    className={`flex-1 py-2 rounded-lg border ${
                      formData.frequency === "daily"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, frequency: "weekly" })
                    }
                    className={`flex-1 py-2 rounded-lg border ${
                      formData.frequency === "weekly"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Username or Chat ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.telegramTarget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telegramTarget: e.target.value,
                    })
                  }
                  placeholder="e.g., @johndoe or 123456789"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Telegram username (with @) or Chat ID to receive notifications.
                  <br />
                  Leave empty for email notifications only.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 shrink-0">
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={createAlert}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800"
                type="button"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Render edit modal dengan createPortal
  const renderEditModal = () => {
    if (!showEditModal) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div 
          className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col"
          ref={modalContainerRef}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Job Alert
            </h3>
            <button
              onClick={() => {
                setShowEditModal(null);
                setEditFormData({});
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
              type="button"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> To receive Telegram notifications:
                <br />
                1. Start{" "}
                <a 
                  href="https://t.me/YuanJobMatcher_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  @YuanJobMatcher_bot <ExternalLink className="w-3 h-3" />
                </a>{" "}
                on Telegram
                <br />
                2. Send <code className="bg-white px-1 py-0.5 rounded border text-xs">/id</code> to get your username
                <br />
                3. Enter it below and click "Test Alert" to verify
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="e.g., Frontend Developer London"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={editFormData.job_title || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      job_title: e.target.value,
                    })
                  }
                  placeholder="e.g., Frontend Developer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={editFormData.location || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g., London, Remote"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editIsRemote"
                  checked={editFormData.is_remote || false}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      is_remote: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="editIsRemote"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remote positions only
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditFormData({ ...editFormData, frequency: "daily" })
                    }
                    className={`flex-1 py-2 rounded-lg border ${
                      editFormData.frequency === "daily"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditFormData({
                        ...editFormData,
                        frequency: "weekly",
                      })
                    }
                    className={`flex-1 py-2 rounded-lg border ${
                      editFormData.frequency === "weekly"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Username or Chat ID (Optional)
                </label>
                <input
                  type="text"
                  value={editFormData.telegram_target || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      telegram_target: e.target.value,
                    })
                  }
                  placeholder="e.g., @johndoe or 123456789"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Telegram username (with @) or Chat ID to receive notifications.
                  <br />
                  Leave empty for email notifications only.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.is_active || false}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="editIsActive"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Alert is active
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 shrink-0">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(null);
                  setEditFormData({});
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800"
                type="button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:items-center sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Alerts</h2>
          <p className="text-gray-600 mt-1">
            Get notified when new jobs match your criteria
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.length === 0 ? (
          <div className="col-span-3 p-8 text-center border-2 border-dashed border-gray-300 rounded-2xl">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No alerts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first job alert to get notified about new
              opportunities
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium"
              type="button"
            >
              Create Alert
            </button>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border ${
                alert.is_active
                  ? "border-blue-200 hover:border-blue-400"
                  : "border-gray-200 hover:border-gray-400"
              } p-5 shadow-sm transition-all duration-200`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {alert.name}
                    </h3>
                    {alert.is_active ? (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{alert.job_title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditAlert(alert)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleAlertActive(alert)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={alert.is_active ? "Pause" : "Activate"}
                    type="button"
                  >
                    {alert.is_active ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Alert Details */}
              <div className="space-y-3 mb-4">
                {alert.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{alert.location}</span>
                  </div>
                )}
                {alert.is_remote && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>Remote positions only</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BellRing className="w-4 h-4" />
                  <span>
                    {alert.frequency === "daily" ? "Daily" : "Weekly"} alerts
                  </span>
                </div>
                {alert.telegram_target && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bell className="w-4 h-4" />
                    <span>Telegram: {alert.telegram_target}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last sent: {formatDate(alert.last_sent_at)}</span>
                </div>
              </div>

              {/* Skills */}
              {alert.skills && alert.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Matching skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {alert.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={`${alert.id}-skill-${idx}`}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                    {alert.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg">
                        +{alert.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => triggerTestAlert(alert.id)}
                  disabled={!alert.telegram_target || testingAlertId === alert.id}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 rounded-lg font-medium transition-all duration-200 border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={!alert.telegram_target ? "Set Telegram target first" : "Send test alert"}
                  type="button"
                >
                  {testingAlertId === alert.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Bell className="w-3 h-3" />
                      Test Alert
                    </>
                  )}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  disabled={deletingId === alert.id}
                  className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  type="button"
                >
                  {deletingId === alert.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Telegram Setup Guide */}
      <div className="flex flex-col gap-4 mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📱 Telegram Notifications Setup
            </h3>
          </div>
        </div>
        <div>
          <p className="text-gray-700 mb-3">
            <strong>Important:</strong> You must complete these steps once to enable Telegram notifications:
          </p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-medium">Start the Telegram bot</p>
                <p className="text-gray-600 mt-1">
                  Open Telegram and{" "}
                  <a 
                    href="https://t.me/YuanJobMatcher_bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    click here to start @YuanJobMatcher_bot <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-1">(Required one-time setup)</p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-medium">Get your Telegram info</p>
                <p className="text-gray-600 mt-1">
                  After starting the bot, send <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">/id</code> to get your username or Chat ID
                </p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-medium">Enter your Telegram info</p>
                <p className="text-gray-600 mt-1">
                  Copy and paste your username (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">@yourusername</code>) or Chat ID in the field above
                </p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <p className="font-medium">Test the connection</p>
                <p className="text-gray-600 mt-1">
                  Click "Test Alert" to verify everything is working
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ✓ One-time setup only - after this, you'll receive alerts automatically
                </p>
              </div>
            </li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">💡 Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Username is easier to remember (e.g., @johndoe)</li>
              <li>• Chat ID works even if you change your username</li>
              <li>• You can use either - both work once you've started the bot</li>
              <li>• Make sure you don't block @YuanJobMatcher_bot</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Render modals using portals */}
      {renderCreateModal()}
      {renderEditModal()}
    </div>
  );
}