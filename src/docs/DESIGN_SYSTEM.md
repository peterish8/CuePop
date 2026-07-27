# CuePop Design System

Single source of truth for visual and interaction decisions across the app. If you're adding a
new page or component and need a color, size, or spacing value that isn't listed here, that's a
signal to add a token — not to invent a one-off value.

## Brand principles

- **Calm, dark, precise.** Near-black surfaces, restrained glow, no decorative elements without a
  functional reason (a card's glow indicates interactivity; it doesn't exist "to look nice").
- **Two accent hues, used deliberately.** Blue (`--color-primary`) is the app's primary action
  color. Violet (`--color-accent`) is a secondary/alternating accent — used to differentiate
  adjacent icons or tiers, never as a second "primary."
- **Flat and fast, not glassy-everywhere.** The `cue-panel` glass treatment is for card-level
  containers on the marketing site. App/product surfaces (workspace, deck builder, live views)
  stay flatter and denser — real content density beats decorative texture.
- **One type hierarchy, two display tiers.** `cue-display` is reserved for a single large evocative
  statement per page (the landing hero, the auth split-screen). Everything else uses `cue-h1`
  through `cue-caption`. The `/stage` projector view is a documented exception — see below.

## Color tokens

All colors are defined in [`src/app/tokens.css`](../app/tokens.css). Components must reference the
semantic name (`var(--color-primary)`), never a primitive (`var(--brand-blue-900)`) or raw hex.

| Semantic token | Dark value | Role |
|---|---|---|
| `--color-background` | `#050507` | Page base |
| `--color-surface-muted` | `#060811` | Subtle raised zone (between background and surface) |
| `--color-surface` | `#0a0d12` | Default card/panel/chrome background |
| `--color-surface-elevated` | `#151a24` | Modals, dropdowns, popovers — highest layer |
| `--color-foreground` | `#ededed` | Primary text |
| `--color-foreground-muted` | `#a1a1a1` | Secondary text |
| `--color-foreground-subtle` | `#7a7a7a` | Captions, timestamps, disabled-adjacent text (WCAG AA-checked) |
| `--color-border` / `--color-border-strong` | `rgba(255,255,255,.08 / .14)` | Dividers, card edges |
| `--color-primary` / `--color-primary-hover` | `#082ea2` / `#4169e1` | Brand blue — primary actions |
| `--color-accent` / `--color-accent-hover` | `#422bc1` / `#7c5cf0` | Brand violet — secondary accent |
| `--color-success` / `--color-warning` / `--color-danger` / `--color-info` | | Status colors |
| `--color-focus-ring` | `#4169e1` | The **only** focus-ring color in the app |

A light theme (`:root[data-theme="light"]`) is fully defined in tokens.css but not yet wired to a
UI toggle — the app is dark-only today by product decision (`layout.tsx` forces `class="dark"`).

**Known contrast fix:** `--color-primary` (`#082ea2`) is too dark to use as *text* on
`--color-background` (contrast ≈ 1.86:1, fails WCAG AA badly even for large text). Always use
`--color-primary-hover` for text/icon color; reserve `--color-primary` for solid button
backgrounds and borders, where the surrounding fill provides its own contrast.

## Typography scale

Defined as CSS classes in `globals.css`, backed by size/weight/tracking tokens in `tokens.css`.

| Class | Usage |
|---|---|
| `cue-display` | One large statement per page — landing hero, auth split-screen only |
| `cue-h1` | App page title (workspace, dialogs) |
| `cue-heading` | Landing-page section title (the "H2" tier, kept under its historical name) |
| `cue-h3` | Card / subsection title |
| `cue-body-lg` | Important intro copy |
| `cue-body` | Default readable content |
| `cue-body-sm` | Secondary content |
| `cue-label` | Form labels |
| `cue-caption` | Metadata, uppercase eyebrows, timestamps |
| `cue-code` | Monospace (reserved — no current consumer) |

**Documented exception:** `/stage` (the projector-facing surface) uses its own bespoke, even-larger
clamp() scale (`clamp(4rem,9vw,9rem)`, etc.). It's read from meters away by a whole room, which is
a different design problem than in-app UI text — don't try to force it onto `cue-display`.

## Spacing

Tailwind's default numeric scale (`p-1` = 4px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px...) **is**
the 4px-based spacing system — no override needed. Use it directly; don't invent arbitrary values
like `p-[17px]`. `tokens.css` mirrors the same numbers as `--space-*` for use inside custom CSS
classes (e.g. `.cue-section`).

- Icon-to-label: `gap-2` (8px)
- Related form fields: `space-y-4`–`space-y-6` (16–24px)
- Card padding: `p-4`–`p-6` (16–24px)
- Page section spacing: `Section` component, `sm`/`md`/`lg` → 48/64/80px; landing-page sections use
  `cue-section` (96–190px, its own marketing-scale rhythm)
- Page padding: handled by `Container` — 16px mobile / 24px tablet / 32px desktop, automatically

