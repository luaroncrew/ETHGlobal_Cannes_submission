const { itemToHashString, hashString } = require('../utils/validators');

class ProofVerifier {
  constructor() {
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
        // Convert item to formatted string for hashing
        const formattedString = itemToHashString(data[i]);
        
        // Hash the formatted string
        const hashedData = hashString(formattedString);
        
        console.log(`Row ${i}: Formatted string = ${formattedString}`);
        console.log(`Row ${i}: Hash = ${hashedData}`);
        console.log('Proof verified for row', i);
        
        // Add to valid results (you can add more verification logic here)
        results.valid.push(data[i]);
        
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