document.addEventListener("DOMContentLoaded", function() {

// HelloWorld Contract
const CONTRACT_ADDRESS = "0xB4ECfD96546FE91A6eE7501BdcCC35C6B51E37b6";

// DAPP Token Contract
const TOKEN_ADDRESS = "0x51B4dfB1A6ECABBc6542FDC4e8AC0085026d6A63";

// StringCompiler Contract
const COMPILER_ADDRESS = "0xf4C8CAE85Ee25e78B5b4b3e786a19191849ef359";

const TOKEN_ABI = [
    {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const COMPILER_ABI = [
    {
        "inputs": [{"name": "newSegment", "type": "string"}],
        "name": "compileString",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "publishMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getCompiledString",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getCompileCount",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getPublishCost",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pricePerCompile",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "finalMessage",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "totalSegments",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "tokensCost",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "MessagePublished",
        "type": "event"
    }
    ];

const ABI = [
    {
        "inputs": [],
        "name": "message",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastSender",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastUpdated",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "newMessage", "type": "string"}],
        "name": "updateMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "newMessage",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "MessageUpdated",
        "type": "event"
    }
];

let provider;
let signer;
let contract;
let tokenContract;
let compilerContract;

// Character Counter
const newMessageEl = document.getElementById("newMessage");
if (newMessageEl) {
    newMessageEl.addEventListener("input", function() {
        const count = this.value.length;
        const charCountEl = document.getElementById("charCount");
        if (charCountEl) {
            charCountEl.innerText = count + "/80";
        }
    });
}

// Compile Input Character Counter
const compileInputEl = document.getElementById("compileInput");
if (compileInputEl) {
    compileInputEl.addEventListener("input", function() {
        const count = this.value.length;
        document.getElementById("compileCharCount")
            .innerText = count + "/80";
    });
}

// Connect Wallet
async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
        showStatus(
            "⚠️ No wallet found. Open in Brave or MetaMask browser.",
            false
        );
        return;
    }

    try {
        document.getElementById("connectBtn").innerText = "Connecting...";
        document.getElementById("connectBtn").disabled = true;

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        if (!accounts || accounts.length === 0) {
            showStatus("❌ No accounts found. Unlock your wallet.", false);
            resetConnectBtn();
            return;
        }

        // Switch to Arbitrum Sepolia
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x66eee" }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: "0x66eee",
                        chainName: "Arbitrum Sepolia",
                        nativeCurrency: {
                            name: "ETH",
                            symbol: "ETH",
                            decimals: 18
                        },
                        rpcUrls: [
                            "https://sepolia-rollup.arbitrum.io/rpc"
                        ],
                        blockExplorerUrls: [
                            "https://sepolia.arbiscan.io"
                        ]
                    }]
                });
            } else {
                showStatus(
                    "❌ Failed to switch network: " + switchError.message,
                    false
                );
                resetConnectBtn();
                return;
            }
        }

        // Setup ethers
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
       tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
compilerContract = new ethers.Contract(COMPILER_ADDRESS, COMPILER_ABI, signer); 
        

        // Show wallet info
        const address = accounts[0];
        const balance = await provider.getBalance(address);
        const ethBalance = parseFloat(
            ethers.utils.formatEther(balance)
        ).toFixed(4);

        document.getElementById("walletAddress").innerText =
            address.slice(0, 6) + "..." + address.slice(-4);
        document.getElementById("walletLabel").innerText =
            ethBalance + " ETH";
        document.getElementById("walletInfo")
            .classList.remove("hidden");
        document.getElementById("connectBtn").innerText = "✅ Connected";
        document.getElementById("connectBtn").disabled = false;
        document.getElementById("disconnectBtn")
            .classList.remove("hidden");
        document.getElementById("switchBtn")
            .classList.remove("hidden");

        showStatus("✅ Wallet connected successfully!", true);

        await getMessage();
        await getHistory();
        await refreshTokenBalance();
        await refreshCompilerState();
        await checkApproval();

    } catch (err) {
        resetConnectBtn();
        showStatus("❌ " + err.message, false);
    }
}

// Refresh ETH Balance
async function refreshBalance() {
    if (!provider || !signer) {
        showStatus("⚠️ Connect wallet first!", false);
        return;
    }
    try {
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const ethBalance = parseFloat(
            ethers.utils.formatEther(balance)
        ).toFixed(4);
        document.getElementById("walletLabel").innerText =
            ethBalance + " ETH";
    } catch (err) {
        console.log("Balance refresh failed:", err);
    }
}

