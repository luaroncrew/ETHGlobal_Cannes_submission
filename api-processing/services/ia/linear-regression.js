class LinearRegression {
  constructor() {
    this.weights = null;
    this.bias = 0;
    this.learningRate = 0.000001;
    this.epochs = 1000;
  }

  /**
   * Normalise les données pour améliorer la convergence
   * @param {Array} data - Données à normaliser
   * @returns {Object} - Données normalisées et paramètres de normalisation
   */
  normalizeData(data) {
    const features = data.map(row => row.features || row.x || []);
    const targets = data.map(row => row.target || row.y);
    
    // Calculer les moyennes et écarts-types pour chaque feature
    const numFeatures = features[0].length;
    const means = [];
    const stds = [];
    
    for (let i = 0; i < numFeatures; i++) {
      const column = features.map(row => row[i]);
      const mean = column.reduce((sum, val) => sum + val, 0) / column.length;
      const variance = column.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / column.length;
      const std = Math.sqrt(variance);
      
      means.push(mean);
      stds.push(std);
    }
    
    // Normaliser les features
    const normalizedFeatures = features.map(row => 
      row.map((val, i) => (val - means[i]) / (stds[i] || 1))
    );
    
    return {
      features: normalizedFeatures,
      targets: targets,
      normalizationParams: { means, stds }
    };
  }

  /**
   * Prédit la valeur pour des features données
   * @param {Array} features - Features d'entrée
   * @returns {number} - Prédiction
   */
  predict(features) {
    if (!this.weights) {
      throw new Error('Le modèle doit être entraîné avant de faire des prédictions');
    }
    
    let prediction = this.bias;
    for (let i = 0; i < features.length; i++) {
      prediction += this.weights[i] * features[i];
    }
    
    return prediction;
  }

  /**
   * Calcule l'erreur quadratique moyenne
   * @param {Array} features - Features d'entrée
   * @param {Array} targets - Valeurs cibles
   * @returns {number} - Erreur quadratique moyenne
   */
  calculateMSE(features, targets) {
    let mse = 0;
    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      mse += Math.pow(prediction - targets[i], 2);
    }
    return mse / features.length;
  }

  /**
   * Train the linear regression model
   * @param {Array} data - Training data with format [{features: {heartrate_average_last_3_days: x1, blood_pressure_diastolic: x2, blood_pressure_sistolic: x3, age: x4}, target: {life_expectancy: y}}, ...]
   * @returns {Object} - Training results
   */
  train(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Les données d\'entraînement doivent être un tableau non vide');
    }

    // Vérifier le format des données
    if (!data[0].features || !data[0].target || typeof data[0].features !== 'object' || typeof data[0].target !== 'object') {
      throw new Error('Les données doivent être au format [{features: {...}, target: {...}}, ...]');
    }    

    // Extraire les features et targets des objets
    const features = data.map(row => [
      row.features.heartrate_average_last_3_days,
      row.features.blood_pressure_diastolic,
      row.features.blood_pressure_sistolic,
      row.features.age
    ]);

    const targets = data.map(row => row.target.life_expectancy);
    
    const numFeatures = features[0].length;
    const numSamples = features.length;
    
    // Initialiser les poids et le biais
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;
    
    const history = [];
    
    // Descente de gradient
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      // Calculer les gradients
      const weightGradients = new Array(numFeatures).fill(0);
      let biasGradient = 0;
      
      for (let i = 0; i < numSamples; i++) {
        const prediction = this.predict(features[i]);
        const error = prediction - targets[i];
        
        // Gradient du biais
        biasGradient += error;
        
        // Gradients des poids
        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * features[i][j];
        }
      }
      
      // Mettre à jour les paramètres
      this.bias -= (this.learningRate * biasGradient) / numSamples;
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (this.learningRate * weightGradients[j]) / numSamples;
      }
      
      // Calculer l'erreur pour l'historique
      if (epoch % 100 === 0) {
        const mse = this.calculateMSE(features, targets);
        history.push({ epoch, mse });
      }
    }
    
    return {
      weights: this.weights,
      bias: this.bias,
      history,
      finalMSE: this.calculateMSE(features, targets)
    };
  }

  /**
   * Faire des prédictions sur de nouvelles données
   * @param {Array} newData - Nouvelles données au format [{features: {heartrate_average_last_3_days: x1, blood_pressure_diastolic: x2, blood_pressure_sistolic: x3, age: x4}}, ...]
   * @returns {Array} - Prédictions
   */
  predictBatch(newData) {
    if (!this.weights) {
      throw new Error('Le modèle doit être entraîné avant de faire des prédictions');
    }
    
    return newData.map(row => {
      const features = [
        row.features.heartrate_average_last_3_days,
        row.features.blood_pressure_diastolic,
        row.features.blood_pressure_sistolic,
        row.features.age
      ];
      return this.predict(features);
    });
  }

  /**
   * Évalue le modèle
   * @param {Array} testData - Données de test au format [{features: {heartrate_average_last_3_days: x1, blood_pressure_diastolic: x2, blood_pressure_sistolic: x3, age: x4}, target: {life_expectancy: y}}, ...]
   * @returns {Object} - Métriques de performance
   */
  evaluate(testData) {
    if (!this.weights) {
      throw new Error('Le modèle doit être entraîné avant l\'évaluation');
    }

    const features = testData.map(row => [
      row.features.heartrate_average_last_3_days,
      row.features.blood_pressure_diastolic,
      row.features.blood_pressure_sistolic,
      row.features.age
    ]);
    const targets = testData.map(row => row.target.life_expectancy);
    
    const predictions = features.map(f => this.predict(f));
    
    // Calculer le R² (coefficient de détermination)
    const meanTarget = targets.reduce((sum, val) => sum + val, 0) / targets.length;
    const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - targets[i], 2), 0);
    const ssTot = targets.reduce((sum, target) => sum + Math.pow(target - meanTarget, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    
    // Calculer l'erreur quadratique moyenne
    const mse = ssRes / targets.length;
    const rmse = Math.sqrt(mse);
    
    // Calculer l'erreur absolue moyenne
    const mae = predictions.reduce((sum, pred, i) => sum + Math.abs(pred - targets[i]), 0) / targets.length;
    
    return {
      rSquared,
      mse,
      rmse,
      mae,
      predictions
    };
  }

  /**
   * Save the trained model
   * @returns {Object} - Saved model
   */
  saveModel() {
    return {
      weights: this.weights,
      bias: this.bias,
      learningRate: this.learningRate,
      epochs: this.epochs
    };
  }

  /**
   * Load a saved model
   * @param {Object} model - Model to load
   */
  loadModel(model) {
    this.weights = model.weights;
    this.bias = model.bias;
    this.learningRate = model.learningRate || 0.01;
    this.epochs = model.epochs || 1000;
  }
}

module.exports = LinearRegression; 