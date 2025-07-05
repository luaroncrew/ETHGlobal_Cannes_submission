/**
 * Tools for validating input parameters
 */

const { ethers } = require('ethers');

/**
 * Validate the UUID format (version 4)
 * @param {string} uuid - The UUID to validate
 * @returns {boolean} - true if the format is valid
 */
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // Regex for UUID version 4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate hex UUID format (starting with 0x)
 * @param {string} uuid - The hex UUID to validate
 * @returns {boolean} - true if the format is valid
 */
function isValidHexUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // Regex for hex UUID: 0x followed by 32 hex characters
  const hexUuidRegex = /^0x[0-9a-f]{32}$/i;
  return hexUuidRegex.test(uuid);
}

/**
 * Validate a single patient object
 * @param {Object} patient - The patient object to validate
 * @returns {Object} - Validation result with possible errors
 */
function validatePatient(patient) {
  const errors = [];
  
  if (!patient || typeof patient !== 'object') {
    errors.push('The patient must be a valid object');
    return { isValid: false, errors };
  }

  // Validate UUID
  if (!patient.uuid) {
    errors.push('uuid is required for the patient');
  } else if (!isValidHexUUID(patient.uuid)) {
    errors.push('uuid must be a valid hexadecimal UUID (format: 0x + 32 hexadecimal characters)');
  }

  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'birthdate'];
  for (const field of requiredFields) {
    if (!patient[field] || typeof patient[field] !== 'string') {
      errors.push(`${field} is required and must be a string`);
    }
  }

  // Validate birthdate format (YYYY-MM-DD)
  if (patient.birthdate && !/^\d{4}-\d{2}-\d{2}$/.test(patient.birthdate)) {
    errors.push('birthdate must be in the format YYYY-MM-DD');
  }

  // Validate features object
  if (!patient.features || typeof patient.features !== 'object') {
    errors.push('features is required and must be an object');
  } else {
    const requiredFeatures = [
      'heartrate_average_last_3_days',
      'blood_pressure_diastolic',
      'blood_pressure_sistolic',
      'age'
    ];
    
    for (const feature of requiredFeatures) {
      if (typeof patient.features[feature] !== 'number') {
        errors.push(`features.${feature} is required and must be a number`);
      }
    }
  }

  // Validate target object
  if (!patient.target || typeof patient.target !== 'object') {
    errors.push('target is required and must be an object');
  } else {
    if (typeof patient.target.life_expectancy !== 'number') {
      errors.push('target.life_expectancy is required and must be a number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate an array of patients
 * @param {Array} patients - The array of patients to validate
 * @returns {Object} - Validation result with possible errors
 */
function validatePatients(patients) {
  const errors = [];
  
  if (!Array.isArray(patients)) {
    errors.push('patients must be an array');
    return { isValid: false, errors };
  }

  if (patients.length === 0) {
    errors.push('the patients array cannot be empty');
    return { isValid: false, errors };
  }

  const uuids = new Set();
  
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const validation = validatePatient(patient);
    
    if (!validation.isValid) {
      errors.push(`Patient ${i + 1}: ${validation.errors.join(', ')}`);
    } else {
      // Check UUID uniqueness
      if (uuids.has(patient.uuid)) {
        errors.push(`Patient ${i + 1}: UUID ${patient.uuid} is already used in this array`);
      } else {
        uuids.add(patient.uuid);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate the complete hospital parameters
 * @param {Object} params - The parameters to validate
 * @param {string} params.hospitalUUID - UUID of the hospital
 * @param {Array} params.patients - Array of patients (optional)
 * @returns {Object} - Validation result with possible errors
 */
function validateHospitalParams(params) {
  const errors = [];
  
  if (!params.hospitalUUID) {
    errors.push('hospitalUUID is required');
  } else if (!isValidUUID(params.hospitalUUID)) {
    errors.push('hospitalUUID must be a valid UUID (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)');
  }

  // Validate patients if provided
  if (params.patients !== undefined) {
    const patientsValidation = validatePatients(params.patients);
    if (!patientsValidation.isValid) {
      errors.push(...patientsValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Convert an object patient to a formatted string to create a hash
 * @param {Object} item - The patient object to convert
 * @param {string} item.firstName - First name of the patient
 * @param {string} item.lastName - Last name of the patient
 * @param {string} item.birthdate - Date of birth of the patient
 * @param {Object} item.features - Medical characteristics of the patient
 * @param {number} item.features.heartrate_average_last_3_days - Average heart rate over the last 3 days
 * @param {number} item.features.blood_pressure_diastolic - Diastolic blood pressure
 * @param {number} item.features.blood_pressure_sistolic - Systolic blood pressure
 * @param {number} item.features.age - Age of the patient
 * @param {Object} item.target - Medical objective
 * @param {number} item.target.life_expectancy - Life expectancy
 * @returns {string} - Formatted string: firstName,lastName,heartrate,diastolic,systolic,age,life_expectancy,birthdate
 */
function itemToHashString(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('The patient object is required');
  }

  // Verify that all required fields are present
  const requiredFields = ['firstName', 'lastName', 'birthdate'];
  for (const field of requiredFields) {
    if (!item[field]) {
      throw new Error(`The field ${field} is required`);
    }
  }

  if (!item.features || typeof item.features !== 'object') {
    throw new Error('The features object is required');
  }

  if (!item.target || typeof item.target !== 'object') {
    throw new Error('The target object is required');
  }

  // Extract the values in the specified order
  const values = [
    item.firstName,
    item.lastName,
    item.features.heartrate_average_last_3_days,
    item.features.blood_pressure_diastolic,
    item.features.blood_pressure_sistolic,
    item.features.age,
    item.target.life_expectancy,
    item.birthdate
  ];

  // Verify that no value is undefined or null
  for (let i = 0; i < values.length; i++) {
    if (values[i] === undefined || values[i] === null) {
      const fieldNames = [
        'firstName', 'lastName', 'heartrate_average_last_3_days', 
        'blood_pressure_diastolic', 'blood_pressure_sistolic', 'age', 
        'life_expectancy', 'birthdate'
      ];
      throw new Error(`The value ${fieldNames[i]} is missing or invalid`);
    }
  }

  return values.join(',');
}

/**
 * Hash a string using keccak256
 * @param {string} data - The string to hash
 * @returns {string} - The keccak256 hash of the input string
 */
function hashString(data) {
  if (!data || typeof data !== 'string') {
    throw new Error('The data must be a non-empty string');
  }
  
  try {
    const hashedData = ethers.keccak256(ethers.toUtf8Bytes(data));
    return hashedData;
  } catch (error) {
    throw new Error(`Failed to hash the data: ${error.message}`);
  }
}

module.exports = {
  isValidUUID,
  isValidHexUUID,
  validatePatient,
  validatePatients,
  validateHospitalParams,
  itemToHashString,
  hashString
}; 