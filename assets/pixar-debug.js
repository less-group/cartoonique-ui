/**
 * Pixar Component Debug Utilities
 * 
 * This file provides debugging functions to help identify issues with
 * the Pixar face transformation component initialization and workflow.
 */

// Prevent multiple initialization
if (typeof window.pixarDebugInitialized === 'undefined') {
  window.pixarDebugInitialized = true;
  
  (function() {
    console.log('============= PIXAR DEBUG UTILITIES LOADED =============');
    
    // Wait for full page load
    window.addEventListener('load', function() {
      setTimeout(debugPixarInitialization, 1000);
      setTimeout(debugPixarInitialization, 3000);
    });
    
    // Debug initialization
    function debugPixarInitialization() {
      console.log('============= PIXAR DEBUG INFO =============');
      console.log('pixarComponent in window:', !!window.pixarComponent);
      console.log('pixarComponentReady:', window.pixarComponentReady);
      console.log('imageProcessingManager:', !!window.imageProcessingManager);
      console.log('pixarTransformComplete:', window.pixarTransformComplete);
      
      // Try to find components manually
      const pixarComponentInDOM = document.querySelector('pixar-transform-file-input');
      const faceSwapComponentInDOM = document.querySelector('face-swap-file-input-wrapper');
      console.log('pixarComponent in DOM:', !!pixarComponentInDOM);
      console.log('faceSwapComponent in DOM:', !!faceSwapComponentInDOM);
      
      if (pixarComponentInDOM) {
        console.log('Pixar component details:', {
          id: pixarComponentInDOM.id || 'no-id',
          visible: pixarComponentInDOM.offsetParent !== null,
          style: pixarComponentInDOM.getAttribute('style'),
          parent: pixarComponentInDOM.parentElement ? pixarComponentInDOM.parentElement.tagName : 'none'
        });
      }
      
      if (faceSwapComponentInDOM) {
        console.log('Face swap component details:', {
          id: faceSwapComponentInDOM.id || 'no-id',
          visible: faceSwapComponentInDOM.offsetParent !== null,
          style: faceSwapComponentInDOM.getAttribute('style'),
          parent: faceSwapComponentInDOM.parentElement ? faceSwapComponentInDOM.parentElement.tagName : 'none'
        });
      }
      
      // Check custom elements registry
      console.log('Custom elements defined:');
      console.log('- pixar-transform-file-input:', !!customElements.get('pixar-transform-file-input'));
      console.log('- face-swap-file-input-wrapper:', !!customElements.get('face-swap-file-input-wrapper'));
      
      // Check for file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      console.log('File inputs on page:', fileInputs.length);
      
      // Check for add to cart form
      const addToCartForm = document.querySelector('form[action="/cart/add"]');
      console.log('Add to cart form:', !!addToCartForm);
      
      if (addToCartForm) {
        const submitButtons = addToCartForm.querySelectorAll('button[type="submit"]');
        console.log('Submit buttons in form:', submitButtons.length);
      }
      
      // Check template suffix
      let templateSuffix = '';
      const metaElements = document.querySelectorAll('meta[property="og:type"]');
      if (metaElements.length > 0 && metaElements[0].content === 'product') {
        // This is a product page, try to get template suffix
        const bodyClasses = document.body.className.split(' ');
        for (const cls of bodyClasses) {
          if (cls.startsWith('template-')) {
            templateSuffix = cls.replace('template-', '');
            break;
          }
        }
      }
      console.log('Template suffix (from body class):', templateSuffix);
      
      // Create a helpful debug log that can be copied
      console.log('===========================================');
      console.log('COPY DEBUG LOG BELOW:');
      console.log(`
PIXAR DEBUG SUMMARY:
-------------------
Page URL: ${window.location.href}
Time: ${new Date().toISOString()}
Template: ${templateSuffix}

Component Status:
- pixarComponent in window: ${!!window.pixarComponent}
- pixarComponentReady: ${window.pixarComponentReady}
- pixarTransformComplete: ${window.pixarTransformComplete}
- imageProcessingManager: ${!!window.imageProcessingManager}
- pixarComponent in DOM: ${!!pixarComponentInDOM}
- faceSwapComponent in DOM: ${!!faceSwapComponentInDOM}

File Inputs: ${fileInputs.length}
Add to Cart Form: ${!!addToCartForm}
Custom Elements:
- pixar-transform-file-input: ${!!customElements.get('pixar-transform-file-input')}
- face-swap-file-input-wrapper: ${!!customElements.get('face-swap-file-input-wrapper')}
      `);
      console.log('===========================================');
    }
    
    // Add global debug trigger
    window.debugPixarComponent = debugPixarInitialization;
    
    // Listen for critical events
    document.addEventListener('pixar-component-ready', function(event) {
      console.log('📢 Event: pixar-component-ready fired', event.detail);
    });
    
    document.addEventListener('pixar-component-setup-complete', function(event) {
      console.log('📢 Event: pixar-component-setup-complete fired', event.detail);
    });
    
    document.addEventListener('pixar-transform-progress', function(event) {
      console.log('📢 Event: pixar-transform-progress fired', event.detail);
    });
    
    document.addEventListener('pixar-transform-complete', function(event) {
      console.log('📢 Event: pixar-transform-complete fired', event.detail);
      window.pixarTransformComplete = true;
    });
    
    // Force component visibility
    function forceComponentVisibility() {
      const components = document.querySelectorAll('pixar-transform-file-input, face-swap-file-input-wrapper');
      if (components.length > 0) {
        console.log(`Found ${components.length} Pixar components, forcing visibility`);
        
        components.forEach(function(component) {
          component.style.display = 'block';
          component.style.visibility = 'visible';
          component.style.opacity = '1';
        });
      }
    }
    
    // Try to force visibility after a delay
    setTimeout(forceComponentVisibility, 2000);
    
    console.log('Pixar debug utilities initialized');
  })();
} 