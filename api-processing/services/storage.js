const fs = require('fs').promises;
const path = require('path');

// FIXME Call rolrus API to get data
class StorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.weightsDir = path.join(this.dataDir, 'hospitals', 'weights');
    this.samplesDir = path.join(this.dataDir, 'hospitals', 'samples');
  }

  async getData(uuidHospital) {
    try {
      const fileName = `${uuidHospital}.json`;
      const filePath = path.join(this.samplesDir, fileName);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error when reading the file ${fileName}:`, error);
      throw new Error('It is not possible to retrieve data');
    }
  }

  async storeWeight(uuidHospital, weight) {
    try {    
      await fs.mkdir(this.weightsDir, { recursive: true });
      
      const fileName = `${uuidHospital}.json`;
      const filePath = path.join(this.weightsDir, fileName);
      
      // Données à stocker
      const data = {
        uuidHospital,
        weight,
        timestamp: new Date().toISOString()
      };
      
      // Write the file (overwrite if it already exists)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`Weight stored successfully for hospital ${uuidHospital}`);
      return { success: true, message: 'Weight stored successfully' };
    } catch (error) {
      console.error(`Error when storing weight for hospital ${uuidHospital}:`, error);
      throw new Error('Unable to store weight data');
    }
  }

  async getAllWeights() {
    try {
      // Read all files in the weights directory
      const files = await fs.readdir(this.weightsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const weights = [];
      for (const file of jsonFiles) {
        const filePath = path.join(this.weightsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const weightData = JSON.parse(data);
        weights.push(weightData);
      }
      
      return weights;
    } catch (error) {
      console.error('Error when reading weights files:', error);
      throw new Error('Unable to retrieve weights data');
    }
  }

  async storeModel(aggregatedData) {
    try {
      const filePath = path.join(this.dataDir, 'hospitals', 'model.json');
      
      // Create the directory if it does not exist
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Write the file (overwrite if it already exists)
      await fs.writeFile(filePath, JSON.stringify(aggregatedData, null, 2), 'utf8');
      
      console.log('Model stored successfully');
      return { success: true, message: 'Model stored successfully' };
    } catch (error) {
      console.error('Error when storing model:', error);
      throw new Error('Unable to store model data');
    }
  }
}

module.exports = new StorageService(); 