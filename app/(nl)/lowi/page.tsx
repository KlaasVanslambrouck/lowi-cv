import type { Metadata } from "next";
import LowiRoute from "@/components/routes/LowiRoute";
import { lowiMetadata } from "@/lib/localizedPages";

export const metadata: Metadata = lowiMetadata("nl");

export default function LowiPage() {
  return <LowiRoute language="nl" />;
}
