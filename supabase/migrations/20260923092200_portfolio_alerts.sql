BEGIN;

CREATE TABLE public.portfolio_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type text NOT NULL
    CHECK (ref_type IN ('session', 'request')),
  ref_id text NOT NULL,
  alert_type text NOT NULL
    CHECK (alert_type IN ('portfolio_bezoek', 'portfolio_agent')),
  reden text NOT NULL,
  provider text,
  status text NOT NULL DEFAULT 'claimed'
    CHECK (status IN ('claimed', 'sent', 'failed')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT portfolio_alerts_ref_unique
    UNIQUE (ref_type, ref_id, alert_type)
);

CREATE INDEX portfolio_alerts_type_provider_claimed_idx
  ON public.portfolio_alerts (alert_type, provider, claimed_at DESC);

CREATE INDEX portfolio_alerts_claimed_idx
  ON public.portfolio_alerts (claimed_at DESC);

ALTER TABLE public.portfolio_alerts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.portfolio_alerts
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.portfolio_alerts TO authenticated;
GRANT ALL ON public.portfolio_alerts TO service_role;

CREATE POLICY "admin reads portfolio alerts"
  ON public.portfolio_alerts
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) =
      'b35fbaec-6bd9-4425-9193-e840dfe19eee'::uuid
  );

COMMENT ON TABLE public.portfolio_alerts IS
  'Claim table: a row is a reservation, not proof of delivery. Only a successful new insert grants the right to attempt a push. After the push attempt, status must be updated to sent or failed; sent_at records successful sending. Every status retains the unique reservation. Confidence levels must never be upgraded downstream: inferred never becomes declared or verified, and declared never becomes verified.';

