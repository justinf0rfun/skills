# ReDerive UI Lab

Small Vite + React demo project for testing premium UI components and motion patterns before moving them into a real product.

This project is intentionally not named after any vendor and is not part of the root npm workspace. It is a local lab only.

## What It Tests

- A usable redo agent-invocation builder for reverse analysis and learning-plan modes.
- Complete Codex / Codex CLI / Claude Code invocation generation with topic, artifact path, role, depth, duration, language, `--brief`, and `--include-analysis` controls.
- A React Bits Pro motion direction that supports the product metaphor without replacing clear form controls.

## React Bits Components Used

- `square-matrix`: powers the global black background; best fit for a dense command tool because it adds depth without hiding controls.
- `twilight-lines`: powers the hero-side accent background; best match for tracing constraints into decisions.
- `magic-transform`: visualizes raw input becoming structured output.
- `animated-list`: renders generated command explanations.

Good next candidates:

- `simple-graph` for learning-plan effort curves.
- `dot-shift`, `synaptic-shift`, or `ascii-tiles` for alternate dark background experiments.
- `shader-card` or `depth-card` for future landing pages, not the dense command-builder surface.

Evaluated but removed from the main surface:

- `glitch-text`: too small and logo-like for the hero.
- `parallax-pills`: visually interesting, but unclear for a command-builder user flow.

## Setup

Install dependencies:

```bash
npm install
```

Run the demo:

```bash
npm run dev
```

## Premium UI Registry Setup

This project is shadcn-ready and includes `components.json`.

Before installing premium components:

1. Copy `.env.example` to `.env.local`.
2. Put your license key in `.env.local` as `REACTBITS_LICENSE_KEY`.
3. Keep the `registries` block in `components.json`.

Do not commit `.env.local`.

After registry configuration, install components with the shadcn CLI, for example:

```bash
npx shadcn@latest add @reactbits-starter/<component-name>
npx shadcn@latest add @reactbits-pro/<block-name>
```

Use `@reactbits-starter` for components and `@reactbits-pro` for Pro blocks, matching the vendor docs.
