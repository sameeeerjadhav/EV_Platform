import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== "fix-admin-2024") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Hash password using the SAME bcryptjs version the server uses
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    // Delete existing admin and create fresh
    await prisma.user.deleteMany({ where: { email: "admin@ev.com" } });
    
    const user = await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@ev.com",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
        isApproved: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin created! Login with admin@ev.com / Admin@123",
      userId: user.id,
      hashPreview: hashedPassword.substring(0, 20) + "..."
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
