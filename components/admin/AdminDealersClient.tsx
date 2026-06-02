"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import {
  Plus, Search, Edit, Trash2, RefreshCw, Users,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  UserCheck, UserX, Clock
} from "lucide-react";

interface Dealer {
  id: string; name: string; email: string;
  company: string | null; phone: string | null;
  isActive: boolean; isApproved: boolean; createdAt: string;
}
interface Pagination { total: number; page: number; limit: number; totalPages: number; }

function DealerStatusBadge({ isActive, isApproved }: { isActive: boolean; isApproved: boolean }) {
  if (!isApproved) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
  if (isApproved && isActive) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Active
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Inactive
    </span>
  );
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
        page: String(page), limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const res = await fetch(`/api/dealers?${params}`);
      const data = await res.json();
      setDealers(data.dealers);
      setPagination(data.pagination);
    } finally { setIsLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchDealers(1), 300);
    return () => clearTimeout(t);
  }, [fetchDealers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/dealers/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchDealers(pagination.page);
  };

  const patchDealer = async (id: string, body: object) => {
    setTogglingId(id);
    await fetch(`/api/dealers/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setTogglingId(null);
    fetchDealers(pagination.page);
  };

  const pending  = dealers.filter(d => !d.isApproved).length;
  const active   = dealers.filter(d => d.isApproved && d.isActive).length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>Admin</span><span>/</span>
            <span className="text-slate-600 font-medium">Dealers</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900">Dealer Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage dealer accounts, approvals, and access</p>
        </div>
        <Link href="/admin/dealers/new" id="add-dealer-btn"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Dealer
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input id="dealer-search" type="text" placeholder="Search by name, email or company…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 placeholder:text-slate-400" />
          </div>
          <select id="dealer-status-filter" value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-slate-700 cursor-pointer sm:w-44">
            <option value="all">All Dealers</option>
            <option value="pending">Pending Approval</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button id="dealer-refresh" onClick={() => fetchDealers(pagination.page)}
            className="p-2.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading dealers…</p>
          </div>
        ) : dealers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No dealers found</p>
            <p className="text-sm text-slate-400 mb-5">
              {search ? `No results for "${search}"` : "No dealers have registered yet"}
            </p>
            <Link href="/admin/dealers/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Dealer
            </Link>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                {pagination.total} dealer{pagination.total !== 1 ? "s" : ""} total
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {pending > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Clock className="w-3 h-3" /> {pending} pending
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {active} active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dealer</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dealers.map(dealer => (
                    <tr key={dealer.id} className="hover:bg-blue-50/40 transition-colors group">

                      {/* Dealer info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm flex-shrink-0 ring-2 ring-violet-100">
                            {dealer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-sm">{dealer.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{dealer.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700 font-medium">{dealer.company || <span className="text-slate-300">—</span>}</span>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600">{dealer.phone || <span className="text-slate-300">—</span>}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <DealerStatusBadge isActive={dealer.isActive} isApproved={dealer.isApproved} />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-4 text-sm text-slate-500">{formatDate(dealer.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Approve / Revoke */}
                          {!dealer.isApproved ? (
                            <button id={`approve-dealer-${dealer.id}`}
                              onClick={() => patchDealer(dealer.id, { isApproved: true })}
                              disabled={togglingId === dealer.id}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                              title="Approve dealer">
                              <UserCheck className="w-3.5 h-3.5" /> Approve
                            </button>
                          ) : (
                            <button id={`revoke-dealer-${dealer.id}`}
                              onClick={() => patchDealer(dealer.id, { isApproved: false })}
                              disabled={togglingId === dealer.id}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
                              title="Revoke approval">
                              <Clock className="w-3.5 h-3.5" /> Revoke
                            </button>
                          )}

                          {/* Activate / Deactivate */}
                          <button id={`toggle-active-${dealer.id}`}
                            onClick={() => patchDealer(dealer.id, { isActive: !dealer.isActive })}
                            disabled={togglingId === dealer.id}
                            title={dealer.isActive ? "Deactivate" : "Activate"}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${dealer.isActive
                              ? "text-red-500 hover:bg-red-50"
                              : "text-emerald-600 hover:bg-emerald-50"}`}>
                            {dealer.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <Link href={`/admin/dealers/${dealer.id}/edit`} id={`edit-dealer-${dealer.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button id={`delete-dealer-${dealer.id}`} onClick={() => setDeleteId(dealer.id)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete">
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
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  <span className="font-semibold text-slate-700">{pagination.total}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button id="dealers-prev-page" onClick={() => fetchDealers(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-40 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetchDealers(p)}
                      className={`w-7 h-7 text-xs font-semibold rounded-lg transition-all ${p === pagination.page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"}`}>
                      {p}
                    </button>
                  ))}
                  <button id="dealers-next-page" onClick={() => fetchDealers(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-40 transition-all">
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
        description="This will permanently delete the dealer account. This action cannot be undone."
        confirmLabel="Delete Dealer"
        variant="danger"
      />
    </div>
  );
}
