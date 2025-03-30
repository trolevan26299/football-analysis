/* eslint-disable import/no-anonymous-default-export */

// Cấu hình MongoDB
export const dbConfig = {
  uri: process.env.MONGODB_URI,
  dbName: 'football_analysis'
};

// Cấu hình NextAuth
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000'
};

// Cấu hình API
export const apiConfig = {
  apiKey: process.env.API_KEY || 'your-secure-api-key-change-me'
};

// Cấu hình phân tích
export const analysisConfig = {
  // Các bài viết tối đa lấy từ nguồn bên ngoài
  maxArticles: 5,
  
  // Số ngày dữ liệu phân tích được giữ
  dataRetentionDays: 90,
  
  // Các nguồn dữ liệu phân tích
  sources: [
    { name: 'ESPN', baseUrl: 'https://www.espn.com' },
    { name: 'Goal', baseUrl: 'https://www.goal.com' },
    { name: 'BBC Sport', baseUrl: 'https://www.bbc.com/sport/football' }
  ]
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
  auth: authConfig,
  api: apiConfig,
  analysis: analysisConfig,
  app: appConfig
}; 