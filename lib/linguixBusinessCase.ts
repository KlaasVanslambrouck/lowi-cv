export interface LinguixBusinessCaseParameters {
  readonly volumeSchrijven: number;
  readonly volumeSpreken: number;
  readonly minutenBeoordelingSchrijven: number;
  readonly minutenAfnameSpreken: number;
  readonly minutenBeoordelingSpreken: number;
  readonly minutenOverhead: number;
  readonly kostPerUur: number;
  readonly aandeelAutonoomSchrijven: number;
  readonly minutenReviewMetAi: number;
  readonly wachttijdWeken: number;
  readonly urenPerFte: number;
}

export interface CurrentWorkload {
  readonly urenSchrijvenNu: number;
  readonly urenSprekenNu: number;
  readonly urenTotaalNu: number;
}

export interface FutureWorkload {
  readonly urenSchrijvenNa: number;
  readonly urenSprekenNa: number;
  readonly urenTotaalNa: number;
}

export interface DerivedBusinessCaseValues {
  readonly urenVrijgemaakt: number;
  readonly fteEquivalent: number;
  readonly kostNu: number;
  readonly kostNa: number;
  readonly besparingBruto: number;
  readonly kostPerAfnameNu: number;
  readonly kostPerAfnameNa: number;
}

export interface TurnaroundValues {
  readonly capaciteitsfactor: number;
  readonly wachttijdNa: number;
}

export interface LinguixBusinessCaseResults
  extends CurrentWorkload,
    FutureWorkload,
    DerivedBusinessCaseValues,
    TurnaroundValues {}

export const LINGUIX_BUSINESS_CASE_DEFAULTS: LinguixBusinessCaseParameters = {
  volumeSchrijven: 18_000,
  volumeSpreken: 18_000,
  minutenBeoordelingSchrijven: 12,
  minutenAfnameSpreken: 25,
  minutenBeoordelingSpreken: 8,
  minutenOverhead: 10,
  kostPerUur: 65,
  aandeelAutonoomSchrijven: 0.6,
  minutenReviewMetAi: 4,
  wachttijdWeken: 6,
  urenPerFte: 1_520,
};

export function calculateCurrentWorkload(
  parameters: LinguixBusinessCaseParameters,
): CurrentWorkload {
  const urenSchrijvenNu =
    (parameters.volumeSchrijven *
      (parameters.minutenBeoordelingSchrijven + parameters.minutenOverhead)) /
    60;
  const urenSprekenNu =
    (parameters.volumeSpreken *
      (parameters.minutenAfnameSpreken +
        parameters.minutenBeoordelingSpreken +
        parameters.minutenOverhead)) /
    60;
  const urenTotaalNu = urenSchrijvenNu + urenSprekenNu;

  return {
    urenSchrijvenNu,
    urenSprekenNu,
    urenTotaalNu,
  };
}

export function calculateFutureWorkload(
  parameters: LinguixBusinessCaseParameters,
): FutureWorkload {
  const urenSchrijvenNa =
    (parameters.volumeSchrijven *
      (1 - parameters.aandeelAutonoomSchrijven) *
      (parameters.minutenReviewMetAi + parameters.minutenOverhead)) /
    60;
  const urenSprekenNa =
    (parameters.volumeSpreken * parameters.minutenBeoordelingSpreken) / 60;
  const urenTotaalNa = urenSchrijvenNa + urenSprekenNa;

  return {
    urenSchrijvenNa,
    urenSprekenNa,
    urenTotaalNa,
  };
}

export function calculateDerivedBusinessCaseValues(
  parameters: LinguixBusinessCaseParameters,
  currentWorkload: CurrentWorkload,
  futureWorkload: FutureWorkload,
): DerivedBusinessCaseValues {
  const urenVrijgemaakt =
    currentWorkload.urenTotaalNu - futureWorkload.urenTotaalNa;
  const fteEquivalent = urenVrijgemaakt / parameters.urenPerFte;
  const kostNu = currentWorkload.urenTotaalNu * parameters.kostPerUur;
  const kostNa = futureWorkload.urenTotaalNa * parameters.kostPerUur;
  const besparingBruto = kostNu - kostNa;
  const totaalAfnames = parameters.volumeSchrijven + parameters.volumeSpreken;
  const kostPerAfnameNu = kostNu / totaalAfnames;
  const kostPerAfnameNa = kostNa / totaalAfnames;

  return {
    urenVrijgemaakt,
    fteEquivalent,
    kostNu,
    kostNa,
    besparingBruto,
    kostPerAfnameNu,
    kostPerAfnameNa,
  };
}

export function calculateTurnaroundValues(
  parameters: LinguixBusinessCaseParameters,
  currentWorkload: CurrentWorkload,
  futureWorkload: FutureWorkload,
): TurnaroundValues {
  const capaciteitsfactor =
    currentWorkload.urenTotaalNu / futureWorkload.urenTotaalNa;
  const wachttijdNa = parameters.wachttijdWeken / capaciteitsfactor;

  return {
    capaciteitsfactor,
    wachttijdNa,
  };
}

export function calculateLinguixBusinessCase(
  parameters: LinguixBusinessCaseParameters,
): LinguixBusinessCaseResults {
  const currentWorkload = calculateCurrentWorkload(parameters);
  const futureWorkload = calculateFutureWorkload(parameters);
  const derivedValues = calculateDerivedBusinessCaseValues(
    parameters,
    currentWorkload,
    futureWorkload,
  );
  const turnaroundValues = calculateTurnaroundValues(
    parameters,
    currentWorkload,
    futureWorkload,
  );

  return {
    ...currentWorkload,
    ...futureWorkload,
    ...derivedValues,
    ...turnaroundValues,
  };
}
