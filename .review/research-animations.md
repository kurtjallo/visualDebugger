# Motion Design Research: Premium Micro-Interactions for VisualDebugger

## Executive Summary

The current VisualDebugger animation system uses generic CSS defaults: `ease-in-out` timing, basic `translateY` fades, uniform shimmer, and simple confetti. These feel stock. Premium dev tools (Linear, Raycast, Arc, Vercel) distinguish themselves through **intentional timing curves**, **physics-based easing**, **staggered choreography**, and **meaningful transitions** that communicate state changes rather than just decorating them.

This document provides drop-in CSS `@keyframes`, `cubic-bezier` curves, and implementation patterns to upgrade every animation touchpoint.

---

## Current State Audit

| Animation | Current Implementation | Problem |
|---|---|---|
| Section entrance | `ffSlideIn` - 0.15s ease-out, translateY(8px) | Too fast, too subtle, generic easing |
| Skeleton shimmer | `ffShimmer` - linear gradient sweep | Generic gray, no brand personality |
| Confetti | Random squares/circles falling linearly | No physics, no rotation variety, no spread |
| Panel transitions | translateX(20px), 0.25s ease | Mechanical, no spring overshoot |
| Toast notifications | translateX(40px) slide | Flat, no spring, no weight |
| TTS glow | `ffTtsGlow` - box-shadow pulse | Plain oscillation, no organic feel |
| Button hover | background-color only | No tactile depth, no dimensionality |
| Button active | `scale(0.98)` | Too subtle to feel satisfying |
| Quiz options | `fadeIn` reused as `slide-in` | Same animation for everything |
| Disclosure open | `ffDisclosureOpen` 0.15s ease-out | Feels instant, no content settling |
| Counter animation | JS cubic ease-out | Decent but could overshoot for delight |
| Achievement hover | translateY(-2px), 0.15s ease | No spring, feels flat |

---

## 1. Custom Timing Functions (The Foundation)

The most impactful single change is replacing generic `ease-in-out` with purpose-built cubic-bezier curves. Every premium app has its own easing "signature."

### VisualDebugger Signature Curves

```css
:root {
    /* ── Motion Tokens ── */

    /* Standard: default for most transitions. Starts fast, decelerates smoothly.
       Inspired by Apple's default curve, slightly more pronounced deceleration. */
    --vd-ease-standard: cubic-bezier(0.2, 0, 0, 1);

    /* Emphasize: for entrances and things that need to "arrive" with presence.
       Starts with a burst, long gentle coast to rest. */
    --vd-ease-emphasize: cubic-bezier(0.05, 0.7, 0.1, 1);

    /* Spring: overshoots slightly then settles. For UI elements that feel alive.
       The 1.04 creates a ~4% overshoot — enough to feel springy, not enough to look broken. */
    --vd-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

    /* Bounce: more dramatic overshoot for celebration moments.
       ~8% overshoot with quick settle. Use sparingly. */
    --vd-ease-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);

    /* Snap: for micro-interactions (hover, press). Near-instant start, smooth stop.
       Feels responsive without being jarring. */
    --vd-ease-snap: cubic-bezier(0.4, 0, 0.2, 1);

    /* Exit: for elements leaving. Accelerates out — opposite of entrance curves.
       Quick departure so it doesn't linger. */
    --vd-ease-exit: cubic-bezier(0.4, 0, 1, 1);

    /* ── Duration Tokens ── */
    --vd-duration-instant: 80ms;    /* Hover state changes, color shifts */
    --vd-duration-fast: 150ms;      /* Micro-interactions, button press */
    --vd-duration-normal: 250ms;    /* Panel transitions, slides */
    --vd-duration-slow: 400ms;      /* Entrance animations, reveals */
    --vd-duration-emphasis: 600ms;  /* Celebration, achievement unlock */
}
```

### Why These Specific Curves

