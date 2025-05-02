import { OpenAIService } from './providers/openai';
import { AnthropicService } from './providers/anthropic';
import { LLMProviderConfig, LLMService } from './types';
import { logger } from '../../utils/logger';

// Simple type-safe implementation
export class LLMFactory {
  static getSupportedProviders() {
    return {
      openai: {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4-turbo', 'gpt-4o', 'gpt-4-0125-preview', 'gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo']
      },
      anthropic: {
        id: 'anthropic',
        name: 'Anthropic Claude',
        models: [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
          'claude-3-5-sonnet-20240620',
          'claude-2.1',
          'claude-2.0'
        ]
      }
    };
  }

  // Type-safe provider lookup
  static isProviderModelSupported(provider: 'openai' | 'anthropic', model: string): boolean {
    const providers = this.getSupportedProviders();
    const providerInfo = providers[provider];
    
    if (!providerInfo) {
      return false;
    }
    
    return providerInfo.models.includes(model);
  }

  // Create and return the appropriate LLM service instance
  static createLLMService(provider: 'openai' | 'anthropic', config: LLMProviderConfig): LLMService {
    if (!this.isProviderModelSupported(provider, config.model)) {
      logger.warn(`Requested model ${config.model} is not officially supported by provider ${provider}`);
    }

    switch (provider) {
      case 'openai':
        return new OpenAIService(config);
      case 'anthropic':
        return new AnthropicService(config);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}