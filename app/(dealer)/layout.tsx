import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DealerSidebar } from "@/components/dealer/DealerSidebar";
import { Topbar } from "@/components/shared/Topbar";

export const metadata: Metadata = {
  title: { template: "%s | Dealer — EV Dealer Portal", default: "Dealer Dashboard | EV Dealer Portal" },
};

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DEALER") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <DealerSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar userName={session.user.name || "Dealer"} userRole="Dealer" />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
