import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DealerForm } from "@/components/admin/DealerForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Dealer" };

export default async function EditDealerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dealer = await prisma.user.findUnique({
    where: { id, role: "DEALER" },
    select: {
      id: true, name: true, email: true, company: true,
      phone: true, address: true, isActive: true, isApproved: true,
    },
  });

  if (!dealer) notFound();

  return <DealerForm dealer={dealer} />;
}
