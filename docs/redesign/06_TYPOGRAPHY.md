# 06 — Typography (T1)

T1, 2026-11-24. Inputs: `PLAN.md`, `04_DESIGN_RESEARCH.md` §2 and §4, `05_INTERVIEW.md` §1–2, the direction board (`board/index.html`), and the owner's mid-task update that turns direction A into the **"Liminal Sanctuary"** (described below).
Specimen board: **`docs/redesign/type/index.html`**. It shows four pairings, each at dusk and at dawn, in ES, CA and EN.

> **Summary.** Drop Fraunces. Also drop **Atkinson Hyperlegible**, but for a different reason: neither the original nor *Next* has `Ŀ ŀ` (U+013F/0140), so it fails the Catalan gate. I checked the font files, not a marketing page. I recommend **pairing 1, "Atrium": Castoro Titling + Castoro (display) / Luciole (body)**.

---

## 0. The brief as amended

- **Direction A, "dusk outside, dawn inside".** Dusk is a twilight sky (`#14202F` family) with mist, grain and warm distant light (`#F0D5BF`). It covers the landing, login, waiting and session end. Dawn is the same palette made light, for working screens. Artworks are mounted, with a museum label.
- **Owner update ("Liminal Sanctuary").** The sanctuary becomes a soft, vaporwave-tinged liminal space: an empty, timeless museum atrium or arcade at dusk, a pastel sky (lilac, peach, teal), classical columns and Greek statue fragments, with 3D on the landing and the dusk screens. It must stay gentle: no neon glare, no glitch, no VHS. The dawn working screens stay calm and legible.
- **What the update means for type.** Inscriptional Roman capitals for display (wide, spaced, carved), or a contemporary take on them. A museum-label voice. Avoid the vaporwave type clichés: chrome serif, Arial italic with katakana, Times New Roman irony. MS body legibility is non-negotiable.
- **The owner's concern.** The design must not look like "an obvious Claude creation", and typography carries that signal more than anything else.

## 1. Thinking exercise: the first idea, and why it is wrong

### (a) The first three pairings an LLM reaches for

