export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  ENDPOINTS: {
    COMPUTE: "/compute",
    COMPUTE_AGGREGATE: "/compute-aggregate",
    PREDICT: "/predict-result",
  },
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
