---
name: Obsidian Intelligence
colors:
  surface: '#0e1511'
  surface-dim: '#0e1511'
  surface-bright: '#343b36'
  surface-container-lowest: '#09100c'
  surface-container-low: '#161d19'
  surface-container: '#1a211d'
  surface-container-high: '#242c27'
  surface-container-highest: '#2f3632'
  on-surface: '#dde4dd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dde4dd'
  inverse-on-surface: '#2b322d'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb2b7'
  on-secondary: '#67001b'
  secondary-container: '#b50036'
  on-secondary-container: '#ffc2c4'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0e1511'
  on-background: '#dde4dd'
  surface-variant: '#2f3632'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is centered on a high-end, technical aesthetic tailored for talent acquisition and data-driven decision-making. It leverages **Dark Glassmorphism** to create a sense of depth and focus, evoking a "command center" atmosphere. The target audience—recruiters and hiring managers—requires a UI that minimizes cognitive load while highlighting critical data points through vibrant luminosity.

The visual style utilizes deep charcoal foundations and translucent "glass" overlays to separate information layers. Subtle glow effects and high-contrast accents ensure that candidate scores and match percentages are immediately legible against the dark backdrop.

## Colors

The palette is anchored by a deep **#0A0A0A** background to maximize the contrast of the glass elements. 

- **Primary (Emerald):** Used for high match scores, "hired" status, and primary action buttons.
- **Secondary (Rose):** Reserved for missing skills, critical gaps, and destructive actions.
- **Tertiary (Amber):** Employed for warnings, "maybe" candidates, and secondary data alerts.
- **Surface:** Surfaces use a semi-transparent dark gray with a heavy backdrop blur (20px-32px) to simulate frosted glass.

## Typography

This design system utilizes a pairing of **Geist** for structural and data elements and **Inter** for long-form reading. Geist’s technical, monospaced-influenced proportions provide a "developer-tool" precision to candidate metrics and scores. 

Hierarchy is established through weight and tracking rather than just size. Labels and metadata should use `label-caps` to distinguish auxiliary information from primary candidate data.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum container width of 1440px. A 12-column system is used for desktop, collapsing to 1 column for mobile. 

Spacing is governed by a 4px base unit. Dashboard widgets and candidate cards should prioritize generous internal padding (`md` or 24px) to allow the glass background blur effects to feel expansive and "airy" despite the dark color scheme.

## Elevation & Depth

Depth is created through a "Stacking Glass" logic rather than traditional shadow casting:

1.  **Base Layer:** Solid `#0A0A0A` background.
2.  **Mid Layer (Cards):** `rgba(23, 23, 23, 0.7)` with a `backdrop-filter: blur(24px)`.
3.  **Top Layer (Popovers/Tooltips):** `rgba(38, 38, 38, 0.8)` with a `backdrop-filter: blur(40px)` and a subtle `0 8px 32px rgba(0,0,0,0.4)` shadow.

All glass elements must feature a **1px stroke** (`rgba(255, 255, 255, 0.1)`) on their top and left edges to simulate a light source catching the edge of the glass.

## Shapes

The shape language is sophisticated and modern, utilizing **2xl rounded corners** (1rem / 16px) for all primary container cards. Smaller elements like buttons and input fields follow the `rounded-lg` (0.5rem / 8px) standard. 

Interactive elements should feature a transition that increases the "inner glow" or border opacity when hovered, reinforcing the physical metaphor of the glass surface.

## Components

### Buttons
- **Primary:** Solid Emerald Green with a subtle outer glow (`0 0 15px rgba(16, 185, 129, 0.3)`). Text is high-contrast black or white depending on accessibility.
- **Glass/Ghost:** Transparent background with a 1px white border at 20% opacity. Hover state increases border opacity to 50%.

### Candidate Cards
Cards are the primary glass containers. They should include a header area for the candidate's name and a high-visibility "Match Score" badge using the Primary Emerald color.

### Scoring Chips
Small, high-saturation pills. Use Emerald for "Strong Fit," Amber for "Review Needed," and Rose for "Skill Gap." In dark mode, these chips should have a slight "neon" feel with a low-spread drop shadow in their own color.

### Input Fields
Darker than the card background (`rgba(0,0,0,0.3)`) with a subtle 1px bottom border. On focus, the border glows with the Primary Emerald color.

### Progress Bars / Match Gauges
Thin tracks with vibrant fills. The "Match Score" gauge should use a gradient from Secondary Rose (0%) to Primary Emerald (100%) to visually represent the candidate's journey toward a perfect fit.