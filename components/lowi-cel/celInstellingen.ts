// Alle afstemwaarden van het instrument. Camera-eindpunten/FOV staan in content.
export const celInstellingen = {
  demping: 10, // Tijdconstante 100 ms, ook tijdens de grote cameraverplaatsingen.
  camera: {
    near: 0.008, far: 40, // Macrodetail en een rustig totaalbeeld.
    dpr: [1, 1.25] as const, // GPU-kosten begrenzen.
    drift: 0.003, driftSnelheid: 0.17, // Trage beweging bij stilstaande scroll.
    onderwerpRechts: 0, // Het canvas heeft een eigen kolom naast de copy.
  },
  licht: {
    omgeving: 0.3, hoofd: 3.1, vulling: 0.65, // Sober zijlicht plus interne fluorescentie.
    hoofdPositie: [-2, 3, 2] as const, vulPositie: [2, -1, -1] as const,
  },
  materiaal: {
    ruwheid: 0.42, ruis: 0.0012, // Microreliëf zonder ribosomen/strengen te vervormen tot klompen.
    emissieBasis: 0.12, // Scherpte stuurt aandacht; dimmen is subtiel.
  },
  instrument: {
    icoDetail: 36, // Viermaal meer vlakken om het frontale macrobeeld te dragen.
    membraanSchaal: [1.1, 0.91, 1] as const, // Geen perfecte bol.
    adem: 0.004, brown: 0.002, // Microscopische, laagfrequente beweging.
    blaasjes: 24, // Kleine volumes op verschillende dieptes.
    filamenten: 46, filamentDikte: 0.00045, // Fijn cytoskelet.
    deeltjes: 640, // Rustige diepte; de organellen blijven het onderwerp.
    fogDichtheid: 0.28, fogWarmte: 0.025, // Zichtbaar warm medium zonder de interne contrasten dicht te trekken.
    billboards: 4, mediumOpacity: 0.035, // Vier zachte lagen op verschillende dieptes.
    deeltjeMin: 0.005, deeltjeVariatie: 0.02, // Grote spreiding, ook zonder DOF zachte randen.
    deeltjeHelderheid: 0.07, deeltjeFog: 1.6, // Verre deeltjes lossen snel op in het medium.
    buitenHelderheid: 0.12, // Extracellulaire vlokken zijn donkerder en groter.
  },
  ribosomen: {
    aantal: 680, straal: 0.0035, // Eén InstancedMesh; kleine korrels.
    binnenStraal: 0.34, buitenStraal: 0.93, // Het hele cytoplasma, met meer dichtheid rond de kern.
    grootteMin: 0.8, grootteVariatie: 0.4, // Lichte variatie zonder grove zandkorrels.
  },
  mitochondrien: {
    plaatsingen: [[-0.45, -0.12, 0.22, -0.45], [0.38, 0.43, -0.1, 0.6]] as const,
    schaal: [0.24, 0.12, 0.1] as const, // Langwerpige buitenvorm.
    opacity: 0.3, wandKleur: 0.55, // Gedempte, doorschijnende buitenschil.
    plooien: 9, plooiBereik: 0.75, // Genormaliseerd bereik; de plooien blijven binnen de wand.
    plooiStraal: 0.0035, binnenEmissie: 0.45, binnenKleur: 0.5, // Schemerende interne geometrie.
    kromming: 0.026, // Lichte bocht en ongelijke diameter van het lichaam.
  },
  golgi: {
    schijven: 7, afstand: 0.042, // Meer dunne, leesbare lamellen.
    profiel: [[0, 0.025], [0.07, 0.005], [0.15, 0], [0.2, 0.04]] as const,
    rotatie: [0.45, 0, -0.3] as const, positie: [0.43, -0.38, 0.05] as const,
  },
  dna: {
    segmenten: 192, radiaal: 8, controlepunten: 96, // Veelvoud van 4 voor delingsnaden.
    basenparen: 24, windingen: 3.5, // Fijn detail in de kern, geen dichtgeslibde veer.
    compacteStraal: 0.15, compacteStrengAfstand: 0.035, compacteHoogte: 0.08,
    ontvouwenStraal: 0.065, ontvouwenHoogte: 0.4, // De helix blijft binnen de kern.
    strengDikte: 0.003, basisDikte: 0.0014, // Open ruimte tussen dunne strengen.
    normaalGrens: 0.95, delingsStraal: 0.22,
    emissieBasis: 0.32, emissieActief: 0.08, // Gecontroleerd licht, geen zwevend symbool.
  },
  kern: {
    schilOpacity: 0.2, binnenOpacity: 0.09, // Eigen rand en verschillende dichtheidslagen.
    nucleolusStraal: 0.065, nucleolusPositie: [0.16, 0.1, 0.05] as const,
  },
  deling: {
    ruimte: 0.08, lengte: 1.6, kernRuimte: 0.64, kernLengte: 0.48,
    kernRadiaal: 1.5, organelVerkleining: 0.2, // Dezelfde geometrie wordt twee dochterhelften.
  },
  focus: {
    membraan: [0.18, 0.08, 0.99] as const, cytoplasma: [0.1, 0.02, 0.15] as const,
    kern: [0, 0, 0] as const, ribosoom: [0.4, 0.2, 0.36] as const,
    mitochondrion: [-0.45, -0.12, 0.22] as const, golgi: [0.43, -0.38, 0.05] as const,
    celdeling: [0, 0, 0] as const, // Focus volgt actieveOrganellen, niet het paginathema.
  },
  focusBereiken: {
    membraan: 0.06, cytoplasma: 0.18, kern: 0.16, ribosoom: 0.045,
    mitochondrion: 0.08, golgi: 0.09, celdeling: 1.4, // Macrovlak versus rustig totaalbeeld.
  },
  effecten: {
    bokeh: 2, resolutie: 0.5, // Dun focusvlak, halve DOF-resolutie.
    bloomDrempel: 0.8, bloomIntensiteit: 0.12, // Afgestemd op de gedempte emissie; kleine kernel, halve resolutie.
    vignette: 0.24, korrel: 0.008, // Subtiel instrumentbeeld.
    meetSeconden: 3, deeltjesOnderFps: 40, dofOnderFps: 20, // Bloom blijft altijd aan.
    beperkteDichtheid: 0.5, // Eerst fijne deeltjes halveren, pas daarna eventueel DOF.
    opwarmDelta: 0.1, // Eerste shadercompilatie telt hoogstens als één traag opwarmframe.
  },
  geometrieDrempel: 0.00001, // Onzichtbaar kleine CPU-geometrieupdates overslaan.
} as const;

export type CelInstellingen = typeof celInstellingen;
