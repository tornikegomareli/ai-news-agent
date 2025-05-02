import { pool } from '../../config/database';
import { User, UserConfig } from '../User';
import { logger } from '../../utils/logger';
import { encrypt, decrypt } from '../../utils/encryption';

export class UserRepository {
  // Create or update a user
  async saveUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const { email, telegramId, deliveryChannel, deliveryFrequency } = user;
      
      const result = await pool.query(
        `INSERT INTO users (email, telegram_id, delivery_channel, delivery_frequency)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
         SET telegram_id = EXCLUDED.telegram_id,
             delivery_channel = EXCLUDED.delivery_channel,
             delivery_frequency = EXCLUDED.delivery_frequency,
             updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [email, telegramId, deliveryChannel, deliveryFrequency]
      );
      
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error saving user', { error });
      throw error;
    }
  }
  
  // Get a user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error getting user by ID', { error, userId });
      throw error;
    }
  }
  
  // Get a user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error getting user by email', { error, email });
      throw error;
    }
  }
  
  // Save user config with encrypted API key
  async saveUserConfig(config: Omit<UserConfig, 'id' | 'encryptedApiKey' | 'createdAt' | 'updatedAt'> & { apiKey: string }): Promise<UserConfig> {
    try {
      const { userId, categoryFocus, sourcePreferences, customSources, customPrompt, llmProvider, llmModel, apiKey } = config;
      
      // Encrypt the API key
      const { encryptedData, iv } = encrypt(apiKey);
      
      const result = await pool.query(
        `INSERT INTO user_configs 
         (user_id, category_focus, source_preferences, custom_sources, custom_prompt, llm_provider, llm_model, encrypted_api_key, iv)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT ((user_id)) DO UPDATE
         SET category_focus = EXCLUDED.category_focus,
             source_preferences = EXCLUDED.source_preferences,
             custom_sources = EXCLUDED.custom_sources,
             custom_prompt = EXCLUDED.custom_prompt,
             llm_provider = EXCLUDED.llm_provider,
             llm_model = EXCLUDED.llm_model,
             encrypted_api_key = EXCLUDED.encrypted_api_key,
             iv = EXCLUDED.iv,
             updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          userId, 
          categoryFocus, 
          JSON.stringify(sourcePreferences), 
          customSources ? JSON.stringify(customSources) : null, 
          customPrompt, 
          llmProvider, 
          llmModel, 
          encryptedData, 
          iv
        ]
      );
      
      return this.mapDbConfigToConfig(result.rows[0]);
    } catch (error) {
      logger.error('Error saving user config', { error });
      throw error;
    }
  }
  
  // Get user config with decrypted API key
  async getUserConfig(userId: string): Promise<(UserConfig & { apiKey: string }) | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM user_configs WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const config = this.mapDbConfigToConfig(result.rows[0]);
      const apiKey = decrypt(config.encryptedApiKey, result.rows[0].iv);
      
      return {
        ...config,
        apiKey
      };
    } catch (error) {
      logger.error('Error getting user config', { error, userId });
      throw error;
    }
  }
  
  // Helper: Map database user row to User model
  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      telegramId: dbUser.telegram_id,
      deliveryChannel: dbUser.delivery_channel,
      deliveryFrequency: dbUser.delivery_frequency,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    };
  }
  
  // Helper: Map database config row to UserConfig model
  private mapDbConfigToConfig(dbConfig: any): UserConfig {
    return {
      id: dbConfig.id,
      userId: dbConfig.user_id,
      categoryFocus: dbConfig.category_focus,
      sourcePreferences: JSON.parse(dbConfig.source_preferences),
      customSources: dbConfig.custom_sources ? JSON.parse(dbConfig.custom_sources) : undefined,
      customPrompt: dbConfig.custom_prompt,
      llmProvider: dbConfig.llm_provider,
      llmModel: dbConfig.llm_model,
      encryptedApiKey: dbConfig.encrypted_api_key,
      createdAt: dbConfig.created_at,
      updatedAt: dbConfig.updated_at
    };
  }
}