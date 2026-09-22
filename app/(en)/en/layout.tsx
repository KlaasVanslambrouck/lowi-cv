import type { Metadata, Viewport } from "next";
import RootDocument from "@/components/RootDocument";
import { ROOT_VIEWPORT, rootMetadata } from "@/lib/rootMetadata";

// Root layout voor de Engelse routes onder /en. Zelfde document als de
// Nederlandse layout, alleen <html lang> en de metadata-taal verschillen.
export const viewport: Viewport = ROOT_VIEWPORT;
export const metadata: Metadata = rootMetadata("en");

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
