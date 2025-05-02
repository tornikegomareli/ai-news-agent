<script>
  import { createEventDispatcher } from 'svelte';
  import Tooltip from './Tooltip.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let value = '';
  export let onChange = () => {};
  export let placeholder = 'Write additional instructions for the AI when generating your summary...';
  export let examples = [
    'Focus on implementation details rather than announcements',
    'Include code examples when available',
    'Highlight controversies and different viewpoints'
  ];
  
  function handleInput(event) {
    value = event.target.value;
    dispatch('change', value);
    onChange(value);
  }
  
  function applyExample(example) {
    value = value ? value + '\n' + example : example;
    dispatch('change', value);
    onChange(value);
  }
</script>

<div class="custom-prompt">
  <div class="prompt-header">
    <label for="custom-prompt">Custom Instructions</label>
    <Tooltip text="This instruction will be added to the AI prompt when generating your digest. Use it to fine-tune the style, focus, or content structure.">
      <button class="help-icon" type="button" aria-label="Help">?</button>
    </Tooltip>
  </div>
  
  <textarea 
    id="custom-prompt"
    rows="4" 
    {placeholder}
    bind:value={value}
    on:input={handleInput}
  ></textarea>
  
  <div class="examples-section">
    <div class="examples-header">Example prompts</div>
    <div class="examples-list">
      {#each examples as example}
        <button class="example-item" on:click={() => applyExample(example)}>
          + {example}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .custom-prompt {
    margin-bottom: 1rem;
  }
  
  .prompt-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  label {
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
    line-height: 1.5;
  }
  
  textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(136, 226, 181, 0.25);
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
  
  .examples-section {
    margin-top: 0.75rem;
  }
  
  .examples-header {
    font-size: 0.75rem;
    color: #718096;
    margin-bottom: 0.5rem;
  }
  
  .examples-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .example-item {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background-color: rgba(136, 226, 181, 0.1);
    border: 1px solid rgba(136, 226, 181, 0.3);
    border-radius: 0.25rem;
    color: #2D3748;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .example-item:hover {
    background-color: rgba(136, 226, 181, 0.2);
    border-color: rgba(136, 226, 181, 0.5);
  }
  
  :global(.dark) textarea {
    background-color: var(--gray-dark);
    border-color: #4A5568;
    color: var(--text-dark);
  }
  
  :global(.dark) .help-icon {
    background-color: #4A5568;
    color: #CBD5E0;
  }
  
  :global(.dark) .examples-header {
    color: #A0AEC0;
  }
  
  :global(.dark) .example-item {
    background-color: rgba(136, 226, 181, 0.1);
    border-color: rgba(136, 226, 181, 0.3);
    color: #CBD5E0;
  }
  
  :global(.dark) .example-item:hover {
    background-color: rgba(136, 226, 181, 0.15);
    border-color: rgba(136, 226, 181, 0.4);
  }
</style>