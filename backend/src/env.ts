import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, required = true): string => {
  const value = process.env[key];
  if (required && (value === undefined || value === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? '';
};

export const ENV = {
  PORT: parseInt(getEnv('PORT', false) || '5000', 10),
  NODE_ENV: getEnv('NODE_ENV', false) || 'development',
  MONGO_URI: getEnv('MONGO_URI'),
  FRONTEND_ORIGIN: getEnv('FRONTEND_ORIGIN'),
  BACKEND_TARGET_URL: getEnv('BACKEND_TARGET_URL'),
  GEMINI_API_KEY: getEnv('GEMINI_API_KEY', false),
} as const;
