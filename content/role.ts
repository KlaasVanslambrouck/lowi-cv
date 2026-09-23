import type {
  Bilingual,
  CareerMotif,
  EmployerInfo,
  Language,
  RoleInfo,
  RolePhase,
} from "@/types/content";

// Eén bron voor rol, werkgever en fase. Alles wat per fase verschilt — metadata,
// JSON-LD, statuslabel, about-tekst, Jarvis-antwoorden en de OG-ondertitel —
// wordt hieronder afgeleid, zodat de wissel één regel is.
//
// SCHAKELEN OP DE STARTDATUM: zet ROLE_PHASE op "current". Bewust geen
// automatische datumwissel: de site is statisch gebouwd, dus een datumcheck
// zou pas bij de volgende build effect hebben.
// Volledige checklist voor die dag: docs/rolwissel-2026-10-05.md

export const ROLE_PHASE: RolePhase = "incoming";

export const ROLE: RoleInfo = {
  role: "AI Transformation Expert",
  employer: { name: "In The Pocket", legalName: "ITP Agency NV" },
  startDate: "2026-10-05",
  previousRole: {
    title: "Functional Consultant",
    employer: { name: "Itineris NV", shortName: "Itineris" },
    endDate: "2026-09",
  },
};

// Startmaand van de nieuwe functie in JSON Resume-formaat ("2026-10").
export const ROLE_START_MONTH = ROLE.startDate.slice(0, 7);

const MONTH_NAMES: readonly Bilingual[] = [
  { nl: "januari", en: "January" },
  { nl: "februari", en: "February" },
  { nl: "maart", en: "March" },
  { nl: "april", en: "April" },
  { nl: "mei", en: "May" },
  { nl: "juni", en: "June" },
  { nl: "juli", en: "July" },
  { nl: "augustus", en: "August" },
  { nl: "september", en: "September" },
  { nl: "oktober", en: "October" },
  { nl: "november", en: "November" },
  { nl: "december", en: "December" },
];

// "2026-10-05" -> { nl: "5 oktober 2026", en: "5 October 2026" }.
// Bewust geen Intl: server en browser kunnen andere locale-data hebben, wat
// hydratieverschillen zou geven. Eén plek waar de datum tekst wordt.
export function formatLongDate(isoDate: string): Bilingual {
  const [year, month, day] = isoDate.split("-");
  const monthName = MONTH_NAMES[Number(month) - 1];

  if (!year || !monthName || !day) {
    throw new Error(`formatLongDate verwacht YYYY-MM-DD, kreeg "${isoDate}"`);
  }

  return {
    nl: `${Number(day)} ${monthName.nl} ${year}`,
    en: `${Number(day)} ${monthName.en} ${year}`,
  };
}

// De startdatum als leesbare tekst; gebruikt in metadata, about, statusbadge
// en de Jarvis-antwoorden.
export const ROLE_START_LABEL: Bilingual = formatLongDate(ROLE.startDate);

export const NEW_ROLE_DESCRIPTION: Bilingual = {
  nl: "Begeleidt organisaties van AI-ambitie naar adoptie: use cases kiezen, processen herdenken, prototypes bouwen en verandering meetbaar maken. Bij In The Pocket, een digitale productstudio in Gent.",
  en: "Guides organisations from AI ambition to adoption: selecting use cases, rethinking processes, building prototypes and making change measurable. At In The Pocket, a digital product studio in Ghent.",
};

// "blueprint" = ontwerptekening; onderscheidt de nieuwe rol van de twee
// analyse-functies, die "flowchart" gebruiken.
export const NEW_ROLE_MOTIF: CareerMotif = "blueprint";

// Periodeteksten per fase; de tijdlijn toont deze i.p.v. entry.period.
export const NEW_ROLE_PERIOD: Record<RolePhase, Bilingual> = {
  incoming: { nl: "vanaf okt 2026", en: "from Oct 2026" },
  current: { nl: "okt 2026 — heden", en: "Oct 2026 — present" },
};

