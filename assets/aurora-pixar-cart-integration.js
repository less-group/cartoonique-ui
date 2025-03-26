/**
 * Aurora Pixar Cart Integration
 * 
 * This script handles the connection between the Pixar transformation process
 * and the Add to Cart functionality in the Aurora theme.
 */

(function() {
  // Debug mode (set to false in production)
  const DEBUG = false;
  
  // Log helper function
  function log(message, data) {
    if (!DEBUG) return;
    
    if (data !== undefined) {
      console.log('[Aurora Pixar Cart]', message, data);
    } else {
      console.log('[Aurora Pixar Cart]', message);
    }
  }
  
  // Track transformation state
  let transformationComplete = false;
  
  // Initialize when the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    log('Initializing Aurora Pixar Cart Integration');
    initializeCartIntegration();
  });
  
  // Initialize the cart integration
  function initializeCartIntegration() {
    // Find all add to cart buttons that require image upload
    const addToCartButtons = document.querySelectorAll('button[data-requires-image-upload="true"]');
    
    if (addToCartButtons.length === 0) {
      log('No buttons requiring image upload found');
      return;
    }
    
    log(`Found ${addToCartButtons.length} buttons requiring image upload`);
    
    // Listen for the pixar transformation complete event
    document.addEventListener('pixar-transform-complete', handleTransformComplete);
    document.addEventListener('image-transform-complete', handleTransformComplete);
    
    // Also check for any existing transformed images
    checkForExistingTransformedImages();
  }
  
  // Handle transform complete event
  function handleTransformComplete(event) {
    log('Transform complete event received', event);
    transformationComplete = true;
    
    // Enable all add to cart buttons that were waiting for transformation
    enableAddToCartButtons();
  }
  
  // Enable add to cart buttons
  function enableAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('button[data-requires-image-upload="true"]');
    
    addToCartButtons.forEach(button => {
      // Enable the button
      button.removeAttribute('disabled');
      
      // Update the button text
      const buttonText = button.querySelector('[data-button-text]');
      if (buttonText) {
        buttonText.textContent = 'Add to Cart';
      }
      
      // Add success styling
      button.classList.add('image-uploaded');
      
      log('Enabled button', button);
    });
    
    // Also update any sticky buttons
    const stickyButtons = document.querySelectorAll('.product-form__btn-wrapper--sticky-mobile-button button');
    stickyButtons.forEach(button => {
      button.removeAttribute('disabled');
      
      const buttonText = button.querySelector('[data-button-text]');
      if (buttonText) {
        buttonText.textContent = 'Add to Cart';
      }
      
      log('Enabled sticky button', button);
    });
  }
  
  // Check if there's already a transformed image (in case page was refreshed)
  function checkForExistingTransformedImages() {
    // Check if the image processing manager has a completed state
    if (window.imageProcessingManager && 
        typeof window.imageProcessingManager.isProcessingComplete === 'function' && 
        window.imageProcessingManager.isProcessingComplete()) {
      
      log('Found existing completed transformation');
      transformationComplete = true;
      enableAddToCartButtons();
      return;
    }
    
    // Check for result images in DOM
    const resultImages = document.querySelectorAll('.pixar-transform-result img');
    if (resultImages.length > 0) {
      log('Found existing result images', resultImages);
      transformationComplete = true;
      enableAddToCartButtons();
      return;
    }
    
    log('No existing transformed images found');
  }
  
  // Expose API for external use
  window.auroraPxiarCartIntegration = {
    isTransformationComplete: () => transformationComplete,
    enableAddToCartButtons: enableAddToCartButtons
  };
})(); 