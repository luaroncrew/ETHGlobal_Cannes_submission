const regression = require('../services/ia/regression');

exports.handleRequest = async (req, res) => {
  try {
    // Toutes les fonctionnalités TODO ont été implémentées dans le service de régression
    const result = await regression.calcRegression();
    res.json(result);
  } catch (err) {
    console.error('Erreur dans le contrôleur compute_models:', err);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: err.message,
      success: false
    });
  }
};