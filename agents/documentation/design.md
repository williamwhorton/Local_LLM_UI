# Local — UI Design & Styling Document

**Status:** Approved design direction for the frontend build. The interactive team should treat this document as the source of truth, and use `design/mockup.html` (self-contained, static) as the visual reference. The current `frontend/` scaffold is intentional placeholder styling and must be replaced with this system.

## 1. Purpose

This document specifies the complete visual language and interaction design for **Local**, the LAN chat frontend for LM Studio. It exists so an implementer can build the Svelte 5 frontend without further design input.

The mockup (`design/mockup.html`) is static and shows four states:
`Empty → Streaming → Conversation (complete) → Stopped`, plus Dark/Light via a small control panel. Use it alongside this document.

## 2. Design Principles

1. **Calm, not loud.** One accent color; everything else recedes. No gradients-on-gradients, no glow spam.
2. **Warm, not generic-techy.** Avoid blue/purple "AI SaaS" conventions. The palette is a warm charcoal (dark) / warm paper (light) with a single ember accent.
3. **Self-hosted by identity.** No external font CDNs, nothing leaves the machine. All type uses local/system stacks (specified below). If a designer optional enhancement ever comes in, fonts must be bundled.
4. **Simple, but with craft.** Restraint in layout, but thoughtful micro-details: a streaming caret, a pulsing status dot, a serif italic accent in the empty state, ambient dot-texture.
5. **Accessible and resilient.** Dark and light themes, `prefers-reduced-motion` honored, keyboard-usable, WCAG-compliant contrast.

## 3. Brand / Voice

- **App name:** "Local" (lowercase wordmark).
- **Motif:** a 4-point spark (used as the brand mark and the assistant avatar).
- **Copy tone:** plain, warm, technical. The empty state speaks to the privacy value: *"Everything stays here."*
- **Default model naming in UI copy:** use the live model name from the selector (e.g. `phi-4-mini-instruct · runs on this machine`).

## 4. Design Tokens

All colors must be exposed as CSS custom properties so Dark and Light themes share one component implementation. Definition sites:

- Theme variables: `:root` (dark default) + `@media (prefers-color-scheme: light)` override (see `app.css`).
- Semantic aliases (below) are what components consume — never hardcode hex in components.

### 4.1 Color — Dark theme

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0f0d11` | App background (warm charcoal, slightly violet) |
| `--surface` | `#17151b` | Bubbles, chips, panels |
| `--surface-2` | `#1e1b23` | Menus, jump button |
| `--surface-3` | `#272129` | Hover fills |
| `--border` | `#26222c` | Hairlines |
| `--border-strong` | `#3b3543` | Hover borders, menu borders |
| `--text` | `#ece8e3` | Primary text (warm off-white) |
| `--text-2` | `#a9a3ad` | Secondary text |
| `--text-3` | `#847d8a` | Microcopy, meta (keeps ~4.5:1 contrast) |
| `--accent` | `#f2a15c` | Single accent (ember) |
| `--accent-2` | `#ef7a62` | Gradient end |
| `--accent-ink` | `#211204` | Text/icons on accent surfaces |
| `--accent-soft` | `rgba(242,161,92,.16)` | Tinted fills (user bubble, selected menu item) |
| `--accent-gradient` | `linear-gradient(135deg, #f2a15c, #ef7a62)` | Brand mark, send button, empty-state mark |
| `--focus-ring` | `rgba(242,161,92,.4)` | Focus rings |
| `--success` | `#4ec488` | Online/status dot |
| `--glow-hot` | `rgba(242,161,92,.08)` | Ambient top glow |
| `--glow-cool` | `rgba(122,96,186,.10)` | Ambient bottom-right glow |
| `--dot` | `rgba(255,255,255,.032)` | Ambient texture dots |
| `--shadow-pop` | `0 24px 60px rgba(0,0,0,.5)` | Menus/popovers |
| `--shadow-float` | `0 8px 26px rgba(0,0,0,.4)` | Floating controls |

### 4.2 Color — Light theme

