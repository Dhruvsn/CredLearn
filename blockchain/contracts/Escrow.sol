// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SkillCredit.sol";

contract Escrow {

    SkillCredit public scxToken;

    struct Session {
        address learner;
        address tutor;
        uint256 amount;
        bool completed;
        bool refunded;
    }

    mapping(uint256 => Session) public sessions;
    uint256 public sessionCount;

    event SessionCreated(uint256 sessionId, address learner, address tutor, uint256 amount);
    event SessionCompleted(uint256 sessionId);
    event SessionRefunded(uint256 sessionId);

    constructor(address _scxToken) {
        scxToken = SkillCredit(_scxToken);
    }

    function createSession(address tutor, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        scxToken.transferFrom(msg.sender, address(this), amount);

        sessions[sessionCount] = Session({
            learner: msg.sender,
            tutor: tutor,
            amount: amount,
            completed: false,
            refunded: false
        });

        emit SessionCreated(sessionCount, msg.sender, tutor, amount);

        sessionCount++;
    }

    function completeSession(uint256 sessionId) external {
        Session storage session = sessions[sessionId];

        require(!session.completed, "Already completed");
        require(!session.refunded, "Already refunded");
        require(msg.sender == session.learner, "Only learner can complete");

        session.completed = true;

        scxToken.transfer(session.tutor, session.amount);

        emit SessionCompleted(sessionId);
    }

    function refundSession(uint256 sessionId) external {
        Session storage session = sessions[sessionId];

        require(!session.completed, "Already completed");
        require(!session.refunded, "Already refunded");
        require(msg.sender == session.tutor, "Only tutor can refund");

        session.refunded = true;

        scxToken.transfer(session.learner, session.amount);

        emit SessionRefunded(sessionId);
    }
}
