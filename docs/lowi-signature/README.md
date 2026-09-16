# /lowi — signature iteration

## Audit before implementation

Scope: `/lowi` only. Next.js 16 / React 19; server route wraps the client article in existing theme and session providers. `LowiCelPagina.tsx` owns intro, seven memoized/tracked sections and Jarvis/CTA; its CSS module owns the route layout. Copy and camera endpoints live in `content/lowiCellContent.ts`.

Preserve: Fraunces / DM Sans / DM Mono, global copper/blue/violet tokens, dark/light theme, fixed ControlStack, language provider, section analytics and Nidus CTA event. No shared identity or public route changes.

Visual dependency map: dynamic `CelCanvas` → `CelModel`, `DnaHelix`, `CelMedium`, `CelEffecten`; procedural materials/geometries, `celPalet`, `celInstellingen`, and `useCelInterpolatie`. No external textures. Existing cell has translucent shells, instanced ribosomes, mitochondrial cristae, Golgi lamellae and division geometry. Existing camera starts in extreme macro and makes a large outward detour before entering.

Problems: six chapter metaphors and closing copy still contain placeholders; several biological statements overgeneralize. Text is presented in repeated dark bordered panels over a full-width canvas. Mobile/reduced motion remove the entire visual. Progress dots are decorative only. All sections have a fixed viewport height. Scroll measurements run continuously while visible; rendering does not stop on hidden tabs. No project transition beyond one CTA.

Plan: retain procedural world; exterior-to-interior camera path; editorial copy beside a single sticky stage; one-shot reveals; actual section-based progress; static scene captures on mobile/reduced motion/WebGL failure; two editorial project entries from existing content; no new runtime dependencies.

Sources for project copy: `content/placeholderContent.ts` → `lowi.projects` (Nidus: production/personal use; CRISPR & CHICKN: development), `content/nidusCaseStudy.ts` (architecture, boundaries, decision log). No new deployment claims, metrics or project inventions.

Biology reference: [OpenStax Biology 2e, Eukaryotic Cells](https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells). The visual is an artistic interpretation, not microscopy or a scale model.

