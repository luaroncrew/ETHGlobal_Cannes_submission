# Système de Régression avec Vérification des Preuves

Ce projet implémente un système complet de régression linéaire avec vérification cryptographique des preuves pour chaque ligne de données.

## 🚀 Fonctionnalités

### ✅ TODO Implémentés

1. **Récupération des données** - Service de stockage pour récupérer les données depuis un fichier JSON
2. **Vérification des preuves** - Vérification cryptographique de chaque ligne de données
3. **Entraînement du modèle** - Implémentation complète de la régression linéaire
4. **Retour des poids** - Retour des paramètres du modèle entraîné

## 📁 Structure du Projet

```
├── controllers/
│   └── compute_models.js          # Contrôleur principal
├── services/
│   ├── storage.js                 # Service de stockage des données
│   ├── proof-verifier.js          # Service de vérification des preuves
│   └── ia/
│       ├── regression.js          # Service principal de régression
│       └── linear-regression.js   # Implémentation de la régression linéaire
├── data/
│   └── data.json                  # Données d'exemple avec preuves
├── utils/
│   └── generate-sample-data.js    # Script de génération de données
└── README.md                      # Documentation
```

## 🔧 Services Créés

### 1. Service de Stockage (`services/storage.js`)
- Récupération des données depuis `data/data.json`
- Sauvegarde des données et modèles entraînés
- Gestion automatique du dossier `data/`

### 2. Service de Vérification des Preuves (`services/proof-verifier.js`)
- Vérification des preuves par hash SHA-256
- Support pour différents types de preuves (hash, signature, timestamp)
- Génération de preuves pour nouvelles données
- Validation complète de l'intégrité des données

### 3. Service de Régression Linéaire (`services/ia/linear-regression.js`)
- Implémentation complète de la régression linéaire
- Gradient descent avec normalisation des données
- Calcul des métriques de performance (MSE, R², MAE)
- Sauvegarde et chargement des modèles

### 4. Service Principal de Régression (`services/ia/regression.js`)
- Orchestration de tous les services
- Implémentation de tous les TODO
- Gestion des erreurs et validation
- Interface unifiée pour l'API

## 📊 Format des Données

Les données doivent être au format JSON avec la structure suivante :

```json
[
  {
    "features": [2.5, 1.2],
    "target": 8.6,
    "id": "sample_1",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "proof": {
      "type": "hash",
      "hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      "timestamp": 1705312200000
    }
  }
]
```

## 🧪 Utilisation

### Génération de Données d'Exemple

```bash
node utils/generate-sample-data.js generate
```

### Test du Système Complet

```bash
node utils/generate-sample-data.js test
```

### Utilisation via API

```javascript
const regression = require('./services/ia/regression');

// Calculer la régression
const result = await regression.calcRegression();

// Faire des prédictions
const predictions = await regression.predict([
  { features: [3.0, 2.0] },
  { features: [1.5, 1.0] }
]);
```

## 🔒 Sécurité

### Vérification des Preuves

Le système vérifie automatiquement :
- **Intégrité des données** via hash SHA-256
- **Authenticité** via signatures cryptographiques
- **Fraîcheur** via timestamps

### Types de Preuves Supportés

1. **Hash** - Vérification d'intégrité basique
2. **Signature** - Vérification d'authenticité
3. **Timestamp** - Vérification de fraîcheur

## 📈 Métriques de Performance

Le système retourne :
- **Poids du modèle** - Paramètres de la régression
- **Biais** - Terme constant
- **MSE** - Erreur quadratique moyenne
- **R²** - Coefficient de détermination
- **MAE** - Erreur absolue moyenne

## 🛠️ Installation et Démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Générer des données d'exemple :
```bash
node utils/generate-sample-data.js generate
```

3. Démarrer l'application :
```bash
npm start
```

## 🔍 Exemple de Réponse API

```json
{
  "success": true,
  "message": "Régression calculée avec succès",
  "model": {
    "weights": [1.2345, 2.3456],
    "bias": 0.1234,
    "normalizationParams": {
      "means": [2.5, 1.5],
      "stds": [1.2, 0.8]
    }
  },
  "training": {
    "finalMSE": 0.001234,
    "epochs": 1000,
    "history": [...]
  },
  "data": {
    "totalRows": 50,
    "validRows": 48,
    "invalidRows": 2,
    "errors": 0
  },
  "proofVerification": {
    "valid": 48,
    "invalid": 2,
    "errors": 0
  }
}
```

## 🎯 Fonctionnalités Avancées

- **Normalisation automatique** des données
- **Gradient descent** optimisé
- **Validation croisée** des résultats
- **Sauvegarde/chargement** des modèles
- **Génération automatique** de données d'exemple
- **Gestion d'erreurs** robuste

## 📝 Notes Techniques

- Utilise Node.js avec ES6+
- Implémentation native sans dépendances externes
- Architecture modulaire et extensible
- Documentation complète en français
- Tests intégrés dans les utilitaires 