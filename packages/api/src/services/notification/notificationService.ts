import { NewsSummaryRepository } from '../../models/repositories/NewsSummaryRepository';
import { UserRepository } from '../../models/repositories/UserRepository';
import { NewsSummary } from '../../models/NewsSummary';
import { logger } from '../../utils/logger';
import { EmailService } from './emailService';

export class NotificationService {
  private newsSummaryRepository: NewsSummaryRepository;
  private userRepository: UserRepository;
  private emailService: EmailService;
  
  constructor() {
    this.newsSummaryRepository = new NewsSummaryRepository();
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
  }
  
  /**
   * Process all pending deliveries
   */
  async processPendingDeliveries(): Promise<number> {
    try {
      const pendingSummaries = await this.newsSummaryRepository.getPendingSummaries();
      
      if (pendingSummaries.length === 0) {
        return 0;
      }
      
      logger.info(`Found ${pendingSummaries.length} pending summaries to deliver`);
      
      let processedCount = 0;
      
      for (const summary of pendingSummaries) {
        try {
          await this.deliverSummary(summary);
          processedCount++;
        } catch (error) {
          logger.error('Error delivering summary', { summaryId: summary.id, error });
          
          // Mark as failed
          await this.newsSummaryRepository.updateDeliveryStatus(
            summary.id,
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
      
      return processedCount;
    } catch (error) {
      logger.error('Error processing pending deliveries', { error });
      return 0;
    }
  }
  
  /**
   * Deliver a specific summary
   */
  async deliverSummary(summary: NewsSummary): Promise<void> {
    try {
      const user = await this.userRepository.getUserById(summary.userId);
      
      if (!user) {
        throw new Error(`User not found for summary: ${summary.id}`);
      }
      
      // Determine delivery channel and send
      if (user.deliveryChannel === 'email' && user.email) {
        await this.emailService.sendSummaryEmail(user.email, summary);
      } else if (user.deliveryChannel === 'telegram' && user.telegramId) {
        // For now, we'll log this as not implemented
        // In the future, we would implement a TelegramService
        logger.info('Telegram delivery not yet implemented', { 
          userId: user.id,
          telegramId: user.telegramId,
          summaryId: summary.id
        });
        
        // We'll mark this as delivered for now in the development version
        await this.newsSummaryRepository.updateDeliveryStatus(summary.id, 'delivered');
        return;
      } else {
        throw new Error(`Invalid delivery configuration for user: ${user.id}`);
      }
      
      // Mark as delivered
      await this.newsSummaryRepository.updateDeliveryStatus(summary.id, 'delivered');
      
      logger.info('Summary delivered successfully', { 
        summaryId: summary.id,
        userId: user.id,
        channel: user.deliveryChannel
      });
    } catch (error) {
      logger.error('Error delivering summary', { summaryId: summary.id, error });
      throw error;
    }
  }
}