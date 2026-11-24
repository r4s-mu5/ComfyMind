# 05 — Owner Interview

Interviewer I1, 2026-11-24. Built from `01`–`04`, `AGENTS.md`, the four `docs/*` drafts and the screenshots in `screens/current/`.
The orchestrator asks the rounds in chat. Each question below matches the multiple-choice tool: ≤ 4 per round, 2–4 options, the recommended option first, header ≤ 12 characters, and a free-text "Other" is added automatically.
Direction names stay as in `04`: **A "Atmospheric Sanctuary"**, **B "Paper Studio"**, **C "Gallery Wall"**.

---

## 1. What we know

1. **Users.** Patients are adults with MS. Tremor, fatigue, low contrast sensitivity, double vision and cognitive fatigue are common, and needs change from day to day. Therapists are the second role. Accessibility drives the design and is not a checklist.
2. **Core loop.** A therapist schedules a timed session. The patient makes images from words, from an image, from a sketch, or by blending 2–4 images, and sends them live. The two chat, and the therapist ends the session. "Free creation" also exists outside sessions (`01` §3).
3. **The AI.** SDXL runs through ComfyUI with a fixed "digital painting, calm mood" style at 512 px. Generation takes tens of seconds on unknown hardware. Prompts are machine-translated, and the translator assumes Spanish input (`01` §6.4).
4. **Meeting scope (D1–D3, D6).** Landing → Login → Patient home → Creation → Gallery/result, plus one therapist screen. It is a static hosted build with mocked data and no backend. The stack stays as is.
5. **Today it looks like two products stitched together.** The dark atmospheric Welcome is followed by a pale-mint teal patient layer and then legacy screens in slate, green, blue and red. That is five palettes and three type voices (`03` §2, issue #1).
6. **Worth keeping.** The Welcome copy and calm tone. The hierarchy of the patient home. The empty, loading, result and saved states of the demo workspace, with `aria-live`. The global focus ring and reduced-motion handling. The line "no hay una forma correcta de crear" (`03` "Strengths").
7. **Proposed accessibility floor (`04` §2).** 18 px base text, primary targets of 56 px or more (48 px floor), at least 12 px between targets, AAA contrast for body text, input borders of 4.5:1 or more, and no countdowns. The legacy layer today uses 14 px text, 36 px controls and 1.3:1 borders.
8. **Art-therapy principles (`04` §1).** Process over product, no judgement, patient agency, the therapist holds the session, reflection follows making, private by default, and gentle pacing.
9. **Three researched directions.** A, B and C each have computed palettes, and all pass AAA for body text. Build cost: C is cheapest, A and B are medium.
10. **Neither backend-free mode works alone.** `?demo=1` covers the patient only, and login fails in it. Dev-preview covers the therapist only. The fix is one demo switch, a role chooser, relative dates and hash routing (`01` §7c).
11. **Languages.** ES, CA and EN, default `es`. The legacy screens are Spanish only. The terminology draft still awaits approval (obra vs creación, formal vs informal).
12. **Demo imagery.** There are 60 "template" images, all ComfyUI outputs, plus 3 bundled demo images. The audit found the current picks (neon aurora, hotel room) stock-looking and clashing with the palette.
13. **Origin.** A university TFG that ended upstream in January 2026, followed by a fork redesign since July 2026 (Codex prototype and Welcome screen). All earlier design docs are drafts, and none is binding.
14. **Later: an integrated chatbot.** Research says it should ask open questions and never interpret, live inside the reflection moment, and be switched on or off by the therapist.

---

## 2. Gaps & contradictions

### 2.1 Contradictions across docs and code

| # | Conflict | Sources | Tier |
|---|---|---|---|
| **C1** | **The engine sanitises emotion.** Every workflow adds "calm mood" and negative prompts such as "anxiety, horror, creepy, epic". So the system quietly steers every image toward pleasant. Art-therapy practice says a dark or strange image is as valid as a pretty one. | `01` §6.5 vs `04` §1 | (c). Raise in the meeting as a question for the therapists. |
| **C2** | **The visual anchors pull in different directions.** The Welcome brief makes a dark, translucent, gradient sky the identity anchor. The design brief asks for "one sans family" and "avoid excessive gradients". The app tokens are light mint-teal. Research says dark UIs need a light variant for low vision. A and B also propose serif headings. | Welcome brief; Design brief; `03` §5; `04` §4 | (a), Round 2 |
| **C3** | **How ambitious should accessibility be?** The draft defers text-size, contrast and motion settings and any formal WCAG level ("lightweight prototype"). Research says that for MS these settings are core, and targets AAA body text and 56 px controls. | Accessibility draft; `AGENTS.md` vs `04` §2 | (a). Decided by default (§4). |
| **C4** | **The therapist side promises more than exists.** The brief's nav (Patients, Sessions) and the research console (notes, reflection prompts, comfort settings, pause) go well beyond the code. In the code a therapist sees only the latest submitted image and a chat, and there is no notes table and no patients page. A polished demo could oversell. | Design brief; `04` §6.6 vs `01` §2, §6.3 | (b), R3-Q4 |
| **C5** | **Wording.** The terminology draft keeps "Generar imagen", "Volver a intentar" and "Ver resultado", and the demo workspace shows them. Research says to retire generate, result, try again and prompt on patient screens, because they frame art as output and failure. | Terminology draft; screenshot 15 vs `04` §1 | (b), R3-Q3 plus a default |
| **C6** | **Process over product vs the current flow.** Today each new image overwrites the last, "refine" does not keep the seed, and there are two confirm steps with unclear meaning. Research wants a visible trail of versions and a single "Keep". | `01` §3.5; `03` §4.2 vs `04` §6.4 | (b). Decided by default. |
| **C7** | **Free creation vs "the therapist holds the session".** Free creation outside sessions, the Welcome "Saltar" button and the "Creación libre" card all imply solo use without a therapist. The ethics framing assumes a therapist frames every session. | `01` §3.5; `03` 1.2 vs `04` §1 | (c). Kept as a secondary path by default. |
| **C8** | **Login.** Research's best option (a code from the therapist) needs backend work that does not exist. Signup lets anyone register as a therapist. Demo login is broken. | `04` §6.2; `01` §2, §7b | (b), R3-Q1 |
| **C9** | **Language vs prompts.** The UI offers CA and EN, but the translator assumes Spanish input, so a Catalan description is mistranslated before it reaches the engine. | `01` §6.4, §8 | (c). Informs R4-Q2. |
| **C10** | **Privacy vs fonts.** Research says to self-host every asset and avoid patient IPs reaching CDNs. `index.html` loads Nunito from Google, and Inter is declared but never loaded. | `04` §1, §4 vs `03` §5.2 | (b). Decided by default. |
| **C11** | **"Polished demo" vs a corrupt engine.** `AGENTS.md` says generation "does not need to work". The branch's txt2img workflow is corrupt, so a live generation is not possible even on request. | `AGENTS.md`; `01` §6.5 | (b). D3 settles it: canned images. |

### 2.2 Unknowns not covered by the inventory
- Who sits in the meeting, and what the demo must prove to them. → R1
- The emotional target beyond "calm", which every doc already guarantees. → R1
- The device used to present. → R4
- The source and rights of the demo artwork. → R4

### 2.3 The 14 open questions (`01` §10), de-duplicated and triaged

Tiers: **(a)** blocks the design direction · **(b)** blocks the meeting demo · **(c)** can wait until after the meeting.

| Merged item | From §10 | Tier | Handled by |
|---|---|---|---|
| Demo audience and click-through persona (patient, therapist or both) | 2 | (b) | R1-Q1, R3-Q4. Role chooser by default (§4). |
| Live vs canned generation; which creation modes appear | 1 | (b) | Canned (D3). Modes decided by default (§4). |
| Accessibility target and comfort controls; touch drawing | 10 | (a) / (b) | Floor decided (§4). Touch depends on R4-Q4. |
| Therapist value: watch-and-chat vs a richer console; past-sessions list | 3, 5 | (b) for the demo screen, (c) for product scope | R3-Q4 |
| How patients sign in; who may be a therapist; patient–therapist links | 4 | (b) for login UX, (c) for the account model | R3-Q1 |
| Generation wait (10–60 s), cancel, queue | 9 | (b) for the feel, (c) for cancel and queue | R4-Q1 |
| Languages: default, legacy coverage, prompt language | 7 | (b) for the default, (c) for the rest | R4-Q2 |
| Hosting path, offline use, Google Fonts | 13 | (b) | Decided by default (§4) |
| Repo hygiene; shipping template images publicly | 14 | (b) for asset rights, (c) for moving folders | R4-Q3. D4 covers the repo. |
| Owner of the prompt style and negative prompt; selectable styles; text for blends | 8 | (c) | Flag C1 in the meeting |
| Chat persistence, GDPR, retention | 6 | (c) | Demo uses fictional data only |
| Session timing, overlaps, time zones | 11 | (c) | — |
| Chatbot role (patient companion vs therapist assistant) and the data it needs | 12 | (c) | Layout slot reserved by default (§4) |

---

## 3. Interview rounds

**How to run it.** Ask Round 1 first. Before Round 2, show the V1 board link with A/B/C side by side. **Re-rank Round 2's recommendations using Round 1's answers** (table at the end of Round 1). Rounds 3–4 apply whatever direction is chosen.

### Round 1 — Purpose and emotion

**R1-Q1 · Header: `Audience`** · *multiSelect*
**Question:** Who will be in tomorrow's meeting? Pick everyone who matters.
- **Clinicians and therapists**: Art therapists, neurologists or MS nurses who would use or recommend the app.
- **Funders or managers**: People who decide on budget, a pilot or institutional support.
- **Academic reviewers**: Tutors or a university panel who judge the project as work.
- **Patients or MS groups**: People with MS or an MS association giving first-hand feedback.

No recommendation: this is a fact question.
*Why we ask:* the audience sets the tone of the demo, how deep the therapist side goes, and which language it opens in.
*What changes:* clinicians push R3-Q4 toward a strong therapist screen, funders push R1-Q2 toward "viable product", and a Catalan institution pushes R4-Q2 toward Català.

**R1-Q2 · Header: `Demo goal`**
**Question:** If the meeting remembers one thing from the demo, what should it be?
- **Creating feels calm, safe (Recommended)**: A person with MS gets from the welcome screen to a finished piece in a few gentle steps.
- **Therapist stays in the loop**: Patient and therapist share one live session, with the therapist present and in control.
- **It's a real, viable product**: Everything looks finished, coherent and ready for a pilot.
- **AI art fits therapy ethically**: The AI is a material the patient controls, with privacy and no judgement built in.

*Recommendation basis:* D1's scope is the patient flow, the patient creation flow is the most complete part today (`03` 1.2), and a backend-free demo cannot credibly prove live sync. If R1-Q1 is mostly clinicians, "Therapist stays in the loop" is a close second.
*Why we ask:* one clear claim decides which screen gets the most polish and what the landing page promises.
*What changes:* how the build effort splits between B2 (creation) and B3 (therapist), and the headline on the landing page.

**R1-Q3 · Header: `Feeling`**
**Question:** Beyond "calm", which every option already guarantees, what should a patient feel while using ComfyMind?
- **Capable and absorbed (Recommended)**: "I made this": focused on making, in control of the tools and of what is kept.
- **Safe and unhurried**: "I can rest here": a sheltered place where nothing is demanded.
- **Respected and proud**: "My work matters": the work is taken seriously and shown with care.
- **Curious and playful**: "Let's see what happens": light exploration and happy surprises.

*Recommendation basis:* calm and safety are already the floor in every brief, so they cannot set this product apart. Research names AI eroding patient agency as the main ethical risk, and the MS creative-arts pilot reported gains in self-efficacy (`04` §1). Close call: "Safe and unhurried" is what the existing Welcome screen was built around. "Curious and playful" risks feeling childish.
*Why we ask:* this is the emotional target that every visual choice is judged against.
*What changes:* it feeds R1-Q4 and R2 directly. "Capable" leans toward B, "Safe" toward A, "Proud" toward C.

**R1-Q4 · Header: `Metaphor`**
**Question:** Which place should ComfyMind feel like?
- **A quiet studio (Recommended)**: A calm workroom with materials on the table, where making is the point.
- **A sanctuary**: A sheltered place to pause and breathe before and while creating.
- **A gallery**: A respectful room where finished work is shown and looked at.
- **No metaphor, a clean tool**: A neutral, efficient app that stays out of the way.

*Recommendation basis:* research's own target is "a quiet studio, not a clinic and not a toy" (`04` §3). Art therapy happens in studios, and "process over product" favours the worktable over the wall. A gallery puts the product first. A sanctuary describes the waiting more than the making.
*Why we ask:* the metaphor is the one idea that the palette, type, texture and copy all express.
*What changes:* it maps directly to the Round 2 directions: studio → B, sanctuary → A, gallery → C. A "clean tool" answer means C without the gallery staging.

**Re-ranking Round 2 using Round 1.** Put the matching option first and mark it Recommended.

| R1-Q3 + R1-Q4 answers | Lead option in R2-Q1 | R2-Q2 | R2-Q4 |
|---|---|---|---|
| Capable + studio (default) | B | Light throughout | Paper grain |
| Safe + sanctuary | A | Dark landing, light app | Soft mist |
| Proud + gallery, or "clean tool" | C | Light throughout | Nothing but artwork |
| Mixed | B, with the hybrid notes below | Light throughout | Paper grain |

### Round 2 — Aesthetic direction

**R2-Q1 · Header: `Direction`**
**Question:** Which visual direction should the landing page and the whole app share? (See the board.)
- **B · Paper Studio (Recommended)**: Warm paper, ink and clay tones with gentle serif titles, like a quiet studio table where the artwork rests on the page.
- **A · Atmospheric Sanctuary**: A dusky sky, soft mist and a warm distant light, extending today's welcome screen into the whole app.
- **C · Gallery Wall**: Neutral walls, black ink and one blue accent, where the patient's artwork is the only colour, like a calm gallery.
- **Hybrid (name the mix)**: Combine two directions, for example A's sky only on the landing and B's paper inside the app.

*Recommendation basis:* (1) B is research's emotional target almost word for word, and it is the most art-therapy-specific of the three, rooted in materials and process. (2) It is light, which `04` rates "good" for low vision, while A "needs a light variant" because of glare and low contrast sensitivity. (3) It has the lowest "generic AI" risk, and the audit already reads today's mist as generic glassmorphism (`03` 1.1a). (4) One light theme is the fastest way to fix audit issue #1 by tomorrow. C is cheapest and the most legible, but it spotlights weak or stock-looking images and drifts toward clinical. **A vs B is close to a toss-up.** A keeps the one screen people liked and wins if Round 1 said "safe" and "sanctuary". B's own risk is looking craft-shop or dated, so it needs restraint.
*Hybrid notes (not new directions):* B can borrow C's mounted-print "mat and label" for artwork, which costs nothing and gives the work dignity. B's landing can use a dusk-toned watercolour wash as a nod to A. Avoid a dark landing with a light app unless they share one palette and type system, because that split is today's cohesion bug.
*Why we ask:* this is the decision the whole redesign rests on.
*What changes:* every token in `style.css`, the landing composition, how artwork is framed, and the build cost of B0.

**R2-Q2 · Header: `Light/dark`**
**Question:** Should the app be light, dark, or both?
- **Light throughout (Recommended)**: One light theme from the landing page to the gallery, with no switch.
- **Dark landing, light app**: A dusky, atmospheric entrance, then light working screens in the same colours.
- **Dark throughout**: A dark, hushed app everywhere, with a light option for people who need it.
- **Follow device setting**: Light or dark automatically, based on the tablet or computer's preference.

*Recommendation basis:* low contrast sensitivity and glare favour light (`04` §2.1). Artwork colour reads truest on a light neutral ground. One theme halves the QA work for tomorrow and removes the light/dark seam that causes today's incoherence. If A was chosen, lead with "Dark landing, light app".
*Why we ask:* dark vs light is the most visible single trait, and the docs disagree on it (C2).
*What changes:* the number of token sets (1 or 2), the landing background, and how much contrast QA is needed.

**R2-Q3 · Header: `Typography`**
**Question:** What personality should the headings have? (Body text will be a highly legible sans in every case.)
- **Soft serif titles (Recommended)**: A gentle, bookish serif for titles only, which feels like art and reading rather than software.
- **One legible sans only**: The same plain, highly legible sans everywhere: quieter, and closer to a standard app.
- **Open reading sans**: A wide, friendly sans designed for easy reading, contemporary and neutral.

*Recommendation basis:* a serif display (Fraunces or Literata) is the cheapest single signal of "art, not app", and at 24 px or larger it costs nothing in legibility. The brief's "one sans" rule is about functional text, and that stays in Atkinson Hyperlegible Next. Inter, used today, is flagged as overused and generic (`04` §5). This is a genuine taste call. "One legible sans" is a safe second and fits C.
*Why we ask:* type carries the voice on screens that are mostly words, such as the landing, home and reflection screens.
*What changes:* the font packages, the heading scale, and the wordmark.

**R2-Q4 · Header: `Decor/motion`**
**Question:** How much texture and movement should there be? (In every option, inside the app only short fades are used, and everything is still when the device asks for reduced motion.)
- **Paper grain, line drawings (Recommended)**: A barely visible paper grain and a few single-line drawings in empty states, with nothing moving.
- **Soft mist, slow light**: Blurred mist layers that shift slightly with the pointer, on the landing page only.
- **Nothing but the artwork**: Flat, clean surfaces with no texture or illustration, so the images carry all the interest.
- **Still watercolour washes**: Loose, motionless watercolour colour fields behind headings and empty states.

*Recommendation basis:* this follows the direction (B → grain, A → mist, C → nothing). Research sets the patient motion budget "near zero" because of vertigo and double vision, and texture must stay at 5% or less and never sit behind text (`04` §2.1, §4).
*Why we ask:* texture and motion decide whether the app feels hand-made or templated, and they are also the main accessibility risk.
*What changes:* the landing hero, empty states, the visual for the generation wait, and the asset work in B1/B2.

### Round 3 — Product and UX decisions that change screens

**R3-Q1 · Header: `Login`**
**Question:** How should a patient get in? (The demo will fake it either way. Therapists keep email and password.)
- **Code from the therapist (Recommended)**: The therapist's screen shows a short code, and the patient types 6 large digits or taps a link, with no password to remember.
- **Tap name, short PIN**: On a clinic tablet, the patient taps their first name, then enters a 4-digit PIN.
- **Email and password**: Keep today's standard login, just larger and clearer.
- **Email link or passkey**: The patient taps a link sent by email, or unlocks with the device's fingerprint or face.

*Recommendation basis:* login is 4 of the 8 demo actions (`03` §4.1). Typing and remembering passwords is hard with tremor and cognitive fatigue (WCAG 3.3.8). A code keeps the therapist framing the session, and research ranks it the best fit (`04` §6.2). Caveat: it does not cover free creation at home, which would need a remembered device. A name tile shows patient names on screen, which is a privacy cost.
*Why we ask:* it is the patient's first real interaction, and today it is the heaviest one.
*What changes:* the login screen layout, whether the therapist screen shows a "session code" card, and whether patients see signup at all.

**R3-Q2 · Header: `Reflection`**
**Question:** After making a piece, should the app invite the patient to reflect?
- **Optional gentle pause (Recommended)**: After keeping a piece, one open question appears ("What do you notice?"), answered by typing or speaking, with a clear "Not now".
- **Optional title only**: The patient may name the piece, and all reflection happens out loud with the therapist.
- **No step, just talk**: The app goes straight back to creating, and reflection happens only in conversation.
- **Short required reflection**: A brief written reflection is needed before the piece is saved.

*Recommendation basis:* "reflection follows creation" is a core art-therapy principle and makes the demo visibly art-therapy rather than an image generator. It must be skippable because of fatigue (`04` §1, §2.1). It is also the slot where the future chatbot would ask its questions. Research advises against the "required" option.
*Why we ask:* it adds a screen state to the creation flow and decides what the gallery and therapist can see.
*What changes:* a new state in the workspace, a reflection note on the gallery detail and the therapist view, and the shell slot for the chatbot.

**R3-Q3 · Header: `Vocabulary`**
**Question:** What should the patient's saved pieces be called?
- **Obra · obra · artwork (Recommended)**: "Mis obras / Les meves obres / My artwork", which gives each piece the dignity of art.
- **Creación · creació · creation**: Stresses the act of making over the result, and may feel less intimidating to non-artists.
- **Imagen · imatge · image**: Plain and neutral, matching what the system technically produces.

*Recommendation basis:* the terminology draft recommends "obra", and the existing prototype already uses it in all three languages. **This is a near toss-up with "creación".** "Obra" can intimidate someone who says "I'm not an artist", while "creación" fits "process over product". Either way, "imagen" stays for technical items such as uploads and sources, and "generar, resultado, volver a intentar, prompt" leave patient screens (C5).
*Why we ask:* the word appears on the home, gallery and workspace screens and in the nav, and it frames how patients see their work.
*What changes:* about 30 locale keys, the nav label, and the gallery and empty-state copy.

**R3-Q4 · Header: `Therapist`**
**Question:** Which therapist screen should the demo show?
- **Live session view (Recommended)**: The therapist sees the patient's current piece and its versions as they appear, with chat and private notes alongside.
- **Therapist home: today**: A calm overview of today's sessions and patients, with recent artwork, as the starting point.
- **Session review afterwards**: A timeline of one finished session, with its pieces, versions and the patient's reflections, for follow-up.
- **Patient side only**: Show only the patient journey and describe the therapist's role out loud.

*Recommendation basis:* real-time pairing is what sets ComfyMind apart. The screen already exists in code, so redesigning it is honest (C4), and today it is the weakest-looking screen (red pill, blue chat; `03` issue #5). Close second: "Session review", which is easier to fake and shows off reflections. Notes do not exist in the backend, so present them as a concept.
*Why we ask:* D1 allows one therapist screen, and this choice sets B3's scope and the mock data.
*What changes:* B3's screen, whether the demo needs scripted live updates or a second window, and the role chooser's landing route.

### Round 4 (optional) — Remaining demo blockers

**R4-Q1 · Header: `Waiting`**
**Question:** Making an image really takes 10–60 seconds or more. How should that wait feel?
- **Calm words, slow visual (Recommended)**: A gentle line such as "Your image is on its way, there's no hurry", with a slow, quiet visual that stays still if motion is reduced.
- **Honest progress bar**: A thin bar with an estimate such as "about a minute", and nothing decorative.
- **Keep working meanwhile**: The patient can keep drawing or writing, and is told gently when the image is ready.
- **Instant in the demo**: The image appears almost at once, so the demo skips the wait.

*Recommendation basis:* waiting is when anxiety and fatigue build. Research asks for text-led status, no spinner on its own, no jittering percentage, and an announcement through `aria-live` (`04` §6.4). Making the demo instant would hide a real trait from stakeholders, so a short wait of about 3 s is shown. "Keep working meanwhile" is good but belongs after the meeting.
*Why we ask:* every creation path passes through this state.
*What changes:* the loading state design and the demo's fake delay.

**R4-Q2 · Header: `Language`**
**Question:** Which language should the demo open in? (The other two stay one tap away.)
- **Español (Recommended)**: The demo opens in Spanish.
- **Català**: The demo opens in Catalan.
- **English**: The demo opens in English, for an international audience.

*Recommendation basis:* Spanish is the code default and the only language in which a typed description works end to end today (C9). **This is a toss-up that depends on R1-Q1.** For a Catalan institution, Català is the better choice.
*Why we ask:* the first screen sets the tone, and the copy QA tonight starts in that language.
*What changes:* the default locale, which language gets copy-edited first, and the sample descriptions in the demo.

**R4-Q3 · Header: `Demo art`**
**Question:** Which images should fill the demo's gallery and results?
- **Our own best outputs (Recommended)**: A curated set of calm, painterly images already made by ComfyMind's own engine, so people see what it really produces.
- **Public-domain museum art**: Freely licensed paintings from museums such as the Met, which are beautiful but not what the system makes.
- **A fresh set made tonight**: New images made with the real engine before the meeting, matched to the demo's sample descriptions.
- **Abstract placeholders**: Soft abstract colour fields that clearly read as placeholders.

*Recommendation basis:* in every direction the artwork is the strongest colour on screen. Presenting museum masterpieces as "patient work" would oversell the AI. The 60 existing ComfyUI outputs are honest and need no licence check, but they must be curated: drop the neon aurora and the hotel room (`03` 1.2). A fresh set is best only if a GPU machine is actually available tonight. Museum art can still serve as a landing-only hero.
*Why we ask:* it is the biggest content decision left, and it raises rights and honesty questions.
*What changes:* the bundled asset set, the landing hero, and the mapping from canned results to prompts.

**R4-Q4 · Header: `Device`** · *multiSelect*
**Question:** What will the demo be shown on?
- **Laptop on a big screen**: Presented from a laptop to a projector or TV.
- **Tablet in people's hands**: Stakeholders touch and try it on a tablet.
- **Video call share**: Shared over a remote screen share.

No recommendation: this is a fact question.
*Why we ask:* it decides which viewport gets tonight's QA and whether touch drawing must work.
*What changes:* QA prioritises 1440 px or 1024 px. Choosing "Tablet" makes the canvas pointer-events fix (`01` §7c-7) a must and enlarges the canvas tools.

---

## 4. Questions deliberately not asked (orchestrator decides)

| Decision | Default | Reason |
|---|---|---|
| Accessibility floor | 18 px base, 56 px patient primary targets (48 px floor, therapist 44 px), at least 12 px spacing, AAA body text, input borders and icons at 4.5:1 or more, 3 px two-tone focus ring | Evidence-based (`04` §2), and not a taste call (resolves C3) |
| Comfort controls in the demo | Header "Comfort" menu: text size 100/125/150% and Reduce motion. High contrast only if time allows. | Cheap with tokens, visibly MS-specific to stakeholders, recommended by `04` |
| Motion policy | App: 150 ms opacity fades only. No parallax on touch. Everything still under reduced motion. | Vertigo and double vision (`04` §2.1) |
| Register | Informal *tú / tu*, singular throughout. Fix the mixed "vuestra / confiad". | Matches the existing prototype copy. Plain language. |
| Retired words on patient screens | No *generar, resultado, volver a intentar, prompt, calidad*. Use *crear, aparece, otra versión, guardar, apartar*. | `04` §1 (resolves C5 beyond R3-Q3) |
| Creation flow shape | One "way in" choice (words / draw / image), one primary action, a single **Keep** (no double confirm), a small versions strip, and a quiet "Marta can see this" line in sessions | `03` §4.2, `04` §6.4 (C6) |
| Creation modes in the demo | Words and Draw work with canned results. From-image and Combine either work with canned results or are left out, never shown disabled. | Disabled 60%-opacity stubs fail contrast and over-promise (`03` 1.2c) |
| Patient nav | Home · My artwork · Help. The session is entered from the Home card. "Create on my own" stays as a secondary card. | One obvious task (`AGENTS.md`). Keeps real functionality (C7). |
| Demo mechanism | One build-time demo switch, a role chooser on login ("Enter as Alex / as Marta Soler"), an in-memory store, session times relative to now, and a small persistent "Demo" tag instead of a banner | `01` §7c. The current banner and stale date confuse (`03` §4.2-5). |
| Names | Keep the fictional "Alex" (patient) and "Marta Soler" (therapist) | Already translated in the copy, and fictional as `04` requires |
| Hosting | Hash routing, base-relative assets, no 401 redirect by pathname, works on any static host | `01` §9 P0-3 |
| Fonts | Self-hosted via Fontsource, latin + latin-ext, checked with "Col·legi, paral·lel, cançó, ¿Qué?". Body in Atkinson Hyperlegible Next. Drop Nunito and the Google CDN. | Privacy and coverage of Catalan glyphs (C10) |
| Icons | Lucide at stroke 2.25, 24 px or larger, always with a text label | Low vision (`04` §5) |
| Landing actions | One "Begin" plus a quiet "For therapists" link. Remove the ambiguous "Saltar". Show the logo mark. | `03` 1.1 (d, f) |
| Therapist styling | Same tokens, moderately denser layout. Destructive trigger and confirm both styled as destructive. | `AGENTS.md`, `03` issue #5 |
| Chatbot | Not built. The session shell reserves one side-panel slot shared with the therapist chat. If the chatbot comes up in the meeting, the stance is "asks, never interprets, therapist-controlled". | Tier (c). Keeps the layout future-proof (`04` §6.6). |
| Topic for the meeting, not the build | C1, the negative prompt that filters "anxiety, horror, creepy" | It is a clinical decision for the therapists, not a design one |

---

## 5. Answers

| Round | Question | Answer | Notes |
|---|---|---|---|
| 1 | Q1 Audience | Academic reviewers + the research project's director | The director supervises several final-degree projects (TFGs), each building part of the app. **Our deliverable is a design direction and system that students can implement now and adapt future parts to.** |
| 1 | Q2 Demo goal | Creating feels calm, safe | |
| 1 | Q3 Feeling | All four: safe/unhurried, capable/absorbed, respected/proud, curious/playful | Weighted, all kept in mind. Lead with safe (sanctuary), support capable and proud through artwork framing, and allow gentle curiosity. |
| 1 | Q4 Metaphor | A sanctuary | |
| 2 | Q1 Direction | A + artwork frames | A as the identity. B's mounted print and C's museum label for artworks. **Later addition from the owner:** a *liminal, soft-vaporwave sanctuary*: an empty museum atrium at dusk, a pastel sky, columns and classical statue fragments, with reactive 3D models on the landing and where it makes sense. Keep it gentle rather than unsettling. Prototype: L1. |
| 2 | Q2 Light/dark | Dusk outside, dawn inside | Dark twilight on the landing, login and in-between moments; a light 'dawn' variant on working screens, in one palette. |
| 2 | Q3 Typography | Open: avoid the 'obvious LLM' look | Owner: type must not read as an obvious Claude creation. Run a critique exercise ('review the first idea and why it could be wrong'). Fraunces is under suspicion. Exploration: T1. |
| 2 | Q4 Decor/motion | Mist on dusk screens + mist everywhere, both behind user toggles | Goes into a Comfort panel: atmosphere level, motion on/off, 3D off, text size. |
| 3 | Q1 Login | Email and password | Keep the standard login, made larger and clearer. The demo keeps the 'enter as patient/therapist' shortcut. Show password, no timeouts, paste allowed (WCAG 3.3.8). |
| 3 | Q2 Reflection | Optional gentle pause | One open question after keeping a piece, with a clear 'Not now'. This is the future chatbot slot. |
| 3 | Q3 Vocabulary | Obra · obra · artwork | |
| 3 | Q4 Therapist | Live session view | Current piece and versions, chat, private notes (concept). |
| 4 | Q1 Waiting | Sanctuary visual + an honest progress bar | Copy: 'Your artwork is on its way' (no 'there's no hurry'). Dusk sanctuary scene or poster, plus a thin progress bar. aria-live, and still under reduced motion. |
| 4 | Q2 Language | Español | |
| 4 | Q3 Demo art | Our own best outputs | Curate the template images and drop neon or odd ones. |
| 4 | Q4 Device | Video-call screen share + reviewers' own copy on their own computers | Desktop first (1440 and 1280). The hosted link must work standalone on any laptop. The clean repo should run locally with `npm run build:demo`. |
