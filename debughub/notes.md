# DebugHub

Telemetry & diagnostics dashboard for the 0xTimberzx DApp ecosystem
(0xFaucet, BlockpotDAO, MessageBoard, and future DApps).

---

## What it does

DebugHub gives every DApp a shared, lightweight way to record what
happened during a session — wallet connections, checkpoints (pass/fail),
errors, performance timings, and security checks — and view it all in
one wallet-gated dashboard.

Think of it as a personal, minimal version of Sentry/Datadog built for
testnet Web3 development on mobile.

---

## 0xtimberzx Architecture

```
0xtimberzx.github.io/blockpotdao/
├── components/          empty folder
├── index.html/    BlockpotDao / Timer Game Hmtl-React
├── app.js/        BlockpotDao javascript 
├── style.css/     BlockpotDao style and design
└── contracts/

0xtimberzx.github.io/MyDapp/
├── faucet/          0xFaucet (vanilla JS)
├── messageboard/    HelloWorld / StringCompiler message board (vanilla JS)
└── debughub/
    ├── index.html    dashboard (wallet-gated)
    ├── style.css
    ├── gate.js       owner wallet check
    ├── app.js        dashboard logic (tabs, rendering, export)
    └── sdk/
        └── debugger.js  SDK loaded by every DApp via script tag
```

Every DApp loads the SDK from the same URL:

```html
<script>window.DEBUGHUB_CONFIG = { appName: "Faucet" };</script>
<script src="https://0xtimberzx.github.io/MyDapp/debughub/sdk/debugger.js"></script>
```

A fallback stub is included after the SDK script tag in every
integrated DApp. If the SDK fails to load for any reason (wrong path,
network issue, cache), the stub provides no-op versions of every
DebugHub function so the host DApp never breaks due to DebugHub. This
has already saved one live outage during development.

---

## Storage model — what this means for you

- All data lives in localStorage, scoped to browser + device + domain.
  It does not sync across devices and does not use a backend.
- Each DApp writes to its own isolated key: Faucet_sessions,
  BlockpotDAO_sessions, MessageBoard_sessions, etc, capped at 200
  events per DApp, base64-encoded.
- The wallet field on each event distinguishes which wallet triggered
  it, even if multiple wallets are used on the same device.
- Different device = different data, always. If you test on your
  tablet with a second wallet, that data exists only on the tablet.
  The iPhone dashboard cannot see it. Use the Export JSON button on the
  device where the issue occurred to bring that data into a shared
  conversation.

### Wallet gate

The dashboard is gated to a single owner address (hardcoded in
gate.js). This is a frontend-only gate, it controls what the dashboard
displays, not who can technically read localStorage via DevTools. The
base64 encoding is a casual-snooping deterrent, not cryptographic
security. This is intentional and appropriate for a personal debugging
tool; it would not be sufficient for an admin panel guarding funds or
privileged on-chain actions.

---

## SDK API (debugger.js)

```js
DebugHub.startSession()                  // called on wallet connect
DebugHub.endSession()                    // called on disconnect/switch/unload
DebugHub.logCheckpoint(name, status)     // status: "pass" | "fail"
DebugHub.logError(functionName, error)   // captures code + message
DebugHub.logPerf(label, durationMs)      // single-call timing
DebugHub.logSecurity(name, status)       // chain/contract checks etc.
```

- Session IDs follow the format app-mmss-walletprefix
  (e.g. faucet-1130-0xAB1).
- A new wallet connection or account switch always starts a new
  session and ends the previous one.
- The SDK auto-detects wallet address and chain ID, DApps don't need
  to pass these manually.
- Silent by default. Logs a ready message or a warning to console only
  if localStorage is unavailable.

### Standard checkpoint pattern (3-stage)

Every transaction-triggering function follows this pattern, so a stuck
or hung transaction is always visible in the timeline even with zero
errors logged:

```
logCheckpoint("X Requested", "pass")   fires right before wallet popup
  await contract.method(...)            this can hang here
logCheckpoint("X Submitted", "pass")   fires once tx is broadcast
  await tx.wait()
logCheckpoint("X Confirmed", "pass")   fires once tx is mined
```

If something hangs after wallet confirmation, the Sessions tab's last
checkpoint will read "X Requested", and the time gap to the next event
tells you exactly how long it was stuck and at which step.

This pattern is applied to: Claim (Faucet), Stake / Unstake / Claim
Rewards / Upgrade / Push Timer (BlockpotDAO), and
Approve / Compile / Publish (MessageBoard).

---

## Dashboard tabs

| Tab | Shows |
|---|---|
| Sessions | One card per session: ID, wallet, last checkpoint, status (active/pass/fail), last activity time |
| Checkpoints | Vertical timeline of all checkpoint and security events, newest first, with pass/fail lamps |
| Errors | Deduped error groups with a human-readable explanation, repeat count, and collapsible raw JSON (copy-to-clipboard) |
| Wallets | Per-wallet connection count, error count, and success-rate bar |

Export JSON (top of dashboard) downloads all events for the currently
selected DApp, use this to share a debugging session across devices or
with an AI assistant.

---

## Known recurring issues and fixes applied

These three issues have each appeared across multiple DApps, treat
them as a standing checklist for any new contract-write function:

1. Gas fee buffer — always pass maxFeePerGas and maxPriorityFeePerGas
   from getFeeData() with a 130% buffer, alongside the existing 50%
   gasLimit buffer. Missing this causes "max fee per gas less than
   block base fee" (-32000) on Arbitrum Sepolia. Found and fixed in
   Faucet, BlockpotDAO, and MessageBoard.

2. Explicit nonce — always pass
   nonce: await provider.getTransactionCount(address, "pending")
   on every write call. Without it, rapid sequential transactions can
   desync from ethers' cached nonce and throw NONCE_EXPIRED ("nonce too
   low"). Found and fixed in MessageBoard and BlockpotDAO.

3. "Requested" checkpoint — see the 3-stage pattern above. Added after
   a publish transaction hung for 30+ seconds with zero error logged,
   because the only checkpoints existed after the hanging await.

When building a new DApp or new contract-write function, apply all
three from the start.

---

## Adding a new DApp to the ecosystem

1. Add the SDK script tag and fallback stub (copy from any integrated
   DApp's head section)
2. Set DEBUGHUB_CONFIG = { appName: "YourAppName" }
3. Call DebugHub.startSession() on wallet connect, and
   DebugHub.logCheckpoint("Wallet Connected", "pass") right after
4. Add logSecurity("Chain Check", ...) around chain switching and
   validation
5. For every write function, apply the 3-stage checkpoint pattern plus
   gas buffer plus explicit nonce
6. Add the new app to the APPS array in debughub/app.js
7. Add any new error codes encountered to ERROR_EXPLANATIONS in
   debughub/app.js

---

## Maintenance notes

- /debughub-test/ is a sandbox using appName: "TestApp", safe to
  delete once a new SDK change has been verified there, or keep as a
  permanent test harness for future SDK updates.
- ERROR_EXPLANATIONS (in app.js) is a flat code-to-message lookup. Add
  new entries as new error codes are encountered during testing, this
  is the "catalog of responses" and should grow over time.

