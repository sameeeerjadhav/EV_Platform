"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus, Search, Edit, Trash2, RefreshCw,
  Bike as BikeIcon, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Filter
} from "lucide-react";

interface BikeImage { url: string; publicId: string; isPrimary: boolean; }
interface Bike {
  id: string; name: string; brand: string; model: string;
  price: string; isAvailable: boolean; createdAt: string; images: BikeImage[];
}
interface Pagination { total: number; page: number; limit: number; totalPages: number; }

export function AdminBikesClient() {
  const router = useRouter();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBikes = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "10",
        ...(search && { search }),
        ...(brandFilter && { brand: brandFilter }),
        ...(availabilityFilter !== "all" && { isAvailable: availabilityFilter }),
      });
      const res = await fetch(`/api/bikes?${params}`);
      const data = await res.json();
      setBikes(data.bikes);
      setBrands(data.brands || []);
      setPagination(data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [search, brandFilter, availabilityFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchBikes(1), 300);
    return () => clearTimeout(t);
  }, [fetchBikes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/bikes/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchBikes(pagination.page);
  };

  const primaryImage = (bike: Bike) =>
    bike.images.find(i => i.isPrimary)?.url || bike.images[0]?.url;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>Admin</span><span>/</span>
            <span className="text-slate-600 font-medium">Bikes</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900">Bike Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Add, edit, and manage your EV bike inventory</p>
        </div>
        <Link href="/admin/bikes/new" id="add-bike-btn"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Bike
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input id="bike-search" type="text" placeholder="Search by name, brand or model…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 placeholder:text-slate-400" />
          </div>
          <select id="bike-brand-filter" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-slate-700 cursor-pointer sm:w-40">
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select id="bike-availability-filter" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-slate-700 cursor-pointer sm:w-36">
            <option value="all">All Status</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <button id="bike-refresh" onClick={() => fetchBikes(pagination.page)}
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
            <p className="text-sm text-slate-400">Loading bikes…</p>
          </div>
        ) : bikes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <BikeIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No bikes found</p>
            <p className="text-sm text-slate-400 mb-5">
              {search ? `No results for "${search}"` : "Start by adding your first bike"}
            </p>
            <Link href="/admin/bikes/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add First Bike
            </Link>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                {pagination.total} bike{pagination.total !== 1 ? "s" : ""} found
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {bikes.filter(b => b.isAvailable).length} available
                </span>
                <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" />
                  {bikes.filter(b => !b.isAvailable).length} unavailable
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="text-left px-5 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider">Bike</th>
                    <th className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider">Brand / Model</th>
                    <th className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider">Added</th>
                    <th className="text-right px-5 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bikes.map(bike => (
                    <tr key={bike.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 ring-1 ring-slate-200">
                            {primaryImage(bike) ? (
                              <Image src={primaryImage(bike)!} alt={bike.name} width={40} height={40}
                                className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BikeIcon className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {bike.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-800 font-medium">{bike.brand}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-500">{bike.model}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{formatCurrency(Number(bike.price))}</td>
                      <td className="px-4 py-3.5">
                        {bike.isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-sm">{formatDate(bike.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/bikes/${bike.id}/edit`} id={`edit-bike-${bike.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button id={`delete-bike-${bike.id}`} onClick={() => setDeleteId(bike.id)}
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
                  <button id="bikes-prev-page" onClick={() => fetchBikes(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetchBikes(p)}
                      className={`w-7 h-7 text-xs font-semibold rounded-lg transition-all ${
                        p === pagination.page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                      }`}>
                      {p}
                    </button>
                  ))}
                  <button id="bikes-next-page" onClick={() => fetchBikes(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
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
        title="Delete Bike"
        description="This will permanently delete the bike and all its images. This action cannot be undone."
        confirmLabel="Delete Bike"
        variant="danger"
      />
    </div>
  );
}

