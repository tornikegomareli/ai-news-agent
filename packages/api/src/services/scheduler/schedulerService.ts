import { pool } from '../../config/database';
import { NewsGenerationService } from '../news/newsGenerationService';
import { NotificationService } from '../notification/notificationService';
import { logger } from '../../utils/logger';

export class SchedulerService {
  private newsGenerationService: NewsGenerationService;
  private notificationService: NotificationService;
  private isRunning: boolean;
  
  constructor() {
    this.newsGenerationService = new NewsGenerationService();
    this.notificationService = new NotificationService();
    this.isRunning = false;
  }
  
  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      logger.info('Scheduler is already running');
      return;
    }
    
    this.isRunning = true;
    
    // Schedule daily jobs at 8:00 AM
    this.scheduleDailyJob();
    
    // Schedule every 2 days jobs at 8:00 AM
    this.scheduleEvery2DaysJob();
    
    // Schedule weekly jobs on Monday at 8:00 AM
    this.scheduleWeeklyJob();
    
    // Schedule delivery processing job to run every 5 minutes
    this.scheduleDeliveryProcessing();
    
    logger.info('Scheduler started');
  }
  
  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      logger.info('Scheduler is not running');
      return;
    }
    
    this.isRunning = false;
    
    // Clear all scheduled jobs
    // In a production environment, we would use a more robust scheduler
    // like node-cron or a dedicated service like Bull or Agenda
    
    logger.info('Scheduler stopped');
  }
  
  /**
   * Schedule the daily job to run at 8:00 AM
   */
  private scheduleDailyJob(): void {
    const runDailyJob = async () => {
      try {
        logger.info('Running daily job');
        const count = await this.newsGenerationService.generateNewsForFrequency('daily');
        logger.info(`Generated news for ${count} daily users`);
      } catch (error) {
        logger.error('Error running daily job', { error });
      }
    };
    
    // For demonstration, we'll use setInterval
    // In production, use a proper scheduler
    const now = new Date();
    const target = new Date(now);
    target.setHours(8, 0, 0, 0);
    
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    const initialDelay = target.getTime() - now.getTime();
    
    setTimeout(() => {
      runDailyJob();
      setInterval(runDailyJob, 24 * 60 * 60 * 1000); // 24 hours
    }, initialDelay);
    
    logger.info('Daily job scheduled', { 
      nextRun: target.toISOString(),
      initialDelay: Math.floor(initialDelay / 1000 / 60) + ' minutes'
    });
  }
  
  /**
   * Schedule the every 2 days job to run at 8:00 AM
   */
  private scheduleEvery2DaysJob(): void {
    const runEvery2DaysJob = async () => {
      try {
        logger.info('Running every 2 days job');
        const count = await this.newsGenerationService.generateNewsForFrequency('every_2_days');
        logger.info(`Generated news for ${count} every_2_days users`);
      } catch (error) {
        logger.error('Error running every 2 days job', { error });
      }
    };
    
    // Calculate initial delay for every 2 days (similar to daily)
    const now = new Date();
    const target = new Date(now);
    target.setHours(8, 0, 0, 0);
    
    // Check if today is an odd or even day in the month
    const isOddDay = target.getDate() % 2 === 1;
    
    if (isOddDay) {
      // If today is odd, schedule for tomorrow if it's before 8 AM, or day after tomorrow if after 8 AM
      if (target <= now) {
        target.setDate(target.getDate() + 2);
      }
    } else {
      // If today is even, schedule for today if it's before 8 AM, or day after tomorrow if after 8 AM
      if (target <= now) {
        target.setDate(target.getDate() + 2);
      }
    }
    
    const initialDelay = target.getTime() - now.getTime();
    
    setTimeout(() => {
      runEvery2DaysJob();
      setInterval(runEvery2DaysJob, 2 * 24 * 60 * 60 * 1000); // 48 hours
    }, initialDelay);
    
    logger.info('Every 2 days job scheduled', { 
      nextRun: target.toISOString(),
      initialDelay: Math.floor(initialDelay / 1000 / 60) + ' minutes'
    });
  }
  
  /**
   * Schedule the weekly job to run on Monday at 8:00 AM
   */
  private scheduleWeeklyJob(): void {
    const runWeeklyJob = async () => {
      try {
        logger.info('Running weekly job');
        const count = await this.newsGenerationService.generateNewsForFrequency('weekly');
        logger.info(`Generated news for ${count} weekly users`);
      } catch (error) {
        logger.error('Error running weekly job', { error });
      }
    };
    
    // Calculate initial delay for weekly (Mondays)
    const now = new Date();
    const target = new Date(now);
    target.setHours(8, 0, 0, 0);
    
    // Set to the next Monday
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7;
    target.setDate(target.getDate() + daysUntilMonday);
    
    // If it's Monday and already past 8 AM, move to next Monday
    if (daysUntilMonday === 0 && target <= now) {
      target.setDate(target.getDate() + 7);
    }
    
    const initialDelay = target.getTime() - now.getTime();
    
    setTimeout(() => {
      runWeeklyJob();
      setInterval(runWeeklyJob, 7 * 24 * 60 * 60 * 1000); // 7 days
    }, initialDelay);
    
    logger.info('Weekly job scheduled', { 
      nextRun: target.toISOString(),
      initialDelay: Math.floor(initialDelay / 1000 / 60) + ' minutes'
    });
  }
  
  /**
   * Schedule the delivery processing job to run every 5 minutes
   */
  private scheduleDeliveryProcessing(): void {
    const processDeliveries = async () => {
      try {
        logger.info('Processing pending deliveries');
        const count = await this.notificationService.processPendingDeliveries();
        if (count > 0) {
          logger.info(`Processed ${count} pending deliveries`);
        }
      } catch (error) {
        logger.error('Error processing deliveries', { error });
      }
    };
    
    // Run immediately and then every 5 minutes
    processDeliveries();
    setInterval(processDeliveries, 5 * 60 * 1000); // 5 minutes
    
    logger.info('Delivery processing job scheduled to run every 5 minutes');
  }
  
  /**
   * Manually trigger news generation for a specific user
   */
  async triggerNewsGeneration(userId: string): Promise<string> {
    try {
      logger.info('Manually triggering news generation', { userId });
      const summaryId = await this.newsGenerationService.generateNewsForUser(userId);
      return summaryId;
    } catch (error) {
      logger.error('Error triggering news generation', { userId, error });
      throw error;
    }
  }
}