- **0.2, 0, 0, 1** (Standard): Material Design 3's "standard" curve. Starts at 80% speed, decelerates to 0. Feels natural because real objects decelerate due to friction.
- **0.34, 1.56, 0.64, 1** (Spring): The `1.56` y2 value creates overshoot. This mimics a spring's oscillation without needing JS-based spring physics. At 250ms duration, the overshoot peaks around 120ms then settles.
- **0.175, 0.885, 0.32, 1.275** (Bounce): "Quint ease-out" variant. More overshoot than spring, used only for celebration moments so it stands out.

---

## 2. Entrance Animations

### 2a. Staggered Spring Reveal (replacing `ffSlideIn`)

The current `ffSlideIn` uses `ease-out` with 8px translateY. The upgrade: larger initial offset, spring easing, and stagger that creates a "cascade" effect.

```css
/* ── Staggered Spring Entrance ── */
@keyframes ffEnterUp {
    0% {
        opacity: 0;
        transform: translateY(16px) scale(0.98);
    }
    60% {
        opacity: 1;
        transform: translateY(-2px) scale(1.005);  /* slight overshoot */
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.vd-section {
    animation: ffEnterUp var(--vd-duration-slow) var(--vd-ease-emphasize) backwards;
}

/* Stagger: 60ms between each section creates a readable cascade
   without feeling slow. Total cascade for 6 items = 360ms. */
.vd-section:nth-child(1) { animation-delay: 0ms; }
.vd-section:nth-child(2) { animation-delay: 60ms; }
.vd-section:nth-child(3) { animation-delay: 120ms; }
.vd-section:nth-child(4) { animation-delay: 180ms; }
.vd-section:nth-child(5) { animation-delay: 240ms; }
.vd-section:nth-child(6) { animation-delay: 300ms; }
.vd-section:nth-child(7) { animation-delay: 360ms; }
```

### 2b. Elastic Bounce for Important Elements (Error Card, TL;DR)

```css
/* ── Elastic Pop for high-priority content ── */
@keyframes ffElasticPop {
    0% {
        opacity: 0;
        transform: scale(0.85) translateY(12px);
    }
    40% {
        opacity: 1;
        transform: scale(1.03) translateY(-4px);
    }
    65% {
        transform: scale(0.99) translateY(1px);
    }
    85% {
        transform: scale(1.005) translateY(-0.5px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.vd-section--error {
    animation: ffElasticPop 500ms var(--vd-ease-emphasize) backwards;
}

/* TL;DR text reveal — scale from slightly small with spring */
.vd-tldr {
    animation: ffElasticPop 400ms var(--vd-ease-spring) backwards;
    animation-delay: 150ms;
}
```

### 2c. Clip-Path Reveal (for Diff Sections)

```css
/* ── Clip reveal: content "grows" from left edge ── */
@keyframes ffClipReveal {
    0% {
        clip-path: inset(0 100% 0 0);
        opacity: 0.6;
    }
    100% {
        clip-path: inset(0 0 0 0);
        opacity: 1;
    }
}

.vd-success-banner {
    animation: ffClipReveal 400ms var(--vd-ease-standard) backwards;
}

.vd-file-bar {
    animation: ffClipReveal 300ms var(--vd-ease-standard) backwards;
    animation-delay: 100ms;
}
```

### 2d. Scale-Up with Subtle Rotation (Achievement Cards)

```css
/* ── Scale + micro-rotation entrance ── */
@keyframes ffScaleRotateIn {
    0% {
        opacity: 0;
        transform: scale(0.8) rotate(-2deg);
    }
    70% {
        opacity: 1;
        transform: scale(1.02) rotate(0.5deg);
    }
    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
}

.vd-achievement {
    animation: ffScaleRotateIn 350ms var(--vd-ease-spring) backwards;
}

.vd-achievement:nth-child(1) { animation-delay: 0ms; }
.vd-achievement:nth-child(2) { animation-delay: 50ms; }
.vd-achievement:nth-child(3) { animation-delay: 100ms; }
.vd-achievement:nth-child(4) { animation-delay: 150ms; }
.vd-achievement:nth-child(5) { animation-delay: 200ms; }
.vd-achievement:nth-child(6) { animation-delay: 250ms; }
```

---

## 3. Button Micro-Interactions

