# Color Audit: Violet/Coral Theme -> Blue Theme

All hardcoded color values in the codebase that reference the current violet/coral theme,
grouped by file. Each entry shows the line number, the exact color value, and its usage context.

---

## 1. `extension/src/webview/styles.css`

### CSS Custom Properties (lines 15-29)

| Line | Color Value | Usage |
|------|-------------|-------|
| 15 | (comment) | `/* Brand -- Warm violet-to-coral gradient signature */` |
| 16 | `#A78BFA` | `--vd-accent` (main brand violet) |
| 17 | `rgba(167, 139, 250, 0.15)` | `--vd-accent-dim` |
| 18 | `rgba(167, 139, 250, 0.25)` | `--vd-accent-glow` |
| 19 | `#A78BFA, #FB7185` | `--vd-gradient` (violet-to-coral gradient) |
| 20 | `rgba(167,139,250,0.12), rgba(251,113,133,0.12)` | `--vd-gradient-subtle` |
| 25 | `#818CF8` | `--vd-logic` (indigo, logic bug color) |
| 26 | `rgba(129, 140, 248, 0.12)` | `--vd-logic-dim` |
| 27 | `#FB7185` | `--vd-runtime` (coral/pink, runtime bug color) |
| 28 | `rgba(251, 113, 133, 0.12)` | `--vd-runtime-dim` |

### Hardcoded Colors in Rules

| Line | Color Value | Usage |
|------|-------------|-------|
| 105 | `#C4B5FD` | `.vd-sidebar a` link color (lighter violet) |
| 107 | `rgba(167, 139, 250, 0.3)` | `.vd-sidebar a` text-decoration-color |
| 171 | `rgba(167, 139, 250, 0.2)` | `.vd-card` hover border-color |
| 173 | `rgba(167, 139, 250, 0.08)` | `.vd-card` hover box-shadow inset |
| 215 | `rgba(129, 140, 248, 0.25)` | `.vd-card--logic` border-color |
| 220 | `rgba(251, 113, 133, 0.25)` | `.vd-card--runtime` border-color |
| 249 | `rgba(167, 139, 250, 0.25)` | `.vd-btn--primary` box-shadow |
| 252 | `rgba(167, 139, 250, 0.35)` | `.vd-btn--primary:hover` box-shadow |
| 262 | `rgba(167, 139, 250, 0.2)` | `.vd-btn--secondary` border-color |
| 432 | `rgba(167, 139, 250, 0.2)` | `.stat-item:hover` border-color |
| 491 | `rgba(167, 139, 250, 0.2)` | `.vd-code-block` border |
| 503 | `#c084fc` | `.token.keyword` syntax highlight color (purple) |
| 504 | `#FB7185` | `.token.string` syntax highlight color (coral) |
| 836 | `rgba(167, 139, 250, 0.15)` | (likely a section/panel border) |
| 929 | `rgba(167, 139, 250, 0.2)` | `@keyframes` pulse box-shadow at 0%/100% |
| 930 | `rgba(167, 139, 250, 0)` | `@keyframes` pulse box-shadow at 50% |
| 1094 | `rgba(251, 113, 133, 0.4)` | `@keyframes` heartbeat box-shadow at 0%/100% |
| 1095 | `rgba(251, 113, 133, 0.3)` | `@keyframes` heartbeat box-shadow at 50% |
| 1198 | `rgba(167, 139, 250, 0.3)` | drop-shadow filter |
| 1322 | `rgba(167, 139, 250, 0.18)` | heatmap cell level-1 background |
| 1323 | `rgba(167, 139, 250, 0.12)` | heatmap cell level-1 border-color |
| 1326 | `rgba(167, 139, 250, 0.35)` | heatmap cell level-2 background |
| 1327 | `rgba(167, 139, 250, 0.2)` | heatmap cell level-2 border-color |
| 1330 | `rgba(167, 139, 250, 0.55)` | heatmap cell level-3 background |
| 1331 | `rgba(167, 139, 250, 0.3)` | heatmap cell level-3 border-color |
| 1334 | `rgba(167, 139, 250, 0.8)` | heatmap cell level-4 background |
| 1335 | `rgba(167, 139, 250, 0.5)` | heatmap cell level-4 border-color |
| 1340 | `rgba(167, 139, 250, 0.3)` | heatmap cell hover box-shadow |
| 1356 | `rgba(167, 139, 250, 0.25)` | heatmap tooltip border |
| 1415 | `rgba(167, 139, 250, 0.18)` | heatmap legend cell level-1 |
| 1416 | `rgba(167, 139, 250, 0.35)` | heatmap legend cell level-2 |
| 1417 | `rgba(167, 139, 250, 0.55)` | heatmap legend cell level-3 |
| 1418 | `rgba(167, 139, 250, 0.8)` | heatmap legend cell level-4 |
| 1446 | `rgba(167, 139, 250, 0.3)` | border-color (heatmap section) |
| 1535 | `rgba(167, 139, 250, 0.3)` | loading animation drop-shadow |
| 1544 | `#A78BFA` | loading spinner border-top-color fallback |
| 1545 | `#A78BFA` | loading spinner border-right-color fallback |
| 1554 | `#FB7185` | loading spinner border-bottom-color |
| 1555 | `#FB7185` | loading spinner border-left-color |

