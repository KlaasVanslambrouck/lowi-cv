import type { Metadata } from "next";
import NidusRoute from "@/components/routes/NidusRoute";
import { nidusMetadata } from "@/lib/localizedPages";

export const metadata: Metadata = nidusMetadata("en");

export default function NidusPage() {
  return <NidusRoute language="en" />;
}