// Read Current Message
async function getMessage() {
    if (!contract) {
        showStatus("⚠️ Connect wallet first!", false);
        return;
    }
    showSpinner(true);
    try {
        const msg = await contract.message();
        document.getElementById("currentMessage").innerText = msg;
    } catch (err) {
        document.getElementById("currentMessage").innerText =
            "Connect wallet first!";
    }
    showSpinner(false);
}

// Get Transaction History
async function getHistory(filteredEvents = null) {
    if (!contract) {
        document.getElementById("historyList").innerText =
            "Connect wallet to view history.";
        return;
    }

    try {
        document.getElementById("historyList").innerText =
            "Loading history...";

        let events;
        if (filteredEvents) {
            events = filteredEvents;
        } else {
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 50000);

            // Read from StringCompiler MessagePublished events
            let compilerEvents = [];
            let helloWorldEvents = [];

            // Retry logic
            let retries = 3;
            while (retries > 0) {
                try {
                
                // Get StringCompiler events
                    const compilerFilter = compilerContract
                        .filters.MessagePublished();
                    compilerEvents = await compilerContract.queryFilter(
                        compilerFilter,
                        fromBlock,
                        currentBlock
                    );

                    // Get direct HelloWorld events
                    const hwFilter = contract.filters.MessageUpdated();
                    helloWorldEvents = await contract.queryFilter(
                        hwFilter,
                        fromBlock,
                        currentBlock
                    );

                    break;
                } catch (rpcErr) {
                    retries--;
                    if (retries === 0) throw rpcErr;
                    document.getElementById("historyList").innerText =
                        "Retrying... (" + retries + " attempts left)";
                    await new Promise(resolve =>
                        setTimeout(resolve, 1000)
                    );
                }
            }

            // Normalize compiler events
            const normalizedCompiler = compilerEvents.map(event => ({
                sender: event.args.user,
                message: event.args.finalMessage,
                timestamp: event.args.timestamp,
                txHash: event.transactionHash,
                blockNumber: event.blockNumber,
                tokensCost: event.args.tokensCost,
                type: "compiled"
            }));

            // Normalize HelloWorld direct events
            const normalizedHW = helloWorldEvents.map(event => ({
                sender: event.args.sender,
                message: event.args.newMessage,
                timestamp: event.args.timestamp,
                txHash: event.transactionHash,
                blockNumber: event.blockNumber,
                tokensCost: null,
                type: "direct"
            }));

            // Combine and sort by block number newest first
            events = [...normalizedCompiler, ...normalizedHW]
                .sort((a, b) => b.blockNumber - a.blockNumber);
        }

        if (events.length === 0) {
            document.getElementById("historyList").innerText =
                "No history yet. Publish a message to start!";
            return;
        }

        document.getElementById("historyList").innerHTML = "";

        events.forEach((event) => {
            const sender = event.sender;
            const message = event.message;
            const timestamp = event.timestamp
                ? new Date(event.timestamp.toNumber
                    ? event.timestamp.toNumber() * 1000
                    : event.timestamp * 1000
                ).toLocaleString()
                : "Compiled message";
            const txHash = event.txHash;
            const tokensCost = event.tokensCost
                ? parseFloat(
                    ethers.utils.formatEther(event.tokensCost)
                ).toFixed(2) + " DAPP"
                : null;

            const item = document.createElement("div");
            item.className = "history-item";const messageDiv = document.createElement("div");
            messageDiv.className = "history-message";
            messageDiv.textContent = message;

            const metaDiv = document.createElement("div");
            metaDiv.className = "history-meta";
            metaDiv.innerHTML =
               `<span class="history-sender">${sender.slice(0,6)}...${sender.slice(-4)}</span>` +
               `<span class="history-date">${timestamp}</span>`;

            const txLink = document.createElement("a");
            txLink.href = "https://sepolia.arbiscan.io/tx/" + txHash;
            txLink.target = "_blank";
            txLink.rel = "noopener noreferrer";
            txLink.className = "history-link";
            txLink.textContent = "View on Arbiscan →";

            item.appendChild(messageDiv);
            item.appendChild(metaDiv);

            // Show token cost if available
            if (tokensCost) {
                const costDiv = document.createElement("div");
                costDiv.className = "history-cost";
                costDiv.textContent = "Cost: " + tokensCost;
                item.appendChild(costDiv);
            }

            item.appendChild(txLink);
            document.getElementById("historyList").appendChild(item);
        });

    } catch (err) {
        document.getElementById("historyList").innerText =
            "❌ Error loading history: " + err.message;
    }
}

