/* eslint-disable import/no-anonymous-default-export */

// Cấu hình MongoDB
export const dbConfig = {
  uri: process.env.MONGODB_URI,
  dbName: 'football_analysis'
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
  db: dbConfig,
  app: appConfig
}; 