**Total in styles.css: ~45 occurrences across ~40 lines**

---

## 2. `extension/src/webview/debug.html`

### Inline `<style>` Block

| Line | Color Value | Usage |
|------|-------------|-------|
| 32 | `#FB7185` | `.vd-debug-tag` background fallback (runtime color) |
| 37 | `rgba(251, 113, 133, 0.3)` | `.vd-debug-tag:hover` box-shadow |
| 46 | `#FB7185` | `.vd-debug-insight` border-left fallback |
| 71 | `#A78BFA, #FB7185` | `.vd-debug-btn-primary` gradient background fallback |
| 73 | `rgba(167, 139, 250, 0.3)` | `.vd-debug-btn-primary` box-shadow |
| 80 | `rgba(167, 139, 250, 0.4)` | `.vd-debug-btn-primary:hover` box-shadow |
| 85 | `rgba(167, 139, 250, 0.2)` | `.vd-debug-btn-secondary` box-shadow |
| 89 | `#A78BFA` | `.vd-debug-btn-secondary:focus-visible` outline fallback |
| 135 | `#A78BFA` | `.vd-debug-fix-link` color fallback |
| 136 | `rgba(167,139,250,0.15)` | `.vd-debug-fix-link` background fallback |
| 137 | `rgba(167, 139, 250, 0.2)` | `.vd-debug-fix-link` border-color |
| 146 | `#A78BFA` | `.vd-debug-fix-link:focus-visible` outline fallback |

### SVG Gradient Stops

| Line | Color Value | Usage |
|------|-------------|-------|
| 202 | `#A78BFA` (opacity 0.2) | SVG linearGradient stop at 0% |
| 203 | `#FB7185` (opacity 0.2) | SVG linearGradient stop at 100% |

### JavaScript (Confetti Colors)

| Line | Color Value | Usage |
|------|-------------|-------|
| 490 | `#A78BFA` | Confetti color array [0] (violet) |
| 490 | `#FB7185` | Confetti color array [1] (coral) |
| 490 | `#818CF8` | Confetti color array [4] (indigo) |
| 490 | `#C4B5FD` | Confetti color array [5] (light violet) |

**Total in debug.html: ~18 occurrences**

---

## 3. `extension/src/webview/dashboard.html`

### SVG Gradient Stops

| Line | Color Value | Usage |
|------|-------------|-------|
| 76 | `#A78BFA` | SVG gradient stop at 0% (violet) |
| 77 | `#FB7185` | SVG gradient stop at 100% (coral) |

### JavaScript (Chart.js Configuration)

| Line | Color Value | Usage |
|------|-------------|-------|
| 145 | `#818CF8` | `colLogic` fallback (logic bug color) |
| 146 | `#FB7185` | `colRuntime` fallback (runtime bug color) |
| 149 | `#A78BFA` | `colTotal` (total line color) |
| 215 | `rgba(167, 139, 250, 0.2)` | Chart tooltip borderColor |
| 397 | `rgba(129,140,248,0.25)` | Doughnut chart background for logic |
| 397 | `rgba(251,113,133,0.25)` | Doughnut chart background for runtime |
| 482 | `rgba(167, 139, 250, 0.08)` | Line chart area fill backgroundColor |
| 487 | `rgba(167, 139, 250, 0.3)` | Line chart pointBorderColor |

**Total in dashboard.html: ~10 occurrences**

