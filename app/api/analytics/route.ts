import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalBikes, availableBikes,
    totalDealers, activeDealers, pendingDealers,
    bikesByBrand, bikesPerMonth, dealersPerMonth,
  ] = await Promise.all([
    prisma.bike.count(),
    prisma.bike.count({ where: { isAvailable: true } }),
    prisma.user.count({ where: { role: "DEALER" } }),
    prisma.user.count({ where: { role: "DEALER", isActive: true, isApproved: true } }),
    prisma.user.count({ where: { role: "DEALER", isApproved: false } }),

    // Top brands
    prisma.bike.groupBy({
      by: ["brand"],
      _count: { brand: true },
      orderBy: { _count: { brand: "desc" } },
      take: 6,
    }),

    // Bikes added per month (last 6 months)
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'Mon YYYY') AS month,
             COUNT(*)::int AS count
      FROM bikes
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'Mon YYYY'), DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,

    // Dealers registered per month (last 6 months)
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'Mon YYYY') AS month,
             COUNT(*)::int AS count
      FROM users
      WHERE role = 'DEALER'
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'Mon YYYY'), DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
  ]);

  return NextResponse.json({
    bikes: {
      total: totalBikes,
      available: availableBikes,
      unavailable: totalBikes - availableBikes,
    },
    dealers: {
      total: totalDealers,
      active: activeDealers,
      pending: pendingDealers,
      inactive: totalDealers - activeDealers - pendingDealers,
    },
    bikesByBrand: bikesByBrand.map(b => ({
      brand: b.brand,
      count: b._count.brand,
    })),
    growthData: bikesPerMonth.map((b, i) => ({
      month: b.month,
      bikes: Number(b.count),
      dealers: Number(dealersPerMonth[i]?.count ?? 0),
    })),
  });
}
