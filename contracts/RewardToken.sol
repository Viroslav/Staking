// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC20.sol";

contract RewardToken is ERC20 {
    constructor() ERC20("TokenForRewards", "TFR"){
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