| Token | Value |
| --- | --- |
| `--bg` | `#f6f4ef` (warm paper) |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f0ece5` |
| `--surface-3` | `#eae5da` |
| `--border` | `#e5e0d6` |
| `--border-strong` | `#d1c9ba` |
| `--text` | `#262119` |
| `--text-2` | `#5f5749` |
| `--text-3` | `#8b8275` |
| `--accent` | `#c25a26` |
| `--accent-2` | `#a6401a` |
| `--accent-ink` | `#ffffff` |
| `--accent-soft` | `rgba(194,90,38,.1)` |
| `--accent-gradient` | `linear-gradient(135deg, #d0662e, #b5451d)` |
| `--focus-ring` | `rgba(194,90,38,.35)` |
| `--success` | `#1c8a52` |
| `--glow-hot` | `rgba(194,90,38,.07)` |
| `--glow-cool` | `rgba(122,96,186,.06)` |
| `--dot` | `rgba(70,56,32,.05)` |
| `--shadow-pop` | `0 24px 60px rgba(100,80,40,.18)` |
| `--shadow-float` | `0 8px 26px rgba(100,80,40,.14)` |

Light theme is selected automatically via `@media (prefers-color-scheme: light)`.

### 4.3 Ambient background (global, both themes)

Painted on `body`, not per-component:

```css
background: var(--bg);
background-image:
  radial-gradient(1100px 560px at 50% -12%, var(--glow-hot), transparent 62%),
  radial-gradient(820px 540px at 112% 116%, var(--glow-cool), transparent 60%);
background-attachment: fixed;
```

A fixed dot-texture overlay, fading out below the top area:

```css
body::after {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(var(--dot) 1px, transparent 1.5px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(760px 440px at 50% -8%, black, transparent 72%);
  mask-image: radial-gradient(760px 440px at 50% -8%, black, transparent 72%);
}
```

App content lives in a wrapper with `position: relative; z-index: 1`.

### 4.4 Typography

**No webfont/CDN dependency.** Local system stacks only; the first entries apply when installed (Inter, Fraunces), then strong generic fallbacks. Bundling fonts is optional and must be offline-safe.

| Token | Stack | Used for |
| --- | --- | --- |
| `--font-ui` | `'Inter', 'Avenir Next', 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif` | All UI text |
| `--font-display` | `'Fraunces', 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif` | Wordmark, empty-state headline |
| `--font-mono` | `ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace` | Code inline + blocks |

Type scale (all in `rem`):

| Use | Size | Weight | Notes |
| --- | --- | --- | --- |
| Empty-state title | `clamp(1.9rem, 4.5vw, 2.55rem)` | `420`, `-0.02em` | Display serif; italic ember word inside |
| Wordmark | `1.2rem` | `600`, `-0.02em` | Display serif |
| Message text / composer | `0.95rem` | `400` | UI, `line-height 1.7` |
| Chips / menus | `0.78–0.82rem` | `400/600` | UI |
| Meta / hints / dividers | `0.68–0.74rem` | `400/600` | `letter-spacing .12em` for label-like text |
| Code block | `0.78rem` | `400` | Mono, `line-height 1.6` |

### 4.5 Radii, spacing, motion

- Radii: composer `1.35rem`, bubbles `1.1rem` (asymmetric corner `0.4rem` toward the participant), brand mark `0.65rem`, chips/buttons `0.55–0.9rem`, code block `0.7rem`, empty-state mark `1.05rem`.
- Spacing rhythm: based on `0.25rem` steps; thread columns `46rem`, topbar `52rem`.
- Motion durations `0.15–0.3s`, easing `ease`. Animations:
  - `rise` (message entrance: fade + 6px up), `0.3s ease both`.
  - `blink` (streaming caret), `1.05s steps(2, start)`.
  - `pulse` (status dot ring), `2.4s ease-out infinite`.
  - `float` (empty-state glow), `9s ease-in-out infinite`.
- All animations disabled under `prefers-reduced-motion: reduce`.

## 5. Layout

Flex-column full-height shell (no overlapping overlays):

```
shell (100dvh, column)
├─ topbar      (sticky, hairline bottom border, backdrop-blur)
│  └─ max-width 52rem, brand left, actions right
├─ main        (flex:1, min-height:0, overflow-y:auto)  ← the only scroller
│  └─ inner (max-width 46rem) — thread or empty state
└─ footer      (flex:0, max-width 46rem) — composer + hints
```

