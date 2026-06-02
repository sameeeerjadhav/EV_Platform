import type { Metadata } from "next";
import { BikeForm } from "@/components/admin/BikeForm";

export const metadata: Metadata = { title: "Add New Bike" };

export default function NewBikePage() {
  return <BikeForm />;
}
