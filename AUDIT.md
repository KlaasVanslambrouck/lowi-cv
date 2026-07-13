# AUDIT — lowi-cv (2026-07-06)

Onafhankelijke review van de huidige staat van het project, uitgevoerd op commit
`41751fa` ("feat: start van persoonlijke website"). Werkboom was bij de start van
de audit schoon (alles gecommit én gepusht naar origin/main).

---

## 1. Samenvatting

**Wat werkt goed / degelijk gebouwd:**

- Privacy is op orde: geen adres, telefoonnummer, geboortedatum of
  rijksregisternummer in code, content óf git-geschiedenis. Contact bestaat
  volledig uit placeholders (`klaas@example.com`, LinkedIn-placeholder,
  locatie enkel "Oudenaarde, België/Belgium").
- Geen enkele secret ooit gecommit; `.env.local.example` bevat enkel lege
  variabelenamen; `.gitignore` sluit env-bestanden correct uit met de juiste
  uitzondering voor `.env.local.example`.
- De contentarchitectuur is netjes: één `PortfolioContent`-type als bron van
  waarheid, alle tekst tweetalig via het `{ nl, en }`-patroon, geen dubbele
  interface-definities, vrijwel niets hardcoded in JSX.
- CSS Modules only — geen Tailwind, geen utility-classes; de enkele inline
  `style={{...}}`-gevallen zijn legitiem (dynamische opacity in de 3D-scene en
  `pointerEvents` op drei-`<Html>`-labels; dat kan niet in statische CSS).
- `npm run build` compileert zonder errors en zonder warnings; `tsc --noEmit`
  is schoon; de prod-server rendert de pagina correct (HTTP 200).
- 3D-scenes laden allemaal lazy via `next/dynamic` met `ssr: false`, met
  doordachte fallbacks, safe-zone-berekening rond de hero-tekst en
  IntersectionObserver-gebaseerde mount/unmount van de mini-scene.
- prefers-reduced-motion wordt breed gerespecteerd: een globale kill-switch in
  `globals.css` plús gerichte opt-outs per motief, plus scene-detectie in
  `useSceneSupport`.
- Focus-states zitten globaal goed (`:focus-visible` met koperen outline op
  alles wat interactief is).

**Belangrijkste aandachtspunten (zie §4):** het volledige kleurenpalet wijkt af
van de oorspronkelijk gespecificeerde design tokens (bewuste her-theming met
dark/light-systeem, maar niet wat de prompt vroeg), er is een duplicate route
`/cv`, een deel van de code leeft in een afwijkende mappenstructuur onder
`app/cv/`, en de download-CV-knop linkt naar een PDF die (nog) niet bestaat.

---

## 2. Checklist-resultaten

### Privacy & veiligheid (kritisch)

