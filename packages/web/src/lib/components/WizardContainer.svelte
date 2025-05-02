<script>
  import { writable } from 'svelte/store';
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  // Import all required components
  import Card from './Card.svelte';
  import StepIndicator from './StepIndicator.svelte';
  import ActionButton from './ActionButton.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import DeliverySelector from './DeliverySelector.svelte';
  import FrequencySelector from './FrequencySelector.svelte';
  import CategorySelector from './CategorySelector.svelte';
  import SourceSelector from './SourceSelector.svelte';
  import CustomPromptInput from './CustomPromptInput.svelte';
  import LLMSelector from './LLMSelector.svelte';
  import Collapsible from './Collapsible.svelte';
  
  // Define the steps in the wizard
  const STEPS = {
    DELIVERY: 1,
    CONTENT: 2,
    SOURCES: 3,
    CUSTOMIZATION: 4,
    REVIEW: 5
  };
  
  // Create state store for the form
  const formState = writable({
    // Delivery settings
    deliveryMethod: 'email',
    deliveryValue: '',
    frequency: 'daily',
    
    // Content settings
    categories: [],
    
    // Sources settings
    sources: [],
    
    // Customization settings
    customPrompt: '',
    llmProvider: '',
    apiKey: '',
    
    // Form validation
    isValid: false,
    errors: {}
  });
  
  // Track current step
  let currentStep = STEPS.DELIVERY;
  
  // Mock data for categories
  const categories = [
    { id: 'technical-ai', name: 'Technical AI', description: 'Research papers, technical developments, frameworks' },
    { id: 'business-ai', name: 'Business AI', description: 'Company news, funding, market trends' },
    { id: 'ethics-ai', name: 'AI Ethics', description: 'Ethical discussions, regulations, social impact' },
    { id: 'general-tech', name: 'General Tech', description: 'Broader technology news beyond AI' }
  ];
  
  // Mock data for sources
  const sources = [
    { id: 'hackernews', name: 'Hacker News', categories: ['technical-ai', 'general-tech'] },
    { id: 'reddit', name: 'Reddit', categories: ['technical-ai', 'business-ai', 'ethics-ai', 'general-tech'] },
    { id: 'github', name: 'GitHub Trending', categories: ['technical-ai'] },
    { id: 'twitter', name: 'Twitter/X', categories: ['technical-ai', 'business-ai', 'ethics-ai'] },
    { id: 'arxiv', name: 'arXiv', categories: ['technical-ai'] },
    { id: 'techcrunch', name: 'TechCrunch', categories: ['business-ai', 'general-tech'] }
  ];
  
  // Track form completion by step
  $: isDeliveryComplete = $formState.deliveryMethod === 'email' 
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($formState.deliveryValue)
    : $formState.deliveryValue.trim().length > 0;
  
  $: isContentComplete = $formState.categories.length > 0;
  
  $: isSourcesComplete = $formState.sources.length > 0;
  
  $: isCustomizationComplete = !$formState.llmProvider || 
    ($formState.llmProvider && $formState.apiKey && validateApiKey($formState.llmProvider, $formState.apiKey));
  
  $: canProceedToNext = currentStep === STEPS.DELIVERY ? isDeliveryComplete :
                         currentStep === STEPS.CONTENT ? isContentComplete :
                         currentStep === STEPS.SOURCES ? isSourcesComplete :
                         currentStep === STEPS.CUSTOMIZATION ? isCustomizationComplete :
                         true;
  
  $: stepLabels = ['Delivery Setup', 'News Categories', 'News Sources', 'Customization', 'Review & Submit'];
  
  // Validation functions
  function validateApiKey(provider, key) {
    const patterns = {
      'openai': /^sk-[a-zA-Z0-9]{48}$/,
      'anthropic': /^sk-ant-[a-zA-Z0-9]{48}$/
    };
    
    return !key || (provider && patterns[provider]?.test(key));
  }
  
  // Navigation functions
  function goToNextStep() {
    if (currentStep < STEPS.REVIEW) {
      currentStep++;
    } else {
      submitForm();
    }
  }
  
  function goToPreviousStep() {
    if (currentStep > STEPS.DELIVERY) {
      currentStep--;
    }
  }
  
  function goToStep(step) {
    // Only allow going to a step if all previous steps are complete
    if (step === STEPS.DELIVERY) {
      currentStep = step;
    } else if (step === STEPS.CONTENT && isDeliveryComplete) {
      currentStep = step;
    } else if (step === STEPS.SOURCES && isDeliveryComplete && isContentComplete) {
      currentStep = step;
    } else if (step === STEPS.CUSTOMIZATION && isDeliveryComplete && isContentComplete && isSourcesComplete) {
      currentStep = step;
    } else if (step === STEPS.REVIEW && isDeliveryComplete && isContentComplete && isSourcesComplete && isCustomizationComplete) {
      currentStep = step;
    }
  }
  
  // Form submission
  async function submitForm() {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify($formState)
      });
      
      if (response.ok) {
        // Handle success - redirect to dashboard or show success message
        window.location.href = '/summaries';
      } else {
        // Handle error
        const error = await response.json();
        console.error('Submission error:', error);
        // Update form errors
        formState.update(state => ({
          ...state,
          errors: { ...state.errors, submit: error.message || 'Failed to save preferences' }
        }));
      }
    } catch (error) {
      console.error('Submission error:', error);
      formState.update(state => ({
        ...state,
        errors: { ...state.errors, submit: 'Network error, please try again' }
      }));
    }
  }
  
  // Event handlers for form inputs
  function handleDeliveryChange(event) {
    formState.update(state => ({
      ...state,
      deliveryMethod: event.detail.method,
      deliveryValue: event.detail.value
    }));
  }
  
  function handleFrequencyChange(event) {
    formState.update(state => ({
      ...state,
      frequency: event.detail
    }));
  }
  
  function handleCategoriesChange(event) {
    formState.update(state => ({
      ...state,
      categories: event.detail,
      // Clear sources that don't match any selected categories
      sources: state.sources.filter(sourceId => 
        sources.find(s => s.id === sourceId)?.categories.some(cat => 
          event.detail.includes(cat)
        )
      )
    }));
  }
  
  function handleSourcesChange(event) {
    formState.update(state => ({
      ...state,
      sources: event.detail
    }));
  }
  
  function handleCustomPromptChange(event) {
    formState.update(state => ({
      ...state,
      customPrompt: event.detail
    }));
  }
  
  function handleLLMChange(event) {
    formState.update(state => ({
      ...state,
      llmProvider: event.detail.provider,
      apiKey: event.detail.apiKey
    }));
  }
