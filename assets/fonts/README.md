# Fonts voor Open Graph-afbeeldingen

Deze bestanden worden enkel gebruikt door `next/og` (`ImageResponse`) in de
`opengraph-image.tsx`-routes. De site zelf laadt haar fonts via `next/font/google`
in `app/layout.tsx`. `ImageResponse` ondersteunt alleen `ttf`, `otf` en `woff`
(geen `woff2`) en gebruikt van een variabel font enkel de standaardinstantie;
daarom staan hier statische TTF-instanties.

Families en gewichten volgen exact wat de site gebruikt:

| Bestand | Gebruik op de site | Bron (google/fonts, vastgezet op commit) | Bewerking |
|---|---|---|---|
| `Fraunces-Medium.ttf` | koppen `h1–h4` (`font-weight: 500`) | [`ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` @ `ac502d8`](https://raw.githubusercontent.com/google/fonts/ac502d8eff76ef4d9477cdcc8ef7d0c84fde5372/ofl/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf) | instantie `wght=500 opsz=14 SOFT=0 WONK=0` |
| `DMSans-Regular.ttf` | lopende tekst (`body`, 400) | [`ofl/dmsans/DMSans[opsz,wght].ttf` @ `db50662`](https://raw.githubusercontent.com/google/fonts/db50662ac42c361aa77afeef89ae2e6e2298e2ab/ofl/dmsans/DMSans%5Bopsz,wght%5D.ttf) | instantie `wght=400 opsz=14` |
| `DMMono-Medium.ttf` | labels (`font-weight: 500`) | [`ofl/dmmono/DMMono-Medium.ttf` @ `85f32a0`](https://raw.githubusercontent.com/google/fonts/85f32a0254c400b643d7ce589b91a2ad29bea73b/ofl/dmmono/DMMono-Medium.ttf) | geen (al statisch) |

`opsz=14`, `SOFT=0` en `WONK=0` zijn de standaardwaarden die `next/font/google`
vastzet wanneer alleen de `wght`-as geladen wordt (zie `font-data.json` in
`next/dist/compiled/@next/font`).

## Opnieuw genereren

Instanties gemaakt met fontTools 4.65.0 (niet als projectdependency):

```powershell
python -m pip install fonttools
python -m fontTools.varLib.instancer "Fraunces[SOFT,WONK,opsz,wght].ttf" wght=500 opsz=14 SOFT=0 WONK=0 -o Fraunces-Medium.ttf
python -m fontTools.varLib.instancer "DMSans[opsz,wght].ttf" wght=400 opsz=14 --update-name-table -o DMSans-Regular.ttf
```

Bij Fraunces is `--update-name-table` weggelaten: de STAT-tabel van het bronbestand
bevat geen axis value voor `opsz=14`. De interne naam blijft daardoor
"Fraunces Regular"; dat heeft geen invloed op de glyphvormen of op `ImageResponse`
(die krijgt naam en gewicht expliciet mee).

## SHA-256

```
ec0a13772097548a032c9cbf47c015469156f6743b16b30872b70cbf2e001df1  Fraunces-Medium.ttf
7fa07c83dc95b9caf6972b6964903a028fffa007234ac09698032f45b3cc804c  DMSans-Regular.ttf
fd327daf461db87b44a87def475d251bf03b997f7c07d9680592d75dbbfaad0b  DMMono-Medium.ttf
```

## Licentie

Alle drie de families vallen onder de SIL Open Font License 1.1. Elke familie heeft
een eigen copyrightregel; de licentieteksten staan in `OFL-Fraunces.txt`,
`OFL-DMSans.txt` en `OFL-DMMono.txt` (gedownload uit dezelfde google/fonts-mappen).
