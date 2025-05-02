-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  telegram_id VARCHAR(255) UNIQUE,
  delivery_channel VARCHAR(20) NOT NULL CHECK (delivery_channel IN ('email', 'telegram')),
  delivery_frequency VARCHAR(20) NOT NULL CHECK (delivery_frequency IN ('daily', 'every_2_days', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_has_contact CHECK (
    (delivery_channel = 'email' AND email IS NOT NULL) OR
    (delivery_channel = 'telegram' AND telegram_id IS NOT NULL)
  )
);

-- User configurations table
CREATE TABLE IF NOT EXISTS user_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_focus VARCHAR(20) NOT NULL CHECK (category_focus IN ('technical_ai', 'business_ai', 'marketing_ai')),
  source_preferences JSONB NOT NULL, -- Array of source types
  custom_sources JSONB, -- Array of custom URLs
  custom_prompt TEXT,
  llm_provider VARCHAR(20) NOT NULL,
  llm_model VARCHAR(50) NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  iv TEXT NOT NULL, -- Initialization vector for decryption
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News summaries table
CREATE TABLE IF NOT EXISTS news_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sources JSONB NOT NULL, -- Array of source objects with URLs and metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
  error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON user_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_news_summaries_user_id ON news_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_news_summaries_delivery_status ON news_summaries(delivery_status);

-- Update function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_configs_modtime
BEFORE UPDATE ON user_configs
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();