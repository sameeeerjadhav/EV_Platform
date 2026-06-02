import type { Metadata } from "next";
import { AdminDealersClient } from "@/components/admin/AdminDealersClient";

export const metadata: Metadata = { title: "Dealer Management" };

export default function AdminDealersPage() {
  return <AdminDealersClient />;
}
