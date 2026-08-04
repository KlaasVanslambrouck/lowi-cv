# Linguix — Beoordelingswijzer, voorbeeldteksten & API-contract (v1)

**Addendum bij** `linguix-case-inhoud-v1.md`, blok 5 (demo schrijfscorer).

Dit document bevat alles wat de schrijfscorer nodig heeft: de examentaak, de beoordelingswijzer, de beslisregels, twee kandidaatteksten en het exacte antwoordcontract van de endpoint.

**Belangrijk voor de presentatie**: deze beoordelingswijzer is door mij opgesteld, niet door de klant. Zeg dat ook. Een echte beoordelingswijzer is een gevalideerd instrument dat de klant al heeft — het punt van de demo is dat het systeem *een* beoordelingswijzer trouw en aantoonbaar toepast, niet dat deze specifieke wijzer correct is.

---

## 1. De examentaak

**Niveau**: ERK B1 — schrijfvaardigheid
**Type**: functionele e-mail met drie deelopdrachten
**Richtlengte**: 120–180 woorden
**Tijd**: 30 minuten

**Opdracht zoals de kandidaat ze krijgt**:

> U heeft zich ingeschreven voor een cursus Nederlands die start op 3 september. U kan niet aanwezig zijn op de eerste lesdag.
>
> Schrijf een e-mail aan het secretariaat van de school. Zorg dat u de volgende drie dingen doet:
>
> 1. Leg uit waarom u niet aanwezig kan zijn.
> 2. Vraag of u op een later moment kan starten.
> 3. Vraag wat er met uw inschrijvingsgeld gebeurt.
>
> Schrijf 120 tot 180 woorden. Gebruik een gepaste aanspreking en afsluiting.

De drie deelopdrachten zijn bewust expliciet genummerd — dat is standaard bij gestandaardiseerde NT2-toetsing en het maakt het criterium taakvervulling objectief controleerbaar.

---

## 2. Beoordelingswijzer

Vijf criteria, elk gescoord van 0 tot 4. Gewichten tellen op tot 100%.

| # | Criterium | Sleutel | Gewicht |
|---|---|---|---|
| 1 | Taakvervulling & inhoud | `taakvervulling` | 30% |
| 2 | Samenhang & structuur | `samenhang` | 20% |
| 3 | Woordenschat & register | `woordenschat` | 20% |
| 4 | Grammaticale correctheid | `grammatica` | 20% |
| 5 | Spelling & interpunctie | `spelling` | 10% |

### 2.1 Descriptoren

**1. Taakvervulling & inhoud** *(30%)*
- **4** — Alle drie de deelopdrachten volledig en ondubbelzinnig uitgevoerd. De lezer kan zonder navraag handelen.
- **3** — Alle drie uitgevoerd, één ervan summier of impliciet. De lezer kan handelen, mogelijk met kleine aanname.
- **2** — Twee deelopdrachten uitgevoerd, de derde slechts aangeraakt of enkel geïmpliceerd. De lezer moet navraag doen.
- **1** — Eén deelopdracht uitgevoerd, de rest ontbreekt of blijft onduidelijk.
- **0** — De tekst beantwoordt de opdracht niet.

**2. Samenhang & structuur** *(20%)*
- **4** — Duidelijke opbouw met alinea's die elk één functie hebben; verbindingswoorden correct en gevarieerd.
- **3** — Herkenbare opbouw; verbindingswoorden aanwezig maar beperkt in variatie of soms onnauwkeurig.
- **2** — Enige ordening zichtbaar, maar de tekst leunt op opeenstapeling; alineastructuur zwak of afwezig; lange aaneengeregen zinnen.
- **1** — Nauwelijks ordening; de lezer moet zelf de structuur reconstrueren.
- **0** — Geen samenhang.

**3. Woordenschat & register** *(20%)*
- **4** — Ruim en precies bereik voor het niveau; register consequent gepast bij een formele e-mail; aanspreking en afsluiting correct.
- **3** — Toereikend bereik; enkele onnauwkeurigheden of herhalingen; register overwegend gepast.
- **2** — Beperkt bereik met merkbare herhaling, óf voldoende bereik met duidelijke registerbreuken (formeel begin dat vervalt in informeel taalgebruik).
- **1** — Sterk beperkt bereik; register overwegend ongepast.
- **0** — Ontoereikend.

