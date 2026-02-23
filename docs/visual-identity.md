# Visual Identity (SaaS)

This document defines a lightweight visual system tailored for modern SaaS products. It is designed to work directly with Tailwind CSS tokens, utilities, and best practices.

## 1) Foundations

### Color system
- Use a neutral base with a confident primary and one accent.
- Keep the palette compact: 1 primary, 1 accent, neutral scale, and 1 semantic set.
- Prefer high contrast for text and clear hierarchy.

**Suggested palette (Tailwind tokens):**
- Primary: `blue-600` (hover `blue-700`, subtle `blue-50`)
- Accent: `amber-500` (hover `amber-600`, subtle `amber-50`)
- Neutrals: `slate-900` / `slate-700` / `slate-500` / `slate-200` / `slate-50`
- Success: `emerald-600` (subtle `emerald-50`)
- Warning: `amber-600` (subtle `amber-50`)
- Danger: `rose-600` (subtle `rose-50`)

**Usage rules:**
- Body text: `text-slate-700` on `bg-white`.
- Headlines: `text-slate-900`.
- Primary actions: `bg-blue-600 text-white hover:bg-blue-700`.
- Accent highlights: `text-amber-600` or `bg-amber-50`.

### Typography
- Use a display font for headings and a highly readable sans for body.
- Avoid default stacks (Inter/Roboto/Arial). Use expressive, premium-feeling fonts.

**Recommended pairing:**
- Headings: `font-serif` with `"Fraunces"` or `"Bodoni Moda"`
- Body: `font-sans` with `"Manrope"` or `"Space Grotesk"`

**Scale (Tailwind text sizes):**
- Hero: `text-4xl md:text-6xl` + `tracking-tight`
- H1: `text-3xl md:text-4xl`
- H2: `text-2xl md:text-3xl`
- H3: `text-xl md:text-2xl`
- Body: `text-base`
- Small: `text-sm`
- Micro: `text-xs uppercase tracking-[0.25em]`

### Spacing
- Use consistent spacing with 4px grid (Tailwind default).
- Layout sections: `py-12 md:py-20`, `px-6 md:px-10`.
- Card padding: `p-6 md:p-8`.
- Vertical rhythm: `space-y-4` / `space-y-6`.

### Radius and shadows
- Buttons: `rounded-lg`
- Cards: `rounded-2xl`
- Pills: `rounded-full`
- Shadows: `shadow-lg shadow-slate-200/70` for cards, `shadow-sm` for inputs.

## 2) Components

### Buttons
- Primary: `bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-semibold`
- Secondary: `border border-slate-300 text-slate-700 hover:bg-slate-50`
- Ghost: `text-slate-600 hover:text-slate-900`

### Inputs
- Base: `rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm`
- Focus: `focus:border-blue-500 focus:ring-2 focus:ring-blue-200`

### Cards
- Base: `rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60`
- Accent: `bg-gradient-to-br from-blue-50 to-white`

### Badges
- Neutral: `bg-slate-100 text-slate-700`
- Success: `bg-emerald-50 text-emerald-700`
- Warning: `bg-amber-50 text-amber-700`

## 3) Layout patterns

### Hero
- Two-column layout with strong headline and supporting copy.
- Visual: use gradient or large blurred shapes.
- CTA group: primary + secondary.

### Pricing
- Grid of 2-4 cards.
- Highlight one plan with `ring-2 ring-blue-400` and `scale-[1.02]`.

### Dashboard
- Use a top bar with avatar + usage card.
- Main content organized into cards with clear sections.

## 4) Motion guidelines

- Use 2-3 key animations max (page load, card stagger, button hover).
- Prefer `ease-out` transitions and 150-250ms durations.
- Example utilities: `transition`, `duration-200`, `hover:-translate-y-0.5`.

## 5) Do and Dont

**Do:**
- Keep the palette limited and consistent.
- Use strong typography contrast (serif headings + clean body).
- Use subtle gradients or blurred shapes for atmosphere.

**Dont:**
- Mix too many accent colors.
- Use flat, single-color backgrounds everywhere.
- Overuse shadows or animation.
