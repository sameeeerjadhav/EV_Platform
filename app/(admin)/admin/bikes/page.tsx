import type { Metadata } from "next";
import { AdminBikesClient } from "@/components/admin/AdminBikesClient";

export const metadata: Metadata = { title: "Bike Management" };

export default function AdminBikesPage() {
  return <AdminBikesClient />;
}

