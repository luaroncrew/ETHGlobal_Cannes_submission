const LinearRegression = require('./linear-regression');
const storageService = require('../storage');
const proofVerifier = require('../proof-verifier');

class RegressionService {
  constructor() {
    this.model = new LinearRegression();
    this.isTrained = false;
  }

  /**
   * Calculate the regression by implementing all TODOs
   * @param {string} hospitalUUID - UUID unique de l'hôpital
   * @returns {Object} - Regression results with weights
   */
  async calcRegression(hospitalUUID) {
    try {      
      console.log(`Regression calculation for hospital: UUID: ${hospitalUUID}`);
      console.log('Get data on rollus');
      const rawData = await storageService.getData(hospitalUUID);
      
      if (!rawData || !Array.isArray(rawData)) {
        throw new Error('The format of data is not valid');
      }

      // TODO: Filtrer les données par hospitalUUID si nécessaire
      // const hospitalData = rawData.filter(item => item.hospitalUUID === hospitalUUID);

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

      // Store the weights
      await storageService.storeWeight(hospitalUUID, {weights: trainingResults.weights, bias: trainingResults.bias, numberOfSamples: validData.length});
      
      this.isTrained = true;

      // Return the weights
      const result = {
        success: true,
        message: 'Regression calculated successfully',
        hospital: {
          uuid: hospitalUUID
        },
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