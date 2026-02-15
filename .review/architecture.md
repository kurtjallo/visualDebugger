# Architecture Review -- PR #20: TTS Reliability & Caching

**Reviewer:** arch-reviewer
**Date:** 2026-02-15
**Scope:** System design, component boundaries, dependency graph, data flow, scaling, security

---

## Summary

This PR moves TTS audio generation from in-webview API calls to extension-host-proxied calls with retry logic, caching, voice selection, and blob-URL playback. It also adds a standalone verification script and build/launch infrastructure. The overall direction is sound -- proxying external API calls through the extension host is the correct architectural pattern for VS Code extensions.

---

## Issue 1: TTS Cache Lives as an Unbounded In-Memory Map Inside `activate()`

**Files:** `extension/src/extension.ts:34`, `extension/src/extension.ts:294-342`

**Problem:** The TTS cache is a plain `Map` local variable inside `activate()`. While there is an `TTS_CACHE_MAX_ENTRIES = 50` cap and a TTL of 10 minutes, the eviction strategy is naive: when the map exceeds 50 entries, it deletes `ttsCache.keys().next().value` -- i.e. the first-inserted key, not the least-recently-used or oldest-by-TTL key. Because `Map` preserves insertion order (not access order), a frequently-used entry that was inserted early will be evicted before a stale entry inserted later. Also, expired entries are only cleaned up on cache hit, not proactively, meaning the map can hold up to 50 expired entries that waste memory.

More importantly, each cached entry stores a full base64-encoded MP3. At ~32kbps and typical explanation lengths (10-30 seconds of audio), each entry is roughly 40-120KB. 50 entries could consume ~2-6MB in the extension host process. This is acceptable for now, but there is no upper bound on the text length sent to TTS, so a pathological explanation could produce a much larger audio buffer.

**Options:**

| # | Option | Effort | Risk | Impact | Maintenance |
|---|--------|--------|------|--------|-------------|
| 1 | **Do nothing** | None | Low -- 50 entries is unlikely to cause issues in practice | None | Low |
| 2 | **Extract cache to a dedicated class with LRU eviction and proactive TTL sweep** | Medium (new file, tests) | Low | Correct eviction semantics, bounded memory, testable in isolation | Medium -- new class to maintain |
| 3 | **Cap text input length before sending to TTS API** | Low (one guard) | Low | Prevents pathological large audio buffers | Low |

**Recommendation:** Option 3 now (low effort, addresses the edge case), Option 2 later if TTS usage grows. Fits the "handle edge cases" and "engineered enough" preferences -- the naive eviction is acceptable at current scale but the missing input guard is a real edge case gap.

---

## Issue 2: Duplicated Audio Playback / TTS Plumbing Across Two Webview Scripts

**Files:** `extension/src/webview/debug.html:966-1002` (inline `<script>`), `extension/src/webview/diffPanelScript.ts:191-237`

**Problem:** The base64-to-blob conversion, `Audio` construction, `onended`/`onerror`/`play().catch()` error handlers, `stopAudio()`, voice toggle logic, `speakWithWebSpeech()` fallback, and `ttsError` handling are all duplicated nearly verbatim between:
- The inline `<script>` in `debug.html` (the main debug panel)
- `diffPanelScript.ts` (the diff review panel)

This violates DRY significantly. Any bug fix or behavioral change to TTS playback must be applied in both places, and they can easily drift (e.g., `diffPanelScript.ts` uses emoji in button text like `"🔊 Read Aloud"` while `debug.html` uses plain text `"Read Aloud"`).

**Options:**

| # | Option | Effort | Risk | Impact | Maintenance |
|---|--------|--------|------|--------|-------------|
| 1 | **Do nothing** | None | Medium -- drift between the two copies causes bugs | None | High -- every TTS change requires two edits |
| 2 | **Extract shared TTS playback logic into a `ttsPlayback.ts` module imported by both webview scripts** | Medium | Low -- straightforward refactor | Eliminates ~80 lines of duplication, single source of truth | Low |
| 3 | **Move debug.html's inline script to a compiled TS file (like diffPanelScript.ts) and share TTS code** | Medium-High | Low-Medium -- requires build pipeline change for debug panel | Full consistency: both panels compile from TS, share modules | Low |

**Recommendation:** Option 2 is the minimum viable fix and directly addresses the DRY violation. Option 3 is the ideal end state (the inline `<script>` in `debug.html` is already ~700 lines and should be a compiled module), but is a larger refactor that can be done incrementally. Flag this for a follow-up PR.

