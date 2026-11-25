# Vibecheck: the "does it look vibecoded?" rule

**Rule:** ComfyMind must not look like any other app or site built with an LLM.
Every design and copy decision is checked against the red flags below. When an idea
matches a red flag, we move *away* from it on purpose. We don't just tweak it.

This applies to everyone who works on ComfyMind: the redesign agents, Codex or Claude
sessions, and the students building future parts.

---

## 1. The process: criticise the first idea

LLMs (and tired humans) reach for the most statistically common solution first. That is
exactly what makes an interface look generic. So:

1. **Write the first idea down** in one line, e.g. "hero with a gradient headline and three feature cards".
2. **Check it against the red flags (§3).** Name every flag it hits.
3. **Ask what this specific product would do.** Look in ComfyMind's own world for the answer: art therapy, MS, the Liminal Sanctuary (dusk atrium, museum labels, mounted artworks, Tenor Sans caps, dithered 3D). Use that, not "what apps usually do".
4. **Pick the alternative that is furthest from the flags** while still meeting accessibility (`DESIGN.md` §9). If accessibility and "unusual" conflict, accessibility wins, and you find another way to be specific.
5. **Record it.** In your PR or report, add one line: *First idea → flags → what we did instead*.

> Example: *First idea:* a "Generating ✨" spinner. *Flags:* sparkles-for-AI, a spinner on its own, "magic" language. *Instead:* the dusk sun slowly breathing, an honest progress bar, and "Tu obra está en camino".

---

## 2. Regular reviews

| When | Who | What |
|---|---|---|
| Every finished screen or component | **A fresh reviewer** (a person, or an agent that did *not* build it), so nobody is anchored | Screenshots at 1440 and 1024, scored with the checklist in §4 |
| Before every demo or meeting | Project lead | Whole-flow walkthrough asking: "If I saw this with the logo hidden, would I guess an LLM made it?" |
| Every PR (students) | Author, then reviewer | §4 checklist pasted into the PR description, with each flag ticked or explained |

The reviewer answers two questions out loud:
1. **"Does it look vibecoded?"** Answer yes, no or somewhat, and say why.
2. **"What are the obvious LLM red flags?"** List them with locations, worst first.

Anything rated "yes" or "somewhat" is fixed before it ships.

---

## 3. Red flags

### 3.1 Colour and surfaces
- Purple/indigo → blue or pink gradients, especially on heroes or buttons
- Gradient text on headings
- Glassmorphism: frosted translucent cards with blur over a blurry background
- Animated gradient "orbs" or blobs drifting behind content
- Near-black page with one neon accent (acid green, electric violet)
- Warm cream with a terracotta accent and a serif headline (the "artisan AI" look)
- Default shadcn slate/zinc left untouched; `ring-offset` focus rings exactly as shipped
- Teal or blue "hero slab" cards with a decorative circle in the corner

### 3.2 Layout
- Hero → three feature cards (icon in a tinted circle + title + two lines) → CTA band → footer
- Everything centred
- A pill badge above the headline ("✨ New", "Beta", "AI-powered")
- Numbered steps "01 / 02 / 03" that aren't really a sequence
- Every block is a card with the same radius, border and shadow
- **Rounded cards as the default container** (owner flagged this in ComfyMind specifically): rounded rectangles around everything, rounded pill buttons, rounded chips. Prefer architectural edges, hairlines, mats and open layout.
- A near-white app interior that has nothing to do with the brand's hero/landing ("generic dashboard inside, art direction only on the landing")
- Cards that lift on hover (`translate-y-1` + bigger shadow) everywhere
- A left accent bar on rounded cards
- Bento grids for no reason
- Identical spacing everywhere, with no rhythm and no hierarchy

### 3.3 Typography
- Inter, DM Sans, Space Grotesk, Manrope, Plus Jakarta Sans, Poppins, Outfit, Syne, Bricolage Grotesque
- Fraunces, Playfair Display, Instrument Serif, Cormorant or Lora as the "elegant" serif
- Huge tight-tracked bold headline + light grey subtitle, every time
- Uppercase micro-labels with wide tracking above every section ("FEATURES")

### 3.4 Icons and imagery
- **Sparkles icon for anything AI**; wand icons; "magic"
- Emoji as icons or section markers (🎨 ✨ 🚀 💡 👋)
- Lucide icons on every label, button and heading ("icon soup")
- Icons in coloured rounded squares or circles
- Stock 3D blobs, abstract gradient meshes, isometric illustrations
- Generic AI-art heroes (neon, "dreamy" portraits, galaxy brains)
- *ComfyMind specific:* **any human or figurative shape** (busts, faces, hands, bodies)
- *ComfyMind specific:* the word **paciente / pacient / patient** anywhere in visible text (use the person's name, *tú*, or usuario · usuari · user)

### 3.5 Motion and feedback
- Spinners with "Generating magic…" or "Thinking…"
- Fake typing or streaming text effects
- Confetti, celebration bursts, shaking on errors
- Skeleton shimmer on everything
- Toasts saying "Success!" that vanish in 3 s
- Fade-up-on-scroll for every section

### 3.6 Copy (ES / CA / EN)
- *Elevate, unlock, empower, seamless, effortless, supercharge, dive in, journey, unleash, revolutionise*; *potenciar, desbloquear, sin esfuerzo, viaje, sumérgete*; *potenciar, desbloquejar, sense esforç, viatge, submergeix-te*
- "Not just X, it's Y" / "No es solo X, es Y"
- Triads everywhere ("calm, clear and kind")
- Em-dash asides — like this — in UI text
- Exclamation marks and cheerleading ("¡Genial!", "Great job!", "You've got this!")
- "Welcome back! 👋" greetings
- Headings phrased as rhetorical questions
- Over-explaining microcopy ("Click the button below to get started on your creative journey")
- Generic empty states ("Nothing here yet! Start creating to see your items.")

### 3.7 Code (for reviewers of PRs)
- Comments narrating the obvious (`// Main container`, `// Handle click`)
- Wrapper components that only pass props through
- Hard-coded hex values next to a token system
- Copy-pasted shadcn examples with their demo text left in
- Unused props, dead variants, `TODO: implement` stubs shipped as features

---

## 4. Review checklist (paste into the PR or review)

```
Vibecheck — <screen / component>
[ ] Looks vibecoded?   no / somewhat / yes — why:
[ ] Colour & surfaces  (§3.1) flags found:
[ ] Layout             (§3.2) flags found:
[ ] Typography         (§3.3) flags found:
[ ] Icons & imagery    (§3.4) flags found:  (no figurative shapes ✔)
[ ] Motion & feedback  (§3.5) flags found:
[ ] Copy ES/CA/EN      (§3.6) flags found:
[ ] Code               (§3.7) flags found:
[ ] Logo-hidden test: would a stranger guess "an LLM made this"?
First idea → flags → what we did instead:
```

---

## 5. What "specific to ComfyMind" looks like (use these instead)

- **The museum label** (Tenor caps title, technique, date, "Hecha por Alex") instead of generic image cards.
- **The mount and niche** (white mat, arched top) instead of rounded-2xl thumbnails.
- **Dusk and dawn** (a pastel twilight sky only at thresholds, light lilac-grey working screens) instead of gradient heroes.
- **The dithered, low-res atrium** (abstract marble, crisp pixels, static grain) instead of glossy 3D blobs.
- **Words from the studio and the museum** (obra, boceto, otra versión, apartar, sala) instead of SaaS verbs.
- **Plain, quiet copy** that says what happens: "Tu obra está en camino."
- **Text-labelled controls** where an icon alone would be the cliché.
