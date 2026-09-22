import { placeholderContent } from "@/content/placeholderContent";
import {
  CURRENT_EXPERIENCE_EXPLANATION_ID,
  NEW_ROLE_DESCRIPTION,
  NEW_ROLE_MOTIF,
  NEW_ROLE_PERIOD,
  PREVIOUS_ROLE_PERIOD,
  ROLE,
  ROLE_PHASE,
  ROLE_START_MONTH,
} from "@/content/role";
import type { ExperienceEntry, IsoDatePart, RolePhase } from "@/types/content";

// Eén bron voor de loopbaanlijst: de tijdlijn op de site, work in /cv.json en
// de ervaring-chunks van Jarvis lezen hier. Zo kunnen ze na de faseswitch
// niet uit elkaar lopen.

export interface TimelineExperience extends ExperienceEntry {
  // De functie die nu loopt: geen einddatum én al begonnen. In de fase
  // "incoming" is de nieuwe job nog niet gestart, dus dan is dat de vorige.
  isCurrent: boolean;
  // Id van de Jarvis-uitleg bij deze functie; ontbreekt = geen uitlegknop.
  explanationId?: string;
}

// De nieuwe functie staat niet in placeholderContent: ze komt uit role.ts.
function newRoleEntry(phase: RolePhase): TimelineExperience {
  const explanationId = CURRENT_EXPERIENCE_EXPLANATION_ID[phase];
  const isCurrent = phase === "current";

  return {
    role: { nl: ROLE.role, en: ROLE.role },
    company: ROLE.employer.name,
    period: "",
    periodLabel: NEW_ROLE_PERIOD[phase],
    startDate: ROLE_START_MONTH as IsoDatePart,
    motif: NEW_ROLE_MOTIF,
    description: NEW_ROLE_DESCRIPTION,
    isCurrent,
    ...(isCurrent && explanationId ? { explanationId } : {}),
  };
}

// Chronologisch, oudste eerst — zoals de tijdlijn ze toont. /cv.json sorteert
// zelf omgekeerd, zodat de nieuwste functie daar bovenaan staat.
export function experienceFor(phase: RolePhase = ROLE_PHASE): TimelineExperience[] {
  const previousEmployerName = ROLE.previousRole.employer.name;
  const previousRoleEnded = phase === "current";
  const explanationId = CURRENT_EXPERIENCE_EXPLANATION_ID[phase];

  const entries: TimelineExperience[] = placeholderContent.experience.map(
    (entry) => {
      if (entry.company !== previousEmployerName) {
        return { ...entry, isCurrent: false };
      }

      // De vorige functie loopt door tot de nieuwe fase ingaat.
      const isCurrent = !previousRoleEnded;

      return {
        ...entry,
        periodLabel: PREVIOUS_ROLE_PERIOD[phase],
        ...(previousRoleEnded ? { endDate: ROLE.previousRole.endDate } : {}),
        isCurrent,
        ...(isCurrent && explanationId ? { explanationId } : {}),
      };
    },
  );

  entries.push(newRoleEntry(phase));
  return entries;
}
