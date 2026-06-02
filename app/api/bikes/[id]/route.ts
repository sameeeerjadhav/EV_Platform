import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

// GET /api/bikes/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bike = await prisma.bike.findUnique({
      where: { id },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
    });

    if (!bike) {
      return NextResponse.json({ error: "Bike not found" }, { status: 404 });
    }

    return NextResponse.json(bike);
  } catch (error) {
    console.error("Get bike error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/bikes/[id] — Admin only
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
    const {
      name, brand, model, batteryCapacity, range, topSpeed,
      chargingTime, price, description, isAvailable,
      images, // new images to add
      removedImageIds, // publicIds to remove
    } = body;

    // Delete removed images from Cloudinary
    if (removedImageIds && removedImageIds.length > 0) {
      await Promise.all(
        removedImageIds.map((publicId: string) => deleteImage(publicId))
      );
      await prisma.bikeImage.deleteMany({
        where: { publicId: { in: removedImageIds }, bikeId: id },
      });
    }

    const bike = await prisma.bike.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(model !== undefined && { model }),
        ...(batteryCapacity !== undefined && { batteryCapacity }),
        ...(range !== undefined && { range }),
        ...(topSpeed !== undefined && { topSpeed }),
        ...(chargingTime !== undefined && { chargingTime }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(images && images.length > 0 && {
          images: {
            create: images.map((img: { url: string; publicId: string; isPrimary: boolean }) => ({
              url: img.url,
              publicId: img.publicId,
              isPrimary: img.isPrimary,
            })),
          },
        }),
      },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
    });

    return NextResponse.json(bike);
  } catch (error) {
    console.error("Update bike error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/bikes/[id] — Admin only
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

    // Get all images to delete from Cloudinary
    const bike = await prisma.bike.findUnique({
      where: { id },
      include: { images: { select: { publicId: true } } },
    });

    if (!bike) {
      return NextResponse.json({ error: "Bike not found" }, { status: 404 });
    }

    // Delete from Cloudinary (cascade deletes images from DB via Prisma)
    if (bike.images.length > 0) {
      await Promise.all(
        bike.images.map((img) => deleteImage(img.publicId))
      );
    }

    await prisma.bike.delete({ where: { id } });

    return NextResponse.json({ message: "Bike deleted successfully" });
  } catch (error) {
    console.error("Delete bike error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
