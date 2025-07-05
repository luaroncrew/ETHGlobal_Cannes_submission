const storageService = require('../services/storage');
const fs = require('fs').promises;
const path = require('path');

exports.handleRequest = async (req, res) => {
  try {
    // Check if req and res are defined
    if (!req) {
      console.error('ERROR: req is undefined');
      throw new Error('Request object is undefined');
    }
    if (!res) {
      console.error('ERROR: res is undefined');
      throw new Error('Response object is undefined');
    }

    console.log('Predict result request received');
    
    // Extract the parameters from the body
    const body = req.body || {};
    const {
      heartrate_average_last_3_days,
      blood_pressure_diastolic,
      blood_pressure_sistolic,
      age
    } = body;

    console.log('Body:', body);

    // Validate the parameters
    const validation = validatePredictParams({
      heartrate_average_last_3_days,
      blood_pressure_diastolic,
      blood_pressure_sistolic,
      age
    });

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Errors in the parameters validation',
        errors: validation.errors,
        success: false
      });
    }

    // Check if the model.json file exists
    const modelPath = path.join(__dirname, '..', 'data', 'hospitals', 'model.json');
    
    let modelData;
    try {
      const modelFile = await fs.readFile(modelPath, 'utf8');
      modelData = JSON.parse(modelFile);
    } catch (error) {
      console.error('Error reading model file:', error);
      return res.status(404).json({
        error: 'Model Not Found',
        message: 'The model.json file does not exist. Please first calculate the aggregation.',
        success: false
      });
    }

    // Check if the model contains the necessary data
    if (!modelData.aggregatedWeight || !modelData.aggregatedWeight.weights || typeof modelData.aggregatedWeight.bias !== 'number') {
      return res.status(400).json({
        error: 'Invalid Model',
        message: 'The model does not contain the necessary weights and bias.',
        success: false
      });
    }

    const { weights, bias } = modelData.aggregatedWeight;

    // Vérifier que nous avons le bon nombre de poids (4)
    if (weights.length !== 4) {
      return res.status(400).json({
        error: 'Invalid Model',
        message: `The model must contain exactly 4 weights, but it contains ${weights.length}.`,
        success: false
      });
    }

    // Calculate the prediction with linear regression
    // Order of weights: heartrate_average_last_3_days, blood_pressure_diastolic, blood_pressure_sistolic, age
    const prediction = 
      weights[0] * heartrate_average_last_3_days +
      weights[1] * blood_pressure_diastolic +
      weights[2] * blood_pressure_sistolic +
      weights[3] * age +
      bias;

    // Round the prediction to 1 decimal place
    const roundedPrediction = Math.round(prediction * 10) / 10;

    // Return the response with the styled phrase
    res.json({
      message: `Your expected life expectancy is ${roundedPrediction} years.`,
      prediction: roundedPrediction,
      success: true
    });

  } catch (err) {
    console.error('Error:', err);
    
    // Additional check for res in case of error
    if (res && typeof res.status === 'function') {
      res.status(500).json({ 
        error: 'Server error',
        message: err.message,
        success: false
      });
    } else {
      console.error('Cannot send response - res object is invalid');
    }
  }
};

function validatePredictParams(params) {
  const errors = [];

  // Validation of heartrate_average_last_3_days
  if (params.heartrate_average_last_3_days === undefined || params.heartrate_average_last_3_days === null) {
    errors.push('heartrate_average_last_3_days is required');
  } else if (typeof params.heartrate_average_last_3_days !== 'number') {
    errors.push('heartrate_average_last_3_days must be a number');
  } else if (params.heartrate_average_last_3_days <= 0 || params.heartrate_average_last_3_days > 300) {
    errors.push('heartrate_average_last_3_days must be between 1 and 300');
  }

  // Validation de blood_pressure_diastolic
  if (params.blood_pressure_diastolic === undefined || params.blood_pressure_diastolic === null) {
    errors.push('blood_pressure_diastolic is required');
  } else if (typeof params.blood_pressure_diastolic !== 'number') {
    errors.push('blood_pressure_diastolic must be a number');
  } else if (params.blood_pressure_diastolic <= 0 || params.blood_pressure_diastolic > 200) {
    errors.push('blood_pressure_diastolic must be between 1 and 200');
  }

  // Validation de blood_pressure_sistolic
  if (params.blood_pressure_sistolic === undefined || params.blood_pressure_sistolic === null) {
    errors.push('blood_pressure_sistolic est requis');
  } else if (typeof params.blood_pressure_sistolic !== 'number') {
    errors.push('blood_pressure_sistolic must be a number');
  } else if (params.blood_pressure_sistolic <= 0 || params.blood_pressure_sistolic > 300) {
    errors.push('blood_pressure_sistolic must be between 1 and 300');
  }

  // Validation de age
  if (params.age === undefined || params.age === null) {
    errors.push('age is required');
  } else if (typeof params.age !== 'number') {
    errors.push('age must be a number');
  } else if (params.age <= 0 || params.age > 150) {
    errors.push('age must be between 1 and 150');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 