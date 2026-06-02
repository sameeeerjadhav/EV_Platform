import Image from "next/image";
import Link from "next/link";
import { Zap, Battery, Gauge, IndianRupee, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

interface BikeCardProps {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number | string;
  range: string;
  topSpeed: string;
  batteryCapacity: string;
  isAvailable: boolean;
  primaryImage?: string;
  viewPrefix?: string;
}

export function BikeCard({
  id, name, brand, model, price, range, topSpeed,
  batteryCapacity, isAvailable, primaryImage,
  viewPrefix = "/dealer/bikes",
}: BikeCardProps) {
  return (
    <div className="card-premium overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-slate-100 overflow-hidden flex-shrink-0">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={`${brand} ${name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-slate-300" fill="currentColor">
              <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z" />
              <path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={isAvailable ? "available" : "unavailable"} />
        </div>

        {/* Brand label — solid dark */}
        <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
          {brand}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">
            {name}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">{model}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {[
            { Icon: Battery, value: batteryCapacity, color: "text-emerald-600" },
            { Icon: Zap,     value: range,           color: "text-blue-600" },
            { Icon: Gauge,   value: topSpeed,        color: "text-cyan-600" },
          ].map(({ Icon, value, color }) => (
            <div key={value} className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className="text-xs text-slate-500 text-center leading-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-xs text-slate-400">Starting at</p>
            <p className="text-base font-bold text-slate-900 flex items-center gap-0.5">
              <IndianRupee className="w-3.5 h-3.5" />
              {formatCurrency(price).replace("₹", "")}
            </p>
          </div>
          <Link
            href={`${viewPrefix}/${id}`}
            id={`bike-card-view-${id}`}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all duration-200"
          >
            View <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

