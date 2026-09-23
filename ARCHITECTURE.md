# Architectuur

## Publieke app

Elke publieke pagina bestaat twee keer: Nederlands op `/` en Engels onder `/en`
(zie "Talen"). De paginabestanden zijn dun. Ze halen hun metadata uit
`lib/localizedPages.ts` en renderen een route-component uit `components/routes/`,
die de JSON-LD meegeeft en de eigenlijke pagina aanroept. De CV-one-pager zelf
staat als clientcomponent in `components/HomePage.tsx`, op basis van
`content/placeholderContent.ts`. De pagina gebruikt providers voor taal, thema,
X-ray, Jarvis-uitleg en sessie-inzichten. De content blijft lokaal en tweetalig.

De Three.js-onderdelen laden lazy met `next/dynamic` en `ssr: false`.
`hooks/useSceneSupport.ts` bepaalt of live WebGL veilig is. Bij klein scherm,
lage viewport, ontbrekende WebGL-support of reduced motion toont de app de
bestaande fallbacks.

## Talen

Nederlands staat op `/`, Engels onder `/en`. De taal zit dus in de URL, niet in
client-state: server en browser renderen dezelfde taal, en een zoekmachine of
agent ziet op elke URL wat een bezoeker ziet. Er is geen automatische taalwissel
op browsertaal en geen opgeslagen voorkeur meer.

**Routestructuur.** Twee route groups met elk een eigen root layout:

| Map | Inhoud | `<html lang>` |
|---|---|---|
| `app/(nl)/` | `/`, `/nidus`, `/lowi`, plus de NL-only routes `/cases/*` en `/beheer/*` | `nl` |
| `app/(en)/en/` | `/en`, `/en/nidus`, `/en/lowi` | `en` |

Beide layouts renderen `components/RootDocument.tsx` (fonts, globale CSS,
providers) en halen hun metadata uit `lib/rootMetadata.ts`. Omdat er twee root
layouts zijn en dus geen gedeelde layout voor een 404, staat de globale
niet-gevonden-pagina in `app/global-not-found.tsx`; die vereist
`experimental.globalNotFound` in `next.config.ts`. Route handlers en
metadata-routes (`app/api/`, `/cv.json`, `/llms.txt`, `sitemap.ts`, `robots.ts`,
`icon.tsx`) staan buiten de groups: ze hebben geen layout nodig en bestaan in
één versie.

**Paden.** `lib/site.ts` is de enige plek die weet hoe een URL per taal heet:

- `localizedPath(pad, taal)` — `/nidus` → `/en/nidus`, `/` → `/en`;
- `basePathOf(pathname)` — de omgekeerde richting;
- `languageOfPath(pathname)` — de taal uit het pad, zodat die nergens apart
  opgeslagen hoeft te worden;
- `PUBLIC_ROUTES[].localized` — welke routes een `/en`-versie hebben.

Content bevat alleen het NL-basispad (`celPath`, `caseStudyPath`, `ctaHref`);
componenten zetten dat bij het renderen om met `localizedPath`. Er staat dus
geen tweede, Engelse lijst met paden in de content.

**Metadata.** `lib/pageMetadata.ts` bouwt canonical, hreflang en Open Graph voor
elke pagina: canonical naar zichzelf, `alternates.languages` met `nl-BE`, `en`
en `x-default` (naar de NL-versie), en `openGraph.locale` `nl_BE` of `en_GB`.
`pageLanguageLinks` in `lib/site.ts` bepaalt waar de vertaling staat; met
`alternateUrl` kan een pagina daarvan afwijken (eigen slug per taal) of
aangeven dat er geen vertaling is (`null`). `lib/localizedPages.ts` bevat de
definitie van elke tweetalige pagina (locatie plus metadata) en `LOCALIZED_PAGES`
voor de tests; een test bewaakt dat die lijst en `PUBLIC_ROUTES` dezelfde routes
beschrijven.

**Taalknop.** `components/LanguageToggle.tsx` is een `<Link>` naar dezelfde
pagina in de andere taal. Het doel komt uit `TranslationContext`, dat de route
vult met hetzelfde `pageLanguageLinks`-resultaat als de hreflang. Bestaat er
geen vertaling (`/cases/*`, `/beheer/*`), dan verschijnt de knop niet. Omdat de
talen aparte root layouts hebben, is de wissel een volledige page load.

