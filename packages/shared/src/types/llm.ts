// Base LLM request interface
export interface LLMRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

// Base LLM response interface
export interface LLMResponse {
  content: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

// Web search request parameters
export interface WebSearchRequest extends LLMRequest {
  searchTerms?: string[];
  timeframe?: 'day' | 'week' | 'month';
}

// News summary structure
export interface NewsSummaryResult {
  title: string;
  summary: string;
  sources: Array<{
    url: string;
    title?: string;
    type: 'hacker_news' | 'reddit' | 'twitter' | 'github' | 'custom';
  }>;
}

// Provider configuration interface
export interface LLMProviderConfig {
  apiKey: string;
  model: string;
  baseURL?: string;
  organizationId?: string;
}

// Provider information interface
export interface LLMProviderInfo {
  id: string;
  name: string;
  models: string[];
}

// Provider list response
export interface LLMProvidersResponse {
  providers: LLMProviderInfo[];
}