- Scrollbars: thin, `--border-strong` thumb on transparent track.
- `:focus-visible` ring: `2px solid var(--accent)`, `2px` offset.
- Selection: `var(--accent-soft)` background.
- Breakpoint `600px`: hide the status label and the "self-hosted" pill.
- Breakpoint `520px`: composer hints collapse to the right-hand hint only.

## 6. Component Specifications

### 6.1 Header (`Header.svelte`)

- **Brand:** 30px rounded square with the spark glyph on `--accent-gradient`, ink `--accent-ink`; wordmark "local" in display serif; small uppercase pill "self-hosted".
- **Model selector:** chip with layer icon (accent) + name + chevron (rotates when open). Popover menu: surface-2, `--shadow-pop`, `--border-strong`, options show name + tagline; hover `--surface-3`; selected = `--accent-soft` fill, accent name. `aria-haspopup="listbox"`, `aria-expanded`, `role="option"` + `aria-selected`, closes on outside click and Escape.
- **Status indicator:** `--success` dot with expanding pulse ring, label "LM Studio online". Offline state: `--text-3` dot, static. `aria-live="polite"`.

### 6.2 Empty state (part of message list)

Per the mockup, centered in the scroll container:

- Floating radial glow (`.glow`, accent-soft, blurred, slow `float` animation).
- Spark mark in `--accent-gradient` square (44px+radius 1.05rem), soft accent shadow.
- **Title:** display serif, "Everything stays *here*." — *here* is italic with accent-gradient text via `background-clip: text; color: transparent`.
- **Subcopy:** one sentence mentioning the current model and LM Studio. *(Live copy: replace model name dynamically.)*
- **Suggested prompts:** 2–3 pill chips with an arrow glyph (accent). Hover: accent border mix, lift 1px, arrow nudges right.

### 6.3 Message list

`<section>` with `aria-label="Chat messages"`, `aria-live="polite"`. This region is the scroll container.

- **Day divider:** centered uppercase label with hairline rules both sides.
- **Message row:** grid `2rem 1fr`; assistant rows have a spark avatar (28px accent-tinted tile, accent border); user rows are right-aligned (1-column grid, `justify-items: end`).
- **Bubbles:**
  - Assistant: `--surface`, `--border`, radius `1.1rem 1.1rem 1.1rem 0.4rem`.
  - User: `--accent-soft` fill, `color-mix(in srgb, var(--accent) 26%, transparent)` border, radius mirrored.
  - Max width `82%` for user, full column for assistant.
- **Text:** `0.95rem / 1.7`, `white-space: pre-wrap` while streaming; formatted after completion.

**Markdown-lite rendering (assistant, completed):** escape HTML, then render
`**bold**` (weight 600), inline `` `code` `` (mono, surface mix, accent text), fenced code blocks (`--bg` panel, mono, subtle border, `white-space: pre`, horizontal scroll), and `-` / `1.` lists.

**States:**

| State | Rendering |
| --- | --- |
| `active` (streaming) | raw text `pre-wrap` + blinking 2px ember caret at end; no actions |
| `complete` | formatted markdown + hover actions |
| `stopped` | raw partial text + dashed pill "Generation stopped" + hover actions |

**Actions** (assistant only, hover or keyboard-focus reveal; always visible when `@media (hover: none)`): copy (clipboard write, brief success state: check glyph in `--success` for ~1.4s) and regenerate (re-runs the reply). Small 28px icon buttons, `--text-3`, hover `--surface-2` fill + accent icon.

**Jump to latest:** floating button bottom-right of the scroll region; appears (opacity + translate) only when scrolled >96px off-bottom; smooth-scrolls to bottom; `tabindex="-1"` / `aria-hidden` until shown.

Auto-scroll behavior: force-stick while the last message is streaming; otherwise stick only if the user is already within the bottom threshold; never yank a scrolled-up reader.

### 6.4 Composer (`ChatInput.svelte`)

- **Container:** rounded pill, `--surface`, `--border`, large soft shadow. `:focus-within` gains accent border + 4px `--focus-ring` glow.
- **Textarea:** borderless, transparent, single-row auto-grow up to `9rem` (max-height), placeholder `--text-3`. Enter submits, Shift+Enter inserts a newline.
- **Send button:** 40px rounded square, `--accent-gradient`, `--accent-ink`. Morph:
  - Idle → arrow-up glyph.
  - Streaming → square "stop" glyph, becomes `--surface-2` fill with `--border-strong` and squared corners (`0.7rem`). `aria-label` flips between "Send message" / "Stop generating".
  - Empty input: disabled at `0.36` opacity, `not-allowed`. (Decide: disable when empty vs. allow inert submit — implementer picks one and keeps it consistent.)