Guidelines read without installation: [redesign-existing-projects](https://raw.githubusercontent.com/leonxlnx/taste-skill/main/skills/redesign-skill/SKILL.md), [animate](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md), [React best practices](https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/SKILL.md), [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). The global installer was rejected by automatic approval review. The brief takes precedence over generic suggestions for replacement fonts, extra decoration and non-native scroll. The referenced Copilot HTML is not present in this workspace; use the timings and principles supplied in the brief.

## Oplevering

### Bestanden en inhoud

- `app/lowi/page.tsx`: geeft alleen naam, tagline en bestaande maturity van de twee LOWI-projecten door vanuit de servercontent.
- `content/lowiCellContent.ts`: zeven uitgewerkte hoofdstukken en slot in NL/EN; nul publieke placeholdercopy; nauwkeuriger biologie; camera start buiten de cel. Nidus en CRISPR & CHICKN volgen bestaande repositoryclaims.
- `components/lowi-cel/LowiCelPagina.tsx` en `.module.css`: editorial compositie, één sticky visual, toegankelijke hoofdstuklinks, expliciete labels voor biologie versus metafoor, uitklapbare Nidus-architectuur, projectslot en bestaande Jarvis-integratie.
- `hooks/useScrollVoortgang.ts`: uitsluitend gebruikt door LOWI; eventgestuurde native-scrollmetingen, geen doorlopende meetlus, rAF-coalescing en refs voor voortgang. React-state wijzigt alleen bij hoofdstuk- of zichtbaarheidswissels.
- `components/lowi-cel/useEenmaligeReveal.ts`: eenmalige IntersectionObserver-reveals; tekst verschijnt vóór de cameraovergang; 480 ms, 10 px, cubic-bezier(.2,.72,.2,1). Geen animatiebibliotheek.
- `CelCanvas.tsx`, `CelEffecten.tsx`, `CelModel.tsx`, `celInstellingen.ts`, `celMaterialen.ts`, `celPalet.ts`, `useCelInterpolatie.ts`: doorlopende camerareis, ingetogen materiaalpalet, dunner DNA, kleine eiwitketen, gebogen Golgi-cisternen met transportblaasjes en bestaande delingsgeometrie. Materiaal, licht en deeltjesspreiding zijn samen afgestemd; twee MSAA-samples verminderen rafelige randen.
- `useCelInterpolatie.test.ts`: cameracontinuïteit, monotone nadering van het membraan, eindpunten, kleurbehoud, framerate-onafhankelijke demping en ongeldige input.
- `public/lowi/cell/*.webp`: acht geoptimaliseerde uitsneden uit dezelfde procedurele wereld, samen 268.040 bytes. Geen andere publieke route of gedeelde design tokens gewijzigd.

### Beeldontwikkeling

Eén Higgsfield-studie, job `2b030511-7af7-4d98-99ad-62fd5b932b9a`, diende als referentie voor heldere randen, organische materialen en gescheiden dieptelagen. [Bekijk de studie](higgsfield-study.webp). De website gebruikt de eigen procedurele cel en daarvan afgeleide stilbeelden. Geen gegenereerde wetenschappelijke bewijsbeelden, losse stijlen per hoofdstuk, videopayload of extra runtime-afhankelijkheden.

De oorspronkelijke volle koperkleur en mist zijn getemperd. Neutraler licht maakt materialen beter onderscheidbaar. Minder korrels en zachtere blaasjes houden de organellen leesbaar. Het Golgi-apparaat bestaat nu uit gesloten, gebogen en licht onregelmatige zakjes met fijne randen, in plaats van vlakke open schijven.

### Motion, mobiel en performance

De browser blijft volledig verantwoordelijk voor scrollen. Eén grid-laag begrenst de sticky cel tot de hoofdstukken; het projectslot is gewone documentflow. Copy komt eerder in beeld dan de visualovergang. Een uitgeklapt bewijsblok mag de hoofdstukhoogte vergroten: de meting gebruikt echte sectieposities.

WebGL wordt dynamisch geladen wanneer het instrument zichtbaar wordt. DPR blijft begrensd op 1–1,25; de renderer stopt buiten beeld en bij verborgen documenten. Adaptieve effecten en bestaande resource-disposal blijven behouden. Deeltjes zijn verminderd naar 640 mediumdeeltjes, 680 instanced ribosomen en 24 blaasjes. Gzip-bundelmetingen staan in `bundles.json`; dit zijn lokale bestandmetingen, geen Core Web Vitals of garantie voor alle GPU's.

Mobiel gebruikt verticale tekst/beeldbeats zonder live canvas. Reduced motion toont direct alle tekst, met statische beelden en zonder camerareis, ambient loops of parallax. WebGL-falen en contextverlies schakelen over naar dezelfde volledige artikelvariant.

### Accessibility en verificatie

Eén h1, zeven hoofdstuk-h2's plus een slot-h2; landmarks, native links, skiplink, keyboard disclosure en focus-visible. Decoratieve visuals zijn aria-hidden; alle inhoud blijft HTML. Taal en bestaande controls blijven werken. De gekozen projectstatussen staan als tekst en zijn niet uitsluitend met kleur aangegeven.

- Productiebuild en TypeScript: geslaagd.
- Gerichte lintcontrole van alle LOWI-bronbestanden: geslaagd.
- Testsuite: 51/52 geslaagd, inclusief alle 7 LOWI-tests. De bestaande fout in `lib/ai/answers.test.ts:40` betreft de top-k retrieval van `skill-functional-analysis`; de betrokken Jarvis-bronnen zijn ongewijzigd en vallen buiten deze opdracht.
- Repo-brede lint: bestaande fout in `components/linguix/SchrijfScorer.tsx:408` (`react-hooks/set-state-in-effect`); buiten scope.
- Browsermatrix: 1440, 1024 en 390 px; dark/light; motion/reduced. Resultaten en screenshots: `qa.json` en onderstaande galerij. Controle op overflow, kapotte beelden/ankers, headings, publieke placeholders en runtimefouten.
- Interacties: taalwissel, hoofdstuklink met Enter, details met Enter, blijvende reveal-state, Jarvis-paneel, runtime-switch naar reduced motion, ontbrekend WebGL en contextverlies. Meetresultaten in `interactions.json`.
- Contrastcontrole van hoofdstuktekst en labels in beide thema's: `contrast.json`.
- De laatste correctie mengt hoofdstukaccenten met de tekstkleur voor voldoende contrast. De 44 gemeten tekstfragmenten halen minimaal 4,61:1 in light en 6,42:1 in dark, met de architectuurdisclosure geopend. De screenshotmatrix dateert van direct vóór deze kleine kleurcorrectie.
- De herhaalde browserbezoeken bereikten de bestaande rate limit van `/api/track` (HTTP 429). Geen kapotte pagina-assets of runtime-excepties; de analytics-responses blijven zichtbaar in `qa.json`.

### Finale review

Eerste bezoek: persoonlijke lab-identiteit staat direct boven de LOWI-titel; de intro zegt wat hier wordt onderzocht en gebouwd. Designer: één beeld per beat, eenmalige copyreveal en native scroll. Technisch bezoek: Nidus toont concrete systeemgrenzen via de uitklapbare architectuuruitleg. LOWI-identiteit: biologie, AI, bouwen en verhalen komen samen, met eerlijke projectmaturity.

Bewust niet uitgevoerd: andere routes, CV-secties, deployment, nieuwe projecten of claims, nieuwe fonts/design tokens, AI-video, extra decoratieve effecten of globale skillinstallaties. De geweigerde installer is vervangen door het lezen van de relevante richtlijnen; dit blokkeert de implementatie niet.

### Visuele controle

- [Desktop dark](1440-dark-motion.webp) · [Desktop light](1440-light-motion.webp)
- [De kern, desktop](1440-dark-motion-kern.webp) · [Tablet](1024-light-motion-kern.webp)
- [Mobiel dark](390-dark-motion.webp) · [Mobiel light](390-light-motion.webp)
- [Reduced motion](1440-light-reduced-kern.webp) · [Projectslot](mobile-slot.webp)
- [Vóór desktop](before-desktop.webp) · [Vóór mobiel](before-mobile.webp)
