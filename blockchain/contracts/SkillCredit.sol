// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillCredit is ERC20, Ownable {

    constructor(uint256 initialSupply) 
        ERC20("SkillCredit", "SCX") 
        Ownable(msg.sender) 
    {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external {
        uint256 allowedAmount = allowance(account, msg.sender);
        require(allowedAmount >= amount, "Not enough allowance");

        _approve(account, msg.sender, allowedAmount - amount);
        _burn(account, amount);
    }
}