// Update Message
async function updateMessage() {
    const newMsg = document.getElementById("newMessage").value;

    if (!newMsg) {
        showStatus("⚠️ Please type a message first!", false);
        return;
    }

    if (newMsg.length > 80) {
        showStatus("⚠️ Message exceeds 80 characters!", false);
        return;
    }

    if (!provider) {
        showStatus("⚠️ Wallet not connected!", false);
        return;
    }

    try {
        document.getElementById("updateBtn").innerText = "Sending... ⏳";
        document.getElementById("updateBtn").disabled = true;
        showSpinner(true);

        showStatus("⏳ Waiting for wallet confirmation...", true);

        const feeData = await provider.getFeeData();
        const gasEstimate = await contract
            .estimateGas.updateMessage(newMsg);
        const gasWithBuffer = gasEstimate.mul(150).div(100);

        const tx = await contract.updateMessage(newMsg, {
            gasLimit: gasWithBuffer,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });

        showStatus("⏳ Transaction sent! Confirming...", true);
        await tx.wait();

        const arbiscanUrl =
            "https://sepolia.arbiscan.io/tx/" + tx.hash;
        document.getElementById("txLink").href = arbiscanUrl;
        document.getElementById("txLink").target = "_blank";
        document.getElementById("txLink").rel = "noopener noreferrer";
        document.getElementById("txLink")
            .classList.remove("hidden");

        showStatus("✅ Message updated successfully!", true);

        document.getElementById("newMessage").value = "";
        document.getElementById("charCount").innerText = "0/80";
        document.getElementById("updateBtn").innerText =
            "⛓️ Update on Blockchain";
        document.getElementById("updateBtn").disabled = false;

        showSpinner(false);

        await getMessage();
        await getHistory();
        await refreshBalance();

    } catch (err) {
        document.getElementById("updateBtn").innerText =
            "⛓️ Update on Blockchain";
        document.getElementById("updateBtn").disabled = false;
        showSpinner(false);
        showStatus("❌ " + err.message, false);
    }
}

// Refresh DAPP Token Balance
async function refreshTokenBalance() {
    if (!tokenContract || !signer) return;
    try {
        const address = await signer.getAddress();
        const balance = await tokenContract.balanceOf(address);
        const formatted = parseFloat(
            ethers.utils.formatEther(balance)
        ).toFixed(2);
        document.getElementById("tokenBalance").innerText = formatted;
    } catch (err) {
        document.getElementById("tokenBalance").innerText = "Error";
        console.log("Token balance error:", err);
    }
}

// Check Approval Status
async function checkApproval() {
    if (!tokenContract || !signer) return;
    try {
        const address = await signer.getAddress();
        const allowance = await tokenContract.allowance(
            address,
            COMPILER_ADDRESS
        );
        const formatted = parseFloat(
            ethers.utils.formatEther(allowance)
        ).toFixed(2);
        if (allowance.gt(ethers.BigNumber.from(0))) {
            document.getElementById("approvalStatus").innerText =
                "✅ Approved: " + formatted + " DAPP";
            document.getElementById("approvalStatus").style.color =
                "#238636";
        } else {
            document.getElementById("approvalStatus").innerText =
                "⚠️ Not approved yet. Tap Approve to enable publishing.";
            document.getElementById("approvalStatus").style.color =
                "#f85149";
        }
    } catch (err) {
        console.log("Approval check error:", err);
    }
}

// Approve DAPP Tokens
async function approveTokens() {
    if (!tokenContract) {
        showStatus("⚠️ Connect wallet first!", false);
        return;
    }
    try {
        document.getElementById("approveBtn").innerText = "Approving...";
        document.getElementById("approveBtn").disabled = true;

        // Approve a large amount so user doesn't need to re-approve often
        const approveAmount = ethers.utils.parseEther("1000000");

        const feeData = await provider.getFeeData();
        const tx = await tokenContract.approve(
            COMPILER_ADDRESS,
            approveAmount,
            {
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
            }
        );

        showStatus("⏳ Approval transaction sent...", true);
        await tx.wait();

        document.getElementById("approveBtn").innerText =
            "✅ Approve DAPP Tokens";
        document.getElementById("approveBtn").disabled = false;

        showStatus("✅ DAPP tokens approved!", true);
        await checkApproval();

    } catch (err) {
        document.getElementById("approveBtn").innerText =
            "✅ Approve DAPP Tokens";
        document.getElementById("approveBtn").disabled = false;
        showStatus("❌ " + err.message, false);
    }
}

