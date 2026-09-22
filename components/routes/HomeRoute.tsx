import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import JsonLd from "@/components/JsonLd";
import { TranslationProvider } from "@/context/TranslationContext";
import { pageMetadata } from "@/lib/pageMetadata";
import { pageLanguageLinks, type PageLocation } from "@/lib/site";
import {
  lowiSchema,
  personSchema,
  profilePageSchema,
  websiteSchema,
} from "@/lib/structuredData";
import type { Language } from "@/types/content";

// Gedeeld door app/(nl)/page.tsx en app/(en)/en/page.tsx.

function homePage(language: Language): PageLocation {
  return { basePath: "/", language };
}

// Titel en description erven van de root layout van de taal.
export function homeMetadata(language: Language): Metadata {
  return pageMetadata({ ...homePage(language), ogType: "profile" });
}

interface HomeRouteProps {
  language: Language;
}

// Servercomponent: rendert de JSON-LD en de (client) CV-pagina.
export default function HomeRoute({ language }: HomeRouteProps) {
  const { alternatePath } = pageLanguageLinks(homePage(language));

  return (
    <>
      <JsonLd
        graph={[websiteSchema(), profilePageSchema(), personSchema(), lowiSchema()]}
      />
      <TranslationProvider alternatePath={alternatePath}>
        <HomePage />
      </TranslationProvider>
    </>
  );
}
