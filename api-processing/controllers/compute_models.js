const regression = require('../services/ia/regression');
const storageService = require('../services/storage');
const { validateHospitalParams } = require('../utils/validators');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get the file path for hospital patients data
 * @param {string} hospitalUUID - UUID of the hospital
 * @returns {string} - File path for the hospital's patients data
 */
function getHospitalDataPath(hospitalUUID) {
  return path.join(__dirname, '..', 'data', 'hospitals', 'samples', `${hospitalUUID}.json`);
}

/**
 * Load existing patients data from file
 * @param {string} filePath - Path to the patients data file
 * @returns {Array} - Array of existing patients or empty array if file doesn't exist
 */
async function loadExistingPatients(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Check if patient UUIDs are unique against existing data
 * @param {Array} newPatients - Array of new patients to add
 * @param {Array} existingPatients - Array of existing patients
 * @returns {Object} - Validation result with duplicate UUIDs
 */
function checkPatientUUIDUniqueness(newPatients, existingPatients) {
  const existingUUIDs = new Set(existingPatients.map(p => p.uuid));
  const duplicates = [];
  
  for (const patient of newPatients) {
    if (existingUUIDs.has(patient.uuid)) {
      duplicates.push(patient.uuid);
    }
  }
  
  return {
    isUnique: duplicates.length === 0,
    duplicates: duplicates
  };
}

/**
 * Save patients data to file
 * @param {string} filePath - Path to save the data
 * @param {Array} patients - Array of patients to save
 */
async function savePatients(filePath, patients) {

  // Ensure the directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // Save the data with pretty formatting
  await fs.writeFile(filePath, JSON.stringify(patients, null, 4), 'utf8');
}


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

exports.handleRequest = async (req, res) => {
  try {
    // Vérification de sécurité - s'assurer que req et res sont définis
    if (!req) {
      console.error('ERROR: req is undefined');
      throw new Error('Request object is undefined');
    }
    if (!res) {
      console.error('ERROR: res is undefined');
      throw new Error('Response object is undefined');
    }

    console.log('Request received successfully');
    
    // Extract hospital UUID and patients parameters
    const body = req.body || {};
    const hospitalUUID = body?.hospitalUUID;
    const patients = body?.patients;

    console.log('Body: ', body);

    // Validation complète des paramètres avec les outils de validation
    const validation = validateHospitalParams({ hospitalUUID, patients });

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Errors in validating parameters',
        errors: validation.errors,
        success: false
      });
    }

    // Handle patients data storage if provided
    if (patients && Array.isArray(patients) && patients.length > 0) {
      try {
        const filePath = getHospitalDataPath(hospitalUUID);
        
        // Load existing patients data
        const existingPatients = await loadExistingPatients(filePath);
        
        // Check UUID uniqueness
        const uniquenessCheck = checkPatientUUIDUniqueness(patients, existingPatients);
        
        if (!uniquenessCheck.isUnique) {
          return res.status(409).json({
            error: 'Conflict',
            message: 'Duplicate patient UUIDs found',
            duplicates: uniquenessCheck.duplicates,
            success: false
          });
        }
        
        // Merge new patients with existing ones
        const allPatients = [...existingPatients, ...patients];
        
        // Save the merged data
        await savePatients(filePath, allPatients);
        
        console.log(`Successfully saved ${patients.length} patients for hospital ${hospitalUUID}`);
      
        
      } catch (fileError) {
        console.error('Error handling patients data:', fileError);
        return res.status(500).json({
          error: 'Storage Error',
          message: 'Failed to save patients data',
          details: fileError.message,
          success: false
        });
      }
    }

    // All features TODO have been implemented in the regression service
    const result = await regression.calcRegression(hospitalUUID);

    // ------------- Compute the aggregated weight -------------
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
      


    res.json(result);
  } catch (err) {
    console.error('Error: ', err);
    
    // Vérification supplémentaire pour res en cas d'erreur
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