</script>

<div class="wizard-container">
  <div class="wizard-header">
    <h1>AI News Agent Setup</h1>
    <ThemeToggle />
  </div>
  
  <StepIndicator 
    currentStep={currentStep} 
    totalSteps={Object.keys(STEPS).length} 
    {stepLabels}
  />
  
  <div class="wizard-content">
    <!-- Step 1: Delivery Setup -->
    <Card 
      title="How would you like to receive your news?" 
      helpText="Choose your preferred delivery method and frequency."
      isActive={currentStep === STEPS.DELIVERY}
    >
      <div class="step-content">
        <h3>Delivery Method</h3>
        <DeliverySelector 
          value={$formState.deliveryMethod} 
          onChange={handleDeliveryChange}
        />
        
        <h3>Frequency</h3>
        <FrequencySelector 
          value={$formState.frequency} 
          onChange={handleFrequencyChange}
        />
      </div>
      
      <div class="step-actions">
        <ActionButton 
          label="Continue" 
          type="primary" 
          disabled={!isDeliveryComplete}
          onClick={goToNextStep}
        />
      </div>
    </Card>
    
    <!-- Step 2: News Categories -->
    <Card 
      title="What topics are you interested in?" 
      helpText="Select one or more AI news categories that interest you."
      isActive={currentStep === STEPS.CONTENT}
    >
      <div class="step-content">
        <CategorySelector 
          categories={categories} 
          selectedCategories={$formState.categories}
          onChange={handleCategoriesChange}
        />
      </div>
      
      <div class="step-actions">
        <ActionButton 
          label="Back" 
          type="secondary" 
          onClick={goToPreviousStep}
        />
        <ActionButton 
          label="Continue" 
          type="primary" 
          disabled={!isContentComplete}
          onClick={goToNextStep}
        />
      </div>
    </Card>
    
    <!-- Step 3: News Sources -->
    <Card 
      title="Select your news sources" 
      helpText="Choose where your AI news digest should pull content from."
      isActive={currentStep === STEPS.SOURCES}
    >
      <div class="step-content">
        <SourceSelector 
          sources={sources} 
          selectedSources={$formState.sources}
          onChange={handleSourcesChange}
          categories={$formState.categories}
        />
      </div>
      
      <div class="step-actions">
        <ActionButton 
          label="Back" 
          type="secondary" 
          onClick={goToPreviousStep}
        />
        <ActionButton 
          label="Continue" 
          type="primary" 
          disabled={!isSourcesComplete}
          onClick={goToNextStep}
        />
      </div>
    </Card>
    
    <!-- Step 4: Customization -->
    <Card 
      title="Customize your digest" 
      helpText="Fine-tune how your AI news digest will be generated."
      isActive={currentStep === STEPS.CUSTOMIZATION}
    >
      <div class="step-content">
        <h3>Custom Instructions</h3>
        <CustomPromptInput 
          value={$formState.customPrompt} 
          onChange={handleCustomPromptChange}
        />
        
        <Collapsible title="Advanced Options" defaultOpen={false}>
          <div class="advanced-options">
            <h3>LLM Provider</h3>
            <p class="text-sm">Connect your own AI model API key for generating news digests.</p>
            <LLMSelector 
              selectedProvider={$formState.llmProvider}
              apiKey={$formState.apiKey}
              onChange={handleLLMChange}
            />
          </div>
        </Collapsible>
      </div>
      
      <div class="step-actions">
        <ActionButton 
          label="Back" 
          type="secondary" 
          onClick={goToPreviousStep}
        />
        <ActionButton 
          label="Continue" 
          type="primary" 
          disabled={!isCustomizationComplete}
          onClick={goToNextStep}
        />
      </div>
    </Card>
    
    <!-- Step 5: Review & Submit -->
    <Card 
      title="Review & Submit" 
      helpText="Review your settings before finalizing your AI news digest setup."
      isActive={currentStep === STEPS.REVIEW}
    >
      <div class="step-content">
        <div class="review-section">
          <h3>Delivery Settings</h3>
          <div class="review-group">
            <div class="review-item">
              <span class="review-label">Method:</span>
              <span class="review-value">{$formState.deliveryMethod === 'email' ? 'Email' : 'Telegram'}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Recipient:</span>
              <span class="review-value">{$formState.deliveryValue}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Frequency:</span>
              <span class="review-value">
                {$formState.frequency === 'daily' ? 'Daily' : 
                 $formState.frequency === 'weekly' ? 'Weekly' : 'Twice a week'}
              </span>
            </div>
          </div>
          <button class="edit-link" on:click={() => goToStep(STEPS.DELIVERY)}>Edit</button>
        </div>
        
        <div class="review-section">
          <h3>Content Settings</h3>
          <div class="review-group">
            <div class="review-item">
              <span class="review-label">Categories:</span>
              <div class="review-tags">
                {#each $formState.categories as categoryId}
                  <span class="review-tag">{categories.find(c => c.id === categoryId)?.name || categoryId}</span>
                {/each}
              </div>
            </div>
          </div>
          <button class="edit-link" on:click={() => goToStep(STEPS.CONTENT)}>Edit</button>
        </div>
        
        <div class="review-section">
          <h3>Source Settings</h3>
          <div class="review-group">
            <div class="review-item">
              <span class="review-label">Sources:</span>
              <div class="review-tags">
                {#each $formState.sources as sourceId}
                  <span class="review-tag">{sources.find(s => s.id === sourceId)?.name || sourceId}</span>
                {/each}
              </div>
            </div>
          </div>
          <button class="edit-link" on:click={() => goToStep(STEPS.SOURCES)}>Edit</button>
        </div>
        
        <div class="review-section">
          <h3>Customization Settings</h3>
          <div class="review-group">
            {#if $formState.customPrompt}
              <div class="review-item">
                <span class="review-label">Custom Instructions:</span>
                <div class="review-value prompt-preview">
                  {$formState.customPrompt}
                </div>
              </div>
            {/if}
            
            {#if $formState.llmProvider}
              <div class="review-item">
                <span class="review-label">LLM Provider:</span>
                <span class="review-value">
                  {$formState.llmProvider === 'openai' ? 'OpenAI (GPT-4)' : 'Anthropic (Claude)'}
                </span>
              </div>
            {/if}
          </div>
          <button class="edit-link" on:click={() => goToStep(STEPS.CUSTOMIZATION)}>Edit</button>
        </div>
        
        {#if $formState.errors.submit}
          <div class="error-message" transition:slide={{ duration: 300 }}>
            {$formState.errors.submit}
          </div>
        {/if}
      </div>
      
      <div class="step-actions">
        <ActionButton 
          label="Back" 
          type="secondary" 
          onClick={goToPreviousStep}
        />
        <ActionButton 
          label="Submit" 
          type="primary" 
          onClick={submitForm}
        />
      </div>
    </Card>
  </div>
</div>

<style>
  .wizard-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .wizard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 1.75rem;
    margin: 0;
  }
  
  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    margin-top: 1.5rem;
  }
  
  h3:first-child {
    margin-top: 0;
  }
  
  .step-content {
    margin-bottom: 1.5rem;
  }
  
  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  
  .advanced-options {
    padding: 1rem;
  }
  
  .review-section {
    position: relative;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 0.5rem;
  }
  
  :global(.dark) .review-section {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .review-section h3 {
    margin-top: 0;
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .review-group {
    margin-bottom: 1rem;
  }
  
  .review-item {
    display: flex;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .review-label {
    font-weight: 500;
    margin-right: 0.5rem;
    color: #718096;
    min-width: 100px;
  }
  
  :global(.dark) .review-label {
    color: #A0AEC0;
  }
  
  .review-value {
    flex: 1;
  }
  
  .review-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .review-tag {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    background-color: rgba(136, 226, 181, 0.2);
    border-radius: 0.25rem;
  }
  
  .edit-link {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: var(--primary-dark);
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.125rem 0.25rem;
  }
  
  .edit-link:hover {
    text-decoration: underline;
  }
  
  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: rgba(229, 62, 62, 0.1);
    border-left: 3px solid #E53E3E;
    color: #E53E3E;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .prompt-preview {
    white-space: pre-line;
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    max-height: 100px;
    overflow-y: auto;
  }
  
  :global(.dark) .prompt-preview {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 640px) {
    .wizard-container {
      padding: 1rem 0.5rem;
    }
    
    .wizard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .review-item {
      flex-direction: column;
    }
    
    .review-label {
      margin-bottom: 0.25rem;
    }
    
    .step-actions {
      flex-direction: column-reverse;
      width: 100%;
    }
    
    .step-actions :global(button) {
      width: 100%;
    }
  }
</style>