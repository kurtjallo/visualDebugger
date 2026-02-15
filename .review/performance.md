# Performance Review -- PR #20: Improve TTS reliability and speed

## Issue 1: Unbounded In-Memory TTS Cache Stores Large Base64 Blobs

**Problem:** The TTS cache in `extension/src/extension.ts:34` stores base64-encoded MP3 audio as strings in a `Map`. Each cached entry holds the full base64 audio payload (a typical 10-second MP3 at 32kbps is ~40KB raw, ~53KB base64). With `TTS_CACHE_MAX_ENTRIES = 50` (line 18), worst case is ~2.6MB of base64 strings held in the extension host's memory for the full TTL window (10 minutes, line 17). This memory is never reclaimed until entries expire or the oldest is evicted.

Additionally, the eviction at lines 324-328 only removes the single oldest entry when the cache exceeds 50, meaning the cache can temporarily hold 51 entries before dropping back to 50. More critically, the eviction is insertion-order based (`Map.keys().next()`), not LRU -- a frequently-used entry inserted early will be evicted before a rarely-used entry inserted later.

**Options:**

| Option | Description | Effort | Risk | Impact | Maintenance |
|--------|-------------|--------|------|--------|-------------|
| A. Do nothing | 50 entries * ~53KB = ~2.6MB ceiling. Acceptable for a VS Code extension with a single user. | None | None | None | None |
| B. Add periodic TTL sweep | Run a `setInterval` every 60s to prune expired entries, preventing stale memory from lingering for the full 10-min window. Keep max-entries cap. | Low | Low | Low-medium -- reclaims memory sooner in sessions with bursts of TTS use followed by inactivity | Low |
| C. Switch to LRU eviction + lower cap | Use a small LRU cache (e.g., `Map` with move-to-end on hit) with a cap of 20. Evict least-recently-used rather than oldest-inserted. | Medium | Low | Medium -- better cache hit rate, tighter memory bound (~1MB) | Low |

**Recommendation:** **Option A (do nothing).** 2.6MB ceiling is negligible for an extension host process. The TTL + max-entries cap is "engineered enough." LRU would be a premature optimization for a single-user VS Code extension where TTS requests are infrequent. If usage patterns change (e.g., auto-TTS on every error), revisit with Option C.

---

## Issue 2: Base64 Encoding Doubles Audio Size in Transit

**Problem:** In `extension/src/ttsClient.ts:70`, the raw `ArrayBuffer` from ElevenLabs is converted to a base64 string via `Buffer.from(arrayBuffer).toString("base64")`. This base64 string is then:
1. Stored in the TTS cache (extension host memory)
2. Sent via `postMessage` to the webview (`extension/src/extension.ts:331`)
3. Decoded back to binary in the webview (`extension/src/webview/debug.html:969-972`) via `atob()` + `Uint8Array` + `Blob`

Base64 encoding inflates data by ~33%. The same double-encoding + decoding pipeline exists in `diffPanelScript.ts:194-197`. So every TTS response is: raw binary -> base64 string (33% larger) -> postMessage serialization -> atob() -> Uint8Array -> Blob -> Audio.

**Options:**

| Option | Description | Effort | Risk | Impact | Maintenance |
|--------|-------------|--------|------|--------|-------------|
| A. Do nothing | The 33% overhead on a ~40KB MP3 is ~13KB extra per request. VS Code's `postMessage` only supports JSON-serializable data, so base64 is the standard approach. | None | None | None | None |
| B. Store `Buffer` in cache, base64-encode only on send | Cache the raw `Buffer` instead of the base64 string, reducing cache memory by ~25%. Encode to base64 only when sending to webview. | Low | Low | Low -- saves ~650KB at max cache capacity | Low |
| C. Stream audio via local HTTP server | Spin up a local HTTP server, serve audio files directly, and pass the URL to the webview `<audio>` element. Avoids base64 entirely. | High | Medium -- CSP config, port conflicts, cleanup on deactivate | Medium -- eliminates base64 overhead entirely | Medium |

