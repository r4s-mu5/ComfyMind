# WELCOME_SCREEN_TASK.md

Implement a welcome / introduction screen that appears before the login screen.

Read before making changes:

- `AGENTS.md`
- `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md`
- `docs/DESIGN_SYSTEM_BRIEF_DRAFT.md`
- `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`
- `docs/CODEX_HANDOFF_VISUAL_PROTOTYPE.md`
- `docs/CODEX_HANDOFF_WELCOME_SCREEN_ADDENDUM.md`

This is a frontend-only visual-prototype task.

## Goal

Create a calm, welcoming intro screen that establishes a stronger visual
identity for the prototype before the login screen.

This screen should become the first style anchor for the product. We are
focusing on **this page first**, not restyling the whole application yet.

## Required behavior

The new welcome screen must:

- appear before the login screen;
- include the existing 3-language selector:
  - Català
  - Español
  - English
- include a visible secondary **Skip** button;
- include a primary action button such as **Begin** / equivalent translation;
- allow progressing by pressing the **Enter** key;
- route to the login screen when skipped or continued;
- preserve the `?demo=1` query parameter when moving from welcome to login;
- remain compatible with the existing prototype and authentication flow.

For now, do **not** add persistence such as “show only once”.

## Content

The welcome screen should contain:

- project title: `ComfyMind`
- a short welcome heading
- a brief explanation of art therapy
- a brief reassurance that this is a calm / safe creative space
- a primary action button
- a skip action

The copy must remain very brief and warm.

Use or adapt the following English draft:

### Title
ComfyMind

### Heading
Welcome to your creative space

### Supporting text
Art therapy is a gentle way to explore thoughts, emotions, and experiences
through creative expression. Here, you can take your time, create calmly, and
discover your own way of expressing what you feel.

### Primary action
Begin

### Secondary action
Skip

Add equivalent Catalan and Spanish translations in the current lightweight
prototype localization system.

## Visual direction

The screen should establish a calm atmospheric identity with a:

- spacey-sky feeling
- soft cloud presence
- minimal layout
- welcoming tone
- high readability

Think of the mood as if viewing the atmosphere of another planet through a
soft lens: layered sky color, quiet depth, and clouds.

Use:

- soft atmospheric gradients
- muted deep blues, teals, mauves, soft violets, and gentle warm accents
- cloud-like shapes
- subtle depth
- a clean and centered or carefully balanced composition

Avoid:

- neon styling
- busy decorative art
- highly saturated sci-fi effects
- heavy glow
- excessive motion
- clutter

## Interactive clouds

Add a subtle interactive cloud or mist layer that reacts to mouse movement.

Requirements:

- reaction should be gentle and restrained;
- effect should feel like soft parallax or drifting atmosphere;
- it must not interfere with readability;
- it must degrade gracefully;
- it should be reduced or disabled with `prefers-reduced-motion`.

Do not add a heavy animation library or a complex canvas scene unless truly
necessary. Keep it lightweight.

## Accessibility

Preserve the prototype’s accessibility baseline as much as practical:

- readable text contrast
- visible keyboard focus
- keyboard-reachable controls
- Enter-key progression
- reduced-motion support
- simple and low-density layout
- clear readable button labels

The welcome screen may be slightly more expressive than the rest of the app,
but calm readability remains more important than decoration.

## Technical constraints

- Keep changes inside `frontend/`.
- Reuse the existing Vue 3, Tailwind/CSS, Reka UI, Lucide, and localization setup.
- Prefer reusing `LanguageSelector.vue` and `usePrototypeLocale.ts`.
- Do not add dependencies.
- Do not modify backend, database, API, authentication, or ComfyUI code.
- Do not restyle the whole application yet beyond minimal integration needs.
- Do not commit changes unless explicitly asked.

## Validation

Run from `frontend/`:

```bash
npm run build
```

Manually verify:

- welcome screen appears before login;
- language switching works on the welcome screen;
- Enter key continues to login;
- Skip button continues to login;
- primary button continues to login;
- `?demo=1` is preserved;
- cloud interaction works and remains subtle;
- reduced-motion behavior is respected;
- no obvious contrast or focus issues;
- no significant browser-console errors.

## Completion report

At completion, report:

1. Files changed
2. How the welcome route was inserted
3. How Enter-key progression works
4. How `?demo=1` preservation works
5. How the atmospheric / cloud effect works
6. Translation keys added
7. Manual review steps
8. Build result
9. Any intentionally deferred improvements
