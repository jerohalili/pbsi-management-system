# PBSI Website — Complete Design System & Style Guide

**Target:** Presbyterian Bible Seminary Inc. (PBSI) website  
**Repository:** `pbsi1992.github.io`  
**Live URL:** https://pbsi1992.github.io  
**Purpose:** Exhaustive design-system reference for AI agents editing or extending this codebase. Every color, gradient, font, spacing unit, radius, shadow, card variant, icon usage, layout pattern, interaction, and dark-mode rule is cataloged with exact class strings and code snippets.

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
- `tailwind.config.mjs` — custom raw color extensions only (`sb-orange`, `sb-bg`, `sb-border`, `sb-text`, `sb-muted`). No font, radius, or spacing overrides; relies on Tailwind v4 defaults + CSS variables.
- `src/styles/global.css` — CSS custom properties (light/dark theme tokens), `@theme` semantic color mappings, base `body` styles, `@import "tailwindcss"`.
- `astro.config.mjs` — Tailwind + React integrations, site root config.

---

## 2. Color System

### 2.1 Raw Tailwind Color Extensions (`tailwind.config.mjs`)

```js
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'sb-orange': '#FF9500',   // declared; not actively used in components
        'sb-bg': '#F7F7F8',       // light page background
        'sb-border': '#F1F1F3',   // light borders / dividers
        'sb-text': '#1A1A1A',     // light primary text
        'sb-muted': '#59595A',    // light muted text
      },
    },
  },
  plugins: [],
}
```

> These `sb-*` tokens exist in `tailwind.config.mjs` but components predominantly use the CSS-variable-based `site-*` semantic colors defined in `global.css`.

### 2.2 CSS Custom Properties (Theme Tokens) — `src/styles/global.css`

**Light mode (`:root`) — the default theme**

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
| `--brand-primary` | `#3B82F6` | Primary brand blue (lighter for dark-mode legibility) |
| `--bg-color` | `#0F172A` | Page background (slate-900) |
| `--text-color` | `#F8FAFC` | Primary text (slate-50) |
| `--card-bg` | `#1E293B` | Card surface (slate-800) |
| `--border-color` | `#334155` | Borders (slate-700) |
| `--muted-text` | `#94A3B8` | Muted text (slate-400) |

### 2.3 Tailwind Semantic Color Classes (derived via `@theme`)

Defined in `global.css` and used throughout all components:

| Tailwind class | CSS variable | Light value | Dark value | Usage guidance |
|----------------|--------------|-------------|------------|----------------|
| `text-primary` | `--color-primary` = `var(--brand-primary)` | `#0033A0` | `#3B82F6` | Brand accents, headings, buttons, active states |
| `bg-primary` | same | `#0033A0` | `#3B82F6` | Primary buttons, active pill states |
| `border-primary` | same | `#0033A0` | `#3B82F6` | Focus rings, accent borders |
| `text-primary-light` | `--color-primary-light` | `#407BFF` | `#407BFF` | Gradient end stop (text-transparent) |
| `bg-primary-light` | same | `#407BFF` | `#407BFF` | Decorative corner blobs (pricing scholarship card) |
| `bg-site-bg` | `--color-site-bg` = `var(--bg-color)` | `#F7F7F8` | `#0F172A` | Page background, section backgrounds, glass scrims |
| `text-site-text` | `--color-site-text` = `var(--text-color)` | `#1A1A1A` | `#F8FAFC` | Primary body text, headings |
| `bg-site-card` | `--color-site-card` = `var(--card-bg)` | `#FFFFFF` | `#1E293B` | Card surfaces, modal backgrounds |
| `border-site-border` | `--color-site-border` = `var(--border-color)` | `#F1F1F3` | `#334155` | Card borders, input borders, dividers |
| `text-site-muted` | `--color-site-muted` = `var(--muted-text)` | `#59595A` | `#94A3B8` | Secondary text, captions, meta data |

### 2.4 Opacity Tints (used as modifier suffixes)

These are applied directly to semantic classes (e.g., `bg-primary/10`, `text-primary/60`, `border-site-border/60`):

| Opacity | Typical usage |
|---------|---------------|
| `/5` | Very subtle decorative glows, shadow tints |
| `/10` | Badge backgrounds, icon box backgrounds, card hover borders |
| `/20` | Secondary hover borders, divider tints |
| `/30` | Accent badges, selection backgrounds |
| `/40` | Glass scrims, hover borders on panels |
| `/50` | Table row backgrounds, glass cards |
| `/60` | Hero kicker backgrounds, form input backgrounds |
| `/90` | Modal backdrop scrims |

### 2.5 Hardcoded Hex / Inline Colors (appear in components)

| Color | File(s) | Usage |
|-------|---------|-------|
| `#0033A0` | `Banner.astro` | Enrollment announcement banner background |
| `#FF9500` | `tailwind.config.mjs` | Declared `sb-orange`; **unused** in components |
| `#ffffff` | `admission.astro` (`<style>`) | `<option>` background color |
| `#0f172a` | `admission.astro` (`<style>`) | `<option>` text color |

---

## 3. Gradient System (Comprehensive)

### 3.1 Primary → Primary-Light Gradient (Brand Gradient)

**Classes:** `bg-gradient-to-r from-primary to-primary-light`  
**Values:** `#0033A0` → `#407BFF` (light mode); `#3B82F6` → `#407BFF` (dark mode)

This is the site's signature gradient. It is applied exclusively to **gradient text** using `text-transparent bg-clip-text`.

**Usage locations:**

