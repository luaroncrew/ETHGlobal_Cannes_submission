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
 * Validate the hospital name
 * @param {string} name - The name to validate
 * @returns {boolean} - true if the name is valid
 */
function isValidHospitalName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  // Remove spaces at the beginning and end then check if it's not empty
  const trimmedName = name.trim();
  
  // The name must contain at least 2 characters and maximum 100
  return trimmedName.length >= 2 && trimmedName.length <= 100;
}

/**
 * Validate the complete hospital parameters
 * @param {Object} params - The parameters to validate
 * @param {string} params.hospitalUUID - UUID of the hospital
 * @param {string} params.hospitalName - Name of the hospital
 * @returns {Object} - Validation result with possible errors
 */
function validateHospitalParams(params) {
  const errors = [];
  
  if (!params.hospitalUUID) {
    errors.push('hospitalUUID is required');
  } else if (!isValidUUID(params.hospitalUUID)) {
    errors.push('hospitalUUID must be a valid UUID (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)');
  }
  
  if (!params.hospitalName) {
    errors.push('hospitalName is required');
  } else if (!isValidHospitalName(params.hospitalName)) {
    errors.push('hospitalName must contain between 2 and 100 characters and cannot be empty');
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
  isValidHospitalName,
  validateHospitalParams,
  itemToHashString,
  hashString
}; 