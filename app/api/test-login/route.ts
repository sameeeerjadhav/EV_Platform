import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") || "admin@ev.com";
  const password = request.nextUrl.searchParams.get("password") || "Admin@123";

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ error: "User not found", email });
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
      passwordValid: isValid,
      hashStart: user.password.substring(0, 15),
      authUrl: process.env.AUTH_URL,
      nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
      authSecret: process.env.AUTH_SECRET ? "SET" : "MISSING",
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
