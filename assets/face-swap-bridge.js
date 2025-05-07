/**
 * Face-Swap Bridge
 * 
 * This script adds event dispatching capabilities to the legacy face-swap implementation
 * to work seamlessly with the new post-processing API.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Log with a prefix for easier debugging
  const logPrefix = '🔄 [Face-Swap Bridge]';
  const log = (message, level = 'log') => {
    if (level === 'error') {
      console.error(`${logPrefix} ${message}`);
    } else if (level === 'warn') {
      console.warn(`${logPrefix} ${message}`);
    } else {
      console.log(`${logPrefix} ${message}`);
    }
  };
  
  log('Initializing face-swap bridge');
  
  // Function to set up the bridge
  const setupFaceSwapBridge = () => {
    // Find all add to cart buttons related to face-swap
    const addToCartButtons = document.querySelectorAll(
      '[data-add-to-cart-faceswap], ' +
      '.faceswap-add-to-cart, ' + 
      '.add-to-cart-faceswap, ' +
      '.face-swap-add-to-cart'
    );
    
    if (addToCartButtons.length === 0) {
      log('No face-swap add to cart buttons found, will retry later');
      return;
    }
    
    log(`Found ${addToCartButtons.length} face-swap add to cart buttons`);
    
    // Add click event listeners to each button
    addToCartButtons.forEach((button, index) => {
      if (button.dataset.bridgeInitialized) {
        return; // Skip if already initialized
      }
      
      log(`Setting up bridge for button ${index + 1}`);
      
      // Save the original click handler
      const originalClickHandler = button.onclick;
      
      // Replace with our handler that dispatches the event
      button.onclick = function(event) {
        log('Face-swap add to cart button clicked');
        
        // Find the face-swap wrapper
        const faceSwapWrapper = document.querySelector('face-swap-file-input-wrapper');
        if (!faceSwapWrapper || !faceSwapWrapper.processedImageUrl) {
          log('No face-swap wrapper or processed image found, continuing with original handler', 'warn');
        } else {
          // Add safety check for ongoing processing
          if (window.imagePostProcessingAPI && window.imagePostProcessingAPI.isProcessing) {
            log('Post-processing already in progress, preventing multiple submissions', 'warn');
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          
          try {
            // Dispatch the event for our post-processing API
            const continueEvent = new CustomEvent('faceswap-continue-clicked', {
              detail: {
                processedImageUrl: faceSwapWrapper.processedImageUrl,
                jobId: extractJobIdFromUrl(faceSwapWrapper.processedImageUrl),
                timestamp: Date.now()
              },
              bubbles: true,
              cancelable: false
            });
            
            log('Dispatching faceswap-continue-clicked event');
            document.dispatchEvent(continueEvent);
          } catch (error) {
            log(`Error dispatching event: ${error.message}`, 'error');
          }
        }
        
        // Call the original handler if it exists
        if (typeof originalClickHandler === 'function') {
          return originalClickHandler.call(this, event);
        }
      };
      
      // Mark as initialized
      button.dataset.bridgeInitialized = 'true';
    });
  };
  
  /**
   * Helper function to extract job ID from URL
   * @param {string} url - The URL to extract the job ID from
   * @returns {string|null} - The extracted job ID or null if not found
   */
  const extractJobIdFromUrl = (url) => {
    if (!url) return null;
    
    // Primary pattern: Look for /result/[jobId] pattern
    if (url.includes('/result/')) {
      const urlParts = url.split('/');
      const resultIndex = urlParts.indexOf('result');
      if (resultIndex !== -1 && resultIndex < urlParts.length - 1) {
        return urlParts[resultIndex + 1];
      }
    }
    
    // Fallback 1: Check for jobId as URL parameter
    try {
      const urlObj = new URL(url);
      const jobId = urlObj.searchParams.get('jobId');
      if (jobId) return jobId;
    } catch (e) {
      // URL parsing failed, continue with other extraction methods
    }
    
    // Fallback 2: Look for UUID-like pattern in the URL
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidPattern);
    if (match) return match[0];
    
    return null;
  };
  
  // Add event listener to detect when post-processing is complete 
  document.addEventListener('post-processing-complete', function(event) {
    log(`Post-processing completed: JobID=${event.detail.jobId}, Size=${event.detail.size}`);
  });
  
  // Add event listener to detect when post-processing has an error
  document.addEventListener('post-processing-error', function(event) {
    log(`Post-processing error: JobID=${event.detail.jobId}, Error=${event.detail.error}`, 'warn');
  });
  
  // Run initial setup
  setupFaceSwapBridge();
  
  // Use MutationObserver to watch for dynamically added buttons
  const observer = new MutationObserver((mutations) => {
    let shouldSetup = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // Check if any added nodes might contain our target buttons
        Array.from(mutation.addedNodes).forEach(node => {
          if (node.nodeType === 1 && (
              node.matches('[data-add-to-cart-faceswap], .faceswap-add-to-cart, .add-to-cart-faceswap, .face-swap-add-to-cart') || 
              node.querySelector('[data-add-to-cart-faceswap], .faceswap-add-to-cart, .add-to-cart-faceswap, .face-swap-add-to-cart')
            )) {
            shouldSetup = true;
          }
        });
      }
    });
    
    if (shouldSetup) {
      setupFaceSwapBridge();
    }
  });
  
  // Start observing the document for added nodes
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Also try to patch the original FaceSwapFileInputWrapper prototype
  if (window.customElements && window.customElements.get('face-swap-file-input-wrapper')) {
    log('Found face-swap-file-input-wrapper custom element, attempting to patch prototype');
    
    try {
      const FaceSwapWrapper = window.customElements.get('face-swap-file-input-wrapper');
      const originalAddToCart = FaceSwapWrapper.prototype.addImageUrlToProductInCart;
      
      if (originalAddToCart) {
        FaceSwapWrapper.prototype.addImageUrlToProductInCart = function(...args) {
          log('Intercepted addImageUrlToProductInCart method call');
          
          // Add safety check for ongoing processing
          if (window.imagePostProcessingAPI && window.imagePostProcessingAPI.isProcessing) {
            log('Post-processing already in progress, need to wait before adding to cart', 'warn');
            // Continue after 100ms, giving time for the post-processing to start
            setTimeout(() => {
              log('Continuing with addImageUrlToProductInCart after delay');
              originalAddToCart.apply(this, args);
            }, 100);
            return;
          }
          
          // Dispatch the event before calling the original method
          if (this.processedImageUrl) {
            try {
              const continueEvent = new CustomEvent('faceswap-continue-clicked', {
                detail: {
                  processedImageUrl: this.processedImageUrl,
                  jobId: extractJobIdFromUrl(this.processedImageUrl),
                  timestamp: Date.now()
                },
                bubbles: true,
                cancelable: false
              });
              
              log('Dispatching faceswap-continue-clicked event from patched method');
              document.dispatchEvent(continueEvent);
            } catch (error) {
              log(`Error dispatching event from patched method: ${error.message}`, 'error');
            }
          } else {
            log('No processed image URL available', 'warn');
          }
          
          // Call the original method
          return originalAddToCart.apply(this, args);
        };
        
        log('Successfully patched addImageUrlToProductInCart method');
      } else {
        log('Could not find addImageUrlToProductInCart method to patch', 'warn');
      }
    } catch (error) {
      log(`Error patching FaceSwapFileInputWrapper: ${error.message}`, 'error');
    }
  }
  
  // Check again after a short delay to catch elements rendered by JS
  setTimeout(setupFaceSwapBridge, 1000);
  
  log('Face-swap bridge initialization complete');
}); 