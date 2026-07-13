import type { PortfolioContent } from "@/types/content";

// Placeholder-content voor de hele pagina. Wordt in een latere stap vervangen
// door een fetch uit de Supabase-tabel `portfolio_content` (Nidus-project).
// De vorm van dit object matcht daarom 1-op-1 met die tabel.

export const placeholderContent: PortfolioContent = {
  hero: {
    name: "Klaas Vanslambrouck",
    currentRole: { nl: "Functioneel Analist", en: "Functional Analyst" },
    targetRole: {
      nl: "Bouwer van AI-gedreven systemen",
      en: "Builder of AI-enabled systems",
    },
    thesis: {
      nl: "Ik vertaal complexe business- en systeemcontext naar werkende, AI-gedreven oplossingen — van scherpe analyse tot prototypes en productarchitectuur.",
      en: "I translate complex business and systems context into working, AI-enabled solutions — from sharp analysis to prototypes and product architecture.",
    },
    identityLine: {
      nl: "Mijn kracht zit op de brug tussen business, techniek en AI. Nidus is daar het bewijs van: een echt, zelfgebouwd platform dat data, automatisering en intelligentie samenbrengt — geen demo, maar een werkend systeem.",
      en: "My strength sits at the intersection of business, technology and AI. Nidus is the proof: a real, self-built platform that brings together data, automation and intelligence — not a demo, but a working system.",
    },
    focusAreas: ["Systems Thinking", "Business Analysis", "AI-Enabled Products"],
    liveLabel: { nl: "beschikbaar", en: "available" },
  },

  aboutMe: {
    heading: { nl: "Wie ik ben", en: "Who I am" },
    body: {
      nl: "Ik ben Klaas, functioneel analist met een sterke drang om systemen te begrijpen én te bouwen. Mijn kracht zit op de brug tussen business, technologie en AI: ik zie snel hoe processen werken, waar frictie zit en hoe je die kunt vertalen naar praktische, werkende oplossingen. LOWI is mijn persoonlijke laboratorium: de plek waar ik leer, experimenteer en bewijs dat ideeën pas echt waarde krijgen wanneer ze draaien.",
      en: "I'm Klaas, a functional analyst with a strong drive to understand and build systems. My strength sits at the intersection of business, technology and AI: I quickly see how processes work, where the friction lies, and how to translate that into practical, working solutions. LOWI is my personal laboratory: the place where I learn, experiment, and prove that ideas only gain real value once they actually run.",
    },
  },

  experience: [
    {
      role: {
        nl: "Sound Engineer & Hoofd Geluidsafdeling",
        en: "Sound Engineer & Head of Audio",
      },
      company: "Soundfield NV (freelance & vast)",
      period: "2010 — 2021",
      motif: "soundwave",
      description: {
        nl: "Ontwierp geluidsinstallaties en verzorgde live-mixing bij internationale evenementen voor Adecco, Samsonite, AWS en meer.",
        en: "Designed sound systems and ran live mixing at international events for Adecco, Samsonite, AWS and more.",
      },
    },
    {
      role: { nl: "Team Lead Productie", en: "Production Team Lead" },
      company: "Student Kick-Off, Gent (vrijwilliger / volunteer)",
      period: "2012 — 2020",
      // TODO: exacte jaren nog te bevestigen door gebruiker.
      motif: "stage-lights",
      description: {
        nl: "Programmeerde de Mainstage en onderhandelde artiestencontracten voor een studentenevenement met 30.000+ bezoekers.",
        en: "Booked the Mainstage and negotiated artist contracts for a student festival drawing 30,000+ visitors.",
      },
    },
    {
      role: { nl: "Founder", en: "Founder" },
      company: "Event Explorers",
      period: "2016 — 2017",
      motif: "blueprint",
      description: {
        nl: "Eigen onderneming: begeleidde events en projecten van concept en engineering tot volledige realisatie.",
        en: "Own company: guided events and projects from concept and engineering through to full realisation.",
      },
    },
    {
      role: { nl: "Functioneel Analist", en: "Functional Analyst" },
      company: "EGOV VZW — project bij FOD Financiën",
      period: "2021 — 2022",
      motif: "flowchart",
      description: {
        nl: "Vertaalde business-behoeften naar functionele specificaties voor case management en workflow-automatisering.",
        en: "Translated business needs into functional specs for case management and workflow automation.",
      },
    },
    {
      role: { nl: "Functioneel Consultant", en: "Functional Consultant" },
      company: "Itineris NV",
      period: "2022 — heden / present",
      motif: "flowchart",
      description: {
        nl: "Projectconsultancy en domeinverantwoordelijke voor service delivery bij een grootschalig upgrade-project voor De Watergroep.",
        en: "Project consultancy and domain lead for service delivery on a large-scale upgrade project for De Watergroep.",
      },
    },
  ],

  education: [
    {
      degree: {
        nl: "Industrieel Ingenieur Elektromechanica (niet afgerond)",
        en: "Industrial Engineering – Electromechanics (not completed)",
      },
      institution: "Universiteit Gent",
      period: "2010 — 2015",
      motif: "blueprint",
    },
    {
      degree: {
        nl: "Functioneel Analist — Omscholingstraject",
        en: "Functional Analyst — Career Switch Programme",
      },
      institution: "Switchfully (onderdeel van Cegeka)",
      period: "2021",
    },
  ],

  languageSkills: [
    {
      language: { nl: "Nederlands", en: "Dutch" },
      level: { nl: "Moedertaal", en: "Native" },
    },
    {
      language: { nl: "Engels", en: "English" },
      level: { nl: "Zeer goed", en: "Very good" },
    },
    {
      language: { nl: "Frans", en: "French" },
      level: { nl: "Goed", en: "Good" },
    },
    {
      language: { nl: "Russisch", en: "Russian" },
      level: { nl: "Basis", en: "Basic" },
    },
  ],

  skills: [
    { name: "Claude Code" },
    { name: "Supabase" },
    { name: "Databricks" },
    { name: "React Native" },
    { name: "Three.js" },
    { name: "Next.js" },
  ],

  // Skill-graaf voor de SkillConstellation: FA/Product (business-cluster, links)
  // verbindt via de AI-kern met LLMs/Automation; Data/APIs vormen de brug naar
  // Systems Thinking (engineering-cluster, rechts) — visueel het
  // "brug tussen business en engineering"-verhaal.
  skillNodes: [
    {
      id: "ai",
      name: "AI",
      connections: ["llms", "automation", "data", "functional-analysis", "product"],
      relatedProjectIds: ["jarvis"],
    },
    {
      id: "llms",
      name: "LLMs",
      connections: ["ai", "automation"],
      relatedProjectIds: ["jarvis"],
    },
    {
      id: "automation",
      name: "Automation",
      connections: ["ai", "llms", "apis"],
      relatedProjectIds: ["pi-network"],
    },
    {
      id: "data",
      name: "Data",
      connections: ["ai", "apis", "systems-thinking"],
      relatedProjectIds: ["pi-network"],
    },
    {
      id: "apis",
      name: "APIs",
      connections: ["data", "automation", "systems-thinking"],
      relatedProjectIds: ["jarvis", "mobile-app"],
    },
    {
      id: "systems-thinking",
      name: "Systems Thinking",
      connections: ["data", "apis", "functional-analysis"],
      relatedProjectIds: ["pi-network", "mobile-app"],
    },
    {
      id: "functional-analysis",
      name: "Functional Analysis",
      connections: ["ai", "product", "systems-thinking"],
      relatedProjectIds: ["mobile-app"],
    },
    {
      id: "product",
      name: "Product",
      connections: ["functional-analysis", "ai"],
      relatedProjectIds: ["mobile-app", "jarvis"],
    },
  ],

  lowi: {
    intro: {
      nl: "LOWI — Lab of Wonder and Imagination — is mijn eigen leer- en bouwomgeving rond AI, biologie, automatisering en creatieve technologie. Het begon als nieuwsgierigheid, maar groeit uit tot een persoonlijk platform waarin ik onderzoek, prototypes en echte systemen samenbreng. LOWI toont hoe ik denk: niet alleen conceptueel, maar altijd richting iets dat bruikbaar, begrijpelijk en technisch degelijk is.",
      en: "LOWI — Lab of Wonder and Imagination — is my own learning and building environment around AI, biology, automation and creative technology. It started as curiosity, but is growing into a personal platform where I bring together research, prototypes and real systems. LOWI shows how I think: not just conceptually, but always aimed at something usable, understandable and technically sound.",
    },
    projects: [
      {
        name: "Nidus",
        tagline: {
          nl: "Het zenuwcentrum van het LOWI-platform",
          en: "The nerve centre of the LOWI platform",
        },
        description: {
          nl: "Nidus is het eerste echte systeem binnen LOWI: een persoonlijk operating system voor mijn gezin, huis en dagelijkse routines. Ik bouw er koppelingen in met energieverbruik, locatie, automatisering, dashboards, Raspberry Pi-workers, Supabase, mobiele interfaces en uiteindelijk Jarvis als intelligente laag erbovenop. Het doel is geen demo, maar een levend systeem dat context begrijpt, helpt beslissen en stap voor stap slimmer wordt.",
          en: "Nidus is the first real system within LOWI: a personal operating system for my family, home and daily routines. I'm building in connections to energy usage, location, automation, dashboards, Raspberry Pi workers, Supabase, mobile interfaces, and eventually Jarvis as an intelligent layer on top. The goal isn't a demo, but a living system that understands context, helps make decisions, and gets a little smarter step by step.",
        },
        status: { nl: "In productie · persoonlijk gebruik", en: "In production · personal use" },
        caseStudyPath: "/nidus",
      },
      {
        name: "CRISPR & CHICKN",
        tagline: {
          nl: "Experimenteel datalab voor speelse analyses",
          en: "Experimental data lab for playful analyses",
        },
        description: {
          nl: "Speeltuin voor datavisualisatie en ML-experimenten, gebouwd op Databricks-notebooks en een lichte Next.js-frontend.",
          en: "Playground for data visualisation and ML experiments, built on Databricks notebooks and a light Next.js frontend.",
        },
        status: { nl: "In ontwikkeling", en: "In development" },
      },
    ],
  },

  projects: [
    {
      id: "jarvis",
      title: {
        nl: "Jarvis — persoonlijke AI-assistent",
        en: "Jarvis — personal AI assistant",
      },
      description: {
        nl: "Chat-assistent bovenop de nidus-api die vragen over mijn CV en projecten beantwoordt, met tool-gebruik en geheugen.",
        en: "Chat assistant on top of the nidus-api answering questions about my CV and projects, with tool use and memory.",
      },
      codeSnippet: `const reply = await jarvis.chat({
  message: "Wat draait er op Railway?",
  tools: [lookupService, queryStats],
});
render(reply.text);`,
      tech: ["Claude API", "Railway", "TypeScript"],
      // Architectuurlagen voor de X-ray modus (placeholder)
      xrayBreakdown: [
        { layer: "UI", items: ["Next.js", "JarvisTerminal"] },
        { layer: "API", items: ["nidus-api", "Claude API"] },
        { layer: "DATA", items: ["Supabase", "pgvector"] },
      ],
    },
    {
      id: "pi-network",
      title: {
        nl: "Pi-sensornetwerk",
        en: "Pi sensor network",
      },
      description: {
        nl: "Raspberry Pi's meten temperatuur en energie thuis en pushen elke minuut metingen naar Supabase voor dashboards.",
        en: "Raspberry Pis measure temperature and energy at home, pushing readings to Supabase every minute for dashboards.",
      },
      codeSnippet: `async def push_reading(sensor: Sensor):
    value = await sensor.read()
    supabase.table("readings").insert(
        {"sensor_id": sensor.id, "value": value}
    ).execute()`,
      tech: ["Python", "Raspberry Pi", "Supabase"],
      xrayBreakdown: [
        { layer: "EDGE", items: ["Raspberry Pi", "Python daemon"] },
        { layer: "DATA", items: ["Supabase", "PostgreSQL"] },
        { layer: "OPS", items: ["PM2", "systemd"] },
      ],
    },
    {
      id: "mobile-app",
      title: {
        nl: "Mobile companion-app",
        en: "Mobile companion app",
      },
      description: {
        nl: "React Native-app die het LOWI-platform ontsluit onderweg: statussen, notificaties en een mini-Jarvis.",
        en: "React Native app exposing the LOWI platform on the go: statuses, notifications and a mini Jarvis.",
      },
      codeSnippet: `export function StatusCard({ service }: Props) {
  const { data } = useServiceStatus(service.id);
  return <Badge tone={data.ok ? "ok" : "warn"} />;
}`,
      tech: ["React Native", "Expo", "Railway"],
      xrayBreakdown: [
        { layer: "UI", items: ["React Native", "Expo"] },
        { layer: "API", items: ["nidus-api", "Railway"] },
        { layer: "AUTH", items: ["Supabase Auth"] },
      ],
    },
  ],

  liveStats: [
    { value: "12 481", label: { nl: "API-calls deze week", en: "API calls this week" } },
    { value: "7", label: { nl: "Services online", en: "Services online" } },
    { value: "3,2 GB", label: { nl: "Data verwerkt vandaag", en: "Data processed today" } },
    { value: "99,98%", label: { nl: "Uptime deze maand", en: "Uptime this month" } },
    { value: "42", label: { nl: "Jarvis-gesprekken", en: "Jarvis conversations" } },
  ],

  jarvisMessages: [
    {
      role: "user",
      text: {
        nl: "Hey Jarvis, wat is de status van het platform?",
        en: "Hey Jarvis, what's the status of the platform?",
      },
    },
    {
      role: "jarvis",
      text: {
        nl: "Alle systemen operationeel. Nidus draait stabiel op Railway, de Pi-sensoren rapporteren elke 60 seconden.",
        en: "All systems operational. Nidus is running steadily on Railway, the Pi sensors report every 60 seconds.",
      },
    },
    {
      role: "user",
      text: {
        nl: "En waar werkt Klaas nu aan?",
        en: "And what is Klaas working on right now?",
      },
    },
    {
      role: "jarvis",
      text: {
        nl: "Aan CRISPR & CHICKN — een experimenteel datalab. Vraag hem er gerust naar via de contactgegevens hieronder.",
        en: "On CRISPR & CHICKN — an experimental data lab. Feel free to ask him about it via the contact details below.",
      },
    },
  ],

  // Korte, logregel-achtige observaties voor JarvisPresence per sectie
  jarvisObservations: [
    {
      sectionId: "hero",
      text: {
        nl: "systemen online · bezoeker gedetecteerd",
        en: "systems online · visitor detected",
      },
      proactiveSuggestion: {
        nl: "Deze intro verraadt de richting: analyse wordt systeemontwerp.",
        en: "This intro hints at the direction: analysis becomes system design.",
      },
      suggestedQuestion: {
        nl: "Hoe vertaalt Klaas analysewerk naar AI-systemen?",
        en: "How does Klaas translate analysis work into AI systems?",
      },
    },
    {
      sectionId: "about",
      text: {
        nl: "leest identiteit: analyse · bouwdrang",
        en: "reading identity: analysis · builder drive",
      },
      proactiveSuggestion: {
        nl: "Hier wordt duidelijk waarom LOWI meer is dan een zijproject.",
        en: "This makes clear why LOWI is more than a side project.",
      },
      suggestedQuestion: {
        nl: "Wat zegt LOWI over hoe Klaas leert en bouwt?",
        en: "What does LOWI say about how Klaas learns and builds?",
      },
    },
    {
      sectionId: "experience",
      text: {
        nl: "scant loopbaantraject: analyse → engineering",
        en: "scanning career path: analysis → engineering",
      },
      proactiveSuggestion: {
        nl: "De loopbaanlijn toont waarom hij business en techniek kan verbinden.",
        en: "The career line shows why he can connect business and technology.",
      },
      suggestedQuestion: {
        nl: "Welke ervaring bereidt Klaas het best voor op het bouwen van AI-systemen?",
        en: "Which experience best prepares Klaas for building AI systems?",
      },
    },
    {
      sectionId: "education",
      text: {
        nl: "indexeert opleidingsdata",
        en: "indexing education records",
      },
      proactiveSuggestion: {
        nl: "De opleiding verklaart de technische basis onder zijn analysewerk.",
        en: "The education explains the technical base beneath his analysis work.",
      },
      suggestedQuestion: {
        nl: "Hoe helpt zijn technische achtergrond in functionele analyse?",
        en: "How does his technical background help in functional analysis?",
      },
    },
    {
      sectionId: "languages",
      text: {
        nl: "taalmodules geladen: nl · en · fr · ru",
        en: "language modules loaded: nl · en · fr · ru",
      },
      proactiveSuggestion: {
        nl: "Talen zijn hier meer dan CV-data: ze helpen stakeholdercontext lezen.",
        en: "Languages are more than CV data here: they help read stakeholder context.",
      },
      suggestedQuestion: {
        nl: "Waar maken zijn talenkennis en analyse elkaar sterker?",
        en: "Where do his languages and analysis strengthen each other?",
      },
    },
    {
      sectionId: "skills",
      text: {
        nl: "mapt skill-constellatie",
        en: "mapping skill constellation",
      },
      proactiveSuggestion: {
        nl: "De interessante laag zit in de verbindingen tussen skills.",
        en: "The interesting layer is in the connections between skills.",
      },
      suggestedQuestion: {
        nl: "Welke skill-combinatie maakt dit profiel onderscheidend?",
        en: "Which skill combination makes this profile distinctive?",
      },
    },
    {
      sectionId: "lowi",
      text: {
        nl: "kernplatform nidus · status live",
        en: "core platform nidus · status live",
      },
      proactiveSuggestion: {
        nl: "LOWI maakt de portfolio minder statisch en meer platformachtig.",
        en: "LOWI makes the portfolio less static and more platform-like.",
      },
      suggestedQuestion: {
        nl: "Waarom is LOWI belangrijk voor zijn AI-richting?",
        en: "Why is LOWI important for his AI direction?",
      },
    },
    {
      sectionId: "projects",
      text: {
        nl: "observeert projectcluster: nidus",
        en: "observing project cluster: nidus",
      },
      proactiveSuggestion: {
        nl: "De projecten tonen hoe hij abstracte ideeen naar systemen brengt.",
        en: "The projects show how he turns abstract ideas into systems.",
      },
      suggestedQuestion: {
        nl: "Welk project bewijst het best zijn systeemdenken?",
        en: "Which project best proves his systems thinking?",
      },
    },
    {
      sectionId: "live-stats",
      text: {
        nl: "telemetrie-stream actief",
        en: "telemetry stream active",
      },
      proactiveSuggestion: {
        nl: "Live cijfers zijn nog placeholder, maar de observability-denkwijze is echt.",
        en: "The live numbers are placeholders, but the observability mindset is real.",
      },
      suggestedQuestion: {
        nl: "Waarom past observability bij een AI-portfolio?",
        en: "Why does observability fit an AI portfolio?",
      },
    },
    {
      sectionId: "ai-playground",
      text: {
        nl: "retrieval-pipeline klaar",
        en: "retrieval pipeline ready",
      },
      proactiveSuggestion: {
        nl: "Deze laag toont hoe broncontext naar een onderbouwd antwoord gaat.",
        en: "This layer shows how source context becomes a grounded answer.",
      },
      suggestedQuestion: {
        nl: "Welke bronnen gebruikt deze portfolio om een antwoord te bouwen?",
        en: "Which sources does this portfolio use to build an answer?",
      },
    },
    {
      sectionId: "jarvis",
      text: {
        nl: "standby — terminal actief",
        en: "standby — terminal active",
      },
      proactiveSuggestion: {
        nl: "Jarvis is nu nog een preview van de toekomstige contextlaag.",
        en: "Jarvis is currently a preview of the future context layer.",
      },
      suggestedQuestion: {
        nl: "Wat zou Jarvis straks al over deze bezoeker weten?",
        en: "What would Jarvis eventually know about this visitor?",
      },
    },
    {
      sectionId: "contact",
      text: {
        nl: "kanalen beschikbaar: e-mail · linkedin",
        en: "channels available: email · linkedin",
      },
      proactiveSuggestion: {
        nl: "Na deze route is de beste vervolgstap meestal een concreet gesprek.",
        en: "After this route, the best next step is usually a concrete conversation.",
      },
      suggestedQuestion: {
        nl: "Welke vraag stel je best aan Klaas na deze portfolio?",
        en: "What is the best question to ask Klaas after this portfolio?",
      },
    },
  ],

  // TODO: later vervangen door echte RAG-context op basis van CV/projectdata.
  jarvisExplanations: [
    {
      id: "current-experience",
      title: {
        nl: "Functionele analyse met delivery-verantwoordelijkheid",
        en: "Functional analysis with delivery responsibility",
      },
      contextLabel: {
        nl: "Ervaring / huidige rol",
        en: "Experience / current role",
      },
      summary: {
        nl: "Deze ervaring toont dat Klaas niet enkel requirements verzamelt, maar domeinen structureert, risico's zichtbaar maakt en complexe upgrades vertaalbaar houdt voor business en engineering.",
        en: "This experience shows Klaas does more than gather requirements: he structures domains, exposes risks and keeps complex upgrades understandable for business and engineering.",
      },
      signals: [
        {
          nl: "domeinverantwoordelijkheid binnen service delivery",
          en: "domain ownership within service delivery",
        },
        {
          nl: "vertaling tussen businessproces en systeemgedrag",
          en: "translation between business process and system behaviour",
        },
        {
          nl: "upgrade-context met afhankelijkheden en impactanalyse",
          en: "upgrade context with dependencies and impact analysis",
        },
      ],
      relevance: {
        nl: "Dit is belangrijk voor het bouwen van AI-gedreven systemen: goede AI-systemen beginnen bij scherpe procesanalyse, betrouwbare context en heldere beslislogica.",
        en: "This matters for building AI-enabled systems: strong AI systems start with sharp process analysis, reliable context and clear decision logic.",
      },
    },
    {
      id: "nidus-project",
      title: {
        nl: "Nidus als zenuwcentrum van het platform",
        en: "Nidus as the platform nerve centre",
      },
      contextLabel: {
        nl: "LOWI / Nidus",
        en: "LOWI / Nidus",
      },
      summary: {
        nl: "Nidus positioneert de portfolio als een ecosysteem in plaats van losse demos. Het project bundelt data, services en API-laag zodat andere toepassingen context kunnen hergebruiken.",
        en: "Nidus positions the portfolio as an ecosystem rather than a set of demos. It combines data, services and an API layer so other applications can reuse context.",
      },
      signals: [
        {
          nl: "centrale backend met herbruikbare API-contracten",
          en: "central backend with reusable API contracts",
        },
        {
          nl: "platformdenken boven losse projectpresentatie",
          en: "platform thinking beyond isolated project presentation",
        },
        {
          nl: "basis voor geheugen, telemetry en RAG-context",
          en: "foundation for memory, telemetry and RAG context",
        },
      ],
      relevance: {
        nl: "Dit maakt toekomstige Jarvis-logica geloofwaardig: een assistent heeft pas waarde wanneer hij op een eigen, gestructureerde contextlaag kan bouwen.",
        en: "This makes future Jarvis logic credible: an assistant becomes valuable when it can build on its own structured context layer.",
      },
    },
    {
      id: "lowi-project",
      title: {
        nl: "LOWI als samenhangend portfoliosysteem",
        en: "LOWI as a connected portfolio system",
      },
      contextLabel: {
        nl: "Platform / projectarchitectuur",
        en: "Platform / project architecture",
      },
      summary: {
        nl: "LOWI toont een verschuiving van losse technische experimenten naar een samenhangende productomgeving: data, interfaces, agents en observability horen bij dezelfde ontwerpkeuzes.",
        en: "LOWI shows a shift from separate technical experiments to a connected product environment: data, interfaces, agents and observability belong to the same design choices.",
      },
      signals: [
        {
          nl: "meerdere projecten delen dezelfde platformtaal",
          en: "multiple projects share one platform language",
        },
        {
          nl: "frontend, data en automatisering worden samen ontworpen",
          en: "frontend, data and automation are designed together",
        },
        {
          nl: "portfolio functioneert als levend systeem",
          en: "the portfolio behaves like a living system",
        },
      ],
      relevance: {
        nl: "Een intelligente portfolio moet zichzelf kunnen verklaren. LOWI is de laag die die verklaring technisch en inhoudelijk laat samenkomen.",
        en: "An intelligent portfolio should be able to explain itself. LOWI is the layer where that explanation becomes both technical and substantive.",
      },
    },
    {
      id: "skills-system-thinking",
      title: {
        nl: "Skills als systeem in plaats van lijst",
        en: "Skills as a system, not a list",
      },
      contextLabel: {
        nl: "Skills / systeemdenken",
        en: "Skills / systems thinking",
      },
      summary: {
        nl: "De skillset is niet bedoeld als verzameling badges. Ze toont hoe analyse, APIs, data, automation en productdenken samen een route vormen naar AI-systemen die bruikbaar zijn.",
        en: "The skillset is not meant as a collection of badges. It shows how analysis, APIs, data, automation and product thinking combine into usable AI systems.",
      },
      signals: [
        {
          nl: "businessanalyse verbonden met technische uitvoering",
          en: "business analysis connected to technical delivery",
        },
        {
          nl: "data en APIs als brug naar agentgedrag",
          en: "data and APIs as a bridge to agent behaviour",
        },
        {
          nl: "productfocus houdt experimenten bruikbaar",
          en: "product focus keeps experiments usable",
        },
      ],
      relevance: {
        nl: "Dit profiel is waardevol waar AI niet als losse chatbot wordt gezien, maar als systeemlaag boven processen, data en beslissingen.",
        en: "This profile is valuable where AI is not treated as a separate chatbot, but as a system layer on top of processes, data and decisions.",
      },
    },
    {
      id: "live-system",
      title: {
        nl: "Live data als geloofwaardigheidssignaal",
        en: "Live data as a credibility signal",
      },
      contextLabel: {
        nl: "Live systeem / telemetry",
        en: "Live system / telemetry",
      },
      summary: {
        nl: "De live-sectie suggereert dat het portfolio niet alleen vertelt wat gebouwd werd, maar ook status, gebruik en betrouwbaarheid kan tonen. Vandaag is dit placeholder-data; de vorm is al production-minded.",
        en: "The live section suggests the portfolio can show not only what was built, but also status, usage and reliability. Today it is placeholder data; the shape is already production-minded.",
      },
      signals: [
        {
          nl: "operationele taal: uptime, services en API-calls",
          en: "operational language: uptime, services and API calls",
        },
        {
          nl: "observability als onderdeel van de ervaring",
          en: "observability as part of the experience",
        },
        {
          nl: "voorbereid op echte platformtelemetrie",
          en: "prepared for real platform telemetry",
        },
      ],
      relevance: {
        nl: "Dat maakt dit meer dan een demo: bezoekers krijgen het gevoel dat achter de interface een draaiend systeem kan zitten.",
        en: "That makes this more than a demo: visitors get the sense that a running system can exist behind the interface.",
      },
    },
    {
      id: "ai-transition",
      title: {
        nl: "Van analyse naar AI-engineering",
        en: "From analysis to AI engineering",
      },
      contextLabel: {
        nl: "Jarvis / AI-richting",
        en: "Jarvis / AI direction",
      },
      summary: {
        nl: "Jarvis maakt de overgang tastbaar: van processen begrijpen naar systemen bouwen die context kunnen ophalen, redeneren over intentie en acties voorbereiden.",
        en: "Jarvis makes the transition tangible: from understanding processes to building systems that can retrieve context, reason about intent and prepare actions.",
      },
      signals: [
        {
          nl: "LLM-interface bovenop eigen platformdata",
          en: "LLM interface on top of owned platform data",
        },
        {
          nl: "toolgebruik en geheugen als volgende logische stap",
          en: "tool use and memory as the next logical step",
        },
        {
          nl: "AI uitgelegd via concrete productflows",
          en: "AI explained through concrete product flows",
        },
      ],
      relevance: {
        nl: "De richting is duidelijk: geen AI als effect, maar AI als bruikbare laag in een systeem dat zakelijke context begrijpt.",
        en: "The direction is clear: not AI as an effect, but AI as a usable layer in a system that understands business context.",
      },
    },
  ],

  contact: {
    email: "klaas.d.g.vanslambrouck@gmail.com",
    linkedinUrl: "",
    location: { nl: "Oudenaarde, België", en: "Oudenaarde, Belgium" },
    cvPdfUrl: "/cv-klaas.pdf",
    cvPdfAvailable: true,
  },

  sectionTitles: {
    experience: { nl: "Ervaring", en: "Experience" },
    education: { nl: "Opleiding", en: "Education" },
    languages: { nl: "Talenkennis", en: "Languages" },
    skills: { nl: "Wat ik bouw", en: "What I build" },
    lowi: { nl: "LOWI — mijn platform", en: "LOWI — my platform" },
    projects: { nl: "Projecten", en: "Projects" },
    liveStats: { nl: "Live systeem", en: "Live system" },
    aiPlayground: {
      nl: "Van vraag naar onderbouwd antwoord",
      en: "From question to grounded answer",
    },
    jarvis: { nl: "Spreek met Jarvis", en: "Talk to Jarvis" },
    contact: { nl: "Contact", en: "Contact" },
  },

  uiLabels: {
    downloadCv: { nl: "Download CV (PDF)", en: "Download CV (PDF)" },
    jarvisNote: {
      nl: "Jarvis is nog offline — deze conversatie is een voorbeeld. Binnenkort live via de nidus-api.",
      en: "Jarvis is still offline — this conversation is a preview. Going live soon via the nidus-api.",
    },
    jarvisInputPlaceholder: {
      nl: "Binnenkort kan je hier echt met Jarvis praten…",
      en: "Soon you'll be able to really talk to Jarvis here…",
    },
    jarvisTerminalTitle: "jarvis@lowi:~",
    liveStatsNote: {
      nl: "Placeholder-cijfers — binnenkort rechtstreeks uit het live LOWI-platform.",
      en: "Placeholder numbers — soon streamed straight from the live LOWI platform.",
    },
    xrayNormalLabel: "NORMAL",
    xrayActiveLabel: "X-RAY",
    xrayToggleAria: {
      nl: "Schakel X-ray modus in of uit",
      en: "Toggle X-ray mode",
    },
    themeDarkLabel: "DARK",
    themeLightLabel: "LIGHT",
    themeToggleAria: {
      nl: "Schakel tussen donker en licht thema",
      en: "Toggle between dark and light theme",
    },
    xrayStatDetail: {
      nl: "deployment: fra1 · laatste build: —",
      en: "deployment: fra1 · last build: —",
    },
    explodeToggle: { nl: "lagen", en: "layers" },
    constellationHint: {
      nl: "Hover over een skill om gerelateerde projecten te zien.",
      en: "Hover a skill to see related projects.",
    },
    constellationProjectsLabel: { nl: "gebruikt in", en: "used in" },
    jarvisPresenceLabel: "jarvis",
    jarvisExplainButton: {
      nl: "Vraag Jarvis hierover",
      en: "Ask Jarvis about this",
    },
    jarvisExplainClose: {
      nl: "Sluit Jarvis-paneel",
      en: "Close Jarvis panel",
    },
    jarvisExplainStatus: {
      nl: "JARVIS / contextuele analyse",
      en: "JARVIS / contextual analysis",
    },
    jarvisExplainRelevanceLabel: {
      nl: "Waarom dit relevant is",
      en: "Why this matters",
    },
    jarvisProactiveAsk: {
      nl: "Vraag het Jarvis",
      en: "Ask Jarvis",
    },
    analyticsTransparencyNote: {
      nl: "Deze site verzamelt beperkte, privacyvriendelijke gebruiksstatistieken zonder advertentiecookies of cross-site tracking.",
      en: "This site collects limited, privacy-friendly usage statistics without advertising cookies or cross-site tracking.",
    },
    caseStudyLinkLabel: {
      nl: "Meer info over dit project",
      en: "More info about this project",
    },
  },
};
