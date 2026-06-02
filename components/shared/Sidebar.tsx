"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon, X, Menu } from "lucide-react";

interface NavItem { label: string; href: string; icon: LucideIcon; badge?: number; }
interface SidebarProps { navItems: NavItem[]; title: string; subtitle?: string; bottomContent?: React.ReactNode; }

function SidebarContent({ navItems, title, subtitle, bottomContent, onClose }: SidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-slate-800">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z"/>
            <path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{title}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 md:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}>
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  active ? "bg-white/20 text-white" : "bg-blue-600 text-white")}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      {bottomContent && (
        <div className="px-3 pb-4 pt-3 border-t border-slate-800">{bottomContent}</div>
      )}
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block flex-shrink-0">
        <SidebarContent {...props} />
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setOpen(true)} aria-label="Open menu"
        className="md:hidden fixed top-3.5 left-3.5 z-50 w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent {...props} onClose={() => setOpen(false)} />
      </div>
    </>
  );
}

