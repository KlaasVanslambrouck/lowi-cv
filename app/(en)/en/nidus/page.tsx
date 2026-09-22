import type { Metadata } from "next";
import NidusRoute, { nidusMetadata } from "@/components/routes/NidusRoute";

export const metadata: Metadata = nidusMetadata("en");

export default function NidusPage() {
  return <NidusRoute language="en" />;
}