### 3a. Tactile Hover (Scale + Shadow Lift)

```css
/* ── Premium button hover: lift + glow ── */
.btn,
.actions-btn-explain,
.vd-btn--tts {
    transition:
        background-color var(--vd-duration-instant) var(--vd-ease-snap),
        transform var(--vd-duration-fast) var(--vd-ease-spring),
        box-shadow var(--vd-duration-fast) var(--vd-ease-snap);
}

.btn:hover,
.actions-btn-explain:hover,
.vd-btn--tts:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
                0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Primary button gets an additional subtle glow in its brand color */
.btn--primary:hover,
.actions-btn-explain:hover {
    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.25),
                0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 3b. Satisfying Press/Active State

```css
/* ── Button press: compress + flatten shadow ── */
.btn:active,
.actions-btn-explain:active,
.vd-btn--tts:active {
    transform: translateY(0px) scale(0.97);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition-duration: var(--vd-duration-instant);
}

/* Quiz option press feedback */
.quiz-option:active:not([data-answered]) {
    transform: scale(0.98);
    transition: transform var(--vd-duration-instant) var(--vd-ease-snap);
}
```

### 3c. Button Loading State (Custom Spinner)

```css
/* ── VisualDebugger-branded loading spinner ── */
@keyframes ffSpinnerRotate {
    to { transform: rotate(360deg); }
}

@keyframes ffSpinnerDash {
    0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
    }
    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
    }
}

.vd-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    animation: ffSpinnerRotate 1.4s linear infinite;
}

.vd-spinner circle {
    stroke: currentColor;
    stroke-linecap: round;
    fill: none;
    stroke-width: 3;
    animation: ffSpinnerDash 1.4s var(--vd-ease-standard) infinite;
}

/* Usage: replace "Loading..." text with SVG spinner
   <svg class="vd-spinner" viewBox="0 0 24 24">
       <circle cx="12" cy="12" r="10"/>
   </svg>
*/
```

### 3d. Button Success State (Animated Checkmark)

```css
/* ── Success checkmark animation ── */
@keyframes ffCheckDraw {
    0% {
        stroke-dashoffset: 24;
    }
    100% {
        stroke-dashoffset: 0;
    }
}

@keyframes ffCheckScale {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
}

.vd-check-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    animation: ffCheckScale 300ms var(--vd-ease-spring) forwards;
}

.vd-check-icon path {
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    animation: ffCheckDraw 300ms var(--vd-ease-standard) 100ms forwards;
}

/* "Copied!" button success pulse */
.btn--success {
    animation: ffSuccessPulse 300ms var(--vd-ease-spring);
}

@keyframes ffSuccessPulse {
    0% { transform: scale(1); }
    40% { transform: scale(1.04); }
    100% { transform: scale(1); }
}

/* Usage:
   <svg class="vd-check-icon" viewBox="0 0 16 16">
       <path d="M3.5 8.5L6.5 11.5L12.5 4.5"/>
   </svg>
*/
```

---

## 4. Panel Transitions

### 4a. View Transitions (Actions -> Error -> Diff)

The current implementation uses `translateX(20px)` with `ease`. The upgrade adds spring easing, slight scale, and crossfade timing.

```css
/* ── Panel transition: spring slide with crossfade ── */
.panel-section {
    opacity: 0;
    transform: translateX(24px) scale(0.985);
    transition:
        opacity var(--vd-duration-normal) var(--vd-ease-exit),
        transform var(--vd-duration-normal) var(--vd-ease-exit);
    pointer-events: none;
    position: absolute;
    width: 100%;
    visibility: hidden;
    will-change: transform, opacity;
}

.panel-section.visible {
    opacity: 1;
    transform: translateX(0) scale(1);
    pointer-events: auto;
    position: relative;
    visibility: visible;
    transition:
        opacity var(--vd-duration-normal) var(--vd-ease-emphasize),
        transform var(--vd-duration-normal) var(--vd-ease-spring);
}

