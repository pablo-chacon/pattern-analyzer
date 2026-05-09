# Democratic Erosion Detector

Systemic institutional pattern analysis tool. Determines whether documented events represent isolated incidents or components of a systemic pattern of democratic or institutional erosion.

Built on the methodology developed for the Sweden OSINT Report 2026. Reusable on any country or institution.

## What It Does

Users paste verified source material — official statistics, news reporting, government documents — and the tool applies a structured analytical framework to identify cross-sectoral patterns, gaps between official narrative and primary data, and institutional response patterns.

Output is always structured in three explicit layers:
- **Layer 1** — Documented facts (sourced only)
- **Layer 2** — Observed patterns across those facts
- **Layer 3** — Probability assessment (clearly labeled as such)

## How to Use

1. Get a free Anthropic API key at [console.anthropic.com](https://console.anthropic.com)
2. Open the [Democratic Erosion Tool](https://pattern-analyzer-delta.vercel.app/)
3. Paste your API key (stored in memory only, never logged)
4. Select country/institution and time period
5. Choose analytical dimensions
6. Paste labeled source material
7. Run analysis

Each analysis costs approximately $0.01–0.05 depending on source volume.



## Analytical Dimensions

- Oversight bypass
- Institutional penetration
- Statistical misdirection
- Selective rule of law
- Parliamentary mechanics
- Surveillance & control
- Narrative vs. reality
- Elite impunity

## Privacy & Architecture

This tool has **no backend**. It is a static React application that calls the Anthropic API directly from your browser. No data is collected, stored, or transmitted anywhere except from your browser to Anthropic's API using your own key.

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel (Free)

1. Fork this repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" → select this repository
4. Click Deploy — no configuration needed
5. Done. Vercel gives you a public URL automatically.

Every push to main deploys automatically.

## Deploy to Netlify (Free)

1. Fork this repository
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select this repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click Deploy

## Methodology

The analytical framework encodes the following principles:

**Refuse isolated incident framing** — Events are tested for systemic significance regardless of sector or news cycle.

**Formal vs. functional distinction** — Institutional existence is separated from institutional performance.

**Narrative vs. primary data** — Government claims are cross-referenced against data from those same institutions' own agencies.

**Response as data** — How an institution responds after exposure is weighted equally with the incident itself.

**Statistical decomposition** — Aggregate statistics are always broken into subcategories before conclusions. Aggregate trends frequently conceal contradictory subcategory movements.

**Three-layer output** — Facts, patterns, and probability assessments are always distinct and explicitly labeled.

## Background

This tool was developed from the analytical methodology used in the Sweden: A Democracy Under Systemic Stress report (2025–2026), which applied this framework to Swedish institutional data between 2019 and 2026.

The tool is designed to be country-agnostic and reusable by researchers, journalists, and analysts working on institutional integrity in any democratic context.

## License

MIT — use freely, modify freely, redistribute freely.
