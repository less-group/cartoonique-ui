/**
 * index.js
 * 
 * Main entry point for the modular image processing application.
 * Initializes all modules and connects them together.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

function initializeApplication() {
  console.log('Initializing Cartoonique application...');
  
  // Initialize individual modules
  const storageManager = new StorageManager();
  const styleAPIClient = new StyleAPIClient();
  const imageUploader = new ImageUploader();
  const imageCropper = window.ImageCropper; // Use existing cropper
  const textOverlayManager = new TextOverlayManager();
  const cartManager = new CartManager({
    storageManager: storageManager
  });
  
  // Set product variant mapping in cart manager
  cartManager.setVariantMapping({
    '30x40': '40373469331637', // Replace with actual variant IDs
    '50x70': '40373469364405'  // Replace with actual variant IDs
  });
  
  // Initialize the UI controller with all modules
  const uiController = new UIController({
    imageUploader: imageUploader,
    imageCropper: imageCropper,
    textOverlayManager: textOverlayManager,
    styleAPIClient: styleAPIClient,
    storageManager: storageManager,
    cartManager: cartManager
  });
  
  // Find and set up the file input element
  const fileInput = document.querySelector('pixar-transform-file-input') || 
                    document.getElementById('pixar-file-input');
  
  if (fileInput) {
    imageUploader.setupFileInput(fileInput);
    console.log('File input element connected to uploader');
  } else {
    console.warn('File input element not found. Upload functionality may not work.');
  }
  
  // Set up checkout buttons if they exist
  setupCheckoutButtons(uiController);
  
  // Set up reset button if it exists
  setupResetButton(uiController);
  
  console.log('Cartoonique application initialization complete');
  
  // Make modules available globally for debugging
  if (window.DEVELOPMENT_MODE) {
    window.cartoonique = {
      storageManager,
      styleAPIClient,
      imageUploader,
      imageCropper,
      textOverlayManager,
      cartManager,
      uiController
    };
    console.log('Development mode: modules available at window.cartoonique');
  }
}

/**
 * Set up checkout buttons to work with the UI controller
 * @param {UIController} uiController - The UI controller instance
 */
function setupCheckoutButtons(uiController) {
  // 30x40 checkout button
  const checkout30x40Button = document.getElementById('checkout-30x40-button') ||
                              document.querySelector('[data-checkout-size="30x40"]');
  
  if (checkout30x40Button) {
    checkout30x40Button.addEventListener('click', () => {
      uiController.handleCheckout('30x40');
    });
  }
  
  // 50x70 checkout button
  const checkout50x70Button = document.getElementById('checkout-50x70-button') ||
                              document.querySelector('[data-checkout-size="50x70"]');
  
  if (checkout50x70Button) {
    checkout50x70Button.addEventListener('click', () => {
      uiController.handleCheckout('50x70');
    });
  }
}

/**
 * Set up reset button to work with the UI controller
 * @param {UIController} uiController - The UI controller instance
 */
function setupResetButton(uiController) {
  const resetButton = document.getElementById('pixar-reset-button') ||
                      document.querySelector('.pixar-reset-button');
  
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      uiController.reset();
    });
  }
}

// Development mode flag - set to true to enable debugging features
window.DEVELOPMENT_MODE = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.search.includes('debug=true'); 