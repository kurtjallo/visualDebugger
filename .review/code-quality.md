# Code Quality Review -- PR #20: TTS Reliability & Caching

## Issue 1: Massive TTS/audio duplication across webview files

**Problem:** The entire TTS playback stack -- base64-to-blob conversion, `Audio` lifecycle (`onended`/`onerror`/`play().catch()`), `stopAudio()`, `speakWithWebSpeech()`, `updateTtsStatus()`, voice toggle handlers, and `stripHtml()`/`cleanTextForTTS()` -- is copy-pasted across two files:

- `extension/src/webview/debug.html:831-1007` (inline `<script>`, ~180 lines)
- `extension/src/webview/diffPanelScript.ts:36-286` (~250 lines, typed version)

These are functionally identical with only cosmetic differences (emoji in button labels in `diffPanelScript.ts`, `var` vs `let`/`const`). Any bug fix or behavior change must be applied in both places. The voice toggle wiring alone is duplicated verbatim (~30 lines each).

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|--------|--------|------|--------|-------------|
| A. Do nothing | None | Low now, high later | None | Every TTS change requires two edits; drift is inevitable |
| B. Extract a shared `ttsPlayback.ts` module imported by both webview scripts | Medium (1-2 hrs) | Low -- internal refactor, no API change | High -- single source of truth for all audio logic | Drops to one edit site |
| C. Move debug.html's inline script to a compiled `.ts` file (like diffPanelScript.ts already is), then extract shared code | Medium-high (2-3 hrs) | Medium -- touches HTML build pipeline | Highest -- eliminates inline JS too | One edit site + typed |

**Recommendation:** **Option C** long-term, **Option B** as a pragmatic first step. The inline `<script>` in `debug.html` is already ~700 lines of untyped JavaScript doing the same things as the typed `diffPanelScript.ts`. Extracting the shared TTS helpers into a module is the minimum necessary to prevent drift. This directly serves DRY and "handle edge cases" (a bug fixed in one place but not the other is the classic drift failure).

---

## Issue 2: Code context extraction repeated 4 times in extension.ts

**Problem:** The same 6-line pattern for extracting `codeContext` (a window of +/-10 lines around an error) is duplicated four times in `extension/src/extension.ts`:

1. Lines 359-365 (`debugPanel.onMessage` handler)
2. Lines 581-587 (`analyzeCurrentFile` command, diagnostic branch)
3. Lines 611-617 (`analyzeCurrentFile` command, manual input branch)
4. Lines 637-642 (`explainCodeLensError` command)

Each instance computes `start = Math.max(0, line - 11)`, `end = Math.min(lines.length, line + 10)`, then `slice/map/join`. A typo in any one (e.g., changing the window size) would silently diverge behavior.

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|--------|--------|------|--------|-------------|
| A. Do nothing | None | Medium -- divergence on any future edit | None | 4 sites to update for any context-window change |
| B. Extract a `getCodeContext(text: string, line: number): string` helper | Low (15 min) | Very low -- pure function | Medium -- single definition, testable | One edit site, easy to unit test |
| C. Extract + make window size configurable | Low-medium (30 min) | Low | Medium-high -- reusable | Slightly more flexible but arguably premature |

**Recommendation:** **Option B**. This is a textbook extract-function refactor -- pure function, no side effects, trivially testable. Matches "DRY" and "explicit over clever" (a named function is clearer than 6 repeated lines).

---

## Issue 3: Panel providers (DebugPanel / DashboardPanel) duplicate boilerplate

**Problem:** `DebugPanel.ts` and `DashboardPanel.ts` share:

- Identical `getNonce()` function (lines 78-85 / 71-78) -- character-for-character copy
- Nearly identical `getHtml()` methods (read HTML from `dist/`, replace stylesheet href, add nonce to `<script>` tags, inject CSP `<meta>`)
- Nearly identical CSP strings (only difference: DashboardPanel adds `https://cdn.jsdelivr.net` to `script-src`)
- `configUri` is computed but never used in `DashboardPanel.ts:46` (dead code)

The CSP strings are particularly concerning: a security-relevant policy is maintained in two places with subtle differences that are easy to miss.

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|--------|--------|------|--------|-------------|
| A. Do nothing | None | Medium -- CSP drift is a security risk | None | Two places to audit for CSP changes |
| B. Extract `getNonce()` and a `buildCsp(webview, nonce, extras?)` helper into a shared `panels/utils.ts` | Low (20 min) | Very low | Medium -- CSP defined once with clear extension points | One CSP definition to audit |
| C. Create a `BaseWebviewPanel` base class with shared `getHtml` logic | Medium (1 hr) | Low-medium -- class hierarchy can be over-engineering for 2 panels | High -- all boilerplate centralized | One implementation to maintain |

**Recommendation:** **Option B**. A shared utility file for `getNonce()` and CSP generation is the right level of abstraction for two panels. A base class (Option C) is arguably over-engineered for just two subclasses. Also fix the dead `configUri` in DashboardPanel. Matches "engineered enough" and "DRY".

---

## Issue 4: `loadEnvManual` in verify_tts.ts duplicates `envLoader.ts`

**Problem:** `extension/src/scripts/verify_tts.ts:7-29` contains a hand-rolled `loadEnvManual()` function that is a simplified copy of `envLoader.ts:loadIntoMap()`. The stated reason (avoiding `vscode` import in a standalone script) is valid, but the parsing logic is duplicated. The same duplication exists in `verify_gemini_standalone.ts`.

Additionally, `verify_tts.ts` writes test MP3 files to `extension/src/scripts/` (gitignored, but pollutes the source tree).

**Options:**

| Option | Effort | Risk | Impact | Maintenance |
|--------|--------|------|--------|-------------|
| A. Do nothing | None | Low -- scripts are rarely changed | None | Two .env parsers to keep in sync |
| B. Extract the core `.env` parsing into a `parseEnvFile(filePath)` function (no `vscode` dependency), used by both `envLoader.ts` and the scripts | Low (20 min) | Very low -- pure function extraction | Medium -- single parser | One parser to maintain |
| C. Delete the standalone scripts and use VS Code tasks/launch configs for testing | Medium (30 min) | Low | Low -- just changes DX | Fewer files to maintain |

**Recommendation:** **Option B**. Extract the parsing core into a `parseEnvFile(path: string): Map<string, string>` that has no `vscode` dependency. Both `envLoader.ts` (which adds workspace/parent resolution) and the standalone scripts can import it. This is "DRY" applied to a parsing routine that already has subtle differences (e.g., error handling: `envLoader.ts` catches and warns, `verify_tts.ts` silently returns empty).

---

## Additional Observations (not top-4, but worth noting)

- **`configUri` dead code** in `DashboardPanel.ts:46`: computed but never used. Should be removed.
- **Blob URL leak on `stopAudio()`**: When `stopAudio()` is called in both webview scripts, the current blob URL is not revoked -- only `onended`/`onerror`/`catch` paths revoke it. If the user clicks "Stop" mid-play, the blob URL leaks. Minor memory issue but worth a one-line fix.
- **`connect-src https://api.elevenlabs.io` in CSP**: TTS calls now go through the extension host (not the webview), so this CSP directive is vestigial. Removing it tightens the security surface.
- **Mock data in production HTML** (`debug.html:1018-1064`): ~50 lines of `MOCK_ERROR_DATA` / `MOCK_DIFF_DATA` are shipped in the production HTML, guarded only by `if (!vscode)`. These inflate the bundle and serve no runtime purpose in the extension.
