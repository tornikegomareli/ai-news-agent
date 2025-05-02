<script>
  import { slide } from 'svelte/transition';
  
  export let title = '';
  export let defaultOpen = false;
  
  let isOpen = defaultOpen;
  
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="collapsible">
  <button class="collapsible-header" on:click={toggle}>
    <span>{title}</span>
    <svg 
      class="arrow" 
      class:rotate={isOpen} 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
  
  {#if isOpen}
    <div class="collapsible-content" transition:slide={{ duration: 300 }}>
      <slot></slot>
    </div>
  {/if}
</div>

<style>
  .collapsible {
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    overflow: hidden;
  }
  
  :global(.dark) .collapsible {
    border-color: #4A5568;
  }
  
  .collapsible-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: rgba(0, 0, 0, 0.02);
    border: none;
    text-align: left;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  :global(.dark) .collapsible-header {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .collapsible-header:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .collapsible-header:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .arrow {
    transition: transform 0.3s ease;
  }
  
  .rotate {
    transform: rotate(180deg);
  }
  
  .collapsible-content {
    border-top: 1px solid var(--gray-light);
  }
  
  :global(.dark) .collapsible-content {
    border-color: #4A5568;
  }
</style>