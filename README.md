# LOWI CV

Publieke CV/portfolio-pagina van Klaas Van Slambrouck: een interactieve,
tweetalige Next.js one-pager met LOWI-visualisaties, privacyvriendelijke
analytics en een klein admin-dashboard.

## Tech stack

- Next.js App Router met TypeScript
- CSS Modules, geen Tailwind
- Three.js via `@react-three/fiber`, `@react-three/drei` en postprocessing
- Supabase SSR auth voor `/beheer`
- Supabase `portfolio_analytics` voor server-side analytics inserts
- Fonts via `next/font`: Fraunces, DM Sans en DM Mono

## Lokaal draaien

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Vul voor auth en analytics minimaal `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` en `SUPABASE_SERVICE_ROLE_KEY` in. Zonder die
waarden blijft de publieke CV bruikbaar, maar beheer en analytics werken niet.

## Architectuur

- Publieke CV: `app/page.tsx` rendert de CV-content uit
  `content/placeholderContent.ts` met client-side taal-, thema-, X-ray- en
  Jarvis-contexten.
- Public boundary: bezoekers krijgen geen service-role key en schrijven nooit
  direct naar Supabase. Analytics gaan uitsluitend via `POST /api/track`.
- Admin boundary: `/beheer/dashboard` is beschermd door `proxy.ts` en nogmaals
  in de server component. Beide gebruiken `lib/auth/admin.ts`, dat Supabase
  server-side met `auth.getUser()` verifieert en daarna expliciet de admin-id
  autoriseert.
- Analytics flow: de browser maakt een sessionStorage UUID, normaliseert de
  referrer naar origin, en stuurt alleen gewhiteliste events. De API valideert
  payloads opnieuw en schrijft met de server-only service-role client.
- Service-role boundary: `SUPABASE_SERVICE_ROLE_KEY` wordt alleen gebruikt in
  server-only code onder `lib/supabase/server.ts` en API-routes.
- WebGL fallback: Three.js-scenes laden lazy en vallen terug bij klein scherm,
  ontbrekende WebGL-support of reduced motion.
- Reduced motion: globale CSS en scene-support schakelen beweging of live WebGL
  terug waar dat relevant is.

Meer detail staat in [ARCHITECTURE.md](ARCHITECTURE.md),
[SECURITY.md](SECURITY.md) en
[docs/database-security.md](docs/database-security.md).

## Validatie

```bash
npm run lint
npm run build
```
