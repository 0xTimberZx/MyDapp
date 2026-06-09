// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// ─────────────────────────────────────────────
//  FaucetVault — BlockpotDAO
//  Arbitrum Sepolia Testnet
//  Compiler : solc 0.8.20
//  Optimizer: OFF
// ─────────────────────────────────────────────

interface IPrizeVault {
    function fund() external payable;
}

contract FaucetVault {

    // ── STATE ─────────────────────────────────
    address public owner;
    address public prizeVault;
    uint256 public claimAmount   = 0.005 ether;
    uint256 public cooldown      = 12 hours;
    uint256 public totalClaimed;
    uint256 public totalToPrize;

    mapping(address => uint256) public nextClaimTime;

    // ── EVENTS ────────────────────────────────
    event Claimed(
        address indexed claimant,
        uint256 userAmount,
        uint256 prizeAmount,
        uint256 timestamp
    );
    event Deposited(
        address indexed sender,
        uint256 amount
    );
    event Withdrawn(
        address indexed to,
        uint256 amount
    );
    event PrizeVaultSet(
        address indexed prizeVault
    );
    event ClaimAmountUpdated(
        uint256 oldAmount,
        uint256 newAmount
    );
    event CooldownUpdated(
        uint256 oldCooldown,
        uint256 newCooldown
    );

    // ── MODIFIERS ─────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ── CONSTRUCTOR ───────────────────────────
    constructor(address _prizeVault) {
        owner      = msg.sender;
        prizeVault = _prizeVault;
    }

    // ── RECEIVE ETH ───────────────────────────
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    // ── CLAIM ─────────────────────────────────
    // User receives 50% of claimAmount
    // Other 50% flows directly to PrizeVault
    function claim() external {
        // Total needed = full claimAmount
        // Half to user, half to prize
        require(
            address(this).balance >= claimAmount,
            "Vault empty"
        );
        require(
            block.timestamp >= nextClaimTime[msg.sender],
            "Cooldown active"
        );

        nextClaimTime[msg.sender] =
            block.timestamp + cooldown;

        uint256 userShare  = claimAmount / 2;
        uint256 prizeShare = claimAmount - userShare;

        // Send user their half
        (bool sentUser, ) = payable(msg.sender)
            .call{value: userShare}("");
        require(sentUser, "User transfer failed");

        // Send prize vault their half
        // Using low-level call since fund() is payable
        (bool sentPrize, ) = payable(prizeVault)
            .call{value: prizeShare}("");
        require(sentPrize, "Prize transfer failed");

        totalClaimed  += userShare;
        totalToPrize  += prizeShare;

        emit Claimed(
            msg.sender,
            userShare,
            prizeShare,
            block.timestamp
        );
    }

    // ── READ HELPERS ──────────────────────────
    function getBalance()
        external view returns (uint256) {
        return address(this).balance;
    }

    function timeUntilNextClaim(
        address user
    ) external view returns (uint256) {
        if (block.timestamp >= nextClaimTime[user]) return 0;
        return nextClaimTime[user] - block.timestamp;
    }

    function canClaim(
        address user
    ) external view returns (bool) {
        return (
            block.timestamp >= nextClaimTime[user] &&
            address(this).balance >= claimAmount
        );
    }

    // ── OWNER FUNCTIONS ───────────────────────
    function setPrizeVault(
        address _prizeVault
    ) external onlyOwner {
        require(_prizeVault != address(0), "Zero address");
        prizeVault = _prizeVault;
        emit PrizeVaultSet(_prizeVault);
    }

    function withdraw(
        uint256 amount
    ) external onlyOwner {
        require(
            amount <= address(this).balance,
            "Insufficient balance"
        );
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

    function setClaimAmount(
        uint256 newAmount
    ) external onlyOwner {
        require(newAmount > 0, "Amount must be > 0");
        emit ClaimAmountUpdated(claimAmount, newAmount);
        claimAmount = newAmount;
    }

    function setCooldown(
        uint256 newCooldown
    ) external onlyOwner {
        require(newCooldown > 0, "Cooldown must be > 0");
        emit CooldownUpdated(cooldown, newCooldown);
        cooldown = newCooldown;
    }

    function transferOwnership(
        address newOwner
    ) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}
