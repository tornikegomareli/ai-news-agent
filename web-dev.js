const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up API proxy
app.get('/health', (req, res) => {
  console.log('Proxying health check to API');
  
  // First try to contact the API
  fetch(`${API_URL}/health`)
    .then(apiRes => apiRes.json())
    .then(data => {
      console.log('Health check successful:', data);
      res.json(data);
    })
    .catch(err => {
      console.error('Error proxying health check:', err);
      
      // Even if API is unreachable, send a 200 response with web service status
      // This ensures the frontend can at least load and display something
      res.json({ 
        status: 'web_ok',
        api_status: 'unreachable',
        message: 'Web server is running but API is unreachable' 
      });
    });
});

// Set up API proxy for LLM providers
app.get('/api/v1/llm/providers', (req, res) => {
  console.log('Proxying LLM providers request to API');
  fetch(`${API_URL}/api/v1/llm/providers`)
    .then(apiRes => apiRes.json())
    .then(data => {
      console.log('LLM providers fetch successful');
      res.json(data);
    })
    .catch(err => {
      console.error('Error proxying LLM providers request:', err);
      
      // Return default providers if API is unavailable
      res.json({
        providers: [
          { 
            id: 'openai', 
            name: 'OpenAI', 
            models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4-0125-preview', 'gpt-4-turbo-preview']
          },
          { 
            id: 'anthropic', 
            name: 'Anthropic Claude', 
            models: [
              'claude-3-opus-20240229',
              'claude-3-sonnet-20240229',
              'claude-3-haiku-20240307',
              'claude-3-5-sonnet-20240620',
              'claude-2.1',
              'claude-2.0'
            ]
          }
        ]
      });
    });
});

