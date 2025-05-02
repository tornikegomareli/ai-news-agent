import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Create a pool of Postgres clients
export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.POSTGRES_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined,
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    logger.info('Successfully connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database', { error });
    return false;
  }
};

// Initialize database with required tables
export const initDatabase = async (): Promise<void> => {
  try {
    await testConnection();
    
    // Required initialization can go here
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed', { error });
    throw error;
  }
};