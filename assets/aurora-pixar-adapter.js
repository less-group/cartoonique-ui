/**
 * Aurora Theme Pixar Integration Adapter
 * 
 * This script enhances compatibility between the Aurora theme and 
 * the Pixar transformation components. It handles DOM differences
 * between themes and ensures proper integration with Aurora's
 * product gallery and form submission process.
 */

class AuroraPixarAdapter {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.initialized = false;
    this.sectionId = options.sectionId || '';
    this.productGallery = null;
    this.pixarComponent = null;
    this.imageProcessingManager = null;
    
    this.log('Aurora Pixar Adapter initialized with options:', options);
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  /**
   * Log helper for debugging
   */
  log(message, data) {
    if (!this.debug) return;
    
    const prefix = '[AuroraPixarAdapter]';
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
  
  /**
   * Initialize the adapter
   */
  init() {
    if (this.initialized) return;
    
    this.log('Initializing adapter');
    
    // Find main components
    this.findComponents();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Add theme-specific styling
    this.addThemeStyling();
    
    // Check for existing image processing manager
    this.connectToImageProcessingManager();
    
    this.initialized = true;
    this.log('Adapter initialization complete');
    
    // Dispatch event that adapter is ready
    document.dispatchEvent(new CustomEvent('aurora-pixar-adapter-ready', {
      detail: { adapter: this }
    }));
  }
  
  /**
   * Find the main components needed for integration
   */
  findComponents() {
    // Find product gallery
    this.productGallery = document.querySelector('product-gallery');
    this.log('Product gallery found:', !!this.productGallery);
    
    // Find pixar component
    this.pixarComponent = document.querySelector('pixar-transform-file-input');
    this.log('Pixar component found:', !!this.pixarComponent);
    
    // Find product form
    this.productForm = document.querySelector('form[data-type="add-to-cart-form"]');
    this.log('Product form found:', !!this.productForm);
    
    // Find add to cart button
    this.addToCartButton = document.querySelector('.product-form__btn');
    this.log('Add to cart button found:', !!this.addToCartButton);
  }
  
  /**
   * Set up event listeners for the integration
   */
  setupEventListeners() {
    // Listen for pixar component ready event
    document.addEventListener('pixar-component-ready', (event) => {
      this.log('Pixar component ready event received');
      this.pixarComponent = event.detail.component;
      this.enhancePixarComponent();
    });
    
    // Listen for transform progress events
    document.addEventListener('pixar-transform-progress', (event) => {
      this.log('Transform progress event received:', event.detail.progress);
      this.updateProgressUI(event.detail.progress);
    });
    
    // Listen for transform complete events
    document.addEventListener('pixar-transform-complete', (event) => {
      this.log('Transform complete event received');
      this.handleTransformComplete(event.detail);
    });
    
    // Modify the add to cart behavior for pixar products
    if (this.productForm) {
      this.log('Setting up form submission handler');
      this.setupFormSubmissionHandler();
    }
  }
  
  /**
   * Add theme-specific styling
   */
  addThemeStyling() {
    const style = document.createElement('style');
    style.textContent = `
      /* Aurora theme specific pixar integration styles */
      .pixar-transform-wrapper {
        margin-bottom: 1.5rem;
      }
      
      .file-input-wrapper__upload-area {
        border: 1px dashed var(--text-color);
        border-radius: 0.5rem;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.3s ease;
      }
      
      .file-input-wrapper__upload-area:hover {
        border-color: var(--primary-button-background);
        background-color: rgba(var(--primary-button-background-rgb), 0.05);
      }
      
      .file-input-wrapper__label {
        cursor: pointer;
        display: block;
      }
      
      .file-input-wrapper__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
      
      .file-input-wrapper__icon {
        color: var(--primary-button-background);
      }
      
      .file-input-wrapper__text p {
        font-weight: 600;
        margin: 0 0 0.25rem;
      }
      
      .file-input-wrapper__text span {
        font-size: 0.875rem;
        opacity: 0.8;
      }
      
      .file-input-wrapper__input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
      
      .file-input-wrapper__popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      
      .file-input-wrapper__popup-content {
        background-color: var(--background);
        border-radius: 0.5rem;
        padding: 2rem;
        max-width: 600px;
        width: 100%;
        position: relative;
      }
      
      .file-input-wrapper__popup-close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        color: var(--text-color);
      }
      
      .file-input-wrapper__result-image {
        margin-bottom: 1.5rem;
      }
      
      .file-input-wrapper__result-image img {
        width: 100%;
        height: auto;
        border-radius: 0.5rem;
      }
      
      .file-input-wrapper__progress-bar-wrapper {
        height: 0.5rem;
        background-color: rgba(var(--text-color-rgb), 0.1);
        border-radius: 0.25rem;
        margin-top: 0.75rem;
        overflow: hidden;
      }
      
      .file-input-wrapper__progress-bar {
        height: 100%;
        background-color: var(--primary-button-background);
        width: 0;
        transition: width 0.3s ease;
      }
      
      .file-input-wrapper__result-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      
      .file-input-wrapper__result-btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border-radius: 0.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .file-input-wrapper__result-btn--primary {
        background-color: var(--primary-button-background);
        color: var(--primary-button-text-color);
        border: none;
      }
      
      .file-input-wrapper__result-btn--secondary {
        background-color: transparent;
        color: var(--text-color);
        border: 1px solid var(--text-color);
      }
      
      .product-form__btn.btn--ready {
        background-color: var(--primary-button-background);
        color: var(--primary-button-text-color);
      }
    `;
    
    document.head.appendChild(style);
    this.log('Added theme-specific styling');
  }
  
  /**
   * Connect to the Image Processing Manager
   */
  connectToImageProcessingManager() {
    // Try to find the image processing manager
    this.imageProcessingManager = window.imageProcessingManager;
    
    if (!this.imageProcessingManager) {
      this.log('Image processing manager not found, waiting...');
      
      // Listen for it to be available
      const checkInterval = setInterval(() => {
        if (window.imageProcessingManager) {
          this.imageProcessingManager = window.imageProcessingManager;
          this.log('Image processing manager found');
          clearInterval(checkInterval);
        }
      }, 200);
    } else {
      this.log('Image processing manager found');
    }
  }
  
  /**
   * Enhance the pixar component with theme-specific functionality
   */
  enhancePixarComponent() {
    if (!this.pixarComponent) return;
    
    this.log('Enhancing pixar component');
    
    // Add class to help with styling
    this.pixarComponent.classList.add('aurora-theme-integrated');
    
    // Store original methods that we might need to restore or extend
    if (!this.pixarComponent.originalShowResultContent && this.pixarComponent.showResultContent) {
      this.pixarComponent.originalShowResultContent = this.pixarComponent.showResultContent;
      
      // Override to update the product gallery too
      this.pixarComponent.showResultContent = (imageUrl) => {
        // Call original method
        this.pixarComponent.originalShowResultContent(imageUrl);
        
        // Update product image in gallery if possible
        this.updateProductGallery(imageUrl);
      };
      
      this.log('Enhanced showResultContent method');
    }
  }
  
  /**
   * Update the product gallery with the transformed image
   */
  updateProductGallery(imageUrl) {
    if (!imageUrl) return;
    
    this.log('Updating product gallery with image:', imageUrl);
    
    // Try to update via image processing manager first (preferred)
    if (this.imageProcessingManager && typeof this.imageProcessingManager.updateProductImage === 'function') {
      this.imageProcessingManager.updateProductImage(imageUrl);
      this.log('Used image processing manager to update product image');
      return;
    }
    
    // Fallback: Try to update the product gallery directly
    if (this.productGallery) {
      const firstMediaItem = this.productGallery.querySelector('.product-gallery__media img');
      if (firstMediaItem) {
        // Store the original image source
        if (!firstMediaItem.dataset.originalSrc) {
          firstMediaItem.dataset.originalSrc = firstMediaItem.src;
        }
        
        // Update the image source
        firstMediaItem.src = imageUrl;
        this.log('Updated product gallery image directly');
      }
    }
  }
  
  /**
   * Update the progress UI
   */
  updateProgressUI(progress) {
    // Update progress bar if it exists
    const progressBar = document.querySelector('[data-progress-bar]');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    // Add any other UI updates needed for the Aurora theme
  }
  
  /**
   * Handle transform complete event
   */
  handleTransformComplete(detail) {
    const { imageUrl, jobId } = detail;
    
    // Update product gallery with the final image
    this.updateProductGallery(imageUrl);
    
    // Add data attributes to the form for submission
    if (this.productForm) {
      this.productForm.dataset.pixarTransformed = 'true';
      this.productForm.dataset.pixarJobId = jobId || '';
      this.productForm.dataset.pixarImageUrl = imageUrl || '';
    }
    
    // Update add to cart button style
    if (this.addToCartButton) {
      this.addToCartButton.classList.add('btn--ready');
    }
  }
  
  /**
   * Setup form submission handler
   */
  setupFormSubmissionHandler() {
    const form = this.productForm;
    if (!form) return;
    
    // Listen for form submission
    form.addEventListener('submit', (event) => {
      // Only intervene for pixar products
      if (!this.pixarComponent) return;
      
      // Check if transformation is needed but not complete
      if (!form.dataset.pixarTransformed && this.pixarComponent) {
        // Check if we're processing
        if (this.pixarComponent.state && this.pixarComponent.state.isProcessing) {
          event.preventDefault();
          alert('Please wait for image transformation to complete before adding to cart.');
          return;
        }
        
        // Check if we need to transform
        if (!this.pixarComponent.processedImageUrl) {
          event.preventDefault();
          alert('Please upload and transform an image before adding to cart.');
          
          // Open the upload dialog
          if (typeof this.pixarComponent.openPopup === 'function') {
            setTimeout(() => this.pixarComponent.openPopup(), 100);
          }
          return;
        }
      }
    });
  }
  
  /**
   * Reset the gallery to the original image
   */
  resetGallery() {
    if (this.productGallery) {
      const firstMediaItem = this.productGallery.querySelector('.product-gallery__media img');
      if (firstMediaItem && firstMediaItem.dataset.originalSrc) {
        firstMediaItem.src = firstMediaItem.dataset.originalSrc;
        this.log('Reset product gallery to original image');
      }
    }
  }
}

// Initialize the adapter when the script loads
const auroraPixarAdapter = new AuroraPixarAdapter({ 
  debug: true,
  sectionId: document.querySelector('[data-section-id]')?.getAttribute('data-section-id') || ''
});

// Make it globally available
window.auroraPixarAdapter = auroraPixarAdapter; 