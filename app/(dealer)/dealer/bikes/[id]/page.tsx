import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Battery, Gauge, Zap, Clock, IndianRupee,
  Calendar, ArrowLeft
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bike = await prisma.bike.findUnique({ where: { id }, select: { name: true, brand: true } });
  return {
    title: bike ? `${bike.brand} ${bike.name}` : "Bike Details",
  };
}

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bike = await prisma.bike.findUnique({
    where: { id },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
  });

  if (!bike) notFound();

  const primaryImage = bike.images.find((img) => img.isPrimary) || bike.images[0];
  const otherImages = bike.images.filter((img) => img.id !== primaryImage?.id);

  const specs = [
    { icon: Battery, label: "Battery Capacity", value: bike.batteryCapacity, color: "text-emerald-600" },
    { icon: Zap, label: "Range", value: bike.range, color: "text-blue-600" },
    { icon: Gauge, label: "Top Speed", value: bike.topSpeed, color: "text-cyan-600" },
    { icon: Clock, label: "Charging Time", value: bike.chargingTime, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${bike.brand} ${bike.name}`}
        description={`${bike.brand} • ${bike.model}`}
        breadcrumb={[
          { label: "Dealer" },
          { label: "Bikes", href: "/dealer/bikes" },
          { label: bike.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-premium overflow-hidden">
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200" style={{ height: "22rem" }}>
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={`${bike.brand} ${bike.name}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-24 h-24 text-slate-300" fill="currentColor">
                    <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <StatusBadge status={bike.isAvailable ? "available" : "unavailable"} />
              </div>
            </div>
          </div>

          {otherImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {otherImages.map((img) => (
                <div key={img.id} className="relative flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200" style={{ width: "5rem", height: "5rem" }}>
                  <Image src={img.url} alt="Bike image" fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}

          <div className="card-premium p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">About This Bike</h2>
            <p className="text-slate-600 leading-relaxed text-sm">{bike.description}</p>
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="space-y-4">
          <div className="card-premium p-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Starting Price</p>
            <p className="text-3xl font-black text-slate-900 flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {formatCurrency(Number(bike.price)).replace("₹", "")}
            </p>
            <div className="mt-4">
              <StatusBadge status={bike.isAvailable ? "available" : "unavailable"} />
            </div>
          </div>

          <div className="card-premium p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Specifications</h2>
            <div className="space-y-3">
              {specs.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Brand</span>
                <span className="font-medium text-slate-800">{bike.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model</span>
                <span className="font-medium text-slate-800">{bike.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Added</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(bike.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Link href="/dealer/bikes" id="bike-detail-back" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to all bikes
          </Link>
        </div>
      </div>
    </div>
  );
}
