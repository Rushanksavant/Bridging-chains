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
        address from,
        address to,
        uint256 amount,
        uint256 date,
        uint256 nonce,
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
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        // check if txn already executed
        require(!caller_txnNonce[msg.sender][nonce], "txn already executed");

        caller_txnNonce[msg.sender][nonce] = true;

        token.burn(msg.sender, amount);

        emit Transfer(
            msg.sender,
            to,
            amount,
            block.timestamp,
            nonce,
            signature,
            Step.Burn
        );
    }

    // following functions are to verify signature
    //------------------------------------------------------------------------------------------------------//
    function prefix(bytes32 _hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            );
    }

    function splitSignature(bytes memory signature)
        internal
        pure
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        require(signature.length == 65, "Invalid signature");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }

        return (v, r, s);
    }

    function getSigner(bytes32 message, bytes memory signature)
        internal
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;

        (v, r, s) = splitSignature(signature);

        return ecrecover(message, v, r, s);
    }

    //------------------------------------------------------------------------------------------------------//

    function mint(
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        bytes32 message = prefix(
            keccak256(abi.encodePacked(from, to, amount, nonce))
        );

        require(getSigner(message, signature) == from, "Invalid signature");
        require(!caller_txnNonce[from][nonce], "txn already executed");

        caller_txnNonce[from][nonce] = true;

        token.mint(to, amount);

        emit Transfer(
            from,
            to,
            amount,
            block.timestamp,
            nonce,
            signature,
            Step.Mint
        );
    }
}
