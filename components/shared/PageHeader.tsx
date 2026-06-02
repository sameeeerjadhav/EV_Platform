"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
    id?: string;
  };
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-ev-blue transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-slate-600 font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>

      {action && (
        <div>
          {action.href ? (
            <a
              href={action.href}
              id={action.id || "page-header-action"}
              className="btn-ev inline-flex items-center gap-2 text-sm"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              id={action.id || "page-header-action"}
              className="btn-ev inline-flex items-center gap-2 text-sm"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
