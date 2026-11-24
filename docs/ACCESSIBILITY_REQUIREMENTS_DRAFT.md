# ACCESSIBILITY_REQUIREMENTS.md

## Purpose

This document defines the minimum accessibility requirements for the first ComfyMind visual prototype.

The prototype is intended for review with therapists and stakeholders. It is not the final accessibility specification. Requirements can be expanded after feedback from clinicians and users.

## Prototype priorities

The interface should be:

- easy to understand at a glance
- calm and visually uncluttered
- usable with a mouse and keyboard
- readable without relying on small text
- forgiving of accidental actions
- consistent across screens

## Minimum requirements for the mockup

### Navigation and interaction

- All visible buttons and links must be reachable with the keyboard.
- Focus states must be clearly visible.
- Do not create interactions that depend only on drag-and-drop.
- Primary actions should be large and visually distinct.
- Avoid placing important actions too close together.
- Back, cancel and close actions must be easy to find.

### Readability

- Use plain, direct language.
- Avoid long paragraphs in patient-facing screens.
- Use clear headings and short labels.
- Use a comfortable base text size.
- Maintain strong contrast between text and background.
- Do not use color as the only way to communicate meaning.

### Layout

- Patient screens should have low information density.
- Use generous spacing between controls.
- Keep one clear primary action per screen when possible.
- Avoid unnecessary side panels, decorative elements and competing actions.
- Important content should remain understandable when the browser is zoomed.

### Motion and feedback

- Avoid unnecessary animation.
- Respect the user's reduced-motion preference where practical.
- Show clear loading, success and error states.
- Explain errors in plain language.
- Do not remove entered information after a validation error.

### Safety and reassurance

- Ask for confirmation before destructive actions.
- Make session state and unsaved work visible.
- Avoid time pressure and automatic dismissal of important messages.
- Use reassuring, neutral language rather than alarming wording.

## Patient prototype emphasis

The patient-facing prototype should prioritize:

- a simple home screen
- a clear next action
- large controls
- minimal memory burden
- calm visual hierarchy
- obvious progress through an art-therapy session

## Therapist prototype emphasis

If a therapist screen is included in the prototype, it may use slightly higher information density, but it should still preserve:

- clear session context
- readable patient and appointment information
- consistent navigation
- clear distinction between viewing and editing actions

## Deferred until later phases

The following should be evaluated after therapist and user feedback:

- screen-reader testing
- formal WCAG audit
- adjustable text-size controls
- high-contrast themes
- motor-accessibility customization
- cognitive-assistance options
- advanced keyboard shortcuts
- configurable motion and sound settings
