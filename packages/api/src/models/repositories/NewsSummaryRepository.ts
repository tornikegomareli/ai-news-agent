import { pool } from '../../config/database';
import { NewsSummary, Source } from '../NewsSummary';
import { logger } from '../../utils/logger';

export class NewsSummaryRepository {
  // Create a new news summary
  async createSummary(summary: Omit<NewsSummary, 'id' | 'generatedAt' | 'deliveryStatus'>): Promise<NewsSummary> {
    try {
      const { userId, title, content, sources } = summary;
      
      const result = await pool.query(
        `INSERT INTO news_summaries 
         (user_id, title, content, sources)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, title, content, JSON.stringify(sources)]
      );
      
      return this.mapDbSummaryToSummary(result.rows[0]);
    } catch (error) {
      logger.error('Error creating news summary', { error });
      throw error;
    }
  }
  
  // Get summaries for a user with pagination
  async getSummariesForUser(userId: string, limit = 10, offset = 0): Promise<NewsSummary[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM news_summaries 
         WHERE user_id = $1
         ORDER BY generated_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      
      return result.rows.map(this.mapDbSummaryToSummary);
    } catch (error) {
      logger.error('Error getting news summaries for user', { error, userId });
      throw error;
    }
  }
  
  // Get summaries pending delivery
  async getPendingSummaries(): Promise<NewsSummary[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM news_summaries 
         WHERE delivery_status = 'pending'
         ORDER BY generated_at ASC`
      );
      
      return result.rows.map(this.mapDbSummaryToSummary);
    } catch (error) {
      logger.error('Error getting pending news summaries', { error });
      throw error;
    }
  }
  
  // Update delivery status
  async updateDeliveryStatus(summaryId: string, status: 'delivered' | 'failed', errorMessage?: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE news_summaries 
         SET delivery_status = $1, 
             delivered_at = $2,
             error_message = $3
         WHERE id = $4`,
        [
          status, 
          status === 'delivered' ? new Date() : null, 
          errorMessage || null, 
          summaryId
        ]
      );
    } catch (error) {
      logger.error('Error updating delivery status', { error, summaryId, status });
      throw error;
    }
  }
  
  // Helper: Map database summary row to NewsSummary model
  private mapDbSummaryToSummary(dbSummary: any): NewsSummary {
    return {
      id: dbSummary.id,
      userId: dbSummary.user_id,
      title: dbSummary.title,
      content: dbSummary.content,
      sources: JSON.parse(dbSummary.sources),
      generatedAt: dbSummary.generated_at,
      deliveredAt: dbSummary.delivered_at,
      deliveryStatus: dbSummary.delivery_status
    };
  }
}