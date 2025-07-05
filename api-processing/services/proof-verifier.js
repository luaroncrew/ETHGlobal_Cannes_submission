const { itemToHashString, hashString } = require('../utils/validators');
const { ethers } = require('ethers');
require('dotenv').config();

// Configuration du contrat
const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '0x049b020fb337fE3699edb0493D2a981c49D9f787';
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "userId", "type": "uint256"}],
    "name": "getUserRecordsHash",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "userRecordsHash",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class ProofVerifier {
  constructor() {
    // Configuration of the blockchain provider from environment variables
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://alfajores-forno.celo-testnet.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log(`🌐 Blockchain provider configured: ${rpcUrl}`);
    
    // Initialize the contract
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
    console.log(`📋 Contract configured at address: ${CONTRACT_ADDRESS}`);
  }

  /**
     * Get the user records hash from the contract
     * @param {number|string|BigInt} userId - User ID
     * @returns {string} - The hash of the records in string
   */
  async getUserRecordsHash(userId) {
    try {
      console.log(`🔍 Getting hash for user ID: ${userId.toString()}`);
      
      // Call the userRecordsHash function of the contract
      // ethers.js automatically handles BigInt
      const hashBytes = await this.contract.userRecordsHash(userId);
      
      console.log(`📦 Raw hash received: ${hashBytes}`);
      
      // Convert bytes to string if necessary
      if (hashBytes === '0x') {
        throw new Error(`No hash found for user ID: ${userId.toString()}`);
      }
      
      // Convert hex to string
      const hashString = ethers.toUtf8String(hashBytes);
      
      console.log(`✅ Decoded hash: ${hashString}`);
      return hashString;
      
    } catch (error) {
      console.error(`❌ Error getting hash for user ID: ${userId.toString()}:`, error.message);
      throw new Error(`Error getting hash: ${error.message}`);
    }
  }


  /**
   * Verify proofs for each line in a data table
   * @param {Array} data - Data table with proofs
   * @returns {Object} - Verification result
   */
  async verifyProofs(data) {
    const results = {
      valid: [],
      invalid: [],
      errors: []
    };

    if (!Array.isArray(data)) {
        throw new Error('The data must be an array');
    }

    for (let i = 0; i < data.length; i++) {
      try {
        // Check if the UUID exists
        if (!data[i].uuid) {
          throw new Error(`UUID missing for line ${i}`);
        }

        // Convert item to formatted string for hashing
        const formattedString = itemToHashString(data[i]);
        
        // Hash the formatted string
        const hashedData = hashString(formattedString);
        
        console.log(`Row ${i}: Formatted string = ${formattedString}`);
        console.log(`Row ${i}: Hash = ${hashedData}`);
        console.log(`Row ${i}: UUID = ${data[i].uuid}`);

        // Use the UUID as userId to get the hash from the contract
        // Convert the UUID hex to BigInt to avoid overflow
        let userId;
        if (data[i].uuid.startsWith('0x')) {
          userId = BigInt(data[i].uuid);
        } else {
          // If it's not a hex, try to convert it to BigInt
          userId = BigInt(data[i].uuid);
        }
        
        console.log(`Row ${i}: Converted UserID: ${userId.toString()}`);
        
        const blockchainHash = await this.getUserRecordsHash(userId);
        
        console.log(`Row ${i}: Blockchain hash = ${blockchainHash}`);

        // Compare the local hash with the blockchain hash
        if (hashedData === blockchainHash) {
          console.log(`✓ Proof verified for row ${i}: Hash matches blockchain data`);
          results.valid.push(data[i]);
        } else {
          console.log(`✗ Proof invalid for row ${i}: Hash mismatch`);
          results.invalid.push({
            index: i,
            item: data[i],
            reason: 'Hash mismatch with blockchain data',
            localHash: hashedData,
            blockchainHash: blockchainHash
          });
        }
        
      } catch (error) {
        console.error(`Error processing row ${i}:`, error.message);
        results.errors.push({
          index: i,
          item: data[i],
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = new ProofVerifier(); 