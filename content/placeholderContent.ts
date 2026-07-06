import type { PortfolioContent } from "@/types/content";

// Placeholder-content voor de hele pagina. Wordt in een latere stap vervangen
// door een fetch uit de Supabase-tabel `portfolio_content` (Nidus-project).
// De vorm van dit object matcht daarom 1-op-1 met die tabel.

export const placeholderContent: PortfolioContent = {
  hero: {
    name: "Klaas Van Slambrouck",
    currentRole: { nl: "Functioneel Analist", en: "Functional Analyst" },
    targetRole: { nl: "AI Business Engineer", en: "AI Business Engineer" },
    thesis: {
      nl: "Ik vertaal businessprocessen naar werkende AI-systemen — van analyse tot draaiende productie.",
      en: "I translate business processes into working AI systems — from analysis to running production.",
    },
    liveLabel: { nl: "live", en: "live" },
  },

  experience: [
    {
      role: { nl: "Functioneel Analist", en: "Functional Analyst" },
      company: "Placeholder Corp",
      period: "2023 — heden",
      description: {
        nl: "Analyse en optimalisatie van bedrijfsprocessen, brug tussen business en IT, functionele specificaties voor dataplatformen.",
        en: "Analysis and optimisation of business processes, bridging business and IT, functional specifications for data platforms.",
      },
    },
    {
      role: { nl: "Business Analyst", en: "Business Analyst" },
      company: "Voorbeeld NV",
      period: "2021 — 2023",
      description: {
        nl: "Requirements-analyse en rapportering voor logistieke ketens, met focus op datakwaliteit en dashboards.",
        en: "Requirements analysis and reporting for logistics chains, focusing on data quality and dashboards.",
      },
    },
    {
      role: { nl: "Junior Consultant", en: "Junior Consultant" },
      company: "Demo Consulting",
      period: "2019 — 2021",
      description: {
        nl: "Procesdocumentatie en ondersteuning bij ERP-implementaties voor klanten in retail en productie.",
        en: "Process documentation and support for ERP implementations for clients in retail and manufacturing.",
      },
    },
  ],

  education: [
    {
      degree: {
        nl: "Master Handelswetenschappen",
        en: "Master of Business Administration",
      },
      institution: "KU Leuven",
      period: "2015 — 2019",
    },
    {
      degree: {
        nl: "Postgraduaat Data & AI",
        en: "Postgraduate Data & AI",
      },
      institution: "VUB",
      period: "2020 — 2021",
    },
  ],

  languageSkills: [
    {
      language: { nl: "Nederlands", en: "Dutch" },
      level: { nl: "Moedertaal", en: "Native" },
    },
    {
      language: { nl: "Engels", en: "English" },
      level: { nl: "Professioneel vaardig", en: "Full professional proficiency" },
    },
    {
      language: { nl: "Frans", en: "French" },
      level: { nl: "Goede werkkennis", en: "Good working knowledge" },
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
      nl: "LOWI is mijn persoonlijke platform: een verzameling zelfgebouwde systemen die samen één ecosysteem vormen — van data-pipelines tot een eigen AI-assistent.",
      en: "LOWI is my personal platform: a collection of self-built systems forming one ecosystem — from data pipelines to a personal AI assistant.",
    },
    projects: [
      {
        name: "Nidus",
        tagline: {
          nl: "Het zenuwcentrum van het LOWI-platform",
          en: "The nerve centre of the LOWI platform",
        },
        description: {
          nl: "Centrale hub met Supabase-backend, Railway-services en een eigen API-laag die alle andere onderdelen van het platform voedt.",
          en: "Central hub with a Supabase backend, Railway services and a custom API layer feeding every other part of the platform.",
        },
        status: { nl: "In productie", en: "In production" },
        url: "https://example.com/nidus",
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
    },
    {
      sectionId: "experience",
      text: {
        nl: "scant loopbaantraject: analyse → engineering",
        en: "scanning career path: analysis → engineering",
      },
    },
    {
      sectionId: "education",
      text: {
        nl: "indexeert opleidingsdata",
        en: "indexing education records",
      },
    },
    {
      sectionId: "languages",
      text: {
        nl: "taalmodules geladen: nl · en · fr",
        en: "language modules loaded: nl · en · fr",
      },
    },
    {
      sectionId: "skills",
      text: {
        nl: "mapt skill-constellatie",
        en: "mapping skill constellation",
      },
    },
    {
      sectionId: "lowi",
      text: {
        nl: "kernplatform nidus · status groen",
        en: "core platform nidus · status green",
      },
    },
    {
      sectionId: "projects",
      text: {
        nl: "observeert projectcluster: nidus",
        en: "observing project cluster: nidus",
      },
    },
    {
      sectionId: "live-stats",
      text: {
        nl: "telemetrie-stream actief",
        en: "telemetry stream active",
      },
    },
    {
      sectionId: "jarvis",
      text: {
        nl: "standby — terminal actief",
        en: "standby — terminal active",
      },
    },
    {
      sectionId: "contact",
      text: {
        nl: "kanalen beschikbaar: e-mail · linkedin",
        en: "channels available: email · linkedin",
      },
    },
  ],

  contact: {
    email: "klaas@example.com",
    linkedinUrl: "https://www.linkedin.com/in/placeholder",
    location: { nl: "Brussel, België", en: "Brussels, Belgium" },
    cvPdfUrl: "/cv-klaas.pdf",
  },

  sectionTitles: {
    experience: { nl: "Ervaring", en: "Experience" },
    education: { nl: "Opleiding", en: "Education" },
    languages: { nl: "Talenkennis", en: "Languages" },
    skills: { nl: "Wat ik bouw", en: "What I build" },
    lowi: { nl: "LOWI — mijn platform", en: "LOWI — my platform" },
    projects: { nl: "Projecten", en: "Projects" },
    liveStats: { nl: "Live systeem", en: "Live system" },
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
  },
};
