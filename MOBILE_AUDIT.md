# MOBIELE AUDIT — lowi-cv (2026-07-06)

Vervolg op AUDIT.md: de daar gemarkeerde ontbrekende live browsertest, gericht
uitgevoerd op mobiele en tablet-viewports. Getest op de productie-build
(`next build` + `next start`), dark én light kwamen aan bod (headless default
was light; het themasysteem gebruikt dezelfde layout-CSS voor beide).

---

## 1. Gebruikte tooling

**Echte browser-rendering** via `playwright-core` + de lokaal aanwezige
Playwright-Chromium (`chromium-1228`, headful engine, geen download nodig).
Per viewport is de pagina daadwerkelijk gerenderd met touch-emulatie
(`isMobile`, `hasTouch`, `deviceScaleFactor: 2`), waarna zowel screenshots als
programmatique metingen zijn gedaan (bounding boxes, computed styles,
overflow-detectie, tap-interacties, CPU-throttling via CDP). Redenering is dus
gebaseerd op echte renders, niet enkel op CSS-lezing.

Screenshots staan in de sessie-scratchpad:
`C:\Users\KlSla\AppData\Local\Temp\claude\c--Users-KlSla-lowi-cv\9a2555ae-930a-46c9-9e71-1f83ac7472ee\scratchpad\mobile-audit-screenshots\`

| Bestand | Inhoud |
|---|---|
| `{viewport}-hero.png` | Eerste scherm per viewport (7 viewports) |
| `{viewport}-full.png` | Volledige pagina per viewport (7 viewports) |
| `320x568-longname-hero.png` | Edge case: extra lange naam in de hero |
| `390x844-exploded-view.png` | ProjectCard na tap op "lagen" |
| `390x844-jarvis-panel.png` | Jarvis-uitlegpaneel als bottom sheet |
| `844x390-phone-landscape-hero-AFTER.png` | Landscape-hero ná de fix |
| `320x568-hero-AFTER.png` | Kleinste viewport ná de fixes |

⚠️ De scratchpad is tijdelijk — kopieer de screenshots als je ze wil bewaren.

---

## 2. Checklist-resultaten

Geteste viewports: 320×568, 375×667, 390×844, 414×896, 768×1024 (portrait),
1024×768 (landscape), 844×390 (telefoon landscape).

### Fixed-position elementen

| Check | Status | Bevinding |
|---|---|---|
| Toggles overlappen niet / vallen niet buiten beeld | ✅ | Op alle 7 viewports: verticaal gestapeld rechtsboven, geen overlap, volledig in beeld (op 320px: x≥159, past). Gemeten bounding boxes, geen enkel overlappaar. |
| JarvisPresence botst niet | ✅ | Op <768px breed is het paneel verborgen (bewuste CSS-keuze). Op tablet/landscape: rechtsonder, `pointer-events: none`, geen botsing met andere fixed elementen. Bottom-offset respecteert nu ook safe-area (fix 4). |
| `env(safe-area-inset-*)` aanwezig | ❌ → ✅ gefixt | Ontbrak volledig; ook `viewport-fit=cover` ontbrak (zonder die meta zijn de env()-waarden altijd 0 op iOS). Beide toegevoegd (fix 4). |

### Hero + ArchitectureScene / fallback

| Check | Status | Bevinding |
|---|---|---|
| <768px toont SVG-fallback, geen WebGL | ✅ | Visueel + programmatisch bevestigd: 0 `<canvas>`-elementen op 320/375/390/414; de SVG-fallback rendert. Op 768×1024 en 1024×768 rendert WebGL (hero + constellation) — conform de bestaande logica (breakpoint is `max-width: 767px`, dus 768 = WebGL). |
| Fallback-tekst leesbaar op 320px | ✅ | Naam, current→target-rol, thesis en LIVE-badge volledig zichtbaar en niet afgesneden (screenshot `320x568-hero.png`). Edge case met lange naam ("Maximiliaan-Alexander Van Der Slambroucke-Vermeulen"): breekt netjes af over meerdere regels, geen overflow, `scrollWidth` blijft 320. De h1 gebruikt responsive sizing (gemeten: 41.6px op 320 → 53.8px op 768 → 71.7px op 1024, dus `clamp()`/vw-gebaseerd — geen fix nodig). |
| Landscape-telefoon (844×390) | ❌ → ✅ gefixt | **Belangrijkste bevinding van de audit.** Vóór de fix rendert de WebGL-scene (844 ≥ 768 breed) en staan scene-nodes en labels ("supabase", "lowi", "jarvis") dwars dóór de H1-titel — de safe-zone-berekening dekt dit korte-brede formaat niet (screenshot `844x390-phone-landscape-hero.png`). Gefixt door "klein scherm" in `useSceneSupport` uit te breiden met `(max-height: 500px)` (fix 1); daarna toont landscape de statische lage-opaciteit SVG-fallback en is de titel volledig leesbaar (`...-AFTER.png`). De hero vult in landscape exact één schermhoogte (100svh) — geen oncomfortabel lange scroll. |

### Touch targets & interactie

| Check | Status | Bevinding |
|---|---|---|
| Alle interactieve elementen ≥44×44px | ❌ → ✅ gefixt | Gemeten vóór de fix: taal- (h 37), thema- (h 35) en X-ray-toggle (h 35), "Vraag Jarvis hierover" (h 25), "lagen"-toggle (61×26), footerlinks (h 27), lowi-link (h 21), Jarvis-sluitknop (38×38) — allemaal onder 44px hoog. Gefixt met onzichtbare tikgebied-vergroting op touch-apparaten (fix 2); hertest: **nul** resterende targets onder 44×44, en de vergrote tikgebieden van de drie gestapelde toggles overlappen elkaar niet (gemeten: 17–61, 63–107, 111–155 px). |
| ProjectCard exploded-view werkt op tap | ✅ | Tap op "lagen" op 390×844 zet `aria-pressed=true` en klapt de lagen uit; uitgeklapte staat blijft binnen het scherm, geen overflow (screenshot `390x844-exploded-view.png`). |
| SkillConstellation-fallback (tag-grid) | ✅ | 8 tags, geen horizontale overflow. De tags zijn bewust níét interactief (puur informatieve chips); er is dus geen tap-interactie die kan falen. Zie §4.3 voor de kanttekening. |

### Typografie & leesbaarheid

| Check | Status | Bevinding |
|---|---|---|
| Fraunces-koppen breken niet op 320px | ✅ | Geen enkele h1–h4 met `scrollWidth > clientWidth` op welke viewport dan ook; responsive font-sizing is al aanwezig. Ook met de lange-naam-edge-case blijft alles binnen de pagina. |
| DM Mono labels/cijfers leesbaar | ✅ | Kleinste gemeten mono-size ±0.68rem (~10.9px) op de toggles/labels — compact maar leesbaar op de screenshots; geen overlappende of afgeknepen labels gevonden. |
| Career-motieven vs. timeline-tekst | ✅ | Opacity 0.14–0.18 + `text-shadow` op de content; op alle screenshots (incl. 320px) blijft de timeline-tekst goed leesbaar. |

### Layout & overflow

| Check | Status | Bevinding |
|---|---|---|
| Geen horizontale scroll op enige viewport | ✅ | `document.scrollWidth == innerWidth` op alle 7 viewports, ook na de exploded-view-interactie en met lange naam. De elementen die wél breder meten dan de viewport zitten allemaal in eigen scroll/clip-containers: `.codeBlock` heeft `overflow-x: auto` (code scrollt intern — correct gedrag), de stage-light-beams zitten in een `contain: paint`-container. |
| ContactFooter stapelt leesbaar | ✅ | E-mail, LinkedIn en locatie wrappen netjes (flex-wrap, gap 1.5rem); niets afgeknot op 320px. Download-knop is momenteel verborgen (`cvPdfAvailable: false` — zie vorige cleanup). |
| LowiSection/ProjectCards stapelen in één kolom | ✅ | Op alle mobiele viewports één kolom; geen geknepen multi-kolom. |
| JarvisTerminal + toetsenbord | ✅ n.v.t. | De terminal is een inline sectie (geen overlay/modal) en de input is bewust `disabled` (placeholder tot de nidus-api-koppeling) — het mobiele toetsenbord kan dus nooit openen. Preventief wél `100dvh`/safe-area toegevoegd waar relevant (fix 3): `.cvPage` en het Jarvis-bottom-sheet (`75dvh`). De hero gebruikte al `100svh` — dat is correct. Het Jarvis-uitlegpaneel als bottom sheet: binnen viewport, scrim aanwezig, sluit via knop (nu 44×44). |

### Performance (mobiel-klasse hardware, CPU 4× geknepen via CDP)

| Check | Status | Bevinding |
|---|---|---|
| Career-motief-animaties vlot | ✅ | Tijdens een volledige pagina-scroll met 4× CPU-throttle op 390×844: gemiddelde frametijd 24.4ms (~41fps), slechts 3 van 133 frames >50ms (en die vallen samen met de programmatische scroll-sprongen zelf). Geen systemische jank. |
| Scroll-reveal (IntersectionObserver) soepel | ✅ | Zelfde meting; reveals triggeren zonder merkbare layout-thrashing. Geen console-errors op enige viewport. |

---

## 3. Doorgevoerde fixes

1. **WebGL-scene overlapt hero-titel op landscape-telefoons** —
   [hooks/useSceneSupport.ts](hooks/useSceneSupport.ts): de smallScreen-query is
   uitgebreid van `(max-width: 767px)` naar
   `(max-width: 767px), (max-height: 500px)`. Landscape-telefoons (bv. 844×390)
   krijgen nu dezelfde SVG/tag-grid-fallbacks als portrait; tablets
   (768×1024 en 1024×768) behouden WebGL — hertest bevestigt beide. Dit is de
   enige fix die gedrag verandert; zie §4.1 als je dit wil heroverwegen.

2. **Touch targets <44×44px** — [styles/cv.module.css](styles/cv.module.css),
   nieuw blok `@media (pointer: coarse)` onderaan: alle kleine interactieve
   elementen (taal-/thema-/X-ray-toggle, "Vraag Jarvis hierover", "lagen",
   footerlinks, lowi-link, Jarvis-sluitknop) krijgen een onzichtbare,
   gecentreerde `::after` van minstens 44×44px — het visuele ontwerp blijft
   pixel-identiek. De verticale afstand tussen de drie gestapelde toggles is op
   touch-apparaten iets vergroot (pitch 42→48px) zodat de tikgebieden elkaar
   niet overlappen. De Jarvis-sluitknop op mobiel is visueel verhoogd van
   2.35rem (37.6px) naar 2.75rem (44px).

3. **`dvh` waar `vh` mobiel afwijkt** — `.cvPage` kreeg `min-height: 100dvh`
   (met `100vh`-fallbackregel erboven); het Jarvis-bottom-sheet ging van
   `max-height: 75vh` naar `75dvh` (idem fallback). De hero stond al op
   `100svh` en is ongemoeid gelaten.

4. **Safe-area-insets** — [app/layout.tsx](app/layout.tsx) exporteert nu een
   `viewport` met `viewportFit: "cover"`, en alle fixed elementen
   (drie toggles, JarvisPresence, JarvisExplainPanel incl. bottom-sheet-padding)
   verrekenen `env(safe-area-inset-top/right/bottom, 0px)` in hun offsets.
   Zonder notch verandert er niets (env = 0); mét notch/home-indicator blijven
   de elementen vrij.

Validatie na de fixes: `npm run build` schoon (0 errors/warnings),
`npm run lint` schoon, en de volledige hertest op 390×844, 844×390, 768×1024
en 320×568 is groen (0 te kleine targets, 0 overlaps, 0 overflow, fallback in
landscape, WebGL behouden op tablet).

## 4. Zelf te beoordelen (niet gefixt)

1. **De landscape-fallback-keuze (fix 1) is een gedragswijziging.** De
   bestaande logica was width-only en 844×390 viel daardoor formeel niet onder
   de "regressie"-definitie; ik heb tóch gefixt omdat de tekst-overlap een hard
   visueel defect is (zie before/after-screenshots) en de height-clausule de
   bestaande "mobiel → fallback"-intentie volgt. Wil je op landscape-telefoons
   liever wél WebGL, dan is de echte fix het uitbreiden van de safe-zone-
   berekening in ArchitectureScene voor korte-brede viewports — dat is
   scene-herwerk dat ik bewust niet ongevraagd doe.

2. **768×1024 portrait: veel lege ruimte in de hero.** De hero is 100svh met
   tekst onderaan; op tablet-portrait hangt de WebGL-scene bovenaan en gaapt er
   ±600px leegte tussen scene en tekst (screenshot
   `768x1024-tablet-portrait-hero.png`). Geen overlap of defect, maar
   compositorisch mager — een andere verticale verdeling is een designkeuze.

3. **SkillConstellation op touch.** (a) De mobiele tag-grid-fallback is bewust
   niet-interactief: bezoekers op mobiel missen de "gerelateerde projecten"-
   informatie die desktop-hover toont. (b) Op tablets (768–1024, touch) rendert
   de WebGL-constellation waarvan de interactie hover-gebaseerd is; taps werken
   daar deels via de pointer-events van react-three-fiber maar het is geen
   ontworpen touch-ervaring. Beide zijn afwegingen tussen eenvoud en
   functionaliteit — rapporteer ik alleen.

4. **JarvisPresence op landscape-telefoons.** Het paneel is <768px breed
   verborgen ("eerder ruis dan sfeer"), maar op 844×390 (ook een telefoon)
   verschijnt het wél en neemt het relatief veel van de lage viewport in. Zelfde
   `max-height: 500px`-clausule toevoegen aan die media query zou consistent
   zijn, maar dat is jouw sfeer-afweging.

5. **Toggle-kolom bedekt ±155px van de rechterbovenhoek op mobiel.** Drie
   gestapelde pillen is functioneel prima (geen overlap, alles tikbaar), maar op
   320px breed domineren ze het eerste scherm visueel. Samenvouwen tot een
   menu-/kebab-knop onder een breakpoint zou rustiger ogen — dat is een
   herontwerp van de visuele identiteit van de controls, dus enkel als
   suggestie genoteerd.

6. **Licht thema in headless was de geteste default.** Alle screenshots zijn in
   light mode (browser-voorkeur). De layout-metingen zijn thema-onafhankelijk
   (zelfde CSS-boxen), maar een visuele dark-mode-spotcheck op echte toestellen
   blijft aan te raden.
