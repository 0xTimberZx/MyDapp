// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract HelloWorld {

    string public message;
    address public lastSender;
    uint public lastUpdated;
    address public compiler;
    address public immutable owner;

    event MessageUpdated(
        address indexed sender,
        string newMessage,
        uint timestamp
    );

    event CompilerUpdated(
        address indexed oldCompiler,
        address indexed newCompiler
    );

    constructor() {
        message = "Hello from the blockchain!";
        lastSender = msg.sender;
        lastUpdated = block.timestamp;
        owner = msg.sender;
    }

    modifier onlyCompiler() {
        require(
            msg.sender == compiler || msg.sender == owner,
            "Not authorized"
        );
        _;
    }

    function setCompiler(address newCompiler) public {
        require(msg.sender == owner, "Not owner");
        require(newCompiler != address(0), "Zero address not allowed");
        emit CompilerUpdated(compiler, newCompiler);
        compiler = newCompiler;
    }

    function updateMessage(
        string memory newMessage
    ) public {
        message = newMessage;
        lastSender = msg.sender;
        lastUpdated = block.timestamp;
        emit MessageUpdated(msg.sender, newMessage, block.timestamp);
    }
}
