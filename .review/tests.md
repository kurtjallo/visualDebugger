# Test Review -- PR #20: Improve TTS reliability and speed

## Current Test Inventory

| Test file | Scope | Tests |
|---|---|---|
| `__tests__/llmClient.test.ts` | LLM client (Phase 1 & 2 responses, prompts, errors) | 19 |
| `__tests__/codeLensProvider.test.ts` | CodeLens diagnostics integration | 10 |
| `__tests__/envLoader.test.ts` | .env file loading & parsing | 6 |
| `__tests__/geminiIntegration.test.ts` | Real Gemini API (skipped without key) | 5 |

**Total: 40 tests, 0 covering any TTS or audio functionality.**

---

## Issue 1: No unit tests for `ttsClient.ts` (the core of this PR)

**Problem:** `ttsClient.ts` was completely rewritten with retry logic, voice selection, timeout handling, and error classification -- yet there are zero tests for it. This is the central file of the PR.

Untested paths in `extension/src/ttsClient.ts`:
- `fetchTtsAudio()` happy path (line 21-70): successful API call returns base64 audio
- `shouldRetry()` (line 13-15): status codes 408, 409, 425, 429, 500+ trigger retry; others do not
- Retry loop (lines 30-86): retries up to `MAX_TTS_RETRIES` with backoff delay
- Timeout abort (lines 31-33, 72-77): AbortController fires after 12s, classified as timeout error
- Voice selection (line 26): `"male"` / `"female"` map to voice IDs; invalid voice falls back to female
- Non-retryable HTTP errors (line 61-66): e.g. 401/403 throw immediately without retry
- Final throw after exhausted retries (line 88)

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|---|---|---|---|---|
| A) Do nothing | None | **High** -- core PR feature is untested; regressions will ship silently | None | None |
| B) Add unit tests with mocked `fetch` covering all paths above | Medium (1-2h) | Low | **High** -- catches retry logic bugs, voice fallback issues, timeout edge cases | Low -- stable mock surface |
| C) Add unit tests + a manual verification script (already exists as `verify_tts.ts`) | Medium-High | Low | High, but `verify_tts.ts` already serves the manual role | Slightly higher -- two test surfaces |

**Recommendation: Option B.** The project's CLAUDE.md states well-tested code is non-negotiable. A module with retry logic, timeouts, and multiple error branches is exactly the kind of code that needs automated tests. The existing `verify_tts.ts` is a manual smoke test against the live API and does not substitute for unit tests. Mock `global.fetch` in vitest and cover: happy path, each retry-eligible status code, non-retryable status, timeout/abort, voice fallback, and exhausted retries.

---

## Issue 2: No tests for TTS caching logic in `extension.ts`

**Problem:** The TTS cache in `extension.ts` (lines 34, 298-329) has meaningful logic that is untested:
- Cache key construction using `voice::text` format (line 298)
- Cache hit with valid TTL returns cached audio (lines 301-307)
- Expired entries are evicted (lines 308-309)
- LRU-style eviction when cache exceeds 50 entries (lines 324-329)
- Missing ElevenLabs key sends `ttsError` message (lines 313-318)
- TTS failure sends `ttsError` with fallback message (lines 335-341)

This logic lives inside `handleWebviewMessage` which is a closure inside `activate()`, making it harder to test in isolation.

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|---|---|---|---|---|
| A) Do nothing | None | Medium -- cache bugs (stale entries served, eviction broken) would degrade UX silently | None | None |
| B) Extract cache logic to a testable class (e.g. `TtsCache`) and add unit tests | Medium (1-2h) | Low | **High** -- TTL, eviction, and key construction all get coverage | Low -- simple class |
| C) Test via integration test of `handleWebviewMessage` with dependency injection | High (2-3h) | Medium -- requires mocking vscode, secrets, fetch | Medium | Higher -- brittle mocks |

**Recommendation: Option B.** Extract the cache into a small, focused class (`TtsCache` or similar) with `get(key)`, `set(key, value)`, and size-based eviction. This follows "engineered enough" -- the cache has enough logic (TTL, max entries, key format) to warrant its own unit. Tests would cover: cache hit, cache miss, TTL expiry, max-entries eviction, and cache key format.

---

## Issue 3: No tests for CSP changes in `DashboardPanel.ts` and `DebugPanel.ts`

