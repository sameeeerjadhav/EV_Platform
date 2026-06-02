import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BikeCard } from "@/components/shared/BikeCard";
import { StatsCard } from "@/components/shared/StatsCard";
import { Bike, Zap, ArrowRight, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

async function getDealerDashboardData() {
  const [totalBikes, availableBikes, recentBikes, thisWeekCount] = await Promise.all([
    prisma.bike.count(),
    prisma.bike.count({ where: { isAvailable: true } }),
    prisma.bike.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.bike.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);
  return { totalBikes, availableBikes, recentBikes, thisWeekCount };
}

export default async function DealerDashboard() {
  const session = await auth();
  const data = await getDealerDashboardData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner — solid dark navy, no gradient */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 md:p-7 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-xl md:text-2xl font-bold mb-1">
              {session?.user?.name || "Dealer"} 👋
            </h1>
            <p className="text-slate-300 text-sm">Browse the latest EV bikes in our inventory.</p>
          </div>
          <Link
            href="/dealer/bikes"
            id="dealer-browse-bikes"
            className="btn-ev self-start sm:self-auto flex-shrink-0"
          >
            <Bike className="w-4 h-4" />
            Browse All Bikes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard title="Total Bikes" value={data.totalBikes} icon={Bike} description="In our inventory" />
        <StatsCard title="Available Now" value={data.availableBikes} icon={Zap} iconBg="bg-emerald-50" description="Ready for purchase" />
        <StatsCard title="New This Week" value={data.thisWeekCount} icon={Calendar} iconBg="bg-purple-50" description="Added in last 7 days" />
      </div>

      {/* Latest Bikes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-slate-900">Latest EV Bikes</h2>
          <Link href="/dealer/bikes" id="dealer-view-all-bikes" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentBikes.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Zap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No bikes available yet.</p>
            <p className="text-sm text-slate-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="bikes-grid">
            {data.recentBikes.map((bike) => (
              <BikeCard
                key={bike.id}
                id={bike.id}
                name={bike.name}
                brand={bike.brand}
                model={bike.model}
                price={Number(bike.price)}
                range={bike.range}
                topSpeed={bike.topSpeed}
                batteryCapacity={bike.batteryCapacity}
                isAvailable={bike.isAvailable}
                primaryImage={bike.images[0]?.url}
                viewPrefix="/dealer/bikes"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

