# VS Code Extension Theming: Blue Theme Research

## 1. VS Code CSS Variables and Custom Webview Themes

### How `--vscode-*` variables work in webviews

- Every webview has access to **400+ theme-specific CSS variables** automatically injected by VS Code.
- Variables follow the naming pattern: `--vscode-{component}-{property}`, where dots become hyphens. Example: `editor.foreground` -> `var(--vscode-editor-foreground)`.
- The body element gets a `data-vscode-theme-id` attribute and one of three classes: `vscode-light`, `vscode-dark`, or `vscode-high-contrast`.
- Font variables are also available: `--vscode-editor-font-family`, `--vscode-editor-font-weight`, `--vscode-font-size`.

### How the current codebase uses them

The extension already uses VS Code variables correctly for base colors:
- `var(--vscode-foreground)` for text
- `var(--vscode-editor-background)` for body background
- `var(--vscode-descriptionForeground)` for muted text
- `var(--vscode-editor-font-family)` for monospace
- `var(--vscode-editorWidget-background)` for toasts
- `var(--vscode-widget-border)` for dividers
- `var(--vscode-textCodeBlock-background)` for code blocks

**Recommendation:** Keep all `var(--vscode-*)` references unchanged. Only replace the custom `--vd-*` brand tokens.

### Layering custom brand colors on top of VS Code variables

The current approach is correct: define custom `--vd-*` CSS custom properties in `:root` for brand colors, while using `var(--vscode-*)` for base chrome. This ensures the extension respects the user's theme while maintaining brand identity.

---

## 2. How Premium Extensions Handle Branded Colors

### Patterns from Linear, Raycast, Vercel, and similar tools

Premium extensions and apps that embed branded colors in dark UIs follow these patterns:

1. **Single accent color with opacity scale** -- Use one brand blue at multiple opacities (0.08, 0.15, 0.25, 0.5, 1.0) for surfaces, borders, glows, and text. This creates visual hierarchy from a single hue.

2. **Gradient as a "signature"** -- The gradient is only used for hero elements (primary buttons, progress rings, TL;DR text gradient). Overusing gradients cheapens the look. Linear uses its purple gradient sparingly.

3. **Surface layers via white-alpha** -- The current approach (`rgba(255,255,255, 0.03/0.05/0.07)`) is industry standard. It works against any dark background. Do NOT change these.

4. **Semantic colors stay semantic** -- Success (green), warning (yellow/amber), error (red/coral) should never compete with the brand color. They exist purely for meaning.

5. **Accent glow on interactive elements** -- Premium extensions use `box-shadow` with low-opacity brand color (0.2-0.35) for hover states, not colored borders.

---

## 3. Blue Tones with Good Contrast Ratios (WCAG AA)

### WCAG requirements
- **Normal text (< 18pt):** 4.5:1 contrast ratio minimum
- **Large text (>= 18pt or 14pt bold):** 3:1 minimum
- **UI components (borders, icons):** 3:1 minimum

### Contrast testing against typical VS Code dark backgrounds

VS Code dark theme backgrounds range from `#1e1e1e` (default dark) to `#1a1a2e` (custom dark blues). Testing against `#1e1e1e`:

| Color | Hex | Contrast vs #1e1e1e | WCAG AA (text) | WCAG AA (large/UI) |
|-------|-----|---------------------|----------------|---------------------|
| Blue-400 (Tailwind) | `#60A5FA` | ~6.3:1 | PASS | PASS |
| Blue-500 (Tailwind) | `#3B82F6` | ~4.6:1 | PASS | PASS |
| Sky-400 (Tailwind) | `#38BDF8` | ~7.4:1 | PASS | PASS |
| Cyan-400 (Tailwind) | `#22D3EE` | ~9.1:1 | PASS | PASS |
| Blue-300 (Tailwind) | `#93C5FD` | ~8.7:1 | PASS | PASS |
| Indigo-400 (Tailwind) | `#818CF8` | ~5.2:1 | PASS | PASS |
| Blue-600 (Tailwind) | `#2563EB` | ~3.4:1 | FAIL | PASS |

### Recommended primary accent

**`#60A5FA` (Tailwind blue-400)** is the sweet spot:
- 6.3:1 contrast against dark backgrounds -- comfortably passes WCAG AA for all text sizes
- Bright enough to read as "blue" without being electric/garish
- Distinct from VS Code's own blue (`#007ACC` / `#0078D4`) which is darker/more saturated
- Works beautifully at low opacities for surfaces (e.g., `rgba(96, 165, 250, 0.15)`)

**Runner-up: `#38BDF8` (Tailwind sky-400)** -- slightly more cyan, very high contrast, but may feel less "premium" and more "utility."

---

## 4. Gradient Techniques for Premium VS Code Webviews

### Current gradient
```css
--vd-gradient: linear-gradient(135deg, #A78BFA, #FB7185); /* violet to coral */
```

### Recommended blue gradient options

