# LOWI — instrumentvenster

De scène heeft een vast donker kader, een nieuwe camerareis, veel meer ruimtelijke lagen en afzonderlijke materiaalkarakters. De scrollarchitectuur en de twee interpolatielagen zijn behouden. [Open de screenshotgalerij](index.html).

## Wat is veranderd

- Het instrument heeft achtergrond `#05060a`, een marge van 1rem, een zichtbare warme rand en afgeronde hoeken. De hoofdstukken hebben lokaal lichte tekst en een donker tekstvlak. Intro, slot en footer volgen het paginathema. Het intro is op desktop korter, zodat het eerste instrumentbeeld direct zichtbaar is.
- De camera begint vlak boven het membraan. In hoofdstuk 2 gaat hij via een afzonderlijk onthullingspunt naar binnen. FOV, kijkpunt, focuspunt en focusbereik bewegen mee met smoothstep en vervolgens delta-afhankelijke demping. Demping is 10, met een tijdconstante van 100 ms. Langzame sinusdrift blijft ook bij stilstaande scroll bestaan.
- Eén vast palet vervangt beide themapaletten. `useTheme()` en de kleurinterpolatie zijn volledig uit de scène verwijderd. De vaste rolkleuren in de werkstaat veranderen niet tijdens scroll of themawissel.
- 2.600 instanced ribosomen, 180 variabel geschaalde blaasjes, 46 dunne filamenten en 4.200 instanced additieve deeltjes geven diepte. Vier ruisbillboards en warme exponentiële fog vormen het medium. Geen raymarching of externe beeldassets.
- Het membraan is een niet-uniform geschaalde, met meerlagige ruis vervormde icosphere met Fresnel-rand. De kern heeft twee dichtere schillen en een andere alpha-verdeling. De mitochondriën hebben een relatief dichte wand met negen emissieve interne plooien. Het Golgi-apparaat heeft zeven lamellen. Oppervlakruis en laagfrequente beweging vervangen gladde, statische vormen.
- DOF volgt het actieve organel; het focusbereik verschilt tussen macro en totaalbeeld. Bloom heeft drempel 1,3 en intensiteit 0,12. Vignette en zachte filmruis blijven terughoudend. DPR is begrensd op 1–1,25; DOF werkt op halve resolutie. Na opwarming wordt per drie seconden gemeten: onder 35 fps verdwijnt eerst bloom, daarna eventueel DOF onder 24 fps. Dit gebeurt zonder React-stateupdates. Een lange eerste shadercompilatie telt niet als een volledige opwarmperiode.
- De eigen effectpassen worden expliciet opgeruimd, ook nadat de composer-wrapper ze heeft verwijderd. Ongebruikte instellingen zijn verwijderd.

Alle afstemwaarden staan in [celInstellingen.ts](../../components/lowi-cel/celInstellingen.ts); de camera-eindpunten staan in het contentbestand. [Volledige inhoud van palet, interpolatiehook en instellingen](bronbestanden.md).

## Definitieve camera en palet

| Positie | Camera XYZ | Kijkpunt XYZ | FOV |
|---|---|---|---:|
| Intro | 0.04, 0.955, 0.1 | 0.32, 0.77, 0.14 | 82° |
| 1 Grens | 0.26, 0.913, 0.21 | 0.5, 0.7, 0.27 | 78° |
| Onthulling: 44% binnen overgang 2 | 0.25, 0.28, 3.8 | 0, 0, 0 | 45° |
| 2 Werkvloer | 0.22, 0.08, 0.84 | 0, 0, 0 | 75° |
| 3 Code | 0.14, 0.06, 0.74 | 0, 0, 0 | 70° |
| 4 Bouwen | 0.58, 0.33, 0.64 | 0.4, 0.2, 0.36 | 74° |
| 5 Brandstof | -0.23, -0.03, 0.59 | -0.45, -0.12, 0.22 | 64° |
| 6 Verfijnen | 0.65, -0.6, 0.53 | 0.43, -0.38, 0.05 | 60° |
| 7 Groei | 0.12, 0.38, 5.2 | 0, 0, 0 | 38° |

De Golgi-camera is tijdens visuele controle lager gezet: het eerdere hoge standpunt maskeerde de losse schijven. Alleen `cameraPositie`, `kijkNaar`, het nieuwe `fov`-veld en de bijbehorende technische comments zijn in het contentbestand gewijzigd. Alle teksten en andere visuele velden zijn gelijk gebleven.

| Rol | Kleur |
|---|---|
| Achtergrond | `#05060a` |
| Weefsel en medium | `#c08a63` |
| Mitochondriale binnenkant | `#e0913c` |
| Spaarzame blaasjes | `#9e3341` |
| Kern en DNA | `#6f6ce0` |

