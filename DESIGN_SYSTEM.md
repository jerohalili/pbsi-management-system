# PBSI Website — Design System & Style Guide

**Target:** Presbyterian Bible Seminary Inc. (PBSI) website  
**Repository:** `pbsi1992.github.io`  
**Live URL:** https://pbsi1992.github.io  
**Purpose:** Extremely comprehensive design document for AI agents editing or extending this codebase. Every color, font, spacing unit, radius, shadow, card variant, icon usage, gradient, and interaction pattern is cataloged below.

---

## 1. Tech Stack & Build Configuration

| Layer | Technology | Version / Source |
|-------|-----------|------------------|
| Meta-framework | Astro | ^6.1.9 |
| Styling | Tailwind CSS (Vite plugin) | ^4.2.4 (`@tailwindcss/vite`) |
| UI islands | React | ^19.2.5 (`@astrojs/react`) |
| Icons | Lucide | `lucide-astro` ^0.556.0, `lucide-react` ^1.11.0 |
| Content collections | Astro Content (JSON) | `src/content/programs/*.json` |
| TypeScript | Strict Astro TS config | `tsconfig.json` |
| Deployment | GitHub Pages (root repo) | `base: '/'` |
| Forms | Web3Forms API | `https://api.web3forms.com/submit` |

**Config files:**
- `tailwind.config.mjs` — custom color extensions only (no font/radius/spacing overrides; relies on Tailwind v4 defaults + CSS variables).
- `src/styles/global.css` — CSS custom properties (light/dark theme tokens), base `body` styles, `@import "tailwindcss"`.
- `astro.config.mjs` — Tailwind + React integrations, site root config.

---

## 2. Color System

### 2.1 Custom Tailwind Color Extensions (`tailwind.config.mjs`)

```js
colors: {
  'sb-orange': '#FF9500',   // declared but not actively used in components
  'sb-bg': '#F7F7F8',       // light page background
  'sb-border': '#F1F1F3',   // light borders
  'sb-text': '#1A1A1A',     // light text
  'sb-muted': '#59595A',    // light muted text
}
```

> Note: These `sb-*` tokens exist in `tailwind.config.mjs` but the components predominantly use the CSS-variable-based `site-*` Tailwind colors defined in `global.css` (see below).

### 2.2 CSS Custom Properties (Theme Tokens) — `src/styles/global.css`

**Light mode (`:root`) — the default**

| Variable | Value | Role |
|----------|-------|------|
| `--brand-primary` | `#0033A0` | Primary brand blue |
| `--bg-color` | `#F7F7F8` | Page / section background |
| `--text-color` | `#1A1A1A` | Primary text |
| `--card-bg` | `#FFFFFF` | Card / surface background |
| `--border-color` | `#F1F1F3` | Borders / dividers |
| `--muted-text` | `#59595A` | Secondary / muted text |

**Dark mode (`.dark`)**

| Variable | Value | Role |
|----------|-------|------|
| `--brand-primary` | `#3B82F6` | Primary brand blue (lighter for dark legibility) |
| `--bg-color` | `#0F172A` | Page background (slate-900) |
| `--text-color` | `#F8FAFC` | Primary text (slate-50) |
| `--card-bg` | `#1E293B` | Card surface (slate-800) |
| `--border-color` | `#334155` | Borders (slate-700) |
| `--muted-text` | `#94A3B8` | Muted text (slate-400) |

### 2.3 Tailwind Semantic Color Classes (derived from CSS vars)

Defined via `@theme` in `global.css` and used throughout all components:

| Tailwind class | CSS variable | Light value | Dark value |
|----------------|--------------|-------------|------------|
| `text-primary` / `bg-primary` / `border-primary` | `--color-primary` = `var(--brand-primary)` | `#0033A0` | `#3B82F6` |
| `text-primary-light` / `bg-primary-light` | `--color-primary-light` | `#407BFF` | (same) |
| `bg-site-bg` / `text-site-bg` | `--color-site-bg` = `var(--bg-color)` | `#F7F7F8` | `#0F172A` |
| `text-site-text` | `--color-site-text` = `var(--text-color)` | `#1A1A1A` | `#F8FAFC` |
| `bg-site-card` / `border-site-card` | `--color-site-card` = `var(--card-bg)` | `#FFFFFF` | `#1E293B` |
| `border-site-border` | `--color-site-border` = `var(--border-color)` | `#F1F1F3` | `#334155` |
| `text-site-muted` | `--color-site-muted` = `var(--muted-text)` | `#59595A` | `#94A3B8` |

### 2.4 Hardcoded Hex / Inline Colors (appear in components)

| Color | Usage |
|-------|-------|
| `#0033A0` | `Banner` background (enrollment banner); root `--brand-primary` |
| `#FF9500` | `sb-orange` (declared, unused in components) |
| `bg-primary/5`, `bg-primary/10`, `bg-primary/20`, `bg-primary/30`, `bg-primary/40`, `bg-primary/50` | Opacity tints for badges, icon containers, decorative blobs, hover states |
| `text-primary/60`, `text-primary/30`, `text-primary/10` | Opacity text tints |
| `shadow-primary/40`, `shadow-primary/20`, `shadow-primary/10`, `shadow-primary/5` | Colored glow shadows on hover |
| `border-primary/10`, `border-primary/20`, `border-primary/30`, `border-primary/40` | Opacity border tints |
| `text-white` / `bg-white/10` | Dark-mode-specific accents (pricing scholarship card, contact panel) |
| `bg-site-bg/40`, `bg-site-bg/50`, `bg-site-bg/60`, `bg-site-bg/90`, `bg-site-bg/30`, `bg-site-bg/10` | Glassmorphism / scrim opacity backgrounds |
| `text-site-text/90` | Slightly muted body text |

### 2.5 Theme / Dark-Mode Mechanics

