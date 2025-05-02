import Anthropic from '@anthropic-ai/sdk';
import { LLMRequest, LLMResponse, WebSearchRequest, NewsSummaryResult, LLMProviderConfig, LLMService } from '../types';
import { logger } from '../../../utils/logger';

export class AnthropicService implements LLMService {
  private client: Anthropic;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
    this.model = config.model;
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens || 1500,
        temperature: request.temperature || 0.7
      });

      return {
        content: response.content[0].text,
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        }
      };
    } catch (error) {
      logger.error('Anthropic completion error', { error });
      throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async performWebSearch(request: WebSearchRequest): Promise<LLMResponse> {
    try {
      // Create a system message for web search
      const systemContent = `You are Claude, an AI assistant with web search capabilities. 
      Please search the web for the most recent information to answer the user's question.
      Focus on the following sources: ${request.searchTerms?.join(', ') || 'all relevant sources'}.
      If appropriate, limit results to the last ${request.timeframe || 'week'}.
      Provide attribution for information by including source URLs.`;

      const response = await this.client.messages.create({
        model: this.model,
        system: systemContent,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7,
        tools: [{ 
          name: "web_search", 
          description: "Search the web for information",
          input_schema: { type: "object", properties: {} }
        }]
      });

      return {
        content: response.content[0].text,
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        }
      };
    } catch (error) {
      logger.error('Anthropic web search error', { error });
      throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateNewsSummary(request: WebSearchRequest): Promise<NewsSummaryResult> {
    try {
      // First use web search to get information
      const searchResponse = await this.performWebSearch(request);
      
      // Then ask for a structured summary format in JSON
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
      
      You MUST respond with valid JSON that exactly matches this structure. Do not include any text before or after the JSON.
      Only include sources that were actually referenced and used. The summary should be informative and concise.
      
      Web search results:
      ${searchResponse.content}`;
      
      const structuredResponse = await this.client.messages.create({
        model: this.model,
        messages: [
          { role: 'user', content: structuredPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });
      
      // Parse the JSON response (or try to extract it from the text)
      const responseText = structuredResponse.content[0].text;
      
      try {
        // Try to extract JSON if the response isn't already pure JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const parsedResponse = JSON.parse(jsonMatch[0]) as NewsSummaryResult;
        return parsedResponse;
      } catch (parseError) {
        logger.error('Failed to parse Anthropic summary response as JSON', { error: parseError });
        
        // Make one more attempt with a clearer prompt
        const fallbackPrompt = `The previous response wasn't properly formatted as JSON. Please reformat the following content into ONLY a valid JSON object with the structure: { "title": "...", "summary": "...", "sources": [{ "url": "...", "title": "...", "type": "..." }] }
          
          Content to format:
          ${responseText}`;
        
        const fallbackResponse = await this.client.messages.create({
          model: this.model,
          messages: [
            { role: 'user', content: fallbackPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });
        
        // Try to extract JSON from the fallback response
        const fallbackText = fallbackResponse.content[0].text;
        const fallbackJsonMatch = fallbackText.match(/\{[\s\S]*\}/);
        
        if (!fallbackJsonMatch) {
          throw new Error('No JSON object found in fallback response');
        }
        
        try {
          return JSON.parse(fallbackJsonMatch[0]) as NewsSummaryResult;
        } catch (fallbackError) {
          throw new Error('Failed to parse structured summary response');
        }
      }
    } catch (error) {
      logger.error('Anthropic news summary error', { error });
      throw new Error(`Anthropic news summary error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}