import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
  };
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-blue-50",
  trend,
  description,
  className,
}: StatsCardProps) {
  const trendPositive = trend && trend.value > 0;
  const trendNegative = trend && trend.value < 0;
  const trendNeutral = trend && trend.value === 0;

  return (
    <div className={cn("stats-card animate-fade-in", className)}>
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          iconBg
        )}
      >
        <Icon className="w-6 h-6 text-blue-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">
          {value}
        </p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trendPositive && (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {trendNegative && (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            {trendNeutral && (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trendPositive && "text-emerald-600",
                trendNegative && "text-red-600",
                trendNeutral && "text-slate-400"
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-slate-400">{trend.label}</span>
          </div>
        )}
        {description && !trend && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

