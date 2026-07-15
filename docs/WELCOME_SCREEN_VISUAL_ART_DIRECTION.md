# WELCOME_SCREEN_VISUAL_ART_DIRECTION.md

## Purpose

This document defines the visual art direction for the first ComfyMind welcome
screen.

The welcome screen is the first place where the prototype should establish a
recognizable visual identity. It should feel calm, safe, minimal, atmospheric,
and gently imaginative without becoming decorative, childish, or overtly
science-fictional.

The screen is the first design anchor. Once approved, its visual language may
later be adapted to the login screen and the rest of the patient journey.

## Working concept

### Atmospheric sanctuary

The visual idea is a quiet creative space viewed through the atmosphere of
another world.

The page should suggest:

- a soft planetary sky;
- distant atmospheric depth;
- slow clouds or mist;
- gentle light passing through layers;
- room to pause before beginning.

The atmosphere should feel unfamiliar enough to be distinctive, but familiar
enough to remain reassuring.

This is not a space-game interface. It should not use spaceships, planets,
constellations, futuristic controls, neon grids, or technical sci-fi motifs.

## Emotional qualities

The welcome screen should communicate:

- calm;
- safety;
- openness;
- curiosity;
- privacy;
- creative possibility;
- permission to proceed slowly.

The screen should avoid urgency, performance pressure, clinical coldness, or
visual stimulation that competes with the message.

## Composition

Use a simple composition with three layers.

### 1. Atmospheric background

A full-viewport sky made from soft layered gradients.

The background can combine:

- deep blue-green;
- muted twilight blue;
- soft violet or mauve;
- desaturated teal;
- a small amount of warm diffused light.

Avoid a flat single-color background. The depth should come from broad,
low-contrast transitions rather than sharp gradient bands.

### 2. Cloud and mist layers

Use a small number of large, soft-edged atmospheric forms.

The forms should:

- partially overlap;
- sit at different perceived depths;
- remain visually quiet;
- frame the main content rather than cover it;
- avoid looking like clip-art clouds.

Clouds may be created with blurred radial gradients, layered pseudo-elements,
or lightweight DOM elements. They should feel more like mist, vapor, or
atmospheric formations than literal cartoon clouds.

### 3. Foreground content

Keep the text and controls in a stable, readable foreground region.

Preferred layout:

- project title or wordmark;
- short welcome heading;
- one brief supporting paragraph;
- primary Begin action;
- secondary Skip action;
- language selector positioned clearly but without dominating the page.

The content may sit in open space or on a lightly translucent surface. Do not
use a large opaque card unless contrast cannot otherwise be maintained.

## Suggested palette direction

These values are starting points rather than fixed final tokens. Codex should
adjust them as necessary after contrast review.

| Role | Suggested direction |
|---|---|
| Deep atmosphere | `#101827` to `#17243A` |
| Teal atmosphere | `#244B55` to `#356771` |
| Twilight violet | `#5B5875` to `#756C8D` |
| Soft mauve haze | `#A59AAF` |
| Cloud light | `#ECEAF1` to `#F6F4F7` |
| Warm distant light | `#E7CDBA` |
| Primary readable text | near-white, such as `#F7F7FA` |
| Secondary readable text | muted light neutral with verified contrast |
| Focus indication | high-contrast warm or pale accent |

Do not use all of these colors at equal intensity. The screen should have one
dominant atmospheric family and one restrained accent.

## Gradient direction

Prefer two or three broad atmospheric layers instead of one complex gradient.

Example conceptual structure:

1. deep blue-green base;
2. muted violet haze entering from one side;
3. soft warm light diffused near an edge or horizon;
4. cloud layers placed over the result.

Avoid:

- rainbow gradients;
- highly saturated aurora effects;
- bright central glow behind text;
- moving gradient backgrounds;
- hard radial circles that resemble planets unless intentionally abstracted.

## Cloud interaction

### Intended feeling

The atmospheric layers should respond subtly to pointer movement, as though the
viewer is shifting their perspective through layers of air.

The interaction should be barely noticeable at first and become apparent only
when the pointer moves.

### Recommended behavior

- Normalize pointer position relative to the viewport or welcome container.
- Move each atmospheric layer by a different small amount.
- Use maximum translations in approximately these ranges:
  - far layer: 2–4 px;
  - middle layer: 4–7 px;
  - near layer: 6–10 px.
- Use eased movement rather than matching the pointer exactly.
- Keep the content panel fixed.
- Reset gently toward the neutral position when the pointer leaves.
- Do not rotate, scale, or distort the clouds aggressively.