| Component | Element | Wrapper classes | Notes |
|-----------|---------|-----------------|-------|
| `Hero.astro` | H1 "Seminary Inc." | `text-6xl md:text-8xl lg:text-9xl font-extrabold text-site-text leading-[0.95] mb-10 tracking-tighter` | "Presbyterian Bible" is solid `text-site-text`; "Seminary Inc." is the gradient span |
| `Excellence.astro` | H2 "Spiritual, Character, Practical, and Academics" | `text-4xl md:text-5xl font-extrabold text-site-text leading-tight tracking-tight` | Gradient wraps only that phrase |
| `About.astro` | H1 "Foundations" | `text-4xl sm:text-6xl md:text-8xl font-extrabold text-site-text mb-8 md:mb-10 tracking-tighter` | Includes `pr-[0.1em]`, `selection:bg-primary/30`, `style="box-decoration-break: clone; -webkit-box-decoration-break: clone;"` |
| `About.astro` | H1 "Journey" | `text-3xl md:text-5xl font-black text-site-text tracking-tighter mb-4` | Same gradient span + `pr-[0.1em]` + selection + box-decoration-break |
| `Pricing.astro` | H1 "Financial Transparency" | `text-4xl sm:text-6xl md:text-8xl font-black text-site-text tracking-tighter mb-6 leading-[0.9]` | Same gradient span + `pr-[0.1em]` + style clone |

**Inline gradient-text pattern (copy this exactly):**

```html
<h1 class="text-4xl sm:text-6xl md:text-8xl font-extrabold text-site-text mb-8 md:mb-10 tracking-tighter">
  Our <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light pr-[0.1em] selection:bg-primary/30" style="box-decoration-break: clone; -webkit-box-decoration-break: clone;">
    Foundations
  </span>
</h1>
```

Key details:
- `pr-[0.1em]` adds right padding to the gradient span so the gradient doesn't touch the next character.
- `selection:bg-primary/30` gives the highlighted text a tinted brand selection color.
- `box-decoration-break: clone` ensures the gradient renders correctly across line breaks.

### 3.2 Diagonal Decorative Gradient

**Classes:** `bg-gradient-to-tr from-primary/10 to-transparent rounded-[32px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`  
**Usage:** `About.astro` — video section decorative background behind the iframe wrapper. Appears on group hover.

### 3.3 Bottom Fade Gradient

**Classes:** `absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50`  
**Usage:** `Pricing.astro` — bottom decorative overlay on the "Ready to pursue your calling?" CTA card.

---

## 4. Typography System

### 4.1 Font Families

| Class | Font | Source | Where used |
|-------|------|--------|------------|
| `font-sans` (default) | **Inter** | System / expected available | `body` in `global.css`; virtually all UI text |
| `font-serif` | Serif (browser default) | System serif stack | Footer institution name; President's signature (`Rev. Joval C. Kisinamal`) |

> Inter is applied globally via `body { font-family: 'Inter', sans-serif; }` in `global.css`. No external Google Fonts import is present in the codebase.

### 4.2 Font Weight Scale

| Class | Weight | Usage |
|-------|--------|-------|
| `font-medium` | 500 | Body copy, mission list items, program descriptions |
| `font-bold` | 700 | Card names, headings, labels, buttons, faculty names |
| `font-extrabold` | 800 | Hero H1, program listing titles, excellence headings, section H2s |
| `font-black` | 900 | Hero section titles, page H1s ("Foundations", "Faculty", "Journey", "Contact.", "Admissions."), pillar titles, kickers |
| `font-serif` | — | Footer logo text, president signature name |

### 4.3 Font Size Scale

| Size | Value | Usage |
|------|-------|-------|
| `text-[8px]` | 8px | Program role tags (Missionary, Artist, Designer, Animator, Teacher) |
| `text-[9px]` | 9px | Faculty degree tags; footer contact labels; solas badges; fee detail tags |
| `text-[10px]` | 10px | Faculty role badges; pillar index labels; footer small text; privacy/academic links; pricing labels; admission labels; contact labels |
| `text-[11px]` | 11px | Faculty titles (italic); form labels |
| `text-[12px]` | 12px | Program type badge on detail page |
| `text-[14px]` | 14px | Mission/vision card titles |
| `text-[15px]` | 15px | Nav links; nav Register button |
| `text-base` | 16px | Body copy, program descriptions |
| `text-lg` | 18px | Maxim quote, pricing section text |
| `text-xl` | 20px | Program card titles, mission/vision body |
| `text-2xl` | 24px | Faculty names, pillar card titles |
| `text-3xl` | 30px | Section H2s ("Programs Offered:", "From the President's Desk") |
| `text-4xl` | 36px | About "Our Foundations" H1 |
| `text-5xl` | 40px | Program detail H1, programs index H1 |
| `text-6xl` | 48px | Contact H1 |
| `text-8xl` | 64px | Hero H1 md breakpoint |
| `text-9xl` | 72px | Hero H1 lg breakpoint; Admissions H1 md+ |

### 4.4 Letter Tracking (letter-spacing)

| Class | Usage |
|-------|-------|
| `tracking-tight` | Hero H1, headings, button text |
| `tracking-tighter` | Hero H1, page H1s ("Foundations", "Journey", "Financial Transparency") |
| `tracking-widest` | Uppercase labels, section kickers, footer labels, solas badges |
| `tracking-[0.2em]` | Faculty role badges, section labels, form labels, footer divider text |
| `tracking-[0.3em]` | Pillar number labels, mission/vision subsection labels, faculty title (italic) |
| `tracking-[0.4em]` | About section "Statement of Faith" label, admission process kicker |
| `tracking-wider` | Faculty titles |

### 4.5 Line Height Scale

