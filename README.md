# LOWI CV

Publieke CV/portfolio-pagina van Klaas Van Slambrouck — een interactieve, tweetalige (NL/EN) one-pager met een 3D-architectuurvisualisatie van het LOWI-platform.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- CSS Modules (geen Tailwind)
- [Three.js](https://threejs.org) via `@react-three/fiber`, `@react-three/drei` en `@react-three/postprocessing`
- Fonts: Fraunces, DM Sans en DM Mono via `next/font`

## Lokaal draaien

```bash
npm install
cp .env.local.example .env.local   # env-vars invullen (mogen voorlopig leeg blijven)
npm run dev
```

De site draait daarna op [http://localhost:3000](http://localhost:3000).

> **Opmerking:** deze fase gebruikt uitsluitend placeholder-content uit
> `content/placeholderContent.ts`. De koppeling met Supabase en de nidus-api
> (live stats, Jarvis-chat) volgt in een latere stap.

---

## English

**LOWI CV** is the public CV/portfolio page of Klaas Van Slambrouck — an interactive, bilingual (NL/EN) one-pager featuring a 3D architecture visualisation of the LOWI platform.

**Stack:** Next.js (App Router, TypeScript), CSS Modules, Three.js via react-three-fiber.

**Run locally:**

```bash
npm install
cp .env.local.example .env.local   # fill in the env vars (may stay empty for now)
npm run dev
```

All content currently comes from `content/placeholderContent.ts`; the Supabase / nidus-api integration (live stats, Jarvis chat) will be wired up in a later step.
