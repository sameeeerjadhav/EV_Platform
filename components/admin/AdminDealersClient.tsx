"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, getDealerStatus } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import {
  Plus, Search, Edit, Trash2, RefreshCw, Users,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock
} from "lucide-react";

interface Dealer {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function AdminDealersClient() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchDealers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const res = await fetch(`/api/dealers?${params}`);
      const data = await res.json();
      setDealers(data.dealers);
      setPagination(data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDealers(1), 300);
    return () => clearTimeout(timer);
  }, [fetchDealers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/dealers/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchDealers(pagination.page);
  };

  const toggleApproval = async (dealer: Dealer) => {
    setTogglingId(dealer.id);
    await fetch(`/api/dealers/${dealer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !dealer.isApproved }),
    });
    setTogglingId(null);
    fetchDealers(pagination.page);
  };

  const toggleActive = async (dealer: Dealer) => {
    setTogglingId(dealer.id);
    await fetch(`/api/dealers/${dealer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !dealer.isActive }),
    });
    setTogglingId(null);
    fetchDealers(pagination.page);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Dealer Management"
        description="Manage dealer accounts, approvals, and access"
        breadcrumb={[{ label: "Admin" }, { label: "Dealers" }]}
        action={{ label: "Add Dealer", href: "/admin/dealers/new", icon: Plus, id: "add-dealer-btn" }}
      />

      {/* Filters */}
      <div className="card-premium p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="dealer-search"
              type="text"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <select
            id="dealer-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-full sm:w-44"
          >
            <option value="all">All Dealers</option>
            <option value="pending">Pending Approval</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            id="dealer-refresh"
            onClick={() => fetchDealers(pagination.page)}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-premium overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-ev-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading dealers...</p>
            </div>
          </div>
        ) : dealers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No dealers found</p>
            <p className="text-sm text-slate-400 mt-1">
              {search ? "Try a different search" : "No dealers have registered yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dealer</th>
                    <th>Company</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((dealer) => (
                    <tr key={dealer.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                            {dealer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{dealer.name}</p>
                            <p className="text-xs text-slate-400">{dealer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-600">{dealer.company || "—"}</td>
                      <td className="text-slate-600">{dealer.phone || "—"}</td>
                      <td>
                        <StatusBadge status={getDealerStatus(dealer.isActive, dealer.isApproved)} />
                      </td>
                      <td className="text-slate-500">{formatDate(dealer.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {/* Approve/Reject */}
                          {!dealer.isApproved ? (
                            <button
                              id={`approve-dealer-${dealer.id}`}
                              onClick={() => toggleApproval(dealer)}
                              disabled={togglingId === dealer.id}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              id={`revoke-dealer-${dealer.id}`}
                              onClick={() => toggleApproval(dealer)}
                              disabled={togglingId === dealer.id}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40"
                              title="Revoke Approval"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Activate/Deactivate */}
                          <button
                            id={`toggle-active-${dealer.id}`}
                            onClick={() => toggleActive(dealer)}
                            disabled={togglingId === dealer.id}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${dealer.isActive ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                            title={dealer.isActive ? "Deactivate" : "Activate"}
                          >
                            {dealer.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/dealers/${dealer.id}/edit`}
                            id={`edit-dealer-${dealer.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-ev-blue/10 hover:text-ev-blue transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            id={`delete-dealer-${dealer.id}`}
                            onClick={() => setDeleteId(dealer.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button id="dealers-prev-page" onClick={() => fetchDealers(pagination.page - 1)} disabled={pagination.page === 1} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600 px-2">{pagination.page} / {pagination.totalPages}</span>
                  <button id="dealers-next-page" onClick={() => fetchDealers(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Dealer Account"
        description="Are you sure you want to permanently delete this dealer account? This action cannot be undone."
        confirmLabel="Delete Dealer"
        variant="danger"
      />
    </div>
  );
}
