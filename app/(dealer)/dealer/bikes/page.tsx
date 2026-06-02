import type { Metadata } from "next";
import { DealerBikesClient } from "@/components/dealer/DealerBikesClient";

export const metadata: Metadata = { title: "Browse Bikes" };

export default function DealerBikesPage() {
  return <DealerBikesClient />;
}

