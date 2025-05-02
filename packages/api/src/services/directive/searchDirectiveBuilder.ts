import { User, UserConfig } from '../../models/User';
import { logger } from '../../utils/logger';

export interface DirectiveOptions {
  timeframe?: 'day' | 'week' | 'month';
  maxItems?: number;
}

export class SearchDirectiveBuilder {
  /**
   * Builds a search directive based on user configuration
   */
  static buildSearchDirective(
    user: User, 
    userConfig: UserConfig, 
    options: DirectiveOptions = {}
  ): string {
    logger.info('Building search directive for user', { userId: user.id });
    
    // Set defaults
    const timeframe = options.timeframe || this.getTimeframeFromFrequency(user.deliveryFrequency);
    const maxItems = options.maxItems || 5;
    
    // Build source specification
    const sourceSpec = this.buildSourceSpecification(userConfig.sourcePreferences, userConfig.customSources);
    
    // Build category focus
    const categoryFocus = this.getCategoryFocus(userConfig.categoryFocus);
    
    // Build the directive
    let directive = `Search the web for recent AI news from the last ${timeframe}.`;
    
    // Add source specification
    directive += ` Focus on ${sourceSpec}.`;
    
    // Add category focus
    directive += ` Concentrate on ${categoryFocus}.`;
    
    // Add custom prompt if available
    if (userConfig.customPrompt) {
      directive += ` ${userConfig.customPrompt}`;
    }
    
    // Add instructions for summarization
    directive += ` Summarize the top ${maxItems} most important recent developments or news items, ` +
      `providing a balanced view that captures the most significant advancements or discussions. ` +
      `For each news item, include the original source URL and a brief explanation of why it's significant.`;
    
    return directive;
  }
  
  /**
   * Converts delivery frequency to search timeframe
   */
  private static getTimeframeFromFrequency(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '24 hours';
      case 'every_2_days':
        return '48 hours';
      case 'weekly':
        return 'week';
      default:
        return 'week';
    }
  }
  
  /**
   * Builds a specification of which sources to focus on
   */
  private static buildSourceSpecification(
    sourcePreferences: string[], 
    customSources?: string[]
  ): string {
    const sourceMap: Record<string, string> = {
      'hacker_news': 'Hacker News',
      'reddit': 'Reddit communities related to AI (especially r/artificial and r/MachineLearning)',
      'twitter': 'relevant Twitter/X discussions from AI experts and organizations',
      'github': 'trending AI repositories on GitHub',
      'custom': customSources && customSources.length > 0 
        ? `the following websites: ${customSources.join(', ')}`
        : 'other reputable tech websites'
    };
    
    const sources = sourcePreferences.map(source => sourceMap[source] || source);
    
    if (sources.length === 1) {
      return sources[0];
    }
    
    if (sources.length === 2) {
      return `${sources[0]} and ${sources[1]}`;
    }
    
    const lastSource = sources.pop();
    return `${sources.join(', ')}, and ${lastSource}`;
  }
  
  /**
   * Gets category focus description
   */
  private static getCategoryFocus(categoryFocus: string): string {
    switch (categoryFocus) {
      case 'technical_ai':
        return 'technical AI developments including research papers, software releases, framework updates, and technical implementations';
      case 'business_ai':
        return 'business applications of AI including corporate implementations, funding news, market trends, and industry shifts';
      case 'marketing_ai':
        return 'AI tools and applications for marketing including campaign tools, case studies, creative implementations, and content generation';
      default:
        return 'general AI news and developments';
    }
  }
}