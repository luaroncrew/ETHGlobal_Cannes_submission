/**
 * Tools for validating input parameters
 */

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

module.exports = {
  isValidUUID,
  isValidHospitalName,
  validateHospitalParams
}; 