- Default theme: **light** (hardcoded fallback in `Layout.astro`).
- Preference stored in `localStorage` under key `"theme"` (`"light"` \| `"dark"`).
- `Layout.astro` inline script runs on load: reads localStorage, adds/removes `dark` class on `<html>`, syncs back to localStorage.
- `ThemeToggle.astro` (lucide `Moon` / `Sun`) toggles the `dark` class and persists choice; re-initializes on `astro:after-swap`.
- All colors flow through CSS variables, so dark mode is a wholesale token swap — no hardcoded dark-mode hex overrides in components (except `text-white`/`bg-white/10` used intentionally for dark-mode hero cards).

---

## 3. Typography

### 3.1 Font Families

| Class | Font | Where used |
|-------|------|------------|
| `font-sans` (default, `font-family: 'Inter', sans-serif`) | **Inter** | `body` in `global.css`; virtually all UI text |
| `font-serif` | Serif (browser default serif stack) | Footer institution name; President's signature ("Rev. Joval C. Kisinamal"); pull-quote style signatures |

> Inter is applied globally via `body { font-family: 'Inter', sans-serif; }` in `global.css`. No external font import (Google Fonts) is present in the current codebase — Inter is expected to be available system-wide or via a CDN not shown in the reviewed files.

### 3.2 Font Weights

| Weight class | Numeric | Usage |
|--------------|---------|-------|
| `font-medium` | 500 | Body copy, mission list items, program descriptions |
| `font-bold` | 700 | Card names, headings, labels, buttons |
| `font-black` | 900 | Hero section titles, page H1s, pillar titles, section "Foundations"/"Faculty"/"Journey" |
| `font-extrabold` | 800 | Hero H1 ("Presbyterian Bible Seminary Inc."), program listing titles, excellence headings |
| `font-serif` | — | Footer logo text, president signature |

### 3.3 Font Sizes

Standard Tailwind scale plus many custom arbitrary values:

| Size | Typical usage |
|------|---------------|
| `text-[8px]` | Program role tags (Missionary, Artist, Designer…) |
| `text-[9px]` | Faculty degree tags; footer contact labels; solas badges; fee detail tags |
| `text-[10px]` | Faculty role badges; pillar index labels; footer small text; privacy/academic links; pricing labels; admission labels; contact labels |
| `text-[11px]` | Faculty titles (italic); form labels |
| `text-[12px]` | Program type badge on detail page |
| `text-[14px]` | Mission/vision card titles |
| `text-[15px]` | Nav links; nav Register button |
| `text-base` (16px) | Body copy, program descriptions |
| `text-lg` (18px) | Maxim quote, pricing section text |
| `text-xl` (20px) | Program card titles, mission/vision body |
| `text-2xl` (24px) | Faculty names, pillar card titles |
| `text-3xl` (30px) | Section H2s ("Programs Offered:", "From the President's Desk") |
| `text-4xl` (36px) | About "Our Foundations" H1 |
| `text-5xl` (40px) | Program detail H1, programs index H1 |
| `text-6xl` (48px) | Contact H1 |
| `text-8xl` (64px) | Hero H1 md breakpoint |
| `text-9xl` (72px) | Hero H1 lg breakpoint; Admissions H1 md+ |

### 3.4 Letter Tracking (letter-spacing)

| Class | Usage |
|-------|-------|
| `tracking-tight` | Hero H1, headings, button text |
| `tracking-tighter` | Hero H1, page H1s ("Foundations", "Journey", "Financial Transparency") |
| `tracking-widest` | Uppercase labels, section kickers, footer labels, solas badges |
| `tracking-[0.2em]` | Faculty role badges, section labels, form labels, footer divider text |
| `tracking-[0.3em]` | Pillar number labels, mission/vision subsection labels, faculty title (italic) |
| `tracking-[0.4em]` | About section "Statement of Faith" label, admission process kicker |
| `tracking-wider` | Faculty titles |

### 3.5 Line Height

| Class | Usage |
|-------|-------|
| `leading-none` | Pillar card titles, hero kicker, large headings where wrap must be tight |
| `leading-tight` | Hero H1, faculty names, section headings, card titles |
| `leading-relaxed` | Body copy, descriptions, mission/vision text |
| `leading-[0.9]` | Hero H1 (extremely tight for overlap art direction) |
| `leading-[0.95]` | Hero H1 |
| `leading-[1.2]` / `leading-[1.1]` | About vision text |
| `leading-snug` | Mission list items |

### 3.6 Font Style & Variant

- `italic` — Faculty titles, mission list items, program descriptions (programs index), president letter body prose, pricing "Zero Tuition. Full Calling.", contact/admission large headings ("Contact.", "Admissions.", "Send a Message", "Student Registration")
- `uppercase` — Nearly all labels, kickers, badges, footer text, nav mobile items
- `font-black` + `italic` — President signature name, contact/admission H1s

### 3.7 Selection Color

- `selection:bg-primary/30` — Custom highlight color applied to gradient headings (about, pricing, hero) via inline `style` on the `<span>`.

---

## 4. Spacing & Layout

### 4.1 Page Container & Max-Widths

| Class | Sections / Pages |
|-------|------------------|
| `max-w-[1596px] mx-auto` | Hero, Programs (hero section), Accreditations, Program detail page (`/programs/[slug]`) |
| `max-w-[1200px] mx-auto` | About, Pricing, Contact, Footer inner |
| `max-w-[1400px] mx-auto` | About video section |
| `max-w-5xl` | Accreditations grid |
| `max-w-4xl` | Maxim section |
| `max-w-3xl` | Hero description, programs index intro |
| `max-w-2xl` | About text columns |
| `max-w-xl` | Excellence text side |
| `max-w-md` | Footer description |

### 4.2 Standard Page Padding

