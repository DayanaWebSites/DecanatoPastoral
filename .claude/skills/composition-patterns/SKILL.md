---
name: composition-patterns
description: Component composition for Astro pages. Use when creating reusable sections or when a component grows more than three boolean props.
---

# Composition Patterns (Decanato Pastoral Social)

Source: vercel-labs/agent-skills vercel-composition-patterns.
Adapted: this repo has **no React**. The spirit of the skill still applies to `.astro`.

## Rules

- Prefer slots and small presentational components over boolean-prop trees
- Data enters from `src/content/` or `src/data/`. Components do not fetch
- Layout (`Header`, `Footer`, `Base`) does not know about a specific parish
- UI primitives in `src/components/ui/` stay dumb: props in, HTML out
- Do not introduce `client:*` to share state. If you need shared client state, the stack is wrong (ADR-001)
