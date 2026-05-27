# 🌐 DappMe — Decentralized Message Board

A fully on-chain decentralized message board built on Arbitrum Sepolia 
testnet. Users connect their wallet, compile string segments into a final 
message using DAPP tokens, publish it to the blockchain, and view the 
full transaction history — all from a mobile browser.

---

## 🔗 Live Demo

👉 [Launch DApp](https://0xtimberzx.github.io/MyDapp/)

---

## 📸 Features

- Connect Wallet — Supports MetaMask and Brave Wallet
- ETH Balance — Displays live native token balance with refresh
- DAPP Token Balance — Displays live DAPP token balance
- Token Approval — Approve DAPP tokens for StringCompiler in one tap
- String Compiler — Build messages segment by segment (80 chars max per segment)
- Free First Compile — First segment is always free
- Token Cost Preview — See exact DAPP cost before publishing
- Publish Message — Charges DAPP tokens and pushes final message on-chain
- Read Message — Fetches current on-chain message
- Transaction History — Displays all past updates with timestamps
- Filter by Wallet — Search history by any wallet address
- Disconnect — Cleanly resets all wallet and compiler state

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.0 |
| Blockchain | Arbitrum Sepolia (Chain ID: 421614) |
| Token Standard | ERC-20 (DAPP Token) |
| Frontend | HTML, CSS, JavaScript |
| Wallet Connection | ethers.js v5.7.2 |
| Hosting | GitHub Pages |
| Verification | Sourcify (Exact Match) |
| Code Editor | Buffer Editor (iPhone) |

---

## 📜 Smart Contracts

### HelloWorld
| Detail | Value |
|---|---|
| Address | 0xB4ECfD96546FE91A6eE7501BdcCC35C6B51E37b6 |
| Explorer | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x0E6A8a8047530aA5cB7d2F78df58D465CF0E6a1d) |
| Verification | [View on Sourcify](https://repo.sourcify.dev/421614/0x0E6A8a8047530aA5cB7d2F78df58D465CF0E6a1d) |

### DAPP Token (ERC-20)
| Detail | Value |
|---|---|
| Name | DApp Token |
| Symbol | DAPP |
| Initial Supply | 1,000,000 DAPP |
| Address | 0xF59f7408AF62F259bc09818d1B20c27bB412a94d |
| Explorer | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xF59f7408AF62F259bc09818d1B20c27bB412a94d) |
| Verification | [View on Sourcify](https://repo.sourcify.dev/421614/0xF59f7408AF62F259bc09818d1B20c27bB412a94d) |

### StringCompiler
| Detail | Value |
|---|---|
| Address | 0x0C91A46e8EBb65eE10eb07ED58eD0f4a6544143b |
| Price Per Compile | 10 DAPP (first segment free) |
| Explorer | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xDf1BC53BF7407DE82d3e74b37c74C736470F1b38) |
| Verification | [View on Sourcify](https://repo.sourcify.dev/421614/0xDf1BC53BF7407DE82d3e74b37c74C736470F1b38) |

---

## 🔄 How The String Compiler Works
User approves DUBB tokens for StringCompiler
↓
Types first segment (max 80 chars) → Compile
→ FREE — saved on-chain
↓
Types second segment → Compile
→ 10 DAPP charged at publish
↓
Types more segments → Compile
→ 10 DAPP per additional segment
↓
Taps Publish Message
→ Total DAPP cost charged at once
→ Combined string pushed to HelloWorld
→ Compiler state resets
↓
Message appears on-chain permanently---

## ⛽ Compile Pricing

| Segments | DUBB Cost |
|---|---|
| 1 | 0 DAPP (free) |
| 2 | 10 DAPP |
| 3 | 20 DAPP |
| 4 | 30 DAPP |
| N | (N-1) × 10 DAPP |

---

## 🗂️ Project Structuremy-dapp/
├── index.html           # Frontend structure and layout
├── style.css            # Styling and responsive design
├── app.js               # Blockchain logic and wallet connection
├── HelloWorld.sol       # Message storage contract
├── DAppToken.sol        # DAPP ERC-20 token contract
├── StringCompiler.sol   # String compilation and token charging
├── notes.md             # Project notes and contract history
└── README.md            # This file
---

## 🔒 Security Features

- onlyCompiler modifier — HelloWorld only accepts updates from StringCompiler
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
- Retry logic handles MetaMask mobile RPC errors
- Compatible with both MetaMask and Brave Wallet fee structures

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
4. Type a message segment and tap Compile Segment
5. Add more segments as needed
6. Review the compiled preview and token cost
7. Tap Publish to Blockchain and confirm in wallet
8. Watch your message and history update automatically

---

## 📊 Contract Interaction FlowUser Wallet
↓ approve()
DAppToken (DAPP)
↓ transferFrom()
StringCompiler ←→ User calls compileString() + publishMessage()
↓ updateMessage()
HelloWorld (onlyCompiler)
↓ emits MessageUpdated event
Transaction History
---

## 🌱 Built in 14 Days

This DApp was built entirely from an iPhone using:
- Buffer Editor — Writing and version controlling code
- GitHub Pages — Free frontend hosting
- Remix IDE — Smart contract compilation and deployment
- Sourcify — Decentralized contract verification
- MetaMask — Wallet connection and transaction signing
- Arbiscan — Transaction and contract explorer

---

## 🔗 Links

| Resource | URL |
|---|---|
| Live DApp | [0xtimberzx.github.io/MyDapp](https://0xtimberzx.github.io/MyDapp/) |
| GitHub Repo | [github.com/0xTimberzx/mydapp](https://github.com/0xTimberzx/mydapp) |
| Gist | [View Gist](https://gist.github.com/0xTimberZx/c7f0b7d3d7a4938bd983dd49a81c3ce4) |
| Arbiscan | [View Contracts](https://sepolia.arbiscan.io/address/0x0E6A8a8047530aA5cB7d2F78df58D465CF0E6a1d) |

---

## 📄 License

MIT License — feel free to fork and build on this project.
