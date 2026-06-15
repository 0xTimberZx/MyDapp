# 🌐 MessageBoard (HelloWorld) — Decentralized Message Board

A fully on-chain decentralized message board built on Arbitrum Sepolia
testnet. Users connect their wallet, compile string segments into a final
message using DAPP tokens, publish it permanently to the blockchain,
and view the complete transaction history — all from a mobile browser.

---

## 🔗 Live Demo

👉 [Launch DApp](https://0xtimberzx.github.io/MyDapp/)

---

## ✨ Features

- Connect Wallet — Supports MetaMask and Brave Wallet
- ETH Balance — Live native token balance with manual refresh
- DAPP Token Balance — Live DAPP token balance display
- Token Approval — One-tap approval for StringCompiler spending
- String Compiler — Build messages segment by segment (80 chars max)
- Free First Compile — First segment is always free
- Token Cost Preview — See exact DAPP cost before publishing
- Publish Message — Charges DAPP tokens and pushes final message on-chain
- Read Message — Fetches current on-chain message after connect
- Transaction History — All past updates with timestamps and costs
- Filter by Wallet — Search history by any full wallet address
- Privacy Protected — All addresses shown in abbreviated form only
- Disconnect — Cleanly resets all wallet and compiler state
- DebugHub Integration — Sessions, checkpoints, and errors logged to the shared ecosystem dashboard

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.20 |
| Blockchain | Arbitrum Sepolia (Chain ID: 421614) |
| Token Standard | ERC-20 (DAPP Token) |
| Frontend | HTML, CSS, JavaScript |
| Font | Inter (Google Fonts) |
| Wallet Connection | ethers.js v5.7.2 |
| Telemetry | DebugHub SDK (debugger.js) |
| Hosting | GitHub Pages |
| Verification | Sourcify (Exact Match) |
| Code Editor | Buffer Editor (iPhone) |
| Contract Deployment | Remix IDE |

---

## 📜 Smart Contracts

### HelloWorld
| Detail | Value |
|---|---|
| Address | 0x4c8ded518b3de7d839d3a2756773b8028c5c74aa |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x4c8ded518b3de7d839d3a2756773b8028c5c74aa) |
| Blockscout | [View on Blockscout](https://arbitrum-sepolia.blockscout.com/address/0x4c8ded518b3de7d839d3a2756773b8028c5c74aa) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x4c8ded518b3de7d839d3a2756773b8028c5c74aa) |

### DAPP Token (ERC-20)
| Detail | Value |
|---|---|
| Name | DApp Token |
| Symbol | DAPP |
| Initial Supply | 1,000,000 DAPP |
| Address | 0x3d0cB8929c22F93A9dd33921E6f43C1621FCfC04 |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x3d0cB8929c22F93A9dd33921E6f43C1621FCfC04) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x3d0cB8929c22F93A9dd33921E6f43C1621FCfC04) |

### StringCompiler
| Detail | Value |
|---|---|
| Address | 0x881A836D3d2cF955d9Bef9438b9e2bd610bcdAEe |
| Price Per Compile | 10 DAPP (first segment free) |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x881A836D3d2cF955d9Bef9438b9e2bd610bcdAEe) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x881A836D3d2cF955d9Bef9438b9e2bd610bcdAEe) |

### Faucet (FaucetVault)
| Detail | Value |
|---|---|
| Address | 0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF |
| Eth Send per Claim | 0.0025 ETH (every 12 hours) |
| Compiler | solc 0.8.20, Optimizer OFF |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF) |

---

## 🔄 How The String Compiler Works

```
User approves DAPP tokens for StringCompiler
        ↓
Types first segment (max 80 chars) → Compile
        → FREE — saved on-chain
        ↓
Types additional segments → Compile
        → 10 DAPP charged per segment at publish
        ↓
Reviews compiled preview and token cost
        ↓
Taps Publish Message
        → Total DAPP cost charged at once
        → Combined string pushed to HelloWorld
        → Compiler state resets automatically
        ↓
Message appears on-chain permanently
History updates with cost and sender
```

---

## ⛽ Compile Pricing

| Segments | DAPP Cost |
|---|---|
| 1 | 0 DAPP (free) |
| 2 | 10 DAPP |
| 3 | 20 DAPP |
| 4 | 30 DAPP |
| N | (N-1) × 10 DAPP |

---

## 📊 Contract Architecture

```
User Wallet
   ↓ approve()
DAppToken (DAPP ERC-20)
   ↓ allowance granted to StringCompiler
StringCompiler
   ↑ compileString() — free, stores segments on-chain
   ↑ publishMessage() — charges DAPP, pushes to HelloWorld
   ↓ updateMessage() — restricted by onlyCompiler modifier
HelloWorld
   ↓ emits MessageUpdated event

Transaction History displayed in DApp
```

---

## 🔒 Security Features

- **onlyCompiler modifier** — HelloWorld only accepts updates from StringCompiler
- **immutable owner** — Owner set once at deployment, cannot be changed
- **Zero address check** — Prevents setting compiler to invalid address
- **CompilerUpdated event** — Logs every compiler change on-chain
- **XSS Protection** — All user messages sanitized before display
- **Input Validation** — Segments limited to 80 characters
- **Wallet Checks** — All functions verify wallet connection before executing
- **Network Switching** — Auto-switches to Arbitrum Sepolia on connect, logged as a DebugHub security check
- **msg.sender** — Used instead of tx.origin to prevent phishing attacks
- **Privacy** — Wallet addresses displayed in abbreviated form only