### Technical preference

Prefer:

- CSS custom properties;
- lightweight pointer events;
- `requestAnimationFrame` throttling if required;
- absolutely positioned decorative elements;
- `transform: translate3d(...)`.

Avoid:

- WebGL;
- canvas animation;
- physics libraries;
- animation dependencies;
- frequent Vue reactive re-renders for every pointer event.

Decorative cloud layers should use:

- `aria-hidden="true"`;
- `pointer-events: none`;
- contained stacking contexts;
- no effect on document flow.

## Motion and reduced motion

The design must remain complete without movement.

When `prefers-reduced-motion: reduce` is active:

- disable pointer-reactive translation;
- disable drifting or floating animation;
- keep the atmospheric layers static;
- avoid animated fades or long transitions.

Any automatic cloud drift should be extremely slow and optional. Pointer
parallax alone is sufficient for the first version.

## Typography

Typography should feel open and contemporary.

Use:

- a clear display treatment for `ComfyMind`;
- a calm, readable heading;
- restrained line lengths;
- generous line height;
- short supporting copy.

Avoid:

- thin text over complex areas;
- all-uppercase headings;
- overly futuristic type styles;
- decorative script fonts;
- very small labels.

The project title can be expressive, but all explanatory text and controls
should remain highly legible.

## Controls

### Primary action

The primary action should be visually clear without becoming loud.

It should:

- be large enough for comfortable use;
- have a clear hover state;
- have a strong visible focus state;
- use a label such as Begin;
- remain distinct from the background in every part of the gradient.

### Skip action

Skip should remain visible and discoverable.

It should not be hidden as low-contrast text. It may be a secondary button or a
clearly styled text button.

### Language selector

Reuse the current language selector behavior and localization system.

The selector should be:

- visible on first view;
- keyboard reachable;
- readable against the atmosphere;
- visually quieter than the main action;
- consistent with the existing Català / Español / English options.

## Accessibility priorities

The welcome screen may be more expressive than the application screens, but it
must preserve the existing accessibility foundation.

Required:

- readable text/background contrast;
- visible keyboard focus;
- logical tab order;
- keyboard-operable Begin, Skip, and language controls;
- Enter-key progression without blocking normal control behavior;
- reduced-motion support;
- no information conveyed only through animation;
- no text placed directly over visually busy cloud edges;
- sufficient spacing at narrow widths and high zoom.

The pointer effect is decorative. It must never be required to understand or
operate the screen.

## Enter-key behavior

Pressing Enter may continue to login when:

- focus is not inside a control that has its own Enter behavior;
- no menu, listbox, or dialog is open;
- the screen is in its default welcome state.

Do not override Enter while the language selector is open or while a focused
button is expected to handle Enter normally.

## Responsive behavior

### Desktop

Allow atmospheric depth around the content. The composition may be centered or
slightly asymmetrical.

### Mobile

Reduce the number, size, or movement range of cloud layers.

Keep:

- the title visible without crowding;
- the text comfortably readable;
- both actions reachable without scrolling when practical;
- the language selector easy to find.

Do not preserve desktop parallax intensity on small screens.

## Visual continuity with later screens

The welcome page should introduce reusable ideas, not an isolated illustration.

Potential reusable elements include:

- atmospheric blue-green base colors;
- soft violet and warm-light accents;
- translucent elevated surfaces;
- cloud-like border softness;
- restrained depth;
- calm spacing;
- rounded but not playful controls.

Do not yet apply these ideas across the whole application. First validate the
welcome screen as the visual reference.

## Explicit exclusions

Do not add:

- stars scattered across the background;
- visible planets as literal objects;
- rockets, spacecraft, or astronaut imagery;
- neon cyan or magenta interface chrome;
- glassmorphism applied to every element;
- complex particle systems;
- sound;
- large looping animations;
- animation frameworks;
- heavy GPU effects.

## First-version acceptance criteria

The first version is successful when:

1. The page immediately feels calmer and more distinctive than a generic login.
2. The title, explanation, and actions remain readable at a glance.
3. The atmospheric theme is present without appearing like a science-fiction
   product.
4. The cloud response is subtle and does not distract from the content.
5. The screen works fully with keyboard input.
6. Reduced-motion mode produces a complete static design.
7. The layout works at desktop and narrow mobile widths.
8. The style provides a plausible base for later adaptation to the login and
   patient screens.
