Fase 3 — verificatie B1–B6, 7 september 2026

De implementatie compileert en de productiebuild slaagt. `/lowi` blijft statisch. De volledige testsuite heeft 49 geslaagde tests en uitsluitend de al bekende falende AI-antwoordtest. Er is niets gecommit of gepusht.

Open [de screenshotgalerij](index.html) voor alle zeven hoofdstukken naast elkaar in beide thema's, de tussenbeelden en de drie artikelvarianten. Desktopbeelden: Chromium, 1440 × 900, DPR 1, SwiftShader; mobiel: 390 × 844. Dit is een visuele/React-controle, geen GPU-prestatiebenchmark op echte hardware.

**B1 — beginpalet**

- `maakCelStaat(palet)` vereist het actieve palet. Alle organellen beginnen direct bij de neutrale mengkleur van `--cv-muted` en `--cv-text-soft` uit dat palet.
- `useCelInterpolatie` maakt de werkstaat en doelstaat eenmaal aan met een lazy state-initializer. Een themawissel bewaart de bestaande staat en verandert het doel; `useFrame` dempt kleuren, lichtkleuren en camera zonder state-setters.
- CelModel en DnaHelix initialiseren hun eigen materialen uit die werkstaat. Hun geometrieën en materialen blijven dezelfde objecten bij een themawissel.
- Hoofd-, vul- en omgevingslicht krijgen hun beginkleur uit het actieve palet. In licht gebruiken ze `--cv-bg`; in donker gebruikt het hoofd-/omgevingslicht `--cv-text` en het vullicht `--cv-text-soft`. De twee lichtkleuren volgen dezelfde demping bij omschakelen.
- De camera-instellingen staan stabiel buiten de component; een themawissel zet de camera niet terug naar de intro.
- Twee extra parametrische tests controleren de directe beginstaat voor beide paletten. Samen met de vijf bestaande interpolatietests zijn dit zeven geslaagde tests.

Koude browserstarts, op de eerste commit van de scène gemeten:

| Thema | Neutrale beginkleur | Doelkleur bij opstart | Hoofdlicht |
| --- | --- | --- | --- |
| Donker | `#afaaad` | `#afaaad` | `#f1ece2` |
| Licht | `#635f65` | `#635f65` | `#f3efe7` |

Bewijs: [donkere meting](dark-meting.json), [lichte meting](light-meting.json).

**B2 — centrale afstemwaarden**

Het geëxporteerde `celInstellingen`-object en type `CelInstellingen` staan in [celInstellingen.ts](../../components/lowi-cel/celInstellingen.ts). Iedere afstemwaarde heeft een comment. Het object bevat camera/DPR, alle lichtsterktes en posities, materiaalruwheid/emissie/opacity, schilstralen/detail/openingen/onregelmatigheid, ribosoomaantal/plaatsing/detail, mitochondriën/zes plooien, Golgi-profiel/stapeling, DNA-detail/ontvouwing, delingsafstanden en de geometrie-updategrens.

De gevraagde aantallen zijn 120 ribosomen, twee mitochondriën met zes plooien, vijf Golgi-schijven en 28 basenparen. Demping blijft 6. FOV is na visuele controle verhoogd van 42 naar 50 om beide dochtercellen binnen het canvas te laten passen. DNA-detail is verhoogd van 112 naar 192 lengtesegmenten, van 6 naar 8 omtreksegmenten en van 64 naar 96 controlepunten. De overige bestaande afstemwaarden zijn samengebracht zonder inhoudelijke wijziging. Wiskundige grenzen, halve/kwart omwentelingen en indexberekeningen blijven in de geometrie staan.

De **volledige inhoud** van `celInstellingen.ts`, `celPalet.ts` en `useCelInterpolatie.ts` staat ook in [bronbestanden.md](bronbestanden.md).

**Aanvullende aantoonbare fouten hersteld**