---

## 4. `extension/src/webview/debugPanelScript.ts`

| Line | Color Value | Usage |
|------|-------------|-------|
| 154 | `#A78BFA` | Confetti colors array [0] (violet) |
| 154 | `#FB7185` | Confetti colors array [1] (coral) |
| 154 | `#818CF8` | Confetti colors array [4] (indigo) |
| 154 | `#C4B5FD` | Confetti colors array [5] (light violet) |

**Total in debugPanelScript.ts: 4 occurrences (1 line)**

---

## 5. `extension/src/webview/dashboardScript.ts`

| Line | Color Value | Usage |
|------|-------------|-------|
| 85 | `#4fc3f7` | Chart borderColor (light blue - may be intentional) |
| 86 | `rgba(79,195,247,0.18)` | Chart backgroundColor (light blue - may be intentional) |

**Note:** These are already blue-ish. Review whether they align with the new blue palette or need updating.

**Total in dashboardScript.ts: 2 occurrences**

---

## 6. `demo-app/src/styles.css`

| Line | Color Value | Usage |
|------|-------------|-------|
| 4 | `#4f46e5` | `--primary` (indigo-600 -- currently violet-adjacent) |
| 5 | `#4338ca` | `--primary-hover` (indigo-700 -- currently violet-adjacent) |

**Note:** These are Tailwind indigo values. They are close to violet and may need adjustment to match the new blue theme, or they may be acceptable if the demo app is meant to look independent from the extension theme.

**Total in demo-app: 2 occurrences**

---

## 7. `extension/src/panels/*.ts`

Checked all three files:
- `panelUtils.ts` - **No hardcoded colors found**
- `DashboardPanel.ts` - **No hardcoded colors found**
- `DebugPanel.ts` - **No hardcoded colors found**

---

## Summary: Colors That MUST Change

### Primary Brand Colors (violet/coral)

| Color | Hex/RGBA | Occurrences | Files |
|-------|----------|-------------|-------|
| Violet (main) | `#A78BFA` | 13 | styles.css, debug.html, dashboard.html, debugPanelScript.ts |
| Coral (gradient end) | `#FB7185` | 13 | styles.css, debug.html, dashboard.html, debugPanelScript.ts |
| Light violet | `#C4B5FD` | 3 | styles.css, debug.html, debugPanelScript.ts |
| Indigo/logic | `#818CF8` | 4 | styles.css, debug.html, dashboard.html, debugPanelScript.ts |
| Purple (keyword) | `#c084fc` | 1 | styles.css |
| Violet rgba variants | `rgba(167, 139, 250, ...)` | ~35 | styles.css, debug.html, dashboard.html |
| Coral rgba variants | `rgba(251, 113, 133, ...)` | ~7 | styles.css, debug.html, dashboard.html |
| Logic rgba variants | `rgba(129, 140, 248, ...)` | ~3 | styles.css, dashboard.html |

### Possibly Needs Updating

| Color | Hex/RGBA | Occurrences | Files |
|-------|----------|-------------|-------|
| Demo-app indigo | `#4f46e5` / `#4338ca` | 2 | demo-app/src/styles.css |
| Dashboard blue | `#4fc3f7` / `rgba(79,195,247,...)` | 2 | dashboardScript.ts |

### Grand Total: ~83 hardcoded color occurrences across 6 files

---

## Strategy Recommendation

1. **styles.css CSS variables (lines 15-29)** are the single source of truth. Changing these 10 variable definitions will cascade to all `var()` usages automatically.
2. **Hardcoded fallback values** in debug.html and dashboard.html (e.g., `var(--vd-accent, #A78BFA)`) need their fallback hex updated too.
3. **JavaScript color arrays** in debug.html:490, debugPanelScript.ts:154, and dashboard.html Chart.js configs must be updated manually.
4. **SVG gradient stops** in debug.html:202-203 and dashboard.html:76-77 must be updated manually.
5. **Standalone hex/rgba values** not using CSS variables (e.g., styles.css:105, 503, 504, 1322-1418) must be updated manually.
6. **The heatmap** (styles.css lines 1322-1418) has 10+ hardcoded violet rgba values for the 4 intensity levels plus their legend counterparts -- all must change.
7. **The loading spinner** (styles.css lines 1544-1555) has a violet-top/coral-bottom split that must become blue.
