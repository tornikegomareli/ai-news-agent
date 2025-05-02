<script>
  export let title = '';
  export let isActive = true;
  export let helpText = '';
</script>

<div class="card" class:hidden={!isActive}>
  {#if title}
    <div class="card-header">
      <h2 class="text-xl font-semibold">{title}</h2>
      {#if helpText}
        <p class="text-sm mt-1">{helpText}</p>
      {/if}
    </div>
  {/if}
  <div class="card-body">
    <slot></slot>
  </div>
</div>

<style>
  .hidden {
    display: none;
  }
  
  .card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
  }
  
  :global(.dark) .card {
    background-color: var(--gray-dark);
  }
  
  .card-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--gray-light);
  }
  
  :global(.dark) .card-header {
    border-color: #2D3748;
  }
  
  .card-body {
    padding: 1.5rem;
  }
</style>