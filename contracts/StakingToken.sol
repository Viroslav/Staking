// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC20.sol";

contract StakingToken is ERC20 {
    constructor() ERC20("TokenForStaking", "TFS"){
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}