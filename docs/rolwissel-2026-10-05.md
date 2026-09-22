# Rolwissel — maandag 5 oktober 2026

Op die dag start Klaas als AI Transformation Expert bij In The Pocket. De site
schakelt niet automatisch: `ROLE_PHASE` in `content/role.ts` staat handmatig op
`"incoming"` of `"current"`, omdat de site statisch gebouwd wordt en een
datumcheck pas bij de volgende build effect zou hebben.

## In deze repo (lowi-cv)

1. **`content/role.ts`: `ROLE_PHASE` op `"current"`.** Dit is de enige schakel.
   Titel, meta description, statusbadge (verdwijnt), about-tekst, Jarvis-antwoorden,
   OG-afbeelding, JSON-LD, de tijdlijn en `/cv.json` volgen automatisch.
2. **`content/placeholderContent.ts`:**
   - skillcluster `analyse-systeemdenken` (context-regel): "Mijn dagelijkse vak als
     functioneel analist bij De Watergroep (Billing/SDL)" klopt dan niet meer;
   - `hero.currentRole` ("Functioneel Analist" / "Functional Analyst"): beslissen of
     de linkerkant van de tagline die achtergrond blijft tonen.
3. **`content/role.ts`: Jarvis-uitleg bij de nieuwe functie.** Voeg de tekst toe aan
   `placeholderContent.jarvisExplanations` en zet het id bij
   `CURRENT_EXPERIENCE_EXPLANATION_ID.current` (nu `null`, dus geen uitlegknop in
   de tijdlijn).
4. **`lib/site.ts`:** `CV_LAST_MODIFIED` bijwerken, en de `lastModified` van `/` in
   `PUBLIC_ROUTES` (sitemap).
5. **Controleren en uitrollen:** `npx tsc --noEmit`, `npm test`, `npm run build`,
   daarna deployen naar Vercel. Zonder nieuwe build verandert er niets, want de
   pagina's zijn statisch.
6. **IndexNow pingen** zodra de deploy live staat:
   `npm run indexnow -- --send`
   Meldt de gewijzigde URL's meteen aan bij Bing en andere IndexNow-zoekmachines
   (zie "IndexNow" in `ARCHITECTURE.md`). Google gebruikt IndexNow niet; daarvoor
   dient stap 11.

Na de build zou je dit moeten zien:

| Plek | Verwacht na de wissel |
|---|---|
| `<title>` | `Klaas Vanslambrouck \| AI Transformation Expert` (zonder "Incoming") |
| meta description | begint met `AI Transformation Expert bij In The Pocket.` |
| statusbadge in de hero | verdwenen |
| tijdlijn | In The Pocket is de huidige functie; Itineris toont `juni 2022 — sep 2026` |
| `/cv.json` | `basics.label` zonder "Incoming"; Itineris krijgt `endDate: "2026-09"` |
| JSON-LD | `jobTitle` = `AI Transformation Expert`, `worksFor` = In The Pocket (`ITP Agency NV`) |

## In nidus-api

7. **`src/pdf/CvDocument.tsx`:** tagline naar
   `AI Transformation Expert, In The Pocket · Bouwer van AI-gedreven systemen`.
8. **`src/data/cvData.ts`:** nieuwe functie toevoegen en Itineris afsluiten.
9. **Redeployen op Railway**, anders serveert `/cv.pdf` nog de oude PDF.

## Daarbuiten

10. **LinkedIn** bijwerken (functie en headline). Dat profiel staat als `sameAs` in de
    JSON-LD; een afwijking verzwakt het identiteitsanker.
11. **Google Search Console:** `/` opnieuw laten indexeren.
12. **Rich Results Test en validator.schema.org** opnieuw draaien voor `/`, `/nidus`
    en `/lowi`.
13. Optioneel: GitHub-bio, en X invullen in `SOCIAL_PROFILES` als dat profiel klopt.

## Losse eindjes die hier niet bij horen maar wel openstaan

- Een foto: `public/klaas-vanslambrouck.jpg` plus `PERSON_IMAGE_PATH` in
  `lib/structuredData.ts`.
- De CV-data leeft op drie plekken; zie "Open punten / technische schuld" in
  `ARCHITECTURE.md`.
