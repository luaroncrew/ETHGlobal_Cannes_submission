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
      
      // Écrire le fichier (overwrite si existe déjà)
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
      // Lire tous les fichiers du répertoire weights
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
}

module.exports = new StorageService(); 