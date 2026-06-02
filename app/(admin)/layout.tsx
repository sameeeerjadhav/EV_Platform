import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Topbar } from "@/components/shared/Topbar";

export const metadata: Metadata = {
  title: { template: "%s | Admin — EV Dealer Portal", default: "Admin Dashboard | EV Dealer Portal" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar userName={session.user.name || "Admin"} userRole="Administrator" />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