- De scène liep één hoofdstuk achter. De eerste overgang begint nu zodra de container de viewport binnenkomt; de hoofdstukeindstaat is bereikt wanneer de tekstsectie centraal staat. Iedere overgang houdt één sectiehoogte scrollafstand. De DOM-indicator volgt afzonderlijk de tekstsectie. Het voorgeschreven smoothstep-plus-dempingmodel blijft behouden.
- SphereGeometry liet pooldriehoeken weg, waardoor een geopende pool een kartelrand werd. De veranderende schillen gebruiken nu volledige quads.
- De DNA-buis volgt een doorlopend lokaal vlak langs de curve; de plots wisselende referentie-as en binnenstebuiten georiënteerde driehoeken zijn hersteld.
- Delingsnaden hebben dubbele vertices binnen hetzelfde model. De hals snoert in en wordt aan het einde niet meer getekend. DNA-buizen hebben overeenkomstige gesplitste naadringen; basenparen worden binnen hun eigen dochterhelft geplaatst. Er blijven geen bruggen tussen de dochtercellen over.
- Geen cameracoördinaten of andere inhoud in `lowiCellContent.ts` gewijzigd tijdens B1–B6.

**B4 — visuele beoordeling**

| Punt | Uitkomst |
| --- | --- |
| 1. Zichtbaar en herkenbaar | Ja: celwand, kern, DNA en de verschillende organellen zijn zichtbaar in beide thema's. |
| 2. Doorsnede | Geleidelijk; geen plots wegvallend segment. Gemeten tussenstanden en screenshots op 25%, 50% en 75% zijn toegevoegd. |
| 3. DNA door kernschil | Leesbaar. De schil verbergt de helix niet; tijdens ontvouwen steekt de helix boven en onder de kern uit. |
| 4. Ontvouwing | De compacte lus verandert via een gebogen tussenvorm in een verticale dubbele helix. De curve verandert, niet de groepsschaal. |
| 5. Mitochondriale plooien | De zes plooien zijn in het brandstofhoofdstuk herkenbaar op de ingestelde camera-afstand. |
| 6. Celdeling | Twee gescheiden dochtercellen, zonder overblijvende vlakken of DNA-brug. Ook in de productiebuild gecontroleerd. |
| 7. Highlight | Kern, ribosomen, mitochondriën en Golgi onderscheiden zich duidelijk. De cytoplasma-highlight is veel subtieler door de voorgeschreven lage opacity; die intensiteit is als smaakkwestie behouden. |
| 8. Tekst | Leesbaar in beide thema's. Het bijna ondoorzichtige tekstvlak schermt de scène voldoende af. |
| 9. Thema midden in scroll | Geen extra flits of remount waargenomen. De canvasnode blijft dezelfde; per-frame kleurmetingen volgen het nieuwe doel zonder terugslag zodra dat thema actief is. De camera blijft staan. |

Bewust behouden als smaakkeuzes: de vele zichtbare ribosomen, de eenvoudige wetenschappelijke illustratiestijl, de subtiele cytoplasma-highlight en de gedeeltelijke overlap van de linker dochtercel met het tekstvlak. Sommige close-ups snijden de buitenste celrand aan de canvasrand af; het actieve organel blijft zichtbaar. De contentplaceholders zijn ongewijzigd.

| Hoofdstuk | Donker | Licht |
| --- | --- | --- |
| 1 — Grens | [Screenshot](dark-1-grens.png) | [Screenshot](light-1-grens.png) |
| 2 — Werkvloer | [Screenshot](dark-2-werkvloer.png) | [Screenshot](light-2-werkvloer.png) |
| 3 — Code | [Screenshot](dark-3-code.png) | [Screenshot](light-3-code.png) |
| 4 — Bouwen | [Screenshot](dark-4-bouwen.png) | [Screenshot](light-4-bouwen.png) |
| 5 — Brandstof | [Screenshot](dark-5-brandstof.png) | [Screenshot](light-5-brandstof.png) |
| 6 — Verfijnen | [Screenshot](dark-6-verfijnen.png) | [Screenshot](light-6-verfijnen.png) |
| 7 — Groei | [Screenshot](dark-7-groei.png) | [Screenshot](light-7-groei.png) |

**B5 — gescheiden React-meting**

In development vóór React een DevTools-hook geïnjecteerd en per renderer/root de gecommitte component-fibers met `PerformedWork` geteld. Hergebruikte fibers van de vorige boom tellen niet opnieuw mee. De initiële mount is eerst apart waargenomen (CelCanvas, CelScene, CelModel en DnaHelix elk één), daarna zijn de tellers gereset. Vervolgens 70 scrollstappen door alle zes hoofdstukgrenzen, volledig binnen de zichtbare scène. Geen meetcode toegevoegd aan de productiecomponenten.

