"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Bike, Users, TrendingUp, Award } from "lucide-react";

interface AnalyticsData {
  bikes:       { total: number; available: number; unavailable: number };
  dealers:     { total: number; active: number; pending: number; inactive: number };
  bikesByBrand: { brand: string; count: number }[];
  growthData:  { month: string; bikes: number; dealers: number }[];
}

const COLORS = { available: "#10b981", unavailable: "#f43f5e", active: "#3b82f6", pending: "#f59e0b", inactive: "#94a3b8" };

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
  if (!data) return null;

  const bikeDonut  = [{ name: "Available", value: data.bikes.available }, { name: "Unavailable", value: data.bikes.unavailable }];
  const dealerBar  = [{ name: "Active", value: data.dealers.active }, { name: "Pending", value: data.dealers.pending }, { name: "Inactive", value: data.dealers.inactive }];
  const donutColors = [COLORS.available, COLORS.unavailable];
  const dealerColors = [COLORS.active, COLORS.pending, COLORS.inactive];

  return (
    <div className="space-y-5">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bikes",   value: data.bikes.total,    icon: Bike,      color: "bg-blue-50 text-blue-600",   ring: "ring-blue-100" },
          { label: "Available",     value: data.bikes.available, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
          { label: "Total Dealers", value: data.dealers.total,  icon: Users,     color: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
          { label: "Pending",       value: data.dealers.pending, icon: Award,     color: "bg-amber-50 text-amber-600",  ring: "ring-amber-100" },
        ].map(({ label, value, icon: Icon, color, ring }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-4 mb-3 ${color} ${ring}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Row 1: Donut + Dealer bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bike availability donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Bike Availability</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={bikeDonut} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {bikeDonut.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {bikeDonut.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: donutColors[i] }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {data.bikes.total > 0 ? Math.round((data.bikes.available / data.bikes.total) * 100) : 0}% availability rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dealer breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Dealer Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dealerBar} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {dealerBar.map((_, i) => <Cell key={i} fill={dealerColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Growth line chart ── */}
      {data.growthData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Growth Over Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="bikes" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Bikes Added" />
              <Line type="monotone" dataKey="dealers" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Dealers Joined" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 3: Top brands ── */}
      {data.bikesByBrand.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Bikes by Brand</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.bikesByBrand} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="brand" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Bikes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