| Check | Status | Toelichting |
|---|---|---|
| Geen straatadres / telefoon / geboortedatum / rijksregisternr. | ✅ | Gecheckt in code, content én volledige `git log -p --all` (patronen: straat/laan, +32, 04xx, geboortedata, "rijksregister"). Nul echte hits. |
| `ContactInfo.location` enkel "Oudenaarde, België/Belgium" | ✅ | [placeholderContent.ts:600](content/placeholderContent.ts#L600) — geen straatnaam, ook nooit in de historie. |
| Geen API-key / service-role key ooit gecommit | ✅ | Volledige historie gescand op `sk-ant-`, JWT-patronen (`eyJ…`), key-achtige assignments: niets. Enige "hit" is de waarschuwende comment in `.env.local.example` zelf. Er is nooit een `.env`-bestand gecommit (gecheckt via `git log --all --name-only`). |
| `.env.local.example` enkel lege namen | ✅ | Drie `NEXT_PUBLIC_*`-variabelen, allemaal leeg. |
| `.gitignore` dekt `.env*`, node_modules, .next, .vercel + uitzondering | ✅ | `.env`, `.env*`, `.env.*` genegeerd met `!.env.example` en `!.env.local.example`. Ook `*.log` (dekt de lokale `.next-dev*.log`-bestanden) en `*.tsbuildinfo`. |

### Architectuur & conventies

| Check | Status | Toelichting |
|---|---|---|
| package.json naam exact "lowi-cv" | ✅ | |
| CSS Modules only | ✅ | Geen Tailwind/utility-classes. Inline styles enkel functioneel in de WebGL-labels (dynamische opacity via refs, `pointerEvents: "none"`). |
| Geen tekst hardcoded in JSX | ⚠️ | Vrijwel alles via content. Uitzonderingen: aria-labels van [LanguageToggle.tsx:17-19](components/LanguageToggle.tsx#L17-L19) (verdedigbaar: taalknop is inherent tweetalig), "NL"/"EN"/"DARK"/"LIGHT"-labels, de Engelstalige aria-labels in [ThemeToggle.tsx:15-17](app/cv/components/ThemeToggle.tsx#L15-L17) (niet tweetalig), het sluitkruis "x" in [JarvisExplainPanel.tsx:63](app/cv/components/JarvisExplainPanel.tsx#L63) en "LinkedIn" in de footer. |
| Bilingual-patroon consistent | ✅ | Alle contentvelden `{ nl, en }`; taalonafhankelijke velden bewust `string` en zo gedocumenteerd in types. Geen half-vertaalde componenten gevonden. |
| Design tokens exact (#13141B / #EDE7DC / #B8763E / #5FBFB0 / #8A8677, radius 18px) | ❌ | **Het volledige palet is vervangen.** `globals.css` definieert een dark/light-themasysteem met `--cv-bg #101118`, `--cv-text #f1ece2`, `--cv-copper #c98245`, `--cv-muted #9995a0`, en `--cv-blue #669cff` + `--cv-violet #9878ff` i.p.v. `--cv-cyan #5FBFB0`. `--cv-ink`/`--cv-bone` bestaan enkel nog als aliassen naar de nieuwe waarden. Geen van de gespecificeerde hexwaarden komt nog ergens voor. Enkel `--cv-radius: 18px` klopt. Positief: het nieuwe palet is intern wél consistent — de hardcoded hexwaarden in de drie WebGL-scenes matchen exact de CSS-tokens (WebGL kan geen CSS-variabelen lezen), en het verboden terracotta `#D97757` komt nergens voor. Zie §4. |
| Fraunces / DM Sans / DM Mono via next/font | ✅ | Correct geladen in [layout.tsx](app/layout.tsx), consistent toegepast via `--cv-font-*`-variabelen (serif voor h1–h4, mono voor labels/cijfers/terminal, sans voor lopende tekst). Let op: DM Sans gebruikt `display: "optional"` (met LCP-motivering in comment) — bewuste keuze, kan op trage verbindingen betekenen dat de fallback-font blijft staan. |

### Rol-positionering

| Check | Status | Toelichting |
|---|---|---|
| "Bouwer van AI-gedreven systemen" / "Builder of AI-enabled systems" nergens als huidige titel | ✅ | Enkel als `targetRole` in de current→target-weergave in de Hero ([Hero.tsx:38-58](components/Hero.tsx#L38-L58)) en inhoudelijk in de Jarvis-uitlegteksten als AI-richting. |
| layout.tsx-metadata | ✅ | Titel is "Klaas Van Slambrouck — CV"; de description positioneert hem als "Functioneel Analist die business, technologie en AI vertaalt naar werkende systemen", in lijn met de doelrol "Bouwer van AI-gedreven systemen" / "Builder of AI-enabled systems". |

### 3D, performance & mobiel

| Check | Status | Toelichting |
|---|---|---|
| Alle scenes lazy via next/dynamic + ssr:false | ✅ | ArchitectureScene ([Hero.tsx:11-14](components/Hero.tsx#L11-L14)), SkillConstellationCanvas ([SkillConstellation.tsx:13-19](components/SkillConstellation.tsx#L13-L19)), ArchitectureSceneMiniCanvas ([ArchitectureSceneMini.tsx:10-13](components/ArchitectureSceneMini.tsx#L10-L13)); de mini-scene mount bovendien pas bij in-view. |
| Geen node/label-overlap met tekst | ✅ | Hero-scene heeft een expliciete safe-zone-berekening incl. camera-driftmarge; de SVG-fallback lijnt bovenaan uit (`preserveAspectRatio="xMidYMin"`); hero-tekst krijgt een gradient-achtergrond. Timeline-motieven staan rechts uitgelijnd op opacity 0.14–0.18 achter tekst met text-shadow — leesbaar. Statisch geverifieerd (code + SSR-output); geen visuele browsertest uitgevoerd (zie §2 laatste blok). |
| Mobiel/reduced-motion → fallback, geen WebGL | ⚠️ | Hero: ✅ (`showLiveScene` = webgl && !reducedMotion && !smallScreen, fallback vóór mount). Mini-scene: ✅ (rendert dan helemaal niets). **SkillConstellation: gedeeltelijk** — mobiel/geen-WebGL toont de tag-grid ✅, maar bij *reduced motion op desktop* rendert nog steeds de WebGL-canvas, in een bewust statische modus (`reducedMotion`-prop: geen camera-drift, geen lerp-animaties). Dat is een verdedigbare interpretatie ("geen beweging") maar wijkt af van de letterlijke eis ("toon de fallback, niet de WebGL-scene"). Zie §4. De fallbacks zijn géén dode code: ze worden echt aangeroepen via `useSceneSupport`, dat media queries ook live volgt. |
| Career-motieven puur CSS/SVG, lage opacity, geen layout-shift | ✅ | Puur CSS/SVG ([CareerMotifBackground.tsx](components/CareerMotifBackground.tsx)), opacity 0.14–0.18, `position: absolute; inset: 0` + `contain: paint` → geen layout-shift. |

### Toegankelijkheid

| Check | Status | Toelichting |
|---|---|---|
| Focus-states zichtbaar | ✅ | Globale `:focus-visible`-regel (koper, offset 3px) in [globals.css:170-174](app/globals.css#L170-L174) dekt LanguageToggle, ThemeToggle, X-ray-toggle, download-knop, lagen-toggle op ProjectCard, Jarvis-knoppen én het focusbare codeblok. |
| prefers-reduced-motion op alle animaties | ✅ | Globale kill-switch (animation/transition → 0.01ms) + gerichte regels voor soundwave/beams/blueprint/flowchart + `useInViewOnce` toont bij reduced motion meteen de eindstaat + WebGL-scenes verdwijnen (op de constellation-uitzondering hierboven na, die dan statisch is). Boot-sequence en pulse-dots vallen onder scene-fallback resp. de globale regel. |
| lang-attribuut wisselt mee | ⚠️ | `<html lang="nl">` blijft vast; de wissel gebeurt op een wrapper-`<div lang>` binnen de provider ([LanguageContext.tsx:54](context/LanguageContext.tsx#L54)) — gedocumenteerde keuze, en voor screenreaders dekt dit alle content. Puristisch zou `document.documentElement.lang` mee moeten wisselen; ook `<title>`/description blijven Nederlands in EN-modus. |

### Build & code-kwaliteit

| Check | Status | Toelichting |
|---|---|---|
| `npm run build` zonder errors/warnings | ✅ | Uitgevoerd (2×, ook na de fix). Output: Next.js 16.2.10 (Turbopack), "Compiled successfully in 7.7s", TypeScript schoon, 4/4 statische pagina's gegenereerd, routes `/`, `/_not-found`, `/cv`. Nul warnings. |
| Geen console-output bij normaal gebruik | ✅ (na fix) | Er stonden twee debug-`console.log`s die afgingen bij elke klik op een scene-node — verwijderd (zie §3). Prod-server draaide zonder serverfouten. **Kanttekening:** een echte browser-consoletest (doorklikken met DevTools open) kon in deze omgeving niet worden uitgevoerd; dit is statisch + via SSR/curl geverifieerd. Eén bekend 404-verzoek blijft: er is geen favicon (`app/favicon.ico` ontbreekt), en `/cv-klaas.pdf` geeft 404 (zie §4). |
| Geen ongebruikte/onverwachte dependencies | ⚠️ | Alle zeven dependencies worden gebruikt. Twee kanttekeningen: (1) `@react-three/postprocessing` wordt enkel voor de hero-bloom gebruikt — legitiem maar de zwaarste "extra"; (2) drie bestanden type-importeren uit `three-stdlib`, dat géén directe dependency is (het lift mee met drei) — werkt met npm, maar is fragiel bij bv. pnpm strict mode. |
| types/content.ts één bron van waarheid | ✅ | Alle content-interfaces enkel daar; interfaces elders zijn props/scene-config, geen duplicaten. |

---

## 3. Zelf doorgevoerde fixes

1. **`components/ArchitectureScene.tsx`** — twee debug-`console.log(\`clicked: …\`)`-statements verwijderd uit de onClick-handlers van de kern-node en de architectuur-nodes (regels 259 en 346). Dit was console-ruis bij elke klik van een bezoeker op de publieke site. De handlers en de `TODO: later scrollen naar de bijbehorende sectie`-comments zijn blijven staan. Build opnieuw uitgevoerd: nog steeds schoon.

Meer heb ik bewust **niet** aangepast — alle overige bevindingen vallen buiten de toegestane fix-categorieën of zien eruit als bewuste keuzes (zie §4/§5).

---

## 4. Zelf te beoordelen punten (niet automatisch gefixt)

1. **Kleurenpalet wijkt volledig af van de gespecificeerde tokens** (❌ hierboven).
   Iemand heeft een volwaardig dark/light-themasysteem gebouwd (`ThemeContext`,
   `ThemeToggle`, `data-cv-theme`, `prefers-color-scheme`-fallback, aparte
   scene-palettes per thema) en daarbij het hele palet hertekend: warmer koper
   (#c98245), blauw/violet i.p.v. cyaan, andere ink/bone-waarden. Het is intern
   consistent en netjes uitgevoerd, maar het is níét het gevraagde palet en de
   cyaan-token bestaat niet meer (comments zoals "Cyaan is voorbehouden aan
   live-indicatoren" in [LiveStatBadge.tsx:17](components/LiveStatBadge.tsx#L17)
   verwijzen naar de oude spec en kloppen niet meer met de code). Terugdraaien is
   een designbeslissing die jij moet nemen — automatisch "fixen" zou het hele
   themasysteem breken.

2. **Duplicate route `/cv`** — [app/cv/page.tsx](app/cv/page.tsx) her-exporteert
   gewoon de homepage, dus `/` en `/cv` serveren identieke content (beide HTTP
   200, geen canonical-tag → duplicate content voor SEO). Vermoedelijk een
   restant van een verhuizing van `/cv` naar `/`. Verwijderen is één bestand,
   maar breekt eventuele bestaande links naar `/cv`, dus jouw keuze.

3. **Afwijkende mappenstructuur onder `app/cv/`** — de theme- en
   Jarvis-explain-features leven in `app/cv/{components,context,hooks}/` terwijl
   al de rest in de root-mappen `components/`, `context/`, `hooks/` staat.
   Root-componenten importeren daar dwars doorheen (bv. `ExperienceTimeline` →
   `@/app/cv/components/JarvisExplainButton`). Werkt prima, maar het zijn twee
   conventies door elkaar; gelijktrekken is een kleine refactor die ik niet
   ongevraagd doe.

4. **Download-CV-knop → 404** — `cvPdfUrl: "/cv-klaas.pdf"` maar er staat geen
   PDF in `public/` (geverifieerd: HTTP 404). Er staat een TODO-comment bij in
   [ContactFooter.tsx:39](components/ContactFooter.tsx#L39). Bestand toevoegen
   of de knop tijdelijk verbergen — content-beslissing.

5. **Ongebruikt bestand `public/architecture-scene-poster.png`** (52 kB) — wordt
   nergens gerefereerd. Vermoedelijk bedoeld als LCP-poster voor de scene, nooit
   aangesloten. Verwijderen of alsnog gebruiken.

6. **Dode CSS-classes** — `.svgFlowBlue` ([cv.module.css:207](styles/cv.module.css#L207))
   en `.svgHaloCopper` (regels 259/274) worden door geen enkel component
   gebruikt. Onschuldig, maar opruimbaar.

7. **Geen favicon** — elke paginaweergave logt een 404 op `/favicon.ico` in de
   browser-devtools. `app/favicon.ico` (of een icon-export) toevoegen lost dit op.

8. **SkillConstellation onder reduced motion** (⚠️ hierboven) — beslis of de
   statische WebGL-weergave acceptabel is, of dat ook daar de tag-grid-fallback
   moet komen (dan volstaat het toevoegen van `support.reducedMotion` aan de
   fallback-conditie op [SkillConstellation.tsx:56](components/SkillConstellation.tsx#L56)).
   Ik heb dit niet gefixt omdat de expliciete `reducedMotion`-prop met eigen
   statische logica op een bewuste keuze wijst.

9. **`three-stdlib` niet als directe dependency** terwijl er wel uit
   geïmporteerd wordt (type-only, in ArchitectureScene / SkillConstellationCanvas).
   Overweeg `npm i -D three-stdlib` of de types anders op te lossen.

10. **ThemeToggle-aria-labels enkel Engels** en DARK/LIGHT hardcoded — als je het
    Bilingual-patroon strikt wil, horen die via `uiLabels` te lopen zoals bij de
    X-ray-toggle.

11. **Student Kick-Off-periode bewust weggelaten**: de nooit bevestigde periode is
    verwijderd en het `period`-veld is opzettelijk leeg gelaten
    ([placeholderContent.ts](content/placeholderContent.ts)). Dit is afgehandeld en
    niet langer een open TODO of verificatiepunt.

12. **Geen linter geconfigureerd** — er is geen ESLint in het project (geen
    dependency, geen config, build draait enkel TypeScript). Voor een publiek
    visitekaartje-repo is `eslint-config-next` toevoegen aan te raden.

## 5. Afwijkingen van de oorspronkelijke prompts (bewuste keuzes, geen fouten)

- **Het dark/light-themasysteem als geheel** (ThemeContext/ThemeToggle,
  `data-cv-theme`, dubbele scene-palettes) — nergens gevraagd voor zover de
  prompts hier bekend zijn, maar consequent doorgevoerd tot in alle drie de
  WebGL-scenes. Grootste "eigen initiatief" in de codebase.
- **De contextuele Jarvis-uitleglaag** (JarvisExplainButton/-Panel/-Context met
  zes uitgeschreven explanations) — een substantiële extra feature bovenop
  terminal + presence; netjes gebouwd (Escape-sluiting, focus naar sluitknop,
  mobiele bottom-sheet), al mist het dialog nog `aria-modal`/focus-trap.
- **Blauw/violet i.p.v. cyaan als accentkleur** — zie §4.1; de "electric blue"
  live-kleur en violet voor Jarvis vervangen overal de gespecificeerde cyaan.
- **`lang` op een wrapper-div i.p.v. op `<html>`** — expliciet gedocumenteerd
  in de code als keuze.
- **DM Sans met `display: "optional"`** — beargumenteerd met een LCP-motivering
  in de comment; afweging snelheid vs. gegarandeerde custom font.
- **X-ray-modus bewust niet gepersisteerd** ("kijkmodus, geen voorkeur") en
  **exploded-view met aparte toets/touch-toggle** — doordachte micro-beslissingen
  die in comments zijn toegelicht.
