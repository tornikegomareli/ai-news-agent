import OpenAI from 'openai';
import { LLMRequest, LLMResponse, WebSearchRequest, NewsSummaryResult, LLMProviderConfig, LLMService } from '../types';
import { logger } from '../../../utils/logger';

export class OpenAIService implements LLMService {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
      baseURL: config.baseURL
    });
    this.model = config.model;
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1500,
      });

      return {
        content: response.choices[0].message.content || '',
        tokenUsage: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      logger.error('OpenAI completion error', { error });
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async performWebSearch(request: WebSearchRequest): Promise<LLMResponse> {
    try {
      // Create a system message that instructs the model to search the web
      const systemContent = `You are a helpful AI assistant with web search capabilities. 
      Please search the web for the most recent information to answer the user's question.
      Focus on the following sources: ${request.searchTerms?.join(', ') || 'all relevant sources'}.
      If appropriate, limit results to the last ${request.timeframe || 'week'}.
      Provide attribution for information by including source URLs.`;

      // Use the browsing capability with tool calling
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
      });

      return {
        content: response.choices[0].message.content || '',
        tokenUsage: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      logger.error('OpenAI web search error', { error });
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateNewsSummary(request: WebSearchRequest): Promise<NewsSummaryResult> {
    try {
      // First use web search to get information
      const searchResponse = await this.performWebSearch(request);
      
      // Then ask for a structured summary format
      const structuredPrompt = `Based on the following information from a web search, create a concise news summary about AI advancements.
      Format the response as a JSON object with the following structure:
      {
        "title": "A descriptive title for the summary",
        "summary": "The main summary text with key points",
        "sources": [
          {
            "url": "URL of the source",
            "title": "Title of the source article/page",
            "type": "One of: hacker_news, reddit, twitter, github, custom"
          }
        ]
      }
      
      Only include sources that were actually referenced and used. The summary should be informative and concise.
      
      Web search results:
      ${searchResponse.content}`;
      
      const structuredResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: structuredPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 2000
      });
      
      // Parse the JSON response - using response_format ensures valid JSON
      const jsonString = structuredResponse.choices[0].message.content || '{}';
      
      try {
        const parsedResponse = JSON.parse(jsonString) as NewsSummaryResult;
        return parsedResponse;
      } catch (parseError) {
        logger.error('Failed to parse OpenAI summary response as JSON', { error: parseError });
        throw new Error('Failed to parse structured summary response');
      }
    } catch (error) {
      logger.error('OpenAI news summary error', { error });
      throw new Error(`OpenAI news summary error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}