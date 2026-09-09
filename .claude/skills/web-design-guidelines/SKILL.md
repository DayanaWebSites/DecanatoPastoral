---
name: web-design-guidelines
description: Audit UI against accessibility, performance, and UX rules. Use after generating full pages, before PR. Pipeline: Taste → generate → Impeccable audit → this review.
---

# Web Design Guidelines (Decanato Pastoral Social)

Post-generation quality gate. Source: vercel-labs/agent-skills web-design-guidelines.

## Checks

- Contrast AA 4.5:1 on cream-over-green and ink-over-cream, including `text-crema/70`
- Touch targets ≥ 44×44 px
- Visible labels, never placeholder-only
- Focus visible on every interactive
- `prefers-reduced-motion` respected
- Images via `astro:assets`, never raw `<img>`
- Self-hosted fonts only. Zero third-party requests from HTML
- Zero `.js` in `dist/`

## Activation

Review modified `.astro` / `.css` after a page is complete.
