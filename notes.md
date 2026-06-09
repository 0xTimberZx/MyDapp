# 🌐 BlockpotDAO — Decentralized Message Board

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
| Address | 0x51B4dfB1A6ECABBc6542FDC4e8AC0085026d6A63 |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x51B4dfB1A6ECABBc6542FDC4e8AC0085026d6A63) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x51B4dfB1A6ECABBc6542FDC4e8AC0085026d6A63) |

### StringCompiler
| Detail | Value |
|---|---|
| Address | 0x5E16f043e19A8aAABc8A0d7B29C465784aF77092 |
| Price Per Compile | 10 DAPP (first segment free) |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x5e16f043e19a8aaabc8a0d7b29c465784af77092) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x5E16f043e19A8aAABc8A0d7B29C465784aF77092) |

### Faucet
|---|---|
| Detail | Value |
| Address | 0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF |
| Eth Send per Claim | 0.005 ETH ( every 12 hours ) |
| Arbiscan | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF) |
| Sourcify | [View on Sourcify](https://repo.sourcify.dev/421614/0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF) |
---

## 🔄 How The String Compiler WorksUser approves DAPP tokens for StringCompiler
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
History updates with cost and sender---

## ⛽ Compile Pricing

| Segments | DAPP Cost |
|---|---|
| 1 | 0 DAPP (free) |
| 2 | 10 DAPP |
| 3 | 20 DAPP |
| 4 | 30 DAPP |
| N | (N-1) × 10 DAPP |

---
## 💧Faucet Contract
FaucetVault — 0x448f7bAeB5a93249215fd6a2C2e8ED0D287d8BBF
Compiler: solc 0.8.20 | Optimizer: OFF
Deployed: [06/05/06]
Verified: Sourcify ✔

## 🗂️ Project Structuremy-dapp/
├── index.html           # Frontend structure and layout
├── style.css            # Styling and responsive design
├── app.js               # Blockchain logic and wallet connection
├── HelloWorld.sol       # Message storage contract
├── DAppToken.sol        # DAPP ERC-20 token contract
├── StringCompiler.sol   # String compilation and token charging
├── notes.md             # Project notes and contract history
└── README.md            # This file---
├── Faucet.sol.          # Eth token faucet per connected wallet

## 📊 Contract ArchitectureUser Wallet
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
---

## 🔒 Security Features

- onlyCompiler modifier — HelloWorld only accepts updates from StringCompiler
- immutable owner — Owner set once at deployment, cannot be changed
- Zero address check — Prevents setting compiler to invalid address
- CompilerUpdated event — Logs every compiler change on-chain
- XSS Protection — All user messages sanitized before display
- Input Validation — Segments limited to 80 characters
- Wallet Checks — All functions verify wallet connection before executing
- Network Switching — Auto-switches to Arbitrum Sepolia on connect
- msg.sender — Used instead of tx.origin to prevent phishing attacks
- Privacy — Wallet addresses displayed in abbreviated form only

---

## ⛽ Gas Handling

- Automatically estimates gas for every transaction
- Adds 50% buffer to prevent out-of-gas errors
- Fetches current network fee data dynamically
- Retry logic with exponential backoff handles RPC errors
- Compatible with MetaMask and Brave Wallet fee structures

---

## 📱 Device Compatibility

| Device | Browser | Status |
|---|---|---|
| iPhone | MetaMask Browser | ✅ Fully Working |
| Tablet | Brave Browser | ✅ Fully Working |

---

## 🚀 How To Use

1. Open the [Live DApp](https://0xtimberzx.github.io/MyDapp/) in
   MetaMask or Brave browser
2. Tap Connect Wallet and approve the connection
3. Tap Approve DAPP Tokens to enable the compiler
4. Type your first segment and tap Compile Segment — free!
5. Add more segments as needed — cost shown in preview
6. Review the compiled string and total DAPP cost
7. Tap Publish to Blockchain and confirm in wallet
8. Watch your message and transaction history update automatically

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
| GitHub Repo | [github.com/0xTimberzx/mydapp](https://github.com/0xTimberzx/mydapp) |
| Gist | [View Gist](https://gist.github.com/0xTimberZx/c7f0b7d3d7a4938bd983dd49a81c3ce4) |
| HelloWorld on Arbiscan | [View Contract](https://sepolia.arbiscan.io/address/0x4c8ded518b3de7d839d3a2756773b8028c5c74aa) |
| StringCompiler on Arbiscan | [View Contract](https://sepolia.arbiscan.io/address/0x63516F99D6e82cC8372198b8248f3B3aE001bfb6) |
| DAPP Token on Arbiscan | [View Contract](https://sepolia.arbiscan.io/address/0x51B4dfB1A6ECABBc6542FDC4e8AC0085026d6A63) |
| Faucet Webpage | [https://0xtimberzx.github.io/MyDapp/faucet]
---

## 📄 License

MIT License — feel free to fork and build on this project.
