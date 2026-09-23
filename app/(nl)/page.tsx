import type { Metadata } from "next";
import HomeRoute from "@/components/routes/HomeRoute";
import { homeMetadata } from "@/lib/localizedPages";

export const metadata: Metadata = homeMetadata("nl");

export default function Page() {
  return <HomeRoute language="nl" />;
}