| Gemeten componenten | Donker | Licht |
| --- | ---: | ---: |
| CelCanvas + CelScene + CelModel + DnaHelix | **0** | **0** |
| LowiCelPagina: DOM-indicator | 6 | 6 |
| HoofdstukSectie: alle zeven instanties samen | 175 | 196 |
| SessionInsightProvider: tracking | 19 | 22 |
| Totaal getelde DOM-/tracking-componentrenders | **200** | **224** |

Donkere meting: 7.984,5 ms en 70 scroll-rAF-callbacks. Lichte meting: 10.976,6 ms en 82 scroll-rAF-callbacks. Maximaal één uitstaande scroll-rAF in beide runs. De aantallen trackingupdates zijn afhankelijk van verblijfsduur en scheduling; dit zijn gemeten aantallen uit deze runs. Hoofdstukrenders ontvangen zowel pagina- als trackingupdates en zijn daarom gezamenlijk geteld. Deze tabel telt componentrenders, geen unieke React-commits en geen GPU-tekenframes. De GPU tekent uiteraard wel door om te interpoleren.

**B6 — regressies**

- [Mobiele artikeltak](artikel-mobiel.png), [zonder WebGL](artikel-zonder-webgl.png), [reduced motion](reduced-motion.png): zeven hoofdstukken, nul canvassen, nul uitstaande scrollframes, geen horizontale overflow. Ook het live omschakelen naar reduced motion en terug is gecontroleerd.
- Productiehydratatie gemeten door externe scripts te pauzeren, de server-HTML te meten, scripts te hervatten en op het canvas te wachten. Vóór en na: titelbovenkant 340,28125 px, eerste hoofdstukbovenkant 900 px, hoofdstukhoogte 900 px. Geen hydratatiefout of positiesprong bij het mounten van de desktopscène. [Ruwe meting](hydratatie-meting.json).
- Bij omschakelen van desktop naar mobiel ontvingen alle **36/36** eigen resources hun dispose-event; de WebGL-context was daarna verloren en de canvasnode verwijderd. Een themawissel behoudt hetzelfde canvas. [Dispose-meting](dispose-meting.json).

**Build, bundel en tests**

`npx tsc --noEmit`: geslaagd. `npm run build`: geslaagd, inclusief Google Fonts; buildoutput toont `○ /lowi`, tevens aanwezig in `prerender-manifest.json`. Gerichte ESLint-controle: geslaagd.

Bundelmeting: som van unieke productie-JavaScript-chunks, 1 kB = 1.000 bytes. De nulmeting is Fase 2 plus de drie goedgekeurde correcties, vóór het 3D-canvas. Initiële scripts komen uit de statische HTML; de lazy scripts zijn daadwerkelijk via de productiepagina geladen. Gzip is lokaal per chunk berekend, niet gelijkgesteld aan een gemeten netwerktransfer met andere compressie. HTML, CSS en fonts zijn niet meegerekend.

| JavaScript | Vóór | Na | Groei |
| --- | ---: | ---: | ---: |
| Initieel, kB | 689,44 | 693,30 | +3,86 |
| Initieel, gzip kB | 205,49 | 206,55 | +1,05 |
| Desktop inclusief lazy 3D, kB | 689,44 | 1.601,72 | **+912,29** |
| Desktop inclusief lazy 3D, gzip kB | 205,49 | 447,44 | **+241,95** |

De twee lazy chunks zijn samen 908,43 kB / 240,89 kB gzip. [Alle chunkgroottes](bundel-meting.json), [productiebeeld](productie-grens.png), [productie-eindstaat](productie-groei.png).

`npm test`: 8 bestanden, 50 tests; 7 bestanden geslaagd, 1 bestand gefaald; **49 tests geslaagd, 1 gefaald**. De vijf oorspronkelijke interpolatietests, twee nieuwe beginpalettests en bijgewerkte trackValidation-tests slagen. De enige fout blijft:

```text
FAIL lib/ai/answers.test.ts > pre-authored answers > keeps pre-authored sources inside the retrieved top-k for their question
AssertionError: ai-enabled-systems-fit should retrieve skill-functional-analysis; got system-about-me, skill-ai, project-jarvis, system-lowi-intro, skill-data: expected [ 'system-about-me', 'skill-ai', …(3) ] to include 'skill-functional-analysis'
```

Homepage, JarvisAsk en deze AI-test zijn niet gewijzigd. NidusCta bevat uitsluitend de eerder goedgekeurde typenaamcorrectie. Er is niets gecommit of gepusht. Fase 4 is niet begonnen.
