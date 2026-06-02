import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BikeForm } from "@/components/admin/BikeForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Bike" };

export default async function EditBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bike = await prisma.bike.findUnique({
    where: { id },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
  });

  if (!bike) notFound();

  return (
    <BikeForm
      bike={{
        id: bike.id,
        name: bike.name,
        brand: bike.brand,
        model: bike.model,
        batteryCapacity: bike.batteryCapacity,
        range: bike.range,
        topSpeed: bike.topSpeed,
        chargingTime: bike.chargingTime,
        price: String(bike.price),
        description: bike.description,
        isAvailable: bike.isAvailable,
        images: bike.images,
      }}
    />
  );
}
