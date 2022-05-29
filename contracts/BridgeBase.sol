//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITokenBase {
    function mint(address to, uint256 amount) external;

    function burn(address holder, uint256 amount) external;
}

contract BridgeBase {
    address public owner;
    ITokenBase public token;

    mapping(address => mapping(uint256 => bool)) public caller_txnNonce;

    enum Step {
        Burn,
        Mint
    }

    event Transfer(
        address indexed to,
        uint256 amount,
        uint256 date,
        uint256 indexed nonce,
        bytes signature,
        Step indexed step
    );

    constructor(address _token) {
        owner = msg.sender;
        token = ITokenBase(_token);
    }

    function getNonce(uint256 _nonce) external view returns (bool) {
        return (caller_txnNonce[msg.sender][_nonce]);
    }

    function burn(
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(!caller_txnNonce[msg.sender][nonce], "txn already executed"); // check if txn already execute

        caller_txnNonce[msg.sender][nonce] = true;

        token.burn(msg.sender, amount);

        emit Transfer(
            msg.sender,
            amount,
            block.timestamp,
            nonce,
            signature,
            Step.Burn
        );
    }

    function mint(
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        address to = msg.sender;
        require(
            verifySignature(to, amount, nonce, signature) == to,
            "Invalid signature"
        );
        require(!caller_txnNonce[to][nonce], "txn already executed");

        caller_txnNonce[to][nonce] = true;

        token.mint(to, amount);

        emit Transfer(to, amount, block.timestamp, nonce, signature, Step.Mint);
    }

    // to verify signature
    function verifySignature(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature size");

        bytes32 r;
        bytes32 s;
        uint8 v;

        bytes32 _hash = keccak256(abi.encodePacked(to, amount, nonce));
        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
        );

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }

        return ecrecover(message, v, r, s);
    }
}
