import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dealers — Admin: list all dealers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      role: "DEALER" as const,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status === "active" && { isActive: true, isApproved: true }),
      ...(status === "pending" && { isApproved: false }),
      ...(status === "inactive" && { isActive: false }),
    };

    const [dealers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          phone: true,
          address: true,
          isActive: true,
          isApproved: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      dealers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get dealers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/dealers — Admin: create dealer directly
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, company, phone, address, isApproved, isActive } = body;

    if (!name || !email || !password || !company || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const dealer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DEALER",
        isActive: isActive ?? true,
        isApproved: isApproved ?? true,
        company,
        phone,
        address: address || null,
      },
      select: {
        id: true, name: true, email: true, company: true,
        phone: true, isActive: true, isApproved: true, createdAt: true,
      },
    });

    return NextResponse.json(dealer, { status: 201 });
  } catch (error) {
    console.error("Create dealer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
