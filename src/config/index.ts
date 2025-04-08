/* eslint-disable import/no-anonymous-default-export */

// Cấu hình MongoDB
export const dbConfig = {
  uri: process.env.MONGODB_URI,
  dbName: 'football_analysis'
};

export const apiConfig = {
  apiKey: process.env.API_KEY || 'your-secure-api-key-change-me'
};


// Cấu hình ứng dụng
export const appConfig = {
  name: 'Football Analysis',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
};

export default {
  api: apiConfig,
  db: dbConfig,
  app: appConfig
}; 