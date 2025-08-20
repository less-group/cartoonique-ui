/**
 * Debug Popup Remover
 * This script completely removes any debug popup buttons from the site
 */

(function() {
  // Function to remove debug elements
  function removeDebugElements() {
    // Target elements with 'debug' in their ID or class
    const debugSelectors = [
      '[id*="debug"]', 
      '[class*="debug"]',
      '[id*="DEBUG"]',
      '[class*="DEBUG"]',
      '#debug-pop-up',
      '.debug-pop-up',
      '[id*="DEBUG-POP-UP"]',
      '[class*="DEBUG-POP-UP"]',
      'button[id*="debug"]',
      'button[class*="debug"]'
    ];
    
    // Query and remove all matching elements
    const debugElements = document.querySelectorAll(debugSelectors.join(','));
    debugElements.forEach(function(element) {
      try {
        if (element && element.parentNode) {
          // Check if it's actually a debug button (to avoid removing legitimate debug-named elements)
          if (element.tagName === 'BUTTON' || 
              element.id?.toLowerCase().includes('pop-up') || 
              element.className?.toLowerCase().includes('pop-up')) {
            console.log('Removing debug element:', element);
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
            element.style.pointerEvents = 'none';
            element.style.position = 'absolute';
            element.style.width = '0';
            element.style.height = '0';
            element.setAttribute('aria-hidden', 'true');
            // Keep in DOM but completely hidden
          }
        }
      } catch (e) {
        // Ignore errors to prevent breaking the page
      }
    });
  }

  // Run immediately
  removeDebugElements();
  
  // Also run after DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeDebugElements);
  }
  
  // And run after a short delay to catch late-loaded elements
  setTimeout(removeDebugElements, 500);
  setTimeout(removeDebugElements, 1500);
  
  // Set up observer to remove any debug buttons that might be added dynamically
  try {
    const observer = new MutationObserver(function(mutations) {
      let needsRemoval = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          needsRemoval = true;
        }
      });
      
      if (needsRemoval) {
        removeDebugElements();
      }
    });
    
    observer.observe(document.body, { 
      childList: true,
      subtree: true
    });
  } catch (e) {
    // Fallback if MutationObserver fails
    setInterval(removeDebugElements, 2000);
  }
})(); 