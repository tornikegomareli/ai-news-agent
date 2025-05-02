import { UserRepository } from '../../models/repositories/UserRepository';
import { NewsSummaryRepository } from '../../models/repositories/NewsSummaryRepository';
import { SearchDirectiveBuilder } from '../directive/searchDirectiveBuilder';
import { LLMFactory } from '../llm/llmFactory';
import { logger } from '../../utils/logger';

export class NewsGenerationService {
  private userRepository: UserRepository;
  private newsSummaryRepository: NewsSummaryRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
    this.newsSummaryRepository = new NewsSummaryRepository();
  }
  
  /**
   * Generate a news summary for a specific user
   */
  async generateNewsForUser(userId: string): Promise<string> {
    try {
      logger.info('Generating news for user', { userId });
      
      // Get user and config
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      const userConfigWithKey = await this.userRepository.getUserConfig(userId);
      if (!userConfigWithKey) {
        throw new Error(`User config not found: ${userId}`);
      }
      
      // Build search directive
      const searchDirective = SearchDirectiveBuilder.buildSearchDirective(user, userConfigWithKey);
      logger.info('Search directive built', { userId, directive: searchDirective });
      
      // Create LLM service
      const llmService = LLMFactory.createLLMService(userConfigWithKey.llmProvider, {
        apiKey: userConfigWithKey.apiKey,
        model: userConfigWithKey.llmModel
      });
      
      // Generate news summary
      const result = await llmService.generateNewsSummary({
        prompt: searchDirective,
        timeframe: this.getTimeframeForFrequency(user.deliveryFrequency),
        searchTerms: userConfigWithKey.sourcePreferences
      });
      
      // Save the summary to the database
      const savedSummary = await this.newsSummaryRepository.createSummary({
        userId,
        title: result.title,
        content: result.summary,
        sources: result.sources.map(source => ({
          url: source.url,
          title: source.title,
          type: source.type as any
        }))
      });
      
      logger.info('News summary generated and saved', { 
        userId, 
        summaryId: savedSummary.id,
        title: savedSummary.title
      });
      
      return savedSummary.id;
    } catch (error) {
      logger.error('Error generating news for user', { userId, error });
      throw error;
    }
  }
  
  /**
   * Generate news for all users with the specified delivery frequency
   */
  async generateNewsForFrequency(frequency: 'daily' | 'every_2_days' | 'weekly'): Promise<number> {
    // This would be implemented to get all users with the given frequency and generate news for each
    // For now, this is a placeholder
    return 0;
  }
  
  /**
   * Helper function to convert delivery frequency to timeframe
   */
  private getTimeframeForFrequency(frequency: string): 'day' | 'week' | 'month' {
    switch (frequency) {
      case 'daily':
      case 'every_2_days':
        return 'day';
      case 'weekly':
        return 'week';
      default:
        return 'week';
    }
  }
}