| Class | Usage |
|-------|-------|
| `leading-none` | Pillar card titles, hero kicker, large headings where wrap must be tight |
| `leading-tight` | Hero H1, faculty names, section headings, card titles |
| `leading-relaxed` | Body copy, descriptions, mission/vision text |
| `leading-[0.9]` | Hero H1 (extremely tight for overlap art direction) |
| `leading-[0.95]` | Hero H1 |
| `leading-[1.2]` / `leading-[1.1]` | About vision text |
| `leading-snug` | Mission list items |
| `leading-[0.8]` | Contact/admission large italic headings |
| `leading-[0.9]` | Pricing H1 |

### 4.6 Font Style & Text Transform

- `italic` — Faculty titles, mission list items, program descriptions (programs index), president letter body prose, pricing "Zero Tuition. Full Calling.", contact/admission large headings ("Contact.", "Admissions.", "Send a Message", "Student Registration")
- `uppercase` — Nearly all labels, kickers, badges, footer text, nav mobile items
- `font-black` + `italic` — President signature name, contact/admission H1s

### 4.7 Selection Color

- `selection:bg-primary/30` — Custom highlight color applied to gradient headings (about, pricing, hero).

### 4.8 Text Outline (Contact & Admission H1s)

Defined in page-level `<style>` blocks in `contact.astro` and `admission.astro`:

```css
.text-outline {
  -webkit-text-stroke: 1.5px currentColor;
}
@media (min-width: 768px) {
  .text-outline {
    -webkit-text-stroke: 2px currentColor;
  }
}
.text-outline {
  color: transparent;
}
```

Used on the `.` after "Contact" and "Admissions" to create a stroked punctuation mark.

---

## 5. Spacing System

### 5.1 Page Container & Max-Widths

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

### 5.2 Standard Page Padding

| Class | Context |
|-------|---------|
| `px-4 md:px-10` | Default section container padding (hero, navbar, footer, programs, accreditations, president letter) |
| `px-6` | About page sections, contact main, pricing main |

### 5.3 Section Vertical Padding

| Class | Context |
|-------|---------|
| `pt-48 pb-40` | Hero (large top/bottom) |
| `py-5` | Navbar |
| `py-12` | Default section (about pillars, programs index) |
| `py-16` | Footer inner, faculty section, contact header |
| `py-20` | Pricing main, excellence |
| `py-24` | Accreditations, president letter section, program detail |
| `py-32` | Maxim section |

### 5.4 Gap Scale

| Gap | Context |
|-----|---------|
| `gap-2` | Nav link/icon groups, faculty degree pills |
| `gap-3` | Faculty image-to-content, accordion-like groups |
| `gap-4` | Grid gaps (faculty grid, pillars), icon+text groups |
| `gap-5` | Hero CTA button group |
| `gap-6` | Default grid gap (faculty, pricing cards), form fields |
| `gap-8` | Pillar grid lg, program grid, curriculum sections |
| `gap-10` | Contact/admission two-column split |
| `gap-12` | Footer grid, hero bottom |
| `gap-16` | President letter flex row |

### 5.5 Layout Primitives

- `flex flex-col` — Body (Layout), most sections stack vertically
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — Faculty grid, program grid
- `lg:grid-cols-12` — Footer (5-col + 4-col + 3-col spans)
- `items-stretch` / `h-full min-h-full` — Equal-height cards in grids
- `relative overflow-hidden` — Sections with decorative background blobs
- `sticky top-0 z-50` — Navbar

---

## 6. Border Radius System (Defined Scale)

| Radius value | Usage | Examples |
|--------------|-------|----------|
| `rounded-full` | Pills, badges, type tags, status pills, accent dividers, circular decorative blobs, icon containers (some) | Type pills, status badges, accent `h-1 w-12`, decorative blobs |
| `rounded-lg` | Nav desktop links, small badges, select wrappers | Nav desktop links |
| `rounded-md` | Faculty degree tags, pricing detail tags | Faculty degree spans, pricing detail tags |
| `rounded-xl` | Nav register button, icon containers (w-8/h-8), faculty flying photo (start) | Nav Register, Excellence aim icons |
| `rounded-2xl` | **Most common.** Buttons, modal close, mission/vision icon boxes, pillar icon boxes, video container, faculty photo (end state), contact icon boxes | Hero CTAs, MissionVisionCard icon, PillarCard icon, Programs icon box |
| `rounded-[24px]` | Navbar container, navbar mobile menu, president photo (flying & start), select inputs | Navbar shell, mobile menu, PresidentLetter photos |
| `rounded-[32px]` | **Card standard.** FacultyCard, PillarCard, pricing cards, contact cards, admission cards, program cards (hero section), footer, modal, maxim section | Most cards across the site |
| `rounded-[40px]` | MissionVisionCard, president letter card (md+), programs list card (md+), pricing cards (md+), contact form card | Larger cards |
| `rounded-[48px]` | President letter card (lg, sticky sidebar image) | PresidentLetter main card |
| `rounded-t-[40px]` | Program detail header top-only rounding | Program detail page header |

> Rule: Always pair `overflow-hidden` with radius on image containers (faculty photos, video, president photo) to clip content.

---

## 7. Shadow & Elevation System

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

**Lift / press interactions:**
- `hover:-translate-y-1` — Buttons, cards (subtle lift)
- `hover:-translate-y-2` — Cards (stronger lift)
- `active:scale-95` — Press-down feedback on all CTAs
- `hover:brightness-110` — Nav register button

---

## 8. Card System (Comprehensive Usage Guide)

The site uses **four primary card variants**, all built on the same semantic foundation: `bg-site-card border border-site-border ... transition-all ... group`.

### 8.1 Card Foundation (Apply to all cards)

```html
<div class="bg-site-card border border-site-border rounded-[32px] overflow-hidden group transition-all duration-300 hover:border-primary/20">
  <!-- card content -->
</div>
```

