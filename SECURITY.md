# Security

## Admin Boundary

De routenaam `/beheer` is geen security boundary. De repo, routes en clientcode
zijn zichtbaar en mogen niet als geheim worden behandeld.

De werkelijke admin-boundary bestaat uit:

1. Supabase-authenticatie die server-side wordt geverifieerd met
   `auth.getUser()`.
2. Expliciete autorisatie in `lib/auth/admin.ts` op de enige toegestane admin
   user-id.

De admin user-id is geen secret. De waarde staat centraal in code omdat dit voor
de huidige single-admin portfolio-app eenvoudiger en beter reviewbaar is dan een
extra env-var. De service-role key is wel een secret en mag alleen server-side
bestaan.

## Service-Role Boundary

`SUPABASE_SERVICE_ROLE_KEY` wordt alleen gelezen in `lib/supabase/server.ts`.
Die module importeert `server-only` en wordt gebruikt door `app/api/*/route.ts`.
Client components mogen deze module nooit importeren.

De service-role key omzeilt RLS. Daarom gebruikt de publieke app hem alleen voor
gecontroleerde server-side inserts naar `portfolio_analytics`. Dashboard reads
gebeuren via een Supabase SSR cookie-client met anon key, zodat RLS het read
model kan afdwingen.

## Analytics Privacy

De site slaat geen IP-adressen en geen volledige user-agent op in
`portfolio_analytics`. De browser stuurt:

- een UUID in `sessionStorage`, niet in een persistente cookie;
- een eventtype uit een whitelist;
- geschematiseerde eventdata met korte stringlimieten;
- device type uit `mobile`, `tablet` of `desktop`;
- alleen de referrer-origin, zonder path, querystring of hash.

De transparantietekst spreekt daarom over beperkte, privacyvriendelijke
gebruiksstatistieken. De implementatie maakt geen absolute juridische claim dat
er nooit persoonsgegevens kunnen bestaan, omdat sessie-identifiers en referrer
origins contextueel gevoelig kunnen zijn.

## Rate Limiting

`POST /api/track` heeft:

- een per-session DB-limiet van 30 events per minuut;
- een globale DB-noodrem van 240 events per minuut;
- body- en eventData-groottelimieten;
- een TODO in code voor een echte distributed rate limiter voor serieuze
  publieke traffic.

De globale limiet beperkt spam met telkens nieuwe sessionIds zonder IP-opslag,
maar is geen betrouwbare client-identiteit. Bij hoge publieke traffic hoort dit
vervangen te worden door infrastructuur die rate limiting expliciet ondersteunt.

`POST /api/auth/login` voert de volledige loginflow server-side uit: eerst een
in-memory IP-teller (5 pogingen per 10 minuten), daarna pas de echte
`signInWithPassword`-call. Omdat teller en auth-call in dezelfde route zitten,
is de rate-limit niet meer te omzeilen door het formulier over te slaan. De
route retourneert alleen generieke antwoorden (`{ ok: false, error: "generic" }`),
nooit Supabase-foutdetails.

Wie Supabase's eigen auth-endpoint rechtstreeks met de publieke anon key
aanroept, praat buiten deze app om; dat pad valt onder Supabase's eigen
infrastructuur-rate-limits en levert alleen een bruikbare dashboard-sessie op
als de sessie-cookies correct in de browser staan.

Omdat de IP-teller in-memory is en bij cold starts of meerdere instances reset,
is dit nog steeds geen volledig distributed brute-force mechanisme.

## Headers And CSP

De app zet framebescherming, MIME-sniffingbescherming, referrerbeleid en een
restrictieve permissions policy. HSTS wordt alleen gezet wanneer de deployment
aantoonbaar achter HTTPS draait (`VERCEL_ENV=production`) of expliciet via
`ENABLE_HSTS=true`.

Een volledige enforced CSP voor scripts en styles is nog niet toegevoegd. Dat is
bewust: Next.js, next/font en de WebGL/React runtime hebben een aparte nonce- of
hashstrategie nodig om dat zonder regressies te doen.

## Error Boundaries

`app/error.tsx` en `app/beheer/dashboard/error.tsx` tonen generieke herstelbare
foutschermen. Ze tonen geen stack traces of interne foutdetails aan bezoekers.
