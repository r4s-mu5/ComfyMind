# CODEX_HANDOFF_WELCOME_SCREEN_ADDENDUM.md

## Purpose

This addendum updates the visual-prototype handoff with a new approved priority:

**implement a welcome / introduction screen before the login screen**.

This welcome screen is now the next design focus. It should help establish a
stronger visual identity for the prototype before the rest of the application is
restyled.

The goal is to define the first stylistic anchor for the product:
calm, welcoming, and visually distinctive, while remaining simple and
accessible enough for a healthcare-related prototype.

## Priority and scope

Focus on the welcome screen first.

Do **not** restyle the rest of the web app yet beyond the minimum changes
required to integrate the welcome screen cleanly.

The work should:

1. add a welcome screen before login;
2. preserve the visible language selector for Català, Español, and English;
3. keep the screen skippable;
4. establish the visual direction that may later be extended to the rest of the UI.

## Functional requirements

The welcome screen must:

- appear before the login screen;
- include the same 3-language selector already used in the prototype;
- include a visible **Skip** action;
- allow progressing by pressing **Enter**;
- allow continuing by clicking a primary call-to-action button;
- route the user to the login screen when skipped or continued;
- preserve the `?demo=1` query parameter when continuing through the welcome screen;
- remain lightweight and easy to remove or refine later.

For now, the screen should appear on entry rather than being remembered as
dismissed. Do not add a “show only once” persistence behavior unless explicitly
requested later.

## Content direction

The text should be **very brief**, **warm**, and **reassuring**.

It should:

- welcome the user;
- introduce art therapy in a simple, non-clinical way;
- describe the application as a calm or safe space;
- suggest that the user will be able to explore, create, and express themselves.

Do not use long paragraphs.

Prefer:

- a project title (`ComfyMind` for now, as a placeholder);
- a short welcoming heading;
- a compact supporting paragraph;
- a clear primary button.

## Suggested English draft copy

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

This copy may be refined by Codex only if the tone remains equally brief and
warm. Equivalent Catalan and Spanish versions should be added to the prototype
localization dictionary.

## Visual direction

The visual theme should begin moving the product identity toward a:

- calm
- atmospheric
- slightly space-inspired
- minimal
- soft
- contemplative

direction.

### Core inspiration

Think of:

- looking through the atmosphere of another planet;
- a calm sky with layered color depth;
- soft drifting clouds;
- subtle celestial ambience rather than sci-fi spectacle.

This should feel **gentle and dreamlike**, not noisy, flashy, or highly
illustrative.

### Important visual characteristics

Use:

- soft atmospheric gradients;
- a calm sky palette;
- muted deep blues, teals, mauves, soft violets, and desaturated warm light;
- gentle cloud-like forms;
- a sense of depth without clutter;
- a minimal foreground layout with strong readability.

Avoid:

- strong neon colors;
- hard sci-fi styling;
- sharp glowing effects;
- busy star fields;
- heavy animation;
- visual overload.

The page should remain calm and readable first.

## Interactive cloud idea

The welcome screen may include a subtle interactive cloud or atmospheric layer
effect.

The desired behavior is:

- clouds or soft mist-like shapes react slightly to mouse movement;
- the response should feel calm and soft, like gentle parallax;
- movement should be subtle and never distracting;
- it should help the page feel alive without reducing readability.

This interaction should be:

- optional and lightweight;
- reduced or disabled when `prefers-reduced-motion` is active;
- non-essential to understanding or using the page.

Do not build a heavy animation system. A minimal pointer-reactive effect is enough.

## Accessibility guidance

The welcome screen may be slightly more expressive than the rest of the
prototype, but it must still respect the accessibility direction as much as
reasonably possible.

Maintain:

- good text/background contrast;
- clear readable typography;
- visible focus styles;
- keyboard access to Skip and Continue;
- Enter-key progression;
- reduced-motion handling;
- simple layout and low cognitive load.

The page may be somewhat more flexible visually than the stricter patient
screens, but readability and calmness remain the priority.

## Integration guidance

This page should sit **before the login screen** in the user journey.

Intended entry sequence:

`/` or entry route → welcome screen → login → rest of prototype flow

Preserve:

- existing authentication implementation;
- existing demo routing model;
- the current lightweight localization approach;
- frontend-only scope.

The welcome screen should ideally reuse the existing language composable and
language selector rather than introducing a parallel system.

## Suggested technical approach

Codex may choose the exact implementation, but a reasonable direction is:

- add a dedicated `WelcomeView.vue`;
- place it before the current login route;
- reuse `LanguageSelector.vue`;
- add welcome-screen translation strings to `usePrototypeLocale.ts`;
- add lightweight atmospheric background styles in a contained way;
- keep the cloud interaction contained to the welcome screen only for now.

## Explicit constraints

Do not:

- modify the backend;
- modify authentication logic;
- add dependencies;
- add a large animation framework;
- restyle the whole application yet;
- change the isolated `?demo=1` behavior beyond preserving the query parameter;
- commit changes unless explicitly asked.

## Next step after implementation

Once the welcome screen is approved, use it as the stylistic base for
adapting the rest of the web app more consistently.
