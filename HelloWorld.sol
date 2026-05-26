// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {

    string public message;
    address public lastSender;
    uint public lastUpdated;
    address public compiler;
    address public owner;

    event MessageUpdated(
        address indexed sender,
        string newMessage,
        uint timestamp
    );

    constructor() {
        message = "Hello from the blockchain!";
        lastSender = msg.sender;
        lastUpdated = block.timestamp;
        owner = msg.sender;
    }

    // Only compiler contract can update message
    modifier onlyCompiler() {
        require(
            msg.sender == compiler || msg.sender == owner,
            "Not authorized"
        );
        _;
    }

    // Owner sets compiler address after deployment
    function setCompiler(address _compiler) public {
        require(msg.sender == owner, "Not owner");
        compiler = _compiler;
    }

    function updateMessage(
        string memory newMessage
    ) public onlyCompiler {
        message = newMessage;
        lastSender = msg.sender;
        lastUpdated = block.timestamp;
        emit MessageUpdated(msg.sender, newMessage, block.timestamp);
    }
}
