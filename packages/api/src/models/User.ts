export interface User {
  id: string;
  email?: string;
  telegramId?: string;
  deliveryChannel: 'email' | 'telegram';
  deliveryFrequency: 'daily' | 'every_2_days' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserConfig {
  id: string;
  userId: string;
  categoryFocus: 'technical_ai' | 'business_ai' | 'marketing_ai';
  sourcePreferences: string[]; // JSON array of source types
  customSources?: string[]; // JSON array of custom URLs
  customPrompt?: string;
  llmProvider: 'openai' | 'anthropic';
  llmModel: string;
  encryptedApiKey: string; // Encrypted API key
  createdAt: Date;
  updatedAt: Date;
}