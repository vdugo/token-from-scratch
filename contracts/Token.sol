// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token
{
    string public name = "Vince Coin";
    string public symbol = 'VIN';
    uint256 public decimals = 18;
    uint256 public totalSupply = 1000000 * (10**decimals); // 1000000 * 10^18

}