- `bg-site-card` — surface color (white light / slate-800 dark)
- `border border-site-border` — subtle border
- `rounded-[32px]` — standard card rounding
- `overflow-hidden` — clips images and child radii
- `group` — enables `group-hover:*` on children
- `hover:border-primary/20` — brand-tinted border on hover
- `transition-all duration-300` / `duration-500` — smooth hover transitions

### 8.2 Card Variant A: FacultyCard (`src/components/FacultyCard.astro`)

**Use for:** Faculty member listings with photo, name, role, degrees, and "View Profile" CTA.

**Anatomy:**
```
Wrapper: bg-site-card border border-site-border rounded-[32px] overflow-hidden group hover:border-primary/20 transition-all duration-500 flex flex-col h-full
  Image wrapper: aspect-[4/5] overflow-hidden bg-site-bg border-b border-site-border
    img: w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-105
  Body: p-8 flex flex-col flex-grow
    Role: text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2
    Name: text-2xl font-bold text-site-text mb-2 leading-tight
    Titles: text-[11px] text-primary/60 font-bold uppercase tracking-wider mb-4 italic
    Degree pills (flex-wrap gap-2):
      text-[9px] font-black text-site-muted bg-site-bg border border-site-border px-2 py-1 rounded-md uppercase
    CTA button (mt-auto):
      bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl text-primary font-bold text-xs uppercase tracking-widest transition-all group/btn
      px-6 py-4 flex items-center justify-between w-full
      Contains Plus icon (size=16) with group-hover/btn:rotate-90
```

**Modal detail template** (hidden `<template id="data-{id}">`):
- Image: `w-32 h-32 rounded-2xl object-cover border border-site-border shadow-lg`
- Name: `text-3xl font-black text-site-text leading-tight`
- Role: `text-primary font-bold uppercase tracking-widest text-xs mt-1`
- Titles: `text-site-muted italic text-sm mt-2 leading-relaxed`
- Section headers: `text-xs font-black text-primary uppercase tracking-[0.3em] border-b border-primary/10 pb-2`

### 8.3 Card Variant B: PillarCard (`src/components/PillarCard.astro`)

**Use for:** Statement-of-faith pillars — icon + numbered label + title + description.

**Anatomy:**
```
Wrapper: bg-site-card border border-site-border p-10 rounded-[32px] hover:border-primary/20 transition-all duration-300 group flex flex-col items-center text-center h-full
  Index label: text-[10px] font-black text-primary/40 uppercase block leading-none mb-2 tracking-[0.2em]  ("Pillar 01")
  Title: text-2xl font-extrabold text-site-text tracking-tight uppercase leading-none
  Icon container: w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500
  Body (slot): text-base text-site-muted leading-relaxed font-medium max-w-[280px]
```

### 8.4 Card Variant C: MissionVisionCard (`src/components/MissionVisionCard.astro`)

**Use for:** Vision and mission statements — larger icon box + title + body.

**Anatomy:**
```
Wrapper: bg-site-card border border-site-border p-10 rounded-[40px] shadow-sm flex flex-col group hover:border-primary/20 transition-colors duration-500
  Icon container: w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0
  Title: text-[14px] font-black uppercase tracking-[0.2em] text-primary
  Body (slot): flex-grow
```

### 8.5 Card Variant D: Program Card (`src/components/Programs.astro`)

**Use for:** Academic program listings on homepage.

**Anatomy:**
```
Wrapper: group bg-site-card border border-site-border p-8 rounded-[32px] transition-all duration-500 ease-out hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-primary/10 flex flex-col w-full min-h-full
  Responsive width: md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]
  Top row (flex justify-between items-start mb-8):
    Icon box: text-primary bg-site-bg w-14 h-14 md:w-16 md:h-16 shrink-0 aspect-square flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-500 ease-out border border-site-border overflow-hidden
    Type pill: text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full
  Body (flex-grow):
    Title: text-xl md:text-2xl font-bold text-site-text mb-3 group-hover:text-primary transition-colors duration-300
    Duration row: text-[10px] md:text-xs font-semibold text-site-muted uppercase tracking-wider + Clock icon size=14
    Description: text-site-muted leading-relaxed mb-8 text-sm md:text-base line-clamp-3 font-medium
  CTA (mt-auto): inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all duration-300 + ArrowRight size=20
```

### 8.6 Card Variant E: Program Listing Card (`src/pages/programs/index.astro`)

**Use for:** Full program detail listing cards (larger variant).

**Anatomy:**
```
Wrapper: group bg-site-card border border-site-border rounded-[40px] p-8 md:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20
  Icon box: w-20 h-20 shrink-0 aspect-square ... rounded-[24px] border border-site-border group-hover:scale-105
  CTA: bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95
```

### 8.7 Card Variant F: Pricing Fee Card (`src/pages/pricing.astro`)

**Use for:** Tuition fee brackets.

**Anatomy:**
```
Wrapper: bg-site-card border border-site-border rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col justify-between hover:border-primary/40 transition-all duration-500 shadow-xl shadow-black/5 w-full
  Type: text-2xl md:text-3xl font-black text-site-text leading-tight mb-2 uppercase tracking-tighter italic
  Note: text-[10px] font-black text-primary uppercase tracking-[0.3em]
  Price: text-site-text font-black text-2xl md:text-3xl tracking-tight (prefixed with ₱)
  "100% Free": text-primary font-black uppercase tracking-tighter text-sm md:text-base italic
  Detail tags: text-[9px] font-black text-site-muted bg-site-bg border border-site-border px-3 py-1.5 rounded-lg uppercase tracking-wider
```

### 8.8 Card Usage Rules (Do's and Don'ts)

