# Sanctuary design system (frontend)

The building blocks of the "Liminal Sanctuary" look (spec: `docs/redesign/DESIGN.md`).
**Live style guide: open `/design`** (`/#/design` in the demo build). It shows every token, the type scale and every component in its states, and recomputes contrast from the real CSS.

```
frontend/src/style.css                 tokens, Tailwind theme, atmosphere + type CSS
frontend/src/fonts.css                 self-hosted Readex Pro (Tenor Sans comes from main.js)
frontend/src/composables/useComfort.ts Comfort settings (text size, motion, atmosphere, 3D)
frontend/src/composables/usePrototypeLocale.ts   all UI strings (ES / CA / EN)
frontend/src/components/sanctuary/     this folder
frontend/src/views/DesignView.vue      the /design style guide
```

Import from the barrel: `import { SButton, ArtworkMount } from '@/components/sanctuary'`.

## 1. Pick the mode

| Screen is about... | Wrap in | Mode |
|---|---|---|
| arriving, waiting, leaving (landing, login, session end) | `<DuskLayout>` | dusk |
| doing (home, workspace, gallery, therapist console) | `<AppShell>` (already applied by `App.vue` to every route without `meta.hideHeader`) | dawn |

Routes with `meta.hideHeader: true` render **bare**: put `<DuskLayout>` (or your own layout) inside the view.
Any element can switch to dusk with `class="dusk"`: the same variable names get dusk values.

## 2. Use tokens, never hex

Mode-aware classes follow the nearest `.dusk` ancestor. Prefer these in components, so one component works in both modes:

| Need | Class |
|---|---|
| page / card / popover fill | `bg-background`, `bg-card`, `bg-popover` |
| soft or selected fill | `bg-secondary` |
| text | `text-foreground`, `text-muted-foreground` (secondary) |
| primary action | `bg-primary text-primary-foreground` |
| link, active nav | `text-link` |
| accent (icons, wordmark) | `text-mark` |
| state | `text-success`, `text-warning`, `text-danger`, `bg-danger text-danger-foreground` |
| control border / card border | `border-2 border-input` / `border-border` (hairline) |
| focus ring | automatic (`:focus-visible`), 3px, never remove |

Fixed-mode classes (use in layouts and for things that never change mode, like the white artwork mat):
`bg-dawn-bg`, `bg-dawn-surface`, `text-dawn-ink`, `text-dawn-violet`, `bg-dusk-sky`, `text-dusk-text`, `bg-dusk-light`, `border-dusk-border`, ... (all names in `style.css`).

Type: `font-display` (Tenor Sans), `font-body` (Readex Pro), `text-body` (18px), `text-small` (15px), and the roles `type-wordmark`, `type-display`, `type-h1`, `type-h2`, `type-h3`, `type-label`, `type-body`, `type-small`, `type-button`, plus `measure` (max 60ch).
**Tenor caps is only for the wordmark, the display line and museum labels (`type-label`).** Every other heading and tile label is sentence case: `type-h3` is Readex 600. (`.prototype-eyebrow/-title/-lead` are legacy aliases in the same style; do not use them in new code.)
Shape (square-cut, DESIGN.md §4.5): `rounded-control` (2px: buttons, inputs), `rounded-card` (0: mats, overlays), `.niche` (arch top, square foot: featured artwork and the atrium only), `rounded-full` only for the sun, the "now" dot and colour swatches. `rounded-pill` and `.elev` are retired. Containers: `.panel` (rule above, no box: the default) and `.mat` (surface fill, square: forms, paper, reflection). Controls in a group: `.chip` (2px underline; `aria-pressed`/`aria-selected`/`.is-selected` gives the 3px rule and bold; add a `<Check>` icon). Tokens `--rule` / `--rule-strong` (under a title or active tab only). Shadows: `shadow-hung` (artwork mats only), `shadow-[var(--overlay-shadow)]` (dialogs, popovers, menus, toasts at dawn; none at dusk). Surfaces have no shadow.
Atmosphere (the atrium at dusk): `.sky` (sky, 2px horizon line, darker floor; `--horizon` sets its height), `.sun-disc` (a crisp disc seated on the horizon; `--sun-size`, `--sun-x`), `.mist` (low horizontal strata), `.dither` (4x4 Bayer overlay), `.grain`, `.scrim` (panel behind forms only, no glow), `.dawn-glow`, `.flute-rule`.
Spacing: Tailwind steps match the scale: `gap-1 2 3 4 6 8 12 16 24` = 4 8 12 16 24 32 48 64 96 px. Targets: `min-h-14` (56px patient), `min-h-11` (44px).

```vue
<!-- DO -->
<p class="type-body text-muted-foreground">Marta puede ver lo que compartes.</p>
<section class="panel"><h2 class="type-h2">Mis obras</h2>...</section>   <!-- a room: rule + space, no box -->
<button class="chip" :aria-pressed="on"><Check v-if="on" aria-hidden="true" class="size-4" />125%</button>

<!-- DON'T -->
<p style="color:#526762; font-size:14px">...</p>      <!-- hex, px font size, below 15px -->
<div class="bg-[#e8f1ee] text-gray-500">...</div>     <!-- arbitrary hex / Tailwind grays -->
<button class="outline-none">...</button>             <!-- never remove the focus ring -->
```

Need a colour that does not exist? Add a token in `style.css`, show it in `DesignView.vue`, and document it in `DESIGN.md`.

## 3. Components

