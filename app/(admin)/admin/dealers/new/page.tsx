import type { Metadata } from "next";
import { DealerForm } from "@/components/admin/DealerForm";

export const metadata: Metadata = { title: "Add Dealer" };

export default function NewDealerPage() {
  return <DealerForm />;
}

