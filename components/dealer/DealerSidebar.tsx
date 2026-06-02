"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { LayoutDashboard, Bike, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
  { label: "Browse Bikes", href: "/dealer/bikes", icon: Bike },
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
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      }
    />
  );
}