| Do | Don't |
|----|-------|
| Use `bg-site-card` + `border border-site-border` for all card surfaces | Hardcode `#FFFFFF` or `#F7F7F8` backgrounds |
| Use `rounded-[32px]` as default card radius; `rounded-[40px]` for featured cards | Mix arbitrary radii without reason |
| Add `group-hover:border-primary/20` on interactive cards | Omit hover states on clickable cards |
| Use `overflow-hidden` on cards containing images | Let images overflow card borders |
| Use `h-full min-h-full` + `items-stretch` on parent grid for equal card heights | Allow uneven card heights in grids |
| Use `duration-300` for color/border transitions, `duration-500` for transform/scale | Use inconsistent transition durations |

---

## 9. Component Catalog (Exact Class Strings)

### 9.1 Buttons / CTAs

**Primary CTA** (Hero, pricing, admission):
```html
<a href="#" class="bg-primary text-white px-14 py-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 active:scale-95">
  Register Now
</a>
```
Variants:
- Nav Register: `bg-primary text-white px-7 py-3 rounded-xl font-bold text-[15px] hover:brightness-110 transition-all shadow-md`
- Programs index CTA: `bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95`
- Pricing CTA (with ArrowRight group): `inline-flex w-full md:w-auto items-center justify-center gap-3 bg-primary text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-2 active:scale-95 group uppercase italic`
- Contact/Admission submit: `w-full md:w-auto bg-primary text-white px-12 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-4 hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] transition-all hover:-translate-y-1 active:scale-95 group uppercase italic tracking-tight`

**Secondary / Outline CTA** (Hero "Learn More"):
```html
<a href="#" class="bg-site-card/60 backdrop-blur-sm text-site-text border-2 border-site-border px-14 py-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:-translate-y-1 hover:bg-site-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10 active:scale-95">
  Learn More
</a>
```

**Ghost / Tinted CTA** (Programs "View All Programs"):
```html
<a href="#" class="bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all duration-300">
  View All Programs
</a>
```

**Card CTA** (FacultyCard "View Profile"):
```html
<button class="mt-auto flex items-center justify-between w-full px-6 py-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl text-primary font-bold text-xs uppercase tracking-widest transition-all group/btn">
  View Profile
  <Plus size={16} className="transition-transform duration-300 group-hover/btn:rotate-90" />
</button>
```

**Nav mobile CTA**:
```html
<a href="#" class="block w-full bg-primary text-white text-center py-5 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all">
  Register Now
</a>
```

### 9.2 Navbar

```html
<header class="sticky top-0 z-50 w-full px-4 md:px-10 py-5">
  <nav class="max-w-[1516px] mx-auto bg-site-card/80 backdrop-blur-md border border-site-border rounded-[24px] px-6 py-3.5 flex items-center justify-between shadow-xl shadow-black/5">
    <!-- Logo: w-10 h-10 md:w-12 md:h-12 object-contain -->
    <!-- Desktop links: text-[15px] font-medium text-site-text px-4 py-2 hover:bg-site-border rounded-lg transition-all -->
    <!-- Nav Register: bg-primary text-white px-7 py-3 rounded-xl font-bold text-[15px] hover:brightness-110 transition-all shadow-md -->
    <!-- Mobile toggle: lg:hidden p-2.5 text-site-text hover:bg-site-border rounded-xl transition-all relative w-10 h-10 flex items-center justify-center -->
  </nav>
  <!-- Mobile menu: hidden lg:hidden absolute top-full left-4 right-4 mt-4 p-6 bg-site-card/95 backdrop-blur-xl border border-site-border rounded-[32px] shadow-2xl -->
</header>
```

Icons: `Menu`, `X` from lucide-react (size={24}).

### 9.3 Footer

- Wrapper: `bg-site-card border-t border-site-border mt-20 relative overflow-hidden`
- Decorative blob: `absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20 pointer-events-none`
- Inner: `max-w-[1200px] mx-auto px-4 md:px-10 py-16 relative z-10`
- Grid: `grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8`
- Institution name: `text-2xl font-serif font-bold text-site-text leading-tight`
- Accent divider: `h-1 w-12 bg-primary mt-4`
- Description: `text-site-muted text-sm leading-relaxed max-w-md`
- Section kickers: `text-xs font-black uppercase tracking-widest text-primary`
- Location icon: inline SVG `w-4 h-4 text-primary` stroke-width="2.5" round caps/joins
- Campus labels: `text-[10px] font-bold text-primary uppercase mb-1`; addresses `text-xs text-site-text leading-relaxed`
- Contact labels: `text-[10px] font-bold text-site-muted uppercase mb-1`
- Email link: `text-sm font-semibold text-site-text hover:text-primary transition-colors decoration-primary/30 underline underline-offset-4`
- Copyright: `text-[10px] font-bold text-site-muted uppercase tracking-widest`
- Footer links: `text-[10px] font-bold text-primary uppercase hover:opacity-70 transition-opacity`

### 9.4 Hero

```html
<section class="relative w-full pt-48 pb-40 overflow-hidden -mt-[116px]">
  <div class="relative z-10 max-w-[1596px] mx-auto px-4 md:px-10 text-center">
    <!-- Kicker: inline-flex items-center gap-2 bg-site-card/40 backdrop-blur-sm px-6 py-3 rounded-full border border-site-border mb-12 shadow-sm -->
    <!-- H1: text-6xl md:text-8xl lg:text-9xl font-extrabold text-site-text leading-[0.95] mb-10 tracking-tighter -->
    <!-- Gradient span: text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light -->
    <!-- Subhead: text-site-muted max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed mb-16 font-medium -->
    <!-- CTA group: flex flex-col sm:flex-row justify-center items-center gap-5 -->
  </div>
</section>
```

### 9.5 Excellence

