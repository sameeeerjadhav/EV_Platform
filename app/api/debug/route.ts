import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, string> = {
    status: "ok",
    time: new Date().toISOString(),
    node: process.version,
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
    DIRECT_URL: process.env.DIRECT_URL ? "SET" : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "MISSING",
    AUTH_URL: process.env.AUTH_URL || "MISSING",
    ADMIN_SETUP_KEY: process.env.ADMIN_SETUP_KEY ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV || "not set",
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.substring(0, 40) + "..." + process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 30)
      : "MISSING",
  };

  // Test DB only if DATABASE_URL exists
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const count = await prisma.user.count();
      result.db = `Connected - ${count} users found`;
    } catch (e: unknown) {
      result.db = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(result);
}