- **Hints row:** "Enter to send · Shift+Enter for a new line" (left); model + green success dot, "``{model} · runs on this machine``" (right). Microcopy size, `--text-3`.

## 7. Interaction Behavior

1. **Send:** appends user msg + assistant msg in `active` state, composer clears, focus returns to textarea, auto-scroll sticks.
2. **Streaming:** content mutates into the active bubble's raw text; caret present; send button is the stop control.
3. **Stop:** freezes partial text (unrendered/raw), marks message `stopped`, shows the dashed pill, restores idle composer.
4. **Regenerate:** if a stream is running, stop it first, then restart streaming into that same bubble.
5. **Copy:** write raw text to clipboard; success flash on the button.
6. **Model change:** updates the header chip and the composer hint; conversation history is retained.
7. **Errors:** when live backend errors occur, surface them inside the message list as an assistant bubble variant (dashed `--border-strong`, `--text-2`) with a retry affordance, never as a browser alert. Provision for this now even though mockup shows only the happy path.

## 8. Accessibility Requirements

- App shell = `<main>`; message region has a `region` role via labeling; composer is a labeled `<form>`.
- Streamed content lives in an `aria-live="polite"` region.
- All icon-only buttons carry `aria-label`s.
- Contrast: text pairs target WCAG AA (minimum 4.5:1); `--text-3` was chosen to stay above 4.5 on both backgrounds.
- Focus ring on accent color; visible keyboard focus everywhere.
- `prefers-reduced-motion`: disable all animation and transitions.
- `color-scheme` set per theme so native controls match.
- Hidden/unshown controls (e.g. jump button) are removed from tab order and AT visibility.

## 9. Suggested Implementation Map (Svelte scaffold)

Keep the existing scaffold structure; replace styling:

| File | Responsibility |
| --- | --- |
| `frontend/src/app.css` | Global tokens, themes, base, ambient background, scrollbars, focus |
| `frontend/src/App.svelte` | Shell state: `messages`, `streaming`, current model; send/stop/regenerate orchestration |
| `frontend/src/lib/components/Header.svelte` | Brand, model selector, status |
| `frontend/src/lib/components/MessageList.svelte` | Scroll region, empty state, thread rendering, actions, jump-to-latest |
| `frontend/src/lib/components/ChatInput.svelte` | Composer, auto-grow, send/stop, hints |
| `frontend/src/lib/format.ts` | markdown-lite renderer + HTML escaping |
| `frontend/src/lib/stream.ts` | Streaming client that reads the proxy `/api/chat` stream and emits partial text |

Wire the real stream per `agents/documentation/plan.md` (`POST /api/chat` → fetch `ReadableStream` → partial text → active bubble). The mockup's token/chunk cadence suggests chunk cadence pacing only; the real transport must parse SSE/JSONL events, not raw chunks.

### Content strings (source of truth)

```text
Empty title:    Everything stays here.
Empty sub:      {model} answers from this machine. The browser only talks to the proxy on your LAN.
Composer hint:  Enter to send · Shift+Enter for a new line
Model hint:     {model} · runs on this machine
Status online:  LM Studio online
Stopped chip:   Generation stopped
Suggestions:    Brainstorm ten blog titles about self-hosting AI
                Explain how a local LLM proxy keeps my API key safe
                Help me sketch a weekend plan for a LAN chat UI
```

## 10. Acceptance Checklist (implementer)

- [ ] Dark and light themes look correct and use only token variables.
- [ ] Empty, streaming, complete, and stopped states match `design/mockup.html`.
- [ ] No external font/CDN requests; stacks resolve locally.
- [ ] `svelte-check` clean; vitest suite green (add tests for streaming states, stop, copy, regenerate).
- [ ] Keyboard: open model menu, focus ring visible, Enter sends, Shift+Enter newline, Escape closes menu.
- [ ] `prefers-reduced-motion` honored.
- [ ] Contrast of meta text passes AA on both themes.
- [ ] Streaming auto-scroll respects user scroll position; jump-to-latest works while scrolled up.
- [ ] Backend errors render inline, never as alerts.