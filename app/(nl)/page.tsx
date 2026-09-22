import type { Metadata } from "next";
import HomeRoute, { homeMetadata } from "@/components/routes/HomeRoute";

export const metadata: Metadata = homeMetadata("nl");

export default function Page() {
  return <HomeRoute language="nl" />;
}
