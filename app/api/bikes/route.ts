import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

// GET /api/bikes — All authenticated users can list bikes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const availability = searchParams.get("isAvailable") || "all";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { brand: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(brand && { brand: { contains: brand, mode: "insensitive" as const } }),
      ...(availability === "true" && { isAvailable: true }),
      ...(availability === "false" && { isAvailable: false }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    };

    const [bikes, total, brands] = await Promise.all([
      prisma.bike.findMany({
        where,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.bike.count({ where }),
      prisma.bike.findMany({
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
    ]);

    return NextResponse.json({
      bikes,
      brands: brands.map((b) => b.brand),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bikes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/bikes — Admin only
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, brand, model, batteryCapacity, range, topSpeed,
      chargingTime, price, description, isAvailable, images,
    } = body;

    const bike = await prisma.bike.create({
      data: {
        name,
        brand,
        model,
        batteryCapacity,
        range,
        topSpeed,
        chargingTime,
        price: parseFloat(price),
        description,
        isAvailable: isAvailable ?? true,
        images: {
          create: images?.map((img: { url: string; publicId: string; isPrimary: boolean }) => ({
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary,
          })) || [],
        },
      },
      include: { images: true },
    });

    return NextResponse.json(bike, { status: 201 });
  } catch (error) {
    console.error("Create bike error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
