// Alle afstemwaarden van het instrument. Camera-eindpunten/FOV staan in content.
export const celInstellingen = {
  demping: 10, // Tijdconstante 100 ms, ook tijdens de grote cameraverplaatsingen.
  camera: {
    near: 0.008, far: 40, // Macrodetail en een rustig totaalbeeld.
    dpr: [1, 1.25] as const, // GPU-kosten begrenzen.
    drift: 0.008, driftSnelheid: 0.17, // Trage beweging bij stilstaande scroll.
    onderwerpRechts: 0.17, // Ruimte voor tekst links van het focuspunt.
    onthulling: [0.25, 0.28, 3.8] as const, // Tussenpunt vóór de vlucht naar binnen.
    onthullingFov: 45, onthullingMoment: 0.44, // Rustig totaalbeeld binnen hoofdstuk 2.
  },
  licht: {
    omgeving: 0.35, hoofd: 2.4, vulling: 0.45, // Sober zijlicht plus interne fluorescentie.
    hoofdPositie: [-2, 3, 2] as const, vulPositie: [2, -1, -1] as const,
  },
  materiaal: {
    ruwheid: 0.82, ruis: 0.0012, // Microreliëf zonder ribosomen/strengen te vervormen tot klompen.
    emissieBasis: 0.12, // Scherpte stuurt aandacht; dimmen is subtiel.
  },
  instrument: {
    icoDetail: 18, // Voldoende contourdetail voor de extreme macro-opname.
    membraanSchaal: [1.1, 0.91, 1] as const, // Geen perfecte bol.
    adem: 0.004, brown: 0.002, // Microscopische, laagfrequente beweging.
    blaasjes: 180, // Kleine volumes op verschillende dieptes.
    filamenten: 46, filamentDikte: 0.00045, // Fijn cytoskelet.
    deeltjes: 4200, // Parallax, ook vlak voor de macrolens.
    fogDichtheid: 0.48, fogWarmte: 0.012, // Zeer donkere, warme exponentiële fog.
    billboards: 4, mediumOpacity: 0.055, // Gelaagd vloeistofmedium, zonder raymarching.
  },
  ribosomen: {
    aantal: 2600, straal: 0.006, // Eén InstancedMesh; kleine korrels.
    zone: [0.4, 0.2, 0.36] as const, // Dichte zone voor hoofdstuk bouwen.
  },
  mitochondrien: {
    plaatsingen: [[-0.45, -0.12, 0.22, -0.45], [0.38, 0.43, -0.1, 0.6]] as const,
    schaal: [0.24, 0.12, 0.1] as const, // Langwerpige buitenvorm.
    opacity: 0.76, // De relatief dichte wand laat de interne emissie doorschemeren.
    plooien: 9, plooiBereik: 0.17, // Detail in de macro-opname.
    plooiStraal: 0.006, // Fijne onregelmatige cristae.
  },
  golgi: {
    schijven: 7, afstand: 0.042, // Meer dunne, leesbare lamellen.
    profiel: [[0, 0.025], [0.07, 0.005], [0.15, 0], [0.2, 0.04]] as const,
    rotatie: [0.45, 0, -0.3] as const, positie: [0.43, -0.38, 0.05] as const,
  },
  dna: {
    segmenten: 192, radiaal: 8, controlepunten: 96, // Veelvoud van 4 voor delingsnaden.
    basenparen: 28, windingen: 6, // Dubbele helix met dwarsverbindingen.
    compacteStraal: 0.15, compacteStrengAfstand: 0.035, compacteHoogte: 0.08,
    ontvouwenStraal: 0.105, ontvouwenHoogte: 0.72, // Past in het macrobeeld van de kern.
    strengDikte: 0.008, basisDikte: 0.004, // Fijnere strengen, geen speelgoedvorm.
    normaalGrens: 0.95, delingsStraal: 0.22,
    emissieBasis: 0.45, emissieActief: 0.35, // Gedempte violette fluorescentie.
  },
  deling: {
    ruimte: 0.08, lengte: 1.6, kernRuimte: 0.64, kernLengte: 0.48,
    kernRadiaal: 1.5, organelVerkleining: 0.2, // Dezelfde geometrie wordt twee dochterhelften.
  },
  focus: {
    membraan: [0.5, 0.7, 0.27] as const, cytoplasma: [0.1, 0.02, 0.15] as const,
    kern: [0, 0, 0] as const, ribosoom: [0.4, 0.2, 0.36] as const,
    mitochondrion: [-0.45, -0.12, 0.22] as const, golgi: [0.43, -0.38, 0.05] as const,
    celdeling: [0, 0, 0] as const, // Focus volgt actieveOrganellen, niet het paginathema.
  },
  focusBereiken: {
    membraan: 0.035, cytoplasma: 0.18, kern: 0.16, ribosoom: 0.045,
    mitochondrion: 0.08, golgi: 0.09, celdeling: 1.4, // Macrovlak versus rustig totaalbeeld.
  },
  effecten: {
    bokeh: 2, resolutie: 0.5, // Dun focusvlak, halve DOF-resolutie.
    bloomDrempel: 1.3, bloomIntensiteit: 0.12, // Alleen de helderste interne structuren.
    vignette: 0.32, korrel: 0.035, // Subtiel instrumentbeeld.
    meetSeconden: 3, bloomOnderFps: 35, dofOnderFps: 24, // Eerst bloom opgeven, dan pas DOF.
    opwarmDelta: 0.1, // Eerste shadercompilatie telt hoogstens als één traag opwarmframe.
  },
  geometrieDrempel: 0.00001, // Onzichtbaar kleine CPU-geometrieupdates overslaan.
} as const;

export type CelInstellingen = typeof celInstellingen;