**Option A: Blue to Cyan (ocean-inspired)**
```css
--vd-gradient: linear-gradient(135deg, #60A5FA, #22D3EE);
```
- Goes from brand blue to cyan. Feels fresh, modern, distinctive.
- High contrast at both ends. Excellent for text gradient effect.
- Similar to Vercel/Next.js gradient direction.

**Option B: Blue to Indigo (deeper, more premium)**
```css
--vd-gradient: linear-gradient(135deg, #60A5FA, #A78BFA);
```
- Blue to light purple. Feels richer, more premium.
- Risk: the purple end overlaps with VS Code's own purple in some themes.

**Option C: Blue to Teal (nature-inspired, calming)**
```css
--vd-gradient: linear-gradient(135deg, #60A5FA, #2DD4BF);
```
- Blue to teal/emerald. Fresh, educational feel, calming.
- Risk: the teal end may be confused with the success color (#34D399).

**Recommendation: Option A (Blue to Cyan)** because:
1. Both ends are in the blue family, maintaining color coherence
2. Neither end conflicts with semantic colors (success=green, error=red, warning=amber)
3. High contrast at both ends of the gradient
4. Cyan gives it a distinctive, modern identity vs. generic blue extensions
5. The gradient has enough variation to be visually interesting without clashing

### Subtle gradient variant
```css
--vd-gradient-subtle: linear-gradient(135deg, rgba(96,165,250,0.12), rgba(34,211,238,0.12));
```

---

## 5. Making the Blue Theme Distinctive in VS Code

### The problem
VS Code's own UI is blue. The default accent is `#007ACC`. Many extensions default to blue. A generic blue will blend into the chrome and lose brand identity.

### How to stand out

1. **Use a lighter, more saturated blue than VS Code's default.** VS Code uses `#007ACC` (HSL 200, 100%, 40%) -- a medium-dark blue. Our `#60A5FA` (HSL 217, 94%, 68%) is lighter and slightly warmer, creating visual distinction.

2. **The gradient is the brand signature.** Even if the base accent is "just blue," the blue-to-cyan gradient (`#60A5FA` -> `#22D3EE`) is distinctive. No built-in VS Code UI element uses this gradient.

3. **Distinctive surface tinting.** When hovering cards, use `rgba(96, 165, 250, 0.08)` tint instead of just lightening. This creates a subtle "glow" effect that differs from VS Code's own focus states.

4. **Animation as brand.** The existing spring-based animations (ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)) and typewriter effect are already unique. The loader ring with brand gradient, confetti in brand colors -- these differentiate more than color alone.

5. **Keep the custom font.** Plus Jakarta Sans is a strong differentiator. VS Code uses system fonts; webview content with a custom typeface immediately signals "this is a branded experience."

---

## 6. Semantic Color Conflict Resolution

### The logic color problem

The current `--vd-logic: #818CF8` (indigo) is too close to blue. If the primary accent becomes `#60A5FA`, users could confuse "logic error" indicators with "brand accent."

### Recommended semantic color updates

| Semantic | Current | Recommended | Rationale |
|----------|---------|-------------|-----------|
| Syntax | `#FBBF24` (amber) | **Keep** `#FBBF24` | No conflict with blue |
| Logic | `#818CF8` (indigo) | **Change to** `#C084FC` (purple-400) | Distinct from blue, still in the "thinking/mind" color space |
| Runtime | `#FB7185` (coral/rose) | **Keep** `#FB7185` | No conflict with blue |
| Success | `#34D399` (emerald) | **Keep** `#34D399` | No conflict |

Why `#C084FC` for logic?
- Contrast against `#1e1e1e`: ~5.9:1 (passes WCAG AA)
- Purple conveys "reasoning/logic" conceptually
- Clearly distinct from `#60A5FA` (blue) -- different hue entirely
- Still distinct from the old `#A78BFA` accent (lighter, more saturated)

---

## 7. Complete Recommended Token Map

```css
:root {
    /* Brand -- Blue-to-cyan gradient signature */
    --vd-accent: #60A5FA;
    --vd-accent-dim: rgba(96, 165, 250, 0.15);
    --vd-accent-glow: rgba(96, 165, 250, 0.25);
    --vd-gradient: linear-gradient(135deg, #60A5FA, #22D3EE);
    --vd-gradient-subtle: linear-gradient(135deg, rgba(96,165,250,0.12), rgba(34,211,238,0.12));

    /* Semantic -- Error categories */
    --vd-syntax: #FBBF24;           /* amber -- unchanged */
    --vd-syntax-dim: rgba(251, 191, 36, 0.12);
    --vd-logic: #C084FC;            /* purple-400 -- changed from indigo */
    --vd-logic-dim: rgba(192, 132, 252, 0.12);
    --vd-runtime: #FB7185;          /* rose -- unchanged */
    --vd-runtime-dim: rgba(251, 113, 133, 0.12);
    --vd-success: #34D399;          /* emerald -- unchanged */
    --vd-success-dim: rgba(52, 211, 153, 0.10);

    /* Surface layers -- unchanged, these work with any accent */
    --vd-surface: rgba(255, 255, 255, 0.03);
    --vd-surface-raised: rgba(255, 255, 255, 0.05);
    --vd-surface-overlay: rgba(255, 255, 255, 0.07);
    --vd-border-subtle: rgba(255, 255, 255, 0.06);
    --vd-border: rgba(255, 255, 255, 0.08);
}
```

