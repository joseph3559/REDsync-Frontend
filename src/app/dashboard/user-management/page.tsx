"use client";
import { useState, useEffect } from "react";
import { fetchPendingUsers, fetchAllUsers, approveUser, rejectUser, type User } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      if (activeTab === "pending") {
        const data = await fetchPendingUsers(token);
        setPendingUsers(data.users);
      } else {
        const data = await fetchAllUsers(token);
        setAllUsers(data.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    setActionLoading(userId);
    setError(null);
    setSuccessMessage(null);
    const token = getToken();
    if (!token) return;

    try {
      const result = await approveUser(userId, token);
      setSuccessMessage(result.message);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(userId: string) {
    setActionLoading(userId);
    setError(null);
    setSuccessMessage(null);
    const token = getToken();
    if (!token) return;

    try {
      const result = await rejectUser(userId, token);
      setSuccessMessage(result.message);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  }

  function getRoleBadgeColor(role: string) {
    const roleLower = role.toLowerCase();
    if (roleLower.includes("super") || roleLower.includes("admin")) {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    if (roleLower.includes("admin") || roleLower.includes("manager")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (roleLower.includes("qa") || roleLower.includes("quality")) {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (roleLower.includes("analyst") || roleLower.includes("technician")) {
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  function formatRole(role: string) {
    // Convert snake_case to Title Case and capitalize words
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  const users = activeTab === "pending" ? pendingUsers : allUsers;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
        <p className="text-slate-600">Manage user registrations and permissions</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-4 px-2 font-semibold transition-colors relative ${
              activeTab === "pending"
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Pending Approvals
            {pendingUsers.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">
                {pendingUsers.length}
              </span>
            )}
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 px-2 font-semibold transition-colors relative ${
              activeTab === "all"
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All Users
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>
            )}
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {activeTab === "pending" ? "No Pending Users" : "No Users Found"}
          </h3>
          <p className="text-slate-600">
            {activeTab === "pending"
              ? "There are no user registrations awaiting approval"
              : "No users have been registered yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Registered</th>
                  {activeTab === "pending" && (
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{user.name || "—"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-600">{user.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadgeColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    {activeTab === "pending" && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

