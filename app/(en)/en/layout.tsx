import type { Metadata, Viewport } from "next";
import RootDocument from "@/components/RootDocument";
import { ROOT_METADATA, ROOT_VIEWPORT } from "@/lib/rootMetadata";

// Root layout voor de Engelse routes onder /en. Zelfde document als de
// Nederlandse layout, alleen <html lang> verschilt.
export const viewport: Viewport = ROOT_VIEWPORT;
export const metadata: Metadata = ROOT_METADATA;

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