| Class | Context |
|-------|---------|
| `px-4 md:px-10` | Default section container padding (hero, navbar, footer, programs, accreditations, president letter) |
| `px-6` | About page sections, contact main, pricing main |
| `px-4 md:px-10` (navbar) | Nav container |

### 4.3 Section Vertical Padding

| Class | Context |
|-------|---------|
| `pt-48 pb-40` | Hero (large top/bottom) |
| `py-5` | Navbar |
| `py-12` | Default section (about pillars, programs index) |
| `py-16` | Footer inner, faculty section, contact header |
| `py-20` | Pricing main, excellence |
| `py-24` | Accreditations, president letter section, program detail |
| `py-32` | Maxim section |

### 4.4 Gaps

| Gap | Context |
|-----|---------|
| `gap-2` | Nav link/icon groups, faculty degree pills |
| `gap-3` | Faculty card image-to-content, accordion-like groups |
| `gap-4` | Grid gaps (faculty grid, pillars), icon+text groups |
| `gap-5` | Hero CTA button group |
| `gap-6` | Default grid gap (faculty, pricing cards), form fields |
| `gap-8` | Pillar grid lg, program grid, curriculum sections |
| `gap-10` | Contact/admission two-column split |
| `gap-12` | Footer grid, hero bottom |
| `gap-16` | President letter flex row |

### 4.5 Layout Primitives

- `flex flex-col` — Body (Layout), most sections stack vertically
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — Faculty grid, program grid
- `lg:grid-cols-12` — Footer (5-col + 4-col + 3-col spans)
- `items-stretch` / `h-full min-h-full` — Equal-height cards in grids
- `relative overflow-hidden` — Sections with decorative background blobs
- `sticky top-0 z-50` — Navbar

---

## 5. Border Radius / Rounding

| Radius value | Usage |
|--------------|-------|
| `rounded-full` | Pills, badges, type tags, status pills, accent dividers, circular decorative blobs, icon containers (some) |
| `rounded-lg` | Nav desktop links, small badges, select wrappers |
| `rounded-md` | Faculty degree tags, pricing detail tags |
| `rounded-xl` | Nav register button, icon containers (w-8/h-8), faculty flying photo (start), table cells |
| `rounded-2xl` | **Most common.** Buttons, modal close, mission/vision icon boxes, pillar icon boxes, video container, faculty photo (end state), contact icon boxes |
| `rounded-[24px]` | Navbar container, navbar mobile menu, president photo (flying & start), select inputs |
| `rounded-[32px]` | **Card standard.** FacultyCard, PillarCard, pricing cards, contact cards, admission cards, program cards (hero section), footer, modal, maxim section |
| `rounded-[40px]` | MissionVisionCard, president letter card (md+), programs list card (md+), pricing cards (md+), contact form card |
| `rounded-[48px]` | President letter card (lg, sticky sidebar image) |
| `rounded-t-[40px]` | Program detail header top-only rounding |
| `overflow-hidden` | Paired with radius on image containers (faculty, video, president photo) |

---

## 6. Shadows & Elevation

| Shadow | Usage |
|--------|-------|
| `shadow-sm` | Subtle cards (mission vision, program detail header) |
| `shadow-md` | Nav register button |
| `shadow-xl` | Footer, president letter card, contact/admission panels, modal, faculty card hover |
| `shadow-2xl` | Mobile menu, hero primary CTA hover, president letter hover state |
| `shadow-black/5` | Navbar base shadow, contact/admission side panels |
| `shadow-primary/40` | Hero primary button hover glow |
| `shadow-primary/20` | Hero secondary button hover, pricing scholarship card, contact panel, admission submit button |
| `shadow-primary/10` | Hero secondary button hover, program cards hover |
| `shadow-primary/5` | Accreditations cards hover |
| `hover:-translate-y-1` / `hover:-translate-y-2` | Lift on hover (buttons, cards) |
| `active:scale-95` / `active:scale-95` | Press-down feedback on all CTAs |
| `hover:brightness-110` | Nav register button |

---

## 7. Component Catalog

### 7.1 Buttons / CTAs

**Primary CTA** (Hero, pricing, admission)
```
bg-primary text-white px-14 py-6 rounded-2xl font-bold text-xl
transition-all duration-300
hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40
active:scale-95
```
Variants: `px-7 py-3 text-[15px]` (nav Register), `px-10 py-5 text-lg` (programs index), `px-8 md:px-12 py-5 md:py-6 font-black text-lg md:text-xl uppercase italic group` (pricing CTA with ArrowRight), `px-12 py-5 md:py-6 font-black text-lg md:text-xl uppercase italic tracking-tight` (contact submit).

**Secondary / Outline CTA** (Hero "Learn More")
```
bg-site-card/60 backdrop-blur-sm text-site-text border-2 border-site-border
px-14 py-6 rounded-2xl font-bold text-xl
transition-all duration-300
hover:-translate-y-1 hover:bg-site-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10
active:scale-95
```

**Ghost / Tinted CTA** (Programs "View All Programs")
```
bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold
hover:bg-primary hover:text-white transition-all duration-300
```

**Card CTA** (FacultyCard "View Profile")
```
bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl
text-primary font-bold text-xs uppercase tracking-widest
transition-all group/btn
flex items-center justify-between w-full px-6 py-4
```
Contains `Plus` icon (lucide) with `group-hover/btn:rotate-90`.

**Nav mobile CTA** (Register Now)
```
block w-full bg-primary text-white text-center py-5 rounded-2xl
font-bold text-lg shadow-lg active:scale-95 transition-all
```

### 7.2 Cards

