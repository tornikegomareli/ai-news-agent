<script>
  import { createEventDispatcher } from 'svelte';
  import Tooltip from './Tooltip.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let providers = [
    { id: 'openai', name: 'OpenAI (GPT-4)' },
    { id: 'anthropic', name: 'Anthropic (Claude)' }
  ];
  export let selectedProvider = '';
  export let apiKey = '';
  export let onChange = () => {};
  
  // API key patterns
  const apiKeyPatterns = {
    'openai': /^sk-[a-zA-Z0-9]{48}$/,
    'anthropic': /^sk-ant-[a-zA-Z0-9]{48}$/
  };
  
  // API key placeholders
  const apiKeyPlaceholders = {
    'openai': 'sk-...',
    'anthropic': 'sk-ant-...'
  };
  
  // API key validation
  $: isApiKeyValid = !apiKey || (selectedProvider && apiKeyPatterns[selectedProvider]?.test(apiKey));
  
  // Get current placeholder
  $: currentPlaceholder = selectedProvider ? apiKeyPlaceholders[selectedProvider] : 'Select a provider first';
  
  function handleProviderChange(event) {
    selectedProvider = event.target.value;
    apiKey = ''; // Reset API key when provider changes
    dispatch('change', { provider: selectedProvider, apiKey });
    onChange({ provider: selectedProvider, apiKey });
  }
  
  function handleApiKeyChange(event) {
    apiKey = event.target.value;
    dispatch('change', { provider: selectedProvider, apiKey });
    onChange({ provider: selectedProvider, apiKey });
  }
</script>

<div class="llm-selector">
  <div class="form-group">
    <div class="input-header">
      <label for="llm-provider">LLM Provider</label>
      <Tooltip text="Select which AI model provider you want to use for generating your news digests.">
        <button class="help-icon" type="button" aria-label="Help">?</button>
      </Tooltip>
    </div>
    
    <select 
      id="llm-provider" 
      value={selectedProvider} 
      on:change={handleProviderChange}
    >
      <option value="" disabled selected>Select a provider</option>
      {#each providers as provider}
        <option value={provider.id}>{provider.name}</option>
      {/each}
    </select>
    
    <p class="input-help">
      {#if selectedProvider === 'openai'}
        OpenAI's GPT-4 models provide high-quality summaries with strong reasoning abilities.
      {:else if selectedProvider === 'anthropic'}
        Anthropic's Claude models are known for nuanced, thoughtful responses with good citation habits.
      {:else}
        Select your preferred AI model provider. You'll need to provide your own API key.
      {/if}
    </p>
  </div>
  
  <div class="form-group">
    <div class="input-header">
      <label for="api-key">API Key</label>
      <Tooltip text="Your API key stays on your device and is only used to generate your digests. We never store or transmit it to our servers.">
        <button class="help-icon" type="button" aria-label="Help">?</button>
      </Tooltip>
    </div>
    
    <input 
      type="password" 
      id="api-key" 
      placeholder={currentPlaceholder}
      value={apiKey} 
      on:input={handleApiKeyChange}
      disabled={!selectedProvider}
      class:error={!isApiKeyValid}
    />
    
    {#if apiKey && !isApiKeyValid}
      <p class="validation-error">
        Please enter a valid API key format for {selectedProvider === 'openai' ? 'OpenAI' : 'Anthropic'}
      </p>
    {/if}
    
    <p class="input-help">
      {#if selectedProvider === 'openai'}
        You can find your OpenAI API key in your <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">OpenAI dashboard</a>.
      {:else if selectedProvider === 'anthropic'}
        You can find your Anthropic API key in your <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">Anthropic console</a>.
      {:else}
        After selecting a provider, enter your API key to access their models.
      {/if}
    </p>
  </div>
</div>

<style>
  .llm-selector {
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .input-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  label {
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  select, input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  select:focus, input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(136, 226, 181, 0.25);
  }
  
  input.error {
    border-color: #FC8181;
  }
  
  input.error:focus {
    box-shadow: 0 0 0 3px rgba(252, 129, 129, 0.25);
  }
  
  input:disabled {
    background-color: #F7FAFC;
    cursor: not-allowed;
  }
  
  .help-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #CBD5E0;
    color: #4A5568;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    cursor: pointer;
    border: none;
  }
  
  .input-help {
    font-size: 0.75rem;
    color: #718096;
    margin-top: 0.5rem;
    line-height: 1.4;
  }
  
  .input-help a {
    color: var(--primary-dark);
    text-decoration: none;
  }
  
  .input-help a:hover {
    text-decoration: underline;
  }
  
  .validation-error {
    color: #E53E3E;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  :global(.dark) select, :global(.dark) input {
    background-color: var(--gray-dark);
    border-color: #4A5568;
    color: var(--text-dark);
  }
  
  :global(.dark) input:disabled {
    background-color: #2D3748;
    color: #718096;
  }
  
  :global(.dark) .help-icon {
    background-color: #4A5568;
    color: #CBD5E0;
  }
  
  :global(.dark) .input-help {
    color: #A0AEC0;
  }
  
  :global(.dark) .input-help a {
    color: var(--primary-light);
  }
</style>