| # | Pairing an LLM writes without thinking | Why it reads as generic, or "AI" |
|---|---|---|
| 1 | **Fraunces + Inter** (or Fraunces + Atkinson Hyperlegible, which is our board's own proposal) on warm cream with a terracotta accent | Since about 2023 this has been the default "warm, human, editorial" answer of every text-to-site generator and of countless startup landing pages. The soft "wonky" serif plus a neutral grotesk plus cream and clay is now a recognisable house style. Nobody chose it for this app: it is what you get when no one chooses. It also reads lifestyle-brand, which clashes with "dignity" in a clinical-adjacent context. Our board picked Fraunces, and that is the evidence that the reflex is real. |
| 2 | **Playfair Display (or Cormorant) + Lato / Montserrat / Poppins** for "therapy" or "wellness" | This is the spa, yoga studio and wellness-coach look. High-contrast Didone or hairline Garamond headings signal pampering and mysticism, the very register the owner wants to avoid. The hairlines also break up on a dark sky for readers with low contrast sensitivity (halation), and Cormorant's light weights fail our 400–600 weight floor. |
| 3 | **Instrument Serif (italic) + Inter / DM Sans / Space Grotesk / Manrope** in tight-tracked headlines | This is the 2024–26 "AI-native SaaS editorial" look: one condensed italic serif word inside a grotesk headline. It is fashionable, which means it will look dated within a year. Its single weight and narrow italic are bad for low vision. |

Honourable mentions of the same reflex: **Lora + Nunito/Poppins** ("friendly healthcare"), **Lexend for everything** (the reflexive accessibility answer, which is fine, but nobody thought about it), and, for this specific vaporwave brief, **Cinzel / Trajan** (movie-poster ancient), **chrome serif**, **Arial italic + katakana** and **Times New Roman irony**.

**Why the first idea is wrong, beyond being familiar.**
1. Fraunces + Atkinson pairs a lifestyle serif with a clinical sans. Neither one belongs to the place we are describing.
2. The accessibility half of it, **Atkinson Hyperlegible, fails Catalan** (§3). The "safe" half of the first idea was the half that broke.
3. It was chosen before the brief existed. "Dusk outside, dawn inside" and "liminal atrium" call for a voice that belongs to architecture and museums, not to a newsletter.

### (b) What type has to do here

1. **A sanctuary without mysticism or spa.** The voice should be quiet, architectural and adult. It should be the name over a door, not incense. No hairlines, no swashes, no script, no wellness Didone, and no Optima-style cosmetics flare used as the main voice.
2. **Dignity for the patient's work.** The museum label (title, date, "Fet per l'Alex") is where type says *your work counts*. It needs a real italic or small caps, and figures that sit well in a date.
3. **Legibility for MS** (`04` §2.1): 18 px base, weights 400–700 only, a large x-height, open apertures, and unambiguous **I l 1**, **0 O** and **rn / m** (double vision and low contrast sensitivity merge similar shapes). Strokes must survive light-on-dark (halation at dusk) and dark-on-light at 7:1 or better. No all-caps for anything longer than about 6 words.
4. **Three languages, one system.** ES, CA and EN with full coverage: `l·l` (U+00B7), precomposed `Ŀ ŀ` (U+013F/0140), `ç`, `à è é í ï ò ó ú ü`, `ñ`, `¿ ¡`, `« »`. Display caps must keep their accents (`ÉS`, `QUÈ`).
5. **Adoptable by students.** The licence is OFL or equivalent, the files are self-hostable (GDPR: no patient IPs sent to a CDN, `05` C10), the font is on Fontsource or npm or a public repo, and it is documented. There are few families to learn.
6. **The liminal brief.** Display should carry "carved, spaced capitals" without becoming a costume.

### (c) Candidates

How I checked: I ran `npm pack @fontsource/<name>` for each, unioned the latin and latin-ext files, and read the cmap with fontTools. "Cat." is the full Catalan gate from (b4). Sources I could not reach from this session are marked as such.

**Display (24 considered)**

| Face | Source / designer | Licence | Cat. | Verdict |
|---|---|---|---|---|
| **Castoro Titling** | Tiro Typeworks, John Hudson (Castoro's caps re-hung on Roman inscriptional proportions) | OFL | ✅ | **Shortlist 1.** A serious, scholarly inscriptional face, not costume. |
| **Castoro** | Tiro Typeworks | OFL | ✅ | **Shortlist 1** (mixed-case partner, italic for labels) |
| **Spectral / Spectral SC** | **Production Type** (their open release, made for screens) | OFL | ✅ | **Shortlist 2.** The small-caps cut is an exact museum-label voice. |
| **Tenor Sans** | Denis Masharov | OFL | ✅ | **Shortlist 3.** A wide, classical sans: inscriptional without serifs. |
| **Source Serif 4** | Adobe, Frank Grießhammer | OFL | ✅ | **Shortlist 4 (safe)** |
| Aboreto | Dominik Jáger | OFL | ✅ | Wide, airy caps. Single weight and caps-only. Good wordmark candidate, too thin for dusk headings. |
| Marcellus / Marcellus SC | Astigmatic | OFL | ✅ | A flared Trajan. Reads as hotel and winery. |
| Cinzel | Natanael Gama | OFL | ✅ | **Rejected: the "ancient/fantasy" cliché**, as overused as Trajan |
| Forum | Denis Masharov | OFL | ✅ | Roman caps with an odd lowercase, and a small x-height |
| Piazzolla | **Huerta Tipográfica** (Juan Pablo del Peral, Argentina), opsz 8–30 | OFL | ✅ | Strong runner-up: sturdy, sharp, Spanish-language foundry. Not liminal. |
| Alegreya | Huerta Tipográfica | OFL | ✅ | Calligraphic. Drifts towards "fantasy novel". |
| Faustina | **Omnibus-Type** (Argentina) | OFL | ✅ | Solid reading serif, little atmosphere |
| Manuale | Omnibus-Type | OFL | ✅ | Book serif, a bit heavy at display sizes |
| Newsreader | Production Type | OFL | ✅ | Good, but it is starting to appear in generated sites |
| Petrona | Ringo R. Seeber | OFL | ✅ | Pleasant, generic |
| Linden Hill | **League of Moveable Type**, Barry Schwartz (Goudy Deepdene revival) | OFL | ✅ | Lovely but old-bookish. Small x-height (0.39). |
| Sorts Mill Goudy | League of Moveable Type | OFL | ✅ | Goudy Old Style. Same issue. |
| Goudy Bookletter 1911 | League of Moveable Type | OFL | ❌ Ŀŀ | Out |
| Prociono | League of Moveable Type | OFL | ❌ Ŀŀ | Out |
| **Ibarra Real Nova** | **Spain**: Ribagorda & Pardo, a revival of Gerónimo Gil's types for Ibarra's 1780 *Quixote* (Real Academia) | OFL | ❌ Ŀŀ | **Out**, and painfully so: it was the best Spanish-heritage story. It could be patched (OFL allows adding a composite `Ŀ = L + ·`), but the gate says out. |
| **Trochut** | **Catalan**: Andreu Balius, after Joan Trochut's *Supertipo Veloz* (Barcelona, 1942) | OFL | ❌ Ŀŀ | Out (ironically) and too decorative anyway |
| Hedvig Letters Serif | Kanon Foundry | OFL | ❌ Ŀŀ | Out |
| Apfel Grotezk | **Collletttivo** (Luigi Gorlero) | OFL | ❌ Ŀŀ | Out |
| Lexend Giga | Lexend wide width | OFL | ✅ | Wide caps, but reads tech or retro-futurist, which tips into vaporwave cliché |
| Happy Times at the IKOB, Avara, Karrik | **Velvetyne** | OFL | not checked | velvetyne.fr is blocked from this session and none is on Fontsource or npm. Excluded for adoptability, not on merit. |
| Gambarino, Sentient, Erode, Zodiak | **Fontshare** (ITF) | ITF Free Font License *(from knowledge, verify: api.fontshare.com blocked)* | not checked | Free for commercial use, but it is **not an open licence**: redistribution is restricted, so a public student repo cannot ship the files. Excluded. |
| Typotheque | — | — | — | I could confirm no open-licence Latin text release. Nothing to evaluate. |

**Body (14 considered)**

| Face | Source / designer | Licence | Cat. | x-height | Verdict |
|---|---|---|---|---|---|
| **Luciole** | Laurent Bourcellier & Jonathan Fabreguettes for the **CTRDV** (French low-vision centre), designed and tested with visually impaired readers | CC BY 4.0 (in the font's name table, v2.001); a mirror also ships OFL 1.1 text. *Verify on luciole-vision.com, blocked here.* | ✅ | **0.545** | **Shortlist 1.** The best evidence base of any open face. |
| **Inclusive Sans** | Olivia King, accessibility-led | OFL | ✅ | 0.500 | **Shortlist 2.** Serifed I, tailed l, slashed 0. |
| **Readex Pro** | Lexend extended (Jockin, Chahine, Shaver-Troup, Orozco, Gómez) | OFL | ✅ | 0.525 | **Shortlist 3.** Lexend's metrics, and less often reflexively chosen. |
| **Source Sans 3** | Adobe, Paul D. Hunt | OFL | ✅ | 0.486 | **Shortlist 4 (safe).** Weak I/l. |
| Atkinson Hyperlegible Next | Braille Institute, Applied Design Works | OFL | ❌ **Ŀŀ** | 0.496 | **Out.** Checked in the Fontsource files *and* the upstream `google/fonts` TTF. |
| Atkinson Hyperlegible (original) | Braille Institute | OFL | ❌ **Ŀŀ** | 0.496 | Out |
| B612 | Airbus / Intactile (cockpit legibility) | OFL | ❌ Ŀŀ | 0.550 | Out |
| Red Hat Text | Red Hat / MCKL | OFL | ❌ Ŀŀ | 0.488 | Out |
| Sofia Sans | Lettersoup | OFL | ❌ Ŀŀ | 0.488 | Out |
| Andika | SIL (literacy) | OFL | ✅ | 0.508 | Very legible, but its school-primer forms risk feeling childish to adults |
| Lexend | Shaver-Troup et al. | OFL | ✅ | 0.525 | Fine, and the reflexive pick (Readex Pro is its quieter sibling) |
| Rosario | Omnibus-Type | OFL | ✅ | 0.497 | Old-style figures by default (`0` looks like `o`). Not for low vision. |
| Ysabeau Office | Christian Thalmann | OFL | ✅ | 0.414 | Small x-height and thin. An Optima-like body reads as cosmetics. |
| Alegreya Sans, Public Sans, Noto Sans, Literata, Archivo, Asap, Chivo, League Spartan | various | OFL | ✅ | — | Pass the gate but add nothing over the shortlist |
| APHont | American Printing House for the Blind | APH licence *(from knowledge)*: free for low-vision use, **not open** | — | — | Excluded on licence |

Side note on `Ŀ ŀ`: standard Catalan text uses `l·l` with U+00B7, and the precomposed letters are rare. Still, they come from some keyboards, from legacy data and from copy-paste, and a missing glyph renders in a fallback font halfway through a word. The gate is right to be strict.

---

## 2. Shortlist: four pairings

Every face below is self-hostable and has its glyphs verified (§3). Each pairing also describes how it reads in the **liminal** frame, as the owner asked.

### 1. "Atrium": Castoro Titling + Castoro / Luciole (liminal answer, **recommended**)

| | |
|---|---|
| Display | **Castoro Titling** 400 (caps only) for the hero, wordmark and dusk headings, tracked +0.06 em (wordmark +0.24 em). **Castoro** 400 and 400 italic for mixed-case headings (greeting) and the label title. |
| Body | **Luciole** 400 / 700 (+ italics) |
| Licence | Castoro: OFL 1.1 (github.com/TiroTypeworks/Castoro). Luciole: CC BY 4.0 per the v2.001 font metadata; a mirror also carries OFL 1.1 text naming "luciole" as a Reserved Font Name. Both allow self-hosting. CC BY needs an attribution line (About page or README). If it turns out to be OFL with the reserved name, serve the **unmodified** files, because subsetting counts as a modification. |
| Availability | `@fontsource/castoro-titling`, `@fontsource/castoro` (both 5.3.0) and Google Fonts. Luciole is **not** on npm, Fontsource or Google Fonts: commit the four woff2 files to `frontend/src/assets/fonts/` (about 100 KB subset, or the full files). |
| Weights / axes | Castoro wght 400–700 + italic. Titling 400. Luciole Regular, Bold, Italic, Bold Italic. |
| Catalan | ✅ all (Castoro, Castoro Titling, Luciole) |
| Low vision | Luciole: **x-height 0.545** (the largest here), cap 0.763, wide-open apertures. I has serifs, l is a plain stem and 1 has a flag and a foot. 0 is narrow and O round. rn ≠ m thanks to generous spacing. It was built specifically for low-vision reading. Castoro Titling is used only at 28 px or above and never for more than one line of caps. |
| Dusk | Pale caps on the sky read as **a name carved over a doorway at evening**. Luciole stays sturdy on dark ground, and its slightly heavy regular resists halation. |
| Dawn | Castoro's italic label looks like a real gallery label. Luciole on the light sky is plain and tool-like, which suits "capable and absorbed". |
| Liminal read | The strongest answer: inscriptional capitals *re-hung on Roman proportions* by a scholarly foundry, not a Trajan or Cinzel costume. It points at classical architecture without quoting a poster. |
| Why it's not generic | No LLM default contains Castoro or Luciole. Each has a traceable reason: Tiro's inscriptional research, and CTRDV's low-vision research. |
| Risk | (1) Caps-only display is limiting: anything longer than a line must switch to Castoro. (2) Luciole has only 2 weights and its own personality (slightly "assistive"), and it is not on npm, so students must handle files and attribution. (3) The licence needs one email or a check of luciole-vision.com. (4) Three family names to learn (Titling, Castoro, Luciole), though only two families. |

### 2. "Label": Spectral + Spectral SC / Inclusive Sans

| | |
|---|---|
| Display | **Spectral** 500 for the hero and 400 for the greeting, with a real italic. **Spectral SC** 500, tracked, for the wordmark and label titles. |
| Body | **Inclusive Sans** 400 / 700 (+ italic) |
| Licence | OFL 1.1 for both |
| Availability | `@fontsource/spectral`, `@fontsource/spectral-sc`, `@fontsource-variable/inclusive-sans` and Google Fonts |
| Weights / axes | Spectral 200–800 static, with italics. Inclusive Sans wght 300–700 + italic. |
| Catalan | ✅ all |
| Low vision | Inclusive Sans: x-height 0.500, I serifed, l tailed, **slashed 0** (unambiguous against O), open shapes. Spectral has a small x-height (0.45), so it is for display only, at 26 px or above. |
| Dusk | Literary and hushed, like **wall text in an empty gallery after hours**. Spectral's sharp serifs keep their edge on the sky at 500. |
| Dawn | The most "museum" of the four. Spectral SC labels look printed on card. |
| Liminal read | Museum rather than monument: it fits the "museum label" part of the brief best, and the "carved capitals" part least (Spectral SC is a refined version of that). |
| Why it's not generic | Spectral is a screen-first Production Type release that is rarely chosen by generators. Inclusive Sans is recent and accessibility-led. |
| Risk | Spectral's light hairlines need weight 500 or more on dark backgrounds. The slashed zero can look technical. It is the most "editorial" of the four, so it sits closer to the publishing look we are avoiding. |

### 3. "Signage": Tenor Sans / Readex Pro

| | |
|---|---|
| Display | **Tenor Sans** 400, tracked caps (+0.10 em) for the hero, wordmark and labels. Mixed case for the greeting. |
| Body | **Readex Pro** 400 / 600 |
| Licence | OFL 1.1 for both |
| Availability | `@fontsource/tenor-sans`, `@fontsource-variable/readex-pro` and Google Fonts |
| Weights / axes | Tenor Sans 400 only. Readex Pro wght 160–700 and a HEXP (hyper-expansion) axis. No italics. |
| Catalan | ✅ all |
| Low vision | Readex Pro: x-height 0.525, I serifed, open even rhythm, Lexend-derived spacing. Tenor Sans has **I and l identical**, so it must never set running text. |
| Dusk | A **quiet transit hall or an arcade at closing time**. It is the most "space" and least "museum" of the four. |
| Dawn | Clean and contemporary, close to wayfinding. Calm, but a little impersonal. |
| Liminal read | The contemporary, serif-less take on inscriptional caps (wide classical proportions), and the closest to the vaporwave mall-atrium memory without its clichés. |
| Why it's not generic | Tenor Sans is rarely used for UI, and Readex Pro is the non-obvious member of the Lexend family. |
| Risk | Wide spaced sans caps are common in **fashion and cosmetics branding**, so this pairing is the one that can tip into "spa". There is one display weight and no italic anywhere, so the label must use caps and spacing for emphasis. |

### 4. "Safe": Source Serif 4 / Source Sans 3 (for contrast)

| | |
|---|---|
| Display | **Source Serif 4** 500, optical sizes 8–60 (auto) |
| Body | **Source Sans 3** 400 / 700 (+ italic) |
| Licence | OFL 1.1 (Adobe) |
| Availability | `@fontsource-variable/source-serif-4`, `@fontsource-variable/source-sans-3` and Google Fonts. Very well documented. |
| Weights / axes | Serif opsz 8–60 × wght 200–900. Sans wght 200–900. Italics. |
| Catalan | ✅ all |
| Low vision | Source Sans 3: x-height 0.486, good apertures, **but I and l are nearly the same bar** and 0/O are close. This is the main legibility weakness on the board. |
| Dusk | Competent, slightly institutional, no atmosphere |
| Dawn | Reads like a university press catalogue: clear, neutral, forgettable |
| Liminal read | It does not answer the brief. It is here as the control. |
| Why it's not generic | It *is* generic, but not "AI" generic. It is the "nobody gets fired" choice. |
| Risk | It erases the identity the owner asked for, and it is weaker on I/l than every other body face here. |

## 3. Glyph verification (font files, fontTools cmap)

Method: `npm pack @fontsource/<name>`, then I unioned all `latin` and `latin-ext` woff2 files and checked them with `fontTools.ttLib.TTFont(...).getBestCmap()`. I re-checked the shortlist against the exact woff2 files that the Google Fonts CSS serves to the specimen. Luciole came from a GitHub mirror of v2.001 (`EstebanMunoz/luciole-font`). Atkinson Hyperlegible (original and Next) and Ibarra Real Nova were also re-checked against the upstream `google/fonts` TTFs, to rule out a Fontsource subsetting artefact. The x-height comes from OS/2 `sxHeight` ÷ UPM.

| Face | l·l U+00B7 | Ŀ ŀ U+013F/0140 | ç ñ, à è é í ï ò ó ú ü (+caps), á | ¿ ¡ « » | x-height | Result |
|---|---|---|---|---|---|---|
| Castoro Titling | ✅ | ✅ | ✅ | ✅ | caps-only | **pass** |
| Castoro | ✅ | ✅ | ✅ | ✅ | 0.475 | **pass** |
| Luciole (Regular, Bold, Italic, Bold Italic; also the embedded subset) | ✅ | ✅ | ✅ | ✅ | 0.545 | **pass** |
| Spectral / Spectral SC | ✅ | ✅ | ✅ | ✅ | 0.450 | **pass** |
| Inclusive Sans | ✅ | ✅ | ✅ | ✅ | 0.500 | **pass** |
| Tenor Sans | ✅ | ✅ | ✅ | ✅ | 0.500 | **pass** |
| Readex Pro | ✅ | ✅ | ✅ | ✅ | 0.525 | **pass** |
| Source Serif 4 | ✅ | ✅ | ✅ | ✅ | 0.475 | **pass** |
| Source Sans 3 | ✅ | ✅ | ✅ | ✅ | 0.486 | **pass** |
| *Atkinson Hyperlegible Next* | ✅ | ❌ | ✅ | ✅ | 0.496 | **fail → out** |
| *Atkinson Hyperlegible* (original) | ✅ | ❌ | ✅ | ✅ | 0.496 | **fail → out** |
| *Ibarra Real Nova* | ✅ | ❌ | ✅ | ✅ | 0.426 | **fail → out** |
| *Fraunces* (for the record) | ✅ | ✅ | ✅ | ✅ | 0.482 | passes. Rejected for genericness, not coverage. |

This is a consequence for `04` §4 and the board: they list Atkinson Hyperlegible Next as the body face for all three directions and Lexend as an option. Lexend passes. Atkinson does not.

## 4. Recommendation

**Pairing 1, "Atrium": Castoro Titling (inscriptions) + Castoro (headings, labels) / Luciole (everything the patient reads).**

The four jobs line up. Luciole is the only open face with a documented low-vision design process and the largest x-height on the board, which is the first job (MS legibility). Castoro Titling answers the liminal brief with real inscriptional scholarship instead of a costume. Castoro's italic gives the museum label its dignity. Nothing about it reads as a model default. Two families, documented on GitHub, are a reasonable load for students.

Rules to adopt with it:
- Castoro Titling only at **28 px or above**, a **single line**, caps tracked +0.04 to +0.08 em. Never for buttons, form labels or any sentence a patient must read.
- Castoro for every mixed-case heading of 24 px or above, and in italic for artwork titles.
- Luciole for body (18 px / 1.6), UI, buttons (700) and small text (15 px minimum).
- Fallback stacks (as in the specimen): `"Castoro Titling","Castoro","Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif` and `"Luciole",Verdana,"Segoe UI",system-ui,sans-serif`. Verdana is the closest common system face in spirit.
- Self-host everything (Fontsource for Castoro; repo files plus `@font-face` for Luciole), with `font-display: swap`, and preload Luciole Regular.
- Before shipping, confirm Luciole's current licence on luciole-vision.com and add the attribution "Luciole © Laurent Bourcellier & Jonathan Fabreguettes, luciole-vision.com".

**Devil's advocate.** Roman inscriptional capitals are, historically, the letters of **monuments and tombs**: the Trajan column base is a funerary and triumphal inscription, and carved serif caps are the lettering of war memorials and gravestones. For people living with a progressive neurological illness, "a name carved in stone over a doorway" can read as *memorial* rather than *sanctuary*. A therapist may see that before we do. Castoro Titling is also only one step away from the Trajan movie-poster cliché in the eyes of someone who is not a typographer. Luciole, meanwhile, is unmistakably an assistive typeface: plain, a little stiff, with only two weights. Next to a refined serif, it may look like a reading aid stuck onto a gallery, which is the opposite of "proud of their work". It also adds friction for every student: no npm package, an ambiguous licence trail and an attribution duty. If the therapists react to the carved caps, the fallback is **pairing 2** (Spectral SC labels keep the museum voice without the monument), and Luciole can stay as its body face, since it fits there too.

## 5. Specimen board

`docs/redesign/type/index.html` is a single file. It loads the Google Fonts faces from fonts.googleapis.com, and Luciole is embedded as base64 woff2 (Latin + Latin-1 + Latin Extended-A, about 100 KB). The page weighs about 176 KB. For each pairing there is a dusk panel and a dawn panel, each with: the hero line in ES, CA and EN; the patient greeting; a mounted artwork with its museum label ("Jardí a l'hora blava", 24 de novembre de 2026, "Fet per l'Alex"); 18 px body; 56 px buttons; 15 px small text; and the stress line `Il1 0O rn m · Col·legi, paral·lel, ŀl · ¿Qué? ¡Sí! «obra»` in both body and display. Page chrome uses light/dark tokens with a toggle. The dusk artwork sits in an arched niche, a small liminal-atrium cue. I checked it with Playwright at 1440 and 390 px: no horizontal scroll at either width (screenshots kept outside the repo).

## 6. Reproduce

```bash
pip install fonttools brotli
npm pack @fontsource/castoro-titling && tar xzf fontsource-castoro-titling-*.tgz
python3 - <<'EOF'
from fontTools.ttLib import TTFont; import glob
cm=set().union(*[TTFont(f).getBestCmap().keys() for f in glob.glob('package/files/*latin*-400-normal.woff2')])
print({hex(c): c in cm for c in (0xB7,0x13F,0x140,0xE7,0xF1,0xBF,0xA1,0xAB,0xBB)})
EOF
```
