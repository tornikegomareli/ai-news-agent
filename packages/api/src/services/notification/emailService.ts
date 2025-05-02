import axios from 'axios';
import { NewsSummary } from '../../models/NewsSummary';
import { logger } from '../../utils/logger';

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  
  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'updates@ai-news-agent.example.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'AI News Agent';
    
    if (!this.apiKey) {
      logger.warn('Email API key not set. Email sending will not work.');
    }
  }
  
  /**
   * Send a news summary email
   */
  async sendSummaryEmail(toEmail: string, summary: NewsSummary): Promise<boolean> {
    try {
      if (!this.apiKey) {
        logger.error('Cannot send email - API key not configured');
        throw new Error('Email API key not configured');
      }
      
      // Generate HTML content
      const htmlContent = this.generateHtmlContent(summary);
      
      // For this example, we'll use SendGrid API, but you could use any email service
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: toEmail }],
              subject: summary.title
            }
          ],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          content: [
            {
              type: 'text/html',
              value: htmlContent
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info('Email sent successfully', { toEmail, summaryId: summary.id });
      return true;
    } catch (error) {
      logger.error('Error sending email', { error, toEmail, summaryId: summary.id });
      
      // In development mode, log the email content
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Would have sent email with content:', {
          to: toEmail,
          subject: summary.title,
          contentPreview: summary.content.substring(0, 100) + '...'
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Generate HTML content for the email
   */
  private generateHtmlContent(summary: NewsSummary): string {
    // Create source links HTML
    const sourceLinks = summary.sources.map(source => {
      const title = source.title || source.url;
      return `<li><a href="${source.url}" target="_blank">${title}</a> (${this.formatSourceType(source.type)})</li>`;
    }).join('');
    
    // Format the content with paragraphs
    const formattedContent = summary.content
      .split('\n\n')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
    
    // Return the complete HTML
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${summary.title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6;
          color: #333;
          max-width: 650px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; }
        a { color: #2980b9; }
        .footer { 
          margin-top: 30px;
          border-top: 1px solid #eee;
          padding-top: 20px;
          font-size: 12px;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <h1>${summary.title}</h1>
      
      ${formattedContent}
      
      <h2>Sources</h2>
      <ul>
        ${sourceLinks}
      </ul>
      
      <div class="footer">
        <p>This summary was generated on ${new Date(summary.generatedAt).toLocaleDateString()} by AI News Agent.</p>
        <p>You can update your preferences at any time by visiting your account settings.</p>
      </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Format the source type for display
   */
  private formatSourceType(type: string): string {
    const typeMap: Record<string, string> = {
      'hacker_news': 'Hacker News',
      'reddit': 'Reddit',
      'twitter': 'Twitter',
      'github': 'GitHub',
      'custom': 'Web'
    };
    
    return typeMap[type] || type;
  }
}