- Section: `max-w-[1596px] mx-auto px-4 md:px-10 py-24`
- Card: `bg-site-card border border-site-border rounded-[32px] p-8 md:p-20 shadow-sm transition-colors duration-300`
- Grid: `grid lg:grid-cols-2 gap-16 items-center`
- Accent divider: `w-20 h-1.5 bg-primary rounded-full`
- Aim items: `group flex items-start gap-5`; icon `w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary`

### 9.6 Accreditations

- Section: `py-24 relative overflow-hidden bg-site-bg`
- Decorative blob: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none`
- Cards: `group relative bg-site-card/40 backdrop-blur-md border border-site-border p-8 md:p-10 rounded-[32px] transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2`
- Logo container: `w-24 h-24 mb-8 relative flex items-center justify-center` with inner `absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-colors`
- Status pill: `px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4`

### 9.7 PresidentLetter

- Section: `py-6 md:py-24 bg-site-card/30`
- Main card: `bg-site-card border border-site-border rounded-[32px] md:rounded-[48px] p-6 md:p-20 shadow-2xl relative z-10`
- Flying photo (JS-animated, lg only): `fixed pointer-events-none z-[40] overflow-hidden border-4 border-primary rounded-[24px] bg-site-bg shadow-xl hidden lg:block opacity-0 transition-opacity duration-300`
- Start photo: `border-4 border-primary lg:border-none rounded-[24px] overflow-hidden`
- Glow: `absolute -inset-4 bg-primary/10 rounded-[32px] blur-2xl lg:block hidden`
- End photo: `w-32 md:w-44 aspect-[4/5] rounded-2xl bg-site-card/50 border-2 border-dashed border-site-border shrink-0 overflow-hidden`
- President name: `text-2xl font-bold text-site-text mb-0.5 text-pretty`
- Role: `text-primary font-bold uppercase tracking-widest text-[10px]`
- Pull quote: `text-site-muted italic text-sm leading-relaxed border-l-2 border-primary/20 pl-4 hidden lg:block`
- Body prose: `prose prose-base md:prose-lg dark:prose-invert max-w-none text-site-muted leading-relaxed space-y-6`
- Sign-off: `text-3xl font-serif italic text-primary font-bold`
- Lower card: `bg-site-bg border-2 border-site-border p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl relative z-30`
- Role chips: `text-[8px] font-bold uppercase px-2 py-1 bg-primary/5 border border-primary/10 rounded text-primary`

### 9.8 Banner

```html
<div class="w-full bg-[#0033A0] py-3.5 text-center px-4">
  <p class="text-white text-sm font-medium">
    Enrollment for Academic Year 2026-2027 at PBSI is now Ongoing!
    <span class="ml-2 inline-block transition-transform hover:translate-x-1 cursor-default">→</span>
  </p>
</div>
```

### 9.9 MaximSection

- Section: `py-32 bg-site-card/30 border-y border-site-border backdrop-blur-sm`
- Quote: `text-xl md:text-3xl font-bold text-site-text mb-6 leading-relaxed italic`
- Divider: `h-[1px] w-8 bg-primary/30` (both sides of reference)
- Reference: `text-primary font-black tracking-[0.3em] uppercase text-xs`

### 9.10 ThemeToggle

- Button: `group relative p-2.5 rounded-xl border border-site-border bg-site-bg hover:border-primary/40 transition-all flex items-center justify-center shadow-sm overflow-hidden active:scale-95`
- Hover overlay: `absolute inset-0 pointer-events-none bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300`
- Moon icon (light mode): `w-5 h-5 block dark:hidden text-primary transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`
- Sun icon (dark mode): `w-5 h-5 hidden dark:block text-primary transition-all duration-500 group-hover:rotate-45 group-hover:scale-110`

---

## 10. Layout Patterns (Section Templates)

### 10.1 Default Section Pattern

```html
<section class="max-w-[1596px] mx-auto px-4 md:px-10 py-16 md:py-24">
  <div class="text-center mb-12 md:mb-16">
    <h2 class="text-primary font-bold tracking-widest uppercase text-xs md:text-sm mb-3">Kicker</h2>
    <h3 class="text-3xl md:text-5xl font-extrabold text-site-text leading-tight">Heading</h3>
  </div>
  <!-- content -->
</section>
```

### 10.2 Card Grid Pattern (3-col desktop)

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
  {items.map(item => (
    <Card {...item} />
  ))}
</div>
```

### 10.3 Two-Column Split Pattern (image left, content right)

Used in PresidentLetter and About video sections. Parent: `flex flex-col lg:flex-row gap-6 md:gap-16 items-start`.

### 10.4 Hero Pattern

- Negative top margin `-mt-[116px]` to tuck behind sticky navbar
- `pt-48 pb-40` for generous vertical space
- Centered text with kicker → gradient H1 → subhead → dual CTAs

---

## 11. Forms System

### 11.1 Shared Input Style (Contact & Admission)

```html
<input
  type="text"
  name="name"
  required
  placeholder="Juan Dela Cruz"
  class="w-full bg-site-bg/60 border border-site-border rounded-2xl px-6 py-4 md:py-5 text-site-text font-bold focus:border-primary outline-none transition-all placeholder:opacity-20"
/>
```

- Label: `text-[11px] font-black uppercase tracking-[0.2em] text-primary ml-1`
- Wrapper: `flex flex-col gap-3`
- Grid: `grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8`

### 11.2 Select Dropdowns (Admission)

```html
<select name="sex" required class="w-full bg-site-bg/60 border border-site-border rounded-2xl pl-6 pr-12 py-4 md:py-5 text-site-text font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none appearance-none cursor-pointer transition-all">
  <option value="" disabled selected>Select...</option>
</select>
<div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
  <ChevronDown size={20} />
</div>
```

Inline `<style>` in `admission.astro`:
```css
select { background-image: none; }
option { background-color: #ffffff; color: #0f172a; font-weight: 600; }
```