**4. Grammaticale correctheid** *(20%)*
- **4** — Basisstructuren betrouwbaar beheerst; fouten zijn incidenteel en hinderen het begrip niet.
- **3** — Regelmatige fouten in complexere structuren (bijzinsvolgorde, werkwoordelijke eindgroep), maar het begrip blijft intact.
- **2** — Frequente fouten, ook in basisstructuren; het begrip wordt hier en daar vertraagd maar niet geblokkeerd.
- **1** — Fouten hinderen het begrip herhaaldelijk.
- **0** — Onbegrijpelijk.

**5. Spelling & interpunctie** *(10%)*
- **4** — Overwegend correct; incidentele fouten.
- **3** — Regelmatige fouten die het lezen niet hinderen.
- **2** — Frequente fouten; interpunctie onregelmatig of grotendeels afwezig.
- **1** — Spelling en interpunctie hinderen het lezen.
- **0** — Onbruikbaar.

### 2.2 Beslisregels

**Gewogen score**
```
gewogenScore = 0,30 × taakvervulling
             + 0,20 × samenhang
             + 0,20 × woordenschat
             + 0,20 × grammatica
             + 0,10 × spelling
```

**Slaaggrens**: `gewogenScore ≥ 2,5`

**Harde ondergrens (dekkingsregel)**: ongeacht de gewogen score is een kandidaat **niet geslaagd** wanneer `taakvervulling < 2`. Wie een deelopdracht volledig overslaat, kan dat niet compenseren met taalbeheersing op de andere criteria.

Deze regel is inhoudelijk verdedigbaar én demonstratief nuttig: ze toont dat een beoordelingswijzer méér is dan een gewogen gemiddelde, en dat het systeem samengestelde regels kan volgen in plaats van enkel te scoren.

---

## 3. Escalatieregels

Het systeem geeft **altijd** een score, maar markeert `menselijkeReviewVereist: true` wanneer minstens één van deze codes van toepassing is.

| Code | Voorwaarde | Motivering |
|---|---|---|
| `ONZEKERHEIDSMARGE` | `2,2 ≤ gewogenScore ≤ 2,8` | De score ligt binnen de onzekerheidsband rond de slaaggrens. Bij een test met civiel effect wordt die beslissing niet automatisch genomen. |
| `SPREIDING` | verschil tussen hoogste en laagste criteriumscore ≥ 2 | Een sterk ongelijk profiel (bv. rijk lexicon, zwakke structuur) is precies het geval waarin menselijke beoordelaars legitiem van elkaar verschillen. Analytische scoring is daar het minst betrouwbaar. |
| `LENGTE_BUITEN_BEREIK` | < 90 of > 220 woorden | Buiten het bereik waarop de wijzer gekalibreerd is. |
| `DEKKINGSREGEL_GERAAKT` | `taakvervulling ≤ 2` | De uitkomst hangt aan één criterium in plaats van aan het geheel. |
| `CRITERIUM_NIET_TOEPASBAAR` | een criterium kan niet betrouwbaar beoordeeld worden | Het model rapporteert eerlijk dat de wijzer hier niet past, in plaats van te gokken. |

**Confidence** is geen modelkans maar een afgeleide indicator, en dat moet je ook zo zeggen als Simon erop doorvraagt:

```
confidence = 1 − (aantal geraakte escalatiecodes / totaal aantal codes)
             × correctie voor afstand tot de slaaggrens
```

Eenvoudige, uitlegbare formule. Een confidence die uit het taalmodel zelf komt, is bij een hoog-risicosysteem niet auditeerbaar — een confidence die uit expliciete regels volgt wél. Dat onderscheid is op zich een goed antwoord op een kritische vraag.

---

## 4. Voorbeeldtekst 1 — helder geval

**Kandidaat**: A. Haddad — **Woorden**: 158

```
Geachte mevrouw, meneer,

Ik heb mij ingeschreven voor de cursus Nederlands die op 3 september
begint. Mijn naam is Amina Haddad en mijn inschrijvingsnummer is 24-1187.

Helaas kan ik niet aanwezig zijn op de eerste lesdag. Mijn moeder in
Marokko is ziek geworden, omdat ik moet naar haar toe gaan. Ik blijf
ongeveer drie weken weg.

Daarom wil ik vragen of het mogelijk is om later te beginnen. Kan ik
misschien in oktober starten met een andere groep? Ik wil de cursus
echt graag volgen, want ik heb het Nederlands nodig voor mijn werk.

Ik heb ook een vraag over de inschrijvingsgeld. Ik heb al 60 euro
betaald. Krijg ik dit geld terug, of kan ik het gebruiken voor de
nieuwe cursus?

Alvast bedankt voor uw antwoord.

Met vriendelijke groeten,
Amina Haddad
```