.panel-section.slide-out-left {
    opacity: 0;
    transform: translateX(-16px) scale(0.99);
    pointer-events: none;
    transition:
        opacity 180ms var(--vd-ease-exit),
        transform 180ms var(--vd-ease-exit);
}
```

### 4b. Smooth Height Auto-Animation

When sections expand/collapse (disclosure panels, quiz feedback), use CSS `interpolate-size` or a JS-assisted approach.

```css
/* ── Disclosure smooth open/close ── */
.vd-disclosure {
    overflow: hidden;
}

.vd-disclosure-body {
    padding: 10px 0 4px 0;
    animation: ffExpandDown 300ms var(--vd-ease-emphasize);
    transform-origin: top;
}

@keyframes ffExpandDown {
    0% {
        opacity: 0;
        transform: scaleY(0.8) translateY(-8px);
        max-height: 0;
    }
    100% {
        opacity: 1;
        transform: scaleY(1) translateY(0);
        max-height: 500px;
    }
}

/* Quiz feedback expand */
.quiz-feedback {
    animation: ffExpandDown 250ms var(--vd-ease-emphasize);
}
```

### 4c. Back Button Transition Direction

When going "back," the animation should reverse direction (slide from left).

```css
/* ── Reverse transition for "back" navigation ── */
.panel-section.slide-in-from-left {
    opacity: 0;
    transform: translateX(-24px) scale(0.985);
}

.panel-section.slide-in-from-left.visible {
    opacity: 1;
    transform: translateX(0) scale(1);
    transition:
        opacity var(--vd-duration-normal) var(--vd-ease-emphasize),
        transform var(--vd-duration-normal) var(--vd-ease-spring);
}
```

---

## 5. Celebration Moments

### 5a. Physics-Based Confetti (Shaped Particles)

Replace the current linear-fall confetti with varied shapes, rotation, horizontal drift, and staggered gravity.

```css
/* ── Premium Confetti: shaped particles with physics ── */
@keyframes ffConfettiPhysics {
    0% {
        transform: translateY(0) translateX(0) rotateZ(0deg) rotateY(0deg) scale(1);
        opacity: 1;
    }
    15% {
        opacity: 1;
    }
    75% {
        opacity: 0.8;
    }
    100% {
        transform:
            translateY(calc(100vh + 40px))
            translateX(var(--vd-confetti-drift, 0px))
            rotateZ(var(--vd-confetti-spin, 720deg))
            rotateY(var(--vd-confetti-tumble, 360deg))
            scale(0.4);
        opacity: 0;
    }
}

.vd-confetti-piece {
    position: absolute;
    top: -10px;
    animation: ffConfettiPhysics var(--vd-confetti-duration, 2s) var(--vd-ease-standard) forwards;
    /* Shape variants set via inline style: */
    /* circle: border-radius: 50%; */
    /* rect: border-radius: 2px; */
    /* diamond: clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); */
    /* star: clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); */
}
```

**JavaScript confetti upgrade** (for `launchConfetti()`):

```javascript
function launchConfetti() {
    if (prefersReducedMotion) return;
    const container = document.createElement('div');
    container.className = 'vd-confetti-container';
    document.body.appendChild(container);

    const colors = ['#eebb00', '#3794ff', '#f14c4c', '#89d185', '#06b6d4', '#c084fc'];
    const shapes = ['circle', 'rect', 'diamond'];
    const count = 40;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'vd-confetti-piece';

        // Varied sizing
        const size = 5 + Math.random() * 8;
        piece.style.width = size + 'px';
        piece.style.height = size * (0.6 + Math.random() * 0.8) + 'px';

        // Position: spread across top, cluster toward center
        const centerBias = 0.3 + Math.random() * 0.4; // 30%-70% range
        piece.style.left = (centerBias * 100) + '%';

        // Color
        piece.style.backgroundColor = colors[i % colors.length];

        // Shape
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        if (shape === 'circle') {
            piece.style.borderRadius = '50%';
        } else if (shape === 'diamond') {
            piece.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        } else {
            piece.style.borderRadius = '2px';
        }

        // Physics variation via CSS custom properties
        const drift = (Math.random() - 0.5) * 200; // -100px to +100px horizontal drift
        const spin = 360 + Math.random() * 720;     // 1-3 full rotations
        const tumble = Math.random() * 360;          // 3D tumble
        const duration = 1.5 + Math.random() * 1.5;  // 1.5s - 3s fall time
        const delay = Math.random() * 0.3;            // 0-300ms stagger

        piece.style.setProperty('--vd-confetti-drift', drift + 'px');
        piece.style.setProperty('--vd-confetti-spin', spin + 'deg');
        piece.style.setProperty('--vd-confetti-tumble', tumble + 'deg');
        piece.style.setProperty('--vd-confetti-duration', duration + 's');
        piece.style.animationDelay = delay + 's';

        container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 3500);
}
```

### 5b. Quiz Correct Answer (Pulse + Glow)

```css
/* ── Correct answer: satisfying pulse + expanding glow ring ── */
@keyframes ffCorrectPulse {
    0% {
        box-shadow: 0 0 0 0 rgba(137, 209, 133, 0.5);
        transform: scale(1);
    }
    30% {
        transform: scale(1.02);
    }
    50% {
        box-shadow: 0 0 0 8px rgba(137, 209, 133, 0);
        transform: scale(1.01);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(137, 209, 133, 0);
        transform: scale(1);
    }
}

