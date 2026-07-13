# Codex task: ComfyMind visual prototype

Create an initial visual prototype for the ComfyMind frontend.

Read `AGENTS.md` and the three design documents in `docs/` before making changes.

## Objective

Produce a meeting-ready visual draft that demonstrates a coherent, accessible and
professional design direction for ComfyMind.

This is a visual prototype, not a production implementation.

## Required screens

Redesign these patient-facing screens:

1. Login
2. Patient home
3. Patient session or image-creation workspace
4. Artwork result or gallery

A therapist dashboard preview is optional if it can reuse the same shared shell
without substantially increasing the scope.

## Design direction

The interface should feel calm, professional, contemporary, trustworthy and warm.
It should not feel childish, clinical, institutional or visually busy.

Use generous spacing, readable typography, large primary controls, clear cards,
restrained shadows, moderate radii and a limited color palette.

## Interaction level

The prototype should be minimally interactive:

- navigation between the redesigned screens
- visible button and focus states
- a working language selector
- a representative loading, empty, error or completed-result state

Backend integration may remain unchanged or partially disconnected where needed
for the visual prototype.

Do not attempt to repair image generation or missing ComfyUI nodes.

## Language support

Add a visible selector for:

- Català
- Español
- English

Language switching only needs to cover the redesigned screens.

Use a lightweight translation dictionary or composable and save the selected
language in `localStorage`.

Use the approved terminology in
`docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`.

## Technical constraints

- Reuse Vue 3, Vite, Tailwind CSS, Reka UI, Lucide and Pinia.
- Do not add a new component framework.
- Do not change backend code, database schemas, API contracts or ComfyUI setup.
- Do not remove existing routes.
- Do not run `npm audit fix` or broad dependency upgrades.
- Prefer reusable components over one-off duplicated markup.

## Accessibility basics

- Make visible controls keyboard reachable.
- Show clear focus indicators.
- Use large primary controls.
- Maintain readable contrast.
- Do not rely on color alone.
- Avoid drag-only interactions and unnecessary animation.

## Validation

Run from `frontend/`:

```bash
npm run build
```

Do not report completion if the build fails.

## Completion response

Report:

1. Files changed
2. Screens redesigned
3. Shared components created
4. How language switching works
5. Build result
6. Manual review instructions
7. Features intentionally left incomplete