### 11.3 Submit Button (Shared)

```html
<button type="submit" class="w-full md:w-auto bg-primary text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-4 hover:shadow-[0_20px_60px_rgba(var(--primary-rgb),0.5)] transition-all hover:-translate-y-1 active:scale-95 group uppercase italic tracking-tighter shadow-xl shadow-primary/20">
  Submit Application
  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
</button>
```

### 11.4 Form Endpoints

Both Contact and Admission POST to `https://api.web3forms.com/submit` with hidden fields:
- `access_key` = `3e0eb43a-715e-4a1f-ab43-6b729196b441`
- `botcheck` (hidden checkbox)
- `subject` (page-specific)

---

## 12. Icons System

### 12.1 Library

- **Lucide** — `lucide-react` for components with client-side `<script>`; `lucide-astro` for server-only Astro components.
- All icons use numeric `size` prop and optional `strokeWidth`.

### 12.2 Icon Inventory & Locations

| Icon | Component(s) | Size | Notes |
|------|--------------|------|-------|
| `Menu`, `X` | Navbar mobile toggle | 24 | |
| `Moon`, `Sun` | ThemeToggle | 5 (w-5/h-5) | `stroke-width={2}` |
| `Plus` | FacultyCard CTA | 16 | Rotates on hover |
| `GraduationCap` | Programs (MA Pastoral Studies) | 32 | |
| `BookOpen` | Programs (Bachelor Theology), About (Pillar: The Word) | 32 / 40 | |
| `Church` | Programs (Bachelor Church Ministry), About (Pillar: The Church) | 32 / 40 | |
| `Scroll` | Programs (Diploma Theological Studies) | 32 | |
| `Users` | Programs (Lay Leadership Studies), About (Pillar icon) | 32 | |
| `ArrowRight` | Programs CTA, Pricing CTA, Admission submit | 20 / 24 | |
| `Target` | About (Mission card) | 28 | |
| `Eye` | About (Vision card) | 28 | |
| `CheckCircle2` | About mission list items | 20 | |
| `SquareStack` | About (Pillar: The Trinity) | — | |
| `Heart` | About (Pillar: Jesus Christ) | — | |
| `Flame` | About (Pillar: Holy Spirit) | — | |
| `Road` | About (Pillar: Salvation) | — | |
| `PersonStanding` | About (Pillar: Resurrection) | — | |
| `Clock` | Programs duration, Contact office hours, Admission | 14 / 18 / 20 | |
| `Send` | Contact submit button | 24 | |
| `Mail`, `Phone` | Contact info cards | 28 | |
| `Calendar` | Contact office hours | 14 | |
| `UserPlus` | Admission step 1 | 20 | |
| `FileText` | Admission step 2 | 20 | |
| `CheckCircle` | Admission step 3 | 20 | |
| `ChevronDown` | Admission select dropdowns | 20 | Custom absolute overlay |

### 12.3 Custom Inline SVGs (non-lucide)

- **Footer location marker:** `M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z` + circle, stroke-width 2.5, round caps/joins. Used twice (Main & Annex campus).
- **About mission list check:** polyline `20 6 9 17 4 12`, stroke-width 3.
- **Program page checkmarks:** path `M20 6 9 17 4 12`, stroke-width 3.
- **Program page clock icon:** circle + polyline, stroke-width 2.5.
- **Faculty modal close:** inline SVG `X` (two lines), stroke-width 3.
- **Program detail "Q."** is rendered as text `Q.` (not an icon).

### 12.4 Icon Container Patterns

| Pattern | Classes | Usage |
|---------|---------|-------|
| Small aim icon | `w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary` | Excellence aims |
| Pillar icon | `w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500` | PillarCard |
| Mission/Vision icon | `w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0` | MissionVisionCard |
| Accreditations logo | `w-24 h-24 ... rounded-2xl` with inner `bg-primary/5 rounded-2xl blur-xl` | Accreditations |
| Programs hero icon | `text-primary bg-site-bg w-14 h-14 ... rounded-2xl border border-site-border overflow-hidden` | Programs section |
| Programs index icon | `w-20 h-20 shrink-0 aspect-square ... rounded-[24px] border border-site-border` | Programs listing page |

---

## 13. Interactions & Animation Library

| Effect | Classes / JS | Usage |
|--------|--------------|-------|
| Color transition | `transition-colors duration-300` | Body theme switch, card borders |
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
| Backdrop blur | `backdrop-blur-sm` / `md` / `xl` / `2xl` | Hero kicker, navbar, mobile menu, contact cards, accreditations |

---

## 14. Dark Mode System

### 14.1 Mechanics

- **Default theme:** light (hardcoded fallback in `Layout.astro`).
- **Preference storage:** `localStorage` key `"theme"` (`"light"` \| `"dark"`).
- **`Layout.astro` inline script:** runs on load, reads localStorage, adds/removes `dark` class on `<html>`, syncs back to localStorage.
- **`ThemeToggle.astro`:** lucide `Moon` / `Sun` toggles the `dark` class and persists choice; re-initializes on `astro:after-swap`.

### 14.2 Token Swap Summary

| Token | Light | Dark |
|-------|-------|------|
| `--brand-primary` | `#0033A0` | `#3B82F6` |
| `--bg-color` | `#F7F7F8` | `#0F172A` |
| `--text-color` | `#1A1A1A` | `#F8FAFC` |
| `--card-bg` | `#FFFFFF` | `#1E293B` |
| `--border-color` | `#F1F1F3` | `#334155` |
| `--muted-text` | `#59595A` | `#94A3B8` |

### 14.3 Dark Mode Rules for New Components