// Compile String Segment
async function compileString() {
    const segment = document.getElementById("compileInput").value;

    if (!segment) {
        showStatus("⚠️ Please type a segment first!", false);
        return;
    }

    if (segment.length > 80) {
        showStatus("⚠️ Segment exceeds 80 characters!", false);
        return;
    }

    if (!compilerContract) {
        showStatus("⚠️ Connect wallet first!", false);
        return;
    }

    try {
        document.getElementById("compileBtn").innerText = "Compiling...";
        document.getElementById("compileBtn").disabled = true;

        showStatus("⏳ Waiting for wallet confirmation...", true);

        const feeData = await provider.getFeeData();
        const gasEstimate = await compilerContract
            .estimateGas.compileString(segment);
        const gasWithBuffer = gasEstimate.mul(150).div(100);

        const tx = await compilerContract.compileString(segment, {
            gasLimit: gasWithBuffer,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });

        showStatus("⏳ Compiling on-chain...", true);
        await tx.wait();
        
        document.getElementById("compileInput").value = "";
        document.getElementById("compileCharCount").innerText = "0/80";
        document.getElementById("compileBtn").innerText =
            "⚙️ Compile Segment (Free)";
        document.getElementById("compileBtn").disabled = false;

        showStatus("✅ Segment compiled successfully!", true);

        await refreshCompilerState();

    } catch (err) {
        document.getElementById("compileBtn").innerText =
            "⚙️ Compile Segment (Free)";
        document.getElementById("compileBtn").disabled = false;
        showStatus("❌ " + err.message, false);
    }
}

// Refresh Compiler State
async function refreshCompilerState() {
    if (!compilerContract || !signer) return;
    try {
        const address = await signer.getAddress();

        const compiledString = await compilerContract
            .getCompiledString(address);
        const compileCount = await compilerContract
            .getCompileCount(address);
        const publishCost = await compilerContract
            .getPublishCost(address);

        const formattedCost = parseFloat(
            ethers.utils.formatEther(publishCost)
        ).toFixed(2);
        const count = compileCount.toNumber();

        // Update compile badge
        document.getElementById("compileCount").innerText =
            count + (count === 1 ? " segment" : " segments");

        if (count > 0) {
            // Show preview
            document.getElementById("compiledPreview")
                .classList.remove("hidden");
            // Show compiled string with segment count indicator
        const segmentLabel = count > 1
            ? "[" + count + " segments joined] "
            : "[1 segment] ";
        document.getElementById("compiledText").innerText =
            segmentLabel + compiledString;
            document.getElementById("tokenCost").innerText =
                formattedCost + " DAPP";

            // Update publish card
            document.getElementById("publishPreview").innerText =
                compiledString;
            document.getElementById("publishCost").innerText =
                formattedCost + " DAPP";
            document.getElementById("publishBtn").disabled = false;
            document.getElementById("clearCompiledBtn").disabled = false;
        } else {
            document.getElementById("compiledPreview")
                .classList.add("hidden");
            document.getElementById("publishPreview").innerText =
                "Compile segments first...";
            document.getElementById("publishCost").innerText = "0 DAPP";
            document.getElementById("publishBtn").disabled = true;
            document.getElementById("clearCompiledBtn").disabled = true;
        }

    } catch (err) {
        console.log("Compiler state error:", err);
    }
}

// Publish Message
async function publishMessage() {
    if (!compilerContract) {
        showStatus("⚠️ Connect wallet first!", false);
        return;
    }

    try {
        document.getElementById("publishBtn").innerText = "Publishing...";
        document.getElementById("publishBtn").disabled = true;

        showStatus("⏳ Waiting for wallet confirmation...", true);

        const feeData = await provider.getFeeData();
        const gasEstimate = await compilerContract
            .estimateGas.publishMessage();
        const gasWithBuffer = gasEstimate.mul(150).div(100);

        const tx = await compilerContract.publishMessage({
            gasLimit: gasWithBuffer,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });

        showStatus("⏳ Publishing to blockchain...", true);
        await tx.wait();

        const arbiscanUrl =
            "https://sepolia.arbiscan.io/tx/" + tx.hash;
        document.getElementById("txLink").href = arbiscanUrl;
        document.getElementById("txLink").target = "_blank";
        document.getElementById("txLink").rel = "noopener noreferrer";
        document.getElementById("txLink")
            .classList.remove("hidden");

       showStatus("✅ Message published successfully!", true);
document.getElementById("publishBtn").innerText = 
            "📝 Publish to Blockchain";
        document.getElementById("publishBtn").disabled = false;

        await getMessage();
        await getHistory();
        await refreshTokenBalance();
        await refreshCompilerState();

    } catch (err) {
        document.getElementById("publishBtn").innerText =
            "📝 Publish to Blockchain";
        document.getElementById("publishBtn").disabled = false;
        showStatus("❌ " + err.message, false);
    }
}

