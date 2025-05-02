<script>
  export let text = '';
  export let position = 'top'; // top, bottom, left, right
</script>

<div class="tooltip-container">
  <slot></slot>
  <span class="tooltip tooltip-{position}">
    {text}
  </span>
</div>

<style>
  .tooltip-container {
    position: relative;
    display: inline-block;
  }
  
  .tooltip-container:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  
  .tooltip {
    visibility: hidden;
    position: absolute;
    z-index: 1;
    background-color: #2D3748;
    color: white;
    text-align: center;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    line-height: 1.4;
    width: 200px;
    transition: opacity 0.3s;
    opacity: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .tooltip::after {
    content: "";
    position: absolute;
    border-width: 5px;
    border-style: solid;
  }
  
  .tooltip-top {
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tooltip-top::after {
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-color: #2D3748 transparent transparent transparent;
  }
  
  .tooltip-bottom {
    top: 125%;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tooltip-bottom::after {
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-color: transparent transparent #2D3748 transparent;
  }
  
  .tooltip-left {
    top: 50%;
    right: 125%;
    transform: translateY(-50%);
  }
  
  .tooltip-left::after {
    top: 50%;
    left: 100%;
    margin-top: -5px;
    border-color: transparent transparent transparent #2D3748;
  }
  
  .tooltip-right {
    top: 50%;
    left: 125%;
    transform: translateY(-50%);
  }
  
  .tooltip-right::after {
    top: 50%;
    right: 100%;
    margin-top: -5px;
    border-color: transparent #2D3748 transparent transparent;
  }
  
  @media (max-width: 640px) {
    .tooltip {
      width: 160px;
    }
  }
</style>