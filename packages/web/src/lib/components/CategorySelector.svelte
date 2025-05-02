<script>
  import { createEventDispatcher } from 'svelte';
  import Tooltip from './Tooltip.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let categories = [];
  export let selectedCategories = [];
  export let onChange = () => {};
  
  // Category explanations
  const categoryInfo = {
    'technical-ai': 'Research papers, new frameworks, and technical developments in AI',
    'business-ai': 'AI company news, funding rounds, and market trends',
    'ethics-ai': 'AI ethics discussions, regulations, and social impact',
    'general-tech': 'Broader technology news beyond AI'
  };
  
  function handleCategoryChange(categoryId) {
    if (selectedCategories.includes(categoryId)) {
      selectedCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      selectedCategories = [...selectedCategories, categoryId];
    }
    
    dispatch('change', selectedCategories);
    onChange(selectedCategories);
  }
</script>

<div class="category-selector">
  <div class="category-list">
    {#each categories as category}
      <div class="category-item">
        <label class="category-label" class:selected={selectedCategories.includes(category.id)}>
          <input 
            type="checkbox" 
            checked={selectedCategories.includes(category.id)} 
            on:change={() => handleCategoryChange(category.id)}
          />
          <span class="checkbox-custom"></span>
          <div class="category-content">
            <div class="category-name">
              {category.name}
              <Tooltip text={categoryInfo[category.id] || category.description}>
                <button class="help-icon" type="button" aria-label="Help">?</button>
              </Tooltip>
            </div>
            <div class="category-description">{category.description}</div>
          </div>
        </label>
      </div>
    {/each}
  </div>
</div>

<style>
  .category-selector {
    margin-bottom: 1rem;
  }
  
  .category-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem;
  }
  
  .category-item {
    margin-bottom: 0.5rem;
  }
  
  .category-label {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem;
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .category-label:hover {
    border-color: var(--primary-light);
    background-color: rgba(136, 226, 181, 0.05);
  }
  
  .category-label.selected {
    border-color: var(--primary);
    background-color: rgba(136, 226, 181, 0.1);
  }
  
  .category-label input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkbox-custom {
    position: relative;
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid var(--gray-light);
    border-radius: 4px;
    margin-right: 0.75rem;
    margin-top: 2px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  
  .checkbox-custom::after {
    content: '';
    position: absolute;
    opacity: 0;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    transition: opacity 0.2s ease;
  }
  
  .category-label.selected .checkbox-custom {
    background-color: var(--primary);
    border-color: var(--primary);
  }
  
  .category-label.selected .checkbox-custom::after {
    opacity: 1;
  }
  
  .category-content {
    flex: 1;
  }
  
  .category-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
  }
  
  .category-description {
    font-size: 0.75rem;
    color: #718096;
    line-height: 1.4;
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
  
  :global(.dark) .category-label {
    border-color: #4A5568;
    background-color: var(--gray-dark);
  }
  
  :global(.dark) .category-label:hover {
    border-color: var(--primary-dark);
    background-color: rgba(136, 226, 181, 0.1);
  }
  
  :global(.dark) .category-label.selected {
    border-color: var(--primary);
    background-color: rgba(136, 226, 181, 0.15);
  }
  
  :global(.dark) .checkbox-custom {
    border-color: #4A5568;
  }
  
  :global(.dark) .category-description {
    color: #A0AEC0;
  }
  
  :global(.dark) .help-icon {
    background-color: #4A5568;
    color: #CBD5E0;
  }
  
  @media (max-width: 640px) {
    .category-list {
      grid-template-columns: 1fr;
    }
  }
</style>