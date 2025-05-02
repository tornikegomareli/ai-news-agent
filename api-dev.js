const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

// Load environment variables if available
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI News Agent API is running', 
    version: '1.0.0' 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/v1/llm/providers', async (req, res) => {
  try {
    // For OpenAI, we'll use a static list of models based on the API documentation
    const openAIModels = ['gpt-4-turbo', 'gpt-4o', 'gpt-4-0125-preview', 'gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
    
    // For Anthropic, we'll use a static list since most users don't have an API key at first
    // The correct model IDs for Anthropic from their documentation
    const anthropicModels = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20240620',
      'claude-2.1',
      'claude-2.0'
    ];
    
    // We'll only attempt to fetch the models dynamically if an API key is provided
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        console.log('Anthropic API key found, attempting to fetch models...');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        
        try {
          // According to the SDK docs, models.list() returns a PagePromise with data property
          const modelsListResult = await anthropic.models.list();
          
          console.log('Got models list result:', modelsListResult);
          
          if (modelsListResult && Array.isArray(modelsListResult.data)) {
            // Replace our static list with the fetched models
            anthropicModels.length = 0; // Clear the array
            modelsListResult.data.forEach(model => {
              if (model.id) {
                anthropicModels.push(model.id);
                console.log(`Added Anthropic model: ${model.id}`);
              }
            });
          }
        } catch (modelsListError) {
          console.error('Error listing Anthropic models:', modelsListError);
          
          // If that fails, try to retrieve a specific model to verify the API
          try {
            const defaultModel = 'claude-3-sonnet-20240229';
            const modelInfo = await anthropic.models.retrieve(defaultModel);
            console.log(`Successfully retrieved model info for ${defaultModel}:`, modelInfo);
          } catch (modelRetrieveError) {
            console.error('Error retrieving specific Anthropic model:', modelRetrieveError);
          }
        }
      }
    } catch (anthropicError) {
      console.error('Error fetching Anthropic models:', anthropicError);
      // Fallback to default models on error
      anthropicModels.push(
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-3-5-sonnet-20240620',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
      );
    }
    
    res.json({
      providers: [
        { 
          id: 'openai', 
          name: 'OpenAI', 
          models: openAIModels 
        },
        { 
          id: 'anthropic', 
          name: 'Anthropic Claude', 
          models: anthropicModels 
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching LLM providers:', error);
    res.status(500).json({ error: 'Failed to fetch LLM providers' });
  }
});

// Test LLM connection with user's API key and prompt
app.post('/api/v1/llm/test-connection', async (req, res) => {
  try {
    const { provider, apiKey, model, prompt } = req.body;
    
    // Input validation
    if (!provider || !apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Provider and API key are required' 
      });
    }

    // Use a default prompt if none provided
    const userPrompt = prompt || "Hello, this is a test message to verify the connection. Please respond with 'Connection successful' if you receive this message.";
    
    // Use default model if none provided
    const modelToUse = model || (provider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-sonnet-20240229');

    console.log(`Testing connection to ${provider} with model ${modelToUse}`);

    // Mock response for testing - if API key starts with 'sk-test'
    if (apiKey.startsWith('sk-test')) {
      console.log('Using mock response for testing');
      return res.json({
        success: true,
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connection successful (MOCK)`,
        response: `This is a mock response for ${provider} using model ${modelToUse}. Your prompt was: "${userPrompt}"`,
        tokenUsage: {
          input: 10,
          output: 25,
          total: 35
        }
      });
    }

    let response;
    
    if (provider === 'openai') {
      // Test OpenAI connection
      try {
        console.log(`Initializing OpenAI client with provided API key (starting with: ${apiKey.substring(0, 5)}...)`);
        const openai = new OpenAI({ apiKey });
        console.log('OpenAI client initialized successfully');
        
        // Let's just use the Chat Completions API since it's more consistently available across models
        console.log(`Creating chat completion with model: ${modelToUse}`);
        
        const completion = await openai.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });
        
        console.log('OpenAI Chat Completions API succeeded');
        console.log('Response received with content:', completion.choices[0].message.content.substring(0, 50) + '...');
        
        response = {
          success: true,
          message: 'OpenAI connection successful',
          response: completion.choices[0].message.content,
          tokenUsage: {
            input: completion.usage?.prompt_tokens || 0,
            output: completion.usage?.completion_tokens || 0,
            total: completion.usage?.total_tokens || 0
          }
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        return res.status(400).json({
          success: false,
          message: `OpenAI API error: ${error.message || 'Unknown error'}`,
        });
      }
    } else if (provider === 'anthropic') {
      // Test Anthropic connection
      try {
        // Create the Anthropic client
        const anthropic = new Anthropic({ apiKey });
        
        // Define a set of known valid Anthropic models
        const validAnthropicModels = [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
          'claude-3-5-sonnet-20240620',
          'claude-2.1',
          'claude-2.0'
        ];
        
        console.log(`Attempting to use Anthropic model: ${modelToUse}`);
        
        // Try to validate the model exists before using it
        let modelIsValid = false;
        
        // First check our static list
        if (validAnthropicModels.includes(modelToUse)) {
          modelIsValid = true;
        } else {
          // If the model isn't in our list, try to check if it exists via the API
          try {
            await anthropic.models.retrieve(modelToUse);
            modelIsValid = true;
            console.log(`Model ${modelToUse} verified with the API`);
          } catch (modelCheckError) {
            console.log(`Model ${modelToUse} could not be verified: ${modelCheckError.message}`);
            modelIsValid = false;
          }
        }
        
        // If the model is not valid, use the closest match or fall back to a default
        if (!modelIsValid) {
          const originalModel = modelToUse;
          
          if (modelToUse.includes('claude-3-opus')) {
            modelToUse = 'claude-3-opus-20240229';
          } else if (modelToUse.includes('claude-3-sonnet')) {
            modelToUse = 'claude-3-sonnet-20240229';
          } else if (modelToUse.includes('claude-3-haiku')) {
            modelToUse = 'claude-3-haiku-20240307';
          } else if (modelToUse.includes('claude-3-5-sonnet')) {
            modelToUse = 'claude-3-5-sonnet-20240620';
          } else {
            // Default to the most generally available model if we can't match
            modelToUse = 'claude-3-sonnet-20240229';
          }
          
          console.log(`Model changed from ${originalModel} to ${modelToUse}`);
        }
        
        console.log(`Using Anthropic model: ${modelToUse}`);
        
        // Create the completion with the selected model
        const completion = await anthropic.messages.create({
          model: modelToUse,
          max_tokens: 500,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0.7,
        });

        response = {
          success: true,
          message: 'Anthropic connection successful',
          response: completion.content[0].text,
          tokenUsage: {
            input: completion.usage.input_tokens,
            output: completion.usage.output_tokens,
            total: completion.usage.input_tokens + completion.usage.output_tokens
          }
        };
      } catch (error) {
        console.error('Anthropic API error:', error);
        return res.status(400).json({
          success: false,
          message: `Anthropic API error: ${error.message || 'Unknown error'}`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported provider: ${provider}`,
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Error testing LLM connection:', error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server is running on http://0.0.0.0:${PORT}`);
});