### Verwachte beoordeling

| Criterium | Score | Onderbouwing |
|---|---|---|
| Taakvervulling | 4 | Alle drie de deelopdrachten expliciet en handelbaar |
| Samenhang | 3 | Vier duidelijke alinea's, elk met eigen functie; verbindingswoorden aanwezig maar beperkt gevarieerd |
| Woordenschat | 3 | Toereikend en gepast; register consequent formeel |
| Grammatica | 3 | Bijzinsvolgorde faalt in "omdat ik moet naar haar toe gaan"; verkeerd voegwoord ("omdat" waar "en" of "daarom" hoort) |
| Spelling | 4 | Alleen "de inschrijvingsgeld" (lidwoordfout, telt hier onder grammatica/spelling-grens) |

```
gewogenScore = 0,30×4 + 0,20×3 + 0,20×3 + 0,20×3 + 0,10×4
             = 1,20 + 0,60 + 0,60 + 0,60 + 0,40
             = 3,40
```

**Escalatiecodes**: geen. Spreiding = 1 (4 − 3). Score ver boven de onzekerheidsband.
**Uitkomst**: geslaagd, `menselijkeReviewVereist: false`, confidence hoog.

---

## 5. Voorbeeldtekst 2 — twijfelgeval

**Kandidaat**: S. Kovács — **Woorden**: 132

```
Geachte,

Ik schrijf u omdat ik heb een probleem met de cursus. Ik ben
ingeschreven maar op 3 september ik kan niet komen want mijn moeder is
ernstig ziek in Marokko en de situatie is heel ingewikkeld en dringend,
ik moet dringend vertrekken en ik weet niet precies wanneer ik terugkom
misschien drie weken misschien langer het hangt af van de
omstandigheden en de dokters daar zeggen niks duidelijk over de
prognose. Ik vind dit bijzonder spijtig want ik ben zeer gemotiveerd om
Nederlands te leren, ik heb al veel geïnvesteerd in mijn opleiding en
ik heb ook het inschrijvingsgeld al betaald. Ok dus laat me weten wat
kan.

Groetjes,
S. Kovács
```

### Verwachte beoordeling

| Criterium | Score | Onderbouwing |
|---|---|---|
| Taakvervulling | 2 | Deelopdracht 1 (reden) volledig. Deelopdracht 2 (later starten) niet gesteld, enkel geïmpliceerd in "laat me weten wat kan". Deelopdracht 3 (inschrijvingsgeld) wordt *vermeld* maar er wordt geen vraag over gesteld — het secretariaat kan hierop niet handelen |
| Samenhang | 2 | Eén doorlopende aaneenschakeling zonder alineastructuur; nevenschikking met "en" als enige ordeningsmiddel |
| Woordenschat | 4 | "ernstig", "ingewikkeld", "omstandigheden", "prognose", "geïnvesteerd", "gemotiveerd" — bereik boven het verwachte niveau. Wel één harde registerbreuk op het einde |
| Grammatica | 2 | "ik heb een probleem" na "omdat" (V2 in bijzin); "op 3 september ik kan niet komen" (inversie ontbreekt); "laat me weten wat kan" (onvolledige bijzin) |
| Spelling | 3 | Spelling correct, interpunctie grotendeels afwezig |

```
gewogenScore = 0,30×2 + 0,20×2 + 0,20×4 + 0,20×2 + 0,10×3
             = 0,60 + 0,40 + 0,80 + 0,40 + 0,30
             = 2,50
```

**Escalatiecodes**: drie, onafhankelijk van elkaar.
- `ONZEKERHEIDSMARGE` — 2,50 ligt exact op de slaaggrens, midden in de band 2,2–2,8
- `SPREIDING` — verschil van 2 tussen woordenschat (4) en taakvervulling/samenhang/grammatica (2)
- `DEKKINGSREGEL_GERAAKT` — taakvervulling = 2

**Uitkomst**: `voorlopigOordeel: "onbeslist"`, `menselijkeReviewVereist: true`, confidence laag.

