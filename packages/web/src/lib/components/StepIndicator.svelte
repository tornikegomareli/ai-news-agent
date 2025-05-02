<script>
  export let currentStep = 1;
  export let totalSteps = 5;
  export let stepLabels = [];
  
  // Generate default labels if none provided
  if (stepLabels.length === 0) {
    stepLabels = Array(totalSteps).fill(0).map((_, i) => `Step ${i+1}`);
  }
</script>

<div class="step-indicator">
  <div class="steps">
    {#each Array(totalSteps) as _, i}
      <div class="step-item">
        <div class="step-circle {i + 1 === currentStep ? 'active' : ''} {i + 1 < currentStep ? 'complete' : ''}">
          {i + 1}
        </div>
        {#if i < totalSteps - 1}
          <div class="step-line {i + 1 < currentStep ? 'complete' : ''}"></div>
        {/if}
      </div>
    {/each}
  </div>
  
  <div class="step-labels">
    {#each stepLabels as label, i}
      <div class="step-label {i + 1 === currentStep ? 'active' : ''} {i + 1 < currentStep ? 'complete' : ''}">
        {label}
      </div>
    {/each}
  </div>
</div>

<style>
  .step-indicator {
    margin-bottom: 2rem;
  }
  
  .steps {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .step-item {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .step-circle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: white;
    border: 2px solid var(--gray-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--gray-light);
    z-index: 2;
  }
  
  .step-circle.active {
    background-color: var(--primary);
    border-color: var(--primary);
    color: white;
  }
  
  .step-circle.complete {
    background-color: var(--primary-light);
    border-color: var(--primary);
    color: white;
  }
  
  .step-line {
    flex: 1;
    height: 2px;
    background-color: var(--gray-light);
    margin: 0 0.25rem;
  }
  
  .step-line.complete {
    background-color: var(--primary);
  }
  
  .step-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    padding: 0 0.5rem;
  }
  
  .step-label {
    font-size: 0.75rem;
    color: var(--gray-light);
    text-align: center;
    width: 100%;
  }
  
  .step-label.active {
    color: var(--primary);
    font-weight: 600;
  }
  
  .step-label.complete {
    color: var(--text-light);
  }
  
  :global(.dark) .step-circle {
    background-color: var(--gray-dark);
    border-color: #4A5568;
    color: #A0AEC0;
  }
  
  :global(.dark) .step-label {
    color: #A0AEC0;
  }
  
  :global(.dark) .step-label.complete {
    color: var(--text-dark);
  }
  
  :global(.dark) .step-line {
    background-color: #4A5568;
  }
</style>