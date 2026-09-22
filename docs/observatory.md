# Human & Agent Observatory

## Original implementation: audit, 22 September 2026

`useAnalyticsSession` generated a UUID in sessionStorage (`cv-session-id`, tab
lifetime). `trackEvent` already sent allowlisted events to `/api/track` by fetch or
JSON beacon. The route validated input, skipped authenticated admins, applied
30/session and 240/global events-per-minute caps, and inserted into
`portfolio_analytics` with a server-only service-role client. There were no direct
browser analytics writes to Supabase.

Live inspection confirmed UUID IDs, JSONB event data and the existing three event
types (`section_view`, `dwell_time`, `interaction`). RLS was enabled. The only
policy was authenticated SELECT for the configured admin UUID; there was no public
INSERT policy. Broad legacy table grants existed, but RLS restricted row access.
Existing policies/grants and all historical rows are preserved.

Sections used IntersectionObserver (threshold 0.12). Elapsed dwell flushed on
exit/hide/unmount. A separate one-second local timer supplied SessionInsightContext
and JarvisPresence's 15-second suggestion threshold. Idle time counted and there
was a visibility-resume gap. Jarvis does not query historical Supabase analytics;
its public knowledge base is separate. `/beheer/dashboard` is the database reader,
using the authenticated SSR client.

Referrers were origin-only; viewport width supplied device type. No UTM/via or
persistent internal-browser flag existed. Next.js is 16.2.10. Existing `proxy.ts`
protected the admin dashboard. `/llms.txt` already existed, generated from current
portfolio content with links to `/nidus`, `/lowi`, CV files and sitemap; retained.

## Architecture

Browser → `/api/track` → validation/server UA classification → service-only
`record_portfolio_event` transaction → existing events + `portfolio_sessions`.

The transaction deduplicates event UUIDs, preserves first acquisition, updates
last-seen and keeps internal/automation exclusions sticky. It also enforces the
existing emergency rate caps across instances. This is a small-portfolio safeguard,
not a high-throughput abuse-control service. Session UUIDs and browser signals are
untrusted claims, not authentication or evidence of a person's real identity.

`AnalyticsObserver` records public page views and CV clicks; a click means download
intent, not completion. Section-view behavior is retained. Each event carries its
current allowlisted path. Timestamps are server receipt times; concurrent/beacon
arrivals can be out of order and are not a precision client chronology.

Public HTTP request → existing proxy → filtered observation → `waitUntil`
background insert into `portfolio_requests`. Failures do not block public pages.
The dashboard auth and cookie-refresh branch is preserved. Enable server-only
`PORTFOLIO_REQUEST_LOGGING=true` after migration. Included: NL/EN public pages,
cases/projects, robots/sitemap/llms, CV JSON/PDF. Excluded: assets, API/admin routes,
health checks, RSC and prefetch. Extend `publicPath` and the proxy matcher when
adding public route families. A row proves a request reached the proxy, not that
the response succeeded or was read. Upstream caching/firewalls can limit coverage.

Request rows deliberately have no session UUID. `portfolio_journey` combines two
observation streams without linking them by time, geography, referrer or provider.
Request internal status is true with `internal=1`, otherwise NULL: proxy cannot
read the browser's localStorage flag.

## Session attribution and internal visits

The original tab-session UUID lifetime is preserved across reloads and NL/EN
navigation. No tracking cookie or persistent device ID is introduced. Duplicating
a browser tab may copy sessionStorage and share its UUID. If sessionStorage is
denied, browser tracking stays off; request observations still work. Historical
sessions are not guessed/backfilled.

Initial path, referrer origin, `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content` and `via` are cached per session and repeated with events so a lost
first packet does not discard attribution. Columns: `source`, `medium`, `campaign`,
`content`, `via`. Campaign labels allow 100 ASCII letters/digits/spaces/underscore/
dot/hyphen; URL/email-like values are discarded. `source` stays NULL without a UTM
source; examine referrer and via alongside it. Tellent is a referral origin, not
proof of a recruiter.

