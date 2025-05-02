<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let value = '';
  export let onChange = () => {};
  export let options = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Twice a week' }
  ];
  export let defaultValue = 'daily';
  
  // Initialize with the provided value or default
  $: {
    value = value || defaultValue;
  }
  
  function handleChange(event) {
    value = event.target.value;
    dispatch('change', value);
    onChange(value);
  }
</script>

<div class="frequency-selector">
  <div class="option-cards">
    {#each options as option}
      <label class="option-card" class:selected={value === option.value}>
        <input 
          type="radio" 
          name="frequency" 
          value={option.value} 
          checked={value === option.value} 
          on:change={handleChange}
        />
        <div class="option-content">
          <div class="option-label">{option.label}</div>
          <div class="option-description">
            {#if option.value === 'daily'}
              Short daily summaries of latest developments
            {:else if option.value === 'weekly'}
              Comprehensive weekly roundup of key news
            {:else if option.value === 'biweekly'}
              Mid-week and weekend updates
            {/if}
          </div>
        </div>
      </label>
    {/each}
  </div>
</div>

<style>
  .frequency-selector {
    margin-bottom: 1rem;
  }
  
  .option-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  
  .option-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .option-card:hover {
    border-color: var(--primary-light);
    background-color: rgba(136, 226, 181, 0.05);
  }
  
  .option-card.selected {
    border-color: var(--primary);
    background-color: rgba(136, 226, 181, 0.1);
  }
  
  .option-card input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .option-content {
    display: flex;
    flex-direction: column;
  }
  
  .option-label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .option-description {
    font-size: 0.75rem;
    color: #718096;
    line-height: 1.4;
  }
  
  :global(.dark) .option-card {
    border-color: #4A5568;
    background-color: var(--gray-dark);
  }
  
  :global(.dark) .option-card:hover {
    border-color: var(--primary-dark);
    background-color: rgba(136, 226, 181, 0.1);
  }
  
  :global(.dark) .option-card.selected {
    border-color: var(--primary);
    background-color: rgba(136, 226, 181, 0.15);
  }
  
  :global(.dark) .option-description {
    color: #A0AEC0;
  }
  
  @media (max-width: 480px) {
    .option-cards {
      grid-template-columns: 1fr;
    }
  }
</style>