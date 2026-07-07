# CURRENT STATE REPORT

- Datum van analyse: 2026-07-07
- Onderzochte branch: `main`
- Relevante commit hash: `9225b9351c5d7968c34270ca535b932cee354453`
- Scope: analyse van de actuele lokale werkboom in `C:\Users\KlSla\lowi-cv`, inclusief bestaande oncommitted wijzigingen die al aanwezig waren voor dit rapport.
- Dit rapport beschrijft de huidige repositorytoestand. Het is geen redesignvoorstel, geen toekomstige informatiearchitectuur en geen implementatieplan.
- Bestaande code is niet aangepast. De enige beoogde wijziging is het aanmaken van dit bestand.
- Lokale secrets zijn niet gelezen of gerapporteerd. `.env.local` bestaat lokaal, maar alleen `.env.local.example` en codeverwijzingen naar variabelen zijn onderzocht.
- Werkboom bij eindcontrole: `app/page.tsx`, `content/placeholderContent.ts`, `types/content.ts`, `lib/ai/retrieval.ts` en `lib/ai/types.ts` waren gewijzigd; `lib/ai/answers.ts`, `lib/ai/answers.test.ts`, `components/AIEngineeringPlayground.tsx` en `components/ai/` waren untracked. Deze zijn als huidige lokale toestand geanalyseerd, maar niet aangepast.
- Verificatie: laatste `npm run test` op de actuele werkboom faalt: 5 testbestanden, 17 tests, 1 failure in `lib/ai/answers.test.ts`. De falende assertie zegt dat `ai-business-engineering-fit` `system-lowi-intro` in de retrieved top-k verwacht, maar die bron niet terugkomt.

# 1. Executive Summary

De applicatie is vandaag een interactieve, tweetalige CV- en portfolio-onepager voor Klaas Van Slambrouck. Ze positioneert hem expliciet als "Functioneel Analist" met een beweging richting "AI Business Engineer". De site is geen klassieke statische CV-pagina alleen: ze combineert professionele loopbaaninformatie, LOWI als persoonlijk platformverhaal, projectkaarten, live-systeemtaal, 3D-visualisaties, X-Ray technische overlays, een actieve AI Engineering Playground, Jarvis-achtige contextuele uitleg en privacyvriendelijke analytics met een afgeschermd beheerdashboard.

Het primaire doel lijkt: een professioneel profiel tonen dat businessanalyse, systems thinking, AI-interesse en bouwcapaciteit samenbrengt. De centrale bezoekerservaring is een verticale scroll door secties: hero, persoonlijk profiel, LOWI, ervaring, opleiding, talen, skills, projecten, live stats, AI Playground, Jarvis en contact. De ervaring communiceert niet alleen "dit is mijn CV", maar ook "ik denk in systemen en bouw richting werkende platformen".

De implementatie is onderscheidend door de combinatie van een portfolio-inhoudslaag met interactieve systeemmetaforen. De hero toont een 3D/ fallback-architectuurgrafiek met labels zoals Next.js, Supabase, Railway, Databricks, Raspberry Pi, mobile en Jarvis. De skillsectie kan op desktop als 3D skill-graaf verschijnen. Projectkaarten hebben een "lagen" of exploded view. X-Ray mode toont technische metadata. Jarvis is aanwezig als terminal-preview, als proactieve presence-laag en als explain-panel, maar niet als echte live AI-chat.

De professionele identiteit die het sterkst naar voren komt is die van een functioneel analist die richting AI- en productgerichte systeemontwikkeling beweegt. Het profiel bevat ook sporen van developer, platform builder, AI-experimenter, product thinker, event/sound engineering achtergrond en science/biology curiosity. De applicatie maakt deze identiteiten tegelijk zichtbaar; het LOWI/Nidus-verhaal krijgt daarbij veel narratief gewicht.

# 2. Technische Architectuur

Framework en runtime:

- Next.js 16.2.10 met App Router.
- React 19.2.7 en React DOM 19.2.7.
- TypeScript 5.9 met `strict: true`.
- CSS Modules voor componentstyling; geen Tailwind.
- Three.js via `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` en typegebruik uit `three-stdlib`.
- Supabase via `@supabase/supabase-js` en `@supabase/ssr`.
- Vitest voor unit tests.

Frontendarchitectuur:

- `app/layout.tsx` laadt fonts via `next/font`: Fraunces, DM Sans en DM Mono.
- De publieke homepage `app/page.tsx` is een client component en gebruikt een lokaal typed contentobject.
- Globale providers: `LanguageProvider`, `XrayProvider`, `ThemeProvider`, `SessionInsightProvider` en `JarvisExplainProvider`.
- State management gebeurt via React context en hooks, niet via externe state libraries.
- De meeste inhoud komt uit `content/placeholderContent.ts`; types staan in `types/content.ts`.
- De actieve publieke app is een onepager met anchors/section ids, niet een multi-page portfolio.
- De actuele werkboom rendert `AIEngineeringPlayground` als sectie `#ai-playground`; dit komt uit untracked componentbestanden en gewijzigde content/types.

Backendarchitectuur:

- API-route `POST /api/track` schrijft analytics naar Supabase via een server-only service-role client.
- API-route `POST /api/auth/login` voert server-side login uit via Supabase `signInWithPassword`.
- `proxy.ts` beschermt `/beheer/dashboard/:path*` server-side.
- Dashboardpagina voert nogmaals auth/autorisatie uit voor data wordt gelezen.

Databronnen:

- Publieke content: lokaal hardcoded `placeholderContent`.
- Analytics: verwachte Supabase-tabel `portfolio_analytics`.
- Toekomstige content: comments verwijzen naar een latere Supabase-tabel `portfolio_content`, maar er is geen huidige fetch of query voor die content.
- Jarvis/Nidus: `NEXT_PUBLIC_NIDUS_API_URL` is gereserveerd in `.env.local.example`, maar er is geen actieve API-integratie.

Supabase-gebruik:

- `lib/supabase/server.ts`: service-role client, server-only, gebruikt voor analytics inserts.
- `lib/supabase/serverClient.ts`: cookie-based server client met anon key, gebruikt voor auth/dashboard.
- `lib/supabase/browserClient.ts`: browserclient met anon key, gebruikt voor logout.
- Er zijn geen Supabase migrations in de repo.

Authenticatie en autorisatie:

- Login op `/beheer` post naar `/api/auth/login`.
- De loginroute heeft een in-memory IP-pogingenteller: 5 pogingen per 10 minuten.
- Dashboardtoegang vereist Supabase-auth plus expliciete match met hardcoded admin user id in `lib/auth/admin.ts`.
- De admin user id staat in code en wordt in documentatie als configuratie, niet als secret, behandeld.

Analytics:

- Browser maakt een UUID in `sessionStorage`.
- Eerste analytics-event stuurt referrer-origin en device type mee.
- Events worden gevalideerd en via Supabase opgeslagen.
- Adminsessies worden server-side uitgesloten van analytics inserts.

Deployment/config:

- `next.config.ts` bevat redirects, security headers en optionele HSTS.
- `/cv` redirect naar `/`.
- `.env.local.example` documenteert `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_NIDUS_API_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ENABLE_HSTS`.
- Er is geen Vercel-configbestand in de repo, maar de code verwijst naar `VERCEL_ENV`.

Eenvoudige architectuurweergave:

```text
Browser
-> Next.js App Router frontend
-> React contexts/hooks for language, theme, X-Ray, Jarvis explain, session insight
-> /api/track or /api/auth/login where needed
-> Supabase auth and portfolio_analytics

Future external integration not active:
Browser
-> future Jarvis/Nidus endpoint via NEXT_PUBLIC_NIDUS_API_URL
-> no implemented live call in current code
```

Foutafhandeling en fallbacks:

- Publieke error boundary: `app/error.tsx`.
- Dashboard error boundary: `app/beheer/dashboard/error.tsx`.
- WebGL fallbacks via SVG/HTML when small screen, low viewport height, reduced motion or no WebGL.
- Analytics fetch errors are swallowed client-side so tracking does not block UX.

# 3. Repository Map

Belangrijkste rootbestanden:

- `package.json` en `package-lock.json`: Next/React/Three/Supabase/Vitest dependencies; lockfile v3.
- `next.config.ts`: security headers, `/cv` redirect, HSTS condition.
- `tsconfig.json`: strict TypeScript, Next plugin, path alias `@/*`.
- `eslint.config.mjs`: Next core web vitals and TypeScript config.
- `vitest.config.ts`: Vitest node environment with `@` alias.
- `proxy.ts`: Next proxy/middleware-style protection for `/beheer/dashboard`.
- `.env.local.example`: documented env contract without values.
- `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `docs/database-security.md`: current architecture/security docs.
- `AUDIT.md`, `AUDIT-2026-07-07.md`, `MOBILE_AUDIT.md`: prior audits; useful but partly historical.

`app/`:

- `layout.tsx`: document shell, fonts, language and X-Ray providers, metadata.
- `page.tsx`: public onepage CV/portfolio composition.
- `globals.css`: reset, design tokens, global focus and reduced-motion rules.
- `error.tsx`: public route error UI.
- `icon.tsx`: generated PNG favicon through `ImageResponse`.
- `api/track/route.ts`: analytics endpoint.
- `api/auth/login/route.ts`: admin login endpoint.
- `beheer/page.tsx`: login UI.
- `beheer/dashboard/page.tsx`: analytics dashboard.
- `beheer/dashboard/LogoutButton.tsx`: client logout.
- `beheer/dashboard/error.tsx`: dashboard error UI.
- `beheer/beheer.module.css`: admin styling.

`components/`:

- Public UI and feature components: hero, sections, LOWI, timeline, education, languages, projects, stats, AI Playground, Jarvis, toggles, 3D scenes.
- `components/AIEngineeringPlayground.tsx` plus `components/ai/`: untracked local AI Playground component stack and CSS, imported by the modified `app/page.tsx` in the current worktree.

`content/`:

- `placeholderContent.ts`: main content inventory, bilingual texts, projects, Jarvis messages/explanations, section titles and UI labels.

`types/`:

- `content.ts`: typed schema for portfolio content, projects, xray layers, Jarvis explanations, etc.

`context/`:

- Language, theme, X-Ray, Jarvis explain and session insight providers.

`hooks/`:

- Hooks for language/theme/xray access, analytics session, section tracking, scene support, in-view reveal, Jarvis explain and session insight.

`lib/`:

- `analytics/`: client event sender and server validation schema.
- `supabase/`: server-only, server-cookie and browser clients.
- `auth/`: admin authorization helper.
- `ai/`: deterministic local retrieval/evaluation layer, test suite, example questions and untracked/modified answer support.

`styles/`:

- `cv.module.css`: main CSS module for public app; contains layout, interactions, responsive behavior, Jarvis, X-Ray and Three.js-related UI styles.

Niet aanwezig:

- Geen `public/` directory.
- Geen Supabase migration files.
- Geen MDX/Markdown content pipeline.
- Geen active CMS integration.

# 4. Informatiearchitectuur

Route- en sectieboom:

```text
/
  RootLayout
    LanguageProvider
    XrayProvider
      HomePage
        ThemeProvider
        SessionInsightProvider
        JarvisExplainProvider
          ControlStack
            LowiMark
            LanguageToggle
            ThemeToggle
            XrayToggle
          JarvisPresence
          Hero [data-section-id="hero"]
          #about
          #lowi
            LowiSection
          #experience
            ExperienceTimeline
          #education
            EducationList
          #languages
            LanguageSkillsList
          #skills
            SkillConstellation or fallback tag grid
          ArchitectureSceneMini
          #projects
            ProjectCard x 3
          #live-stats
            LiveStatBadge x 5
          #ai-playground
            AIEngineeringPlayground
          #jarvis
            JarvisTerminal
          footer/contact [data-section-id="contact"]
          JarvisExplainPanel dialog when active

/cv
  redirect to /

/beheer
  login page

/beheer/dashboard
  protected analytics dashboard

/api/auth/login
  POST only login endpoint

/api/track
  POST only analytics endpoint

/icon
  generated app icon
