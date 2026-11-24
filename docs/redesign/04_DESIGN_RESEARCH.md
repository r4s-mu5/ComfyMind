# 04 — Design Research (W4)

Scope: art-therapy principles, MS-specific accessibility, emotional/aesthetic territory,
three candidate directions, stack-compatible resources, and per-screen patterns for ComfyMind.
Builds on `AGENTS.md`, `docs/DESIGN_SYSTEM_BRIEF_DRAFT.md`, `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md`
and `docs/WELCOME_SCREEN_VISUAL_ART_DIRECTION.md` (call it the *Welcome brief*); it does not repeat
their baseline (calm, large controls, reduced motion, no colour-only state, low density).

**Evidence note (read first).** Research was done with web search only; the sandbox blocked
direct page fetches (e.g. w3.org did not resolve), so claims marked *(search-verified)* were seen in
search results from the cited source, and claims marked *(from knowledge, verify)* were not re-opened.
Product descriptions in section 3 are my own design judgement, not quotes. Contrast ratios in
section 4 were computed (WCAG relative-luminance formula, script run locally), not estimated.
Evidence for art therapy in MS is thin (small, mostly uncontrolled studies), so the principles below
are design heuristics grounded in professional ethics, not clinical proof. All clinical-adjacent
suggestions (session length, break prompts) need validation by the therapists.

---

## 1. Art-therapy principles and their UI consequences