// Set up API proxy for test connection
app.post('/api/v1/llm/test-connection', (req, res) => {
  console.log('Proxying LLM test connection to API', req.body);
  
  const { provider, apiKey, model, prompt } = req.body;
  
  // Validate input
  if (!provider || !apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'Provider and API key are required' 
    });
  }
  
  // Forward the request to the API service
  fetch(`${API_URL}/api/v1/llm/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
    .then(apiRes => {
      console.log('Test connection response status:', apiRes.status);
      return apiRes.json();
    })
    .then(data => {
      console.log('Test connection success');
      res.json(data);
    })
    .catch(err => {
      console.error('Error proxying LLM test connection:', err);
      res.status(500).json({ 
        success: false,
        message: 'Failed to connect to LLM service. Please check your API key and try again.',
        error: err.message
      });
    });
});

// Serve static HTML
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>AI News Agent - LLM Tester</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1, h2 { color: #333; }
    p { color: #666; }
    .api-status { padding: 10px; background-color: #f0f0f0; border-radius: 4px; margin-top: 20px; margin-bottom: 20px; }
    #status { color: #888; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background-color: #45a049; }
    .response { margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
    .loading { display: none; margin-left: 10px; }
    .provider-section { border: 1px solid #eee; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
    .error { color: red; }
    .success { color: green; font-weight: bold; margin-top: 10px; }
    .copy-btn { background-color: #6c757d; color: white; border: none; border-radius: 4px; padding: 5px 10px; margin-left: 10px; cursor: pointer; font-size: 12px; }
    .copy-btn:hover { background-color: #5a6268; }
    .token-usage { font-size: 12px; color: #666; margin-top: 5px; }
    
    /* Responsive styles */
    @media (max-width: 600px) {
      .container { padding: 15px; }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      .provider-section { padding: 15px; }
      button { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>AI News Aggregator Agent</h1>
    <p>Test LLM Providers with your API keys</p>
    
    <div class="api-status">
      <h3>API Status</h3>
      <div id="status">Checking API status...</div>
    </div>

    <!-- OpenAI Tester -->
    <div class="provider-section">
      <h2>OpenAI Tester</h2>
      <div class="form-group">
        <label for="openai-api-key">OpenAI API Key:</label>
        <input type="password" id="openai-api-key" placeholder="sk-...">
      </div>
      <div class="form-group">
        <label for="openai-model">Model:</label>
        <select id="openai-model">
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4-0125-preview">gpt-4-0125-preview</option>
          <option value="gpt-4-turbo-preview">gpt-4-turbo-preview</option>
        </select>
      </div>
      <div class="form-group">
        <label for="openai-prompt">Prompt:</label>
        <textarea id="openai-prompt" rows="3" placeholder="Enter your prompt here...">What are the latest trends in artificial intelligence?</textarea>
      </div>
      <button id="openai-test" onclick="testOpenAI()">Test OpenAI <span id="openai-loading" class="loading">⏳</span></button>
      <div id="openai-error" class="error"></div>
      <div id="openai-response" class="response"></div>
    </div>

    <!-- Anthropic Tester -->
    <div class="provider-section">
      <h2>Anthropic Tester</h2>
      <div class="form-group">
        <label for="anthropic-api-key">Anthropic API Key:</label>
        <input type="password" id="anthropic-api-key" placeholder="sk-ant-...">
      </div>
      <div class="form-group">
        <label for="anthropic-model">Model:</label>
        <select id="anthropic-model">
          <option value="claude-3-sonnet-20240229">claude-3-sonnet-20240229</option>
          <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
          <option value="claude-3-haiku-20240307">claude-3-haiku-20240307</option>
          <option value="claude-3-5-sonnet-20240620">claude-3-5-sonnet-20240620</option>
          <option value="claude-2.1">claude-2.1</option>
          <option value="claude-2.0">claude-2.0</option>
        </select>
      </div>
      <div class="form-group">
        <label for="anthropic-prompt">Prompt:</label>
        <textarea id="anthropic-prompt" rows="3" placeholder="Enter your prompt here...">What are the latest trends in artificial intelligence?</textarea>
      </div>
      <button id="anthropic-test" onclick="testAnthropic()">Test Anthropic <span id="anthropic-loading" class="loading">⏳</span></button>
      <div id="anthropic-error" class="error"></div>
      <div id="anthropic-response" class="response"></div>
    </div>
  </div>
  
  <script>
    // Define a utility function to update the status with error handling
    function updateStatus(status, isConnected, message) {
      const statusElement = document.getElementById('status');
      if (!statusElement) {
        console.error('Status element not found!');
        return;
      }
      
      const color = isConnected ? 'green' : 'red';
      const icon = isConnected ? '✓' : '✗';
      statusElement.innerHTML = 'API Status: <span style="color: ' + color + '">' + icon + ' ' + status + '</span>' + (message ? ' - ' + message : '');
    }
    
    // Immediately set status to checking
    updateStatus('Checking...', false, '');
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM fully loaded');
      setTimeout(checkApiStatus, 500);
    });
    
    // Check API status
    function checkApiStatus() {
      console.log('Checking API status...');
      
      fetch('/health')
        .then(function(response) {
          console.log('Got response from API:', response.status);
          return response.json();
        })
        .then(function(data) {
          console.log('API data:', data);
          updateStatus('Connected', true, JSON.stringify(data));
          
          // If API is connected, fetch provider models
          fetchProviderModels();
        })
        .catch(function(error) {
          console.error('Error connecting to API:', error);
          updateStatus('Disconnected', false, 'Cannot connect to API');
        });
    }
    
    // Call API status check immediately as well
    setTimeout(checkApiStatus, 100);
      
    // Function to fetch provider models
    function fetchProviderModels() {
      fetch('/api/v1/llm/providers')
        .then(function(response) { return response.json(); })
        .then(function(data) {
          // Update OpenAI model dropdown
          var openaiSelect = document.getElementById('openai-model');
          var openaiProvider = data.providers.find(function(p) { return p.id === 'openai'; });
          var openaiModels = openaiProvider ? openaiProvider.models : [];
          
          // Clear options
          openaiSelect.innerHTML = '';
          
          // Add options
          for (var i = 0; i < openaiModels.length; i++) {
            var option = document.createElement('option');
            option.value = openaiModels[i];
            option.textContent = openaiModels[i];
            openaiSelect.appendChild(option);
          }
          
          // Update Anthropic model dropdown
          var anthropicSelect = document.getElementById('anthropic-model');
          var anthropicProvider = data.providers.find(function(p) { return p.id === 'anthropic'; });
          var anthropicModels = anthropicProvider ? anthropicProvider.models : [];
          
          // Clear options
          anthropicSelect.innerHTML = '';
          
          if (anthropicModels.length === 0) {
            // If no models available, add a default option
            var option = document.createElement('option');
            option.value = 'claude-3-sonnet-20240229';
            option.textContent = 'claude-3-sonnet-20240229 (fallback)';
            anthropicSelect.appendChild(option);
          } else {
            // Add options
            for (var j = 0; j < anthropicModels.length; j++) {
              var option = document.createElement('option');
              option.value = anthropicModels[j];
              option.textContent = anthropicModels[j];
              anthropicSelect.appendChild(option);
            }
          }
        })
        .catch(function(error) {
          console.error('Failed to fetch provider models:', error);
          
          // Add fallback options
          var anthropicSelect = document.getElementById('anthropic-model');
          anthropicSelect.innerHTML = '';
          
          var fallbackModels = [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-3-5-sonnet-20240620',
            'claude-2.1',
            'claude-2.0'
          ];
          
          for (var i = 0; i < fallbackModels.length; i++) {
            var option = document.createElement('option');
            option.value = fallbackModels[i];
            option.textContent = fallbackModels[i] + ' (fallback)';
            anthropicSelect.appendChild(option);
          }
        });
    }

    // Helper function to copy text to clipboard
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(function() {
        alert('Copied to clipboard!');
      }).catch(function(err) {
        console.error('Failed to copy text: ', err);
      });
    }

    // Format token usage
    function formatTokenUsage(tokenUsage) {
      if (!tokenUsage) return '';
      return 'Input: ' + tokenUsage.input + ' | Output: ' + tokenUsage.output + ' | Total: ' + tokenUsage.total + ' tokens';
    }

    // OpenAI test function
    function testOpenAI() {
      var apiKey = document.getElementById('openai-api-key').value;
      var model = document.getElementById('openai-model').value;
      var prompt = document.getElementById('openai-prompt').value;
      var loading = document.getElementById('openai-loading');
      var responseDiv = document.getElementById('openai-response');
      var errorDiv = document.getElementById('openai-error');
      
      // Validate input
      if (!apiKey || !prompt) {
        errorDiv.textContent = "API key and prompt are required!";
        return;
      }
      
      errorDiv.textContent = "";
      loading.style.display = 'inline';
      responseDiv.textContent = "Waiting for response...";
      
      fetch('/api/v1/llm/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'openai',
          apiKey: apiKey,
          model: model,
          prompt: prompt
        })
      })
      .then(function(response) {
        return response.json().then(function(data) {
          if (!response.ok) {
            throw new Error(data.message || 'Error testing OpenAI connection');
          }
          return data;
        });
      })
      .then(function(data) {
        // Display the response
        responseDiv.innerHTML = '';
        console.log('OpenAI API Response:', data);
        
        // Success message
        var successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = data.message || 'OpenAI connection successful!';
        responseDiv.appendChild(successDiv);
        
        // Response content with copy button
        var contentDiv = document.createElement('div');
        contentDiv.style.marginTop = '10px';
        contentDiv.style.position = 'relative';
        
        var responseContent = document.createElement('div');
        if (data.response) {
          responseContent.textContent = data.response;
        } else {
          responseContent.textContent = 'No response received';
          console.error('OpenAI response missing response property:', data);
        }
        
        var copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.textContent = 'Copy';
        copyButton.onclick = function() { 
          if (data.response) {
            copyToClipboard(data.response);
          } else {
            alert('No response to copy');
          }
        };
        
        contentDiv.appendChild(responseContent);
        contentDiv.appendChild(copyButton);
        responseDiv.appendChild(contentDiv);
        
        // Token usage
        if (data.tokenUsage) {
          var tokenUsageDiv = document.createElement('div');
          tokenUsageDiv.className = 'token-usage';
          tokenUsageDiv.textContent = formatTokenUsage(data.tokenUsage);
          responseDiv.appendChild(tokenUsageDiv);
        }
      })
      .catch(function(error) {
        errorDiv.textContent = error.message || 'Failed to connect to OpenAI API';
        responseDiv.textContent = '';
      })
      .finally(function() {
        loading.style.display = 'none';
      });
    }

    // Anthropic test function
    function testAnthropic() {
      var apiKey = document.getElementById('anthropic-api-key').value;
      var model = document.getElementById('anthropic-model').value;
      var prompt = document.getElementById('anthropic-prompt').value;
      var loading = document.getElementById('anthropic-loading');
      var responseDiv = document.getElementById('anthropic-response');
      var errorDiv = document.getElementById('anthropic-error');
      
      // Validate input
      if (!apiKey || !prompt) {
        errorDiv.textContent = "API key and prompt are required!";
        return;
      }
      
      errorDiv.textContent = "";
      loading.style.display = 'inline';
      responseDiv.textContent = "Waiting for response...";
      
      fetch('/api/v1/llm/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'anthropic',
          apiKey: apiKey,
          model: model,
          prompt: prompt
        })
      })
      .then(function(response) {
        return response.json().then(function(data) {
          if (!response.ok) {
            throw new Error(data.message || 'Error testing Anthropic connection');
          }
          return data;
        });
      })
      .then(function(data) {
        // Display the response
        responseDiv.innerHTML = '';
        console.log('Anthropic API Response:', data);
        
        // Success message
        var successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = data.message || 'Anthropic connection successful!';
        responseDiv.appendChild(successDiv);
        
        // Response content with copy button
        var contentDiv = document.createElement('div');
        contentDiv.style.marginTop = '10px';
        contentDiv.style.position = 'relative';
        
        var responseContent = document.createElement('div');
        if (data.response) {
          responseContent.textContent = data.response;
        } else {
          responseContent.textContent = 'No response received';
          console.error('Anthropic response missing response property:', data);
        }
        
        var copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.textContent = 'Copy';
        copyButton.onclick = function() { 
          if (data.response) {
            copyToClipboard(data.response);
          } else {
            alert('No response to copy');
          }
        };
        
        contentDiv.appendChild(responseContent);
        contentDiv.appendChild(copyButton);
        responseDiv.appendChild(contentDiv);
        
        // Token usage
        if (data.tokenUsage) {
          var tokenUsageDiv = document.createElement('div');
          tokenUsageDiv.className = 'token-usage';
          tokenUsageDiv.textContent = formatTokenUsage(data.tokenUsage);
          responseDiv.appendChild(tokenUsageDiv);
        }
      })
      .catch(function(error) {
        errorDiv.textContent = error.message || 'Failed to connect to Anthropic API';
        responseDiv.textContent = '';
      })
      .finally(function() {
        loading.style.display = 'none';
      });
    }
  </script>
</body>
</html>`;

  res.send(html);
});

// Check API connectivity
const checkApiConnectivity = () => {
  console.log(`Checking API connectivity to ${API_URL}/health`);
  fetch(`${API_URL}/health`)
    .then(response => response.json())
    .then(data => {
      console.log(`API connectivity check successful: ${JSON.stringify(data)}`);
    })
    .catch(error => {
      console.error(`API connectivity check failed: ${error.message}`);
    });
};

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server is running on http://0.0.0.0:${PORT}`);
  console.log(`API URL is set to: ${API_URL}`);
  
  // Check API connectivity after server starts
  setTimeout(checkApiConnectivity, 1000);
});