export const PREVIOUS_ROLE_PERIOD: Record<RolePhase, Bilingual> = {
  incoming: { nl: "juni 2022 — heden", en: "June 2022 — present" },
  current: { nl: "juni 2022 — sep 2026", en: "June 2022 — Sep 2026" },
};

// Welke Jarvis-uitleg bij de huidige functie hoort, per fase. null = geen
// uitlegknop in de tijdlijn.
// TODO(Klaas): tekst voor de rol bij In The Pocket aanleveren na de eerste
// weken; voeg die toe aan placeholderContent.jarvisExplanations en zet het id
// hieronder bij "current".
export const CURRENT_EXPERIENCE_EXPLANATION_ID: Record<RolePhase, string | null> =
  {
    incoming: "current-experience",
    current: null,
  };

const isIncoming = ROLE_PHASE === "incoming";

const previousEmployer =
  ROLE.previousRole.employer.shortName ?? ROLE.previousRole.employer.name;

// ---------------------------------------------------------------------------
// Afgeleide copy
// ---------------------------------------------------------------------------

// Rechterkant van de hero-tagline; gelijk in beide fases.
export const roleTagline: Bilingual = {
  nl: `${ROLE.role} · ${ROLE.employer.name}`,
  en: `${ROLE.role} at ${ROLE.employer.name}`,
};

// Statusbadge in de hero. null in de "current"-fase: dan toont Hero geen badge.
export const statusLabel: Bilingual | null = isIncoming
  ? {
      nl: `start ${ROLE_START_LABEL.nl} bij ${ROLE.employer.name}`,
      en: `starting ${ROLE_START_LABEL.en} at ${ROLE.employer.name}`,
    }
  : null;

// Als functie zodat /cv.json en de tests beide fases kunnen opvragen.
export function aboutBodyFor(phase: RolePhase): Bilingual {
  return phase === "incoming"
    ? {
        nl: `Ik ben Klaas. Vanaf ${ROLE_START_LABEL.nl} werk ik als ${ROLE.role} bij ${ROLE.employer.name}; tot dan als functioneel analist bij ${previousEmployer}. Mijn kracht zit op de brug tussen business, technologie en AI: ik zie snel hoe processen werken, waar frictie zit en hoe je die vertaalt naar praktische, werkende oplossingen. Nidus is daarvan het bewijs: een zelfgebouwd platform dat data, automatisering en intelligentie samenbrengt. LOWI is het lab waar dat ontstaat.`,
        en: `I'm Klaas. From ${ROLE_START_LABEL.en} I work as an ${ROLE.role} at ${ROLE.employer.name}; until then as a functional analyst at ${previousEmployer}. My strength sits at the intersection of business, technology and AI: I quickly see how processes work, where the friction lies, and how to translate that into practical, working solutions. Nidus is the proof: a self-built platform that brings together data, automation and intelligence. LOWI is the lab where that happens.`,
      }
    : {
        nl: `Ik ben Klaas, ${ROLE.role} bij ${ROLE.employer.name}. Mijn kracht zit op de brug tussen business, technologie en AI: ik zie snel hoe processen werken, waar frictie zit en hoe je die vertaalt naar praktische, werkende oplossingen. Mijn basis is functionele analyse. Nidus is het bewijs: een zelfgebouwd platform dat data, automatisering en intelligentie samenbrengt. LOWI is het lab waar dat ontstaat.`,
        en: `I'm Klaas, ${ROLE.role} at ${ROLE.employer.name}. My strength sits at the intersection of business, technology and AI: I quickly see how processes work, where the friction lies, and how to translate that into practical, working solutions. My foundation is functional analysis. Nidus is the proof: a self-built platform that brings together data, automation and intelligence. LOWI is the lab where that happens.`,
      };
}

export const aboutBody: Bilingual = aboutBodyFor(ROLE_PHASE);

// basics.label in /cv.json.
export function resumeLabelFor(phase: RolePhase): string {
  return phase === "incoming"
    ? `Incoming ${roleTagline.en}`
    : roleTagline.en;
}