**Recommendation:** **Option A (do nothing).** The `postMessage` API requires JSON-serializable payloads, making base64 the idiomatic approach for VS Code webview extensions. The 13KB overhead per request is imperceptible. Option B is a micro-optimization with minimal benefit. Option C is over-engineering for the use case.

---

## Issue 3: No Deduplication of Concurrent TTS Requests for Same Text

**Problem:** In `extension/src/extension.ts:294-342`, when a user clicks "Read Aloud," the handler checks the cache and, on a miss, fires `fetchTtsAudio`. However, if the user rapidly clicks the button twice (or switches voices back and forth), two concurrent API calls can be made for the same (or similar) text because there is no in-flight request tracking. Each call hits ElevenLabs (with potential retries at `ttsClient.ts:30`), and both results get cached (the second overwriting the first for the same key).

This wastes API quota (ElevenLabs bills per character) and can cause race conditions where two audio responses arrive and `playAudio` messages are sent back-to-back, potentially overlapping playback.

**Options:**

| Option | Description | Effort | Risk | Impact | Maintenance |
|--------|-------------|--------|------|--------|-------------|
| A. Do nothing | Users are unlikely to double-click rapidly. The webview `stopAudio()` call on new playback mitigates overlapping audio. Wasted API calls are rare. | None | None | None | None |
| B. Track in-flight requests with a `Map<string, Promise>` | Before calling `fetchTtsAudio`, check if a promise for the same cache key is already in-flight. If so, await it instead of making a new request. Remove the entry when the promise settles. | Low | Low | Medium -- prevents duplicate API calls, saves ElevenLabs quota | Low |
| C. Debounce / disable the TTS button in extension host | Ignore `requestTts` messages if one is already being processed (simple boolean flag). | Very low | Low | Low-medium -- prevents concurrent requests but doesn't deduplicate across voice switches | Very low |

**Recommendation:** **Option B.** This is a straightforward in-flight deduplication pattern. It directly prevents wasted API calls (real cost), aligns with "handle edge cases" preference, and the implementation is ~10 lines. A `Map<string, Promise<string>>` alongside the cache map is explicit and easy to reason about.

---

## Issue 4: Retry Delay Strategy in TTS Client Is Linear, Not Exponential

**Problem:** In `extension/src/ttsClient.ts:62-63` and `79-80`, the retry delay is `300 * (attempt + 1)` -- yielding delays of 300ms, 600ms. For transient 429 (rate limit) errors, this linear backoff may be too aggressive. ElevenLabs rate limiting documentation recommends exponential backoff. With only `MAX_TTS_RETRIES = 2` (3 total attempts), the total wall-clock time for a fully-failed request is: 12s timeout + 300ms + 12s timeout + 600ms + 12s timeout = ~37 seconds, which is a long user-facing wait.

The `TTS_REQUEST_TIMEOUT_MS = 12000` (line 10) is also on the high side. ElevenLabs `eleven_turbo_v2_5` typically responds within 1-3 seconds. A 12-second timeout means the user waits a very long time on a stalled connection before any retry kicks in.

**Options:**

| Option | Description | Effort | Risk | Impact | Maintenance |
|--------|-------------|--------|------|--------|-------------|
| A. Do nothing | Linear backoff with 2 retries is functional. The 12s timeout is a safe upper bound. Most requests succeed on the first attempt. | None | None | None | None |
| B. Switch to exponential backoff + lower timeout | Use `300 * 2^attempt` (300ms, 600ms) -- actually similar values, but for more retries it scales better. Lower timeout to 8s. Total worst case drops from ~37s to ~26s. | Very low | Low | Low-medium -- faster failure detection, slightly better UX on timeout | Very low |
| C. Add a circuit breaker | After N consecutive failures, stop retrying for a cooldown period (e.g., 30s). Prevents hammering ElevenLabs during an outage. | Medium | Low | Medium -- protects API quota during outages | Low |

**Recommendation:** **Option A (do nothing).** With only 2 retries, the difference between linear and exponential backoff is negligible (300ms vs 300ms for first delay, 600ms vs 600ms for second). The current strategy is fine. The 12s timeout is conservative but safe -- lowering it risks false timeouts on slow connections. A circuit breaker would be over-engineering for a tool that processes TTS requests one at a time. Revisit if retry count increases.