**Problem:** Both panel providers had their Content Security Policy strings updated to add `media-src blob: data:` (DashboardPanel.ts:64, DebugPanel.ts:71). CSP is security-critical -- a wrong directive could either block audio playback or open XSS vectors. Neither panel has any tests at all.

Specific untested behavior:
- `getHtml()` injects CSP meta tag with correct directives
- Nonce generation and injection into script tags
- Resource path replacement (`styles.css`, `config.js`)
- `postMessage` forwarding and `onMessage` event emission
- `pendingMessage` replay on `ready` in DebugPanel (lines 31-34)

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|---|---|---|---|---|
| A) Do nothing | None | Medium -- CSP regressions could block TTS or open security holes; message replay bug would silently lose data | None | None |
| B) Add unit tests for `getHtml()` output (CSP string assertions, nonce injection, path replacement) | Low-Medium (1h) | Low | **Medium-High** -- catches CSP regressions, verifies nonce security | Low |
| C) Add full panel tests including message routing and pending replay | High (2-3h) | Medium -- deep vscode mocking | High | Higher |

**Recommendation: Option B.** At minimum, test that `getHtml()` produces a CSP containing the expected directives (`media-src blob: data:`, `script-src` with nonce, etc.) and that nonces are injected into script tags. This is low effort and catches the most dangerous class of regression (broken CSP). The `postMessage`/`onMessage` routing (Option C) is lower priority since the message shapes are typed.

---

## Issue 4: Webview scripts (`debug.html` inline script, `diffPanelScript.ts`) have no test coverage

**Problem:** The inline `<script>` in `debug.html` (lines 380-1080) and `diffPanelScript.ts` (299 lines) contain substantial UI logic -- panel state machine, TTS audio lifecycle (blob URL creation/revocation), voice toggle, checklist completion, quiz interaction, toast notifications. None of this is tested.

Key untested logic:
- `debug.html:967-1002`: base64-to-blob conversion and `Audio` lifecycle (play, onended, onerror, URL.revokeObjectURL)
- `debug.html:1004-1007`: `ttsError` fallback to Web Speech API
- `diffPanelScript.ts:191-237`: identical base64-to-blob audio handling (DRY violation, but that is a code quality concern)
- Panel state transitions (`showPanelSection`) -- actions/error/diff view switching
- `updateActionsState` logic for when to switch views vs. stay on current view

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|---|---|---|---|---|
| A) Do nothing | None | Medium -- audio lifecycle bugs (blob URL leaks, stuck "Loading" state) would require manual testing to catch | None | None |
| B) Extract pure logic (base64-to-blob, state machine, text cleaning) into testable modules and add unit tests | Medium (2h) | Low | **Medium** -- covers the riskiest pure-logic parts without needing DOM | Medium |
| C) Add DOM-based tests (jsdom/happy-dom) for the full webview scripts | High (3-4h) | Medium -- jsdom lacks Audio/Blob/URL.createObjectURL; requires polyfills | Medium-High | High -- fragile DOM tests |

**Recommendation: Option B.** Extract the pure functions (`cleanTextForTTS`, `getReadableText`, base64-to-blob conversion, `shouldRetry` status code classification) into shared utility modules and unit test them. This avoids the complexity of DOM testing while covering the logic most likely to break. The state machine and DOM interactions are better verified through manual testing or a lightweight e2e framework later.

---

## Summary

| Priority | Issue | Recommended action | Effort |
|---|---|---|---|
| **P0** | No tests for `ttsClient.ts` (core PR feature) | Add unit tests with mocked fetch | 1-2h |
| **P1** | No tests for TTS cache logic | Extract to class + unit test | 1-2h |
| **P2** | No tests for CSP in panel providers | Assert on `getHtml()` output | 1h |
| **P3** | No tests for webview script logic | Extract pure functions + unit test | 2h |

The project preferences state well-tested code is non-negotiable. This PR adds ~400 lines of new logic (retry handling, caching, audio lifecycle, CSP changes) with zero new tests. At minimum, **Issue 1 (ttsClient.ts)** should be addressed before merging -- it is the core deliverable of the PR and has multiple non-trivial code paths (retries, timeouts, voice fallback) that are easy to get wrong and hard to catch manually.
