# DESIGN_SYSTEM_BRIEF.md

## Project

ComfyMind is a web application used during art-therapy sessions for people with multiple sclerosis.

The application has two user roles:

- patient
- therapist

This brief defines the visual direction for an initial review prototype. The goal is to obtain feedback on appearance, hierarchy and usability before implementing the final product.

## Prototype scope

The first prototype should focus primarily on the patient experience.

Recommended prototype screens:

1. Login
2. Patient home
3. Patient session or generation workspace
4. A representative result, gallery or session-summary state

A therapist dashboard or therapist session screen may be included as a secondary preview to demonstrate how the same design system adapts to a more information-dense role.

The prototype does not need complete production functionality. Existing core routes and API logic should be disturbed as little as possible.

## Design objective

The interface should feel:

- calm
- professional
- contemporary
- trustworthy
- warm without appearing childish
- simple without appearing empty
- supportive without feeling clinical or institutional

## Visual direction

### Overall style

Use a clean web-application layout with:

- generous whitespace
- soft but controlled shapes
- restrained shadows
- clear cards and sections
- limited decorative imagery
- consistent iconography
- strong visual hierarchy

Avoid:

- excessive gradients
- decorative clutter
- overly playful illustrations
- dense dashboards on patient screens
- very pale text
- small controls
- unnecessary animation

### Color

Use a restrained palette with:

- a calm primary color
- a warm secondary or accent color
- neutral backgrounds
- high-contrast text
- clear success, warning and error colors

Color must not be the only indication of state.

### Typography

Use one highly legible sans-serif type family.

Typography should include:

- clear page titles
- distinct section headings
- comfortable body text
- concise button labels
- limited use of font weights

Avoid decorative fonts in functional areas.

### Spacing and shape

- Use a consistent spacing scale.
- Use moderate border radii.
- Give primary controls generous padding.
- Keep patient content in comfortably sized sections.
- Avoid very wide text columns.

## Application shell

Create a shared visual shell that can support both roles:

- top bar or clear page header
- optional collapsible navigation
- visible current section
- user/profile access
- language selector
- consistent main-content width
- responsive behavior

The patient version should present fewer navigation options.

The therapist version may show additional tools such as calendar, patients and sessions.

## Patient experience

Patient-facing screens should prioritize:

- one obvious primary task
- a calm welcome area
- the next session or current session
- large actions
- simple progress indicators
- clear save and continue behavior
- reassuring system feedback

Suggested patient navigation:

- Inici
- La meva sessió / Mi sesión / My session
- Les meves obres / Mis obras / My artwork
- Ajuda / Ayuda / Help

## Therapist experience

Therapist-facing screens may prioritize:

- today's sessions
- calendar
- patients
- session history
- session preparation
- review of generated or created artwork

Suggested therapist navigation:

- Inici
- Calendari / Calendario / Calendar
- Pacients / Pacientes / Patients
- Sessions / Sesiones / Sessions

## Language selector

The mockup should include a visible language selector for:

- Català
- Español
- English

For the prototype, language switching may cover only the screens included in the mockup.

Prefer reusing the current Vue, Tailwind CSS, Reka UI, Lucide and Pinia stack. Avoid adding a new UI framework.

A lightweight translation dictionary or store is acceptable for the prototype. A full internationalization library can be considered later if the application grows.

## Components to standardize

The prototype should establish reusable versions of:

- primary button
- secondary button
- destructive button
- input field
- select field
- card
- page heading
- navigation item
- empty state
- loading state
- error message
- confirmation dialog
- language selector
- session card
- artwork thumbnail

## Prototype deliverable

The visual draft should demonstrate:

- a coherent design language
- a patient-first interface
- basic responsive behavior
- visible keyboard focus
- basic language switching
- at least one loading, empty or error state
- enough interaction to navigate between prototype screens

It does not need to provide fully working image generation or complete backend integration.

## Review questions for the meeting

Ask stakeholders:

- Does the interface feel appropriate for adult patients?
- Is the main action obvious?
- Is the visual density comfortable?
- Does anything feel clinical, childish or confusing?
- Are labels understandable?
- Which patient actions should be available from the home screen?
- Should therapist screens use the same visual style or a denser variation?
- Which accessibility controls are most important in real sessions?
