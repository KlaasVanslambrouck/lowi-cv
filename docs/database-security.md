# Database Security Contract

Deze repo bevat geen Supabase migrations voor `portfolio_analytics`. De actuele
productiepolicies zijn daardoor niet vanuit git verifieerbaar. Dit document legt
het verwachte securitycontract vast en geeft veilige SQL-queries waarmee een
reviewer de Supabase-configuratie kan controleren.

## Tabel

Verwachte tabel: `public.portfolio_analytics`.

Verwachte kolommen op basis van de app:

- `session_id`: UUID of tekstuele UUID
- `event_type`: tekst, beperkt door de API tot `section_view`, `dwell_time` of
  `interaction`
- `event_data`: JSON/JSONB
- `referrer`: nullable tekst, alleen origin zonder query/hash
- `device_type`: nullable tekst, beperkt door de API tot `mobile`, `tablet` of
  `desktop`
- `created_at`: timestamp met default aan databasezijde

## Actors

- Inserts: alleen `app/api/track/route.ts`, via de server-only service-role
  client. Browserclients schrijven niet direct naar Supabase.
- Reads: alleen `/beheer/dashboard`, via Supabase SSR cookies met anon key en
  een geverifieerde adminsessie.
- Updates/deletes: niet gebruikt door de app.

## Service Role

De service-role key omzeilt RLS en hoort uitsluitend op de server. In deze repo
zit die grens in `lib/supabase/server.ts`, met `server-only`. De key mag nooit
een `NEXT_PUBLIC_` prefix krijgen en nooit in client components worden gebruikt.

## RLS Verwachting

RLS hoort aan te staan op `public.portfolio_analytics`.

Aanbevolen read-model:

- `authenticated` mag selecteren als `auth.uid()` gelijk is aan de admin user-id
  uit `lib/auth/admin.ts`.
- `anon` krijgt geen directe select-, insert-, update- of delete-policy op deze
  tabel.
- Inserts via service-role hebben geen anon insert-policy nodig, omdat de API de
  payload valideert en de service-role server-side gebruikt.

Maak geen automatische migration die bestaande productiepolicies blind
overschrijft. Controleer eerst de live policies.

## Verificatiequeries

Controleer kolommen:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'portfolio_analytics'
order by ordinal_position;
```

Controleer RLS:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'portfolio_analytics';
```

Controleer policies:

```sql
select policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'portfolio_analytics'
order by policyname;
```

Controleer grants:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'portfolio_analytics'
order by grantee, privilege_type;
```

## Voorbeeldpolicy, Niet Blind Toepassen

Gebruik dit alleen als referentie na review van de bestaande productieconfig:

```sql
alter table public.portfolio_analytics enable row level security;

create policy "admin can read portfolio analytics"
on public.portfolio_analytics
for select
to authenticated
using (auth.uid() = 'b35fbaec-6bd9-4425-9193-e840dfe19eee'::uuid);
```

Laat anon policies voor deze tabel weg tenzij er een expliciete reden is. De
publieke analytics write-flow hoort via `POST /api/track` te lopen, niet direct
via Supabase vanuit de browser.