Sources: AATA, [Ethical Principles for Art Therapists](https://arttherapy.org/ethics/) and its
best-practice papers such as *Exhibiting Client Artwork* (linked from that site; they stress consent
and care when artwork leaves the room); [BAAT, About art therapy](https://www.baat.org/About-Art-Therapy)
*(from knowledge, verify)*; Kagin & Lusebrink's Expressive Therapies Continuum, discussed for the AI
era in [LMU Scholars](https://scholars.lmu.edu/en/publications/the-role-of-the-expressive-therapies-continuum-in-human-creativit/);
AI-specific: [Frontiers in Psychology 2025 integrative review](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1548396/pdf)
(over-reliance on creative AI may erode agency for clients and therapists),
[JMIR Formative Research 2024](https://formative.jmir.org/2024/1/e63038/PDF) (confidentiality as crucial),
[AATA Institute, AI Imageries in Art Therapy](https://at-institute.arttherapy.org/products/self-study-ai-imageries-in-art-therapy-exploring-the-intersection-of-ethics-expression-and-equity)
(ethics, expression, equity), and the art-therapy survey on [arXiv 2412.03287](https://arxiv.org/pdf/2412.03287v1)
(therapists see promise but flag ethical, technical and psychological challenges).
MS-specific: [2014 pilot on PubMed](https://pubmed.ncbi.nlm.nih.gov/25285594/)
(a 4-week creative-arts programme for 14 women with MS reported gains in self-esteem, hope, social support and self-efficacy; small, uncontrolled);
[Mindfulness-based art therapy pilot in MS, 2023](https://www.ovid.com/journals/mednu/pdf/00008484-202305000-00006~mindfulness-based-art-therapy-and-symptoms-in-adults-with).

| Principle | What it means in a session | Concrete UI implications | Avoid |
|---|---|---|---|
| **Process over product** | The value is in making and talking, not in a "good" image. | Name the activity, not the output ("Explore an image", not "Generate"). Show the *trail* of an image (prompt, sketch, versions) as one continuous thread, so process is visible. Keep earlier versions; a "Versions" strip, not a single overwritten result. Allow stopping at any point with a neutral "Finish for today". | Score, stars, "perfect", "best result", completion streaks, achievements. |
| **No judgement, no wrong output** | A strange, dark or "off" image is as valid as a pretty one. AI glitches (extra fingers, odd faces) must not read as the patient's failure. | Result copy is descriptive and open: "Here is what appeared." / "What do you notice?". No thumbs up/down, no quality labels, no "failed" for a successful but unexpected image; reserve error language for technical faults and say they are the system's, not the patient's ("The image could not be made. Nothing you did caused this."). Don't auto-crop, auto-enhance or "improve" images. | Prompt-quality hints ("add more detail for a better result"), "Try again for a better image", negative-prompt jargon on patient screens. |
| **Agency and ownership** | The patient decides what to make, keep, change, hide or delete. AI is a material, not the author. | Patient controls: keep / set aside / delete (with undo) on every image. Their sketch and words are shown first-class next to the output (authorship trail). Suggestions are optional, collapsed by default, phrased as invitations, and never auto-filled. AI never changes an image without an explicit action; no auto-generate. Label images with who made which part ("Your sketch", "Image from your words"). | Autoplay "surprise me", auto-variations, algorithmic "recommended for you", the app talking as if it is the artist. |
| **Therapist frames and holds the session** | The therapist sets context, pace and closure; the app supports, not replaces, that relationship. | Therapist console starts/ends/pauses a session, prepares a gentle theme or prompt starters, sees patient's work live (with the patient aware of that), and adds notes. Patient UI shows a quiet "Session with <therapist>" context line and a visible, non-alarming way to call the therapist ("I'd like to talk"). Roles always labelled (the repo's AGENTS.md already requires unambiguous role). | Patient able to enter therapist-only areas; therapist silently watching; chatbot (later) that speaks as authority or as a therapist substitute. |
| **Reflection follows creation** | Meaning-making happens after making, usually in conversation. | After a result: a calm "Pause" state with 1–3 open prompts the therapist can configure ("What do you notice?", "Where in the image would you stay?", "Is there a word for it?"), voice or typed, skippable. A "Session notes" or "Reflection" card tied to the image. Optional title for the image, never required. Side-by-side/timeline review at end of session. Hold the future chatbot to this slot: it asks, it doesn't interpret. | Interpretation by the app ("this image suggests anxiety"), forced mandatory reflection forms, jumping straight to "make another". |
| **Privacy and consent** | Artwork is clinical material; exhibiting or sharing needs informed consent (AATA best-practice papers). | Private by default; nothing shared outside patient-therapist pair. Explicit consent toggles for any export, print, therapist-to-supervisor sharing. Plain-language statement of where images are processed (ComfyUI on which server) and who sees what. A "Hide from screen" quick action (blur/cover) usable in a shared room. Don't show other patients' names or images anywhere; use first names or initials only on therapist screens; demo data must be fictional. Self-host fonts and assets (no third-party CDN calls with patient IPs). | Public gallery, social features, analytics on content, "share" buttons by default. |
| **Pacing and safety** | Material can be emotionally heavy; MS adds fatigue. | Always-available "Take a break" and "Finish for today" (one tap, saves everything). No countdowns. Gentle, therapist-configurable closure screen ("Your work is saved. We can continue next time."). | Time pressure, auto-logout with data loss, streaks. |

Terminology cues from the principles (to feed `UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`): prefer *explorar / crear / imagen / obra / sesión / guardar / apartar*; avoid *generar, resultado, calidad, fallo, intentar de nuevo, optimizar, prompt* on patient screens.

---

## 2. MS-specific accessibility

Needs vary **day to day and within a day** ([Aging with Multiple Sclerosis, mobile interface design, SciTePress 2015](https://www.scitepress.org/Papers/2015/55329/55329.pdf)): the interface must be adjustable, not tuned for one profile. No published MS-specific touchscreen guideline set was found; the closest evidence is tremor and Parkinson's touch research, so treat numbers below as conservative design targets, to be validated with therapists and 2–3 users.

### 2.1 Symptom-to-design map

| Symptom | Design response (numbers are proposals) |
|---|---|
| **Tremor / reduced fine motor control / weakness** ([tremor touch research: duplicated or off-target touches](https://pmc.ncbi.nlm.nih.gov/articles/PMC3572909); [Maynooth Parkinson's UI study on large targets](https://mural.maynoothuniversity.ie/6621/1/PAS_user%20interface%202015.pdf)) | Primary targets **min 56 px** (48 px floor, 64 px on the canvas toolbar); spacing **≥ 12 px** between adjacent targets (WCAG floor is 24 px target or spacing, which is too small for us). Activate on pointer **up** and allow slide-off cancel (2.5.2). Ignore duplicate taps within ~300 ms on the same control (tremor duplicates input) but never on undo. No hover-only controls, no long-press-only, no double-tap, no multi-finger gestures, no swipe-only. No small close "x": use a labelled button. Avoid drag-only; every drag has a tap alternative (2.5.7). Sketch canvas: stroke smoothing/stabiliser (e.g. [perfect-freehand](https://github.com/steveruizok/perfect-freehand), MIT), brush-size presets large by default, one-tap undo with big button, "straight line / shape" helpers, palm rejection (pen-only or touch-only toggle), optionally disable pinch-zoom. Allow typing or **dictation** as a first-class path (voice via browser Web Speech where available). |
| **Fatigue (physical and mental)** | Short flows, few steps, state saved on every action (autosave), resume exactly where left. "Take a break" always visible. No forced multi-step wizards longer than 3 steps. Minimise typing: suggestions as tap chips. Avoid sustained-precision tasks. No session timeout during active work. |
| **Optic neuritis / low contrast sensitivity, colour vision change** ([MS Trust on sight problems](https://mstrust.org.uk/news/research/how-common-are-longer-lasting-sight-problems-ms); [MS Society, MS and your eyes](https://www.mssociety.org.uk/sites/default/files/2020-08/MS%20and%20your%20eyes%20LARGE%20PRINT%20MSS.pdf); [Visual Symptoms, MSNZ](https://www.msnz.org.nz/ms-symptoms/visual-symptoms/)) | Body text and essential UI **≥ 7:1** (AAA) wherever possible; absolute floor 4.5:1. UI boundaries (inputs, buttons, icons) **≥ 4.5:1** rather than the 3:1 minimum. Base size **18 px** (1.125 rem), line-height 1.6, max measure ~60 ch; weight 400–600 only (no thin/light). Never rely on colour alone (also colour vision shifts), pair with icon + text. Avoid text over imagery or gradients unless on a solid scrim; avoid light grey on white; avoid pure `#000` on `#FFF` and pure white on near-black for long text (glare/halation): prefer off-white/dark-ink. Offer a *text size* (100/125/150 %) and *high contrast* switch early (the draft deferred these; for MS they are core). Thick (≥ 3 px) focus rings. |
| **Double vision (diplopia), visual instability, nystagmus** (visual fatigue 59 %, diplopia 35 %, instability 28 % among people with lasting vision symptoms; [MS Trust](https://mstrust.org.uk/news/research/how-common-are-longer-lasting-sight-problems-ms)) | One clear focal region per screen; large, well-separated elements; avoid thin lines, fine patterns, repeating stripes, tight grids, ghosting/echo effects, overlapping translucent layers behind text, parallax or anything that moves independent of the user. Generous whitespace helps crowding. Allow a *simplified view* that hides secondary panels. Layout that doesn't require reading across wide screens: keep the main column ≤ 720 px. Provide image viewing at large size with simple zoom buttons. |
| **Heat sensitivity (Uhthoff phenomenon)**, about 60 % report heat worsening symptoms ([UAB MS Center](https://www.uab.edu/mscenter/resources/about-ms/what-are-symptoms-of-ms); [MS Trust](https://mstrust.org.uk/news/research/how-common-are-longer-lasting-sight-problems-ms)) | Mostly environmental, UI can support: therapist-configurable *gentle session length* (proposal: default 45 min, a soft "this is a good moment to rest" card at 30/40 min, dismissible, never auto-ending); break and resume without penalty; low-visual-heat palette is not evidence-based, don't claim it. No flashing, long animation, or intense/warm saturated fields that could add visual strain. Therapist console shows elapsed time, patient never sees a ticking countdown. |
| **Cognitive fatigue, slowed processing speed, memory** ([Frontiers in Neurology 2014](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2014.00214/full): subjective cognitive fatigue rises with time on task, steeper in MS; [VA MS resource](https://www.va.gov/MS/LEARN_ABOUT_MULTIPLE_SCLEROSIS/Cognitive_Changes_and_Multiple_Sclerosis.asp): extra time, repetition and reminders help) | One primary action per screen. Plain language (reading age ~ 12), sentences ≤ 15 words, labels ≤ 3 words. Same place and same wording for the same thing, always (3.2.3/3.2.4). Persistent "where am I / what's next" line (e.g. "Step 2 of 3: Draw"), the current task restated on each screen (don't depend on memory), no timed prompts, no auto-dismissing messages, confirmations that restate what will happen. Show icons *with* text. Reduce choices: ≤ 5–6 options at once, progressive disclosure. Keep entered content on error. Save drafts. |
| **Vertigo/dizziness and visual motion sensitivity** *(common in MS; from knowledge, verify)* | Motion budget near zero for patient screens; any parallax (see Welcome brief) must be off by default for reduced-motion users and offered as a visible "Reduce motion" toggle too, not just an OS setting. |

### 2.2 WCAG 2.2 criteria that matter most

Sources: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [How to Meet WCAG quickref](https://www.w3.org/WAI/WCAG22/quickref/),
[Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
[Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html),
[Guidance on Applying WCAG 2.2 to Mobile Applications](https://www.w3.org/TR/wcag2mobile-22/).
Target level for ComfyMind: **AA everywhere, plus selected AAA** (marked).

| SC | Rule (numbers) | ComfyMind target / how |
|---|---|---|
| **2.5.8 Target Size (Minimum)**, AA | Pointer targets ≥ **24×24 CSS px**, or undersized targets have a 24 px circle that doesn't touch another target; exceptions: inline text links, equivalent control, user-agent-controlled, essential. *(search-verified)* | Our minimum is 48 px; patient primary 56–64 px. 2.5.5 Target Size (Enhanced, **AAA**) asks 44×44 px: we exceed it. Spacing ≥ 12 px. |
| **2.5.7 Dragging Movements**, AA | Anything done by dragging has a single-pointer alternative, unless essential or UA-controlled. *(search-verified)* | Drawing on canvas is *essential* dragging, but: tool pickers, reordering, sliders (brush size, "how much to follow my sketch") must have +/− buttons or tap-to-set; image reorder via buttons. Offer "draw a straight line by tapping two points". |
| **2.5.1 Pointer Gestures**, A | Multi-point or path gestures have a single-pointer alternative. | No pinch or two-finger-only; zoom via buttons. |
| **2.5.2 Pointer Cancellation**, A | No down-event activation, or allow abort/undo. | Activate on `click`/up; never on pointerdown (except drawing). |
| **1.4.3 Contrast (Minimum)**, AA / **1.4.6 Enhanced**, AAA | Text 4.5:1 (3:1 for large ≥ 24 px, or ≥ 18.66 px bold); AAA 7:1 (4.5:1 large). | Aim for AAA body text (all three directions below pass 7:1 for main text; secondary text ≥ 6.5:1). |
| **1.4.11 Non-text Contrast**, AA | UI component boundaries/states and meaningful graphics ≥ **3:1**. | Use ≥ 4.5:1 for input borders and icons (low contrast sensitivity). Focus ring ≥ 3:1 against both adjacent colours. |
| **1.4.4 Resize text** AA, **1.4.10 Reflow** AA, **1.4.12 Text spacing** AA | 200 % zoom without loss; reflow at 320 CSS px wide; no break with line-height 1.5, paragraph 2×, letter 0.12 em, word 0.16 em. | Use rem units; test 200 % and 400 %; no fixed-height text containers. |
| **2.4.7 Focus Visible** AA, **2.4.11 Focus Not Obscured (Minimum)** AA (new), **2.4.13 Focus Appearance** AAA (new) | Visible focus; focused item not entirely hidden by sticky bars/toasts; AAA: indicator ≥ 2 px thick perimeter, 3:1 change. | 3 px ring + 2 px offset, 2-colour (ring + gap) so it reads on any background; sticky header/footer padding via `scroll-padding`. Canvas toolbar must not cover focused items. |
| **2.2.1 Timing Adjustable** A, **2.2.2 Pause, Stop, Hide** A, **2.2.6 Timeouts** AAA | Time limits adjustable/extendable (≥ 10× or 20 s warning); moving/auto-updating content > 5 s can be paused; warn about inactivity data loss. | No session timeouts that lose work; autosave; if auth session expires, warn ≥ 2 min before and preserve drafts. Reka `Toast` auto-dismisses: set long or persistent `duration` for anything that matters. Generation progress animation must be pausable or static under reduced motion. |
| **2.3.3 Animation from Interactions**, AAA / **2.3.1 Three Flashes** A | Motion triggered by interaction can be disabled; nothing flashes > 3×/s. | Honour `prefers-reduced-motion`; add in-app "Reduce motion" setting stored per user; no parallax by default for patients. Transitions ≤ 150–200 ms opacity only. |
| **3.3.1 Error Identification** A, **3.3.2 Labels or Instructions** A, **3.3.3 Error Suggestion** AA, **3.3.4 Error Prevention (legal, financial, data)** AA | Visible persistent labels (not placeholder-only), errors in text identifying field + fix; reversible/confirmed deletions. | Labels above fields; errors with icon + text + `aria-describedby`; delete = soft delete + 10 s *undo that persists until dismissed* or confirm dialog. |
| **3.3.7 Redundant Entry** A (new), **3.3.8 Accessible Authentication (Minimum)** AA (new), 3.3.9 Enhanced AAA | No cognitive-function test (memorise/transcribe/solve) to log in unless alternative: paste and password-manager allowed; object/image recognition limited. | Login must allow paste and autofill (`autocomplete="username"`/`current-password`), no CAPTCHA puzzles; see passwordless options in section 6. |
| **3.2.3/3.2.4 Consistent navigation/identification** AA, **3.2.6 Consistent Help** A (new) | Same order and labels; help link in same place. | Persistent "Help / I'd like to talk" in the same spot on every page. |
| **1.3.5 Identify Input Purpose** AA, **2.4.6 Headings and Labels** AA, **3.1.1/3.1.2 Language of Page/Parts** A/AA | Autocomplete tokens; descriptive headings; `lang` set and updated when the user switches ES/CA/EN. | Set `<html lang>` on language switch (ca, es, en); mark mixed-language fragments. |
| **1.4.1, 1.4.5, 1.4.13** | No colour-only; no images of text; hover/focus content dismissible, hoverable, persistent. | Tooltips are not the sole source of meaning. |

### 2.3 Tablet and touch context

- Likely used on a tablet (landscape, on a table or lap) in a clinic or at home; sometimes with a stylus, sometimes with a finger, sometimes with a rest bar or a support arm. Design for **landscape iPad ≈ 1024×768 CSS px and portrait 768×1024**, with a 320 px reflow floor. Test at 200 % browser zoom.
- Keep primary actions in the **lower half and outer thirds** of the screen for thumb/arm reach in landscape (bottom-centre or bottom-right primary action), but avoid the screen-edge 24 px (system gesture zones; also tremor makes edges awkward).
- Don't depend on hover, right-click, or keyboard shortcuts. Add `touch-action: manipulation` on controls to stop double-tap-zoom delay; set `touch-action: none` only on the drawing surface, with a visible "Done drawing" button that restores scroll (avoid scroll traps).
- Pointer Events API for pen/touch/mouse; support pressure if available but never require it. Palm rejection: when a pen is detected, ignore touch on the canvas.
- Prevent accidental activation near screen bezel and during resting: confirm-on-release, and destructive items placed away from frequent ones.
- Support orientation changes without losing the canvas; no `100vh` pitfalls (use `dvh`).
- `font-size ≥ 16 px` on inputs to avoid iOS zoom-on-focus (we use 18 px).
- Dictation mic button next to every text input.

---

## 3. Emotional and aesthetic territory

**The target:** *a quiet studio, not a clinic and not a toy.* Warm daylight, a table of materials, permission to be unfinished. Calm that comes from space, soft material cues and slow pacing rather than from pastel blue-and-green "wellness" tropes. Adult, artful, slightly mysterious.

**Standing risks to design around:** (a) medical-teal-and-white cliché → feels clinical; (b) pastel rounded blobs and mascots → childish; (c) glassmorphism, neon gradient "AI" look → generic AI SaaS; (d) dark patterns and gamification common in wellness apps → contradicts "no judgement".

### 3.1 Reference set (links are the home pages; descriptions are my judgement *(from knowledge, verify live)* unless noted)

| # | Reference | Borrow | Avoid |
|---|---|---|---|
| 1 | [Calm](https://www.calm.com) (mindfulness) | Slow, full-bleed atmospheric imagery with sparse text; very simple "one thing now" entry screens; soft transitions between states. | Subscription upsell pressure; streaks; busy home with many tiles. |
| 2 | [Headspace](https://www.headspace.com) | Friendly but adult-ish illustration language; plain voice; short guided steps. | Brand mascots and saturated flat colour can read childish for our adult, clinical context. |
| 3 | [Finch](https://finchcare.com) (self-care pet) | Self-chosen goals, gentle encouragement, onboarding with consistent pattern. [Pratt IxD critique](https://ixd.prattsi.org/2025/09/design-critique-finch-ios-app-2/) praises consistent onboarding but recommends progressive disclosure over many options at once. | Pet gamification, pay-gated wellness, option overload (as noted by the same critique). |
| 4 | [Stoic](https://www.getstoic.com) (journaling) | Quiet, text-led reflection, calm monochrome with one accent, journaling after an activity = our "reflection" moment. | Philosophical tone and dense lists; dark-only. |
| 5 | [Procreate](https://procreate.com) | Canvas-first; chrome that recedes; large touch-friendly sliders at screen edge; excellent undo affordance; on-canvas gesture undo. | Hidden gesture-only features (3-finger swipe etc.): not tremor-safe; dense brush library. |
| 6 | [Krita](https://krita.org) (open source) | Pragmatic brush-stabiliser concept (smooths shaky strokes); open documentation of artist workflows. | Desktop-density panels; too many tools. |
| 7 | [FigJam](https://www.figma.com/figjam/) | Friendly stickers/cursors as "material"; low-stakes "scratch pad" feel; large, clear toolbar. | Collaboration noise (cursors, comments) in a private session; corporate tone. |
| 8 | [Are.na](https://www.are.na) | Calm, quiet, text-forward interface that lets images lead; monochrome chrome; non-algorithmic, non-judging collections. | Small type and tiny targets; low-contrast greys. |
| 9 | [Cosmos](https://www.cosmos.so) | Image-first masonry grid with minimal chrome; elegant dark/light. | Social discovery feed, curation by algorithm. |
| 10 | [Rijksmuseum Rijksstudio](https://www.rijksmuseum.nl/en/rijksstudio) | Gallery/"collection" patterns, zoomable artwork, CC0 artwork for demo content. | Dense metadata, search-first navigation. |
| 11 | [Tate](https://www.tate.org.uk) | Confident editorial typography, generous white space, "work first, label second". | High information density, small caption sizes. |
| 12 | [NHS design system](https://service-manual.nhs.uk/design-system) and [NHS accessibility design guidance](https://service-manual.nhs.uk/accessibility/design) | Conservative, tested components, strong focus styles, plain language, contrast guidance, error-message patterns; [nhsuk-frontend](https://github.com/nhsuk/nhsuk-frontend) is MIT. | The institutional blue/white look; it signals "clinic". Borrow *behaviour*, not *skin*. |
| 13 | [GOV.UK Design System](https://design-system.service.gov.uk/accessibility) | Principle of *low physical and cognitive effort*; "one thing per page" question pattern; accessible-auth thinking. | Austere look. |
| 14 | [MS Trust RefuelMS fatigue app](https://www.mstrust.org.uk/news/launch-new-digital-self-help-tool-support-mental-health-people-living-ms) / [MS Society RefuelMS](https://www.mssociety.org.uk/research/news/refuelms-trialling-app-treat-ms-fatigue) | Co-design with people with MS; letting users choose their focus; very simple self-management flows. | Clinical-trial tone; treatment framing. Note: little public UI to copy; MS Society's own review says few digital tools exist specifically for MS. |
| 15 | [Google Arts & Culture](https://artsandculture.google.com) | Image zoom, "look closely" interactions, colour-browse; invitations to look. | Feed-like density, algorithmic categories. |

Take-away: calm products succeed through **one idea per screen, slow rhythm, generous margins, real imagery or texture, and a small controlled palette**; the ones to avoid add rewards, mascots or density. Chrome should recede when an image is present (Procreate, Cosmos, Are.na).

---

## 4. Three candidate aesthetic directions

All three satisfy: AA minimum, AAA for body text, 18 px base, ≥ 56 px primary targets, two-ring focus, `prefers-reduced-motion` honoured. All contrast values below were computed (WCAG relative luminance).
Font note: ES/CA need `á à é è í ï ó ò ú ü ç ñ ¿ ¡ l·l (U+00B7) Ŀ ŀ (U+013F/0140)`. Fonts must be loaded with the **latin + latin-ext** subsets and verified with a test string, e.g. `Col·legi, paral·lel, llengua, ànima, cançó, any, ¿Qué?`. Atkinson Hyperlegible Next is advertised as covering 150+ languages ([Fontsource](https://fontsource.org/fonts/atkinson-hyperlegible-next/about), [Google Fonts](https://fonts.google.com/specimen/Atkinson%2BHyperlegible/about); Catalan not named in the official sources I saw, so verify the middle dot glyph). Self-host via [Fontsource](https://fontsource.org) rather than the Google CDN (privacy: patient IP addresses, GDPR).

### Direction A — "Atmospheric Sanctuary" (extends the Welcome brief)

- **Concept:** The room before you begin: a quiet sky you can sit under while you decide what to make. Continuity with art therapy's "safe container" (temenos).
- **Mood:** hushed, spacious, twilight, private, slow, contemplative.
- **Palette (dark, atmospheric; contrasts computed):**

| Role | Hex | Contrast notes |
|---|---|---|
| Base / deep sky (`--bg`) | `#14202F` | background |
| Surface (cards, panels) | `#1F3140` | background for panels |
| Text primary | `#F4F3F7` | 14.88:1 on bg, 12.10:1 on surface |
| Text secondary | `#C9CEDA` | 10.43:1 on bg, 8.48:1 on surface |
| Accent warm (primary button fill, "distant light") | `#F0D5BF` | button text `#14202F` on it = 11.72:1 |
| Accent teal (links, selected, progress) | `#7FC4C4` | 8.29:1 on bg |
| Twilight violet (secondary highlights, tags) | `#B9AFD6` | 6.47:1 on surface |
| Focus ring | `#FFE3A3` | 13.13:1 on bg, 10.67:1 on surface |

  Status colours to define later (success/warning/error) at ≥ 4.5:1 on the surface, always with icon + text.
- **Type pairing:** Display: **Fraunces** (variable, soft optical sizes, SIL OFL) at weight 400–500 for headings only; body/UI: **Atkinson Hyperlegible Next** (OFL). Fraunces has Latin-ext coverage *(verify l·l)*. Fallback body: **Source Sans 3**.
- **Shape language:** radius 16 px cards, 999 px pill primary buttons, 12 px inputs; borders 1.5 px `rgba(244,243,247,.35)` on surfaces (still ≥ 3:1 on bg; make input borders solid `#8FA0B8`, ≈ 5.5:1); shadows nearly absent, depth via translucency and soft glow (`0 0 40px rgba(240,213,191,.08)`); translucent panels only on a calm area, never behind patient text without a ≥ 90 % opaque scrim.
- **Texture and imagery:** layered blurred mist (CSS radial gradients), subtle film grain via an SVG `feTurbulence` overlay at ~4 % opacity; the patient's artwork is the only strongly coloured thing in the app.
- **Motion policy:** pointer-parallax only on landing/welcome, ≤ 10 px, off for reduced motion and off by default on touch; in-app, only 150 ms opacity fades; generation wait = slow breathing mist (opacity ±8 % over 6 s), replaced with a static still under reduced motion.
- **Cohesion landing ↔ app:** the same sky tones become the app background (flatter and darker in the workspace so the canvas reads clearly); the clouds fade into a static, low-contrast mist band at the top of app pages. Light "paper" canvas panel in the workspace for sketching (sketch area is white/off-white) so drawings are natural.
- **Risks:** dark UIs can reduce legibility for some low-vision users and glare on tablets in bright rooms (offer a light variant); easy to drift into sci-fi/"AI" cliché (the Welcome brief already excludes stars, planets); parallax can trouble double vision/vertigo (keep optional); the tablets in a warm room could show dark UI as heavy; art on a dark ground shifts perceived colour (neutral canvas needed); translucency erodes contrast if uncontrolled.

### Direction B — "Paper Studio"

- **Concept:** A tidy table in north light: warm paper, ink, clay and a bit of watercolour wash, where the app is a sheet of paper and the work is on the table. Art therapy's tactile, material roots.
- **Mood:** warm, grounded, tactile, human, unhurried, adult-crafty.
- **Palette (light; contrasts computed):**

| Role | Hex | Contrast notes |
|---|---|---|
| Paper (`--bg`) | `#F7F1E7` | background |
| Card (`--surface`) | `#FFFBF4` | background for cards |
| Wash (selected rows, soft fills) | `#E6D9C3` | ink on wash 10.75:1 |
| Ink (text primary) | `#2B2622` | 13.32:1 on paper, 14.51:1 on card |
| Ink secondary | `#5A5047` | 6.99:1 on paper, 7.62:1 on card |
| Clay (primary button, accent) | `#8F4A2E` | white-paper text `#FFFBF4` on it 6.39:1; clay text on paper 5.86:1 |
| Sage (secondary button, success-ish, progress) | `#3F6B5C` | `#FFFBF4` on sage 5.87:1; sage on paper 5.39:1 |
| Focus / link blue ink | `#1F4E79` | 7.71:1 on paper |
| Border | `#8C8174` | 3.39:1 on paper (decorative cards); input borders use ink secondary `#5A5047` (6.99:1) |

- **Type pairing:** Display: **Literata** (variable serif, designed for reading, OFL; strong Latin-ext) or Fraunces; body/UI: **Atkinson Hyperlegible Next** or **Source Sans 3**. Serif headings at 28–40 px, regular weight; body 18 px sans.
- **Shape language:** radius 10–14 px, slightly irregular "torn paper" or deckled edge only on decorative images, never on controls; solid 2 px ink-secondary borders on inputs; shadow = a single soft paper lift `0 1px 0 rgba(43,38,34,.08), 0 8px 24px rgba(43,38,34,.06)`.
- **Texture and imagery:** subtle paper grain (SVG noise at 3–5 %), hand-drawn single-line botanicals or loose watercolour washes as section dividers (self-made or CC0), image frames like mounted prints with a thin border (a "mat" that gives the AI image dignity); warm-neutral empty states with a pencil-line drawing.
- **Motion policy:** almost none: opacity fades 150 ms; progress state = slowly filling watercolour wash (static gradient step changes, not animation) with text "Your image is being prepared. You can rest." No parallax.
- **Cohesion landing ↔ app:** the landing is the same paper with a large watercolour wash and serif headline; the app keeps the paper background, replaces wash with white cards. Wordmark in the serif. Replaces the Welcome brief's atmospheric dark sky; shared elements: slow pace, warm light accent, translucent soft edges as washes.
- **Risks:** may feel "craft/boutique", perhaps older or domestic; a serif at small sizes is less legible for low vision (restrict to headings ≥ 24 px); texture can add visual noise (keep ≤ 5 % and off behind text; offer "plain background" toggle); paper-cream can look yellowish on some tablets; warm earth palette can feel dated if overdone.

### Direction C — "Gallery Wall"

- **Concept:** The interface as a neutral gallery: the patient's work is the only colour; the app is the quiet wall, plinth and label. Respect for the artwork as the patient's own, a calm "viewing room" for conversation.
- **Mood:** clear, dignified, spacious, neutral, confident, contemporary.
- **Palette (light neutral + single pigment; contrasts computed):**

| Role | Hex | Contrast notes |
|---|---|---|
| Wall (`--bg`) | `#F5F5F3` | background |
| Surface | `#FFFFFF` | background for cards |
| Ink (text primary, strong buttons) | `#1B1C1E` | 15.62:1 on wall, 17.05:1 on white |
| Graphite (text secondary) | `#53565B` | 6.75:1 on wall |
| Pigment blue (single accent, primary action) | `#2F5D8A` | white text on it 6.88:1; blue on wall 6.30:1 |
| Border / input outline | `#80848A` | 3.44:1 on wall (use ≥ `#6B6F75` for input borders to reach ≥ 4.5:1) |
| Focus ring | `#B4540A` | 4.57:1 on wall (distinct from blue) |
| Stage (dark viewing mode behind artwork) | `#26282B` | text `#ECECEA` 12.49:1; focus `#FFB868` 8.66:1 |
| Success / error | `#2E6B3F` / `#A32D2D` | 5.85:1 / 6.48:1 on wall (always icon + text) |

- **Type pairing:** one family system: **Lexend** (designed for reading proficiency, OFL; strong ES/CA Latin-ext, verify l·l) for headings, **Atkinson Hyperlegible Next** for body/labels; or just Atkinson alone with size contrast. Weights 400 and 600. Alternative: **Inter** (neutral, but generic, flagged as overused).
- **Shape language:** radius 8 px (cards, inputs), 12 px for artwork frames; 1.5 px hairlines; **no shadows** except a very soft elevation on dialogs; artwork presented with a generous white mat (24–48 px) and caption (title, date, "Made by <name>") below, like a museum label.
- **Texture and imagery:** none in the chrome (no textures, no illustration); the only imagery is the patient's own; empty states use a single thin line frame "Your first piece will appear here". Optional "stage" mode switches the viewing area to dark neutral for reflection with the image.
- **Motion policy:** none beyond focus and 120 ms fades; wait state = a calm thin progress bar plus a text status ("Preparing… about 30–60 s"), no looping animation; images appear with a simple cross-fade.
- **Cohesion landing ↔ app:** landing is a "gallery entrance": large type, one featured piece (a calm abstract, CC0 or commissioned), one Begin button; same wall, labels, hairlines inside the app. Less continuity with the Welcome brief's atmosphere; a restrained sky photograph could be kept as the landing hero only.
- **Risks:** may feel cold/clinical if the palette stays too neutral (mitigate with warm light grey `#F5F5F3`, generous voice, real artworks), and too "design-y minimal" for people who want warmth; a single accent can make the UI flat; minimal chrome makes affordances less obvious (keep visible labels and borders); depends on strong image presentation, so weak AI images dominate the page.

### Quick comparison

| | A Atmospheric Sanctuary | B Paper Studio | C Gallery Wall |
|---|---|---|---|
| Continuity with existing Welcome brief | Direct | Partial (warm light, soft edges) | Low (landing hero only) |
| Emotional register | Contemplative, hushed | Tactile, warm | Clear, dignified |
| Risk of clinical | Low | Low | Medium |
| Risk of childish | Low | Medium (if craft too cute) | Very low |
| Risk of "generic AI" | Medium | Low | Medium |
| Low-vision safety | Needs light variant | Good (light, high contrast) | Best |
| Build cost | Medium (layers) | Medium (textures) | Lowest |

---

## 5. Resources compatible with our stack

Everything here is **optional** unless marked.

**Theming and tokens**
- shadcn-vue theming uses CSS variables in `:root` / `.dark` plus `@theme inline` mapping (`--color-background: var(--background)` yields `bg-background`): [shadcn-vue theming](https://shadcn-vue.com/docs/theming), [Tailwind v4 notes](https://shadcn-vue.com/docs/tailwind-v4). Search-verified; community advice says plain `@theme` (not `inline`) if values must switch at runtime by selector; verify against [Tailwind `@theme` docs](https://tailwindcss.com/docs/theme) *(from knowledge)*.
- Plan: define semantic tokens once (`--background`, `--foreground`, `--primary`, `--ring`, plus `--surface`, `--muted`, `--stage`, `--wash`, `--focus`) and expose spacing/radius/font tokens in `@theme`. Add `[data-theme="high-contrast"]`, `[data-text-size]` and `[data-motion="reduced"]` attributes on `<html>`, to deliver the in-app comfort controls (text size, contrast, reduce motion) that the accessibility draft deferred. Use `oklch` for tints; check contrast with a script in CI (e.g. [`culori`](https://github.com/Evercoder/culori) or [`wcag-contrast`](https://github.com/tmcw/wcag-contrast)).
- Fonts: [Fontsource](https://fontsource.org) packages self-hosted `@fontsource-variable/*` (Fraunces, Literata, Lexend, Atkinson Hyperlegible Next, Source Sans 3); [Atkinson Hyperlegible repo](https://github.com/googlefonts/atkinson-hyperlegible) (OFL).

**Reka UI accessibility we get for free** ([Reka UI](https://reka-ui.com/), [llms.txt for agents](https://reka-ui.com/llms.txt), [GitHub](https://github.com/unovue/reka-ui)): WAI-ARIA authoring-practice semantics, keyboard navigation, and focus management in components (Dialog focus trap/return, Tabs/RadioGroup/ToggleGroup roving focus, Select/Menu typeahead, Accordion keyboard, Popover collision handling) *(search-verified at the library level; check each component's keyboard table)*. Not free: contrast, target size, copy, reduced-motion, language attributes, Toast durations (see 2.2), canvas accessibility, and live-region wording for generation status (use `role="status"`, `aria-live="polite"`).

**Icons beyond Lucide:** [Lucide](https://lucide.dev) (ISC, already used; thin 2 px strokes: set `stroke-width: 2.25–2.5` and `size ≥ 24` for low vision); [Tabler Icons](https://tabler.io/icons) (MIT, 5,000+; adjustable stroke); [Phosphor](https://phosphoricons.com) (multiple weights: *regular/bold* useful for low vision; MIT per its repo, verify); [Heroicons](https://heroicons.com) (MIT). Always pair icons with text; icon-only buttons need `aria-label`.

**Illustration / texture / imagery (permissive)**
- SVG `feTurbulence` grain and CSS radial gradients: no licence, no asset weight.
- Open-access artwork (CC0) for demo gallery and empty states: [The Met Open Access](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access), [Rijksmuseum Rijksstudio](https://www.rijksmuseum.nl/en/rijksstudio), [Art Institute of Chicago public domain](https://www.artic.edu/open-access/public-domain-images) *(from knowledge, verify terms per item)*. Better than stock "AI" images for demo content, and avoids inventing patient artwork.
- [Open Peeps](https://www.openpeeps.com) (hand-drawn figures, reported CC0, one secondary source, verify); [unDraw](https://undraw.co/license) (free commercial use, but its licence is custom: no redistribution in packs, no AI training use; not MIT); [Tabler Illustrations](https://tabler.io/docs/illustrations/introduction/license) (end-product only); [Hero Patterns](https://heropatterns.com) and [Haikei](https://haikei.app) (check licence before use). Illustrations of people are discouraged for this audience unless co-designed.

**Open-source Vue / design-system projects to borrow patterns from**
- [unovue/shadcn-vue](https://github.com/unovue/shadcn-vue) (our base) and [unovue/reka-ui](https://github.com/unovue/reka-ui).
- [nuxt/ui](https://github.com/nuxt/ui) (MIT; Vue-compatible components, semantic colour tokens, accessible form patterns, based on Reka UI).
- [nhsuk/nhsuk-frontend](https://github.com/nhsuk/nhsuk-frontend) and [alphagov/govuk-frontend](https://github.com/alphagov/govuk-frontend): form, error summary, task-list, skip-link patterns and tested focus styles (framework-free HTML/CSS; port the *patterns*).
- [steveruizok/perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT; smooth variable-width strokes, input smoothing for tremor), [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) and [tldraw/tldraw](https://github.com/tldraw/tldraw) (React, but good reference for toolbar, undo/redo and pointer handling; check licences before copying code).
- [histoire-dev/histoire](https://github.com/histoire-dev/histoire) (Vue story viewer, handy to review tokens/components across the three directions) and [@vueuse/core](https://github.com/vueuse/vueuse) (`useReducedMotion`-style helpers `usePreferredReducedMotion`, `useSpeechRecognition`, `useStorage`) *(from knowledge, verify)*.
- Accessibility checks: [axe-core](https://github.com/dequelabs/axe-core) / [vitest-axe](https://github.com/chaance/vitest-axe), `eslint-plugin-vuejs-accessibility`.

**Agent / "design skills" resources (optional, credibility varies)**
- Anthropic's official [`frontend-design` skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache-2.0; guidance to avoid generic "AI look": overused fonts such as Inter/Roboto, purple gradients, predictable layouts; search-verified via registry mirrors, not opened directly). Relevant here, but note it pushes bold aesthetics; our brief requires calm restraint, so pair it with this document.
- Reka UI publishes [`llms.txt`](https://reka-ui.com/llms.txt) / `llms-full.txt` for agents (search-verified); shadcn-vue docs likely offer similar *(verify)*.
- Third-party skill registries (skills.sh, tessl.io, mcpservers.org) are aggregators of variable quality; read the SKILL.md before trusting any.
- Suggested house skill: turn the chosen direction into a short `DESIGN.md` tokens + rules file in the repo for agents (palette, type, radius, motion policy, forbidden patterns, copy rules from section 1), which is the equivalent of a design-system prompt guide and cheaper than adopting an external one.

---

## 6. Screen patterns

Common to all: persistent header (wordmark, current section, language ES/CA/EN selector, comfort controls: text size, contrast, reduce motion), "Help / I'd like to talk" always in the same spot, autosave, `lang` updates with the selector, role indicated ("Patient" / "Therapist" chip, plus shape/colour difference).

### 6.1 Landing
- One heading, one sentence of promise, one **Begin** button (≥ 64 px), small quiet "For therapists" link (distinct, ≥ 56 px target), language selector visible in first view. No carousels, no feature grid for the patient route.
- Add a one-line privacy reassurance ("Your work stays between you and your therapist.") and 3 icons-with-text max if the stakeholders need an explanation.
- A: sky/mist hero; B: paper + wash; C: single featured artwork.
- Provide a "Show/hide motion" toggle if parallax is used.

### 6.2 Login (patient-friendly, simplified)
Constraints: 3.3.8 (no cognitive test, allow paste/password managers), tremor (typing is hard), fatigue/memory (no forgotten passwords). Options, from simplest to strongest:
1. **Therapist-initiated session link / QR code or 6-digit session code** displayed on the therapist console; the patient taps the link or types a code (large numeric keypad, 6 digits, paste allowed, no timer pressure) and lands on Patient home. Likely the best fit: the therapist is present and frames the session. Needs backend work (out of scope for the demo; fake it).
2. **Passwordless email magic link** or passkey (WebAuthn: device biometrics; satisfies 3.3.8 and removes typing) with a fallback.
3. **Picture-card/name-tile selection** on a trusted shared tablet: patient taps their name (first name only) then a short PIN (4 digits, large keypad, no timeout, forgiving lockout) *(from knowledge: weigh privacy: names on screen should be minimised; only for therapist-unlocked devices)*.
4. Standard email + password remains for therapists, with show-password toggle, `autocomplete` tokens, paste allowed, plain-language errors that keep entered text.
Layout: one field per screen when possible; labels above fields; primary button full-width ≥ 64 px; "Forgot?" as a clearly labelled secondary button, not tiny text; language selector present. Demo build: tapping **Begin as Ana** (fictional) skips auth.

### 6.3 Patient home (one primary action)
- Greeting by first name (no "Welcome back!" streak language) and a single large primary card: **"Continue your session"** (if one is open: shows the thumbnail of the last piece, a plain "Last time: 12 March") or **"Start something new"**. Secondary row, smaller but ≥ 56 px: "My artwork", "Help". Nothing else.
- Session context line: "With Dr. Puig, today 11:00" with calm status ("Your therapist has opened the session", "Waiting for your therapist").
- "How are you feeling today?" is *optional* and therapist-configurable (3–5 icon+word choices, skippable), not a gate, no scoring.
- Empty state: a gentle line and a "Begin" button; never "You have no artworks!".

### 6.4 Creation workspace
Structure: **3 gentle steps, but not a wizard**: *Start* (choose way in: words / draw / image) → *Make* → *Look & reflect*. A step line shows "Step 2 of 3" without locking navigation; the patient can go back any time without losing work.

- **Prompt input:** large textarea (min 3 lines, 20 px), always-visible label ("What would you like to see?"), dictation button, character count hidden, never rejects short input. **Suggestions** as tap chips below ("A quiet place", "A feeling in colour", "Something from today"), collapsed by default behind "Need an idea?", ≤ 5 at once, therapist-configurable; tapping adds, never auto-generates. Helper text is neutral; no prompt-quality hints.
- **Sketch canvas:** big tool rail (56–64 px): pencil, brush, eraser, colour (≤ 8 big swatches + "more"), size presets S/M/L (no tiny slider; slider has +/− buttons), **Undo** and **Redo** (large, always labelled), "Clear" in a separate place with confirm + undo. Stroke stabiliser on by default; "Done drawing" button explicit. Canvas ≥ 60 % of the viewport, white/off-white ground even in dark theme. Sketch as *guide* with a plain-language slider replacement: **"Stay close to my drawing / Let it wander"** as 3 big options (not a number). Alternative: tap-to-place shapes.
- **Combine / refine:** choose 2 images from "My artwork" as large selectable tiles (checkmark + text, not colour); "What would you like to keep?" prompts in plain words.
- **Generation wait (calming progress state):** a slow, text-led state: "Your image is being prepared." + "This can take about a minute. There is no hurry." + a gentle visual (A: breathing mist, B: wash filling in steps, C: thin progress line). Rules: no spinner-only; no percentage that jitters; a determinate estimate only if reliable; announce start and finish via `aria-live="polite"` once; no sound; offer "Rest while you wait" (dims UI) and "Cancel" (large, safe, no penalty), and keep working in drawing while waiting if possible. Reduced motion: static image with text. Respects 2.2.2 (pausable/static). If it takes long, say so honestly; on error: "The image could not be made. Your sketch and words are saved. Try again when you like." (system-attributed, no blame).
- **Image result with reflect/save flow:** show image large on a "mat"/stage; beneath: neutral caption "Here is what appeared." Three equal-weight big actions: **Keep it**, **Change it** (refine/new variation, framed as "Make another version", preserving the earlier ones), **Set it aside**. Then the **Pause**: "Take a moment. What do you notice?" with 1–3 therapist-configurable prompts, voice or text, skippable "Not now". Optional title field. A "Versions" strip below shows the trail of this piece (sketch → image 1 → image 2), reorderable via buttons only. Nothing graded, no "regenerate" button prominence: place "Make another version" as a secondary action and don't offer one-tap infinite re-roll; show how many versions exist without nudging ("3 versions").
- Persistent "Finish for today" saves all and opens the closure screen.

### 6.5 Gallery ("My artwork")
- Large calm grid (2–3 columns on tablet, tiles ≥ 200 px) of images as the only visual weight, ordered by session date, grouped by session ("12 March"), not by quality; no filters beyond "By session / By date". Each tile is one big target to open; caption: title or date.
- Image detail: large view with simple zoom buttons (+ / − / Fit), version trail, the patient's reflection note, **Keep/Set aside** states, "Hide from screen" button (privacy in shared rooms).
- Deletion = "Set aside" (recoverable for N days) then therapist/patient-confirmed final delete; no bulk destructive actions.
- Empty state: "Your artwork will appear here." plus Begin.
- No sharing/social; "Export/print" only after explicit consent step.

### 6.6 Therapist session console
Allowed moderately higher density, same visual language, clear distinction viewing vs editing. Proposed three-zone layout (tablet landscape or laptop):
- **Left (narrow):** session context: patient first name/initials, session time elapsed (therapist-only), status controls: *Start / Pause / Close session*, "Gentle rest prompt" button that shows the soft card to the patient.
- **Centre (main):** live view of the patient's current piece and the trail of versions (read-only by default; "Take over" is an explicit, patient-visible action). Patient-visible indicator that the therapist is viewing.
- **Right:** **Notes** (private to therapist, autosaved, timestamped, attachable to a specific image), **Reflection prompts** (select which 1–3 prompts the patient sees), **Prompt starters/suggestions** (enable/disable chips), **Comfort settings for this patient** (text size, contrast, reduce motion, brush stabiliser strength, session length soft cue). 
- Header: Patient/Therapist role chip; "Prepare next session" and "Review session" (timeline of images + notes + patient reflections, exportable with consent).
- Therapist can see technical diagnostics (generation errors, queue) but behind a "Technical details" disclosure, so patient screens stay free of jargon.
- Future chatbot: surface as an optional *therapist-controlled* panel (on/off per session), with the patient seeing a clearly labelled assistant that only asks open prompts and stays within the reflection slot (principles 1 and 5); log its messages in the session record.

---

## Suggested decisions to bring to the interview (for I1)

1. Dark atmospheric (A) vs warm paper (B) vs gallery neutral (C), or A for landing/login and C-style neutral stage inside the workspace? *(Hybrid is plausible: A landing + C canvas/gallery.)*
2. Patient login method (session code vs magic link/passkey vs name tile + PIN).
3. Are in-app comfort controls (text size, contrast, reduce motion) in scope for the demo? Recommended: yes, because they are cheap with CSS tokens and highly visible to stakeholders.
4. Session pacing: does the clinic want a soft rest prompt and a default duration?
5. Reflection prompts: voice, text, both? Therapist-authored vs preset?
6. Wording to retire: "generate/prompt/result/retry/quality".
7. Can we show real (consented) or only fictional/CC0 artwork in the demo? Recommended: CC0 artwork and fictional names.

## Source list (primary and notable)
[WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [WCAG quickref](https://www.w3.org/WAI/WCAG22/quickref/) · [Mobile WCAG guidance](https://www.w3.org/TR/wcag2mobile-22/) · [AATA ethics](https://arttherapy.org/ethics/) · [AATA AI imageries course](https://at-institute.arttherapy.org/products/self-study-ai-imageries-in-art-therapy-exploring-the-intersection-of-ethics-expression-and-equity) · [Frontiers Psychology 2025](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1548396/pdf) · [JMIR 2024](https://formative.jmir.org/2024/1/e63038/PDF) · [MS Trust vision](https://mstrust.org.uk/news/research/how-common-are-longer-lasting-sight-problems-ms) · [MS Society eyes booklet](https://www.mssociety.org.uk/sites/default/files/2020-08/MS%20and%20your%20eyes%20LARGE%20PRINT%20MSS.pdf) · [UAB MS Center](https://www.uab.edu/mscenter/resources/about-ms/what-are-symptoms-of-ms) · [VA MS cognition](https://www.va.gov/MS/LEARN_ABOUT_MULTIPLE_SCLEROSIS/Cognitive_Changes_and_Multiple_Sclerosis.asp) · [Frontiers Neurology 2014](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2014.00214/full) · [NHS service manual](https://service-manual.nhs.uk/accessibility/design) · [shadcn-vue theming](https://shadcn-vue.com/docs/theming) · [Reka UI](https://reka-ui.com/).