CREATE VIEW public.v_portfolio_alert_kandidaten
WITH (security_invoker = true) AS
WITH drempels AS (
  SELECT
    interval '24 hours' AS venster,
    25::numeric AS dominante_dwell_drempel,
    60::numeric AS totale_dwell_drempel,
    10::numeric AS minimum_dwell,
    interval '2 hours' AS ai_fetch_cooldown,
    interval '1 hour' AS preview_cooldown,
    interval '1 hour' AS cv_pdf_cooldown
),
sessies AS (
  SELECT s.*
  FROM public.portfolio_sessions s
  CROSS JOIN drempels d
  WHERE s.is_internal = false
    AND s.automation_type = 'human_candidate'
    AND (
      s.last_seen_at >= now() - d.venster
      OR EXISTS (
        SELECT 1
        FROM public.portfolio_analytics e
        WHERE e.session_id = s.session_id
          AND e.created_at >= now() - d.venster
      )
    )
),
sessie_events AS (
  SELECT e.*
  FROM public.portfolio_analytics e
  INNER JOIN sessies s USING (session_id)
),
sessie_metrics AS (
  SELECT
    session_id,
    SUM((event_data->>'activeSeconds')::numeric) FILTER (
      WHERE event_type = 'dwell_time'
        AND event_data->>'dwellVersion' = '2'
    ) AS actieve_seconden_totaal,
    SUM((event_data->>'seconds')::numeric) FILTER (
      WHERE event_type = 'dwell_time'
    ) AS ruwe_seconden,
    array_agg(
      DISTINCT event_data->>'sectionId'
      ORDER BY event_data->>'sectionId'
    ) FILTER (
      WHERE event_type = 'section_view'
        AND event_data->>'sectionId' IS NOT NULL
    ) AS secties,
    array_agg(DISTINCT path ORDER BY path)
      FILTER (WHERE path IS NOT NULL) AS paden,
    MAX(created_at) AS laatste_event,
    bool_or(
      event_type = 'interaction'
      AND event_data->>'interactionId' = 'cv_download'
    ) AS heeft_cv_download,
    bool_or(
      event_type = 'interaction'
      AND event_data->>'interactionId' = 'jarvis_question_asked'
    ) AS heeft_jarvis_vraag
  FROM sessie_events
  GROUP BY session_id
),
sectie_dwell AS (
  SELECT
    session_id,
    event_data->>'sectionId' AS section_id,
    SUM((event_data->>'activeSeconds')::numeric) FILTER (
      WHERE event_type = 'dwell_time'
        AND event_data->>'dwellVersion' = '2'
    ) AS actieve_seconden
  FROM sessie_events
  GROUP BY session_id, event_data->>'sectionId'
),
dominante_dwell AS (
  SELECT
    session_id,
    MAX(actieve_seconden) AS actieve_seconden_dominant
  FROM sectie_dwell
  GROUP BY session_id
),
sessie_kandidaten AS (
  SELECT DISTINCT ON (s.session_id)
    'browser_event'::text AS bron,
    'session'::text AS ref_type,
    s.session_id::text AS ref_id,
    'portfolio_bezoek'::text AS alert_type,
    reden.reden,
    reden.prioriteit,
    GREATEST(s.last_seen_at, m.laatste_event) AS tijdstip,
    s.country AS land,
    s.region AS regio,
    s.referrer AS verwijzer,
    s.via,
    s.campaign AS campagne,
    s.automation_type AS classificatie,
    s.confidence,
    s.provider,
    a.actieve_seconden_dominant,
    m.actieve_seconden_totaal,
    m.ruwe_seconden,
    m.secties,
    m.paden
  FROM sessies s
  INNER JOIN sessie_metrics m USING (session_id)
  INNER JOIN dominante_dwell a USING (session_id)
  CROSS JOIN drempels d
  CROSS JOIN LATERAL (
    VALUES
      ('sollicitatielink'::text, 1, 1,
        s.referrer ILIKE '%tellent%'
        OR s.via IS NOT NULL OR s.source IS NOT NULL),
      ('jarvis_vraag'::text, 1, 2, m.heeft_jarvis_vraag),
      ('cv_download'::text, 2, 3, m.heeft_cv_download),
      ('diepe_sectie'::text, 2, 4,
        EXISTS (
          SELECT 1
          FROM unnest(m.paden) AS p(pad)
          WHERE p.pad ~ '^(/en)?/(nidus|lowi|cases/)'
        ) AND m.actieve_seconden_totaal >= d.minimum_dwell),
      ('lang_gelezen'::text, 2, 5,
        (
          a.actieve_seconden_dominant >= d.dominante_dwell_drempel
          OR m.actieve_seconden_totaal >= d.totale_dwell_drempel
        ) AND m.actieve_seconden_totaal >= d.minimum_dwell)
  ) AS reden(reden, prioriteit, volgorde, kwalificeert)
  WHERE reden.kwalificeert IS TRUE
    AND GREATEST(s.last_seen_at, m.laatste_event) >= now() - d.venster
  ORDER BY s.session_id, reden.prioriteit, reden.volgorde
),
request_kandidaten AS (
  SELECT
    'http_request'::text AS bron,
    'request'::text AS ref_type,
    r.id::text AS ref_id,
    'portfolio_agent'::text AS alert_type,
    reden.reden,
    reden.prioriteit,
    r.created_at AS tijdstip,
    r.country AS land,
    r.region AS regio,
    r.referrer AS verwijzer,
    NULL::text AS via,
    NULL::text AS campagne,
    r.automation_type AS classificatie,
    r.confidence,
    r.provider,
    NULL::numeric AS actieve_seconden_dominant,
    NULL::numeric AS actieve_seconden_totaal,
    NULL::numeric AS ruwe_seconden,
    NULL::text[] AS secties,
    ARRAY[r.path]::text[] AS paden
  FROM public.portfolio_requests r
  CROSS JOIN drempels d
  CROSS JOIN LATERAL (
    VALUES
      ('ai_user_fetch'::text, 2, d.ai_fetch_cooldown,
        r.automation_type = 'ai_user_fetch'),
      ('link_gedeeld'::text, 3, d.preview_cooldown,
        r.automation_type = 'social_preview'),
      ('cv_pdf_opgehaald'::text, 2, d.cv_pdf_cooldown,
        r.path = '/cv.pdf' AND r.automation_type = 'human_candidate')
  ) AS reden(reden, prioriteit, cooldown, kwalificeert)
  WHERE reden.kwalificeert IS TRUE
    AND r.created_at >= now() - d.venster
    AND r.is_internal IS NOT TRUE
    AND r.path NOT IN ('/robots.txt', '/sitemap.xml', '/llms.txt')
    AND r.path !~* (
      '^/(_next|images?|fonts?|css|js)(/|$)'
      || '|(^|/)favicon[^/]*$'
      || '|\.(avif|bmp|gif|ico|jpe?g|png|svg|webp|woff2?|ttf|otf|eot|css|[cm]?js|map)$'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.portfolio_alerts a
      WHERE a.alert_type = 'portfolio_agent'
        AND a.reden = reden.reden
        AND a.provider IS NOT DISTINCT FROM r.provider
        AND a.claimed_at >= now() - reden.cooldown
    )
),
kandidaten AS (
  SELECT * FROM sessie_kandidaten
  UNION ALL
  SELECT * FROM request_kandidaten
)
SELECT k.*
FROM kandidaten k
WHERE NOT EXISTS (
  SELECT 1
  FROM public.portfolio_alerts a
  WHERE a.ref_type = k.ref_type
    AND a.ref_id = k.ref_id
    AND a.alert_type = k.alert_type
);

REVOKE ALL ON public.v_portfolio_alert_kandidaten
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_portfolio_alert_kandidaten
  TO authenticated, service_role;

COMMENT ON VIEW public.v_portfolio_alert_kandidaten IS
  'Portfolio alert candidates using lifetime event metrics for recently active sessions and recent HTTP requests. Active totals remain NULL without v2 measurements. Dominant dwell groups by session and sectionId; summed section dwell can overlap in elapsed time. Ties follow the listed reason order. Any existing claim status excludes the reference and counts toward request cooldowns. Confidence is copied unchanged. The view does not atomically serialize provider cooldowns across different request references.';

COMMIT;
