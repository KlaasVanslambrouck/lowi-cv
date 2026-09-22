import type { Metadata } from "next";
import HomeRoute, { homeMetadata } from "@/components/routes/HomeRoute";

export const metadata: Metadata = homeMetadata("en");

export default function Page() {
  return <HomeRoute />;
}