**FacultyCard** (`src/components/FacultyCard.astro`)
- Wrapper: `bg-site-card border border-site-border rounded-[32px] overflow-hidden group hover:border-primary/20 transition-all duration-500 flex flex-col h-full`
- Image: `aspect-[4/5] overflow-hidden bg-site-border border-b border-site-border`; `img` = `w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-105`
- Body: `p-8 flex flex-col flex-grow`
- Role: `text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2`
- Name: `text-2xl font-bold text-site-text mb-2 leading-tight`
- Titles: `text-[11px] text-primary/60 font-bold uppercase tracking-wider mb-4 italic`
- Degree pills: `text-[9px] font-black text-site-muted bg-site-border border border-site-border px-2 py-1 rounded-md uppercase`
- Detail template (modal): image `w-32 h-32 rounded-2xl object-cover border border-site-border shadow-lg`; name `text-3xl font-black text-site-text leading-tight`

**PillarCard** (`src/components/PillarCard.astro`)
- Wrapper: `bg-site-card border border-site-border p-10 rounded-[32px] hover:border-primary/20 transition-all duration-300 group flex flex-col items-center text-center h-full`
- Index label: `text-[10px] font-black text-primary/40 uppercase block leading-none mb-2 tracking-[0.2em]` ("Pillar 01")
- Title: `text-2xl font-extrabold text-site-text tracking-tight uppercase leading-none`
- Icon container: `w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500`
- Body: `text-base text-site-muted leading-relaxed font-medium max-w-[280px]` (slot content)

**MissionVisionCard** (`src/components/MissionVisionCard.astro`)
- Wrapper: `bg-site-card border border-site-border p-10 rounded-[40px] shadow-sm flex flex-col group hover:border-primary/20 transition-colors duration-500`
- Icon container: `w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0`
- Title: `text-[14px] font-black uppercase tracking-[0.2em] text-primary`
- Body: `flex-grow` (slot content)

**Program card** (`src/components/Programs.astro` — hero listing)
- Wrapper: `group bg-site-card border border-site-border p-8 rounded-[32px] transition-all duration-500 ease-out hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-primary/10 flex flex-col w-full min-h-full`
- Responsive width: `md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]`
- Icon: `text-primary bg-site-border w-14 h-14 md:w-16 md:h-16 shrink-0 aspect-square flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-500 ease-out border border-site-border overflow-hidden`
- Type pill: `text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full`
- Title: `text-xl md:text-2xl font-bold text-site-text mb-3 group-hover:text-primary transition-colors duration-300`
- CTA: `inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all duration-300` + ArrowRight

**Program card** (`src/pages/programs/index.astro` — detail listing)
- Wrapper: `group bg-site-card border border-site-border rounded-[40px] p-8 md:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20`
- Icon: `w-20 h-20 shrink-0 aspect-square ... rounded-[24px] border border-site-border group-hover:scale-105`
- CTA: `bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95`

**Pricing fee card** (`src/pages/pricing.astro`)
- Wrapper: `bg-site-card border border-site-border rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col justify-between hover:border-primary/40 transition-all duration-500 shadow-xl shadow-black/5 w-full`
- Price: `text-site-text font-black text-2xl md:text-3xl tracking-tight` prefixed with `₱`
- "100% Free": `text-primary font-black uppercase tracking-tighter text-sm md:text-base italic`

### 7.3 Navbar

- Container: `sticky top-0 z-50 w-full px-4 md:px-10 py-5`
- Nav shell: `max-w-[1516px] mx-auto bg-site-card/80 backdrop-blur-md border border-site-border rounded-[24px] px-6 py-3.5 flex items-center justify-between shadow-xl shadow-black/5`
- Logo: `w-10 h-10 md:w-12 md:h-12 object-contain`
- Desktop links: `text-[15px] font-medium text-site-text px-4 py-2 hover:bg-site-border rounded-lg transition-all`
- Nav register: `bg-primary text-white px-7 py-3 rounded-xl font-bold text-[15px] hover:brightness-110 transition-all shadow-md`
- Mobile toggle: `lg:hidden p-2.5 text-site-text hover:bg-site-border rounded-xl transition-all relative w-10 h-10 flex items-center justify-center`
- Mobile menu: `hidden lg:hidden absolute top-full left-4 right-4 mt-4 p-6 bg-site-card/95 backdrop-blur-xl border border-site-border rounded-[32px] shadow-2xl`
- Mobile links: `text-lg font-bold text-site-text p-4 hover:bg-primary/10 hover:text-primary rounded-2xl transition-all`
- Mobile register: `block w-full bg-primary text-white text-center py-5 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all`
- Icons: `Menu`, `X` from lucide-react (size={24})

### 7.4 Footer

- Wrapper: `bg-site-card border-t border-site-border mt-20 relative overflow-hidden`
- Decorative blob: `absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20 pointer-events-none`
- Inner: `max-w-[1200px] mx-auto px-4 md:px-10 py-16 relative z-10`
- Grid: `grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8`
- Institution name: `text-2xl font-serif font-bold text-site-text leading-tight`
- Accent divider: `h-1 w-12 bg-primary mt-4`
- Description: `text-site-muted text-sm leading-relaxed max-w-md`
- Section kickers: `text-xs font-black uppercase tracking-widest text-primary`
- Location icon: inline SVG `w-4 h-4 text-primary` stroke-width 2.5 round caps
- Campus labels: `text-[10px] font-bold text-primary uppercase mb-1`; addresses `text-xs text-site-text leading-relaxed`
- Contact labels: `text-[10px] font-bold text-site-muted uppercase mb-1`
- Email link: `text-sm font-semibold text-site-text hover:text-primary transition-colors decoration-primary/30 underline underline-offset-4`
- Phone: `text-xs font-bold text-site-text`
- Copyright: `text-[10px] font-bold text-site-muted uppercase tracking-widest`
- Footer links: `text-[10px] font-bold text-primary uppercase hover:opacity-70 transition-opacity`

### 7.5 Hero (`src/components/Hero.astro`)

