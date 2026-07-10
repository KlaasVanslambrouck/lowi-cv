import type { NidusCaseStudyContent } from "@/types/nidusCaseStudy";

// Content voor de Nidus case-study pagina (/nidus).
export const nidusCaseStudy: NidusCaseStudyContent = {
  intro: {
    title: {
      nl: "Nidus — case study",
      en: "Nidus — case study",
    },
    subtitle: {
      nl: "Het zenuwcentrum van het LOWI-platform",
      en: "The nerve centre of the LOWI platform",
    },
    pitch: {
      nl: "Deze pagina wordt een diepere blik op Nidus: architectuur, beslissingen en code. Inhoud volgt binnenkort.",
      en: "This page will become a deeper look at Nidus: architecture, decisions and code. Content is coming soon.",
    },
  },

  architecture: [
    {
      id: "nidus-web",
      layer: "client",
      name: "nidus",
      tech: "Next.js",
      hosting: "Vercel",
      role: {
        nl: "Webdashboard: overzicht en bediening van het hele platform in de browser.",
        en: "Web dashboard: overview and control of the whole platform in the browser.",
      },
    },
    {
      id: "nidus-mobile",
      layer: "client",
      name: "nidus-mobile",
      tech: "Expo / React Native",
      hosting: "iOS",
      role: {
        nl: "Mobiele app voor onderweg, praat uitsluitend met nidus-api.",
        en: "Mobile app for on the go, talks exclusively to nidus-api.",
      },
    },
    {
      id: "nidus-api",
      layer: "api",
      name: "nidus-api",
      tech: "Fastify 5 / TypeScript",
      hosting: "Railway · Frankfurt",
      role: {
        nl: "Centrale businesslogica; het enige component met schrijftoegang tot Supabase.",
        en: "Central business logic; the only component with write access to Supabase.",
      },
    },
    {
      id: "supabase",
      layer: "data",
      name: "Supabase",
      tech: "PostgreSQL",
      hosting: "Frankfurt",
      role: {
        nl: "Centrale opslag met row-level security en auth.",
        en: "Central storage with row-level security and auth.",
      },
    },
    {
      id: "nidus-ml",
      layer: "data",
      name: "nidus-ml",
      tech: "FastAPI / Python",
      hosting: "Railway",
      role: {
        nl: "ML-inferentie als aparte service naast de opslag.",
        en: "ML inference as a separate service alongside storage.",
      },
    },
    {
      id: "databricks",
      layer: "data",
      name: "Databricks",
      tech: "Community Edition",
      hosting: "Cloud",
      role: {
        nl: "Batch ML-training en datapipelines.",
        en: "Batch ML training and data pipelines.",
      },
    },
    {
      id: "nidus-pi",
      layer: "edge",
      name: "nidus-pi",
      tech: "Raspberry Pi",
      hosting: "Thuisnetwerk",
      role: {
        nl: "PM2 cron jobs voor energie, locatie en sync.",
        en: "PM2 cron jobs for energy, location and sync.",
      },
    },
    {
      id: "claude-haiku",
      layer: "ai",
      name: "Claude Haiku",
      tech: "LLM",
      hosting: "Anthropic API",
      role: {
        nl: "Redenering en generatie voor Jarvis.",
        en: "Reasoning and generation for Jarvis.",
      },
    },
  ],

  principles: [
    {
      nl: "nidus-mobile roept nooit rechtstreeks Supabase aan — alles loopt via nidus-api.",
      en: "nidus-mobile never calls Supabase directly — everything goes through nidus-api.",
    },
    {
      nl: "Elke tabel heeft created_at/updated_at en RLS staat altijd aan.",
      en: "Every table has created_at/updated_at and RLS is always on.",
    },
    {
      nl: "Compute is wegwerpbaar (Railway, Pi), persistentie zit uitsluitend in Supabase.",
      en: "Compute is disposable (Railway, Pi); persistence lives exclusively in Supabase.",
    },
  ],

  decisionLog: [
    {
      date: "2026-06-30",
      title: {
        nl: "Wanneer stoppen met zoeken: VLamax zonder bloedlactaat",
        en: "Knowing when to stop: VLamax without blood lactate",
      },
      description: {
        nl: "Voor VLamax bestaat geen gepubliceerde formule op basis van enkel vermogen of snelheid — bevestigd door twee onafhankelijke literatuuronderzoeken. In plaats van te blijven zoeken naar een preciezere aanpak, koos ik voor een pragmatische proxy (piekvermogen over 3 seconden × een constante, foutmarge ~21%) en markeerde die expliciet als 'indicatief' in de interface. Soms is de juiste technische beslissing niet het probleem oplossen, maar toegeven dat het met de beschikbare data niet preciezer kan — en dat eerlijk communiceren naar de gebruiker.",
        en: "No published formula exists for VLamax based on power or speed alone — confirmed by two independent literature reviews. Rather than continuing to chase a more precise approach, I used a pragmatic proxy (peak 3-second power × a constant, ~21% error margin) and explicitly labelled it 'indicative' in the interface. Sometimes the right technical decision isn't solving the problem, but admitting the available data won't support more precision — and communicating that honestly to the user.",
      },
    },
    {
      date: "2026-06-30",
      title: {
        nl: "Een peer-reviewed formule verslaat eigen terugrekening",
        en: "A peer-reviewed formula beats reverse-engineering from data",
      },
      description: {
        nl: "De eerste versie van het VO2max-model rekende een constante terug uit vijf testresultaten, met een foutmarge van meer dan 20%. Door over te stappen op een gepubliceerde, snelheidsgebaseerde formule (Ji et al., 2021) en enkel de individuele constante te kalibreren, daalde die foutmarge naar 4,71%. Les: een gevalideerde formulevorm met één gekalibreerde parameter is betrouwbaarder dan een volledig zelf teruggerekend model.",
        en: "The first version of the VO2max model reverse-engineered a constant from five test results, with an error margin over 20%. Switching to a published, speed-based formula (Ji et al., 2021) and calibrating only the individual constant brought that down to 4.71%. Lesson: a validated formula shape with one calibrated parameter beats a fully self-derived model.",
      },
    },
    {
      date: "2026-07-08",
      title: {
        nl: "Custom SVG in plaats van een chart-library forceren",
        en: "Custom SVG instead of forcing a chart library",
      },
      description: {
        nl: "Trainingsblokken moesten sleepbaar zijn op seconde-niveau, met vermogen- en hartslagcurves eronder. De bestaande grafiekbibliotheek (Recharts) wordt elders in de app gebruikt, maar is niet gebouwd voor precieze pointer-interactie. In plaats van die bibliotheek te forceren, koos ik voor een gerichte custom SVG-component met eigen pointer-events — minder herbruikbaar, maar robuust voor exact dit probleem.",
        en: "Training blocks needed to be draggable at second-level precision, with power and heart-rate curves underneath. The existing chart library (Recharts) is used elsewhere in the app but isn't built for precise pointer interaction. Rather than forcing that library, I built a focused custom SVG component with its own pointer events — less reusable, but robust for exactly this problem.",
      },
    },
    {
      date: "2026-07-08",
      title: {
        nl: "Power curve als JSONB, niet als aparte tabel",
        en: "Power curve as JSONB, not a separate table",
      },
      description: {
        nl: "Wanneer iemand een trainingsblokgrens verschuift, moeten vermogen- en hartslaggemiddeldes lokaal herberekend worden zonder het ML-model opnieuw aan te roepen — dat vereist dat de volledige curve beschikbaar blijft. In plaats van een aparte tabel met duizenden rijen per sessie, koos ik voor een JSONB-kolom op de sessietabel zelf: de data hoort logisch bij die ene sessie en wordt nooit los bevraagd.",
        en: "When someone drags a training-block boundary, power and heart-rate averages need local recalculation without re-calling the ML model — which means the full curve has to stay available. Instead of a separate table with thousands of rows per session, I stored it as a JSONB column on the session table itself: the data logically belongs to that one session and is never queried on its own.",
      },
    },
    {
      date: "2026-07-08",
      title: {
        nl: "Gespreksgeheugen in de browser, niet de database",
        en: "Conversation memory in the browser, not the database",
      },
      description: {
        nl: "Voor de AI-assistent op deze portfolio moest ik kiezen: gespreksgeschiedenis serverside opslaan zoals de assistent in Nidus zelf doet, of clientside bijhouden en meesturen bij elke vraag. Voor een kort, anoniem portfoliobezoek weegt het voordeel van serverside opslag niet op tegen de kost: een nieuwe databasetabel, een retentiebeleid, en extra privacy-oppervlak voor onbekende bezoekers. Dezelfde technologie, een bewust andere architectuurkeuze voor een andere context.",
        en: "For this portfolio's AI assistant I had to choose: store conversation history server-side like the assistant in Nidus itself does, or keep it client-side and resend it with every question. For a short, anonymous portfolio visit, the benefit of server-side storage doesn't outweigh the cost: a new database table, a retention policy, and extra privacy surface for unknown visitors. Same technology, a deliberately different architecture for a different context.",
      },
    },
  ],

  sidebarItems: [
    {
      id: "dashboard",
      icon: "🏠",
      label: { nl: "Vandaag", en: "Today" },
      enabled: true,
    },
    {
      id: "health",
      icon: "❤️",
      label: { nl: "Health", en: "Health" },
      enabled: false,
    },
    {
      id: "budget",
      icon: "📊",
      label: { nl: "Budget", en: "Budget" },
      enabled: false,
    },
    {
      id: "inzichten",
      icon: "✨",
      label: { nl: "Inzichten", en: "Insights" },
      enabled: false,
    },
    {
      id: "boodschappen",
      icon: "🛒",
      label: { nl: "Boodschappen", en: "Groceries" },
      enabled: false,
    },
    {
      id: "energie",
      icon: "⚡",
      label: { nl: "Energie", en: "Energy" },
      enabled: true,
    },
    {
      id: "thuis",
      icon: "🏡",
      label: { nl: "Thuis", en: "Home" },
      enabled: false,
    },
    {
      id: "kastickets",
      icon: "🧾",
      label: { nl: "Kastickets", en: "Receipts" },
      enabled: false,
    },
    {
      id: "data",
      icon: "💾",
      label: { nl: "Data", en: "Data" },
      enabled: false,
    },
    {
      id: "instellingen",
      icon: "⚙️",
      label: { nl: "Instellingen", en: "Settings" },
      enabled: false,
    },
  ],

  dashboardDetail: {
    greetingName: "Robin",
    greetingDate: {
      nl: "Vrijdag 10 juli",
      en: "Friday, July 10",
    },
    aiInsightLabel: {
      nl: "MIDDAG INZICHT",
      en: "AFTERNOON INSIGHT",
    },
    aiInsight: {
      nl: "Je week verliep rustig — geen opvallende pieken in energie of budget. Het weekend belooft mooi weer, ideaal om de tuinreminders af te werken.",
      en: "Your week was calm — no notable spikes in energy or budget. The weekend looks sunny, a good moment to tackle the garden reminders.",
    },
    weekrapportLabel: {
      nl: "WEEKRAPPORT",
      en: "WEEKLY REPORT",
    },
    weekrapport: [
      {
        category: "Boodschappen",
        amount: "€142",
        changeLabel: {
          nl: "+18% t.o.v. gemiddelde €120",
          en: "+18% vs. average €120",
        },
        detail: { nl: "Colruyt", en: "Colruyt" },
      },
      {
        category: "Energie",
        amount: "€38",
        changeLabel: {
          nl: "+9% t.o.v. gemiddelde €35",
          en: "+9% vs. average €35",
        },
        detail: {
          nl: "Piek op woensdag",
          en: "Peak on Wednesday",
        },
      },
    ],
    weather: {
      temp: "19°C",
      condition: { nl: "Half bewolkt", en: "Partly cloudy" },
      range: "14°–21°",
      tomorrow: {
        nl: "Morgen: 20°C, zon",
        en: "Tomorrow: 20°C, sunny",
      },
    },
    agendaLabel: { nl: "Vandaag", en: "Today" },
    agenda: [
      {
        time: "09:30",
        title: { nl: "Teamoverleg", en: "Team sync" },
      },
      {
        time: "16:00",
        title: {
          nl: "Boodschappen ophalen",
          en: "Pick up groceries",
        },
      },
    ],
    health: {
      score: 78,
      scoreLabel: { nl: "Goed herstel", en: "Good recovery" },
      metrics: [
        {
          label: { nl: "HRV", en: "HRV" },
          value: "54 ms",
          percent: 60,
        },
        {
          label: { nl: "Rusthartslag", en: "Resting HR" },
          value: "52 bpm",
          percent: 55,
        },
        {
          label: { nl: "Slaapuren", en: "Sleep hours" },
          value: "7,2 u",
          percent: 72,
        },
      ],
    },
    energyLive: {
      watts: "0,38 kW",
      badge: { nl: "live", en: "live" },
    },
  },

  energyDetail: {
    hero: {
      label: {
        nl: "INJECTIE NAAR NET",
        en: "FEEDING INTO GRID",
      },
      value: "1,28",
      unit: "kW",
      badge: {
        nl: "Injectie actief",
        en: "Feed-in active",
      },
    },
    tip: {
      nl: "Je injecteert 1.280 W — goed moment voor de wasmachine of vaatwasser!",
      en: "You're feeding 1,280 W into the grid — a good moment for the washing machine or dishwasher!",
    },
    stats: [
      {
        label: { nl: "VERBRUIK (30D)", en: "USAGE (30D)" },
        value: "104,8",
        unit: "kWh",
      },
      {
        label: { nl: "INJECTIE (30D)", en: "FEED-IN (30D)" },
        value: "391,2",
        unit: "kWh",
      },
      {
        label: { nl: "GAS (30D)", en: "GAS (30D)" },
        value: "9,6",
        unit: "m³",
      },
      {
        label: { nl: "MAANDPIEK", en: "MONTHLY PEAK" },
        value: "2,41",
        unit: "kW",
      },
    ],
    powerChart: {
      title: { nl: "Vermogen", en: "Power" },
      subtitle: {
        nl: "Laatste 24u · elke 5 minuten",
        en: "Last 24h · every 5 minutes",
      },
    },
    gasChart: {
      title: { nl: "Gasverbruik", en: "Gas usage" },
      subtitle: {
        nl: "Laatste 24u · verbruik per meting (m³)",
        en: "Last 24h · usage per reading (m³)",
      },
    },
    deviceCard: {
      title: { nl: "Toestel registreren", en: "Register device" },
      subtitle: {
        nl: "Label actieve periodes voor data-analyse",
        en: "Label active periods for data analysis",
      },
      buttonLabel: { nl: "Start", en: "Start" },
      selectValue: { nl: "Andere", en: "Other" },
    },
    peakCard: {
      title: { nl: "Maandpiek", en: "Monthly peak" },
      period: { nl: "juli 2026", en: "July 2026" },
      peakLabel: { nl: "PIEK", en: "PEAK" },
      peakValue: "2,41 kW",
      thresholdLabel: { nl: "DREMPEL", en: "THRESHOLD" },
      thresholdValue: "3 kW",
      remaining: {
        nl: "0,59 kW ruimte tot drempel",
        en: "0.59 kW headroom to threshold",
      },
      statusOk: true,
    },
    meterCard: {
      title: { nl: "Gasteller", en: "Gas meter" },
      value: "1.872,4",
      unit: "m³",
      subtitle: {
        nl: "Cumulatieve meterstand",
        en: "Cumulative meter reading",
      },
    },
  },

  mockups: [
    {
      id: "dashboard",
      navLabel: { nl: "Dashboard", en: "Dashboard" },
      title: { nl: "Hoofddashboard", en: "Main dashboard" },
      widgets: [
        {
          label: { nl: "Energie vandaag", en: "Energy today" },
          value: "8,4 kWh",
          meta: {
            nl: "↓ 12% t.o.v. gisteren",
            en: "↓ 12% vs. yesterday",
          },
        },
        {
          label: { nl: "Budget deze maand", en: "Budget this month" },
          value: "€1.240 / €1.500",
          meta: { nl: "83% verbruikt", en: "83% used" },
        },
        {
          label: { nl: "Weer", en: "Weather" },
          value: "18°C",
          meta: {
            nl: "Bewolkt, kans op regen",
            en: "Cloudy, chance of rain",
          },
        },
        {
          label: { nl: "Volgende taak", en: "Next task" },
          value: "Was ophalen",
          meta: { nl: "Vandaag 17:00", en: "Today 17:00" },
        },
      ],
    },
    {
      id: "energie",
      navLabel: { nl: "Energie", en: "Energy" },
      title: { nl: "Energie-dashboard", en: "Energy dashboard" },
      widgets: [
        {
          label: { nl: "Huidig verbruik", en: "Current usage" },
          value: "0,42 kW",
          meta: {
            nl: "Live via HomeWizard P1",
            en: "Live via HomeWizard P1",
          },
        },
        {
          label: { nl: "Vandaag totaal", en: "Today's total" },
          value: "8,4 kWh",
          meta: { nl: "Piek om 18:20", en: "Peak at 18:20" },
        },
        {
          label: {
            nl: "Gedetecteerd toestel",
            en: "Detected device",
          },
          value: "Wasmachine",
          meta: {
            nl: "Via patroonherkenning",
            en: "Via pattern detection",
          },
        },
      ],
    },
  ],

  mockupNote: {
    nl: "Dit is een nagebouwde reconstructie van de echte interface met verzonnen data — geen live screenshot, om privacyredenen (het draait écht op gezinsdata).",
    en: "This is a rebuilt reconstruction of the real interface with fictional data — not a live screenshot, for privacy reasons (it runs on real household data).",
  },

  codeSnippets: [],

  sectionTitles: {
    architecture: { nl: "Architectuur", en: "Architecture" },
    decisionLog: { nl: "Decision Log", en: "Decision Log" },
    screenshots: { nl: "Screenshots", en: "Screenshots" },
    code: { nl: "Code", en: "Code" },
  },

  placeholderNote: {
    nl: "Binnenkort beschikbaar.",
    en: "Coming soon.",
  },
};
