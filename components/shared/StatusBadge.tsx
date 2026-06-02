import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Circle,
} from "lucide-react";

type StatusType =
  | "available"
  | "unavailable"
  | "active"
  | "inactive"
  | "approved"
  | "pending"
  | "rejected";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  available: {
    label: "Available",
    className: "badge-success",
    icon: CheckCircle2,
  },
  unavailable: {
    label: "Unavailable",
    className: "badge-danger",
    icon: XCircle,
  },
  active: {
    label: "Active",
    className: "badge-success",
    icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    className: "badge-danger",
    icon: XCircle,
  },
  approved: {
    label: "Approved",
    className: "badge-success",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "badge-warning",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    className: "badge-danger",
    icon: AlertCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(config.className, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Derive status from boolean fields
export function getDealerStatus(
  isActive: boolean,
  isApproved: boolean
): StatusType {
  if (!isActive) return "inactive";
  if (!isApproved) return "pending";
  return "active";
}
