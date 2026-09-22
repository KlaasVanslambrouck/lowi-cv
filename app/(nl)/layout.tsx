import type { Metadata, Viewport } from "next";
import RootDocument from "@/components/RootDocument";
import { ROOT_VIEWPORT, rootMetadata } from "@/lib/rootMetadata";

// Root layout voor alle Nederlandse routes ("/", "/nidus", "/lowi") en de
// NL-only routes /cases/* en /beheer/*. Engels heeft een eigen root layout in
// app/(en)/en; wisselen tussen beide geeft een volledige page load.
export const viewport: Viewport = ROOT_VIEWPORT;
export const metadata: Metadata = rootMetadata("nl");

export default function DutchRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="nl">{children}</RootDocument>;
}