- Section: `relative w-full pt-48 pb-40 overflow-hidden -mt-[116px]` (negative margin pulls up behind navbar)
- Container: `relative z-10 max-w-[1596px] mx-auto px-4 md:px-10 text-center`
- Kicker: `inline-flex items-center gap-2 bg-site-card/40 backdrop-blur-sm px-6 py-3 rounded-full border border-site-border mb-12 shadow-sm`; text `text-base md:text-lg font-bold tracking-tight text-primary`
- H1: `text-6xl md:text-8xl lg:text-9xl font-extrabold text-site-text leading-[0.95] mb-10 tracking-tighter`
  - "Presbyterian Bible" plain; `<br class="hidden lg:block" />`; "Seminary Inc." in gradient
- Gradient text: `text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light`
- Subhead: `text-site-muted max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed mb-16 font-medium`
- CTA group: `flex flex-col sm:flex-row justify-center items-center gap-5`

### 7.6 Excellence (`src/components/Excellence.astro`)

- Section: `max-w-[1596px] mx-auto px-4 md:px-10 py-24`
- Card: `bg-site-card border border-site-border rounded-[32px] p-8 md:p-20 shadow-sm transition-colors duration-300`
- Grid: `grid lg:grid-cols-2 gap-16 items-center`
- H2: `text-4xl md:text-5xl font-extrabold text-site-text leading-tight tracking-tight`
- Gradient span: "Spiritual, Character, Practical, and Academics"
- Accent divider: `w-20 h-1.5 bg-primary rounded-full`
- Aim items: `group flex items-start gap-5`; icon `w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center`; text `text-site-muted text-lg md:text-xl leading-relaxed font-medium`

### 7.7 Programs Section (`src/components/Programs.astro`)

- Section: `max-w-[1596px] mx-auto px-4 md:px-10 py-16 md:py-24`
- Kickers: `text-primary font-bold tracking-widest uppercase text-xs md:text-sm`; H3 `text-3xl md:text-5xl font-extrabold text-site-text leading-tight`
- View All link: `bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white`
- Program card (see 7.2 above)
- Duration: `text-[10px] md:text-xs font-semibold text-site-muted uppercase tracking-wider` with `Clock` icon size={14}
- Description: `text-site-muted leading-relaxed mb-8 text-sm md:text-base line-clamp-3 font-medium`

### 7.8 Accreditations (`src/components/Accreditations.astro`)

