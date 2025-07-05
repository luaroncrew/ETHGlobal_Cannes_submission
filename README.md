# ETH Global Cannes 2025 - Selfcare

A decentralized machine learning platform for healthcare that allows hospitals to train models and make predictions without sharing sensitive data.

## Project Structure

```
├── api-processing/          # Backend API server
│   ├── app.js              # Main Express server
│   ├── controllers/        # API controllers
│   ├── services/           # Business logic services
│   └── data/               # Data storage
├── selfcare-front/         # Frontend Next.js application
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   └── lib/                # Utility libraries
└── postman/                # API testing collection
```

## Features

- **Federated Learning**: Train models across multiple hospitals without sharing raw data
- **Life Expectancy Prediction**: Get predictions based on health parameters
- **Model Aggregation**: Combine models from multiple hospitals for better accuracy
- **Modern UI**: Clean, responsive interface with dark mode support

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Backend Setup (API Processing)

1. Navigate to the API directory:

   ```bash
   cd api-processing
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```bash
   PORT=3000
   ```

4. Start the API server:

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000`

### Frontend Setup (Selfcare Frontend)

1. Navigate to the frontend directory:

   ```bash
   cd selfcare-front
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env.local` file with the following variables:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3001`

## API Endpoints

### 1. Compute Model

- **POST** `/compute`
- **Body**:
  ```json
  {
    "hospitalUUID": "string",
    "hospitalName": "string"
  }
  ```
- **Description**: Computes a model for the specified hospital

### 2. Aggregate Models

- **POST** `/compute-aggregate`
- **Body**: Empty
- **Description**: Aggregates models from all hospitals for better predictions

### 3. Predict Life Expectancy

- **POST** `/predict-result`
- **Body**:
  ```json
  {
    "heartrate_average_last_3_days": 72,
    "blood_pressure_diastolic": 80,
    "blood_pressure_sistolic": 120,
    "age": 45
  }
  ```
- **Description**: Predicts life expectancy based on health parameters

## Usage

### Training a Model

1. Go to the **Training** tab
2. Enter your hospital UUID and name
3. Optionally upload training data in JSON format
4. Click **"Compute Model"** to train your hospital's model
5. Click **"Aggregate Models"** to combine models from all hospitals

### Making Predictions

1. Go to the **Predict** tab
2. Enter your health parameters:
   - Heart rate (average last 3 days)
   - Age
   - Blood pressure (diastolic)
   - Blood pressure (systolic)
3. Click **"Predict Life Expectancy"** to get your prediction

## Configuration

### Environment Variables

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

#### Backend (.env)

```bash
PORT=3000
```

## Development

### Running in Development

1. Start the API server:

   ```bash
   cd api-processing
   npm start
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd selfcare-front
   npm run dev
   ```

### API Testing

Use the Postman collection in the `postman/` directory to test the API endpoints.

## Technology Stack

### Backend

- Node.js
- Express.js
- Ethers.js (for blockchain integration)
- File-based storage

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Axios for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
