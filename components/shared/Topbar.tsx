"use client";
import { signOut } from "next-auth/react";
import { LogOut, Bell, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopbarProps { userName: string; userRole: string; pageTitle?: string; }

export function Topbar({ userName, userRole }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 flex-shrink-0">
      {/* Left spacer for mobile hamburger */}
      <div className="w-8 md:hidden" />
      <div className="hidden md:block" />

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </button>

        <div className="relative">
          <button onClick={() => setOpen(!open)} id="topbar-user-menu"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 max-w-[100px] truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{userRole}</p>
            </div>
            <ChevronDown className={cn("hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-20 py-1 animate-fade-in overflow-hidden">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
                  <p className="text-[11px] text-slate-400">{userRole}</p>
                </div>
                <button id="topbar-profile" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User className="w-3.5 h-3.5" /> Profile
                </button>
                <div className="border-t border-slate-100 my-0.5" />
                <button id="topbar-logout" onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