.quiz-option.correct {
    border-color: var(--vd-success);
    border-left-width: 4px;
    animation: ffCorrectPulse 500ms var(--vd-ease-spring);
    background: rgba(137, 209, 133, 0.08);
}

/* Incorrect answer: subtle shake */
@keyframes ffShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(2px); }
}

.quiz-option.incorrect {
    animation: ffShake 400ms var(--vd-ease-snap);
}
```

### 5c. Checklist Complete (Wave Animation)

```css
/* ── Wave animation across checklist items when all checked ── */
@keyframes ffCheckWave {
    0% {
        transform: translateY(0);
        background: transparent;
    }
    30% {
        transform: translateY(-3px);
        background: rgba(137, 209, 133, 0.06);
    }
    100% {
        transform: translateY(0);
        background: transparent;
    }
}

.vd-checklist.all-done .vd-check-item {
    animation: ffCheckWave 400ms var(--vd-ease-spring) backwards;
}

.vd-checklist.all-done .vd-check-item:nth-child(1) { animation-delay: 0ms; }
.vd-checklist.all-done .vd-check-item:nth-child(2) { animation-delay: 80ms; }
.vd-checklist.all-done .vd-check-item:nth-child(3) { animation-delay: 160ms; }
.vd-checklist.all-done .vd-check-item:nth-child(4) { animation-delay: 240ms; }
.vd-checklist.all-done .vd-check-item:nth-child(5) { animation-delay: 320ms; }

/* "All done" message entrance */
.vd-check-done {
    animation: ffElasticPop 400ms var(--vd-ease-spring) backwards;
    animation-delay: 400ms;
}
```

### 5d. Achievement Unlock

```css
/* ── Achievement unlock: radial glow burst + bounce ── */
@keyframes ffAchievementUnlock {
    0% {
        transform: scale(0.6) rotate(-8deg);
        opacity: 0;
        box-shadow: 0 0 0 0 rgba(137, 209, 133, 0.6);
    }
    40% {
        transform: scale(1.1) rotate(2deg);
        opacity: 1;
        box-shadow: 0 0 20px 4px rgba(137, 209, 133, 0.3);
    }
    60% {
        transform: scale(0.95) rotate(-1deg);
    }
    80% {
        transform: scale(1.02) rotate(0.5deg);
        box-shadow: 0 0 8px 2px rgba(137, 209, 133, 0.15);
    }
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(137, 209, 133, 0);
    }
}

.vd-achievement.unlocked.just-unlocked {
    animation: ffAchievementUnlock 600ms var(--vd-ease-emphasize);
}

/* Achievement icon shimmer on unlock */
@keyframes ffIconShimmer {
    0% { filter: brightness(1); }
    50% { filter: brightness(1.4) drop-shadow(0 0 4px rgba(137, 209, 133, 0.5)); }
    100% { filter: brightness(1); }
}

