const express = require('express');
const dotenv = require('dotenv');
const apiController = require('./controllers/compute_models');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.post('/compute', apiController.handleRequest);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});