**Waarom dit het juiste demovoorbeeld is**: het is geen geconstrueerd randgeval. Een kandidaat met sterk lexicon en zwakke structuur is een reëel en frequent profiel, en het is precies het profiel waarover menselijke beoordelaars het oneens zijn — de ene ziet taalvermogen, de andere ziet een tekst waarop het secretariaat niet kan handelen. Dat het systeem die onenigheid *voorspelt* in plaats van ze te overschrijven, is het hele argument van de presentatie in één scherm.

**Wat je hierbij zegt**:

> Deze tekst haalt exact 2,50. De grens ligt op 2,50. Een systeem dat hier "geslaagd" antwoordt, is niet nauwkeurig — het is roekeloos. Wat u hier ziet is het systeem dat zegt: ik heb een score, en ik geef ze niet als eindoordeel.

---

## 6. API-contract

**Endpoint**: `POST /api/portfolio/linguix/score` (nidus-api, compute-only, publiek, geen persistentie)

### Request — camelCase, conform de conventie voor compute-only endpoints

```json
{
  "taakId": "b1-email-cursusuitstel",
  "kandidaatTekst": "Geachte mevrouw, meneer, ...",
  "beoordelingswijzerId": "nt2-b1-schrijven-v1"
}
```

### Response

```json
{
  "taakId": "b1-email-cursusuitstel",
  "aantalWoorden": 132,
  "criteria": [
    {
      "sleutel": "taakvervulling",
      "label": "Taakvervulling & inhoud",
      "score": 2,
      "maxScore": 4,
      "gewicht": 0.30,
      "motivering": "Deelopdracht 1 is volledig uitgevoerd. Deelopdracht 3 wordt vermeld maar niet als vraag gesteld, waardoor het secretariaat er niet op kan handelen.",
      "bewijs": [
        {
          "fragment": "mijn moeder is ernstig ziek in Marokko",
          "toelichting": "Deelopdracht 1 — reden, expliciet en voldoende."
        },
        {
          "fragment": "ik heb ook het inschrijvingsgeld al betaald",
          "toelichting": "Deelopdracht 3 — enkel vaststelling, geen vraag."
        }
      ]
    }
  ],
  "gewogenScore": 2.5,
  "slaaggrens": 2.5,
  "voorlopigOordeel": "onbeslist",
  "confidence": 0.34,
  "menselijkeReviewVereist": true,
  "escalatieRedenen": [
    {
      "code": "ONZEKERHEIDSMARGE",
      "toelichting": "Gewogen score 2,50 ligt binnen de onzekerheidsband 2,20–2,80 rond de slaaggrens."
    },
    {
      "code": "SPREIDING",
      "toelichting": "Verschil van 2 punten tussen het hoogste en het laagste criterium."
    },
    {
      "code": "DEKKINGSREGEL_GERAAKT",
      "toelichting": "Taakvervulling scoort 2; de uitkomst hangt aan één criterium."
    }
  ]
}
```

`voorlopigOordeel` ∈ `"geslaagd"` | `"nietGeslaagd"` | `"onbeslist"`.

### Implementatienota's voor de bouwprompt

- **Forced tool use** voor gestructureerde uitvoer, hetzelfde patroon als `portfolioJarvis.ts`. Geen JSON uit vrije tekst parsen.
- **Het model scoort de criteria; de code berekent de rest.** `gewogenScore`, `voorlopigOordeel`, `confidence` en de escalatiecodes worden deterministisch in TypeScript afgeleid uit de criteriumscores. Dat is geen implementatiedetail maar een demonstreerbaar argument: de beslislogica van een hoog-risicosysteem hoort auditeerbaar te zijn, niet in een prompt te zitten.
- **Bewijsspans moeten letterlijk in de kandidaattekst voorkomen.** Verifieer met een substring-check en verwerp fragmenten die niet matchen — dat is een goedkope hallucinatiebeveiliging en een sterk punt om te vermelden.
- Rate limiting op de endpoint, want de pagina staat publiek.
- Beide voorbeeldteksten voorgeladen in de UI als knoppen, met een vrij invoerveld ernaast zodat Simon zelf iets kan intypen. Dat laatste is riskant maar overtuigend — de scorer moet ook op onbekende invoer redelijk blijven.

---

## 7. Openstaande punten

- [ ] Aantal dagen tot het gesprek — bepaalt of de spreekagent in scope blijft (eerste om te schrappen)
- [ ] Beslissen of het vrije invoerveld in de demo zit (aanbevolen: ja)
- [ ] Naam van de fictieve kandidaten controleren op onbedoelde associaties

---

*v1 — ter review. Na goedkeuring volgen de bouwprompts per repo.*