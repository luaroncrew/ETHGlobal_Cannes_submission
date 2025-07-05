const express = require('express');
const dotenv = require('dotenv');
const computeController = require('./controllers/compute_models');
const computeAggregateController = require('./controllers/compute_aggregate');
const predictResultController = require('./controllers/predict_result');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.post('/compute', (req, res) => computeController.handleRequest(req, res));
app.post('/compute-aggregate', (req, res) => computeAggregateController.handleRequest(req, res));
app.post('/predict-result', (req, res) => predictResultController.handleRequest(req, res));

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});