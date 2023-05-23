// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token
{
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track balances
    mapping(address => uint256) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply)
    {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals); // 1000000 * 10^18
        // give the deployer of the contract the entire supply of tokens at first
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns(bool success)
    {
        require(balanceOf[msg.sender] >= _value, "insufficient token balance");
        require(_to != address(0));
        // deduct tokens from spender
        balanceOf[msg.sender] -= _value;
        // credit tokens to receiver
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

}