.vd-achievement.just-unlocked .vd-achievement-icon {
    animation: ffIconShimmer 800ms var(--vd-ease-standard) 300ms;
}
```

---

## 6. Loading States

### 6a. Branded Skeleton (Replacing Generic Shimmer)

The current shimmer is a linear gradient sweep. The upgrade: add a subtle cyan tint, wave-like timing, and staggered group animation.

```css
/* ── Branded skeleton with wave shimmer ── */
.vd-skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(
        90deg,
        var(--vscode-textCodeBlock-background, rgba(127, 127, 127, 0.1)) 0%,
        rgba(6, 182, 212, 0.08) 25%,
        rgba(6, 182, 212, 0.14) 50%,
        rgba(6, 182, 212, 0.08) 75%,
        var(--vscode-textCodeBlock-background, rgba(127, 127, 127, 0.1)) 100%
    );
    background-size: 300% 100%;
    animation: ffSkeletonWave 2s var(--vd-ease-standard) infinite;
}

@keyframes ffSkeletonWave {
    0% { background-position: 300% 0; }
    100% { background-position: -100% 0; }
}

/* Stagger skeleton groups for a "thinking" effect */
.vd-skeleton-group:nth-child(1) .vd-skeleton-line { animation-delay: 0ms; }
.vd-skeleton-group:nth-child(2) .vd-skeleton-line { animation-delay: 200ms; }
.vd-skeleton-group:nth-child(3) .vd-skeleton-line { animation-delay: 400ms; }

/* Add subtle entrance animation to skeleton itself */
.vd-skeleton-group {
    animation: ffEnterUp 300ms var(--vd-ease-emphasize) backwards;
}

.vd-skeleton-group:nth-child(2) { animation-delay: 100ms; }
.vd-skeleton-group:nth-child(3) { animation-delay: 200ms; }
```

### 6b. Typing Indicator (Humanized "Thinking")

Replace the blinking cursor with a three-dot "typing" indicator that feels like a real person is composing a response.

```css
/* ── Typing indicator: three dots with wave ── */
.vd-typing-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    border-radius: 12px;
    background: var(--vscode-textCodeBlock-background, rgba(127, 127, 127, 0.1));
    border: 1px solid var(--vscode-widget-border);
}

.vd-typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(6, 182, 212, 0.6);
    animation: ffTypingBounce 1.2s var(--vd-ease-spring) infinite;
}

.vd-typing-dot:nth-child(1) { animation-delay: 0ms; }
.vd-typing-dot:nth-child(2) { animation-delay: 150ms; }
.vd-typing-dot:nth-child(3) { animation-delay: 300ms; }

@keyframes ffTypingBounce {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-6px);
        opacity: 1;
    }
}

/* Usage:
   <div class="vd-typing-indicator" aria-label="Analyzing error...">
       <span class="vd-typing-dot"></span>
       <span class="vd-typing-dot"></span>
       <span class="vd-typing-dot"></span>
   </div>
*/
```

### 6c. Progress Bar with Personality

```css
/* ── Branded progress bar with shimmer overlay ── */
.vd-progress-bar {
    height: 4px;
    border-radius: 4px;
    background: var(--vscode-textCodeBlock-background, rgba(127, 127, 127, 0.15));
    overflow: hidden;
    position: relative;
}

.vd-progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(
        90deg,
        rgba(6, 182, 212, 0.7),
        rgba(55, 148, 255, 0.8),
        rgba(6, 182, 212, 0.7)
    );
    background-size: 200% 100%;
    animation: ffProgressShimmer 2s linear infinite;
    transition: width 500ms var(--vd-ease-emphasize);
    position: relative;
}

@keyframes ffProgressShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Indeterminate state: oscillating bar */
.vd-progress-bar-fill.indeterminate {
    width: 40% !important;
    animation:
        ffProgressShimmer 2s linear infinite,
        ffProgressSlide 1.5s var(--vd-ease-standard) infinite alternate;
}