---

## ⛽ Gas & Transaction Handling

- Automatically estimates gas for every transaction, with a 50% buffer on `gasLimit`
- Fetches current network fee data via `getFeeData()`, with a **130% buffer** on `maxFeePerGas` and `maxPriorityFeePerGas` (prevents "max fee per gas less than block base fee" on Arbitrum Sepolia)
- Explicit nonce via `getTransactionCount(address, "pending")` on every write, preventing `NONCE_EXPIRED` after rapid sequential transactions
- Compatible with MetaMask and Brave Wallet fee structures

---

## 🛰️ DebugHub Integration

This DApp reports telemetry to **DebugHub**, the shared diagnostics
dashboard for the 0xTimberzx ecosystem.

- `appName: "MessageBoard"` — events stored under `MessageBoard_sessions`
- Session starts on wallet connect, ends on disconnect / account switch / page unload
- **Checkpoints logged:** Wallet Connected, Approve (Requested/Submitted/Confirmed), Compile (Requested/Submitted/Confirmed), Publish (Requested/Submitted/Confirmed)
- **Security checks logged:** Chain Check, Contract Check
- **Performance timings logged:** gas estimation for approve, compile, and publish
- If the SDK fails to load, a no-op fallback stub keeps MessageBoard fully functional — DebugHub never breaks the app

View live diagnostics at:
👉 [DebugHub Dashboard](https://0xtimberzx.github.io/MyDapp/debughub/)

---

## 📱 Device Compatibility

| Device | Browser | Status |
|---|---|---|
| iPhone | MetaMask Browser | ✅ Fully Working |
| Tablet | Brave Browser | ✅ Fully Working |

---

## 🚀 How To Use

1. Open the [Live DApp](https://0xtimberzx.github.io/MyDapp/) in MetaMask or Brave browser
2. Tap **Connect Wallet** and approve the connection
3. Tap **Approve DAPP Tokens** to enable the compiler
4. Type your first segment and tap **Compile Segment** — free!
5. Add more segments as needed — cost shown in preview
6. Review the compiled string and total DAPP cost
7. Tap **Publish to Blockchain** and confirm in wallet
8. Watch your message and transaction history update automatically

---

## 🗂️ Project Structure

```
0xtimberzx.github.io/MyDapp/
├── index.html           # Frontend structure and layout
├── style.css            # Styling and responsive design
├── app.js               # Blockchain logic and wallet connection
├── HelloWorld.sol        # Message storage contract
├── DAppToken.sol         # DAPP ERC-20 token contract
├── StringCompiler.sol    # String compilation and token charging
├── notes.md              # Project notes and contract history
├── README.md             # This file
│
├── faucet/               # 0xFaucet
├── blockpot/             # BlockpotDAO (vaults + stakes + timer, React)
│
└── debughub/             # Shared ecosystem diagnostics
    ├── index.html
    ├── style.css
    ├── gate.js            # Owner wallet gate
    ├── app.js             # Dashboard logic (tabs, export)
    └── sdk/
        └── debugger.js    # Telemetry SDK loaded by all DApps
```

---

## 🌱 Built in 14 Days From an iPhone

This DApp was built entirely from an iPhone using:

| Tool | Purpose |
|---|---|
| Buffer Editor | Writing and version controlling all code |
| GitHub Pages | Free frontend hosting |
| Remix IDE | Smart contract compilation and deployment |
| Sourcify | Decentralized contract verification |
| MetaMask | Wallet connection and transaction signing |
| Arbiscan | Transaction and contract exploration |
| Blockscout | Alternative block explorer |

---

## 🔗 Links

| Resource | URL |
|---|---|
| Live DApp | [0xtimberzx.github.io/MyDapp](https://0xtimberzx.github.io/MyDapp/) |
| DebugHub Dashboard | [0xtimberzx.github.io/MyDapp/debughub](https://0xtimberzx.github.io/MyDapp/debughub/) |
| Faucet | [0xtimberzx.github.io/MyDapp/faucet](https://0xtimberzx.github.io/MyDapp/faucet/) |
| BlockpotDAO | [0xtimberzx.github.io/MyDapp/blockpot](https://0xtimberzx.github.io/MyDapp/blockpot/) |
| GitHub Repo | [github.com/0xTimberzx/mydapp](https://github.com/0xTimberzx/mydapp) |
| HelloWorld on Arbiscan | [View Contract](https://sepolia.arbiscan.io/address/0x4c8ded518b3de7d839d3a2756773b8028c5c74aa) |
| StringCompiler on Arbiscan | [View Contract](https://sepolia.arbiscan.io/address/0x881A836D3d2cF955d9Bef9438b9e2bd610bcdAEe) |
| DAPP Token on Arbiscan | [View Contract](https://sepolia.arbiscan.io/address/0x3d0cB8929c22F93A9dd33921E6f43C1621FCfC04) |

---

## 📄 License

MIT License — feel free to fork and build on this project.
