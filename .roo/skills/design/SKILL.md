---
name: design
description: Para el diseño, este cuenta con las variables y directrices de diseño
---

# Design

## Instructions

---
name: Luminous Petal
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#554248'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#887178'
  outline-variant: '#dbc0c7'
  surface-tint: '#a33467'
  primary: '#a33467'
  on-primary: '#ffffff'
  primary-container: '#ff7db2'
  on-primary-container: '#780d45'
  inverse-primary: '#ffb0cc'
  secondary: '#af1e6f'
  on-secondary: '#ffffff'
  secondary-container: '#fe61ae'
  on-secondary-container: '#68003e'
  tertiary: '#8300f3'
  on-tertiary: '#ffffff'
  tertiary-container: '#c192ff'
  on-tertiary-container: '#5600a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e4'
  primary-fixed-dim: '#ffb0cc'
  on-primary-fixed: '#3e0020'
  on-primary-fixed-variant: '#851a4f'
  secondary-fixed: '#ffd9e5'
  secondary-fixed-dim: '#ffb0cf'
  on-secondary-fixed: '#3d0023'
  on-secondary-fixed-variant: '#8c0056'
  tertiary-fixed: '#eedcff'
  tertiary-fixed-dim: '#d9b9ff'
  on-tertiary-fixed: '#290054'
  on-tertiary-fixed-variant: '#6300bb'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

This design system embodies a "Soft-UI Glassmorphism" aesthetic, blending the tactile approachability of neomorphism with the ethereal transparency of modern glass effects. The brand personality is professional yet artistic, targeting a high-end audience that values both precision and aesthetic beauty. 

The visual narrative is "Airy & Luminous." It utilizes deep backdrop blurs, organic mesh gradients, and delicate borders to create a sense of depth without the heaviness of traditional skueomorphism. The interface should feel like light passing through frosted glass on a spring morning—sophisticated, clean, and vibrantly modern.

## Colors

The palette is anchored by **Petal-400 (#ff7db2)** as the primary brand expression, with **Blush-500 (#e9509d)** providing depth for interactive states and call-to-actions. We integrate a secondary tier of **Lavender (#D1B8FF)** and **Mauve (#8A05FF)** derived from the source style guide to add an artistic, high-contrast flair to the soft pink foundation.

The background is a dynamic mesh of white and soft pink. Use radial gradients (e.g., `radial-gradient(at 0% 0%, #ffffff 0%, transparent 50%)`) to create a shimmering, non-static surface that interacts with the glass components layered above it.

## Typography

This system employs a classic-modern pairing. **EB Garamond** (as a highly accessible alternative to Cormorant Garamond with a similar elegant profile) is used for all headlines and display text to convey a sense of luxury and editorial intent. 

For functional readability, **Plus Jakarta Sans** provides a clean, geometric, and friendly counterpoint. Body text should maintain generous line heights (1.6x) to preserve the "airy" vibe. Use the Label styles for navigation and small metadata, often paired with increased letter spacing for a refined, modern touch.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** grid. Content is contained within a 12-column grid with a maximum width of 1280px, centered on the viewport. On desktop, generous 64px margins ensure the design feels high-end and uncrowded.

Spacing is based on a 4px baseline unit. Component padding should favor larger increments (e.g., 24px, 32px, 48px) to reinforce the artistic, spacious narrative. Elements should often "float" above the mesh background, using whitespace as a structural tool rather than rigid dividers.

## Elevation & Depth

Depth is achieved through the stacking of translucent materials rather than heavy black shadows. 

1.  **Base Layer:** The mesh-pink radial background.
2.  **Surface Layer (Cards):** `bg-white/70` with a `backdrop-blur-md` (12px-16px blur). This creates the "frosted glass" effect.
3.  **Borders:** Each card must have a 1px solid `border-white/40` or a subtle top-to-bottom gradient border (white/60 to white/10) to define the edges against the light background.
4.  **Shadows:** Use extremely soft, tinted shadows: `box-shadow: 0 10px 30px -10px rgba(233, 80, 157, 0.1)`. The shadow should pick up the primary brand color to feel "integrated" into the environment.

## Shapes

The shape language is consistently rounded to maintain the "Soft-UI" touch. Standard components use a **0.5rem (8px)** radius, while larger glass cards and containers utilize **1rem (16px) or 1.5rem (24px)**. 

Avoid sharp 90-degree angles entirely. Buttons and input fields should feel pill-like or significantly softened to invite interaction and complement the organic nature of the mesh background and serif typography.

## Components

### Buttons
Primary buttons use a "Soft-UI" gradient of Petal-400 to Blush-500 with white text and a subtle inner-glow. Secondary buttons are "Glass" style: semi-transparent white with a pink border and pink text.

### Cards
The signature component. Use `bg-white/70` with `backdrop-blur-md`. Borders are essential—thin, white, and semi-transparent. Content inside cards should have ample padding (minimum 32px).

### Inputs & Form Fields
Fields should be semi-transparent with a 1px white border. Upon focus, the border transitions to Petal-400 with a subtle outer glow. Use Plus Jakarta Sans for all input text.

### Chips & Tags
Small, pill-shaped elements using the Lavender and Mauve secondary colors at 10-20% opacity with saturated text colors. This adds "artistic" pops of color to the predominantly pink and white interface.

### Navigation
The navigation bar should be a "floating" glass element anchored to the top of the viewport with a `backdrop-blur-lg` effect, allowing the background mesh to shimmer through as the user scrolls.