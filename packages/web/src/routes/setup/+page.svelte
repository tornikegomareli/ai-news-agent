<script>
  import { onMount } from 'svelte';
  
  // Form data
  let formData = {
    email: '',
    telegramId: '',
    deliveryChannel: 'email',
    deliveryFrequency: 'daily',
    categoryFocus: 'technical_ai',
    sourcePreferences: ['hacker_news', 'github'],
    customSources: '',
    customPrompt: '',
    llmProvider: 'openai',
    llmModel: 'gpt-4-turbo',
    llmApiKey: ''
  };
  
  // Form state
  let isSubmitting = false;
  let formError = null;
  let formSuccess = false;
  let showApiKey = false;
  
  // Available providers and models
  let providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      models: ['gpt-4-turbo', 'gpt-4o']
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      models: ['claude-3-opus', 'claude-3-sonnet']
    }
  ];
  
  // Sources options
  const sourceOptions = [
    { id: 'hacker_news', label: 'Hacker News' },
    { id: 'reddit', label: 'Reddit (r/artificial, r/MachineLearning)' },
    { id: 'twitter', label: 'Twitter' },
    { id: 'github', label: 'GitHub (trending AI repos)' },
    { id: 'custom', label: 'Custom sources (Add URLs below)' }
  ];
  
  // Fetch providers on mount
  onMount(async () => {
    try {
      // In a real implementation, we would fetch from API
      // const response = await fetch('/api/v1/llm/providers');
      // providers = await response.json();
      
      // Set default model based on provider
      updateModelOptions();
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  });
  
  // Update model options when provider changes
  function updateModelOptions() {
    const provider = providers.find(p => p.id === formData.llmProvider);
    if (provider && provider.models.length > 0) {
      formData.llmModel = provider.models[0];
    }
  }
  
  // Handle source preference changes
  function handleSourceChange(sourceId, event) {
    const checked = event.target.checked;
    
    if (checked && !formData.sourcePreferences.includes(sourceId)) {
      formData.sourcePreferences = [...formData.sourcePreferences, sourceId];
    } else if (!checked && formData.sourcePreferences.includes(sourceId)) {
      formData.sourcePreferences = formData.sourcePreferences.filter(id => id !== sourceId);
    }
  }
  
  // Handle form submission
  async function handleSubmit() {
    isSubmitting = true;
    formError = null;
    
    try {
      // Validate form
      if (formData.deliveryChannel === 'email' && !formData.email) {
        throw new Error('Email is required when email delivery is selected');
      }
      
      if (formData.deliveryChannel === 'telegram' && !formData.telegramId) {
        throw new Error('Telegram ID is required when Telegram delivery is selected');
      }
      
      if (formData.sourcePreferences.length === 0) {
        throw new Error('Select at least one source');
      }
      
      if (!formData.llmApiKey) {
        throw new Error('API key is required');
      }
      
      // Process custom sources if selected
      let customSourcesList = [];
      if (formData.sourcePreferences.includes('custom') && formData.customSources) {
        customSourcesList = formData.customSources
          .split('\n')
          .map(s => s.trim())
          .filter(s => s !== '');
          
        // Simple URL validation
        const invalidUrls = customSourcesList.filter(url => !url.startsWith('http'));
        if (invalidUrls.length > 0) {
          throw new Error(`Invalid URLs: ${invalidUrls.join(', ')}`);
        }
      }
      
      // Prepare data for API
      const userData = {
        email: formData.deliveryChannel === 'email' ? formData.email : undefined,
        telegramId: formData.deliveryChannel === 'telegram' ? formData.telegramId : undefined,
        deliveryChannel: formData.deliveryChannel,
        deliveryFrequency: formData.deliveryFrequency,
        categoryFocus: formData.categoryFocus,
        sourcePreferences: formData.sourcePreferences,
        customSources: customSourcesList.length > 0 ? customSourcesList : undefined,
        customPrompt: formData.customPrompt || undefined,
        llmProvider: formData.llmProvider,
        llmModel: formData.llmModel,
        llmApiKey: formData.llmApiKey
      };
      
      // In a real implementation, we would post to API
      /*
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save configuration');
      }
      */
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      formSuccess = true;
      console.log('Form submitted successfully with data:', userData);
    } catch (error) {
      formError = error.message;
      console.error('Form submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  // Toggle API key visibility
  function toggleApiKeyVisibility() {
    showApiKey = !showApiKey;
  }
</script>

<svelte:head>
  <title>Setup Your News Agent - AI News Agent</title>
</svelte:head>

<div class="setup-page">
  <h1>Configure Your AI News Agent</h1>
  
  <p class="lead">
    Set up your preferences for personalized AI news summaries.
  </p>
  
  {#if formSuccess}
    <div class="alert alert-success">
      <h3>Setup Complete!</h3>
      <p>Your AI News Agent is configured and ready to deliver summaries based on your preferences.</p>
      <p>Your first summary will be delivered according to your selected frequency.</p>
      <div class="mt-3">
        <a href="/summaries" class="btn btn-primary">View Summaries</a>
      </div>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="setup-form">
      {#if formError}
        <div class="alert alert-danger">
          {formError}
        </div>
      {/if}
      
      <!-- Delivery Information -->
      <div class="form-section">
        <h2>Delivery Settings</h2>
        
        <div class="form-group">
          <label for="delivery-channel">Delivery Channel</label>
          <select 
            id="delivery-channel" 
            bind:value={formData.deliveryChannel}
          >
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>
        
        {#if formData.deliveryChannel === 'email'}
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              bind:value={formData.email} 
              placeholder="Enter your email address"
              required
            />
          </div>
        {:else}
          <div class="form-group">
            <label for="telegram-id">Telegram ID</label>
            <input 
              type="text" 
              id="telegram-id" 
              bind:value={formData.telegramId} 
              placeholder="Enter your Telegram ID"
              required
            />
            <small>Find your Telegram ID by messaging @userinfobot on Telegram.</small>
          </div>
        {/if}
        
        <div class="form-group">
          <label for="delivery-frequency">Delivery Frequency</label>
          <select 
            id="delivery-frequency" 
            bind:value={formData.deliveryFrequency}
          >
            <option value="daily">Daily</option>
            <option value="every_2_days">Every 2 Days</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
      
      <!-- Content Preferences -->
      <div class="form-section">
        <h2>Content Preferences</h2>
        
        <div class="form-group">
          <label for="category-focus">Category Focus</label>
          <select 
            id="category-focus" 
            bind:value={formData.categoryFocus}
          >
            <option value="technical_ai">Technical AI (research, software, frameworks)</option>
            <option value="business_ai">Business AI (applications, funding, markets)</option>
            <option value="marketing_ai">Marketing AI (tools, campaigns, case studies)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Source Preferences (select at least one)</label>
          <div class="checkbox-group">
            {#each sourceOptions as source}
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id={`source-${source.id}`}
                  checked={formData.sourcePreferences.includes(source.id)}
                  on:change={(e) => handleSourceChange(source.id, e)}
                />
                <label for={`source-${source.id}`}>{source.label}</label>
              </div>
            {/each}
          </div>
        </div>
        
        {#if formData.sourcePreferences.includes('custom')}
          <div class="form-group">
            <label for="custom-sources">Custom Sources (one URL per line)</label>
            <textarea 
              id="custom-sources"
              bind:value={formData.customSources}
              rows="3"
              placeholder="https://example.com/ai-blog"
            ></textarea>
          </div>
        {/if}
        
        <div class="form-group">
          <label for="custom-prompt">Custom Prompt (optional)</label>
          <textarea 
            id="custom-prompt"
            bind:value={formData.customPrompt}
            rows="3"
            placeholder="E.g., Focus on LLM advancements and applications in healthcare"
          ></textarea>
          <small>Further customize your summaries with specific interests or focus areas.</small>
        </div>
      </div>
      
      <!-- LLM Settings -->
      <div class="form-section">
        <h2>LLM Configuration</h2>
        
        <div class="form-group">
          <label for="llm-provider">LLM Provider</label>
          <select 
            id="llm-provider" 
            bind:value={formData.llmProvider}
            on:change={updateModelOptions}
          >
            {#each providers as provider}
              <option value={provider.id}>{provider.name}</option>
            {/each}
          </select>
        </div>
        
        <div class="form-group">
          <label for="llm-model">LLM Model</label>
          <select 
            id="llm-model" 
            bind:value={formData.llmModel}
          >
            {#each providers.find(p => p.id === formData.llmProvider)?.models || [] as model}
              <option value={model}>{model}</option>
            {/each}
          </select>
        </div>
        
        <div class="form-group">
          <label for="llm-api-key">API Key</label>
          <div class="api-key-input">
            <input 
              type={showApiKey ? "text" : "password"} 
              id="llm-api-key" 
              bind:value={formData.llmApiKey} 
              placeholder="Enter your API key"
              required
            />
            <button 
              type="button" 
              class="toggle-visibility" 
              on:click={toggleApiKeyVisibility}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <small>
            Your API key is encrypted before storage and only used to generate summaries.
            <a href={formData.llmProvider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://console.anthropic.com/keys'} target="_blank" rel="noopener noreferrer">
              Get an API key
            </a>
          </small>
        </div>
      </div>
      
      <div class="form-buttons">
        <button type="submit" class="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .setup-page {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .lead {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
  }
  
  .setup-form {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    overflow: hidden;
  }
  
  .form-section {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .form-section h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
  
  .form-buttons {
    padding: 1.5rem;
    text-align: right;
  }
  
  .api-key-input {
    display: flex;
  }
  
  .toggle-visibility {
    margin-left: 0.5rem;
    align-self: center;
    padding: 0.5rem 0.75rem;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  small {
    display: block;
    margin-top: 0.5rem;
    color: #6c757d;
  }
</style>