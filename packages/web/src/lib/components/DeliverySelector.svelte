<script>
  import Tooltip from './Tooltip.svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let value = 'email';
  export let onChange = () => {};
  export let defaultValue = 'email';
  
  let email = '';
  let telegramId = '';
  
  // Initialize with the provided value or default
  $: {
    value = value || defaultValue;
  }
  
  // Validate email
  $: isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Validate telegram ID (simple non-empty validation)
  $: isTelegramValid = !telegramId || telegramId.trim().length > 0;
  
  function handleDeliveryChange(method) {
    value = method;
    dispatch('change', { method, value: method === 'email' ? email : telegramId });
    onChange({ method, value: method === 'email' ? email : telegramId });
  }
  
  function handleInputChange() {
    dispatch('change', { method: value, value: value === 'email' ? email : telegramId });
    onChange({ method: value, value: value === 'email' ? email : telegramId });
  }
</script>

<div class="delivery-selector">
  <div class="toggle-buttons">
    <button 
      class="toggle-btn" 
      class:active={value === 'email'} 
      on:click={() => handleDeliveryChange('email')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      Email
    </button>
    <button 
      class="toggle-btn" 
      class:active={value === 'telegram'} 
      on:click={() => handleDeliveryChange('telegram')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.91 6.977a2.24 2.24 0 0 0-.641 3.865l4.283 2.914 9.581-7.978-7.332 8.856 3.585 2.442a2.24 2.24 0 0 0 3.089-.658l6.479-11.982a2.24 2.24 0 0 0-1.069-4.651z"></path>
      </svg>
      Telegram
    </button>
  </div>
  
  <div class="delivery-input">
    {#if value === 'email'}
      <div class="form-group">
        <div class="input-with-tooltip">
          <input 
            type="email" 
            placeholder="your.email@example.com" 
            bind:value={email} 
            on:input={handleInputChange} 
            class:error={!isEmailValid}
          />
          <Tooltip text="We'll send your AI news digest directly to this email address. Make sure it's one you check regularly!">
            <button class="help-icon" type="button" aria-label="Help">?</button>
          </Tooltip>
        </div>
        {#if email && !isEmailValid}
          <p class="validation-error">Please enter a valid email address</p>
        {/if}
      </div>
    {:else}
      <div class="form-group">
        <div class="input-with-tooltip">
          <input 
            type="text" 
            placeholder="Your Telegram username or ID" 
            bind:value={telegramId} 
            on:input={handleInputChange} 
            class:error={!isTelegramValid}
          />
          <Tooltip text="Connect with our Telegram bot @AiNewsAgentBot first, then enter your Telegram ID or username here.">
            <button class="help-icon" type="button" aria-label="Help">?</button>
          </Tooltip>
        </div>
        {#if telegramId && !isTelegramValid}
          <p class="validation-error">Please enter a valid Telegram ID</p>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .delivery-selector {
    margin-bottom: 1rem;
  }
  
  .toggle-buttons {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--gray-light);
    background-color: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .toggle-btn:first-child {
    border-radius: 0.375rem 0 0 0.375rem;
  }
  
  .toggle-btn:last-child {
    border-radius: 0 0.375rem 0.375rem 0;
  }
  
  .toggle-btn.active {
    background-color: var(--primary-light);
    border-color: var(--primary);
    color: var(--text-light);
  }
  
  .toggle-btn:hover:not(.active) {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .toggle-btn {
    background-color: var(--gray-dark);
    border-color: #4A5568;
    color: var(--text-dark);
  }
  
  :global(.dark) .toggle-btn:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  :global(.dark) .toggle-btn.active {
    background-color: rgba(136, 226, 181, 0.2);
    border-color: var(--primary);
  }
  
  .input-with-tooltip {
    display: flex;
    align-items: center;
  }
  
  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  input:focus {
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
  
  :global(.dark) input {
    background-color: var(--gray-dark);
    border-color: #4A5568;
    color: var(--text-dark);
  }
  
  .help-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #CBD5E0;
    color: #4A5568;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    cursor: pointer;
    border: none;
  }
  
  :global(.dark) .help-icon {
    background-color: #4A5568;
    color: #CBD5E0;
  }
  
  .validation-error {
    color: #E53E3E;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  @media (max-width: 640px) {
    .toggle-buttons {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .toggle-btn:first-child,
    .toggle-btn:last-child {
      border-radius: 0.375rem;
    }
  }
</style>