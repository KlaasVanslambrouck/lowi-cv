/**
 * Toetsafhandeling voor de presentatiemodus.
 *
 * De presentatie draait op globale toetsaanslagen (spatie, pijlen, cijfers),
 * maar de blokken 3, 5 en 6 bevatten invoervelden en schuifregelaars die
 * exact dezelfde toetsen nodig hebben. Deze module bepaalt of een toets bij
 * het element hoort dat focus heeft, of bij de presentatie.
 */

/**
 * Elementen die zelf tekst of waarden opnemen: elke toets is voor hen.
 * Dit dekt ook `input[type="range"]`, waar de pijltoetsen de waarde wijzigen.
 */
export function isInvoerElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.getAttribute("role") === "slider") return true;
  if (target.getAttribute("role") === "textbox") return true;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.tagName === "OPTION"
  );
}

/**
 * Elementen die door spatie of Enter geactiveerd worden. Ze mogen die twee
 * toetsen houden — de overige presentatietoetsen niet, zodat je na een klik
 * op een knop gewoon verder kunt navigeren.
 */
export function isActiveerbaarElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const rol = target.getAttribute("role");
  if (rol === "button" || rol === "link" || rol === "tab") return true;

  return (
    target.tagName === "BUTTON" ||
    target.tagName === "SUMMARY" ||
    (target.tagName === "A" && target.hasAttribute("href"))
  );
}

const ACTIVEERTOETSEN = new Set([" ", "Spacebar", "Enter"]);

/**
 * Mag de presentatie deze toetsaanslag opvangen?
 *
 * Escape is de enige uitzondering die altijd doorkomt: het typt geen teken en
 * is de ontsnapping die je nodig hebt wanneer de focus vastzit in een demo.
 */
export function magPresentatieToetsAfhandelen(
  event: KeyboardEvent,
  opties: { escapeAltijd?: boolean } = {},
): boolean {
  if (event.defaultPrevented) return false;
  if (event.ctrlKey || event.metaKey || event.altKey) return false;

  if (event.key === "Escape") {
    return opties.escapeAltijd !== false;
  }

  if (isInvoerElement(event.target)) return false;

  if (ACTIVEERTOETSEN.has(event.key) && isActiveerbaarElement(event.target)) {
    return false;
  }

  return true;
}