```

Modals, overlays and drawers:

- `JarvisExplainPanel` is a fixed side panel on desktop.
- On mobile it becomes a bottom sheet with scrim.
- `JarvisPresence` is a fixed desktop status/proactive suggestion panel.
- No general site navigation menu exists.
- No mobile drawer navigation exists.
- No command palette exists.

Hidden/protected routes:

- `/beheer` is a public login route but not linked from the public homepage.
- `/beheer/dashboard` is protected by proxy and route-level authorization.
- `/api/*` routes are not directly visible in UI except through login/tracking calls.
- `/cv` exists only as redirect, not as independent content.
- `#ai-playground` is an active homepage section in the current local worktree.

Visitor flow:

A normal visitor enters `/`, sees the animated/fallback architecture hero, reads the current-role-to-target-role framing, then scrolls through personal positioning, LOWI/Nidus, professional experience, education, languages, skills, projects, live stats, the AI Playground, Jarvis preview and contact. The control stack lets the visitor switch language, switch dark/light theme and enable X-Ray. Some sections offer "Vraag Jarvis hierover" buttons that open a contextual explanation panel. On desktop, dwelling on sections can trigger JarvisPresence suggestions after 15 seconds and scroll the visitor to the Jarvis terminal. Contact is the terminal endpoint of the public flow.

# 5. Volledige Contentinventaris

Hero:

- Content source: `placeholderContent.hero`.
- Tells: name, current role, target role, thesis, identity line, focus areas and live label.
- Weight: very high; first viewport, full hero, 3D/fallback architecture background.
- Interaction: none in text; background nodes have pointer handlers but currently only cursor behavior and TODO comments.
- Role: establishes "Functioneel Analist -> AI Business Engineer" and LOWI/Nidus as proof of building capacity.
- Reachability: immediate at `/`.

About / "Wie ik ben":

- Source: `placeholderContent.aboutMe`.
- Tells: Klaas is a functional analyst with drive to understand and build systems; LOWI as lab.
- Weight: medium-high; short narrative block.
- Interaction: section tracking and JarvisPresence observation.
- Role: bridges CV identity and platform-builder identity.

LOWI:

- Source: `placeholderContent.lowi`.
- Tells: LOWI means "Lab of Wonder and Imagination", a learning/building environment around AI, biology, automation and creative technology.
- Weight: high; appears before formal experience.
- Interaction: Jarvis explanation button for LOWI; cards for Nidus and CRISPR & CHICKN.
- Role: converts the portfolio from static CV to personal platform story.

Nidus:

- Source: LOWI project object.
- Tells: personal operating system for family, home and routines; intended links to energy, location, automation, dashboards, Raspberry Pi workers, Supabase, mobile interfaces and Jarvis.
- Weight: high inside LOWI; marked "In productie".
- Interaction: external link shown as `example.com/nidus`; Jarvis explanation button.
- Status in repo: content claims production, but repo contains no Nidus implementation or real endpoint integration.

CRISPR & CHICKN:

- Source: LOWI project object.
- Tells: experimental data lab for playful analyses, Databricks notebooks and light Next.js frontend.
- Weight: moderate; one card.
- Interaction: no link and no Jarvis explanation.
- Status in repo: content-only project, no implementation present.

Experience:

- Source: `placeholderContent.experience`.
- Items: Soundfield NV, Student Kick-Off Gent, Event Explorers, EGOV VZW project bij FOD Financien, Itineris NV.
- Weight: high; timeline with motifs and active marker.
- Interaction: current entry has Jarvis explanation button; timeline marker reacts to visible item.
- Role: establishes long career arc from sound/live production to functional analysis/consulting.

Education:

- Source: `placeholderContent.education`.
- Items: Industrial Engineering Electromechanics at Universiteit Gent, not completed; Functional Analyst career switch at Switchfully/Cegeka.
- Weight: medium.
- Interaction: motif background where configured.
- Role: supports technical and analysis background.

Languages:

- Source: `placeholderContent.languageSkills`.
- Items: Dutch native, English very good, French good, Russian basic.
- Weight: medium-low.
- Interaction: section tracking only.

Skills / "Wat ik bouw":

- Source: `placeholderContent.skillNodes` and `projects`.
- Shows: AI, LLMs, Automation, Data, APIs, Systems Thinking, Functional Analysis, Product.
- Weight: high visually on desktop due 3D constellation.
- Interaction: hover nodes to see related projects; fallback tag grid on mobile/reduced/no-WebGL conditions.
- Role: presents skills as connected system rather than list.

Projects:

- Source: `placeholderContent.projects`.
- Items: Jarvis, Pi-sensornetwerk, Mobile companion-app.
- Weight: high; cards contain description, code snippet, tech tags and optional X-Ray layers.
- Interaction: hover/toggle "lagen" exploded view; X-Ray technical trees; analytics event on pinned exploded state.

Live systeem:

- Source: `placeholderContent.liveStats`.
- Tells: API calls, services online, data processed, uptime, Jarvis conversations.
- Weight: high visually due stats grid and live color.
- Interaction: X-Ray deployment detail; first stat has Jarvis explanation.
- Status: explicitly placeholder numbers, future live platform stream.

Jarvis:

- Source: `placeholderContent.jarvisMessages`, `uiLabels` and `jarvisExplanations`.
- Tells: example conversation about platform status and CRISPR & CHICKN.
- Weight: high as a named section plus ambient presence.
- Interaction: terminal tracks first open; input is disabled; explain panel and presence are active.
- Status: UI and explanation layer active; real chat offline.

AI Playground:

- Source: untracked `components/AIEngineeringPlayground.tsx`, `components/ai/*`, `lib/ai/*`, modified `types/content.ts` and modified `placeholderContent.jarvisObservations`.
- Tells: transparent local retrieval, context selection and grounded answer construction over portfolio content.
- Weight: medium-high because it is now a full homepage section between live stats and Jarvis.
- Interaction: example questions, custom question input, collapsible pipeline stages, source selection and retrieval/context inspectors.
- Status: active in the current local worktree, but experimental and uncommitted. The latest test-run fails in `lib/ai/answers.test.ts`, so the answer/retrieval alignment is not fully stable.

Contact:

- Source: `placeholderContent.contact`.
- Shows: `klaas@example.com`, LinkedIn placeholder, Oudenaarde, Belgium.
- Weight: medium endpoint.
- Interaction: mailto link, LinkedIn link, optional CV PDF hidden because `cvPdfAvailable` is false.
- Status: contact values are placeholders, no PDF/public asset.

# 6. Projecten en Case Studies

LOWI:

- Name: LOWI - Lab of Wonder and Imagination.
- Content: umbrella learning/building platform around AI, biology, automation and creative technology.
- Problem/trigger: curiosity growing into a personal platform; exact external origin not in repo.
- Goal: connect research, prototypes and real systems.
- Technical stack: implied by related content and architecture scene: Next.js, Supabase, Railway, Databricks, Raspberry Pi, mobile, Jarvis.
- Presentation: full section with intro and project cards.
- Screenshots/visuals: no screenshots; represented by text, cards and 3D architecture motif.
- Interactivity: Jarvis explanation for LOWI.
- Depth: narrative depth moderate; implementation evidence in this repo limited to portfolio shell and visual architecture.
- Status: active content framework; actual LOWI platform outside repo not verifiable.

Nidus:

- Name: Nidus.
- Content: nerve centre/personal operating system for family, home and routines.
- Problem/trigger: need to combine home/family data, automation, dashboards and intelligent context.
- Goal: living system that understands context, helps decide and becomes smarter.
- Stack: content mentions energy/location/automation/dashboards/Raspberry Pi workers/Supabase/mobile interfaces/Jarvis; project cards mention Railway and nidus-api in related contexts.
- Presentation: LOWI card with "In productie" status and example external URL.
- Screenshots/visuals: none.
- Interactivity: Jarvis explanation button.
- Missing case-study elements: no concrete process, architecture diagram beyond generic visual, no real screenshots, no metrics, no repo code.
- Status: content says in production; repository evidence is prepared/representational, not an integrated Nidus app.

CRISPR & CHICKN:

- Name: CRISPR & CHICKN.
- Content: experimental data lab for playful analyses.
- Problem/trigger: not clearly specified.
- Goal: data visualization and ML playground.
- Stack: Databricks notebooks and a light Next.js frontend in content.
- Presentation: LOWI card.
- Screenshots/visuals: none.
- Interactivity: none beyond section tracking.
- Case-study depth: low.
- Status: experiment/in development by content; repository contains no implementation.

Jarvis - personal AI assistant:

- Name: Jarvis.
- Content: chat assistant on top of nidus-api for CV/project questions, with tool use and memory.
- Problem/trigger: make portfolio/context answerable through an assistant.
- Goal: future live AI layer over platform data.
- Stack in content: Claude API, Railway, TypeScript; X-Ray layers include Next.js/JarvisTerminal, nidus-api/Claude API, Supabase/pgvector.
- Presentation: project card, Jarvis section, terminal mock, presence layer and explain panel.
- Screenshots/visuals: terminal UI only; no external screenshots.
- Interactivity: disabled terminal input, terminal open analytics, Jarvis explanation buttons, proactive presence suggestions.
- Case-study depth: medium as concept; low as live implementation.
- Status: UI/UX preview and contextual explanation active; real AI/chat/API not implemented.

Pi-sensornetwerk:

- Name: Pi-sensornetwerk.
- Content: Raspberry Pis measure temperature and energy at home and push readings to Supabase every minute.
- Problem/trigger: home sensor data collection.
- Goal: dashboards/telemetry from physical devices.
- Stack: Python, Raspberry Pi, Supabase; X-Ray layers EDGE/DATA/OPS with Python daemon, PostgreSQL, PM2/systemd.
- Presentation: project card with sample Python snippet and tech tags.
- Screenshots/visuals: none.
- Interactivity: exploded card and X-Ray layers.
- Case-study depth: limited to short description/snippet.
- Status: content implies active/home infrastructure; no implementation present in repo.

Mobile companion-app:

- Name: Mobile companion-app.
- Content: React Native app exposing LOWI on the go, with statuses, notifications and mini-Jarvis.
- Problem/trigger: mobile access to platform statuses.
- Goal: companion interface.
- Stack: React Native, Expo, Railway; X-Ray includes Supabase Auth.
- Presentation: project card with sample TSX snippet.
- Screenshots/visuals: none.
- Interactivity: exploded card and X-Ray layers.
- Case-study depth: low.
- Status: concept/prepared content; no mobile app code present.

AI Engineering Playground:

- Name: not routed, inferred from files under `components/ai`.
- Content: parent playground, question input, pipeline stages, retrieval inspector, context inspector, answer panel and CSS for a retrieval/answer/evaluation UI.
- Stack: React client components, local AI lib.
- Presentation: active homepage section `#ai-playground` in the current local worktree.
- Screenshots/visuals: none.
- Status: functioneel maar experimenteel. It is imported by `app/page.tsx`, but the relevant files are uncommitted/untracked and the latest tests fail on source alignment for one preauthored answer.

# 7. CV en Professionele Positionering

Huidige positionering:

- Current role: Functioneel Analist / Functional Analyst.
- Target role: AI Business Engineer.
- Metadata reinforces: "Functioneel Analist op weg naar AI Business Engineer".
- Core claim: translating business processes into working AI systems.

Work experience:

- Sound Engineer & Head of Audio at Soundfield NV, 2010-2021.
- Team Lead Productie at Student Kick-Off Gent, 2012-2020, with a TODO that exact years still need confirmation.
- Founder at Event Explorers, 2016-2017.
- Functional Analyst at EGOV VZW project bij FOD Financien, 2021-2022.
- Functional Consultant at Itineris NV, 2022-present, domain lead for service delivery in an upgrade project for De Watergroep.

Education:

- Universiteit Gent, Industrial Engineering Electromechanics, not completed.
- Switchfully/Cegeka, Functional Analyst career switch, 2021.

Technical skills visible:

- Next.js, React, TypeScript, Three.js, Supabase, Railway, Databricks, Raspberry Pi, Python, React Native, Expo, Claude API, pgvector as content/project terms.
- Actual repo evidence strongest for Next.js, React, TypeScript, CSS Modules, Three.js, Supabase integration, analytics validation and local retrieval/evaluation code.

Functional/professional skills visible:

- Functional analysis, workflow/case-management specifications, service delivery domain ownership, business-to-system translation, product thinking, systems thinking, stakeholder communication through multilingual profile.

Soft skills and ambition:

- Curiosity, learning drive, building drive, practical translation of ideas into working systems.
- Ambition to move from analysis toward AI Business Engineering.

Identity tensions:

- Consultant/analyst: strongly evidenced by experience and role labels.
- Developer/product builder: evidenced by codebase and project framing, but many projects are content-only.
- AI experimenter: strongly visible as direction and prepared code; actual live AI integration absent.
- Research/science communicator: visible through LOWI/biology and CRISPR & CHICKN references, but not deeply developed in active content.
- Entrepreneur: evidenced by Event Explorers and LOWI/Nidus framing.

# 8. Visueel en Interaction Design System

Color system:

- Dark default: `--cv-bg #101118`, `--cv-surface #171923`, `--cv-text #f1ece2`, copper `#c98245`, blue `#669cff`, violet `#9878ff`.
- Light theme: background `#f3efe7`, text `#171820`, copper `#a95f2c`, blue `#2864d7`, violet `#6945d6`.
- Copper is signature accent; blue indicates live/active; violet indicates Jarvis/AI.
- `--cv-ink` and `--cv-bone` remain aliases.

Typography:

- Fraunces for headings/name.
- DM Sans for running text.
- DM Mono for labels, terminal, stats and code.
- Font loading through `next/font`.

Layout and surfaces:

- Onepage vertical layout with max width around 68rem.
- Cards and panels use borders, subtle translucent surfaces and `--cv-radius` of 18px, with some 8px elements in admin/error/project internals.
- Fixed control stack top-right on desktop; horizontal compact stack on mobile.

Images/assets:

- No `public/` assets are present.
- Favicon generated with `ImageResponse`.
- Visual identity relies on CSS/SVG/Canvas/WebGL rather than image assets.

Animations and motion:

- Hero 3D boot sequence, camera drift, data pulses, bloom.
- SVG fallback pulse/flow lines.
- Scroll reveal on sections.
- Career motif animations: soundwave, stage lights, blueprint stroke reveal, flowchart reveal.
- Project card exploded transforms.
- Jarvis panel fade and presence fade.
- Reduced motion globally suppresses animations/transitions and scene support prevents live WebGL in relevant contexts.

3D/WebGL:

- Hero architecture scene.
- Skill constellation.
- Mini architecture bridge scene.
- Fallbacks exist for small screens, low height, reduced motion and missing WebGL.

Responsive behavior:

- Under 768px, hero uses a compact SVG/fallback flow.
- JarvisPresence is hidden under 768px.
- JarvisExplainPanel becomes a bottom sheet.
- Skill constellation falls back to tags on small/reduced/no-WebGL.
- Touch targets are expanded with pseudo-elements on coarse pointers.

General visual personality:

The application feels technical, systems-oriented and slightly cinematic. It uses a dark/luminous engineering language with copper/blue/violet semantics, terminal motifs and architectural graphs. It is less like a traditional CV and more like a personal platform cockpit.

# 9. Jarvis

What Jarvis is:

- A named AI/persona layer in the portfolio.
- Currently three visible forms: `JarvisPresence`, `JarvisExplainPanel` and `JarvisTerminal`.
- Also represented as a project card and as future direction in content.

Where accessible:

- Presence panel appears on desktop while scrolling, except in the Jarvis section itself.
- Explain buttons appear in LOWI, Nidus, current experience, skill section, Jarvis project and first live stat.
- Terminal appears in the `#jarvis` section.

Activation:

- Explain buttons open preauthored contextual explanations.
- Presence observes active section and can show proactive suggestion after 15 seconds dwell time for a section.
- Proactive "Vraag het Jarvis" button scrolls to the Jarvis section.
- Terminal records interaction on pointer down or focus capture.

UI behavior:

- Explain panel: fixed right desktop dialog, bottom sheet on mobile, close button, scrim on mobile, Escape closes.
- Presence: fixed status chip, `role="status"`, `aria-live="polite"`, desktop only under current CSS.
- Terminal: terminal-style log with disabled input.

Technical implementation:

- `JarvisExplainProvider` holds active explanation id.
- Explanations are preauthored in `placeholderContent.jarvisExplanations`.
- `SessionInsightProvider` records local views/dwell time.
- `useSectionTracking` records both local dwell and analytics dwell.
- No LLM call, no server action and no Nidus fetch currently power Jarvis.

Context/data available:

- Current active section, local section dwell history and preauthored explanation objects.
- Terminal has `sectionInsights` assigned to a placeholder variable but does not send it anywhere.
- AI retrieval code exists separately in `lib/ai`, but it is not wired into Jarvis UI.

Prompts/system instructions:

- No live system prompt for an LLM is present.
- Content includes preauthored explanations and example questions, but not a runtime AI prompt.

Models/APIs:

- Content mentions Claude API, nidus-api and pgvector.
- Code does not import or call Claude/OpenAI/Anthropic APIs.
- `NEXT_PUBLIC_NIDUS_API_URL` is reserved but unused.

Privacy/security:

- Jarvis does not transmit visitor behavior to an AI service.
- Local dwell data exists in React state.
- Analytics events go to `/api/track` separately and are privacy-limited.

Role in experience:

- Jarvis makes the site feel like an intelligent portfolio system.
- Today it is central as a narrative and UI layer, but optional and mostly preauthored.

Visible limitations:

- Terminal input is disabled.
- "Jarvis is offline" text is explicit.
- No retrieval/chat endpoint.
- No memory or tool use implementation in active UI.

# 10. X-Ray Mode

Activation:

- ControlStack contains `XrayToggle`.
- `XrayProvider` holds global `xrayActive`.
- X-Ray is not persisted to localStorage.

Technical implementation:

- `useXray()` exposes current state.
- `ProjectCard` checks `xrayActive` and displays a tree built from `project.xrayBreakdown`.
- `LiveStatBadge` checks `xrayActive` and displays `xrayStatDetail`.

Supported components:

- Project cards with `xrayBreakdown`.
- Live stat badges.

Metadata shown:

- Project technical layer trees:
  - Jarvis: UI/API/DATA.
  - Pi network: EDGE/DATA/OPS.
  - Mobile app: UI/API/AUTH.
- Live stats: placeholder deployment detail "deployment: fra1 / last build: -".

Depth:

- X-Ray is a lightweight technical overlay, not a full component inspector.
- It does not show React props, bundle data, real deployment metadata or live traces.

Mobile:

- Toggle remains visible in mobile control stack.
- X-Ray content appears inside existing cards/stats and should be reachable on mobile from code.

Role:

- Demonstrates technical thinking by letting visitors reveal implementation layers.
- Current maturity is functional but shallow and partially placeholder-based.

# 11. Andere Bijzondere Features

Language toggle:

- Switches between Dutch and English.
- Preference stored in `localStorage` key `cv-language`.
- Content uses bilingual objects and `useLanguage().t`.
- `<html lang>` remains `nl`; provider wraps children in a `div lang={language}`.

Theme toggle:

- Switches dark/light.
- Stored in `localStorage` key `cv-theme`.
- Applies `data-cv-theme` on `document.documentElement`.
- WebGL scenes have separate hardcoded palettes matching CSS tokens.

LOWI mark:

- Small fixed animated status mark in control stack.
- Communicates "LOWI leeft" / "LOWI is alive".

3D architecture hero:

- Ambient full-hero scene with boot sequence, nodes, lines, data pulses and bloom.
- Falls back to SVG.
- Node clicks have TODO comments for future scroll behavior.

Skill constellation:

- Desktop WebGL graph with hover node relations and analytics tracking.
- Mobile/reduced/no-WebGL fallback tag grid.
- Screen-reader-only skill list is present.

Project exploded view:

- Project cards separate front/code/tech layers via 3D transforms.
- Hover opens on desktop; button pins for touch/keyboard.
- Open state tracks `project_exploded_open`.

Admin dashboard:

- Protected route for analytics.
- Shows unique sessions, section views, dwell time, interactions and referrers.
- Date filter via `since`.

AI retrieval/evaluation layer:

- `lib/ai` contains deterministic local keyword retrieval, knowledge base generation, eval cases, scoring/evaluation and preauthored/template answers.
- Tests cover retrieval/evaluation/answer behavior, but the latest run has one failing answer-source/top-k assertion.
- Active in public UI through `AIEngineeringPlayground` in the current local worktree.

AI Engineering Playground:

- `components/AIEngineeringPlayground.tsx` and `components/ai` contain an untracked local playground UI.
- The component demonstrates query analysis, local keyword retrieval, ranking explanation, context assembly and grounded answer display using `lib/ai`.
- It is imported by `app/page.tsx` and rendered as section `#ai-playground`.
- A Jarvis observation for `ai-playground` exists and can match the rendered section.
- Status: active but experimental/uncommitted.

# 12. Mobile Experience

Responsive layout:

- Public page uses fluid section padding and single-column stacking under 768px.
- Hero becomes column layout with SVG/fallback scene above text.
- LOWI cards, project cards and stats use auto-fit grids that collapse.
- ControlStack becomes horizontal, compact and top-aligned.
- AI Playground forms, score grids and inspector headers collapse to single-column layouts under 768px.

Mobile navigation:

- No hamburger/nav menu.
- Visitors scroll vertically.
- Controls remain fixed for language, theme and X-Ray.

Touch interactions:

- Project "lagen" button supports touch.
- Touch targets are expanded with invisible 44px areas for small controls/links.
- JarvisTerminal input is disabled, so no keyboard flow for chat.

Hidden/simplified elements:

- JarvisPresence hidden under 768px.
- WebGL scenes disabled under 768px or max-height 500px through `useSceneSupport`.
- Skill graph falls back to static tags on small/reduced/no-WebGL.
- Mini architecture scene renders nothing when scene support is false.

Performance choices:

- Avoids WebGL on phones and short landscape screens.
- Disables backdrop blur in mobile control stack and bottom sheet.
- Uses `100dvh`/`100svh` and safe-area env variables.

Differences with desktop:

- Desktop gets live WebGL hero and skill constellation.
- Desktop gets JarvisPresence.
- Mobile gets SVG/static/tag fallbacks and bottom-sheet Jarvis explain panel.

MOBILE_AUDIT.md alignment:

- The current code reflects the documented fixes: max-height small-screen detection, safe-area offsets, touch target enlargement and hero fallback aspect ratio.
- The audit's open point about JarvisPresence on landscape phones remains relevant by code: the CSS hides it only on `max-width: 767px`, while scene support also considers low height.

# 13. Accessibility, Motion en Resilience

Reduced motion:

- Global CSS sets animations/transitions to 0.01ms under `prefers-reduced-motion: reduce`.
- `useSceneSupport` disables live scenes when reduced motion is true.
- `useInViewOnce` immediately sets visible state for reduced motion.
- Career motifs include reduced-motion-specific rules.

Keyboard/focus:

- Global `:focus-visible` outline exists.
- Toggles are buttons with `aria-pressed`.
- Project code blocks are focusable with `tabIndex={0}`.
- Jarvis explain panel focuses close button and supports Escape.
- There is no explicit focus trap or `aria-modal` on the Jarvis dialog.

Semantic HTML/ARIA:

- Sections use `section`, `header`, `footer`, headings.
- Terminal body has `role="log"`.
- JarvisPresence has `role="status"` and `aria-live`.
- AI Playground pipeline stages use buttons with `aria-expanded` and `aria-controls`.
- Dashboard tables use table headers.
- Canvas visuals are `aria-hidden`, with hidden text fallback for skill nodes.

Contrast:

- Not measured in this analysis.
- Palette appears designed with high text contrast, but exact WCAG ratios are not computed in repo.

Fallbacks/resilience:

- WebGL fallback SVG exists.
- Missing env variables cause admin/proxy/API paths to fail closed or return generic errors.
- Analytics failures are non-blocking.
- Error pages avoid stack traces.
- No custom not-found page exists beyond default Next not-found route.

# 14. Performance

Lazy loading/code splitting:

- `ArchitectureScene`, `SkillConstellationCanvas` and `ArchitectureSceneMiniCanvas` are dynamically imported with `ssr: false`.
- Mini scene mounts only near viewport and unmounts when out of range.
- Three.js is not server-rendered.

Asset loading:

- No public image assets.
- Favicon generated dynamically.
- Fonts loaded through Next font optimization.

WebGL loading/performance:

- Hero WebGL only when `showLiveScene`.
- Mobile/small/reduced/no-WebGL use fallback.
- `dpr` limits are used in Canvas configs.
- Hero uses postprocessing Bloom, likely the heaviest visual dependency.

Caching:

- No custom caching strategy found.
- Dashboard is `force-dynamic`.
- Track API is `force-dynamic`.

Potential heavy parts:

- Hero WebGL with bloom and data pulses.
- Skill constellation canvas.
- IntersectionObservers for section tracking and presence.
- Analytics calls per section/dwell/interaction, with rate limits.

Build/runtime verification:

- This analysis did not run `npm run build` to avoid unnecessary build-output churn.
- Latest `npm run test` failed: 5 files ran, 17 tests total, 1 failed in `lib/ai/answers.test.ts`.
- The failure is an AI retrieval/answer grounding mismatch: expected source `system-lowi-intro` is not in the top-k for `ai-business-engineering-fit`.

# 15. Analytics en Bezoekersinzicht

Measured events:

- `section_view`: once per section when intersecting.
- `dwell_time`: seconds per section when leaving, pagehide or visibility hidden.
- `interaction`: language toggle, theme toggle, X-Ray toggle, project exploded open, skill node hover, Jarvis terminal open, Jarvis proactive shown, Jarvis proactive clicked.

Session tracking:

- `useAnalyticsSession` creates a UUID in `sessionStorage` key `cv-session-id`.
- If sessionStorage fails, analytics is disabled for that visitor session.

Storage:

- `sessionStorage`: analytics session id.
- `localStorage`: language and theme preferences.
- Cookies: Supabase auth cookies for admin login/dashboard.

Privacy choices:

- No full user agent collected.
- Referrer normalized to origin only.
- No IP stored in analytics payload. The login endpoint reads IP headers only for in-memory rate limiting.
- No ad cookies or cross-site tracking in visible code.
- Footer includes transparency note about limited privacy-friendly analytics.

Server validation:

- Body max 4096 bytes.
- Event data max 2048 bytes.
- UUID pattern required.
- Event types/device types whitelisted.
- Interaction IDs and payload keys whitelisted.
- Referrer length and protocol checked.

Rate limiting:

- 30 events/minute per session id.
- 240 events/minute global DB cap.
- TODO notes a future distributed rate limiter.

Dashboard:

- `/beheer/dashboard` reads up to 5000 `portfolio_analytics` rows.
- Shows unique sessions over 7 and 30 days.
- Summarizes section views, average dwell time, interactions and first referrers.
- Supports `since` date query/filter.

Unknown:

- Actual Supabase table schema/policies cannot be verified from repo because migrations are absent.
- Live production analytics data was not inspected.

# 16. Huidige Storytelling

## Eerste 10 seconden

A visitor likely understands this is Klaas Van Slambrouck's CV/portfolio, but not a conventional one. The hero states Functioneel Analist -> AI Business Engineer and frames LOWI/Nidus as a working proof layer. The architecture visual suggests systems, cloud/data, automation and AI.

## Na 30 seconden

The visitor sees that the profile is about translating processes into working systems. LOWI becomes a personal lab/platform, not just a hobby label. The site begins to merge personal curiosity, professional analysis and technical building.

## Na 2 minuten

The visitor has seen formal experience, education, languages, connected skills, project cards and the AI Playground. Nidus, Jarvis, Pi sensors and the mobile app establish an ecosystem narrative. The visitor also sees that some "live" aspects are placeholders and that Jarvis is not yet a real chat.

## Na grondige exploratie

The deeper layers are X-Ray project metadata, exploded project cards, Jarvis explain panels, proactive presence behavior, the AI Playground pipeline, analytics/admin architecture and local AI retrieval/evaluation code. A technical reviewer can see real implementation quality in Next/Supabase/Three/analytics/security. At the same time, several portfolio claims about external systems are represented as content rather than shipped code in this repo.

Identity that emerges:

- A functional analyst with delivery and service-domain experience.
- A system-oriented builder using a portfolio as an interactive proof environment.
- An AI-curious product thinker moving toward AI Business Engineering.

Projects with most weight:

- LOWI and Nidus carry the largest narrative weight.
- Jarvis carries the strongest interactive/AI weight.
- Pi network and mobile app support the platform story but have less depth.

Attention fragmentation:

- CV, LOWI, Nidus, Jarvis, live stats, AI retrieval, science/biology and admin analytics all coexist.
- The app feels rich, but not all layers are equally mature or equally verified by code.

Reinforcing messages:

- Business analysis -> systems thinking -> AI platform.
- Personal lab -> practical proof.
- Observability/privacy/admin -> production-minded engineering.

Competing messages:

- "In production/live" language competes with placeholder stats and disabled Jarvis.
- Science/biology appears in LOWI/CRISPR but is shallow compared with AI/platform content.
- Consultant/analyst identity and developer/builder identity both compete for primary framing.

Unanswered visitor questions:

- Which external projects are actually deployed and where?
- What does Nidus look like?
- What is measurable impact or usage?
- What are the real screenshots/results?
- How far along is Jarvis beyond the UI preview?

# 17. Capability Map

| Competentie | Bewijs in applicatie | Sterkte van bewijs | Waar zichtbaar |
| --- | --- | --- | --- |
| Functionele analyse | Role labels, EGOV and Itineris descriptions, process-to-system thesis | sterk | Hero, About, Experience |
| Systems thinking | Architecture scene, LOWI/Nidus platform framing, skill graph | sterk | Hero, LOWI, Skills, Projects |
| Product thinking | Nidus as personal OS, mobile companion, Jarvis as context layer | redelijk | LOWI, Projects, Jarvis explanations |
| Frontend development | Next/React app, CSS modules, responsive UI, interactions | sterk | Entire codebase |
| Backend/API development | API routes for auth/login and analytics | redelijk | `app/api`, `lib/supabase`, `lib/analytics` |
| Data engineering | Supabase analytics, Databricks references, Pi data content | redelijk | Analytics code, Projects content |
| AI-integratie | Jarvis UI, local retrieval/eval layer, Claude/nidus-api content | redelijk | Jarvis UI, `lib/ai`, project content |
| UX | Responsive fallbacks, explain panels, controls, progressive disclosure | sterk | Components/CSS |
| Visual design | Token system, typography, 3D visuals, motifs | redelijk | CSS, Three components |
| Softwarearchitectuur | Separation of app/components/content/lib/context/hooks | sterk | Repository structure |
| Automatisatie | Nidus/Pi/automation content and skill graph | redelijk | LOWI, Skills, Projects |
| IoT | Raspberry Pi sensor project content | beperkt | ProjectCard, AI knowledge chunks |
| Energie-data | Nidus and Pi content mention energy readings | beperkt | LOWI, Pi project |
| Locatie-data | Nidus content mentions location | impliciet | LOWI Nidus card |
| Security | Server-side admin auth, service-role boundary, validation, headers | sterk | `proxy.ts`, `lib/auth`, API routes, docs |
| Privacy | SessionStorage analytics, referrer normalization, no ad cookies note | sterk | Analytics code, footer, SECURITY.md |
| Performance | Dynamic imports, WebGL fallbacks, font strategy | redelijk | Hero, scenes, layout |
| Accessibility | Focus states, ARIA, reduced motion, semantic sections | redelijk | CSS/components |
| Communicatie | Bilingual content, clear CV sections, explanation panels | sterk | Content/components |
| Wetenschap | LOWI biology and CRISPR references | beperkt | LOWI content |
| Onderzoekend vermogen | LOWI lab framing, experiments, retrieval/eval tests | redelijk | LOWI, `lib/ai` |
| Ondernemerschap | Event Explorers founder, LOWI/Nidus platform framing | redelijk | Experience, LOWI |

# 18. Feature Maturity Map

| Feature | Status | Bereikbaarheid | Technische volwassenheid | Rol in ervaring |
| --- | --- | --- | --- | --- |
| Public CV onepager | production-ready | direct `/` | hoog | central |
| Bilingual content | production-ready | control stack | hoog | central |
| Theme toggle | production-ready | control stack | hoog | supporting |
| X-Ray mode | functioneel maar experimenteel | control stack | gemiddeld | technical reveal |
| Hero WebGL scene | functioneel | desktop/tablet supported | hoog visueel, decoratief | first impression |
| SVG/WebGL fallback | production-minded | automatic | hoog | resilience |
| Skill constellation | functioneel maar desktop-biased | skills section | gemiddeld | capability storytelling |
| Project exploded view | production-ready | project cards | hoog | progressive disclosure |
| Jarvis terminal | gedeeltelijk geimplementeerd | Jarvis section | laag voor AI, hoog voor UI preview | AI promise |
| Jarvis explain panel | functioneel | explain buttons | gemiddeld-hoog | contextual storytelling |
| JarvisPresence | functioneel maar desktop-only | desktop scroll | gemiddeld | ambient assistant |
| Live stats | voorbereid/placeholder | live-stats section | laag voor data, hoog for UI | production signal |
| Analytics tracking | functioneel | automatic | hoog | visitor insight |
| Admin dashboard | functioneel | hidden `/beheer` | gemiddeld-hoog | owner insight |
| Supabase auth/admin | functioneel | `/beheer` | hoog | security/admin |
| AI retrieval/eval lib | voorbereid/experimenteel | active through Playground | gemiddeld, latest answer test failing | future Jarvis/playground |
| AI Engineering Playground | functioneel maar experimenteel | active `#ai-playground` section | gemiddeld, latest answer test failing | AI transparency demo |
| CV PDF download | voorbereid but inactive | hidden | laag | contact/action |
| Nidus external integration | concept/content only in this repo | placeholder link | onduidelijk | platform credibility |
| CRISPR & CHICKN | concept/content only | LOWI card | laag | science/experiment signal |

# 19. Content Weight Map

| Onderwerp | Visueel gewicht | Inhoudelijke diepgang | Bereikbaarheid | Vermoedelijke bezoekersimpact |
| --- | --- | --- | --- | --- |
| Professionele ervaring | hoog | gemiddeld | direct scroll | credible CV foundation |
| CV/profiel | zeer hoog | gemiddeld | hero/about | primary identity |
| LOWI | hoog | gemiddeld | early section | turns CV into platform story |
| Nidus | hoog | gemiddeld | LOWI card | key proof claim, but unverifiable in repo |
| Jarvis | hoog | medium concept, low live AI | project/Jarvis/explain/presence | strong AI signal |
| AI Playground | medium-high | medium technisch, experimenteel | active section | explains retrieval/grounding approach |
| X-Ray | medium | low-medium | toggle | technical competence signal |
| Live stats | medium-high | laag, placeholders | section | production/observability impression |
| Pi network | medium | laag | project card | IoT/data signal |
| Mobile app | medium | laag | project card | product ecosystem signal |
| AI | hoog | medium in UI/code | hero/skills/Jarvis/lib/ai | main future direction |
| Biologie/wetenschap | laag-medium | laag | LOWI/CRISPR | curiosity signal |
| Technische architectuur | hoog visueel | medium | hero/X-Ray/docs/code | systems credibility |
| Persoonlijke elementen | medium | medium | about/LOWI/contact | humanizes profile |
| Contact | medium | laag | footer | conversion endpoint |
| Admin/analytics | hidden | hoog technisch | `/beheer` | owner-only, not visitor narrative |

# 20. Openstaande Onduidelijkheden

- Actual Supabase schema, RLS policies and production data are not in the repo.
- `.env.local` exists but was not read; runtime env completeness was not verified.
- Nidus is marked "In productie" in content, but no Nidus implementation or real URL integration is present.
- The Nidus link is `https://example.com/nidus`, which is placeholder-like.
- Live stats are explicit placeholders.
- Jarvis claims future nidus-api/Claude/tool/memory behavior, but current UI has disabled input and no API call.
- AI retrieval/evaluation code is now connected to an active `#ai-playground` section in the local worktree, but the related component files are untracked and the latest test-run fails.
- `lib/ai/answers.test.ts` is untracked and currently fails because a preauthored answer expects `system-lowi-intro` in the retrieved top-k for `ai-business-engineering-fit`.
- `components/AIEngineeringPlayground.tsx` and `components/ai` are untracked even though `app/page.tsx` imports the playground.
- Contact email and LinkedIn are placeholders.
- No public CV PDF exists and no `public/` directory exists; download button is hidden by config.
- Student Kick-Off period has a TODO noting exact years still need confirmation.
- Prior audit docs contain historical/stale statements: old `/cv` duplicate and `app/cv` structure are no longer present; `AUDIT-2026-07-07.md` includes references to `/api/auth/login-attempt` even though current code uses `/api/auth/login`.
- No custom not-found page or loading states are present.
- No live browser render was executed during this report; mobile/browser conclusions are based on current code plus existing audits.
- The real external status of LOWI, Pi sensors, mobile app, Railway services and Databricks notebooks is not verifiable from this repository.

# 21. Samenvattende Current-State Brief voor Extern Onderzoek

Deze applicatie representeert Klaas Van Slambrouck als een functioneel analist die zich nadrukkelijk beweegt richting AI Business Engineering. De site noemt hem niet simpelweg developer, onderzoeker of consultant, maar bouwt een brugidentiteit: iemand die bedrijfsprocessen begrijpt, frictie in systemen herkent en die inzichten wil vertalen naar werkende digitale en AI-gedreven systemen. De publieke vorm is een interactieve CV- en portfolio-onepager, maar de toon, visuals en features maken haar meer dan een gewone CV-pagina. Ze wil tegelijk professioneel profiel, persoonlijk lab, technisch bewijsstuk en interactieve showcase zijn.

De eerste ervaring begint op `/` met een hero waarin de naam "Klaas Van Slambrouck" centraal staat, gevolgd door de rolrichting "Functioneel Analist -> AI Business Engineer". De thesis zegt dat hij businessprocessen vertaalt naar werkende AI-systemen. De hero wordt gedragen door een 3D- of SVG-architectuurscene met nodes als Next.js, Supabase, Railway, Databricks, Raspberry Pi, mobile en Jarvis. Daardoor communiceert de eerste viewport meteen dat dit profiel rond systemen, infrastructuur, data en AI draait. De pagina heeft geen klassieke navigatiebalk; bezoekers scrollen door een lineaire ervaring. Wel is er een vaste control stack voor LOWI-status, taal, thema en X-Ray.

Na de hero volgt een persoonlijke introductie die Klaas neerzet als functioneel analist met bouwdrang. Daarna komt LOWI vroeg in de flow, voor de formele werkervaring. Dat is inhoudelijk belangrijk: LOWI wordt niet als bijlage behandeld, maar als kern van het verhaal. LOWI staat voor "Lab of Wonder and Imagination" en wordt beschreven als een leer- en bouwomgeving rond AI, biologie, automatisering en creatieve technologie. De site suggereert dat LOWI laat zien hoe Klaas denkt: conceptueel, maar altijd richting iets bruikbaars en technisch degelijks. Deze sectie positioneert de portfolio als levend platform in plaats van statische projectlijst.

Binnen LOWI krijgt Nidus het grootste gewicht. Nidus wordt gepresenteerd als het zenuwcentrum van het LOWI-platform en als een persoonlijk operating system voor gezin, huis en routines. De content noemt koppelingen met energieverbruik, locatie, automatisering, dashboards, Raspberry Pi-workers, Supabase, mobiele interfaces en uiteindelijk Jarvis als intelligente laag. Het project heeft in de content de status "In productie". Voor een externe onderzoeker is het belangrijk om dit genuanceerd te lezen: in deze repository staat geen Nidus-implementatie, geen live endpoint en geen echte screenshot. De site presenteert Nidus dus als een centraal extern of toekomstig platform, maar de huidige repo bewijst vooral de portfolio-shell en de narratieve/visuele representatie ervan. De Nidus-link wijst naar `example.com/nidus`, wat de huidige presentatie placeholderachtig maakt.

LOWI bevat ook CRISPR & CHICKN. Dat project wordt beschreven als een experimenteel datalab voor speelse analyses, gebouwd op Databricks-notebooks en een lichte Next.js-frontend. Het brengt biologie/wetenschap en data/ML in het verhaal, maar is in de huidige applicatie inhoudelijk minder diep uitgewerkt dan Nidus of Jarvis. Er zijn geen screenshots, procesbeschrijvingen of repo-implementaties aanwezig. Het fungeert vooral als signaal van onderzoekende nieuwsgierigheid en science-flavored experimentation.

De CV-laag bestaat uit een tijdlijn met vijf ervaringen. De eerste ervaringen liggen in sound engineering, event production en ondernemerschap: Soundfield NV, Student Kick-Off Gent en Event Explorers. Daarna verschuift de lijn naar functionele analyse: EGOV VZW bij FOD Financien en Itineris NV, waar hij als functioneel consultant en domeinverantwoordelijke service delivery werkt op een grootschalig upgrade-project voor De Watergroep. Deze tijdlijn ondersteunt het verhaal dat Klaas niet alleen digitale systemen analyseert, maar een achtergrond heeft in complexe live/productieomgevingen, cooordinatie, technische uitvoering en stakeholdercontext. De education-sectie noemt een niet-afgeronde industrieel ingenieur elektromechanica aan Universiteit Gent en een Switchfully/Cegeka omscholingstraject tot functioneel analist.

De skills worden niet als gewone badge-lijst gepresenteerd, maar als skill-constellation. De nodes zijn AI, LLMs, Automation, Data, APIs, Systems Thinking, Functional Analysis en Product. Op desktop kan dit een WebGL-graaf zijn waarbij hover gerelateerde projecten toont; op mobiele of reduced-motion contexten valt dit terug op tags. Deze ontwerpkeuze versterkt de centrale boodschap: de waarde zit in verbindingen tussen analyse, data, API's, automatisering en productdenken. De app bewijst frontend- en interaction-capaciteit door dit als interactieve visualisatie te bouwen.

De projectsectie bevat drie projectkaarten: Jarvis, Pi-sensornetwerk en Mobile companion-app. Elke kaart heeft een beschrijving, code snippet, tech tags en optionele X-Ray metadata. De kaarten hebben een "lagen"-interactie die de front/contentlaag, code en tech tags visueel uit elkaar laat komen. In X-Ray mode tonen ze technische boomstructuren. Jarvis wordt beschreven als persoonlijke AI-assistent bovenop nidus-api, met Claude API, Railway, TypeScript, Supabase en pgvector als inhoudelijke stack. Pi-sensornetwerk beschrijft Raspberry Pis die temperatuur en energie meten en naar Supabase pushen. Mobile companion-app beschrijft een React Native/Expo interface voor LOWI-statussen, notificaties en mini-Jarvis. Deze projecten geven veel systems/product/AI-signaal, maar hun case-study diepte is beperkt: er zijn geen screenshots, geen proces, geen concrete resultaten en geen implementatiecode voor deze projecten in de repo.

Jarvis is een van de meest zichtbare unieke features. Het is tegelijk project, terminal-preview, ambient presence en contextuele explain-laag. De terminal toont een voorbeeldgesprek en een disabled input met tekst dat Jarvis nog offline is en later via nidus-api live gaat. Er is dus geen echte chatervaring. De JarvisPresence is wel functioneel: op desktop observeert ze de actieve sectie, toont een korte logregel en kan na 15 seconden dwell time een proactieve suggestie tonen. De knop scrollt naar de Jarvis-sectie. Daarnaast hebben meerdere onderdelen "Vraag Jarvis hierover"-knoppen. Die openen een JarvisExplainPanel met preauthored uitleg, signalen en relevantie. Technisch gebeurt dit via React context en lokale content; er wordt geen LLM aangeroepen. Er is ook een aparte `lib/ai` laag met keyword retrieval, knowledge chunks, example questions, evaluatie en preauthored/template answers. Die laag is via de AI Engineering Playground zichtbaar gemaakt, maar de actuele tests tonen dat de bronselectie nog niet volledig stabiel is.

X-Ray mode is een tweede onderscheidende portfoliofeature. De toggle staat in de vaste control stack en activeert een globale React context. In projectkaarten verschijnen technische layer trees, bijvoorbeeld UI/API/DATA voor Jarvis of EDGE/DATA/OPS voor Pi. In de live-stats verschijnen extra deploymentachtige details. Deze mode laat technische onderlagen zien zonder de hoofdcontent te vervangen. De implementatie is functioneel maar beperkt: X-Ray is geen volledige component-inspector, geen live tracing en geen echte deploymentmetadata. Ze demonstreert vooral dat Klaas graag abstracte claims technisch uitlegbaar maakt.

De "Live systeem" sectie toont cijfers als API-calls deze week, services online, data verwerkt vandaag, uptime en Jarvis-gesprekken. De content vermeldt expliciet dat dit placeholder-cijfers zijn en later rechtstreeks uit het live LOWI-platform moeten komen. Deze sectie werkt als production/observability-signaal, maar is inhoudelijk nog niet echt datagedreven. Een externe onderzoeker moet deze laag dus lezen als gewenste richting en interfacevorm, niet als bewijs van actuele platformtelemetrie.

Technisch is de applicatie gebouwd met Next.js App Router, React 19, TypeScript, CSS Modules, Three.js/React Three Fiber en Supabase. De publieke content is lokaal en typed in `placeholderContent.ts`, met `types/content.ts` als schema. De app gebruikt React contexts voor taal, thema, X-Ray, Jarvis-uitleg en sessie-inzicht. Taal en thema worden bewaard in localStorage; analytics gebruikt een sessionStorage UUID. De app heeft privacyvriendelijke analytics: events gaan naar `/api/track`, payloads worden strikt gevalideerd, referrer wordt herleid tot origin, device type is beperkt tot mobile/tablet/desktop, en er wordt geen volledige user agent of IP in de analytics-payload opgeslagen. Inserts gebeuren server-side met een Supabase service-role client. Adminsessies worden server-side overgeslagen.

Er is ook een beheerlaag. `/beheer` is een loginpagina die post naar `/api/auth/login`. Die route voert server-side rate limiting en Supabase `signInWithPassword` uit. `/beheer/dashboard` wordt beschermd door `proxy.ts` en daarna nogmaals door server-side auth in de page component. Alleen een hardcoded admin user id krijgt toegang. Het dashboard toont unieke sessies, meest bekeken secties, gemiddelde dwell time, interacties en referrers. De repo bevat geen Supabase migrations, dus de echte RLS/policy-configuratie is niet verifieerbaar uit code. Er is wel documentatie met het verwachte database-securitycontract.

Visueel heeft de site een uitgesproken technisch-cinematische identiteit. Het dark theme is standaard, met copper als signatuuraccent, blue voor live/actief en violet voor Jarvis/AI. Er is ook een light theme. De fonts zijn Fraunces, DM Sans en DM Mono. Animaties, 3D-scenes, terminalmotieven en codeblokken geven de site een engineering-lab gevoel. Responsive gedrag is bewust uitgewerkt: onder 768px en bij lage viewporthoogte vallen WebGL-scenes terug, JarvisPresence verdwijnt op mobiel, JarvisExplainPanel wordt een bottom sheet en touch targets worden vergroot. Reduced motion wordt breed gerespecteerd via CSS en scene-support.

Naast de zichtbare Jarvis-laag staat in de actuele lokale werkboom ook een actieve AI Engineering Playground-sectie. Die bestaat uit een untracked parent component en subcomponenten voor vraaginput, pipeline stages, retrieval-inspectie, context-inspectie en antwoordweergave. Hij gebruikt de lokale keyword retrieval, evaluatie en grounded-answer code uit `lib/ai`. Dit maakt de AI-laag concreter dan alleen losse library-code: bezoekers kunnen in principe zien hoe een vraag wordt geanalyseerd, welke bronnen worden gematcht, hoe context wordt samengesteld en welk brongebonden antwoord verschijnt. Tegelijk is deze laag experimenteel. De relevante componenten en answer-code zijn oncommitted/untracked, en de laatste test-run faalt op een retrieval/answer-grounding mismatch waarbij `system-lowi-intro` niet in de verwachte top-k terechtkomt voor de AI Business Engineering-vraag.

Als gebruikerservaring is de site sterk gericht op progressieve verdieping. De eerste laag is emotioneel en positionerend: naam, rolrichting, thesis en visuele systeemmetaforiek. De tweede laag is inhoudelijk: over-mij, LOWI, ervaring, opleiding, talen en projecten. De derde laag is technisch: X-Ray, code snippets, tech tags, 3D-architectuur, analytics en security. De vierde laag is meta/AI: Jarvis legt content uit, observeert secties en suggereert vragen. Hierdoor kan een gewone bezoeker vooral de professionele richting lezen, terwijl een technische bezoeker onderliggende implementatiepatronen kan herkennen. Die gelaagdheid is een duidelijke sterkte, maar ze vraagt ook cognitieve ordening: niet elke bezoeker zal vanzelf begrijpen welke onderdelen live, welke conceptueel en welke voorbereid zijn.

De homepage heeft inhoudelijk geen traditioneel menu en geen klassieke projectdetailpagina's. Alles gebeurt in een enkele verticale route. Dat maakt de ervaring compact en gecontroleerd, maar het beperkt de ruimte voor diepe case studies. Projecten worden nu vooral samengevat in kaarten: titel, korte beschrijving, code snippet, tech stack en X-Ray lagen. De bezoeker krijgt daardoor snel een systeemgevoel, maar weinig bewijs in de vorm van screenshots, context, proces, gemaakte keuzes, resultaat of learnings. Voor LOWI en Nidus is dat extra belangrijk omdat ze het meeste narratieve gewicht krijgen. De site zegt dat Nidus een levend systeem is, maar toont binnen deze repo geen echte interface, geen dataflow, geen dashboard en geen operationele status. Het huidige mentale model voor een externe onderzoeker moet dus zijn: de portfolio zelf is het concrete product in deze repository; LOWI/Nidus zijn centrale inhoudelijke en strategische objecten, maar niet volledig als softwareproduct aanwezig.

De technische basis van de portfolio-app is wel degelijk substantieel. De codebase toont moderne Next.js App Router-structuur, typed content, CSS Modules, React contexts, responsive WebGL-fallbacks, security headers, server-side auth, analytics-validatie, privacykeuzes en een protected dashboard. Dit is belangrijk voor de professionele profilering: zelfs wanneer sommige portfolio-projecten alleen als content bestaan, bewijst de portfolio zelf frontend engineering, interaction design, server/API-denken, Supabase-integratie en security-awareness. De aanwezigheid van unit tests voor de AI retrieval/evaluatie-laag toont dat er wordt nagedacht over uitlegbaarheid, evaluatie, bronbinding en deterministisch gedrag; de actuele falende answer-test laat tegelijk zien dat deze laag nog in beweging is. De AI-laag is bewust eerlijk geformuleerd: comments en UI-teksten zeggen dat er geen LLM, geen embeddings en geen live generation draait in de lokale retrieval. Dat is een sterk betrouwbaarheidsignaal.

De admin- en analytics-laag speelt voor gewone bezoekers nauwelijks een zichtbare rol, maar is strategisch relevant. Ze maakt de portfolio geen pure brochure, maar een meetbaar product. Bezoekersgedrag wordt per sessie, sectie, dwell time en interactie gemeten, met bewuste privacygrenzen. Het dashboard kan tonen welke secties bekeken worden, welke interacties gebruikt worden en welke referrers binnenkomen. Voor toekomstige positionering kan dit belangrijk zijn omdat de site zichzelf kan helpen evalueren: welke content trekt aandacht, waar haken bezoekers af, en welke technische features worden gebruikt? Tegelijk blijft de databasekant deels oncontroleerbaar vanuit de repo: er zijn geen migrations en de RLS/policy-configuratie moet extern in Supabase gecontroleerd worden.

De professionele identiteit die het sterkst aantoonbaar is, is niet "pure AI engineer" en ook niet "klassieke business analyst", maar een overgangsprofiel. De site toont iemand die al professionele legitimiteit heeft in functionele analyse en service delivery, maar die ambitie en persoonlijke projecten gebruikt om richting AI-systemen, automatisering en productdenken te bewegen. De sound/event-achtergrond maakt het profiel atypisch: live production, technische setup, coordination en probleemoplossing komen impliciet mee. Event Explorers voegt ondernemerschap toe. LOWI en Nidus voegen persoonlijk platformdenken toe. Jarvis en de AI Playground voegen AI-uitlegbaarheid en agent-achtige ambitie toe. De spanning is dat deze identiteiten nog niet allemaal dezelfde bewijskracht hebben: functionele analyse en portfolio-engineering zijn sterk bewezen; Nidus/Jarvis/product-ecosysteem zijn sterk verhaald maar deels voorbereid of placeholder.

De sterkste basis van de huidige applicatie is dat ze coherent laat zien hoe Klaas zichzelf wil positioneren: niet alleen als analyst, maar als iemand die processen, data, interfaces en AI in een productachtig systeem wil samenbrengen. De codebase zelf bewijst bovendien echte frontend-, interaction-, security- en analytics-capaciteit. De belangrijkste structurele onduidelijkheid is dat sommige zwaar gepresenteerde claims nog content of placeholder zijn: Nidus, live stats, Jarvis-chat, Pi-netwerk en mobile app zijn inhoudelijk aanwezig, maar niet als volwaardige cases of implementaties in deze repository. Daardoor ontstaat spanning tussen "levend systeem/in productie" en "preview/placeholder/nog niet geintegreerd". Voor toekomstig extern onderzoek is dat precies de kern: bepalen hoe deze rijke, technisch sterke basis kan worden vertaald naar een informatiearchitectuur waarin actieve, experimentele, voorbereide en conceptuele lagen voor bezoekers glashelder van elkaar te onderscheiden zijn, zonder het unieke platformgevoel te verliezen.
