# MakerPortal.ai Brand Guidelines v0.4
Independent AI & iOS Software Studio — Brand System

---

## 1. Visual Principles
The makerportal.ai brand represents precision, speed, privacy, and craftsmanship. It bridges the gap between hardware legacy (makersportal.com) and premium modern AI software (on-device compute).

---

## 2. Core Identity Elements

### Standalone Icon: The Signal Portal Gateway
The icon is a refined **Signal Portal** (solid LED dome + threshold line + 3 rays) representing the studio's maker heritage and software compute.
- **Proportions**: Built on a strict 32x32 pixel grid.
- **Color**: CTA Crimson (`#CE445D`) for the dome and rays, and Muted Text White (`#E2E8F0`) for the threshold.
- **Glow**: Subtle background radial blur (22px size, 10px blur, opacity 18-22%) in `#CE445D`.

### Primary Wordmark
A custom-crafted, stroke-based lowercase logotype:
- Uniform 2.6px stroke weight (on a 32px grid) for a clean, cohesive geometric line-weight.
- Minimalist geometric lowercase letterforms.
- Crimson dot/period (`#CE445D`) separating `makerportal` and `ai`.

---

## 3. Clearspace and Layout Rules

```
       ┌─────────────────────────────────────┐
       │               0.5H                  │
       │       ┌─────────────────┐           │
       │  0.5H │   MAKERPORTAL   │ 0.5H      │
       │       └─────────────────┘           │
       │               0.5H                  │
       └─────────────────────────────────────┘
```

- **Clearspace**: Clearspace is calculated using `H` (the height of the logo). A minimum boundary of `0.5H` must be maintained on all sides of the wordmark and standalone icon. No other typography, borders, or graphics should intersect this area.
- **Minimum Sizes**:
  - **Standalone Icon**: 16px width (Favicon). Below 16px, the rays and threshold should be hidden or scaled with caution.
  - **Wordmark**: 32px height (minimum screen size for outline legibility).
  - **Lockup**: 32px height (nav default).

---

## 4. Typography
- **Headings**: Plus Jakarta Sans (bold, geometric, clean tracking).
- **Body & Code**: SFMono-Regular, Inter (highly readable sans and monospace system).
- **Wordmark Suffix**: SFMono-Regular (bold, uppercase).

---

## 5. Color Tokens
| Token | HEX | Usage |
| :--- | :--- | :--- |
| **Canvas** | `#0F141C` | Page backgrounds, dark theme base |
| **Card** | `#1A232E` | Container boxes, high-contrast panels |
| **Text** | `#E2E8F0` | Primary headings and body copy |
| **Muted** | `#5C6E7A` | Metadata, subheadings, gridlines |
| **CTA Crimson** | `#CE445D` | Portal arch, active states, key accents |
| **Anchor Blue** | `#326C88` | Studio link accents, Biquadia sub-elements |

---

## 6. Monogram & App Icons
The solid-dome Signal Portal functions as a container for all app icons.
- **Base Grid**: 64x64 container, `#0F141C` background, with 10px blurred accent glows mapping the app's accent color.
- **Glyph Positioning**: Individual white application glyphs must be centered and drawn on top of the solid dome for optimal legibility and contrast.
- **Accent Dome Colors**:
  - **Biquadia** (Audio): Crimson `#CE445D`
  - **Notiary** (Markdown): Purple `#8B5CF6`
  - **Thumb-Dash** (Dashboard): Amber `#F59E0B`
  - **PopCloset** (Wardrobe): Blue `#326C88`
