# Redesign klaasvanslambrouck.dev — overdracht voor Claude Code / Codex

Ontwerpbron: Design-canvas "Portfolio-redesign — schetsboek" (claude.ai).
Deze map bevat een kopie van dat canvas, zodat een agent in VS Code het kan lezen.

```
docs/redesign/
├── HANDOFF.md          ← dit bestand: lees eerst
├── artboards/          ← ontwerpbron (.dc.html), NIET kopiëren naar de app
│   ├── Stijl.dc.html   ← tokens, accenten, timings, toestanden
│   ├── Home.dc.html · Lowi.dc.html · Nidus.dc.html   ← de drie pagina's
│   ├── Cel.dc.html     ← celmodel (SVG, fasen, camera, labels)
│   ├── Jarvis.dc.html  ← herstyling JarvisAsk
│   ├── NidusEmbed/NidusScreen.dc.html ← 1-op-1 weergave van NidusMockups (referentie)
│   └── Main/Overdracht/Celstanden/…   ← inventaris, overdracht, celstanden
└── screenshots/        ← gerenderde referentiebeelden (desktop, mobiel, donker + X-ray)
```

**Belangrijk over de .dc.html-bestanden:** dat is het formaat van het ontwerpcanvas
(`<x-dc>`, `{{holes}}`, `class Component extends DCLogic`). Het is een leesbare
ontwerpbron met exacte waarden (kleuren, maten, paden, copy, toestanden), geen code
om over te nemen. Implementeer in de bestaande Next.js-app met React-componenten en
CSS Modules.

---

## Harde grenzen

1. `components/nidus/NidusMockups.tsx`, `NidusDashboardDetail.tsx`, `NidusEnergyDetail.tsx`
   en `styles/nidusMockup.module.css` **niet aanraken**. Alleen hun plek op de pagina verandert.
2. Geen iframe introduceren. De embed blijft een gewone component.
3. De bestaande `--cv-*`-variabelen in `app/globals.css` blijven bestaan (NidusMockups
   gebruikt ze). Nieuwe tokens komen erbij onder `.portfolio-design`, niet in plaats van.
4. Geen globale resets of body/button-regels toevoegen.
5. Alle bestaande NL/EN-copy, routes (`/`, `/lowi`, `/nidus`, `/en/...`) en ankers blijven.
6. Jarvis: `JarvisAsk.tsx` en `JarvisExplainPanel.tsx` behouden hun gedrag
   (fetch, sessie, foutcodes, Escape, scrim). Alleen styling.
7. Conceptcopy (zie Main.dc.html §4) achter een `// TODO concept-copy` zetten.
8. Reduced motion: alle accenten direct in eindtoestand. Inhoud zichtbaar zonder JS.

## Werkwijze: vier aparte sessies

Doe het in stappen, elk op een eigen branch-commit, zodat je na elke fase kan
nakijken in de browser. Eén gigantische prompt geeft een onbeheersbare diff.

| Fase | Wat | Artboards |
|---|---|---|
| 1 | Tokens, fonts, accentcomponenten (`useSketchReveal`, Highlight, Underline, Strike, MarginNote, Arrow, Stamp) | Stijl |
| 2 | Nidus-pagina: volgorde + omliggende layout, embed ongewijzigd | Nidus, NidusEmbed |
| 3 | Homepage: header, hero met systeemschets, luik Nidus/LOWI, secties, X-ray, Jarvis-styling | Home, Jarvis, Jarvis-staten |
| 4 | LOWI: layout (tekst links, cel rechts sticky, hoofdstukbalk) + celmodel | Lowi, Cel, Celstanden |

---

## Prompt fase 0 — verkennen (niets wijzigen)

```text
Lees docs/redesign/HANDOFF.md en daarna ARCHITECTURE.md.
Bekijk docs/redesign/artboards/Main.dc.html en Overdracht.dc.html.
Wijzig nog niets. Geef me:
1. welke bestanden je per fase zal aanpassen of aanmaken;
2. waar de huidige code afwijkt van wat de overdracht verwacht;
3. risico's voor NidusMockups, JarvisAsk en de /en-routes.
```

## Prompt fase 1 — tokens en accenten

```text
Fase 1 uit docs/redesign/HANDOFF.md.
Bron: docs/redesign/artboards/Stijl.dc.html (en de CSS-klassen .dr/.drs/.drl/.hl/.wr/.st/.pf
in Home.dc.html). Kijk naar docs/redesign/screenshots/Stijl.jpg.
- Voeg de fonts Alfa Slab One, Karla en Caveat toe via next/font (naast de bestaande).
- Maak styles/sketchbook.module.css met de tokens voor licht/donker onder .portfolio-design.
  Thema volgt het bestaande data-cv-theme; X-ray blijft los van thema.
- Maak hooks/useSketchReveal.ts (IntersectionObserver, eenmalig, reduced motion en print = eindtoestand).
- Maak components/sketch/: Highlight, Underline, Strike, MarginNote, Arrow, Stamp.
  Vaste SVG-paden uit de artboards, aria-hidden op decoratie, notities als echte tekst.
- Nog geen pagina's aanpassen. Voeg een test toe voor useSketchReveal.
Draai daarna npm run typecheck, npm run lint en npm test.
```

