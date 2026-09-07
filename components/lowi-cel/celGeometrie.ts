import type { Vector3 } from "three";
import { celInstellingen } from "./celInstellingen";

// Vervorm dezelfde vertices naar twee lobben. Bij deling=1 sluit de hals tot
// nul oppervlakte en liggen de beide lobben uit elkaar; geen tweede celmodel.
export function vervormDeling(punt: Vector3, deling: number, straal = 1, kern = false, zijde?: -1 | 1): void {
  const u = Math.min(1, Math.abs(punt.x / straal));
  const teken = zijde ?? (punt.x < 0 ? -1 : 1);
  const eindX = kern ? teken * (celInstellingen.deling.kernRuimte + celInstellingen.deling.kernLengte * u) : teken * (celInstellingen.deling.ruimte + celInstellingen.deling.lengte * u);
  const verhouding = (kern ? celInstellingen.deling.kernRadiaal : celInstellingen.deling.lengte) * Math.sqrt(u / (1 + u));
  punt.x += (eindX - punt.x) * deling;
  punt.y *= 1 + (verhouding - 1) * deling;
  punt.z *= 1 + (verhouding - 1) * deling;
}
