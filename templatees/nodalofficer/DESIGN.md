---
name: Civic Trust
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#465e8e'
  primary: '#00173b'
  on-primary: '#ffffff'
  primary-container: '#0f2c59'
  on-primary-container: '#7c94c8'
  inverse-primary: '#aec7fd'
  secondary: '#a83900'
  on-secondary: '#ffffff'
  secondary-container: '#fc6018'
  on-secondary-container: '#531800'
  tertiary: '#001e03'
  on-tertiary: '#ffffff'
  tertiary-container: '#003608'
  on-tertiary-container: '#57a655'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec7fd'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#2d4674'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#802a00'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Noto Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies sovereign reliability, civic empowerment, and institutional clarity for Indian public digital infrastructure. The target audience encompasses the full demographic spectrum of Indian citizens, civic innovators, researchers, and public administrators. The visual environment must inspire immediate confidence, national pride, and democratic accessibility.

The aesthetic blends **Modern Institutional** with **Civic Utility**:
- Uncluttered, structured layouts reflecting institutional dignity and stability.
- Purposeful national accents—Ashoka Navy, Tiranga-inspired Saffron and India Green—deployed with strict semantic discipline rather than ornamental excess.
- High-contrast, clean visual hierarchy catering to extreme device diversity, variable network conditions, and multilingual citizen interactions (bilingual English/Hindi typography rendering parity).
- Direct, functional UI with prominent verification markers, official gazette-grade typography, and clear demarcations of sovereign authentication.

## Colors

The palette establishes an authoritative, sovereign palette balanced by strict WCAG 2.1 AAA/AA conformance standards across bright outdoor mobile environments.

- **Primary (`#0F2C59`) — Ashoka Navy**: The anchor of sovereign authority, institutional stability, and structural chrome. Used for top application bars, headers, primary buttons, critical navigation nodes, and authoritative badges.
- **Secondary (`#E65100`) — Deep Saffron / Indian Orange**: High-visibility purposeful accent. Reserved for primary calls-to-action, active interactive milestones, application submission CTAs, and vital alerts. Never used for decorative backgrounds.
- **Tertiary (`#2E7D32`) — India Green**: Verification, statutory approval, success states, security validation seals, and active public sector initiatives.
- **Neutral Surface (`#F8F9FA`) — Off-White / Parchment Neutral**: Reduces harsh glare on budget mobile displays while maintaining a crisp, paper-like civic documentation feel.
- **Structural Borders (`#CBD5E1` & `#E2E8F0`)**: Crisp delineation between cards, tables, and form sections to reinforce structure without visual noise.
- **Tiranga Accent Rule**: The tri-color motif is strictly constrained to micro-indicators (such as top border rules on primary headers or official verified badges) via a 3px gradient/stripe (`#E65100` / `#FFFFFF` / `#2E7D32`), never dominating canvas backdrops.

## Typography

Noto Sans serves as the universal anchor for both Latin and Devanagari scripts, ensuring seamless bilingual rendering without vertical metrics misalignment or line height collisions. Inter is integrated specifically for administrative meta-labels, identification tags, status pills, and tabular data.

### Bilingual Handling Rules
- Every heading and primary navigation element must maintain equivalent vertical rhythm when paired with or switched to Hindi (Devanagari).
- When bilingual microcopy is rendered simultaneously (e.g., English title stacked above Hindi subtitle), the primary script uses `title-md` or `body-md`, while the accompanying vernacular translation renders in `body-sm` with a secondary muted text color (`#475569`).
- Avoid font weights below `400` across all display scales to maintain extreme legibility on low-cost TN/IPS screens and in bright ambient daylight.

## Layout & Spacing

The layout is built upon an 8pt rhythmic grid within a 12-column responsive layout, optimized for high data density, official documentation clarity, and accessibility across diverse screen sizes.

### Breakpoints & Grids
- **Mobile (`< 640px`)**: 4 columns, `margin-mobile: 1rem`, `gutter-mobile: 1rem`. All actionable controls expand to full container width with a minimum 48px vertical touch target.
- **Tablet (`640px – 1024px`)**: 8 columns, `margin: 1.5rem`, `gutter: 1.25rem`. Administrative sidebars collapse into persistent drawer patterns.
- **Desktop (`> 1024px`)**: 12 columns, `margin: 2rem`, `gutter: 1.5rem`. Maximum content container constrained to `1280px` to maintain strict optical reading line-lengths (60–75 characters per line).

### Vertical Rhythm
Section blocks consistently apply `space-xl` separation. Interior card groups and form input fields adhere strictly to `space-md` stack intervals. Related label-to-input pairings utilize `space-xs`.

## Elevation & Depth