---

## Issue 3: CSP Allows `connect-src https://api.elevenlabs.io` in Both Panels Despite TTS Now Being Proxied

**Files:** `extension/src/panels/DashboardPanel.ts:64`, `extension/src/panels/DebugPanel.ts:71`

**Problem:** Both panel CSP headers include `connect-src https://api.elevenlabs.io blob:`. However, the PR's main architectural change is to proxy TTS calls through the extension host (`fetchTtsAudio` in `ttsClient.ts` runs in Node, not in the webview). The webview no longer needs to make direct network requests to ElevenLabs -- it only receives base64 audio via `postMessage` and converts it to a blob URL.

Keeping `connect-src https://api.elevenlabs.io` in the CSP is misleading (suggests the webview calls the API directly) and unnecessarily widens the attack surface. If an XSS vulnerability were found in the webview, the attacker could exfiltrate data to `api.elevenlabs.io` or use the ElevenLabs API key (which no longer needs to be in the webview).

Additionally, `DashboardPanel.ts:64` includes `connect-src https://api.elevenlabs.io blob:` and `media-src blob: data:`, but the dashboard panel does not appear to play audio at all -- it shows bug records. This is unnecessary CSP widening.

**Options:**

| # | Option | Effort | Risk | Impact | Maintenance |
|---|--------|--------|------|--------|-------------|
| 1 | **Do nothing** | None | Low-Medium -- wider CSP than needed, but no active exploit | None | Low |
| 2 | **Remove `connect-src https://api.elevenlabs.io` from both panels; remove `media-src blob: data:` from DashboardPanel** | Low (2 line changes) | Very low -- only removing permissions | Tighter security posture, CSP reflects actual data flow | Low |
| 3 | **Additionally remove `'unsafe-eval'` from script-src** | Medium -- may require refactoring eval usage | Low | Further CSP hardening | Low |

**Recommendation:** Option 2 immediately. It is a trivial fix that aligns the security boundary with the new architecture. The `connect-src` permission for ElevenLabs is a leftover from the pre-proxy design and should be removed. Option 3 is worth investigating but is out of scope for this PR.

---

## Issue 4: `verify_tts.ts` Duplicates `.env` Parsing Logic from `envLoader.ts`

**Files:** `extension/src/scripts/verify_tts.ts:7-29`, `extension/src/envLoader.ts`

**Problem:** The new `verify_tts.ts` standalone script contains a `loadEnvManual()` function that reimplements `.env` file parsing. The codebase already has `envLoader.ts` which does the same thing. The script's comment says "without external dependencies or vscode module", but `envLoader.ts` also does not depend on the `vscode` module -- it uses only Node builtins (`fs`, `path`).

This creates a maintenance hazard: if the `.env` parsing format changes (e.g., supporting multi-line values, variable interpolation, or comments after values), the fix must be applied in both places.

**Options:**

| # | Option | Effort | Risk | Impact | Maintenance |
|---|--------|--------|------|--------|-------------|
| 1 | **Do nothing** | None | Low -- the script is rarely run | None | Low (but code smell) |
| 2 | **Import `loadEnv` from `envLoader.ts` in `verify_tts.ts`** | Low (replace 23 lines with 1 import) | Very low | Eliminates duplication, single source of truth for .env parsing | Low |
| 3 | **Remove `verify_tts.ts` entirely -- replace with a shell one-liner or npm script** | Low-Medium | Low | Less code to maintain | Low |

**Recommendation:** Option 2. It is a trivial change that removes ~23 lines of duplicated logic. The `envLoader` module has no VS Code dependencies so it works fine in a standalone script context. This directly addresses the DRY preference.

---

## Non-Issues (Reviewed, No Action Needed)

- **TTS retry logic in `ttsClient.ts`:** Well-structured with exponential backoff, abort controller timeouts, and clear retry-eligibility checks. The `shouldRetry` status codes are reasonable.
- **Voice ID hardcoding in `ttsClient.ts:3-6`:** Acceptable for a hackathon project. If this becomes a product, voice IDs should come from configuration, but for now the hardcoded approach is explicit and simple.
- **`launch.json` at repo root instead of `.vscode/`:** This is a mono-repo layout choice. The file works because VS Code resolves `${workspaceFolder}` relative to the opened folder.
- **`.gitignore` additions:** Correctly exclude generated test artifacts and `.env` files.
- **Build task in `.vscode/tasks.json`:** Straightforward, no concerns.
