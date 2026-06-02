import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dealers/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dealer = await prisma.user.findUnique({
      where: { id, role: "DEALER" },
      select: {
        id: true, name: true, email: true, company: true,
        phone: true, address: true, isActive: true, isApproved: true, createdAt: true,
      },
    });

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    return NextResponse.json(dealer);
  } catch (error) {
    console.error("Get dealer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/dealers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, company, phone, address, isActive, isApproved } = body;

    const dealer = await prisma.user.update({
      where: { id, role: "DEALER" },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(company !== undefined && { company }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
        ...(isApproved !== undefined && { isApproved }),
      },
      select: {
        id: true, name: true, email: true, company: true,
        phone: true, isActive: true, isApproved: true,
      },
    });

    return NextResponse.json(dealer);
  } catch (error) {
    console.error("Update dealer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/dealers/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.user.delete({ where: { id, role: "DEALER" } });

    return NextResponse.json({ message: "Dealer deleted" });
  } catch (error) {
    console.error("Delete dealer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