## Prompt fase 2 — Nidus

```text
Fase 2 uit docs/redesign/HANDOFF.md.
Bron: docs/redesign/artboards/Nidus.dc.html + screenshots/Nidus.jpg en Nidus-mobiel*.jpg.
- In components/routes/NidusRoute.tsx: volgorde NidusIntro → nidus-screenshots (NidusMockups)
  → nidus-architectuur → nidus-decision-log → nidus-code. Id's ongewijzigd.
- Herstyle NidusIntro, NidusArchitecture en NidusDecisionLog volgens het artboard.
  Architectuur: alleen de pijlen nidus-mobile → nidus-api en nidus-api → Supabase tekenen.
- NidusMockups en nidusMockup.module.css NIET wijzigen.
- Vergelijk vóór/na screenshots van de embed (Web/Mobiel, Vandaag/Energie, licht/donker).
Draai typecheck, lint en tests.
```

## Prompt fase 3 — homepage

```text
Fase 3 uit docs/redesign/HANDOFF.md.
Bron: docs/redesign/artboards/Home.dc.html, Jarvis.dc.html, Jarvis-staten.dc.html
+ screenshots/Home*.jpg en Jarvis-staten.jpg.
- Header: Werk (#projects) · LOWI · Nidus · Contact (#contact), NL/EN en thema rechts;
  Normaal/X-ray klein rechts onder de header (bestaande XrayToggle, andere styling).
- Hero volgens het artboard, met de systeemschets Interfaces ⇄ API ⇄ Data
  (in X-ray: nidus · mobile / nidus-api / Supabase).
- Nieuw luik Nidus | LOWI na de hero; daarna de bestaande secties in de volgorde van het artboard.
- JarvisExplainButton opent nog steeds JarvisExplainPanel (geen chat).
- JarvisAsk: alleen JarvisAsk.module.css aanpassen.
- Conceptcopy achter // TODO concept-copy.
Controleer NL, EN, licht, donker en X-ray (4 combinaties) op 1440, 768, 390 en 320 px.
```

## Prompt fase 4 — LOWI en de cel

```text
Fase 4 uit docs/redesign/HANDOFF.md.
Bron: docs/redesign/artboards/Lowi.dc.html, Cel.dc.html, Celstanden.dc.html
+ screenshots/Lowi*.jpg en Celstanden.jpg.
- LowiCelPagina: tekst links, cel rechts sticky, hoofdstukbalk horizontaal en sticky.
  Hoofdstuk-id's lowi-cel-* en de uitklapper "Van idee naar systeem · Nidus" blijven.
- Behoud useScrollVoortgang, SceneBoundary, fallback en analytics.
- Celmodel: stel eerst voor welke route je kiest en wacht op mijn akkoord:
  (a) nieuw SVG-component volgens Cel.dc.html (fasen, camera, HTML-labels), of
  (b) de R3F-scene houden maar geometrie aanpassen (ruw/glad ER, blaasjes,
      DnaHelix vervangen door chromatine, papierpalet, getekende contour).
- Deling: drie deelstanden (chromosomen midden → naar de polen → twee kernen + insnoering).
Draai typecheck, lint en tests.
```

---

## Acceptatie (na elke fase)

