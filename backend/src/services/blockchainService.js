const { ethers } = require("ethers");
const { updateTransactionStatus } = require("../models/userModel");

// Mock ABI - You will replace this with your compiled Escrow ABI
const escrowABI = [
  "event SessionRefunded(uint256 sessionId, address learner, uint256 amount)",
];
const escrowAddress = "0xYourEscrowContractAddressHere";

function startBlockchainListener() {
  const provider = new ethers.JsonRpcProvider(process.env.BNB_RPC_URL);
  const escrowContract = new ethers.Contract(
    escrowAddress,
    escrowABI,
    provider,
  );

  console.log(" Web3 Listener active. Watching Escrow Contract...");

  escrowContract.on(
    "SessionRefunded",
    async (sessionId, learner, amount, event) => {
      console.log(`🚨 Web3 Alert: Refund detected for Session ${sessionId}!`);

      try {
        const dbSessionId = sessionId.toString();
        await updateTransactionStatus(dbSessionId, "Refunded");
        console.log(
          `✅ Database synced. Session ${dbSessionId} marked as Refunded.`,
        );
      } catch (error) {
        console.error(
          "❌ CRITICAL: Failed to update database for refund:",
          error,
        );
      }
    },
  );
}

module.exports = startBlockchainListener;
