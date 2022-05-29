//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenBase is ERC20 {
    address public owner;

    constructor() ERC20("Bridge Testing Token", "BTT") {
        owner = msg.sender;
        _mint(msg.sender, 100000 * 10**18); // keeping 100k tokens with me
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not allowed");
        _;
    }

    function updateOwner(address _bridgeContract) external onlyOwner {
        // I will change owner to bridge contract
        owner = _bridgeContract;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address holder, uint256 amount) external onlyOwner {
        _burn(holder, amount);
    }
}