@keyframes ffProgressSlide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
}
```

---

## 7. Subtle Ambient Motion

### 7a. Breathing Glow on Active Elements

```css
/* ── Breathing glow: for TTS playing state, active focus ── */
@keyframes ffBreathe {
    0%, 100% {
        box-shadow: 0 0 4px rgba(6, 182, 212, 0.2);
    }
    50% {
        box-shadow: 0 0 14px rgba(6, 182, 212, 0.35),
                    0 0 4px rgba(6, 182, 212, 0.15);
    }
}

.vd-btn--playing {
    animation: ffBreathe 2s var(--vd-ease-standard) infinite;
}

/* Success dot subtle pulse */
.vd-success-dot {
    animation: ffBreathe 2.5s var(--vd-ease-standard) infinite;
}
```

### 7b. SVG Empty State Ambient Animation

```css
/* ── Floating effect for empty state SVG ── */
@keyframes ffFloat {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-6px);
    }
}

.vd-empty-svg {
    animation: ffFloat 3s var(--vd-ease-standard) infinite;
}

/* Subtle rotation for "code" text in SVG */
@keyframes ffCodePulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.7; }
}
```

### 7c. Card Hover Depth Effect

```css
/* ── Card hover: subtle lift with shadow depth ── */
.card {
    transition:
        border-color var(--vd-duration-instant) var(--vd-ease-snap),
        box-shadow var(--vd-duration-fast) var(--vd-ease-snap),
        transform var(--vd-duration-fast) var(--vd-ease-spring);
}

.card:hover {
    border-color: var(--vscode-focusBorder);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1),
                0 1px 4px rgba(0, 0, 0, 0.06);
}

/* Stat card: number color transition on hover */
.stat-item {
    transition: transform var(--vd-duration-fast) var(--vd-ease-spring);
}

.stat-card:hover .stat-item {
    transform: scale(1.03);
}
```

### 7d. Error Count Badge Attention Pulse

```css
/* ── Error badge: refined attention pulse ── */
@keyframes ffBadgePulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(241, 76, 76, 0.5);
    }
    50% {
        transform: scale(1.2);
        box-shadow: 0 0 0 6px rgba(241, 76, 76, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(241, 76, 76, 0);
    }
}

.count-badge.vd-pulse {
    animation: ffBadgePulse 350ms var(--vd-ease-spring) 2;
}
```

---

## 8. Toast Notification Enhancement

```css
/* ── Enhanced toast: spring entrance with icon ── */
.vd-toast {
    animation: ffToastSpring 400ms var(--vd-ease-spring) forwards;
}