- [ ] NidusMockups ziet er binnenin exact hetzelfde uit (vóór/na-screenshots).
- [ ] Alle links, ankers, `/en`-routes, CV, LinkedIn, mailto werken.
- [ ] NL/EN en licht/donker op drie routes; X-ray × thema = 4 combinaties op home.
- [ ] Toetsenbord: zichtbare focus, hoofdstukknoppen, uitklapper, Jarvis (Esc sluit).
- [ ] Contrast ≥ 4,5:1 voor lopende tekst.
- [ ] Reduced motion: alles in eindtoestand; cel met directe standen.
- [ ] Geen horizontale scroll op 320 px; touch-doelen ≥ 44 px.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` groen.

## Open punten

- Biologische controle van de celtekening en labels vóór livegang.
- OFL-licentieteksten voor Alfa Slab One, Karla, Caveat.
- Conceptcopy beoordelen (lijst in Main.dc.html §4).

---

## Beslissingen

Genomen na de verkenning (fase 0). Deze gaan voor op de prompts hierboven.

### 1. SiteHeader en SiteFooter al in fase 2

- Bouw in fase 2 `SiteHeader` en `SiteFooter` als gedeelde componenten en gebruik ze
  meteen op `/nidus` (en `/en/nidus`). In fase 3 neemt de homepage ze over; Nidus hoeft
  dan niet opnieuw aangepast te worden. In fase 4 volgt LOWI.
- Configureerbaar via props: welke navigatielink actief is (`aria-current="page"`) en of
  de X-ray-knop getoond wordt (alleen op home).
- `LanguageToggle`, `ThemeToggle` en `XrayToggle` blijven de logica leveren (route-wissel,
  `data-cv-theme`, XrayContext, analytics). Alleen hun styling en plek veranderen.
- Alle interne links via `localizedPath` (`/cv.pdf` niet vertalen).
- `ControlStack` mag pas weg na fase 3, zodra alle drie de routes de nieuwe header gebruiken.

### 2. De drie 3D-scènes op home: niet meer tonen, nog niet verwijderen

- In het ontwerp komt geen van de drie terug. De hero-scène (`ArchitectureScene`) wordt
  vervangen door de getekende schets Interfaces ⇄ API ⇄ Data; `ArchitectureSceneMini` en
  `SkillConstellation` krijgen geen plek.
- Haal ze in fase 3 uit `HomePage.tsx` (en `Hero.tsx`/`Skills.tsx`). De bestanden en de
  three.js-pakketten blijven staan: de LOWI-cel gebruikt three.js nog, en de keuze over
  de celrenderer valt pas in fase 4.
- Zelfde regel voor `LiveStatBadge` en `CareerMotifBackground`, als die nog op home staan:
  niet tonen, later opruimen.
- Verwijder alle ongebruikte bestanden in een aparte commit ná fase 4, zodat dat
  makkelijk terug te draaien is.

### 3. JarvisAsk: kleine markupwijzigingen mogen, gedrag blijft gelijk

Toegestaan:

- sluiticoon als SVG in plaats van de letter "x", met dezelfde `aria-label`;
- `role="alert"` op de foutmelding;
- na sluiten gaat de focus terug naar de openknop.

Niet toegestaan: andere teksten, andere state, andere fetch- of foutlogica, of
verwijderde elementen (scrim, sluiten met Escape blijven). Vermeld elke markupwijziging
in de commitboodschap.

### 4. jsdom en Playwright als devDependency

- **jsdom:** zet de omgeving per testbestand met `// @vitest-environment jsdom`, niet
  globaal in `vitest.config.ts`, zodat de bestaande tests ongemoeid blijven.
- **Playwright:** alleen voor de vóór/na-screenshots, via een eigen script
  (`npm run screenshots`), buiten `npm test`. Browser installeren met
  `npx playwright install chromium`.
- **Baseline vóór fase 1**, op de huidige stand: Nidus-embed Web/Mobiel × Vandaag/Energie
  × licht/donker, op 1440 en 390 px. Zonder baseline is er straks niets om mee te
  vergelijken.

### 5. Fase 4: celmodel via route (a), SVG

Nieuw SVG-component volgens `Cel.dc.html`, in plaats van de R3F-scene.

- **Zonder JS:** de server rendert de SVG in de overzichtsstand; een volledige cel
  met labels.
- **Reduced motion:** de cel springt direct naar elke stand, zonder de camerabeweging
  van 850 ms en zonder wobble-filter. De pauzeknop blijft.
- **Thema:** verandert alleen CSS-variabelen; de SVG wordt niet opnieuw opgebouwd.
- **Labels:** HTML, geen SVG-`<text>`, in NL en EN uit `content/lowiCellContent.ts`
  of een nieuw contentbestand. De clamp/flip-logica uit `Cel.dc.html` gaat mee, zodat
  labels op 320 px niet buiten beeld vallen.
- **Deling:** de drie deelstanden werken via `[data-phase]` in `useScrollVoortgang`.
  De bestaande `data-section-id`'s, analytics-events en `SceneBoundary` blijven
  ongewijzigd.
- **Copy:** `// TODO concept-copy` bij alle nieuwe teksten. Het bijschrift
  "Artistieke visualisatie · niet op schaal" blijft staan tot Klaas de nieuwe tekst
  bevestigt.
- **Screenshots:** vóór/na van `/lowi` en `/en/lowi` op 1440 en 390 px, licht en donker.

### 6. three.js opruimen: aparte commit na fase 4

Pas na een zoekactie over de hele repo:

```
rg "three|@react-three|three-stdlib" --glob "!node_modules" --glob "!docs/**"
```

Let vooral op `components/biotech-case/experiment/LabScene.tsx`,
`ArchitectureScene*.tsx`, `SkillConstellationCanvas.tsx` en de `/cases`-routes.

- Gebruikt geen enkel ander bestand three: verwijder `three`, `@react-three/fiber`,
  `@react-three/drei`, `@react-three/postprocessing`, `three-stdlib` en `@types/three`.
- Gebruikt iets buiten LOWI of home het nog: laat de packages staan en verwijder
  alleen de LOWI-scene, `DnaHelix`, de 8 stills en de ongebruikte home-3D-componenten.
- In beide gevallen eerst melden wat er gevonden is, vóór de commit.
- Daarna typecheck, lint, test en build, en de bundelgrootte vóór en na vergelijken.
