import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import JsonLd from "@/components/JsonLd";
import { localizedPath } from "@/lib/site";
import {
  lowiSchema,
  personSchema,
  profilePageSchema,
  websiteSchema,
} from "@/lib/structuredData";
import type { Language } from "@/types/content";

// Gedeeld door app/(nl)/page.tsx en app/(en)/en/page.tsx.
// Enkel de canonical is paginaspecifiek; titel, description, openGraph,
// twitter en robots erven van de root layout.
export function homeMetadata(language: Language): Metadata {
  return {
    alternates: {
      canonical: localizedPath("/", language),
    },
  };
}

// Servercomponent: rendert de JSON-LD en de (client) CV-pagina.
export default function HomeRoute() {
  return (
    <>
      <JsonLd
        graph={[websiteSchema(), profilePageSchema(), personSchema(), lowiSchema()]}
      />
      <HomePage />
    </>
  );
}
