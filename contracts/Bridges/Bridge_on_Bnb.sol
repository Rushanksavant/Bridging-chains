//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "../BridgeBase.sol";

contract Bridge_on_Bnb is BridgeBase {
    constructor(address token) BridgeBase(token) {
        // the bridge on BSC
    }
}
