# CODEX_VISUAL_PROTOTYPE_TASK.md

Implement the approved visual prototype plan for the ComfyMind frontend.

Read these files before making changes:

- `AGENTS.md`
- `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md`
- `docs/DESIGN_SYSTEM_BRIEF_DRAFT.md`
- `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`
- `docs/PROTOTYPE_REVIEW_CHECKLIST.md`

This is a design-review prototype, not a production implementation.

## Scope

Focus primarily on the patient experience.

Redesign these screens:

1. Login
2. Patient home
3. Patient session or image-creation workspace
4. Artwork result or gallery

Optionally include one therapist dashboard preview only if it can reuse the same shared application shell without substantially increasing the scope.

## Design direction

The interface should feel:

- calm
- professional
- contemporary
- trustworthy
- warm but not childish
- supportive but not clinical
- simple and visually uncluttered

Use:

- generous spacing
- readable typography
- large primary controls
- restrained shadows
- a limited and coherent color palette
- clear hierarchy
- consistent component styling

Avoid:

- excessive gradients
- dense patient dashboards
- decorative clutter
- small controls
- unnecessary animation
- overly playful or childish visuals
- major layout complexity

## Technology

Reuse the existing stack:

- Vue 3
- Tailwind CSS
- Reka UI
- Lucide
- Pinia

Do not introduce a new component framework.

Do not modify:

- the backend
- the database
- API contracts
- authentication implementation
- ComfyUI integration
- ComfyUI workflows or custom nodes

Image generation is currently affected by missing ComfyUI nodes. Do not attempt to solve that problem.

## Language support

Add a visible language selector with:

- Català
- Español
- English

For this prototype, language switching only needs to cover the redesigned screens.

Use a lightweight translation dictionary or store and persist the selected language in `localStorage`.

Do not add a full internationalization dependency unless it is genuinely necessary.

Use the approved terminology from:

`docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`

## Interaction

The prototype should be minimally interactive.

Include:

- navigation between prototype screens
- visible hover, active, disabled and focus states
- a working language selector
- one representative loading, empty, error or result state
- visible keyboard focus
- enough interaction to understand the intended patient flow

Backend functionality may remain partially mocked or disconnected where necessary for the visual prototype.

Do not remove existing working integrations unless required for the prototype, and keep such changes minimal.

## Accessibility basics

For this prototype:

- use readable text and strong contrast
- use large primary buttons
- make visible controls keyboard reachable
- show a clear focus state
- do not rely on color alone
- do not create drag-only actions
- avoid unnecessary motion
- keep patient-facing layouts simple and low-density
- use plain, direct language

## Implementation boundaries

Keep changes primarily inside `frontend/`.

Prefer creating or reusing shared components instead of duplicating page-level styling.

Do not:

- perform dependency upgrades unrelated to the prototype
- run `npm audit fix`
- add production infrastructure
- add a new testing framework
- redesign every existing screen
- rewrite routing or authentication
- repair missing ComfyUI functionality

## Validation

From the `frontend` directory, run:

```bash
npm run build
```

Do not report completion if the build fails.

Also perform a brief manual review of:

- login
- patient home
- patient workspace
- artwork result or gallery
- language switching
- keyboard focus
- obvious responsive layout issues

## Completion report

At completion, report:

1. Files changed
2. Screens redesigned
3. Shared components created or updated
4. How language switching works
5. How to review the prototype locally
6. Any existing functionality intentionally left incomplete
7. Any assumptions made
8. The result of `npm run build`

Do not commit changes unless explicitly asked.
