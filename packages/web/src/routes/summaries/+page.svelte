<script>
  import { onMount } from 'svelte';
  
  // Summaries state
  let summaries = [];
  let isLoading = true;
  let error = null;
  let userId = null; // Would be fetched from auth or session in a real app
  
  // Pagination
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 5;
  
  // Sample data for demonstration
  const sampleSummaries = [
    {
      id: '1',
      title: 'LLM Advancements and New Research Directions',
      content: `Recent developments in Large Language Models have shown significant improvements in reasoning and specialized domain capabilities. 
      
      Researchers at several leading AI labs have published papers on new techniques for improving context handling and reducing hallucinations. One particularly notable advancement is the introduction of better retrieval techniques that allow models to access and reason over much larger knowledge bases without storing all information in parameters.
      
      Several new models have been released with impressive benchmarks on coding, mathematical reasoning, and multi-language support.`,
      sources: [
        {
          url: 'https://arxiv.org/abs/2304.12345',
          title: 'Improved Retrieval Techniques for LLMs',
          type: 'custom'
        },
        {
          url: 'https://github.com/trending/repositories?spoken_language_code=en',
          title: 'Trending ML repositories on GitHub',
          type: 'github'
        },
        {
          url: 'https://news.ycombinator.com/item?id=12345678',
          title: 'Discussion on HackerNews',
          type: 'hacker_news'
        }
      ],
      generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      deliveryStatus: 'delivered'
    },
    {
      id: '2',
      title: 'Open Source AI Models Gaining Traction',
      content: `The open source AI ecosystem continues to grow rapidly as community-led initiatives make significant strides in matching proprietary model capabilities.
      
      Notable projects like Mistral and Falcon have demonstrated that collaborative open development can produce competitive models at a fraction of the resource cost of larger commercial efforts. These models are being rapidly integrated into a wide array of applications through simpler deployment mechanisms.
      
      Meanwhile, compute-efficient architectures are broadening access to AI capabilities on more modest hardware setups, encouraging innovation from developers with limited resources.`,
      sources: [
        {
          url: 'https://huggingface.co/blog/open-llms',
          title: 'The Rise of Open LLMs',
          type: 'custom'
        },
        {
          url: 'https://www.reddit.com/r/MachineLearning/comments/xyz123',
          title: 'Open LLM Discussion on Reddit',
          type: 'reddit'
        }
      ],
      generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      deliveryStatus: 'delivered'
    }
  ];
  
  onMount(async () => {
    try {
      // In a real implementation, we would fetch from API
      // const response = await fetch(`/api/v1/news/${userId}/summaries?page=${currentPage}&limit=${pageSize}`);
      // const data = await response.json();
      // summaries = data.summaries;
      // totalPages = data.totalPages;
      
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 800));
      summaries = sampleSummaries;
      totalPages = 1;
    } catch (err) {
      error = 'Failed to load summaries. Please try again later.';
      console.error('Error fetching summaries:', err);
    } finally {
      isLoading = false;
    }
  });
  
  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Manually generate new summary (would call API in real implementation)
  async function generateNewSummary() {
    if (!confirm('This will generate a new summary based on your current preferences. Continue?')) {
      return;
    }
    
    try {
      // In a real implementation, we would call API
      // await fetch(`/api/v1/news/${userId}/generate`, { method: 'POST' });
      // Then refresh the list
      
      alert('Summary generation has been triggered! Check back soon for your latest AI news updates.');
    } catch (err) {
      alert('Failed to trigger generation. Please try again later.');
      console.error('Error triggering generation:', err);
    }
  }
</script>

<svelte:head>
  <title>My Summaries - AI News Agent</title>
</svelte:head>

<div class="summaries-page">
  <header class="page-header">
    <h1>My AI News Summaries</h1>
    <button class="btn btn-primary" on:click={generateNewSummary}>
      Generate New Summary
    </button>
  </header>
  
  {#if isLoading}
    <div class="loading-state">
      <p>Loading summaries...</p>
    </div>
  {:else if error}
    <div class="error-state alert alert-danger">
      <p>{error}</p>
    </div>
  {:else if summaries.length === 0}
    <div class="empty-state">
      <h2>No Summaries Yet</h2>
      <p>
        You don't have any summaries yet. They will be generated based on your schedule,
        or you can trigger a manual generation.
      </p>
      <button class="btn btn-primary" on:click={generateNewSummary}>
        Generate Your First Summary
      </button>
    </div>
  {:else}
    <div class="summaries-list">
      {#each summaries as summary}
        <div class="summary-card">
          <div class="summary-header">
            <h2>{summary.title}</h2>
            <div class="summary-meta">
              <span class="summary-date">Generated on {formatDate(summary.generatedAt)}</span>
            </div>
          </div>
          
          <div class="summary-content">
            {#each summary.content.split('\n\n') as paragraph}
              <p>{paragraph}</p>
            {/each}
          </div>
          
          <div class="summary-sources">
            <h3>Sources:</h3>
            <ul>
              {#each summary.sources as source}
                <li>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title || source.url}
                  </a>
                  <span class="source-type">({source.type.replace('_', ' ')})</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/each}
    </div>
    
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          class="btn btn-secondary" 
          disabled={currentPage === 1}
          on:click={() => currentPage--}
        >
          Previous
        </button>
        
        <span class="page-indicator">
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          class="btn btn-secondary" 
          disabled={currentPage === totalPages}
          on:click={() => currentPage++}
        >
          Next
        </button>
      </div>
    {/if}
  {/if}
  
  <div class="help-text">
    <p>
      Summaries are generated based on your preferences and delivery schedule.
      To change your preferences, visit <a href="/setup">Setup</a>.
    </p>
  </div>
</div>

<style>
  .summaries-page {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 3rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
  
  .empty-state h2 {
    margin-bottom: 1rem;
  }
  
  .empty-state p {
    margin-bottom: 2rem;
    color: #6c757d;
  }
  
  .summary-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .summary-header {
    margin-bottom: 1.5rem;
  }
  
  .summary-header h2 {
    margin-bottom: 0.5rem;
  }
  
  .summary-meta {
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .summary-content {
    margin-bottom: 1.5rem;
  }
  
  .summary-sources h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .summary-sources ul {
    padding-left: 1.5rem;
  }
  
  .summary-sources li {
    margin-bottom: 0.5rem;
  }
  
  .source-type {
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  
  .page-indicator {
    color: #6c757d;
  }
  
  .help-text {
    text-align: center;
    color: #6c757d;
    margin-top: 2rem;
  }
</style>