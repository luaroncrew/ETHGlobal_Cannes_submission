const regression = require('../services/ia/regression');
const { validateHospitalParams } = require('../utils/validators');

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
    
    // Extract hospital UUID and name parameters
    const body = req.body || {};
    const hospitalUUID = body?.hospitalUUID;
    const hospitalName = body?.hospitalName;

    console.log('Body: ', body);

    // Validation complète des paramètres avec les outils de validation
    const validation = validateHospitalParams({ hospitalUUID, hospitalName });

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Errors in validating parameters',
        errors: validation.errors,
        success: false
      });
    }

    // All features TODO have been implemented in the regression service
    const result = await regression.calcRegression(hospitalUUID, hospitalName);
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
