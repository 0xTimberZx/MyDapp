// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHelloWorld {
    function updateMessage(string memory newMessage) external;
}

interface IDAppToken {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract StringCompiler {

    // Cost per compile segment paid at publish time
    uint256 public pricePerCompile = 10 * 10**18;

    // Store each user's data separately
    mapping(address => string) public compiledStrings;
    mapping(address => uint256) public compileCount;

    // Contract addresses
    address public helloWorldContract;
    address public tokenContract;
    address public owner;

    // Events
    event StringCompiled(
        address indexed user,
        string addedSegment,
        uint256 totalSegments
    );

    event MessagePublished(
        address indexed user,
        string finalMessage,
        uint256 totalSegments,
        uint256 tokensCost
    );

    constructor(
        address _helloWorldContract,
        address _tokenContract
    ) {
        helloWorldContract = _helloWorldContract;
        tokenContract = _tokenContract;
        owner = msg.sender;
    }

    // Compile a string segment — FREE
    function compileString(string memory newSegment) public {

        require(
            bytes(newSegment).length > 0,
            "Segment cannot be empty"
        );

        // Append to existing compiled string
        if (compileCount[msg.sender] == 0) {
            compiledStrings[msg.sender] = newSegment;
        } else {
            compiledStrings[msg.sender] = string(
                abi.encodePacked(
                    compiledStrings[msg.sender],
                    " ",
                    newSegment
                )
            );
        }

        compileCount[msg.sender]++;

        emit StringCompiled(
            msg.sender,
            newSegment,
            compileCount[msg.sender]
        );
    }

    // Publish final message — costs tokens here
    function publishMessage() public {

        require(
            compileCount[msg.sender] > 0,
            "Nothing compiled yet"
        );

        // First compile is free, charge for remaining segments
        uint256 billableSegments = compileCount[msg.sender] - 1;
        uint256 totalCost = billableSegments * pricePerCompile;
        
        // Charge tokens at publish time
        IDAppToken(tokenContract).transferFrom(
            msg.sender,
            address(this),
            totalCost
        );

        // Get final compiled message
        string memory finalMessage = compiledStrings[msg.sender];

        // Push to HelloWorld contract
        IHelloWorld(helloWorldContract).updateMessage(finalMessage);

        emit MessagePublished(
            msg.sender,
            finalMessage,
            compileCount[msg.sender],
            totalCost
        );

        // Reset user's compiled data
        delete compiledStrings[msg.sender];
        delete compileCount[msg.sender];
    }

    // Preview current compiled string
    function getCompiledString(
        address user
    ) public view returns (string memory) {
        return compiledStrings[user];
    }

    // Get current compile count for a user
    function getCompileCount(
        address user
    ) public view returns (uint256) {
        return compileCount[user];
    }

    // Get total token cost for current compiles
    function getPublishCost(
        address user
    ) public view returns (uint256) {
        if (compileCount[user] == 0) return 0;
        uint256 billableSegments = compileCount[user] - 1;
        return billableSegments * pricePerCompile;
    }

    // Owner can update price per compile
    function setPricePerCompile(uint256 newPrice) public {
        require(msg.sender == owner, "Not owner");
        pricePerCompile = newPrice;
    }

    // Owner can withdraw collected tokens
    function withdrawTokens(
        address recipient,
        uint256 amount
    ) public {
        require(msg.sender == owner, "Not owner");
        IDAppToken(tokenContract).transferFrom(
            address(this),
            recipient,
            amount
        );
    }
}
