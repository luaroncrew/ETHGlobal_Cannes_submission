const fs = require('fs').promises;
const path = require('path');

// FIXME Call rolrus API to get data
class StorageService {
  constructor() {
    this.dataPath = path.join(__dirname, '..', 'data', 'data.json');
  }

  async getData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error when reading the file data.json:', error);
      throw new Error('It is not possible to retrieve data');
    }
  }
}

module.exports = new StorageService(); 