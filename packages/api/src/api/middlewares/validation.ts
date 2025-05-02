import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// User configuration validation schema
const userConfigSchema = z.object({
  email: z.string().email().optional(),
  telegramId: z.string().optional(),
  deliveryChannel: z.enum(['email', 'telegram']),
  deliveryFrequency: z.enum(['daily', 'every_2_days', 'weekly']),
  categoryFocus: z.enum(['technical_ai', 'business_ai', 'marketing_ai']),
  sourcePreferences: z.array(
    z.enum(['hacker_news', 'reddit', 'twitter', 'github', 'custom'])
  ),
  customSources: z.array(z.string().url()).optional(),
  customPrompt: z.string().max(500).optional(),
  llmProvider: z.enum(['openai', 'anthropic']),
  llmApiKey: z.string().min(1),
  llmModel: z.string().min(1)
}).refine(data => {
  // Ensure either email or telegramId is provided based on delivery channel
  if (data.deliveryChannel === 'email' && !data.email) {
    return false;
  }
  if (data.deliveryChannel === 'telegram' && !data.telegramId) {
    return false;
  }
  return true;
}, {
  message: 'Email or Telegram ID must be provided based on chosen delivery channel'
});

// LLM request validation schema
const llmRequestSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  model: z.string().min(1),
  apiKey: z.string().min(1)
});

// Middleware for validating user configuration
export const validateUserConfig = (req: Request, res: Response, next: NextFunction) => {
  try {
    userConfigSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation Error', details: error.errors });
    } else {
      next(error);
    }
  }
};

// Middleware for validating LLM requests
export const validateLLMRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    llmRequestSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation Error', details: error.errors });
    } else {
      next(error);
    }
  }
};