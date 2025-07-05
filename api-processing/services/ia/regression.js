const LinearRegression = require('./linear-regression');
const storageService = require('../storage');
const proofVerifier = require('../proof-verifier');

class RegressionService {
  constructor() {
    this.model = new LinearRegression();
    this.isTrained = false;
  }

  /**
   * Calcule la régression en implémentant tous les TODO
   * @returns {Object} - Résultats de la régression avec les poids
   */
  async calcRegression() {
    try {      
      console.log('Get data on rollus');
      const rawData = await storageService.getData();
      
      if (!rawData || !Array.isArray(rawData)) {
        throw new Error('The format of data is not valid');
      }

      console.log('Verify proofs...');
      const proofResults = await proofVerifier.verifyProofs(rawData);
      
      if (proofResults.invalid.length > 0) {
        console.warn(`Warning: ${proofResults.invalid.length} rows with invalid proofs`);
      }      
      if (proofResults.errors.length > 0) {
        console.warn(`Warning: ${proofResults.errors.length} errors when verifying proofs`);
      }

      // Get only valid data
      const validData = proofResults.valid;
      
      if (validData.length === 0) {
        throw new Error('No valid data found after verifying proofs');
      }

      console.log(`Use ${validData.length}/${rawData.length} rows of valid data for training`);

      // Train the model (implem linear regression)
      console.log('Training the linear regression model...');
      const trainingResults = this.model.train(validData);
      
      this.isTrained = true;

      // Retourner les poids
      const result = {
        success: true,
        message: 'Regression calculated successfully',
        model: {
          weights: trainingResults.weights,
          bias: trainingResults.bias
        },
        training: {
          finalMSE: trainingResults.finalMSE,
          epochs: trainingResults.history.length * 100,
          history: trainingResults.history
        },
        data: {
          totalRows: rawData.length,
          validRows: validData.length,
          invalidRows: proofResults.invalid.length,
          errors: proofResults.errors.length
        },
        proofVerification: {
          valid: proofResults.valid.length,
          invalid: proofResults.invalid.length,
          errors: proofResults.errors.length
        }
      };

      return result;

    } catch (error) {
      console.error('Error when calculating the regression:', error);
      throw error;
    }
  }
}

module.exports = new RegressionService();