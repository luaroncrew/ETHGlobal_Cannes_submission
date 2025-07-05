const storageService = require('../services/storage');

exports.handleRequest = async (req, res) => {
  try {
    // Récupérer tous les fichiers weights
    const allWeights = await storageService.getAllWeights();
    
    if (allWeights.length === 0) {
      return res.status(404).json({ 
        error: 'Aucun fichier de poids trouvé' 
      });
    }
    
    // Calculer la moyenne pondérée
    const aggregatedWeight = computeWeightedAverage(allWeights);
    
    // Créer la réponse
    const response = {
      aggregatedWeight,
      numberOfHospitals: allWeights.length,
      totalSamples: aggregatedWeight.numberOfSamples,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).json({ 
      error: 'Erreur lors du calcul de l\'agrégation', 
      message: err.message 
    });
  }
};

function computeWeightedAverage(weightsData) {
  let totalSamples = 0;
  let weightedWeights = null;
  let weightedBias = 0;
  
  // Calculer la somme totale des échantillons
  for (const data of weightsData) {
    totalSamples += data.weight.numberOfSamples;
  }
  
  // Calculer les moyennes pondérées
  for (const data of weightsData) {
    const weight = data.weight.numberOfSamples / totalSamples;
    
    // Initialiser le tableau des poids si pas encore fait
    if (weightedWeights === null) {
      weightedWeights = new Array(data.weight.weights.length).fill(0);
    }
    
    // Ajouter les poids pondérés
    for (let i = 0; i < data.weight.weights.length; i++) {
      weightedWeights[i] += data.weight.weights[i] * weight;
    }
    
    // Ajouter le bias pondéré
    weightedBias += data.weight.bias * weight;
  }
  
  return {
    weights: weightedWeights,
    bias: weightedBias,
    numberOfSamples: totalSamples
  };
} 