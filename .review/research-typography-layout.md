# Typography & Layout Research for FlowFixer UI Overhaul

## Executive Summary

The current design uses DM Sans with flat 16px spacing, 4px radii, and standard VS Code card borders. It is functional but generic. This document provides exact specifications for a premium typography system, spacing scale, card treatments, and layout patterns that will transform FlowFixer from "adequate sidebar" to "polished developer tool."

---

## 1. Font Strategy

### Recommendation: Switch from DM Sans to Inter

**Why switch:**
- DM Sans has a distinctly geometric, rounded personality -- it reads as "startup landing page" rather than "precision developer tool."
- Inter was purpose-built for screen UIs by Rasmus Andersson. It has a large x-height (73.3% of cap height), open apertures, and tabular figures that make it objectively superior for small-size rendering in constrained panels.
- Inter is a variable font (weight 100-900), which means a single font file covers all weights with continuous interpolation -- no layout jank from weight changes.
- Inter is the de facto standard for premium developer tools (Linear, Vercel, Raycast, Notion).

**Alternative considered:**
- **Plus Jakarta Sans**: Strong geometric character, but slightly lower x-height (69%) makes it harder to read at 11-12px. Better for marketing sites.
- **Satoshi**: Beautiful modernist aesthetic, but x-height of only 66% is too low for VS Code sidebar text. Would require bumping base size up, losing density.
- **General Sans / Cabinet Grotesk**: Stylistically distinctive but lack the variable font optimization and screen hinting that Inter provides.
- **Geist Sans**: Excellent option (Vercel's own). Very close to Inter in readability. Slightly more condensed letterforms. Could be a viable alternative if the team wants a less "expected" choice. However, it is less widely available on Google Fonts CDN.

**Final pick: Inter variable (Google Fonts)**

### Font Loading Strategy

```css
/* Single variable font import -- covers weights 100-900 */
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
```

Note: The `opsz` (optical size) axis is key. At small sizes (14), Inter automatically adjusts letter spacing and stroke contrast for readability. At larger sizes (32), it tightens for a more refined headline look.

### Monospace Pairing: JetBrains Mono

**Why JetBrains Mono over Fira Code or IBM Plex Mono:**
- JetBrains Mono has a taller x-height (76%) than Fira Code (73%) or IBM Plex Mono (70%), which makes inline code snippets align better visually with Inter body text.
- Its letter spacing is optimized for reading code in narrow columns (exactly our sidebar constraint).
- Ligatures can be disabled for code clarity -- important in an educational tool where beginners need to see every character.

**However**, in a VS Code webview we should defer to the user's editor font for code blocks:

```css
code, .code-block, .prompt-block, .diff-view {
  font-family: var(--vscode-editor-font-family, 'JetBrains Mono', 'Fira Code', 'Consolas', monospace);
  font-feature-settings: 'liga' 0; /* Disable ligatures for clarity */
}
```

This respects user preferences while falling back to JetBrains Mono.

---

## 2. Type Scale

### Scale Choice: Minor Third (1.200 ratio)

**Why Minor Third, not Perfect Fourth (1.333)?**
- A sidebar panel at 300-400px width cannot afford the jump between sizes that Perfect Fourth produces. At a 13px base:
  - Perfect Fourth: 13 -> 17.3 -> 23.1 -> 30.8 (too large at h1)
  - Minor Third: 13 -> 15.6 -> 18.7 -> 22.5 (comfortable range)
- Minor Third creates clear hierarchy without any single heading overwhelming the panel.

### Exact Type Scale (base: 13px)

```css
:root {
  /* ── Type Scale (Minor Third 1.2) ── */
  --ff-text-xs:    0.694rem;   /* 9.0px  -- metadata, timestamps, heatmap labels */
  --ff-text-sm:    0.833rem;   /* 10.8px -- captions, badge text, secondary labels */
  --ff-text-base:  1rem;       /* 13px   -- body text (matches VS Code default) */
  --ff-text-md:    1.2rem;     /* 15.6px -- section headings, card titles */
  --ff-text-lg:    1.44rem;    /* 18.7px -- panel headings, primary headings */
  --ff-text-xl:    1.728rem;   /* 22.5px -- dashboard title, hero numbers */
  --ff-text-2xl:   2.074rem;   /* 27px   -- stat values, large display numbers */

  /* ── Font Weights ── */
  --ff-weight-normal:   400;
  --ff-weight-medium:   500;
  --ff-weight-semibold: 600;
  --ff-weight-bold:     700;

  /* ── Line Heights ── */
  --ff-leading-tight:   1.25;  /* headings */
  --ff-leading-snug:    1.4;   /* subheadings, compact text */
  --ff-leading-normal:  1.6;   /* body text */
  --ff-leading-relaxed: 1.75;  /* educational/explanatory text (current ff-body) */

  /* ── Letter Spacing ── */
  --ff-tracking-tight:  -0.02em;  /* large headings */
  --ff-tracking-normal:  0;       /* body text */
  --ff-tracking-wide:    0.04em;  /* uppercase labels, section titles */
  --ff-tracking-wider:   0.06em;  /* small caps, metadata */
}
```

### Applied Typography Classes

```css
body {
  font-family: 'Inter', var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  font-weight: var(--ff-weight-normal);
  line-height: var(--ff-leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'cv01' 1, 'cv02' 1; /* Inter alternates for cleaner a, g */
}

/* Panel title -- e.g., "Bug Dashboard" */
h1 {
  font-size: var(--ff-text-xl);
  font-weight: var(--ff-weight-bold);
  letter-spacing: var(--ff-tracking-tight);
  line-height: var(--ff-leading-tight);
  margin-bottom: 4px;
}

/* Section heading -- e.g., "What Happened", "How to Fix" */
h2, .ff-heading {
  font-size: var(--ff-text-md);
  font-weight: var(--ff-weight-semibold);
  letter-spacing: var(--ff-tracking-normal);
  line-height: var(--ff-leading-snug);
  margin-bottom: 8px;
}

/* Card title -- e.g., "Bug Categories", "Recent Bugs" */
h3 {
  font-size: var(--ff-text-base);
  font-weight: var(--ff-weight-semibold);
  letter-spacing: var(--ff-tracking-normal);
  line-height: var(--ff-leading-snug);
  margin-bottom: 8px;
}

/* Body text */
.ff-body {
  font-size: var(--ff-text-base);
  font-weight: var(--ff-weight-normal);
  line-height: var(--ff-leading-relaxed);
  max-width: 60ch; /* Optimal line length for readability */
}

/* Overline / Section label -- e.g., "SYNTAX ERROR", category labels */
.section-title, .ff-overline {
  font-size: var(--ff-text-xs);
  font-weight: var(--ff-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--ff-tracking-wide);
  line-height: var(--ff-leading-tight);
}

/* Stat values -- large display numbers in dashboard */
.stat-value {
  font-size: var(--ff-text-2xl);
  font-weight: var(--ff-weight-bold);
  letter-spacing: var(--ff-tracking-tight);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* Stat labels */
.stat-label {
  font-size: var(--ff-text-xs);
  font-weight: var(--ff-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--ff-tracking-wider);
  color: var(--vscode-descriptionForeground);
}

/* Caption / metadata text */
.text-caption {
  font-size: var(--ff-text-xs);
  font-weight: var(--ff-weight-normal);
  letter-spacing: var(--ff-tracking-wide);
  color: var(--vscode-descriptionForeground);
}

/* Small text (badge text, secondary info) */
.text-sm {
  font-size: var(--ff-text-sm);
  font-weight: var(--ff-weight-normal);
}

/* Inline code */
code {
  font-family: var(--vscode-editor-font-family, 'JetBrains Mono', 'Consolas', monospace);
  font-size: 0.9em; /* Slightly smaller than surrounding text */
  font-feature-settings: 'liga' 0;
  background-color: var(--vscode-textCodeBlock-background);
  padding: 1px 5px;
  border-radius: 3px;
}
```

---

## 3. Spacing System

### Base: 4px grid, with 8px as the primary rhythm unit

**Why 4px base, not 8px:**
- In a 300-400px sidebar, 8px minimum jumps are too coarse. We need 4px granularity for tight elements (badge padding, icon gaps) while keeping 8px+ for section-level spacing.
- This matches what Atlassian, GitHub, and Linear use for dense UIs.

### Spacing Scale (Design Tokens)

```css
:root {
  /* ── Spacing Scale (4px base) ── */
  --ff-space-0:    0px;
  --ff-space-1:    4px;     /* Icon-to-text gap, inline padding */
  --ff-space-2:    8px;     /* Tight element gap, button padding-y */
  --ff-space-3:    12px;    /* Standard element gap, card padding (compact) */
  --ff-space-4:    16px;    /* Card padding (normal), section gap */
  --ff-space-5:    20px;    /* Section padding, generous card padding */
  --ff-space-6:    24px;    /* Section margin, panel padding */
  --ff-space-8:    32px;    /* Large section breaks */
  --ff-space-10:   40px;    /* Panel top padding, major separations */
  --ff-space-12:   48px;    /* Empty state padding */
}
```

### Where Each Token Gets Used

| Token | Value | Use Case |
|-------|-------|----------|
| `--ff-space-1` | 4px | Icon gaps, badge internal padding (vertical), compact inline spacing |
| `--ff-space-2` | 8px | Button padding-y, gap between badge and text, quiz option gap, heatmap cell gap |
| `--ff-space-3` | 12px | Card padding (compact mode), button padding-x, checklist item padding, body padding on narrow screens |
| `--ff-space-4` | 16px | Card padding (standard), section bottom margin, dashboard grid gap, ff-section padding |
| `--ff-space-5` | 20px | Section bottom margin (major), body padding (standard), ff-panel padding |
| `--ff-space-6` | 24px | Dashboard card padding, generous section spacing, gap between major content blocks |
| `--ff-space-8` | 32px | Panel top padding, large gaps between distinct content areas |
| `--ff-space-10` | 40px | Empty state top padding, hero/splash areas |
| `--ff-space-12` | 48px | Empty state vertical padding, major panel spacing |

### Applied Spacing

```css
/* Body padding -- the outer container */
body {
  padding: var(--ff-space-5);   /* 20px */
}

/* Card padding -- standard content card */
.card {
  padding: var(--ff-space-4);            /* 16px */
  margin-bottom: var(--ff-space-4);      /* 16px */
}

/* Section padding -- ff-section with left border accent */
.ff-section {
  padding: var(--ff-space-3) var(--ff-space-4);  /* 12px 16px */
  padding-left: var(--ff-space-5);                /* 20px (room for border accent) */
  margin-bottom: var(--ff-space-5);               /* 20px */
}

/* Dashboard grid */
.dashboard-grid {
  gap: var(--ff-space-4);                /* 16px */
  margin-bottom: var(--ff-space-6);      /* 24px */
}

/* Checklist items */
.ff-check-item {
  padding: var(--ff-space-2) var(--ff-space-2);   /* 8px */
  gap: var(--ff-space-3);                          /* 12px */
}

/* Button padding */
.btn {
  padding: var(--ff-space-2) var(--ff-space-3);    /* 8px 12px */
}

/* Empty state */
.ff-empty {
  padding: var(--ff-space-12) var(--ff-space-5);   /* 48px 20px */
}

/* Heading bottom margin */
h1 { margin-bottom: var(--ff-space-1); }   /* 4px -- followed by subtitle/description */
h2 { margin-bottom: var(--ff-space-2); }   /* 8px */
h3 { margin-bottom: var(--ff-space-2); }   /* 8px */

/* Paragraph spacing */
p { margin-bottom: var(--ff-space-3); }     /* 12px */

/* Badge padding */
.badge {
  padding: 2px var(--ff-space-2);           /* 2px 8px */
}
```

---

## 4. Card & Section Layout

### Card Treatment: Subtle Background Tint + Micro-Border

**Move away from:** flat `1px solid border` on matching background (current)
**Move to:** slight background elevation with ultra-thin border

```css
:root {
  /* Card surface tokens */
  --ff-surface-primary: var(--vscode-editor-background);
  --ff-surface-raised: color-mix(in srgb, var(--vscode-editor-background) 95%, var(--vscode-foreground) 5%);
  --ff-surface-overlay: color-mix(in srgb, var(--vscode-editor-background) 90%, var(--vscode-foreground) 10%);
  --ff-border-subtle: color-mix(in srgb, var(--vscode-widget-border) 60%, transparent 40%);
  --ff-border-default: var(--vscode-widget-border);

  /* Elevation tokens */
  --ff-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ff-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ff-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
  --ff-shadow-glow: 0 0 0 1px var(--vscode-focusBorder), 0 2px 8px rgba(0, 0, 0, 0.15);

  /* Radius tokens */
  --ff-radius-sm: 4px;
  --ff-radius-md: 6px;
  --ff-radius-lg: 8px;
  --ff-radius-xl: 12px;
  --ff-radius-full: 9999px;
}

/* Standard card */
.card {
  background: var(--ff-surface-raised);
  border: 1px solid var(--ff-border-subtle);
  border-radius: var(--ff-radius-md);
  padding: var(--ff-space-4);
  margin-bottom: var(--ff-space-4);
  box-shadow: var(--ff-shadow-sm);
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.card:hover {
  border-color: var(--ff-border-default);
  box-shadow: var(--ff-shadow-md);
}

/* Elevated card (interactive, primary) */
.card--elevated {
  background: var(--ff-surface-raised);
  border: 1px solid var(--ff-border-default);
  border-radius: var(--ff-radius-lg);
  box-shadow: var(--ff-shadow-md);
}

.card--elevated:hover {
  box-shadow: var(--ff-shadow-lg);
}

/* Inset card (nested content, code blocks) */
.card--inset {
  background: var(--ff-surface-overlay);
  border: 1px solid var(--ff-border-subtle);
  border-radius: var(--ff-radius-sm);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}
```

### Section Dividers: Gradient Accent Line

Replace plain `border-bottom: 1px solid` with a gradient fade:

```css
/* Section divider -- replaces flat border-bottom */
.ff-section {
  border-bottom: none; /* Remove old flat border */
  position: relative;
}

.ff-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--ff-space-4);    /* 16px inset */
  right: var(--ff-space-4);
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--vscode-widget-border) 15%,
    var(--vscode-widget-border) 85%,
    transparent 100%
  );
  opacity: 0.6;
}

.ff-section:last-child::after {
  display: none;
}
```

### Left Border Accent: Thicker, Rounded

Current: `border-left: 3px solid`. Replace with a thicker, slightly rounded accent:

```css
.ff-section {
  border-left: 3px solid transparent;
  border-radius: 0 var(--ff-radius-sm) var(--ff-radius-sm) 0;
}

/* Accent colors for section types */
.ff-section--error    { border-left-color: var(--ff-runtime); }
.ff-section--fix      { border-left-color: var(--ff-success); }
.ff-section--summary  { border-left-color: var(--ff-logic); }
```

### Visual Grouping: Asymmetric Layout

Break the "everything stacked vertically and centered" pattern:

```css
/* Stat card -- left-aligned with accent strip */
.stat-card {
  text-align: left;
  padding: var(--ff-space-4);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  border-radius: 0 2px 2px 0;
  /* Color set per stat type via inline style or data attribute */
}

.stat-card .stat-value {
  text-align: left;
  margin-bottom: 2px;
}

.stat-card .stat-label {
  text-align: left;
}
```

---

## 5. Information Density & Progressive Disclosure

### Error Detail Layout

The current error panel shows everything at once. Improve information density without overwhelming:

**Structure: Primary > Secondary > Tertiary**

```
[ERROR CARD - always visible, prominent]
  Badge + Location + Error Message + TL;DR

[SECTIONS - visible, standard prominence]
  What Happened  (typewriter, visible by default)
  How to Fix     (numbered steps, visible by default)

[DISCLOSURE - hidden by default, on-demand]
  How to Prevent    (details/summary, collapsed)
  Best Practice     (details/summary, collapsed)
  Suggested Prompt  (details/summary, collapsed)

[QUIZ - visible but at bottom, clear separation]
  Test Yourself
```

### Collapsible Section Styling (Premium Feel)

```css
.ff-disclosure {
  border: none;
  background: none;
}

.ff-disclosure-trigger {
  display: flex;
  align-items: center;
  gap: var(--ff-space-2);
  font-size: var(--ff-text-md);
  font-weight: var(--ff-weight-semibold);
  color: var(--vscode-foreground);
  cursor: pointer;
  padding: var(--ff-space-2) 0;
  list-style: none;
  min-height: 36px;
  transition: color 0.1s ease;
}

.ff-disclosure-trigger:hover {
  color: var(--vscode-textLink-foreground);
}

/* Chevron indicator */
.ff-disclosure-trigger::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid var(--vscode-descriptionForeground);
  border-bottom: 1.5px solid var(--vscode-descriptionForeground);
  transform: rotate(-45deg);
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

details[open] > .ff-disclosure-trigger::before {
  transform: rotate(45deg);
}

.ff-disclosure-body {
  padding: var(--ff-space-3) 0 var(--ff-space-1) 0;
  animation: ffDisclosureOpen 0.15s ease-out;
}
```

### Dashboard Stat Cards (Data-Rich, Clean)

```css
/* Stats grid -- 2x2 on standard sidebar, 4x1 on wider panels */
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ff-space-3);  /* 12px */
}

@media (min-width: 480px) {
  .stats-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Individual stat card */
.stat-card {
  background: var(--ff-surface-raised);
  border: 1px solid var(--ff-border-subtle);
  border-radius: var(--ff-radius-md);
  padding: var(--ff-space-3);      /* 12px -- compact */
  text-align: left;
  position: relative;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card .stat-value {
  font-size: var(--ff-text-xl);     /* 22.5px */
  font-weight: var(--ff-weight-bold);
  line-height: 1;
  margin-bottom: 2px;
  font-variant-numeric: tabular-nums;
}

.stat-card .stat-label {
  font-size: var(--ff-text-xs);
  font-weight: var(--ff-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--ff-tracking-wider);
  color: var(--vscode-descriptionForeground);
  line-height: var(--ff-leading-tight);
}
```

---

## 6. Dashboard Layout

### Stats Grid: Left-Aligned 2x2 with Color Accents

```
+------------------+------------------+
| 18               | 4                |
| TOTAL BUGS       | SYNTAX           |
| [runtime accent] | [syntax accent]  |
+------------------+------------------+
| 5                | 9                |
| LOGIC            | RUNTIME          |
| [logic accent]   | [runtime accent] |
+------------------+------------------+
```

### Chart Card Improvements

```css
/* Chart wrapper card */
.chart-card {
  background: var(--ff-surface-raised);
  border: 1px solid var(--ff-border-subtle);
  border-radius: var(--ff-radius-md);
  padding: var(--ff-space-4);
  margin-bottom: var(--ff-space-4);
}

.chart-card h3 {
  font-size: var(--ff-text-base);
  font-weight: var(--ff-weight-semibold);
  margin-bottom: var(--ff-space-3);
}

/* Chart.js container */
.chart-container {
  position: relative;
  width: 100%;
  height: 180px;        /* Reduced from 250px for density */
}

/* Trend chart time range toggle */
.toggle-group {
  background: var(--ff-surface-overlay);
  border: 1px solid var(--ff-border-subtle);
  border-radius: var(--ff-radius-full);
  padding: 2px;
  display: inline-flex;
  gap: 2px;
}

.btn-toggle {
  background: transparent;
  color: var(--vscode-descriptionForeground);
  border: none;
  border-radius: var(--ff-radius-full);
  padding: 3px 10px;
  font-size: var(--ff-text-xs);
  font-weight: var(--ff-weight-medium);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-toggle.active {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  box-shadow: var(--ff-shadow-sm);
}
```

### Achievement Badge Layout

```css
/* Achievement grid -- 3 columns */
.ff-achievements {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ff-space-2);    /* 8px -- tighter than current 10px */
}

.ff-achievement {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--ff-space-3) var(--ff-space-2);   /* 12px 8px */
  border-radius: var(--ff-radius-md);
  border: 1px solid var(--ff-border-subtle);
  background: var(--ff-surface-raised);
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.ff-achievement.unlocked {
  border-color: rgba(137, 209, 133, 0.4);
  background: linear-gradient(
    180deg,
    rgba(137, 209, 133, 0.04) 0%,
    transparent 100%
  );
}

.ff-achievement.unlocked:hover {
  transform: translateY(-2px);
  box-shadow: var(--ff-shadow-md);
}

.ff-achievement.locked {
  opacity: 0.4;
  filter: grayscale(0.8);
}

.ff-achievement-icon {
  font-size: 1.5em;
  margin-bottom: var(--ff-space-1);
  line-height: 1;
}

.ff-achievement-name {
  font-size: var(--ff-text-xs);
  font-weight: var(--ff-weight-semibold);
  margin-bottom: 2px;
}

.ff-achievement-desc {
  font-size: 0.6rem;     /* 7.8px -- intentionally tiny */
  color: var(--vscode-descriptionForeground);
  line-height: 1.3;
}
```

### Activity Heatmap Improvements

```css
.ff-heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-bottom: var(--ff-space-2);
}

.ff-heatmap-cell {
  aspect-ratio: 1;
  border-radius: 2px;
  transition: transform 0.1s ease;
}

.ff-heatmap-cell:hover {
  transform: scale(1.3);
  z-index: 1;
}
```

---

## 7. Complete Design Token Summary

```css
:root {
  /* ── Typography ── */
  --ff-font-sans:  'Inter', var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
  --ff-font-mono:  var(--vscode-editor-font-family, 'JetBrains Mono', 'Fira Code', 'Consolas', monospace);

  /* ── Type Scale (Minor Third 1.2, base 13px) ── */
  --ff-text-xs:    0.694rem;
  --ff-text-sm:    0.833rem;
  --ff-text-base:  1rem;
  --ff-text-md:    1.2rem;
  --ff-text-lg:    1.44rem;
  --ff-text-xl:    1.728rem;
  --ff-text-2xl:   2.074rem;

  /* ── Font Weights ── */
  --ff-weight-normal:   400;
  --ff-weight-medium:   500;
  --ff-weight-semibold: 600;
  --ff-weight-bold:     700;

  /* ── Line Heights ── */
  --ff-leading-tight:   1.25;
  --ff-leading-snug:    1.4;
  --ff-leading-normal:  1.6;
  --ff-leading-relaxed: 1.75;

  /* ── Letter Spacing ── */
  --ff-tracking-tight:  -0.02em;
  --ff-tracking-normal:  0;
  --ff-tracking-wide:    0.04em;
  --ff-tracking-wider:   0.06em;

  /* ── Spacing (4px grid) ── */
  --ff-space-0:    0px;
  --ff-space-1:    4px;
  --ff-space-2:    8px;
  --ff-space-3:    12px;
  --ff-space-4:    16px;
  --ff-space-5:    20px;
  --ff-space-6:    24px;
  --ff-space-8:    32px;
  --ff-space-10:   40px;
  --ff-space-12:   48px;

  /* ── Surfaces ── */
  --ff-surface-primary: var(--vscode-editor-background);
  --ff-surface-raised:  color-mix(in srgb, var(--vscode-editor-background) 95%, var(--vscode-foreground) 5%);
  --ff-surface-overlay: color-mix(in srgb, var(--vscode-editor-background) 90%, var(--vscode-foreground) 10%);

  /* ── Borders ── */
  --ff-border-subtle:  color-mix(in srgb, var(--vscode-widget-border) 60%, transparent 40%);
  --ff-border-default: var(--vscode-widget-border);

  /* ── Shadows ── */
  --ff-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ff-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ff-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);

  /* ── Radii ── */
  --ff-radius-sm:   4px;
  --ff-radius-md:   6px;
  --ff-radius-lg:   8px;
  --ff-radius-xl:   12px;
  --ff-radius-full: 9999px;

  /* ── Transitions ── */
  --ff-transition-fast:    0.1s ease;
  --ff-transition-normal:  0.15s ease;
  --ff-transition-slow:    0.25s ease;
}
```

---

## 8. Migration Notes

### What Changes from Current CSS

| Current | New | Why |
|---------|-----|-----|
| `font-family: 'DM Sans'` | `font-family: 'Inter'` | Better x-height, screen optimization, variable font |
| `--ff-gap: 16px` | 10 spacing tokens (`--ff-space-1` through `--ff-space-12`) | Granular 4px grid for dense sidebar |
| `--ff-radius: 4px` | 5 radius tokens (`--ff-radius-sm` through `--ff-radius-full`) | Different radii for different element sizes |
| `--ff-transition: 0.1s ease-in-out` | 3 transition tokens | Different speeds for different interaction types |
| Hard-coded `font-size: 0.85em` etc | Type scale tokens | Consistent, harmonious sizing |
| `border: 1px solid var(--vscode-widget-border)` | Subtle border + raised surface + shadow | Layered depth instead of flat outlines |
| Centered stat cards | Left-aligned stat cards with accent strips | Breaks monotony, faster to scan |
| `h1 { font-size: 1.5em }` | `h1 { font-size: var(--ff-text-xl) }` (1.728rem = 22.5px) | Minor Third scale harmony |
| Flat toggle buttons | Pill-shaped toggle group with active state shadow | More polished segmented control |

### Google Fonts Import Change

```html
<!-- Old -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:..." rel="stylesheet">

<!-- New -->
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap" rel="stylesheet">
```

### CSP Update

The CSP in `panelUtils.ts` already allows Google Fonts via `style-src` with `unsafe-inline`. The font import should work without CSP changes since it is loaded via CSS `@import` in the stylesheet. If switching to `<link>` tag in HTML, add `https://fonts.googleapis.com` and `https://fonts.gstatic.com` to `extraFontSrc`.
