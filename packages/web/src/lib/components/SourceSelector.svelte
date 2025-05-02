<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Tooltip from './Tooltip.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let sources = [];
  export let selectedSources = [];
  export let onChange = () => {};
  export let categories = [];
  
  // Source descriptions
  const sourceInfo = {
    'hackernews': 'Technical discussions and links to the latest developments in AI and programming',
    'reddit': 'Community-driven discussions from subreddits like r/MachineLearning and r/AINews',
    'github': 'New AI repositories, trending projects, and code updates',
    'twitter': 'Real-time updates from AI researchers and companies',
    'arxiv': 'Latest AI research papers and preprints',
    'techcrunch': 'AI startup news, funding announcements, and tech industry trends'
  };
  
  // Filter sources based on selected categories
  $: filteredSources = categories.length > 0 
    ? sources.filter(source => 
        source.categories.some(cat => categories.includes(cat))
      )
    : sources;
  
  function handleSourceChange(sourceId) {
    if (selectedSources.includes(sourceId)) {
      selectedSources = selectedSources.filter(id => id !== sourceId);
    } else {
      selectedSources = [...selectedSources, sourceId];
    }
    
    dispatch('change', selectedSources);
    onChange(selectedSources);
  }
  
  function selectAll() {
    selectedSources = filteredSources.map(source => source.id);
    dispatch('change', selectedSources);
    onChange(selectedSources);
  }
  
  function deselectAll() {
    selectedSources = [];
    dispatch('change', selectedSources);
    onChange(selectedSources);
  }
</script>

<div class="source-selector">
  <div class="source-controls">
    <div class="source-count">
      {selectedSources.length} of {filteredSources.length} sources selected
    </div>
    <div class="source-buttons">
      <button class="control-btn" on:click={selectAll}>Select All</button>
      <button class="control-btn" on:click={deselectAll}>Clear</button>
    </div>
  </div>
  
  <div class="source-list">
    {#if filteredSources.length === 0}
      <div class="empty-state">
        Please select at least one category to see relevant news sources.
      </div>
    {:else}
      {#each filteredSources as source}
        <div class="source-item">
          <label class="source-label" class:selected={selectedSources.includes(source.id)}>
            <input 
              type="checkbox" 
              checked={selectedSources.includes(source.id)} 
              on:change={() => handleSourceChange(source.id)}
            />
            <span class="checkbox-custom"></span>
            <div class="source-content">
              <div class="source-name">
                {source.name}
                <Tooltip text={sourceInfo[source.id] || 'News from ' + source.name}>
                  <button class="help-icon" type="button" aria-label="Help">?</button>
                </Tooltip>
              </div>
              <div class="source-categories">
                {#each source.categories as categoryId}
                  <span class="category-tag">
                    {categories.find(cat => cat.id === categoryId)?.name || categoryId}
                  </span>
                {/each}
              </div>
            </div>
          </label>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .source-selector {
    margin-bottom: 1rem;
  }
  
  .source-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .source-count {
    font-size: 0.875rem;
    color: #718096;
  }
  
  .source-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .control-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: none;
    border: 1px solid var(--gray-light);
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .control-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: var(--gray-light);
  }
  
  .source-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
  }
  
  .source-item {
    margin-bottom: 0.5rem;
  }
  
  .source-label {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem;
    border: 1px solid var(--gray-light);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .source-label:hover {
    border-color: var(--primary-light);
    background-color: rgba(136, 226, 181, 0.05);
  }
  
  .source-label.selected {
    border-color: var(--primary);
    background-color: rgba(136, 226, 181, 0.1);
  }
  
  .source-label input {
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
  
  .source-label.selected .checkbox-custom {
    background-color: var(--primary);
    border-color: var(--primary);
  }
  
  .source-label.selected .checkbox-custom::after {
    opacity: 1;
  }
  
  .source-content {
    flex: 1;
  }
  
  .source-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
  }
  
  .source-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .category-tag {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 0.25rem;
    color: #4A5568;
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
  
  .empty-state {
    grid-column: 1 / -1;
    padding: 2rem;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 0.375rem;
    color: #718096;
    font-size: 0.875rem;
  }
  
  :global(.dark) .source-count {
    color: #A0AEC0;
  }
  
  :global(.dark) .control-btn {
    border-color: #4A5568;
    color: var(--text-dark);
  }
  
  :global(.dark) .control-btn:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  :global(.dark) .source-label {
    border-color: #4A5568;
    background-color: var(--gray-dark);
  }
  
  :global(.dark) .source-label:hover {
    border-color: var(--primary-dark);
    background-color: rgba(136, 226, 181, 0.1);
  }
  
  :global(.dark) .source-label.selected {
    border-color: var(--primary);
    background-color: rgba(136, 226, 181, 0.15);
  }
  
  :global(.dark) .checkbox-custom {
    border-color: #4A5568;
  }
  
  :global(.dark) .category-tag {
    background-color: rgba(255, 255, 255, 0.1);
    color: #CBD5E0;
  }
  
  :global(.dark) .help-icon {
    background-color: #4A5568;
    color: #CBD5E0;
  }
  
  :global(.dark) .empty-state {
    background-color: rgba(255, 255, 255, 0.05);
    color: #A0AEC0;
  }
  
  @media (max-width: 640px) {
    .source-list {
      grid-template-columns: 1fr;
    }
    
    .source-controls {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>