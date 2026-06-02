import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/dealers/register — public endpoint for dealer self-registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, company, phone, address } = body;

    // Validate required fields
    if (!name || !email || !password || !company || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email is taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create dealer (pending approval)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DEALER",
        isActive: true,
        isApproved: false, // requires admin approval
        company,
        phone,
        address: address || null,
      },
    });

    return NextResponse.json(
      { message: "Registration successful. Your account is pending admin approval." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Dealer register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
