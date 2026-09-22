import type { Metadata } from "next";
import LowiRoute, { lowiMetadata } from "@/components/routes/LowiRoute";

export const metadata: Metadata = lowiMetadata("en");

export default function LowiPage() {
  return <LowiRoute language="en" />;
}