@keyframes ffToastSpring {
    0% {
        opacity: 0;
        transform: translateX(60px) scale(0.9);
    }
    60% {
        opacity: 1;
        transform: translateX(-4px) scale(1.01);
    }
    100% {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

.vd-toast.vd-toast--out {
    animation: ffToastExit 200ms var(--vd-ease-exit) forwards;
}

@keyframes ffToastExit {
    0% {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateX(40px) scale(0.95);
    }
}

/* Success toast gets a brief green flash */
.vd-toast--success {
    animation:
        ffToastSpring 400ms var(--vd-ease-spring) forwards,
        ffToastSuccessFlash 600ms var(--vd-ease-standard);
}

@keyframes ffToastSuccessFlash {
    0% { background: rgba(137, 209, 133, 0.2); }
    100% { background: var(--vscode-editorWidget-background, #252526); }
}
```

---

## 9. Gradient Border Refinement (Error Card)

The current rotating conic gradient is attention-grabbing. Refine it to be smoother and less visually busy.

```css
/* ── Refined gradient border: slower, subtler ── */
.vd-section--error {
    animation: ffGradientSpin 6s linear infinite;  /* slower: 6s instead of 4s */
}

/* Add a subtle inner glow that breathes */
.vd-section--error::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    pointer-events: none;
    animation: ffInnerGlow 3s var(--vd-ease-standard) infinite;
}

@keyframes ffInnerGlow {
    0%, 100% {
        box-shadow: inset 0 0 12px rgba(241, 76, 76, 0.03);
    }
    50% {
        box-shadow: inset 0 0 20px rgba(241, 76, 76, 0.06);
    }
}
```

---

## 10. Counter Animation Enhancement (Overshoot)

The current JS counter uses cubic ease-out. Add a slight overshoot for delight.

```javascript
// Enhanced counter with overshoot
function animateCounter(element, target, duration) {
    if (prefersReducedMotion || target === 0) {
        element.textContent = target;
        return;
    }
    const start = performance.now();
    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        // Spring-like overshoot easing
        // Overshoots to ~105% at 60% progress, then settles
        let eased;
        if (progress < 0.6) {
            eased = (progress / 0.6) * 1.05; // overshoot to 105%
        } else {
            // Settle from 105% to 100%
            const settleProgress = (progress - 0.6) / 0.4;
            eased = 1.05 - (0.05 * settleProgress);
        }

        element.textContent = Math.round(Math.min(eased * target, target * 1.05));
        if (progress < 1) requestAnimationFrame(tick);
        else element.textContent = target; // ensure exact final value
    }
    requestAnimationFrame(tick);
}
```

---

## 11. Reduced Motion Compliance

All animations must respect `prefers-reduced-motion`. The existing media query is correct but should be kept up to date as new animations are added.

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }

    /* Preserve non-motion visual feedback */
    .quiz-option.correct {
        background: rgba(137, 209, 133, 0.08);
    }

    .quiz-option.incorrect {
        background: rgba(241, 76, 76, 0.08);
    }
}
```

---

## 12. Implementation Priority

### Highest Impact (Do First)
1. **Custom timing functions** (`:root` CSS variables) -- every animation improves instantly
2. **Button micro-interactions** (hover lift + press compress) -- most frequently interacted element
3. **Panel transitions** (spring easing upgrade) -- seen every time user navigates

### Medium Impact (Do Second)
4. **Staggered section entrance** -- visible on every error/diff view
5. **Quiz answer feedback** (correct pulse, incorrect shake) -- key engagement moment
6. **Branded skeleton** (cyan-tinted shimmer) -- visible during every AI analysis wait
7. **Toast spring entrance** -- small but noticeable polish

### Nice-to-Have (Do Third)
8. **Physics confetti** -- celebration moments
9. **Achievement unlock animation** -- dashboard engagement
10. **Typing indicator** -- alternative to skeleton
11. **Ambient glow/float** -- subtle polish layer
12. **Checklist wave** -- delight on completion

---

## 13. Performance Notes

- All animations use `transform` and `opacity` only (GPU-composited, no layout thrash)
- `will-change: transform, opacity` on panel sections that transition frequently
- Spring cubic-bezier curves are pure CSS (no JS spring physics library needed)
- Stagger delays are small enough (60ms) that total cascade time stays under 500ms
- Confetti particles are capped at 40 and auto-removed after 3.5s
- The `@property` hack for gradient angle animation is Chromium-only (which is fine for VS Code webviews)

---

## 14. Comparison: Before vs. After

| Element | Before | After |
|---|---|---|
| Section entrance | 0.15s ease-out, 8px slide | 0.4s spring, 16px slide + scale, stagger |
| Button hover | background-color swap | translateY(-1px) + shadow lift |
| Button press | scale(0.98) | scale(0.97) + shadow flatten |
| Panel transition | 0.25s ease, 20px | 0.25s spring, 24px + scale |
| Confetti | 30 pieces, linear fall | 40 pieces, physics drift + tumble + shapes |
| Quiz correct | green border | pulse + expanding glow ring |
| Quiz incorrect | red border | red border + shake |
| Skeleton | gray shimmer | cyan-tinted wave + staggered groups |
| Toast | 0.3s ease-out slide | 0.4s spring with overshoot |
| Error badge | scale(1.3) pulse | scale(1.2) + expanding ring |
| Achievement hover | translateY(-2px) | translateY(-2px) + shadow depth |
| TTS glow | box-shadow pulse | breathing cyan glow |