1. **Never hardcode** `#0033A0`, `#F7F7F8`, `#FFFFFF`, `#1A1A1A`, etc. in new components.
2. Always use semantic classes: `text-primary`, `bg-site-card`, `border-site-border`, `text-site-text`, `text-site-muted`.
3. For opacity tints, use `bg-primary/10`, `text-primary/60`, `border-site-border/60`, etc. (these adapt via CSS variables).
4. Exception: intentional dark-mode-only accents like `text-white` / `bg-white/10` (used in pricing scholarship card, contact panel).

---

## 15. Responsive Behavior Matrix

| Breakpoint | Value | Notable usage |
|------------|-------|---------------|
| `sm` | 640px | Faculty grid 2-col |
| `md` | 768px | Most `md:` overrides (padding, text sizes, grid columns, form layouts) |
| `lg` | 1024px | Navbar desktop links, 3-col grids, sticky president sidebar, flying photo |
| `xl` | — | No `xl` overrides found in codebase |

**Common responsive patterns:**
- `px-4 md:px-10` — container padding
- `text-base md:text-lg` / `text-xl md:text-2xl` — type scaling
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — card grids
- `hidden lg:flex` / `lg:hidden` — show/hide by breakpoint
- `md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]` — card width overrides
- `flex flex-col sm:flex-row` — stack on mobile, row on desktop

---

## 16. Z-Index & Layering

| Value | Usage |
|-------|-------|
| `z-10` | Default content layer (hero container, footer inner) |
| `z-50` | Navbar (sticky header) |
| `z-[40]` | President flying photo |
| `z-[100]` | Faculty modal backdrop |
| `-z-10` | Decorative background blobs (behind content) |
| `-inset-4` / `absolute inset-0` | Glow overlays and decorative blobs |

---

## 17. Page-by-Page Breakdown

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

## 18. Content Data Structures

### 18.1 Programs (`src/content/programs/*.json`)

Schema (`src/content.config.ts`): `title`, `type`, `duration`, `description`, `fullDescription`, `objectives[]`, `curriculum[][{semester, courses[]}]`, `admissionRequirements[]`, `careerPaths[]`.

Five programs:
1. `bachelor-theology` — Undergraduate, 4 Years (icon: BookOpen)
2. `bachelor-church-ministry` — icon: Church
3. `ma-pastoral-studies` — Graduate / Masteral (icon: GraduationCap)
4. `diploma-theological-studies` — icon: Scroll
5. `lay-leadership-studies` — icon: Users

### 18.2 Faculty (`src/data/faculty.ts`)

Interface: `id`, `name`, `role`, `image`, `degrees[]`, `education[][{degree, school?}]`, `specialization`, `titles`.
11 faculty members with photos in `public/images/faculty/`.

---

## 19. Implementation Guidelines for AI Agents

### 19.1 Adding a New Color

1. Add CSS variable to `:root` and `.dark` in `src/styles/global.css`.
2. Add corresponding `--color-site-*` mapping in the `@theme` block if you want a semantic Tailwind class.
3. Optionally add to `tailwind.config.mjs` `theme.extend.colors` for raw Tailwind classes.

### 19.2 Creating a New Card

Follow the `FacultyCard` / `PillarCard` pattern:
- Wrapper: `bg-site-card border border-site-border rounded-[32px] ... transition-all duration-300 group`
- Hover: `hover:border-primary/20` (+ optional `hover:shadow-xl hover:shadow-primary/10`)
- Image: `object-cover` with `group-hover:scale-105`
- Use semantic classes (`text-site-text`, `text-site-muted`, `bg-primary/10`, `text-primary`) — never hardcode hex values.

### 19.3 Creating a New Button

- **Primary:** `bg-primary text-white ... rounded-2xl ... hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 active:scale-95`
- **Secondary:** `bg-site-card/60 backdrop-blur-sm text-site-text border-2 border-site-border ... rounded-2xl ...`
- Always include `transition-all duration-300` and `active:scale-95`.

### 19.4 Dark Mode

All component colors must reference CSS variables or Tailwind semantic classes. Do not hardcode hex values except where existing precedent does (e.g., `Banner` uses `bg-[#0033A0]` intentionally).

### 19.5 Icons

Import from `lucide-react` (components with `<script>`) or `lucide-astro` (server-only Astro). Use numeric `size` prop. Wrap in `bg-primary/10 rounded-2xl` containers for consistency.

### 19.6 Typography Conventions

- Section kickers: `text-primary font-bold uppercase tracking-widest text-[10px]`
- Page H1s: `font-black` or `font-extrabold`, `tracking-tighter`, often with gradient span and `text-outline` (-webkit-text-stroke) for contact/admission.
- Body: `font-medium`, `text-site-muted`, `leading-relaxed`.

### 19.7 Spacing Conventions

- Section containers: `max-w-[1596px] mx-auto px-4 md:px-10` (hero-scale) or `max-w-[1200px] mx-auto px-6` (content pages).
- Section py: `py-16` to `py-24` typical; hero `pt-48 pb-40`.
- Grid gaps: `gap-6` to `gap-8`; cards `items-stretch h-full` for equal heights.

---

## 20. Accessibility Notes

- Theme preference persisted in `localStorage` and applied to `<html class="dark">`.
- Navbar mobile menu toggles `data-state="open\|closed"` and traps focus via click handlers (no focus-trap implementation present).
- Forms use `required` attributes and associated labels.
- All images have `alt` attributes.
- Contrast relies on `text-site-text` on `bg-site-card` / `bg-site-bg` pairs; dark mode swaps tokens automatically.
- No `prefers-reduced-motion` handling found; hover transforms and transitions are applied unconditionally.

---

## 21. File Reference Index

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

*End of design document. This file is the authoritative visual reference for the PBSI website. When in doubt, copy existing class strings verbatim rather than inventing new values.*