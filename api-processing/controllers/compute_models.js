const regression = require('../services/ia/regression');

exports.handleRequest = async (req, res) => {
  try {
    // All features TODO have been implemented in the regression service
    const result = await regression.calcRegression();
    res.json(result);
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err.message,
      success: false
    });
  }
};