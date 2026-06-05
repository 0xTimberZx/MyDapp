// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// ─────────────────────────────────────────────
//  FaucetVault — 0xTimberzx
//  Arbitrum Sepolia Testnet
//  Compiler : solc 0.8.20
//  Optimizer: OFF
// ─────────────────────────────────────────────

contract FaucetVault {

    // ── STATE ────────────────────────────────
    address public owner;
    uint256 public claimAmount  = 0.005 ether;
    uint256 public cooldown     = 12 hours;

    mapping(address => uint256) public nextClaimTime;

    // ── EVENTS ───────────────────────────────
    event Claimed(address indexed claimant, uint256 amount, uint256 timestamp);
    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event ClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);

    // ── MODIFIERS ────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ── CONSTRUCTOR ──────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── RECEIVE ETH (top up the vault) ───────
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    // ── CLAIM ────────────────────────────────
    // Called by the user's wallet directly.
    // No private key needed on the frontend.
    function claim() external {
        require(address(this).balance >= claimAmount, "Vault empty");
        require(block.timestamp >= nextClaimTime[msg.sender], "Cooldown active");

        nextClaimTime[msg.sender] = block.timestamp + cooldown;

        (bool sent, ) = payable(msg.sender).call{value: claimAmount}("");
        require(sent, "Transfer failed");

        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }

    // ── READ HELPERS (called by frontend) ────
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Returns 0 if the address has never claimed or cooldown has passed
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= nextClaimTime[user]) return 0;
        return nextClaimTime[user] - block.timestamp;
    }

    // ── OWNER FUNCTIONS ──────────────────────
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdrawn(owner, amount);
    }

    function withdrawAll() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "Nothing to withdraw");
        (bool sent, ) = payable(owner).call{value: bal}("");
        require(sent, "Withdraw failed");
        emit Withdrawn(owner, bal);
    }

    function setClaimAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be > 0");
        emit ClaimAmountUpdated(claimAmount, newAmount);
        claimAmount = newAmount;
    }

    function setCooldown(uint256 newCooldown) external onlyOwner {
        require(newCooldown > 0, "Cooldown must be > 0");
        emit CooldownUpdated(cooldown, newCooldown);
        cooldown = newCooldown;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}
