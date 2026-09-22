# Architectuur

## Publieke app

`app/page.tsx` is een servercomponent die de metadata (canonical) en de JSON-LD
rendert; de eigenlijke CV-one-pager staat als clientcomponent in
`components/HomePage.tsx`, op basis van `content/placeholderContent.ts`. De
pagina gebruikt providers voor taal, thema, X-ray, Jarvis-uitleg en
sessie-inzichten. De content blijft lokaal en tweetalig.

De Three.js-onderdelen laden lazy met `next/dynamic` en `ssr: false`.
`hooks/useSceneSupport.ts` bepaalt of live WebGL veilig is. Bij klein scherm,
lage viewport, ontbrekende WebGL-support of reduced motion toont de app de
bestaande fallbacks.

## Beheer

`/beheer` is de loginpagina. Het formulier post `{ email, password }` naar
`POST /api/auth/login`; die route voert server-side eerst een in-memory
IP-pogingenteller uit en daarna zelf `signInWithPassword` via de Supabase
SSR-cookie-client, zodat de sessie-cookie door de server wordt gezet. De
teller en de echte auth-call zitten daardoor in dezelfde route en de
rate-limit is niet meer te omzeilen door het formulier over te slaan. De
in-memory teller blijft wel een basisdrempel, geen volledige
brute-forcebescherming in serverless omgevingen. Uitloggen gebeurt nog
client-side via de anon-key browserclient (`signOut` in het dashboard).

`/beheer/dashboard` is dubbel beschermd:

- `proxy.ts` verifieert de Supabase-sessie server-side voordat de route rendert.
- `app/beheer/dashboard/page.tsx` voert dezelfde autorisatie opnieuw uit voordat
  analytics worden gelezen.

Beide gebruiken `lib/auth/admin.ts`. Die helper gebruikt `auth.getUser()` in
plaats van `auth.getSession()` voor autorisatiebeslissingen en vergelijkt daarna
expliciet met de geconfigureerde admin user-id.

## Analytics

De browser maakt een UUID in `sessionStorage` via `hooks/useAnalyticsSession.ts`.
Events gaan via `lib/analytics/trackEvent.ts` naar `POST /api/track`. Alleen het
eerste event stuurt clientcontext mee: genormaliseerde referrer-origin en
device type.

`app/api/track/route.ts` accepteert alleen JSON POSTs, checkt de bodygrootte,
valideert UUID, eventtype, device type en eventdata per schema, en normaliseert
de referrer opnieuw server-side. Adminsessies worden server-side geskipt.

Inserts naar `portfolio_analytics` gebeuren met de server-only service-role
client uit `lib/supabase/server.ts`. Bezoekers krijgen geen directe write-access
naar Supabase.

## Security Headers

`next.config.ts` zet compatibele security headers voor alle routes:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` voor ongebruikte browsercapabilities
- `X-Frame-Options: DENY`
- CSP met `frame-ancestors 'none'`, `object-src 'none'` en `base-uri 'self'`
- HSTS alleen op Vercel production of wanneer `ENABLE_HSTS=true` is gezet

Een volledige script/style-CSP is bewust nog niet enforced. Next.js runtime
scripts, font loading, Supabase calls en de WebGL-stack moeten daarvoor apart
met nonces of hashes worden gevalideerd.

## IndexNow

IndexNow is een protocol waarmee een site zoekmachines zelf laat weten welke
URL's gewijzigd zijn, in plaats van te wachten tot een crawler langskomt. Bing,
Yandex en andere deelnemers delen die meldingen onderling. Google gebruikt
IndexNow niet; daar blijven de sitemap en Search Console de weg.

- **Sleutel:** `INDEXNOW_KEY` in `lib/site.ts`, en hetzelfde als bestand
  `public/<sleutel>.txt` (inhoud: enkel de sleutel). De sleutel is niet geheim;
  een test bewaakt dat bestandsnaam, inhoud en constante overeenkomen.
- **Script:** `scripts/indexnow.ts`, met de pure delen in `lib/indexNow.ts`. De
  URL-lijst komt uit `app/sitemap.ts`, dus uit `PUBLIC_ROUTES`.
- **Draaien:** `npm run indexnow` is een dry-run; `npm run indexnow -- --send`
  controleert eerst dat het sleutelbestand live staat en verstuurt dan.
  `NEXT_PUBLIC_SITE_URL` moet in `.env.local` op `https://klaasvanslambrouck.dev`
  staan, anders weigert het script (geen https, of nog `vercel.app`).
- **Wanneer:** na een deploy met inhoudelijke wijzigingen, niet bij elke commit.
  Zonder echte wijziging pingen levert niets op en kan tot `429` leiden.

## Open punten / technische schuld

### npm audit

`npm audit` meldt 11 bestaande kwetsbaarheden (o.a. in next, vitest, postcss,
sharp). Nog niet onderzocht; aparte sessie.

### ESLint-fout in SchrijfScorer

`components/linguix/SchrijfScorer.tsx:408` faalt op
`react-hooks/set-state-in-effect`. Oplossen in een aparte fix-commit.

### CV-data leeft op drie plekken

| Bron | Rol |
|---|---|
| `nidus-api` · `src/data/cvData.ts` | bron van de CV-PDF; rijkst: bullets per functie, tweede opleiding, aanbevelingen |
| `nidus-api` · `src/data/portfolioContent.ts` | tekst voor Jarvis/AI-consumptie |
| `lowi-cv` · `content/placeholderContent.ts` | deze site, de Jarvis-kennisbank en `/cv.json` |

Dezelfde gegevens (functies, perioden, vaardigheidsclusters) staan dus drie keer
en moeten handmatig in sync blijven. Wijzig je één bron, controleer dan de andere
twee. Doel op termijn: één bron; welke is nog te beslissen. Bewust nog niet
opgelost; zie ook het commentaarblok bovenaan `lib/cvResume.ts`.
