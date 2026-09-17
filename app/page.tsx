import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import JsonLd from "@/components/JsonLd";
import {
  lowiSchema,
  personSchema,
  profilePageSchema,
  websiteSchema,
} from "@/lib/structuredData";

// Servercomponent: rendert de JSON-LD en de (client) CV-pagina.
// Enkel de canonical is paginaspecifiek; titel, description, openGraph,
// twitter en robots erven van app/layout.tsx.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        graph={[websiteSchema(), profilePageSchema(), personSchema(), lowiSchema()]}
      />
      <HomePage />
    </>
  );
}
