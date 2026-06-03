"use client";
import { Sidebar } from "@/components/shared/Sidebar";
import { LayoutDashboard, Bike, LogOut, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard",   href: "/dealer/dashboard", icon: LayoutDashboard },
  { label: "Browse Bikes",href: "/dealer/bikes",     icon: Bike },
  { label: "Profile",     href: "/dealer/profile",   icon: UserCircle },
];

export function DealerSidebar() {
  return (
    <Sidebar
      navItems={navItems}
      title="EV Dealer Portal"
      subtitle="Dealer Panel"
      bottomContent={
        <button
          id="dealer-sidebar-logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      }
    />
  );
}

