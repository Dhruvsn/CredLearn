// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SkillCredit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {

    SkillCredit public scxToken;

    uint256 public platformFeePercent = 5;

    event TutorRewarded(address indexed tutor, uint256 amount);
    event FeeUpdated(uint256 newFee);

    constructor(address _scxToken) Ownable(msg.sender) {
        scxToken = SkillCredit(_scxToken);
    }

    function rewardTutor(address tutor, uint256 amount) external onlyOwner {
        scxToken.mint(tutor, amount);
        emit TutorRewarded(tutor, amount);
    }

    function rewardTutorWithFee(address tutor, uint256 amount) external onlyOwner {
        uint256 fee = (amount * platformFeePercent) / 100;
        uint256 finalAmount = amount - fee;

        scxToken.mint(tutor, finalAmount);

        scxToken.mint(address(this), fee);

        emit TutorRewarded(tutor, finalAmount);
    }

    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 20, "Fee too high"); 
        platformFeePercent = _feePercent;

        emit FeeUpdated(_feePercent);
    }

    function withdrawFees(address to, uint256 amount) external onlyOwner {
        scxToken.transfer(to, amount);
    }
}