---

## 8. Chart.js and Heatmap Color Updates

### Chart.js colors to update
- Trend line: `colTotal` changes from `#A78BFA` to `#60A5FA`
- Trend fill: `rgba(167, 139, 250, 0.08)` to `rgba(96, 165, 250, 0.08)`
- Logic bar chart: update background/border to use new `--vd-logic` purple
- Tooltip border: `rgba(167, 139, 250, 0.2)` to `rgba(96, 165, 250, 0.2)`

### Heatmap cells to update
All `rgba(167, 139, 250, ...)` references in heatmap cells change to `rgba(96, 165, 250, ...)`:
- Level 1: `rgba(96, 165, 250, 0.18)`
- Level 2: `rgba(96, 165, 250, 0.35)`
- Level 3: `rgba(96, 165, 250, 0.55)`
- Level 4: `rgba(96, 165, 250, 0.8)`

### Confetti colors
Update from: `['#A78BFA', '#FB7185', '#FBBF24', '#34D399', '#818CF8', '#C4B5FD']`
To: `['#60A5FA', '#FB7185', '#FBBF24', '#34D399', '#22D3EE', '#93C5FD']`

---

## 9. Prism Token Overrides

Current:
```css
.token.keyword { color: #c084fc; }  /* purple */
.token.string { color: #FB7185; }   /* rose */
```

Since `#C084FC` is now the logic error color, change keyword to brand blue:
```css
.token.keyword { color: #60A5FA; }  /* brand blue */
.token.string { color: #FB7185; }   /* rose -- keep */
```

---

## 10. Loader Ring Colors

Current:
```css
.vd-loader-ring { border-top-color: #A78BFA; border-right-color: #A78BFA; }
.vd-loader-ring--outer { border-bottom-color: #FB7185; border-left-color: #FB7185; }
.vd-loader-icon { filter: drop-shadow(0 4px 14px rgba(167, 139, 250, 0.3)); }
```

Updated:
```css
.vd-loader-ring { border-top-color: #60A5FA; border-right-color: #60A5FA; }
.vd-loader-ring--outer { border-bottom-color: #22D3EE; border-left-color: #22D3EE; }
.vd-loader-icon { filter: drop-shadow(0 4px 14px rgba(96, 165, 250, 0.3)); }
```

---

## 11. Summary of All Color Changes

| Token/Location | Old Value | New Value |
|---|---|---|
| `--vd-accent` | `#A78BFA` | `#60A5FA` |
| `--vd-accent-dim` | `rgba(167,139,250,0.15)` | `rgba(96,165,250,0.15)` |
| `--vd-accent-glow` | `rgba(167,139,250,0.25)` | `rgba(96,165,250,0.25)` |
| `--vd-gradient` | `135deg, #A78BFA, #FB7185` | `135deg, #60A5FA, #22D3EE` |
| `--vd-gradient-subtle` | `rgba(167,139,250,0.12), rgba(251,113,133,0.12)` | `rgba(96,165,250,0.12), rgba(34,211,238,0.12)` |
| `--vd-logic` | `#818CF8` | `#C084FC` |
| `--vd-logic-dim` | `rgba(129,140,248,0.12)` | `rgba(192,132,252,0.12)` |
| Hover `a:hover` color | `#C4B5FD` | `#93C5FD` (blue-300) |
| All hardcoded `rgba(167,139,250,...)` | violet-based | `rgba(96,165,250,...)` |
| All hardcoded `rgba(129,140,248,...)` | indigo-based | `rgba(192,132,252,...)` |
| Loader ring outer | `#FB7185` | `#22D3EE` |
| `.token.keyword` | `#c084fc` | `#60A5FA` |
| SVG gradient stops | `#A78BFA` / `#FB7185` | `#60A5FA` / `#22D3EE` |
| Confetti palette | violet-heavy | blue-cyan-heavy |
| Chart.js tooltip border | `rgba(167,139,250,0.2)` | `rgba(96,165,250,0.2)` |
| Box-shadow glows | `rgba(167,139,250,...)` | `rgba(96,165,250,...)` |

### What stays the same
- All `--vscode-*` variable references
- `--vd-syntax` (`#FBBF24` amber)
- `--vd-runtime` (`#FB7185` rose)
- `--vd-success` (`#34D399` emerald)
- All surface/border tokens (white-alpha based)
- Plus Jakarta Sans font
- Spacing scale, radius scale, motion easings
- All layout/responsive CSS
