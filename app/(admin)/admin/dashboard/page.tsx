import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Bike, Users, CheckCircle2, Clock, Plus, ArrowRight, Zap, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const [totalBikes, availableBikes, totalDealers, activeDealers, pendingDealers, recentBikes, recentDealers] =
    await Promise.all([
      prisma.bike.count(),
      prisma.bike.count({ where: { isAvailable: true } }),
      prisma.user.count({ where: { role: "DEALER" } }),
      prisma.user.count({ where: { role: "DEALER", isActive: true, isApproved: true } }),
      prisma.user.count({ where: { role: "DEALER", isApproved: false } }),
      prisma.bike.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { images: { where: { isPrimary: true }, take: 1 } } }),
      prisma.user.findMany({ where: { role: "DEALER" }, take: 5, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, company: true, isActive: true, isApproved: true, createdAt: true } }),
    ]);
  return { totalBikes, availableBikes, totalDealers, activeDealers, pendingDealers, recentBikes, recentDealers };
}

export default async function AdminDashboard() {
  const s = await getStats();

  const stats = [
    { label: "Total Bikes", value: s.totalBikes, sub: "In inventory", icon: Bike, color: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
    { label: "Available", value: s.availableBikes, sub: `${s.totalBikes - s.availableBikes} unavailable`, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
    { label: "Total Dealers", value: s.totalDealers, sub: `${s.activeDealers} active`, icon: Users, color: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
    { label: "Pending", value: s.pendingDealers, sub: "Awaiting approval", icon: Clock, color: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Admin / Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, ring }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-4 ${color} ${ring}`}>
                <Icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
            <p className="text-xs font-semibold text-slate-600">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/bikes/new" id="quick-add-bike"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add New Bike
          </Link>
          <Link href="/admin/dealers/new" id="quick-add-dealer"
            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Dealer
          </Link>
          {s.pendingDealers > 0 && (
            <Link href="/admin/dealers?status=pending" id="quick-pending"
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Clock className="w-4 h-4" />
              Review {s.pendingDealers} Pending {s.pendingDealers === 1 ? "Dealer" : "Dealers"}
            </Link>
          )}
        </div>
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Bikes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Recently Added Bikes</h2>
            <Link href="/admin/bikes" id="dashboard-view-all-bikes"
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {s.recentBikes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Zap className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No bikes yet</p>
                <Link href="/admin/bikes/new" className="text-xs text-blue-600 hover:underline mt-1">Add your first bike →</Link>
              </div>
            ) : s.recentBikes.map(bike => (
              <div key={bike.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Bike className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{bike.name}</p>
                  <p className="text-xs text-slate-400">{bike.brand} · {formatCurrency(Number(bike.price))}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bike.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {bike.isAvailable ? "Available" : "Unavailable"}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(bike.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Dealers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Recent Dealers</h2>
            <Link href="/admin/dealers" id="dashboard-view-all-dealers"
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {s.recentDealers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No dealers yet</p>
              </div>
            ) : s.recentDealers.map(dealer => {
              const approved = dealer.isActive && dealer.isApproved;
              const pending  = !dealer.isApproved;
              return (
                <div key={dealer.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 text-violet-700 font-bold text-xs">
                    {dealer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{dealer.name}</p>
                    <p className="text-xs text-slate-400 truncate">{dealer.company || dealer.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      approved ? "bg-emerald-50 text-emerald-700"
                      : pending ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                    }`}>
                      {approved ? "Active" : pending ? "Pending" : "Inactive"}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(dealer.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
