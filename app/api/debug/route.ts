import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET ✓" : "MISSING ✗",
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET ✓" : "MISSING ✗",
    ADMIN_SETUP_KEY: process.env.ADMIN_SETUP_KEY ? "SET ✓" : "MISSING ✗",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test DB connection
  let dbStatus = "Not tested";
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "Connected ✓";
  } catch (e: unknown) {
    dbStatus = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ checks, dbStatus });
}