**Verder per taal:** de Open Graph-afbeeldingen (dunne `opengraph-image.tsx` per
taal, gedeelde builders in `lib/og.tsx`), de JSON-LD-paginanodes (ProfilePage en
WebPage met eigen `@id`, `url` en `inLanguage`; `Person`, LOWI en Nidus houden
overal hetzelfde `@id`), de sitemap (beide URL's met `xhtml:link`-alternates) en
`/llms.txt` (per pagina beide URL's). Machinebestanden — `/cv.json`, `/cv.pdf`,
`/llms.txt`, `/sitemap.xml`, `/robots.txt` en de IndexNow-sleutel — bestaan in
één versie en krijgen geen `/en`-variant.

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
- `app/(nl)/beheer/dashboard/page.tsx` voert dezelfde autorisatie opnieuw uit voordat
  analytics worden gelezen.

Beide gebruiken `lib/auth/admin.ts`. Die helper gebruikt `auth.getUser()` in
plaats van `auth.getSession()` voor autorisatiebeslissingen en vergelijkt daarna
expliciet met de geconfigureerde admin user-id.

## Analytics

Er zijn twee sporen.

**Serverwaarnemingen.** `proxy.ts` maakt per GET/HEAD een observatie met
`lib/analytics/requestObservation.ts` en schrijft die via
`lib/analytics/logRequest.ts` naar `portfolio_requests`: pad, methode,
referrer-origin, de UA-classificatie uit `lib/analytics/classify.ts` (zoekmachine,
AI-crawler, automation…), grof land/regio en een expliciete internal-marker.
Prefetches en RSC-fetches tellen niet als bezoek. Zo zijn ook bezoekers zichtbaar
die geen JavaScript uitvoeren, zoals de meeste bots.

**Browser-events.** De browser maakt een UUID in `sessionStorage` via
`hooks/useAnalyticsSession.ts`. Events gaan via `lib/analytics/trackEvent.ts`
naar `POST /api/track`, met per event: het pad, een event-id, de
eerste-touch-acquisitie (landingspad, referrer-origin, UTM-labels) en
activiteitssignalen uit `lib/analytics/browserActivity.ts`.
`components/AnalyticsObserver.tsx` stuurt per pathname een `page_view`.

`app/api/track/route.ts` accepteert alleen JSON POSTs, checkt de bodygrootte,
valideert UUID, eventtype, device type, pad, sessie en signalen per schema
(`lib/analytics/trackValidation.ts`), en normaliseert de referrer opnieuw
server-side. Adminsessies worden server-side geskipt. Schrijven gebeurt via de
RPC `record_portfolio_event` met de server-only service-role client uit
`lib/supabase/server.ts`; bezoekers krijgen geen directe write-access.

**Paden en taal.** `publicPath()` in `lib/analytics/session.ts` laat alleen
bekende publieke paden door en knipt query en fragment eraf. De lijst komt uit
`PUBLIC_ROUTES` + `localizedPath` (dus automatisch beide talen), aangevuld met
de machinebestanden zonder sitemap-entry en de `/cases/`- en `/projects/`-paden.
De taal wordt niet apart gelogd: `/en/nidus` zegt dat al, en `languageOfPath()`
leidt ze af wanneer nodig. Privacy blijft daarmee gelijk aan de rest van de
module: alleen paden en origins, geen query's, fragmenten of vrije tekst.

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
  URL-lijst komt uit `app/sitemap.ts`, dus uit `PUBLIC_ROUTES` — inclusief de
  `/en`-versies van elke vertaalde route.
- **Draaien:** `npm run indexnow` is een dry-run; `npm run indexnow -- --send`
  controleert eerst dat het sleutelbestand live staat en verstuurt dan.
  `NEXT_PUBLIC_SITE_URL` moet in `.env.local` op `https://klaasvanslambrouck.dev`
  staan, anders weigert het script (geen https, of nog `vercel.app`).
- **Wanneer:** na een deploy met inhoudelijke wijzigingen, niet bij elke commit.
  Zonder echte wijziging pingen levert niets op en kan tot `429` leiden.

## Open punten / technische schuld

### Jarvis krijgt geen taal mee

`components/jarvis/JarvisAsk.tsx` stuurt `{ question, sessionId }` naar
`NEXT_PUBLIC_NIDUS_API_URL`. De UI-teksten volgen de taal van de route, maar het
antwoord van Jarvis niet: de API weet niet of de bezoeker op `/` of op `/en`
zit. Na te kijken in `nidus-api`: accepteert het contract een extra veld
`language`, en wat doet het ermee? Pas daarna hier meesturen.

### RSC-payload van /nidus en /lowi bevat beide talen

Die routes geven tweetalige contentobjecten als props door aan
clientcomponenten, dus de flight-data bevat ook de niet-getoonde taal. De
zichtbare HTML en `<html lang>` kloppen wel. Oplossen zou betekenen dat de
server de content per taal platslaat vóór ze als prop meegaat; dat raakt alle
Nidus- en LOWI-componenten. Kosten: wat extra bytes per pagina.

### npm audit

`npm audit` meldt 11 bestaande kwetsbaarheden (4 moderate, 6 high, 1 critical;
o.a. in next, vitest, postcss, sharp). Nog niet onderzocht; aparte sessie.

### ESLint-fout in SchrijfScorer

`components/linguix/SchrijfScorer.tsx:408:10` faalt op
`react-hooks/set-state-in-effect` ("Calling setState synchronously within an
effect can trigger cascading renders"). Oplossen in een aparte fix-commit.

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
