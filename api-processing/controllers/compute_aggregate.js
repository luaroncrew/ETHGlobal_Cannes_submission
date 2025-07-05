const storageService = require('../services/storage');

exports.handleRequest = async (req, res) => {
  try {
    // Get all weights
    const allWeights = await storageService.getAllWeights();
    
    if (allWeights.length === 0) {
      return res.status(404).json({ 
        error: 'Aucun fichier de poids trouvé' 
      });
    }
    
    // Calculate the weighted average
    const aggregatedWeight = computeWeightedAverage(allWeights);
    
    // Create the response
    const response = {
      aggregatedWeight,
      numberOfHospitals: allWeights.length,
      totalSamples: aggregatedWeight.numberOfSamples,
      timestamp: new Date().toISOString()
    };
    
    // Store the model before returning the response
    await storageService.storeModel(response);
    
    res.json(response);
    
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).json({ 
      error: 'Error when calculating the aggregation', 
      message: err.message 
    });
  }
};

function computeWeightedAverage(weightsData) {
  let totalSamples = 0;
  let weightedWeights = null;
  let weightedBias = 0;
  
  // Calculate the total sum of samples
  for (const data of weightsData) {
    totalSamples += data.weight.numberOfSamples;
  }
  
  // Calculate the weighted averages
  for (const data of weightsData) {
    const weight = data.weight.numberOfSamples / totalSamples;
    
    // Initialize the weights array if not already done
    if (weightedWeights === null) {
      weightedWeights = new Array(data.weight.weights.length).fill(0);
    }
    
    // Add the weighted weights
    for (let i = 0; i < data.weight.weights.length; i++) {
      weightedWeights[i] += data.weight.weights[i] * weight;
    }
    
    // Add the weighted bias
    weightedBias += data.weight.bias * weight;
  }
  
  return {
    weights: weightedWeights,
    bias: weightedBias,
    numberOfSamples: totalSamples
  };
} 