Visit `/?internal=1` once: localStorage `portfolio-internal=1` persists. Data still
collects and sessions are filterable. `?internal=0` resets it. Existing internal
sessions stay excluded: start a fresh tab or remove `cv-session-id` from
sessionStorage and reload after reset. Authenticated admin events are now retained
as internal. Request logging cannot inherit the local flag automatically.

## Active dwell and Jarvis

Active dwell requires an intersecting section, visible document, focus, and
activity within 30 seconds. Passive reading counts for the first 30 seconds.
Trusted pointer/touch/key/scroll events extend this window; pointer movement is
sampled at most once per second. No key values, coordinates or form input is kept.
Signals contain webdriver, first-interaction delay, sampled counts by type, and
visibility/focus; snapshots describe the latest document, not session-wide totals.

Local updates run each second for Jarvis; network deltas flush every 30 seconds
and on exit/blur/hide/unmount. Listeners are shared. Impressions below one second
of active time get no active-dwell credit. `event_data.seconds` remains raw elapsed
time; `activeSeconds`, `dwellVersion: 2`, `impressionId` are additive. Sum deltas;
the latest packet is not the total. Raw v2 includes idle/hidden time while the
section remains intersecting. Old v1 stopped at hide and is not exactly equivalent.
Old rows' active time is NULL, not zero. The legacy dashboard still shows raw dwell
but counts v2 impressions instead of packets.

Jarvis local interest uses active seconds and excludes internal, declared bot,
webdriver/headless sessions. Server exclusion feedback also hides existing local
context. Undetected automation can still resemble a human candidate. No historical
or cross-session database analytics are supplied to Jarvis.

## Classification and confidence

The isolated, tested classifier supports human_candidate, search_engine,
ai_training, ai_search, ai_user_fetch, social_preview, automation and unknown.
Providers: openai, anthropic, perplexity, google, microsoft, meta, other or NULL.
Evidence is a normalized UA token/reason; full UAs are not stored.

- **declared**: recognized HTTP User-Agent token; spoofable.
- **inferred**: webdriver/headless/automation pattern, or ordinary browser deemed
  only a human candidate. Behavior never proves an agent/provider identity.
- **verified**: reserved for a trusted verification mechanism. No current path
  produces this label. Client-supplied confidence or BotID is rejected.

A `Claude-User` or `ChatGPT-User` request means the service fetched the site in a
user-related context **if its UA declaration is genuine**. It does NOT by itself
prove which human initiated it or that a nearby browser session belongs to that
same person. Timing proximity is correlation, not a person-level link.

BotID Phase 3 is deferred. Live response headers from `klaasvanslambrouck.dev`
confirm Vercel hosting, but the project has no installed BotID
package or client challenge/configuration. Current docs describe `withBotId`,
`initBotId`, `checkBotId`; Deep Analysis collects thousands of client signals.
That needs privacy review against the lightweight-only requirement and deployment
verification. Separate nullable `botid` columns reserve isBot, isVerifiedBot,
verifiedBotName and verifiedBotCategory; currently NULL. A future adapter should
check selected session-establishment requests, not assets, and must not upgrade a
UA provider merely because a generic bot verdict was verified.

## Database rollout

`supabase/migrations/20260922152946_portfolio_observatory.sql` was applied to the
configured project `pesrniobtdnjdftbpywh`. Do not rerun it there. In another
environment with the existing portfolio_analytics baseline, run it before deploying
the new code. It adds two tables, nullable event path, indexes, a service-only
SECURITY INVOKER writer, admin-only SELECT policies, and invoker views:

- `portfolio_human_events`: eligible new-session events; historical unknowns excluded.
- `portfolio_journey`: browser events with UUID plus independent HTTP requests.
- `portfolio_dwell_comparison`: raw/active sums per session/path/section.

