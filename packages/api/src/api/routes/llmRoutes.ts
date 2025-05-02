import express from 'express';
import { validateLLMRequest } from '../middlewares/validation';
import { LLMFactory } from '../../services/llm/llmFactory';
import { logger } from '../../utils/logger';

const router = express.Router();

// Get supported LLM providers
router.get('/providers', async (req, res, next) => {
  try {
    const providers = LLMFactory.getSupportedProviders();
    res.status(200).json({ providers });
  } catch (error) {
    next(error);
  }
});

// Test LLM connection with user's API key
router.post('/test-connection', validateLLMRequest, async (req, res, next) => {
  try {
    const { provider, apiKey, model } = req.body;
    
    // Simple prompt to test connection
    const testPrompt = "Hello, this is a test message to verify the connection. Please respond with 'Connection successful' if you receive this message.";
    
    try {
      // Create LLM service instance
      const llmService = LLMFactory.createLLMService(provider, {
        apiKey,
        model: model || (provider === 'openai' ? 'gpt-4-turbo' : 'claude-3-sonnet')
      });
      
      // Try to generate a simple completion
      const response = await llmService.generateCompletion({
        prompt: testPrompt,
        maxTokens: 50,
        temperature: 0.1
      });
      
      logger.info(`Successfully tested connection to ${provider}`);
      
      res.status(200).json({
        success: true,
        message: 'Connection successful',
        response: response.content,
        tokenUsage: response.tokenUsage
      });
    } catch (connectionError) {
      logger.error(`Failed to connect to ${provider}`, { error: connectionError });
      
      res.status(400).json({
        success: false,
        message: `Failed to connect to ${provider}: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;