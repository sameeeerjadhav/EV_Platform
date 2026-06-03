import { Sidebar } from "@/components/shared/Sidebar";
import { LayoutDashboard, Bike, Users, LogOut, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bikes",     href: "/admin/bikes",     icon: Bike },
  { label: "Dealers",   href: "/admin/dealers",   icon: Users },
  { label: "Profile",   href: "/admin/profile",   icon: UserCircle },
];

export function AdminSidebar() {
  return (
    <Sidebar
      navItems={navItems}
      title="EV Dealer Portal"
      subtitle="Admin Panel"
      bottomContent={
        <button
          id="admin-sidebar-logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
          Sign Out
        </button>
      }
    />
  );
}

