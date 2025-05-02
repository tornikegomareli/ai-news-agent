<script>
  import '../styles/global.css';
  import { onMount } from 'svelte';
  
  let theme = 'light';
  
  onMount(() => {
    // Check local storage or system preference for theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
    
    document.documentElement.classList.toggle('dark', theme === 'dark');
  });
</script>

<div class="{theme === 'dark' ? 'dark' : ''}">
  <slot />
</div>