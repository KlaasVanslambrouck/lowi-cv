# Architectuur

## Publieke app

`app/page.tsx` is een client-rendered CV-one-pager op basis van
`content/placeholderContent.ts`. De pagina gebruikt providers voor taal, thema,
X-ray, Jarvis-uitleg en sessie-inzichten. De content blijft lokaal en tweetalig;
deze hardeningfase wijzigt geen CV-inhoud.

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
