import type { Metadata } from "next";
import NidusRoute from "@/components/routes/NidusRoute";
import { nidusMetadata } from "@/lib/localizedPages";

export const metadata: Metadata = nidusMetadata("nl");

export default function NidusPage() {
  return <NidusRoute language="nl" />;
}