- Section: `py-24 relative overflow-hidden bg-site-bg`
- Decorative blob: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none`
- Kickers: `text-primary font-bold tracking-widest uppercase text-sm mb-4`; H2 `text-4xl md:text-5xl font-extrabold text-site-text tracking-tight`
- Cards: `group relative bg-site-card/40 backdrop-blur-md border border-site-border p-8 md:p-10 rounded-[32px] transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2`
- Logo container: `w-24 h-24 mb-8 relative flex items-center justify-center` with inner `absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-colors`
- Image: `relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105`
- Status pill: `px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4`
- Institution name: `text-xl md:text-2xl font-bold text-site-text mb-4 leading-tight`
- Description: `text-site-muted leading-relaxed max-w-xs`

### 7.9 President Letter (`src/components/PresidentLetter.astro`)

- Section: `py-6 md:py-24 bg-site-card/30`
- Main card: `bg-site-card border border-site-border rounded-[32px] md:rounded-[48px] p-6 md:p-20 shadow-2xl relative z-10`
- Flying photo (JS-animated, lg only): `fixed pointer-events-none z-[40] overflow-hidden border-4 border-primary rounded-[24px] bg-site-bg shadow-xl hidden lg:block opacity-0 transition-opacity duration-300`
- Start photo: `border-4 border-primary lg:border-none rounded-[24px] overflow-hidden` with glow `absolute -inset-4 bg-primary/10 rounded-[32px] blur-2xl lg:block hidden`
- End photo: `w-32 md:w-44 aspect-[4/5] rounded-2xl bg-site-card/50 border-2 border-dashed border-site-border shrink-0 overflow-hidden`
- President name (sidebar): `text-2xl font-bold text-site-text mb-0.5 text-pretty`
- President role: `text-primary font-bold uppercase tracking-widest text-[10px]`
- Pull quote: `text-site-muted italic text-sm leading-relaxed border-l-2 border-primary/20 pl-4 hidden lg:block`
- Section kicker: `text-primary font-bold tracking-widest uppercase text-[10px] md:text-sm`
- H4: `text-3xl md:text-5xl font-extrabold text-site-text mb-6 md:mb-10 leading-tight tracking-tight`
- Body prose: `prose prose-base md:prose-lg dark:prose-invert max-w-none text-site-muted leading-relaxed space-y-6`
- Sign-off: `text-3xl font-serif italic text-primary font-bold`
- Lower card: `bg-site-border border-2 border-site-border p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl relative z-30`
- Role chips: `text-[8px] font-bold uppercase px-2 py-1 bg-primary/5 border border-primary/10 rounded text-primary`

### 7.10 Banner (`src/components/Banner.astro`)

- `w-full bg-[#0033A0] py-3.5 text-center px-4`
- Text: `text-white text-sm font-medium`
- Arrow: `→` with `ml-2 inline-block transition-transform hover:translate-x-1 cursor-default`

### 7.11 MaximSection (`src/components/MaximSection.astro`)

- Section: `py-32 bg-site-card/30 border-y border-site-border backdrop-blur-sm`
- Container: `max-w-4xl mx-auto px-6 text-center`
- Quote: `text-xl md:text-3xl font-bold text-site-text mb-6 leading-relaxed italic`
- Divider: `h-[1px] w-8 bg-primary/30` (both sides)
- Reference: `text-primary font-black tracking-[0.3em] uppercase text-xs`

### 7.12 ThemeToggle (`src/components/ThemeToggle.astro`)

- Button: `group relative p-2.5 rounded-xl border border-site-border bg-site-border hover:border-primary/40 transition-all flex items-center justify-center shadow-sm overflow-hidden active:scale-95`
- Hover overlay: `absolute inset-0 pointer-events-none bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300`
- Moon icon (light mode): `w-5 h-5 block dark:hidden text-primary transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`
- Sun icon (dark mode): `w-5 h-5 hidden dark:block text-primary transition-all duration-500 group-hover:rotate-45 group-hover:scale-110`

---

## 8. Icons

### 8.1 Library
- **Lucide** (`lucide-react` for Astro components with client-side scripts; `lucide-astro` for server-only Astro components).
- All icons use `size` prop (numeric) and `strokeWidth` where specified.

### 8.2 Icons Used & Locations

| Icon | Component(s) | Size |
|------|--------------|------|
| `Menu`, `X` | Navbar mobile toggle | 24 |
| `Moon`, `Sun` | ThemeToggle | 5 (w-5/h-5 classes) |
| `Plus` | FacultyCard CTA | 16 |
| `GraduationCap` | Programs (MA Pastoral Studies) | 32 |
| `BookOpen` | Programs (Bachelor Theology), About (Pillar: The Word) | 32 / 40 |
| `Church` | Programs (Bachelor Church Ministry), About (Pillar: The Church) | 32 / 40 |
| `Scroll` | Programs (Diploma Theological Studies) | 32 |
| `Users` | Programs (Lay Leadership Studies), About (Pillar icon) | 32 |
| `ArrowRight` | Programs CTA, Pricing CTA, Admission submit | 20 / 24 |
| `Target` | About (Mission card) | 28 |
| `Eye` | About (Vision card) | 28 |
| `CheckCircle2` | About mission list items | 20 |
| `SquareStack` | About (Pillar: The Trinity) | — |
| `Heart` | About (Pillar: Jesus Christ) | — |
| `Flame` | About (Pillar: Holy Spirit) | — |
| `Road` | About (Pillar: Salvation) | — |
| `PersonStanding` | About (Pillar: Resurrection) | — |
| `Clock` | Programs duration, Contact office hours, Admission | 14 / 18 / 20 |
| `Send` | Contact submit button | 24 |
| `Mail`, `Phone` | Contact info cards | 28 |
| `Calendar` | Contact office hours | 14 |
| `UserPlus` | Admission step 1 | 20 |
| `FileText` | Admission step 2 | 20 |
| `CheckCircle` | Admission step 3 | 20 |
| `ChevronDown` | Admission select dropdowns | 20 |

### 8.3 Custom Inline SVGs (non-lucide)
- Footer location marker icon: `M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z` + circle, stroke-width 2.5, round caps/joins — used twice (Main & Annex campus).
- About mission list check: polyline `20 6 9 17 4 12`, stroke-width 3.
- Program page checkmarks: path `M20 6 9 17 4 12`, stroke-width 3.
- Program page clock icon: circle + polyline, stroke-width 2.5.
- Faculty modal close: inline SVG `X` (two lines), stroke-width 3.
- Program detail "Q." is rendered as text `Q.` (not an icon).

### 8.4 Icon Container Patterns
- `w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary` (Excellence aims)
- `w-12 h-12 bg-primary/10 rounded-2xl ... text-primary` (PillarCard)
- `w-14 h-14 bg-primary/10 rounded-2xl ... text-primary` (MissionVisionCard)
- `w-24 h-24 ... rounded-2xl` with inner `bg-primary/5 rounded-2xl blur-xl` (Accreditations logo badge)
- `text-primary bg-site-border w-14 h-14 ... rounded-2xl border border-site-border` (Programs hero section)

---

## 9. Gradients, Glows & Decorative Effects

### 9.1 Gradients

| Gradient | Classes | Usage |
|----------|---------|-------|
| Primary → Primary-light (L→R) | `bg-gradient-to-r from-primary to-primary-light` | Hero H1 ("Seminary Inc."), Excellence H2 span, About H1 spans ("Foundations", "Journey"), Pricing H1 span ("Financial Transparency") |
| Primary/10 → transparent (TL→BR) | `bg-gradient-to-tr from-primary/10 to-transparent` | About video decorative glow |
| Primary/5 → transparent (top→bottom) | `bg-gradient-to-b from-primary/5 to-transparent` | Pricing CTA card bottom fade |

### 9.2 Blur / Glass Blobs

| Effect | Classes | Usage |
|--------|---------|-------|
| Backdrop blur sm | `backdrop-blur-sm` | Hero kicker, Maxim section |
| Backdrop blur md | `backdrop-blur-md` | Navbar, contact info cards, Accreditations cards |
| Backdrop blur xl | `backdrop-blur-xl` | Mobile menu, contact form card, faculty modal |
| Backdrop blur 2xl | `backdrop-blur-2xl` | President photo start glow |
| Blur 120px | `blur-[120px] w-[500px] h-[500px] bg-primary/5 rounded-full` | Accreditations decorative blob |
| Blur 80px / 120px | `blur-[80px] md:blur-[120px] bg-primary/10 rounded-full` | Admission top-right decorative blob |
| Blur 3xl | `blur-3xl bg-white/10 rounded-full` | Pricing scholarship, contact panel, admission panel decorative corners |
| Blur 2xl | `blur-2xl bg-primary/10 rounded-[32px]` | President photo glow |
| Blur xl | `blur-xl bg-primary/5 rounded-2xl` | Accreditations status badge glow |

### 9.3 Opacity Backgrounds (Glassmorphism)
- `bg-site-card/40`, `bg-site-card/50`, `bg-site-card/60`, `bg-site-card/90`, `bg-site-card/30`, `bg-site-card/10`
- `bg-primary/5`, `bg-primary/10`, `bg-primary/20`, `bg-primary/30`, `bg-primary/40`, `bg-primary/50`
- `bg-site-border/60`, `bg-site-border/50`, `bg-site-border/20`

---

## 10. Borders, Dividers & Rules

| Style | Classes | Usage |
|-------|---------|-------|
| Standard border | `border border-site-border` | Cards, navbar, footer, inputs, selects |
| Double border | `border-2 border-site-border` | Hero secondary CTA |
| Top border | `border-t border-site-border` | Footer, pricing table header |
| Bottom border | `border-b border-site-border` | Navbar image area, pricing rows, program detail header |
| Left border | `border-l-2 border-primary/20` | President pull quote |
| Left border (pricing table) | `border-l-4 border-white/30` | Pricing scholarship quote |
| Dashed border | `border-2 border-dashed border-site-border` | President end photo state |
| Divider Y | `divide-y divide-site-border` | Pricing mobile list |
| Accent bar | `h-1 w-12 bg-primary` | Footer under institution name |
| Accent bar (section) | `w-20 h-2 bg-primary rounded-full` | About / Contact section headings |
| Hairline divider | `h-[1px] w-8 bg-primary/30` | Maxim section reference divider |
| Section divider | `h-[2px] w-8 md:w-12 bg-primary/20` | About section ("Statement of Faith") |
| Flex-grow rule | `h-1 flex-grow bg-site-border rounded-full opacity-50` | Program objectives / curriculum headings |
| Input border | `border border-site-border` + `focus:border-primary` + `focus:ring-4 focus:ring-primary/5` | Contact & Admission forms |
| Select appearance | `appearance-none` + custom `ChevronDown` icon | Admission dropdowns |

---

## 11. Forms

### 11.1 Shared Input Style (Contact & Admission)
```
w-full bg-site-bg/60 border border-site-border rounded-2xl
px-6 py-4 md:py-5 text-site-text font-bold
focus:border-primary outline-none transition-all
placeholder:opacity-20
```
- Labels: `text-[11px] font-black uppercase tracking-[0.2em] text-primary ml-1`
- Placeholders: example text ("Juan Dela Cruz", "juan@email.com", "How can we help?")
- Selects: same input style + `pl-6 pr-12` + absolute `ChevronDown` icon at `right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary`
- Select options (inline `<style>` in admission.astro): `background-color: #ffffff; color: #0f172a; font-weight: 600;`

### 11.2 Submit Button (Shared)
```
bg-primary text-white px-12 md:px-14 py-5 md:py-6 rounded-2xl
font-black text-lg md:text-xl flex items-center justify-center gap-4
hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] transition-all
hover:-translate-y-1 active:scale-95 group uppercase italic tracking-tight
```
Contains `Send` or `ArrowRight` lucide icon with hover translate.

### 11.3 Form Endpoints
- Both Contact and Admission POST to `https://api.web3forms.com/submit` with hidden `access_key`, `botcheck` checkbox, and `subject` fields.

---

## 12. Responsive Breakpoints (Tailwind defaults)

| Breakpoint | Value | Notable usage |
|------------|-------|---------------|
| `sm` | 640px | Faculty grid 2-col |
| `md` | 768px | Most `md:` overrides (padding, text sizes, grid columns) |
| `lg` | 1024px | Navbar desktop links, 3-col grids, sticky president sidebar, flying photo |
| (no `xl` overrides found) | — | — |

---

## 13. Interactions & Motion

| Effect | Classes / JS | Usage |
|--------|--------------|-------|
| Opacity transition | `transition-colors duration-300` | Body theme switch, cards |
| Transform transition | `transition-transform duration-500` / `duration-700` | Card hover lifts, faculty image scale, icon scale |
| Hover lift | `hover:-translate-y-1` / `hover:-translate-y-2` | Buttons, cards |
| Active press | `active:scale-95` | All CTAs |
| Hover scale | `group-hover:scale-110` | Icon containers (pillar, mission, programs) |
| Image hover scale | `group-hover:scale-105 duration-700` | Faculty card images |
| Rotate icon | `group-hover:rotate-90` / `group-hover:rotate-12` / `group-hover:rotate-45` | Faculty Plus, ThemeToggle icons |
| Border color hover | `hover:border-primary/20` / `hover:border-primary/30` / `hover:border-primary/40` | Cards |
| Shadow hover | `hover:shadow-2xl`, `hover:shadow-xl`, `hover:shadow-primary/*` | Cards, buttons |
| Text color hover | `group-hover:text-primary` | Program titles |
| Modal animation | `animate-in fade-in zoom-in-95 duration-300` | Faculty detail modal |
| Flying photo | JS `requestAnimationFrame` scroll-driven translate/scale/border-radius animation | PresidentLetter (lg only) |
| Theme switch | `transition-colors duration-300` on CSS variables | Global light/dark |
| Hover opacity | `hover:opacity-70`, `hover:opacity-80` | Footer links, logo |

---

## 14. Pages Overview

| Route | File | Main Sections / Components |
|-------|------|---------------------------|
| `/` | `src/pages/index.astro` | Hero, Excellence, Programs, Accreditations, PresidentLetter |
| `/about` | `src/pages/about.astro` | Foundations (5 solas badges), Vision/Mission cards, MaximSection, 7 Pillars, Faculty grid + modal, Video section |
| `/programs` | `src/pages/programs/index.astro` | Program listing cards (2-col md, 3-col lg) |
| `/programs/[slug]` | `src/pages/programs/[slug].astro` | Program detail: type badge, duration, H1, description, admission requirements, career paths, objectives, curriculum by semester |
| `/pricing` | `src/pages/pricing.astro` | 3 fee bracket cards, scholarship foundation card, fee schedule table (desktop) / list (mobile), CTA |
| `/contact` | `src/pages/contact.astro` | Contact info cards, office hours panel, contact form |
| `/admission` | `src/pages/admission.astro` | 3-step process timeline, registration form |

**Shared layout** (`src/layouts/Layout.astro`): `Banner` → `Navbar` → `<slot />` → `Footer`; body is `bg-site-bg text-site-text min-h-screen flex flex-col`; theme applied via inline script.

---

## 15. Content Data Structure

### 15.1 Programs (`src/content/programs/*.json`)
Schema (`src/content.config.ts`): `title`, `type`, `duration`, `description`, `fullDescription`, `objectives[]`, `curriculum[][{semester, courses[]}]`, `admissionRequirements[]`, `careerPaths[]`.

Five programs:
1. `bachelor-theology` — Undergraduate, 4 Years (icon: BookOpen)
2. `bachelor-church-ministry` — icon: Church
3. `ma-pastoral-studies` — Graduate / Masteral (icon: GraduationCap)
4. `diploma-theological-studies` — icon: Scroll
5. `lay-leadership-studies` — icon: Users

### 15.2 Faculty (`src/data/faculty.ts`)
Interface: `id`, `name`, `role`, `image`, `degrees[]`, `education[][{degree, school?}]`, `specialization`, `titles`.
11 faculty members with photos in `public/images/faculty/`.

---

## 16. AI Agent Implementation Guidelines

### 16.1 Adding a New Color
1. Add CSS variable to `:root` and `.dark` in `src/styles/global.css`.
2. Add corresponding `--color-site-*` mapping in the `@theme` block if you want a semantic Tailwind class.
3. Optionally add to `tailwind.config.mjs` `theme.extend.colors` for raw Tailwind classes (e.g., `sb-orange`).

### 16.2 Creating a New Card
Follow the `FacultyCard` / `PillarCard` pattern:
- Wrapper: `bg-site-card border border-site-border rounded-[32px] ... transition-all duration-300 group`
- Hover: `hover:border-primary/20` (+ optional `hover:shadow-xl hover:shadow-primary/10`)
- Image: `object-cover` with `group-hover:scale-105`
- Use semantic classes (`text-site-text`, `text-site-muted`, `bg-primary/10`, `text-primary`) — never hardcode hex values.

### 16.3 Creating a New Button
- Primary: `bg-primary text-white ... rounded-2xl ... hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 active:scale-95`
- Secondary: `bg-site-card/60 backdrop-blur-sm text-site-text border-2 border-site-border ... rounded-2xl ...`
- Always include `transition-all duration-300` and `active:scale-95`.

### 16.4 Dark Mode
All component colors must reference CSS variables (`--brand-primary`, `--bg-color`, etc.) or Tailwind semantic classes (`text-primary`, `bg-site-card`, etc.). Do not hardcode `#0033A0` or `#F7F7F8` in new components except where existing precedent does (e.g., `Banner` uses `bg-[#0033A0]` intentionally).

### 16.5 Icons
Import from `lucide-react` (components with `<script>`) or `lucide-astro` (server-only Astro). Use numeric `size` prop. Wrap in `bg-primary/10 rounded-2xl` containers for consistency.

### 16.6 Typography Conventions
- Section kickers: `text-primary font-bold uppercase tracking-widest text-[10px]`
- Page H1s: `font-black` or `font-extrabold`, `tracking-tighter`, often with gradient span and `text-outline` (-webkit-text-stroke) for contact/admission.
- Body: `font-medium`, `text-site-muted`, `leading-relaxed`.

### 16.7 Spacing Conventions
- Section containers: `max-w-[1596px] mx-auto px-4 md:px-10` (hero-scale) or `max-w-[1200px] mx-auto px-6` (content pages).
- Section py: `py-16` to `py-24` typical; hero `pt-48 pb-40`.
- Grid gaps: `gap-6` to `gap-8`; cards `items-stretch h-full` for equal heights.

---

## 17. File Reference Index

| File | Role |
|------|------|
| `tailwind.config.mjs` | Custom color extensions (`sb-orange`, `sb-bg`, `sb-border`, `sb-text`, `sb-muted`) |
| `src/styles/global.css` | CSS theme tokens (light/dark), `@theme` semantic colors, base body styles |
| `src/layouts/Layout.astro` | Root layout, theme script, Banner/Navbar/Footer shell |
| `src/components/Navbar.astro` | Sticky nav, mobile menu, ThemeToggle |
| `src/components/ThemeToggle.astro` | Light/dark toggle (Moon/Sun) |
| `src/components/Banner.astro` | Top enrollment announcement bar |
| `src/components/Footer.astro` | Footer with campuses, contact, copyright |
| `src/components/Hero.astro` | Homepage hero with gradient H1 and dual CTAs |
| `src/components/Excellence.astro` | "Aim of Excellence" two-column card |
| `src/components/Programs.astro` | Homepage program listing cards |
| `src/components/Accreditations.astro` | Recognition/partnership cards with logo blobs |
| `src/components/PresidentLetter.astro` | President message with flying photo animation |
| `src/components/FacultyCard.astro` | Faculty card + modal detail template |
| `src/components/PillarCard.astro` | 7 pillars card |
| `src/components/MissionVisionCard.astro` | Vision/mission card |
| `src/components/MaximSection.astro` | Centered quote section |
| `src/pages/index.astro` | Homepage |
| `src/pages/about.astro` | About page (solas, vision/mission, pillars, faculty, video) |
| `src/pages/programs/index.astro` | Programs listing |
| `src/pages/programs/[slug].astro` | Program detail |
| `src/pages/pricing.astro` | Tuition/fees |
| `src/pages/contact.astro` | Contact form |
| `src/pages/admission.astro` | Application form + process steps |
| `src/content/config.ts` | Astro content collection schema (programs) |
| `src/data/faculty.ts` | Faculty data (11 members) |
| `src/content/programs/*.json` | Program content (5 files) |

---

*End of design document. This file should be treated as the source of truth for any AI agent modifying the PBSI website's visual layer.*