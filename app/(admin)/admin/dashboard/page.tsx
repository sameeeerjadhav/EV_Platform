import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <span>Admin</span><span>/</span>
          <span className="text-slate-600 font-medium">Dashboard</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome back, {session.user.name}! Here&apos;s your platform overview.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