This design system avoids theatrical shadows and heavy skeuomorphic elevation in favor of **Tonal Layering with Low-Contrast Structural Outlines**. Institutional credibility requires stability, fast page-loads on constrained 3G/4G networks, and zero perceptual clutter.

### Hierarchy of Surfaces
- **Base Canvas**: Grounded in `#F8F9FA`.
- **Level 1 (Cards, Data Panels, Form Modules)**: Solid pure white `#FFFFFF` surface bordered by a crisp `1px solid #E2E8F0` rule. No box-shadow in default resting states.
- **Level 2 (Hovered Cards, Interactive Elements)**: White `#FFFFFF` with a subtle elevation shift: `0 4px 6px -1px rgba(15, 44, 89, 0.08), 0 2px 4px -2px rgba(15, 44, 89, 0.04)`, slightly shifting the border tone to `#CBD5E1`.
- **Level 3 (Modal Dialogs, Verification Overlays, Sticky Headers)**: Elevated using an institutional Ashoka Navy tinted ambient shadow: `0 10px 25px -5px rgba(15, 44, 89, 0.15), 0 8px 10px -6px rgba(15, 44, 89, 0.1)`. Modals must feature a solid top border accent strip (3px `#0F2C59` or secondary accent).

## Shapes

The design system adopts a **Soft (`1`)** shape language:
- Standard interactive elements (buttons, inputs, alerts, chips) employ a subtle corner radius of `0.25rem` (4px).
- Larger containers, cards, and modal dialogs use `rounded-lg` (`0.5rem` / 8px).
- Badges and status pills use full circular radiuses (`9999px`) to visually differentiate administrative status from structural data cards.

This tight, disciplined corner profile evokes precision, governmental record integrity, and structured documentation, avoiding the consumer-grade playfulness of pill-shaped buttons.

## Components

### Buttons & Interactive Controls
- **Touch Target Principle**: Every interactive target must strictly measure at least 48px in height/width on mobile interfaces.
- **Primary Action (Call-to-Action)**: Saffron background (`#E65100`), white bold text (`#FFFFFF`), `0.25rem` corner radius, 12px 24px padding. Hover state shifts to `#BF4300`.
- **Secondary / Authority Action**: Ashoka Navy background (`#0F2C59`), white text (`#FFFFFF`). Hover state: `#0A1E3D`.
- **Tertiary / Administrative Outline**: Transparent background, `1.5px solid #0F2C59`, text `#0F2C59`. Active focus reveals a 2px offset ring in `#E65100` for accessibility.

### Civic Badges & Verification Seals
- **Verified Public Seal**: Pill-shaped container (`9999px`) with `#E8F5E9` background, `#2E7D32` text, and a crisp checkmark icon. Used to validate Aadhaar/DigiLocker integration, approved proposals, and nodal ministry endorsements.
- **Status Indicators**: High-contrast, all-caps or title-cased Inter typography (`label-sm`). Draft: `#64748B` on `#F1F5F9`; Pending: `#B45309` on `#FEF3C7`; Verified: `#15803D` on `#DCFCE7`.

### Input Fields & Form Controls
- **Field Anatomy**: Minimum height 48px. Background `#FFFFFF`, border `1.5px solid #CBD5E1`, text `#0F172A`.
- **Focus State**: Unambiguous high-contrast border in `#0F2C59` accompanied by a `2px solid rgba(230, 81, 0, 0.2)` outer halo.
- **Labels & Microcopy**: Mandatory persistent label in `label-lg` above the input. Bilingual label pattern format: `Innovation Category / नवाचार श्रेणी`.
- **Error Feedback**: Red `#B91C1C` border with an explicit warning icon and descriptive helper text below the field.

### Checkboxes & Radio Buttons
- Sized at `20px x 20px` with a hit target padded to `48px x 48px`.
- Active fill: Ashoka Navy (`#0F2C59`) with high-contrast white check/dot. Unchecked: `2px solid #64748B`.

### Content Cards & Innovation Dossiers
- Background `#FFFFFF`, border `1px solid #E2E8F0`, interior padding `space-lg`.
- Top edge features an optional 3px authoritative rule (`#0F2C59` for standard civic content, `#E65100` for priority grants/open challenges).
- Metadata layout: Bottom aligned bar separating submission date, ministry code, and applicant type using `label-md` in `#64748B`.

### Header & National Identity Ribbon
- Topmost strip: 32px height sovereign strip featuring the National Emblem placeholder, accessibility toggles (Text Size A- / A / A+, High Contrast Mode), and Language selector (English / हिन्दी).
- Primary Navigation: Solid Ashoka Navy `#0F2C59` surface, crisp white typography, with an active item indicator denoted by an `#E65100` bottom highlight bar (3px).