// <title> van de site: maximaal 60 tekens. In beide talen gelijk, want de
// functietitel is Engels; de taal van de pagina blijft wel een parameter,
// zodat elke aanroep expliciet maakt voor welke taalversie hij bouwt.
export function siteTitleFor(
  language: Language,
  phase: RolePhase = ROLE_PHASE,
): string {
  const title = `Klaas Vanslambrouck | ${phase === "incoming" ? "Incoming " : ""}${ROLE.role}`;
  const byLanguage: Bilingual = { nl: title, en: title };
  return byLanguage[language];
}

// Meta description per taal, 140-160 tekens.
export function siteDescriptionFor(
  language: Language,
  phase: RolePhase = ROLE_PHASE,
): string {
  const byPhase: Record<RolePhase, Bilingual> = {
    incoming: {
      nl: `Vanaf ${ROLE_START_LABEL.nl} ${ROLE.role} bij ${ROLE.employer.name}. Ik vertaal complexe business- en systeemcontext naar werkende systemen. Nidus is het bewijs.`,
      en: `${ROLE.role} at ${ROLE.employer.name} from ${ROLE_START_LABEL.en}. I translate complex business and systems context into working systems. Nidus is the proof.`,
    },
    current: {
      nl: `${ROLE.role} bij ${ROLE.employer.name}. Ik vertaal complexe business- en systeemcontext naar werkende AI-systemen. Nidus is daarvan het bewijs.`,
      // "in Ghent" houdt de zin binnen de ondergrens van 140 tekens.
      en: `${ROLE.role} at ${ROLE.employer.name} in Ghent. I translate complex business and systems context into working AI systems. Nidus is the proof.`,
    },
  };

  return byPhase[phase][language];
}

// Ondertitel en alt-tekst van de Open Graph-afbeelding van de homepage.
// Gelijk in beide talen, net als de titel: de rolnaam is Engels.
export function ogSubtitleFor(language: Language): string {
  const subtitle = `${isIncoming ? "Incoming " : ""}${ROLE.role} · ${ROLE.employer.name}`;
  const byLanguage: Bilingual = { nl: subtitle, en: subtitle };
  return byLanguage[language];
}

export function ogAltFor(language: Language): string {
  return `Klaas Vanslambrouck — ${ogSubtitleFor(language)}`;
}

// Rol en werkgever zoals ze in JSON-LD mogen staan. In de "incoming"-fase is de
// nieuwe functie nog niet begonnen; schema.org beschrijft de huidige situatie,
// dus dan staat de vorige rol er. De nieuwe rol staat wel in de zichtbare copy.
export const schemaRole: { jobTitle: string; employer: EmployerInfo } = isIncoming
  ? { jobTitle: ROLE.previousRole.title, employer: ROLE.previousRole.employer }
  : { jobTitle: ROLE.role, employer: ROLE.employer };

// Hoe Jarvis de rol omschrijft binnen een lopende zin.
export const jarvisRoleDescriptor: Bilingual = {
  nl: `${isIncoming ? "aankomend " : ""}${ROLE.role} bij ${ROLE.employer.name}, met een achtergrond als functioneel analist`,
  en: `${isIncoming ? "incoming " : ""}${ROLE.role} at ${ROLE.employer.name}, with a background in functional analysis`,
};

// Positioneringszin voor de vraag "wat onderscheidt hem van een klassieke analist?".
export const jarvisPositioning: Bilingual = isIncoming
  ? {
      nl: `De content positioneert hem als analist die naar AI-transformatie doorgroeit: vanaf ${ROLE_START_LABEL.nl} ${ROLE.role} bij ${ROLE.employer.name}.`,
      en: `The content positions him as an analyst growing into AI transformation: from ${ROLE_START_LABEL.en} ${ROLE.role} at ${ROLE.employer.name}.`,
    }
  : {
      nl: `De content positioneert hem als ${ROLE.role} bij ${ROLE.employer.name} die uit de functionele analyse komt en systemen niet alleen beschrijft maar ook bouwt.`,
      en: `The content positions him as ${ROLE.role} at ${ROLE.employer.name}, coming from functional analysis and building systems rather than only describing them.`,
    };