Original rows, event type constraint and SELECT policy are unchanged. V1 clients
still work; missing context stays unknown. Rolling application code back is safe;
leave the additive schema. No manual SQL remains for the configured database.
Existing secrets are reused. Only new environment variable:
`PORTFOLIO_REQUEST_LOGGING=true` (server-only, default disabled).

```sql
select * from public.portfolio_sessions order by started_at desc limit 50;
select * from public.portfolio_journey order by created_at desc limit 100;
select * from public.portfolio_dwell_comparison
where is_internal = false and automation_type = 'human_candidate';
select automation_type, provider, confidence, count(*)
from public.portfolio_requests group by 1,2,3;
```

Use the authorized admin or service connection. Views respect underlying RLS.
Public clients cannot read new tables/views or invoke the writer.

## Verification recipes

Enable request logging on local/preview; use a fresh tab per scenario. Inspect
`/api/track` and the tables/views above. Mark browser QA with internal=1.

| Scenario | Action | Expected |
| --- | --- | --- |
| Browser | Read/scroll `/`, switch away for a minute | human_candidate/inferred; active time stops when idle/hidden |
| Internal | `/?internal=1`, reload without query | is_internal true; local interest excluded |
| Referral | Follow a Tellent link or API-test a Tellent referrer | origin only, no recruiter identity claim |
| Campaign | `/?via=linkedin&utm_source=linkedin&utm_medium=social&utm_campaign=portfolio&utm_content=profile`, then `/nidus` | first acquisition preserved |
| Search | `curl -A "Googlebot/2.1" http://localhost:3100/robots.txt` | search_engine/google/declared |
| AI search | `curl -A "OAI-SearchBot/1.0" http://localhost:3100/llms.txt` | ai_search/openai/declared |
| AI fetch | `curl -A "Claude-User/1.0" http://localhost:3100/nidus` | ai_user_fetch/anthropic/declared, no browser UUID |
| Preview | `curl -A "LinkedInBot/1.0" http://localhost:3100/` | social_preview/other/declared |
| Automation | Open via Playwright/agent-browser with webdriver | automation/inferred, no local human interest |
| Assets | Request assets, API or with `RSC: 1` | no request row |

Use `curl.exe` on PowerShell. Spoofed-UA tests are declaration tests, not verified
provider tests. Database fixtures should be rolled back or marked internal.
Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Rollback-only SQL integration checks are in `supabase/tests/portfolio_observatory.sql`.
The implementation was checked with the production server, actual browser events,
declared crawler HTTP requests, database readback, deduplication and dashboard auth
redirects. QA browser/API sessions are marked internal. Repository-wide lint has an
unrelated existing `react-hooks/set-state-in-effect` error at
`components/linguix/SchrijfScorer.tsx:408`; changed-file lint passes.

## Privacy and limitations

No raw IP, full UA/referrer URL, arbitrary query string, fingerprint, cross-site ID
or real visitor identity is stored by these collectors. Only Vercel-hosted servers
accept coarse country/region headers; other hosts store NULL. Hosting/platform logs
have separate policies. Campaign labels remain caller-controlled: never put names
or personal identifiers in them.

Beacons, blockers, abrupt termination, quota failures and offline visits can lose
data; there is no durable retry queue. Analytics never gates the UI. Focus detection
varies by browser. Overlapping sections can accrue simultaneous dwell; summing them
does not measure total session time. HTTP logging is best effort and unsampled;
high traffic needs retention, monitoring and platform abuse controls. Retention
deletion is not enabled automatically, preserving the requested historical data.

The full dashboard, retention policy, trusted BotID adapter and opt-in request/session
linkage remain future work. The existing dashboard remains a legacy all-traffic
view; use portfolio_human_events for human-interest analysis.

References: [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy),
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[OpenAI agents](https://developers.openai.com/api/docs/bots),
[Anthropic agents](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler),
[BotID](https://vercel.com/docs/botid).