| Component | Use it for | Key props / slots |
|---|---|---|
| `SButton` | every button and button-looking link | `variant` primary/secondary/quiet/danger, `size` patient(56px)/compact(44px), `to`/`href`/`as`, `busy`, `disabled`, `block`; slot `icon` |
| `SField` | any labelled input | `v-model`, `label`, `type` (text, email, password, textarea...), `help`, `error`, `optional`; default slot for a custom control |
| `SCard` | a room: default `panel` (rule above, no fill or box); `variant="mat"` for a form or the reflection | `variant` panel/mat, `padding`, `selected`, `as` |
| `SNotice` | persistent message | `tone` info/success/warning/danger, `title`, `dismissible`, event `dismiss` |
| `ArtworkMount` | showing an artwork on a square museum mat (`--dawn-mat`, the brightest surface) with a hung shadow (not a card) | `src`, `alt`, `title`, `technique`, `date`, `madeBy`, `frame` arch/square/pediment/oculus/columns/none (`niche` = old shorthand for arch; default square), `mat`, `ratio`, `label` |
| `FramePicker` | "Marco": the person picks the frame of an obra (after it is made); a radio group of small line drawings + names, arrow keys, chip selection | `v-model` frame. Persist with `frameFor(fileName, fallback)` / `setFrameFor(fileName, shape)` from `frames.ts` |
| `MuseumLabel` | caption under artwork | `title` (falls back to "Sin título"), `technique`, `date`, `madeBy` |
| `SessionCard` | a session as a ledger row between hairlines (no card); the status is a word on the date leaf ("Ahora" puts it on a square of sun colour) | `date`, `time`, `therapist`, `status` now/today/next; slot `action` |
| `WayInPicker` | Palabras / Dibujo / Imagen | `v-model` `'words' \| 'draw' \| 'image'` |
| `CalmProgress` | waiting | `progress` 0..1 or none (indeterminate), `status`, `hint`; slot `actions` |
| `ReflectionPrompt` | the post-save question | `question`; events `save(note)`, `skip` |
| `VersionsStrip` | versions in this sitting | `versions: {id, src}[]`, `v-model` current id, event `select` |
| `DemoTag` | the word "Demo" beside the wordmark, plain text | none (AppShell shows it automatically) |
| `ComfortPanel` | Comfort popover (quiet "Comodidad" trigger); options are `.chip` segments with a check icon; the panel turns dark when opened inside `.dusk` | `variant`, `mode` auto/dawn/dusk |
| `DuskLayout` | threshold screens; content is left-aligned wall text on the sky by default | `scrim` (only behind forms), `align` start/center, `width`, `showComfort`; slots `default`, `scene`, `top` |
| `AppShell` | working screens | `role`, `profile`; slots `default`, `aside` (collapsible right panel); `v-model:asideOpen` |

```vue
<!-- A working screen: the shell is already around your view -->
<template>
  <div class="flex flex-col gap-8">
    <h1 class="type-h1">{{ t('home.greeting', { name }) }}</h1>
    <SessionCard :date="s.start" :therapist="s.therapist" status="now">
      <template #action><SButton :to="`/session/${s.id}/patient`">{{ t('session.enter') }}</SButton></template>
    </SessionCard>
  </div>
</template>

<!-- A threshold screen -->
<template>
  <!-- wall text goes directly on the sky; add `scrim` only behind a form -->
  <DuskLayout>
    <h1 class="type-display">{{ t('landing.display') }}</h1>
    <SButton class="mt-6">{{ t('landing.begin') }}</SButton>
  </DuskLayout>
</template>
```

The header nav in `AppShell` (root class `shell`) is text-only on a solid background with the fluted entablature below; nav targets are 48px; the current page is bold with a 3px underline plus `aria-current="page"`. The profile menu is a quiet text button with the first name. Dialogs (`ui/dialog`, `ui/alert-dialog`) close with a text "Cerrar" button (`dialog.close`); toasts (`ui/sonner`) are bottom-left mats with a tone border, and `toast.error` never auto-closes.

Frames (`frames.ts`): the chosen frame is kept per file name in `localStorage` (`comfymind.frame.<fileName>`), in demo mode and with the real backend alike. Result, Mis obras (wall and detail) and Home's "Tu última obra" read it; without a choice the featured piece is `arch` and the wall `square`. **Backend TODO:** store the frame with the image (e.g. a `frame` field on the image record) so it follows the person across devices, and read it here.

Rules of thumb: one primary `SButton` per screen; icons only together with text; state is never colour alone; errors never auto-dismiss; no "generate / result / try again" words on user screens, and never "paciente / pacient / patient" in visible text (see DESIGN.md §8).

## 4. Words

Every string goes in `usePrototypeLocale.ts` in ES, CA and EN (`t('key', { name })`). Spanish is the default. Use the vocabulary in DESIGN.md §8 (obra, otra versión, guardar, apartar, compartir). Never hard-code text in a component.

## 5. Comfort and motion

`useComfort()` persists the person's choices and sets classes on `<html>`: `text-125`/`text-150` (root font size, so keep everything in rem), `motion-off` (no animation, tiny fades only), `atmo-everywhere`/`atmo-plain`, `no-3d`. `prefers-reduced-motion` is honoured by default. Test your screen with 150% text and motion off. A 3D scene should render its poster first and upgrade only when `useComfort().scene3dAllowed.value` is true.

## 6. Checklist before a PR

DESIGN.md §9, plus screenshots at 1440 and 1024 px, a pass at 150% text, and `npm run build:demo`.
