# ComfyMind development instructions

## Project purpose

ComfyMind supports art-therapy sessions for people with multiple sclerosis.
It has two user roles: patient and therapist.

This branch is for an initial visual prototype. The immediate goal is to review
appearance, hierarchy, terminology and basic usability with stakeholders.
It is not a production-ready redesign.

## Read first

Before changing the frontend, read:

- `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md`
- `docs/DESIGN_SYSTEM_BRIEF_DRAFT.md`
- `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`

Treat those files as the design brief for the prototype.

## Prototype scope

Focus primarily on these patient-facing screens:

1. Login
2. Patient home
3. Patient session or image-creation workspace
4. Artwork result or gallery

A single therapist dashboard preview is optional if it reuses the same design
system and does not substantially increase the scope.

The prototype should be minimally interactive. It only needs enough behavior to
navigate between prototype screens, switch language and demonstrate important
visual states.

## Scope boundaries

- Keep visual prototype work inside `frontend/` unless explicitly instructed.
- Do not modify the backend, database schema, API contracts or authentication logic.
- Do not modify ComfyUI workflows, models, nodes or configuration.
- Do not attempt to fix the missing ComfyUI nodes.
- Image generation does not need to work for this prototype.
- Do not run broad dependency upgrades or automatic audit fixes.
- Do not remove existing routes merely because the prototype does not use them.

## Existing technology

Reuse the existing stack:

- Vue 3
- Vite
- Tailwind CSS
- Reka UI
- Lucide icons
- Pinia
- Axios

Do not add another component framework.
Do not add a production dependency unless it is clearly necessary and explained.

## Design direction

The interface should feel:

- calm
- professional
- contemporary
- trustworthy
- warm without appearing childish
- supportive without appearing clinical
- simple and visually uncluttered

Use:

- generous spacing
- readable typography
- large primary controls
- clear visual hierarchy
- restrained shadows
- moderate border radii
- a limited and coherent color palette

Avoid:

- excessive gradients
- decorative clutter
- very pale text
- dense patient dashboards
- small controls
- unnecessary animation

## Patient and therapist roles

Patient screens should have low information density and one obvious primary task.

Therapist screens may use moderately higher information density, but should keep
the same visual language.

Do not combine patient and therapist actions in a way that makes the current role
unclear.

## Language support

The prototype should include a visible language selector for:

- Català
- Español
- English

Language switching only needs to cover the redesigned prototype screens.

Use a lightweight translation dictionary or composable and persist the selected
language in `localStorage`.

Do not introduce a full internationalization library unless it is clearly needed.

Use the approved terminology in:

- `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`

## Accessibility minimums for the prototype

- Visible controls must be keyboard reachable.
- Keyboard focus must be clearly visible.
- Primary controls should be large and well spaced.
- Do not rely on color alone to communicate state.
- Avoid drag-only interactions.
- Use readable text and strong contrast.
- Avoid unnecessary motion.
- Use semantic HTML and meaningful accessible names.
- Show clear loading, empty, success and error states where represented.

This is a lightweight prototype requirement, not a formal accessibility audit.

## Validation

Before reporting completion, run from `frontend/`:

```bash
npm run build
```

Do not report completion if the build fails.

Also manually verify:

- the prototype opens
- navigation between prototype screens works
- language switching changes visible labels
- keyboard focus is visible
- there are no obvious layout failures

## Completion report

At the end, report:

- files changed
- screens redesigned
- shared components created
- how language switching works
- the result of `npm run build`
- manual review steps
- existing functionality intentionally left incomplete