// Clear Compiled String
async function clearCompiled() {
    if (!compilerContract || !signer) return;
    try {
        const address = await signer.getAddress();
        const count = await compilerContract.getCompileCount(address);
        if (count.toNumber() === 0) {
            showStatus("⚠️ Nothing compiled to clear!", false);
            return;
        }
        showStatus(
            "⚠️ To clear compiled strings you need to publish or " +
            "wait for the contract to reset. Compiled data lives " +
            "on-chain and cannot be deleted without a transaction.",
            false
        );
    } catch (err) {
        showStatus("❌ " + err.message, false);
    }
}


// Filter History By Wallet Address
async function filterHistory() {
    const filterAddress = document.getElementById("filterAddress")
        .value.trim();

    if (!filterAddress) {
        document.getElementById("filterStatus").innerText =
            "⚠️ Please enter a full wallet address.";
        return;
    }

    if (filterAddress.length !== 42 || !filterAddress.startsWith("0x")) {
        document.getElementById("filterStatus").innerText =
            "⚠️ Must be a full 42 character address starting with 0x";
        return;
    }

    if (!contract) {
        document.getElementById("filterStatus").innerText =
            "⚠️ Connect wallet first.";
        return;
    }

    try {
        document.getElementById("filterBtn").innerText = "Searching...";
        document.getElementById("filterBtn").disabled = true;
        document.getElementById("filterStatus").innerText = "";

        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 50000);

        // Search StringCompiler events
        const compilerFilter = compilerContract.filters.MessagePublished();
        const compilerEvents = await compilerContract.queryFilter(
            compilerFilter,
            fromBlock,
            currentBlock
        );

        // Search HelloWorld direct events
        const hwFilter = contract.filters.MessageUpdated();
        const hwEvents = await contract.queryFilter(
            hwFilter,
            fromBlock,
            currentBlock
        );

        // Normalize compiler events
        const normalizedCompiler = compilerEvents.map(event => ({
            sender: event.args.user,
            message: event.args.finalMessage,
            timestamp: event.args.timestamp,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            tokensCost: event.args.tokensCost,
            type: "compiled"
        }));

        // Normalize HelloWorld events
        const normalizedHW = hwEvents.map(event => ({
            sender: event.args.sender,
            message: event.args.newMessage,
            timestamp: event.args.timestamp,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            tokensCost: null,
            type: "direct"
        }));

        // Combine all events
        const allEvents = [...normalizedCompiler, ...normalizedHW]
            .sort((a, b) => b.blockNumber - a.blockNumber);

        // Filter by address
        const filtered = allEvents.filter(event =>
            event.sender.toLowerCase() ===
            filterAddress.toLowerCase()
        );

        document.getElementById("filterBtn").innerText = "🔍 Filter";
        document.getElementById("filterBtn").disabled = false;

        if (filtered.length === 0) {
            document.getElementById("filterStatus").innerText =
                "No transactions found for " +
                filterAddress.slice(0,6) + "..." +
                filterAddress.slice(-4);
            document.getElementById("historyList").innerText =
                "No results found for this address.";
            return;
        }

        document.getElementById("filterStatus").innerText =
            "Showing " + filtered.length + " result(s) for " +
            filterAddress.slice(0,6) + "..." +
            filterAddress.slice(-4);

        await getHistory(filtered);

    } catch (err) {
        document.getElementById("filterBtn").innerText = "🔍 Filter";
        document.getElementById("filterBtn").disabled = false;
        document.getElementById("filterStatus").innerText =
            "❌ Error: " + err.message;
    }
}

// Clear Filter
async function clearFilter() {
    document.getElementById("filterAddress").value = "";
    document.getElementById("filterStatus").innerText = "";
    if (contract) {
        await getHistory();
    } else {
        document.getElementById("historyList").innerText =
            "Connect wallet to view history.";
    }
}

