import type { Metadata } from "next";
import NidusRoute, { nidusMetadata } from "@/components/routes/NidusRoute";

export const metadata: Metadata = nidusMetadata("nl");

export default function NidusPage() {
  return <NidusRoute language="nl" />;
}