Het paletbestand bevat de regel dat hoogstens twee accenten tegelijk fel mogen zijn. Fijne deeltjes en filamenten gebruiken een ontzadigde afleiding van het weefsel.

## Visuele beoordeling

| Controle | Bevinding en beeld |
|---|---|
| Eerste beeld | Het membraan vult de onderkant als een landschap; de hele cel is niet zichtbaar. De contour heeft nog een hoekig karakter. [Intro](intro.png), [grens](1-grens.png). |
| Onthulling en doorsnede | Het terugtrekpunt toont de hele cel. Daarna gaat de camera naar binnen; de opening wordt continu gemengd. De grenzen en het tussenpunt hebben geen sprong in camera/FOV. [Onthulling](onthulling.png), [werkvloer](2-werkvloer.png). |
| Kern en DNA | DNA blijft zichtbaar door de kernschillen. Opgerolde en uitgestrekte curven verschillen werkelijk van vorm; het is geen schaalanimatie. [Code](3-code.png). |
| Ribosomen | De dichte zone vult het macrobeeld. Voorgrondkorrels kunnen elkaar overlappen; die dichtheid is bewust behouden. [Bouwen](4-bouwen.png). |
| Mitochondriën | De interne plooien zijn op deze afstand afzonderlijk herkenbaar. Het amber is duidelijk helderder dan de wand. [Brandstof](5-brandstof.png). |
| Golgi | De nieuwe zijpositie toont de zeven gestapelde lamellen. [Verfijnen](6-verfijnen.png). |
| Deling | Twee afzonderlijke dochtervormen, zonder verbindende membraan- of DNA-geometrie. Het tekstvlak bedekt een deel van de linker dochter. [Groei](7-groei.png). |
| Aandacht | Camera en, wanneer ingeschakeld, focus sturen naar het onderwerp; overige organellen worden slechts 10% gedimd. Bij automatisch uitgeschakelde DOF vervalt die extra scherptegeleiding. |
| Tekst | De lichte hoofdstuktekst blijft leesbaar boven het donkere tekstvlak, ook in het lichte paginathema. [Lichte pagina](lichte-pagina.png). |
| Themawissel | Dezelfde canvasinstantie blijft bestaan, zonder contextverlies; alle rolkleuren zijn exact gelijk. Geen waargenomen kleurflits. [Themawissel bij code](themawissel-code.png), [metingen](thema-meting.json). |

De hoekige macrocontour, warme tint, zeer dichte ribosoomzone en regelmatige Golgi-lamellen zijn visuele observaties voor de beoordeling; de screenshots maken die keuzes zichtbaar. Dit resultaat is geen fotografische microscoopopname.

Van de drie mediumtechnieken geven **de fijne deeltjes het meeste gevoel van diepte en beweging**, vooral door parallax en verschillen in scherpte. De billboards geven de grootste zachte waas in een stilstaand beeld; de donkere fog is het subtielst. De galerij bevat dezelfde positie met elke techniek afzonderlijk uitgeschakeld. Deze vergelijking is kwalitatief: beweging liep door tussen de opnames.

## Gemeten prestaties en renders

Development, headless Chromium met echte Intel Graphics via ANGLE/Direct3D11, viewport 1440×900, DPR 1. Na opwarming is 18,0171 seconden continu van grens naar groei gescrold. Een tijdelijke subscriber in de R3F-framecyclus telde **635 echte scèneframes: 35,24 fps**. De onafhankelijke browser-rAF-teller gaf 35,19 fps; die is niet gebruikt als vervanger van scèneframes. Browser-frame-intervallen: mediaan 33,2 ms, p95 50 ms. Dit is één lokale meting, geen garantie voor andere GPU's of DPR 1,25.

**DOF bleef in deze scrollmeting ingeschakeld; bloom werd uitgeschakeld.** In de afzonderlijke koude hoofdstukscreenshotrun schakelde de adaptatie ook DOF uit. De hoofdstukscreenshots tonen dus die lichtere effectconfiguratie. Dat verschil wordt niet verborgen: [framegegevens](prestatie-meting.json) en [effectstatus per screenshot](eerste-controle.json).

De grootste gemeten afstand tussen camera-doel en gedempte camera was 0,477 wereldeenheid tijdens de doorlopende reis. De 100 ms tijdconstante voorkomt een langdurige inhaalbeweging, maar de gewenste demping heeft vanzelf een kleine vertraging.

React is gemeten via de development DevTools-commit-hook van beide renderers, met `PerformedWork` en uitsluiting van opnieuw gebruikte fibers. Tellers zijn na de mount en vóór de scroll gereset:

- **3D-componentrenders: 0** voor CelCanvas, CelScene, CelModel, DnaHelix, CelMedium en CelEffecten.
- **Pagina/indicator: 5** renders van LowiCelPagina binnen het meetinterval.
- **Trackingcontext: 32** renders van SessionInsightProvider.
- **Hoofdstukcomponenten: 259** renders in totaal: zeven hoofdstukken maal de 37 genoemde ouderupdates. Dit zijn geen 259 extra onafhankelijke scrollupdates.

De laatste asynchrone update na het meetinterval valt buiten deze telling. De telling betreft React-her-renders; de GPU rendert vanzelf wel ieder scèneframe.

## Verificatie en regressies

- `npx tsc --noEmit`: geslaagd.
- `npm run build`: geslaagd, inclusief Google Fonts; `/lowi` staat als `○` in het buildrapport en in het prerender-manifest.
- Gerichte ESLint-controle op LOWI-componenten, content en scrollhook: geslaagd.
- Volledige testsuite: **49 geslaagd, 1 bekend falend**, in acht testbestanden. Alle zeven interpolatietests en alle analyticsvalidatietests slagen.
- De bekende, ongewijzigde fout in `lib/ai/answers.test.ts:40`: `ai-enabled-systems-fit should retrieve skill-functional-analysis; got system-about-me, skill-ai, project-jarvis, system-lowi-intro, skill-data`.
- Mobiel, reduced motion en geen WebGL: ieder zeven hoofdstukken, nul canvassen, nul geplande scrollframes en geen horizontale overflow. [Fallbackmetingen](regressie-meting.json), screenshots in de galerij.
- Hydratatie: H1-top vóór/na 102,6875 px; eerste hoofdstuk vóór/na 324 px; hoofdstukhoogte vóór/na 900 px. Geen sprong of browserfout. [Meting](hydratatie-meting.json).
- Unmount: alle 53 gecontroleerde geometrieën/materialen/instanced resources hebben een dispose-event; de drie eigen effectpassen worden opgeruimd en de WebGL-context wordt vrijgegeven. [Meting](dispose-meting.json).

`useScrollVoortgang.ts` en `LowiCelPagina.tsx` zijn byte voor byte gelijk aan de snapshots van vóór deze E-opdracht. De artikel- en reduced-motion-takken zijn niet aangepast; de nieuwe CSS is beperkt tot de scroll-/wachtweergave op desktop zonder reduced motion. Homepage, JarvisAsk, analytics en de falende AI-test zijn in deze opdracht ongemoeid gebleven. De al aanwezige working-treewijzigingen uit eerdere fasen zijn behouden.

## Bundelgroei

Ten opzichte van de opgeslagen Fase 3-build v??r deze E-opdracht. kB is hier 1.000 bytes; gzip is per bestand berekend. HTML-scriptreferenties worden eenmaal geteld, plus de werkelijk geladen lazy sc?nechunks. Dezelfde methode en baseline zijn gebruikt voor beide builds; dit is bundelomvang, geen gemeten HTTP-overdracht.

| JavaScript | Voorheen gzip | Nu gzip | Groei gzip | Groei ongecomprimeerd |
|---|---:|---:|---:|---:|
| Initi?le routechunks | 206,548 kB | 206,675 kB | +0,127 kB | +0,165 kB |
| Lazy sc?nechunks | 240,892 kB | 415,772 kB | +174,880 kB | +385,799 kB |
| Totaal met 3D | 447,440 kB | 622,447 kB | **+175,007 kB** | **+385,964 kB** |

De groei zit vrijwel volledig in de lazy 3D/postprocessingcode. Alle drie fallbackruns laden **nul** van deze sc?nechunks: geen geometrie?n, DOF, bloom of GPU-sc?ne voor artikel/reduced motion. De minieme groei van de gedeelde initi?le content blijft wel bestaan. /lowi blijft statisch. [Chunklijst en baseline](bundel-meting.json).

## Compatibiliteit

De packages stonden al geïnstalleerd; er is niets toegevoegd of geüpgraded. Gebruikt: `@react-three/postprocessing` **3.0.4** en `postprocessing` **6.39.2**. De lokale peer-ranges zijn gecontroleerd: wrapper React `^19.0`, Fiber `^9.0.0`, Three `>=0.156`; postprocessing Three `>=0.168 <0.186`. React **19.2.7**, Fiber **9.6.1** en Three **0.185.1** vallen daarbinnen. Zie ook de officiële [wrapper-releases](https://github.com/pmndrs/react-postprocessing/releases) en [postprocessing 6.39.2](https://github.com/pmndrs/postprocessing/releases/tag/v6.39.2).

Er is niets gecommit of gepusht.