## Radius, border, shadow

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 8px | Small controls |
| `--radius-md` | 10px | Default (buttons, inputs, cards) |
| `--radius-lg` | 16px | Larger cards |
| `--radius-xl` | 20px | Feature panels |
| `--radius-full` | 9999px | Pills, avatars, badges |
| `--shadow-sm/md/lg` | | Neutral elevation |
| `--shadow-glow-primary/accent` | | The *only* two glow shadows — hover state on buttons/cards |

## Layout primitives

`src/components/layout/`: `Container` (narrow/default/wide/full), `Stack` (gap xs–xl,
direction, align), `Grid` (two/three/four responsive columns), `Section` (sm/md/lg/marketing
spacing), `PageShell` (background + container + optional centering, for simple utility pages).

Breakpoints follow Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

## Components (`src/components/ui/`)

Button variants: `primary` (brand blue), `secondary` (translucent bordered), `outline`, `ghost`,
`destructive`, `link`, plus `inverse` — a documented exception, the off-white pill used for
marketing CTAs against dark hero art. `default`/`accent`/`danger` are **deprecated aliases** kept
temporarily for any call site not yet swept; new code must use the names above.

Sizes: `sm` (36px) / `md` (40px) / `lg` (44px) / `icon` (40px). `Input` was bumped from 44px to
40px to match `Button`'s default height — they previously didn't line up.

Every interactive primitive supports default/hover/active/focus-visible/disabled states via the
shared `cue-focus`/`cue-btn` treatment. `Button` also takes a `loading` boolean (shows a `Spinner`,
sets `aria-busy`, disables the control) — use it instead of a manual ternary + `LoaderCircle`.

Full inventory: Button, IconButton (requires `aria-label` at the type level), Input, Textarea,
Select, Checkbox, RadioGroup, Switch, FormField, Card (+Header/Title/Description/Content/Footer),
Badge, Alert, Tabs, Tooltip, DropdownMenu, Dialog, Sheet, Toaster, Skeleton, Spinner, Separator,
Avatar, Table, Pagination.

## Patterns (`src/components/patterns/`)

`StatCard`, `EmptyState`, `PageHeader` — product-level compositions of the primitives above.
Business logic belongs in `src/components/features/`-style component files (e.g. `deck-builder.tsx`),
never inside a generic `ui/` primitive.

## Accessibility requirements

- Every icon-only control must be an `IconButton` (its `aria-label` prop is required by the type
  system, not just a convention).
- Focus rings always use `--color-focus-ring`; never remove `:focus-visible` styling.
- Text color must clear 4.5:1 against its actual background (3:1 for large/bold text) — see the
  `--color-primary` contrast note above for the one bug class this caught.
- Dialogs/Sheets use Radix primitives — focus trap, `Escape` to close, and `aria-modal` come for
  free. Don't hand-roll a new modal with a plain `motion.div` + backdrop click handler.

## Adding a new component

1. Check this doc and `src/components/ui/` first — most needs map to an existing primitive plus a
   variant, not a new component.
2. If it's genuinely new, use `cva` for variants (see `button.tsx` for the reference shape) and
   consume only semantic tokens — no raw hex, no new one-off spacing/radius values.
3. Every interactive component needs default/hover/active/focus-visible/disabled states minimum;
   add loading/selected/error states if the component can be in those states.
4. Generic reusable pieces go in `ui/`; anything that knows about decks/rooms/keepsakes goes in the
   feature component itself or `patterns/` if it's reused across features.

## Adding a new token

Add the primitive to `tokens.css` first, then a semantic name that points to it. Never reference a
primitive directly from a component — always go through the semantic layer, so a future rebrand or
light-theme pass only touches `tokens.css`.

## Correct / incorrect

```tsx
// Correct
<Button variant="primary" size="lg">Create a live deck</Button>
<IconButton aria-label="Close panel" onClick={close}><X className="size-4" /></IconButton>
<div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6" />

// Incorrect
<button className="bg-[#4169e1] rounded-[13px] p-[17px]">Create</button>
<button onClick={close}><X /></button> {/* no accessible name */}
<div style={{ background: "#0a0d12" }} />
```

## Remaining known inconsistencies (tracked, not yet fixed)

- `keepsake-designer.tsx`'s three theme hex palettes (Signal/Midnight/Paper) are intentionally
  **not** tokenized — they're user-facing content choices for the exported keepsake artwork, not
  app chrome.
- `logo.tsx`'s SVG gradient stops are literal hex — acceptable for a fixed brand mark.
- A handful of pre-existing lint findings (`@typescript-eslint/no-explicit-any` in `db.ts` /
  `live/service.ts`, a `react-hooks/set-state-in-effect` warning in `use-room.ts`) predate this
  design-system pass and are business-logic/type-safety issues, not visual-consistency ones —
  out of scope here.
- The deprecated Button variant aliases (`default`, `accent`, `danger`) and the CSS variable
  aliases in `tokens.css` (`--cyan`, `--muted`, `--bg`, etc.) are kept intentionally as a
  non-breaking bridge. Remove them once a repo-wide grep confirms zero remaining consumers.