// Switch Wallet
async function switchWallet() {
    if (typeof window.ethereum === "undefined") {
        showStatus("⚠️ No wallet found.", false);
        return;
    }
    try {
        showStatus("🔄 Requesting wallet switch...", true);

        // Request accounts triggers wallet picker on mobile
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        }); 
        
        // Verify correct network after switch
        const chainId = await window.ethereum.request({
            method: "eth_chainId"
        });
        if (chainId !== "0x66eee") {
            showStatus("❌ Wrong network. Please switch to Arbitrum Sepolia.", false);
            return;
        }
         
        if (!accounts || accounts.length === 0) {
            showStatus("❌ No accounts found.", false);
            return;
        }

        // Reinitialize with new account
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        tokenContract = new ethers.Contract(
            TOKEN_ADDRESS, TOKEN_ABI, signer
        );
        compilerContract = new ethers.Contract(
            COMPILER_ADDRESS, COMPILER_ABI, signer
        );

        const address = accounts[0];
        const balance = await provider.getBalance(address);
        const ethBalance = parseFloat(
            ethers.utils.formatEther(balance)
        ).toFixed(4);

        document.getElementById("walletAddress").innerText =
            address.slice(0, 6) + "..." + address.slice(-4);
        document.getElementById("walletLabel").innerText =
            ethBalance + " ETH";

        showStatus("✅ Wallet switched to " +
            address.slice(0,6) + "..." + address.slice(-4), true);

        await getMessage();
        await getHistory();
        await refreshTokenBalance();
        await refreshCompilerState();
        await checkApproval();

    } catch (err) {
        showStatus("❌ " + err.message, false);
    }
}

// Disconnect Wallet
function disconnectWallet() {
    provider = null;
    signer = null;
    contract = null;

    document.getElementById("walletLabel").innerText = "0.0000 ETH";
    document.getElementById("walletAddress").innerText = "...";
    document.getElementById("walletInfo").classList.add("hidden");
    document.getElementById("currentMessage").innerText =
        "Connect wallet to load...";
    document.getElementById("historyList").innerText =
        "Connect wallet to view history.";
    document.getElementById("statusBox").classList.add("hidden");
    document.getElementById("filterAddress").value = "";
    document.getElementById("filterStatus").innerText = "";
    document.getElementById("disconnectBtn").classList.add("hidden");
    document.getElementById("switchBtn").classList.add("hidden");
    
    // Reset token and compiler state
    document.getElementById("tokenBalance").innerText =
        "Connect wallet to load...";
    document.getElementById("approvalStatus").innerText =
        "Approval status unknown";
    document.getElementById("compiledPreview")
        .classList.add("hidden");
    document.getElementById("compileCount").innerText =
        "0 segments";
    document.getElementById("publishPreview").innerText =
        "Compile segments first...";
    document.getElementById("publishCost").innerText = "0 DAPP";
    tokenContract = null;
    compilerContract = null;

    resetConnectBtn();
}

// Reset Connect Button
function resetConnectBtn() {
    document.getElementById("connectBtn").innerText = "🦊 Connect Wallet";
    document.getElementById("connectBtn").disabled = false;
}

// Show Status Message
function showStatus(message, success) {
    const statusBox = document.getElementById("statusBox");
    const status = document.getElementById("status");
    statusBox.classList.remove("hidden");
    status.innerText = message;
    status.style.color = success ? "#238636" : "#f85149";
}

// Show Hide Spinner
function showSpinner(show) {
    const spinner = document.getElementById("spinner");
    if (show) {
        spinner.classList.remove("hidden");
    } else {
        spinner.classList.add("hidden");
    }
}

// Make functions available globally
window.connectWallet = connectWallet;
window.getMessage = getMessage;
window.getHistory = getHistory;
window.updateMessage = updateMessage;
window.filterHistory = filterHistory;
window.clearFilter = clearFilter;
window.refreshBalance = refreshBalance;
window.disconnectWallet = disconnectWallet;
window.refreshTokenBalance = refreshTokenBalance;
window.checkApproval = checkApproval;
window.approveTokens = approveTokens;
window.compileString = compileString;
window.refreshCompilerState = refreshCompilerState;
window.publishMessage = publishMessage;
window.clearCompiled = clearCompiled;
window.switchWallet = switchWallet;

}); // End DOMContentLoaded
