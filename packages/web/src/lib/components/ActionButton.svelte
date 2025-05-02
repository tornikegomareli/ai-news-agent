<script>
  export let label = 'Button';
  export let onClick = () => {};
  export let type = 'primary'; // primary, secondary
  export let disabled = false;
</script>

<button 
  class="btn btn-{type}" 
  class:disabled 
  on:click={onClick} 
  {disabled}
>
  {label}
</button>

<style>
  .btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(136, 226, 181, 0.5);
  }
  
  .btn-primary {
    background-color: var(--primary);
    color: #1A202C;
    border: none;
  }
  
  .btn-primary:hover:not(.disabled) {
    background-color: var(--primary-dark);
  }
  
  .btn-secondary {
    background-color: transparent;
    color: var(--text-light);
    border: 1px solid var(--gray-light);
  }
  
  .btn-secondary:hover:not(.disabled) {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .btn-secondary {
    color: var(--text-dark);
    border-color: #4A5568;
  }
  
  :global(.dark) .btn-secondary:hover:not(.disabled) {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>