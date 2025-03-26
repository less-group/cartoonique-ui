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
    this.debug = options.debug || true; // Set debug to true by default for easier troubleshooting
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
    
    // Ensure RunPod connectivity
    this.ensureRunPodIntegration();
    
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
    // Find product gallery (Aurora specific)
    this.productGallery = document.querySelector('product-gallery, .product__media-gallery');
    this.log('Product gallery found:', !!this.productGallery);
    
    // Find pixar component
    this.pixarComponent = document.querySelector('pixar-transform-file-input');
    this.log('Pixar component found:', !!this.pixarComponent);
    
    // Find product form (corrected selectors for Aurora theme)
    // Try multiple selectors to ensure compatibility
    this.productForm = document.querySelector('form[data-type="add-to-cart-form"], form[action="/cart/add"]');
    this.log('Product form found:', !!this.productForm);
    
    // Find add to cart button (corrected selectors for Aurora theme)
    this.addToCartButton = document.querySelector('.product-form__btn, .product-form__submit, button[type="submit"][name="add"]');
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
    
    // Listen for any direct processing with RunPod
    document.addEventListener('runpod-processing-started', (event) => {
      this.log('RunPod processing started:', event.detail);
    });
    
    document.addEventListener('runpod-processing-complete', (event) => {
      this.log('RunPod processing complete:', event.detail);
      if (event.detail && event.detail.imageUrl) {
        this.updateProductGallery(event.detail.imageUrl);
      }
    });
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
    if (window.imageProcessingManager) {
      this.log('Found existing image processing manager');
      this.imageProcessingManager = window.imageProcessingManager;
      
      // Monitor for crop completion
      if (typeof this.imageProcessingManager.addCropCompleteListener === 'function') {
        this.imageProcessingManager.addCropCompleteListener((croppedImage) => {
          this.log('Crop complete event received');
          // No action needed - the manager will handle the rest of the flow
        });
      }
    } else {
      this.log('Image processing manager not found, will check again in 1 second');
      // Retry after a delay as it might be loaded later
      setTimeout(() => {
        if (window.imageProcessingManager) {
          this.imageProcessingManager = window.imageProcessingManager;
          this.log('Image processing manager found on retry');
        }
      }, 1000);
    }
  }
  
  /**
   * Ensure the RunPod integration is properly set up
   */
  ensureRunPodIntegration() {
    // Check if the processImageWithRunPod function exists
    if (typeof window.processImageWithRunPod === 'function') {
      this.log('RunPod processing function already exists');
    } else {
      this.log('RunPod processing function not found, checking direct-pixar-loader.js');
      
      // If the main loader script is loaded after this adapter, we need to verify
      // that the processImageWithRunPod function gets attached to the window
      const checkInterval = setInterval(() => {
        if (typeof window.processImageWithRunPod === 'function') {
          this.log('RunPod processing function found on retry');
          clearInterval(checkInterval);
        }
      }, 500);
      
      // Give up after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (typeof window.processImageWithRunPod !== 'function') {
          this.log('RunPod processing function never found - this may indicate an issue with script loading order');
        }
      }, 10000);
    }
    
    // Ensure API URL is correctly configured
    if (window.unifiedConfig && window.unifiedConfig.api && 
        window.unifiedConfig.api.current && window.unifiedConfig.api.current().baseUrl) {
      const apiUrl = window.unifiedConfig.api.current().baseUrl;
      this.log('API URL configured correctly:', apiUrl);
      
      // Verify this matches the expected URL
      if (apiUrl !== 'https://letzteshemd-faceswap-api-production.up.railway.app') {
        this.log('Warning: API URL doesn\'t match expected Railway URL');
      }
    } else {
      this.log('API URL configuration not found');
    }
  }
  
  /**
   * Enhance the pixar component
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
    
    // Ensure transformImage method works with Aurora theme
    if (!this.pixarComponent.originalTransformImage && this.pixarComponent.transformImage) {
      this.pixarComponent.originalTransformImage = this.pixarComponent.transformImage;
      
      // Override to ensure proper integration
      this.pixarComponent.transformImage = async function() {
        this.log('Transform image called via enhanced method');
        
        try {
          // Call original method
          return await this.originalTransformImage.call(this);
        } catch (error) {
          console.error('Error in transformImage override:', error);
          throw error;
        }
      };
      
      this.log('Enhanced transformImage method');
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
    // This needs to handle both Aurora's structure and legacy themes
    if (this.productGallery) {
      // Aurora specific selectors
      const mediaItems = this.productGallery.querySelectorAll(
        '.product-gallery__media img, .product__media img, .product__media-item img'
      );
      
      if (mediaItems && mediaItems.length > 0) {
        // Update the first image
        const firstMediaItem = mediaItems[0];
        
        // Store the original image source
        if (!firstMediaItem.dataset.originalSrc) {
          firstMediaItem.dataset.originalSrc = firstMediaItem.src;
        }
        
        // Update the image source
        firstMediaItem.src = imageUrl;
        
        // If mediaItems has srcset, update that too
        if (firstMediaItem.srcset) {
          firstMediaItem.srcset = '';
        }
        
        this.log('Updated product gallery image directly');
        
        // Dispatch event for theme-specific image handling
        document.dispatchEvent(new CustomEvent('product:image-update', {
          detail: { imageUrl }
        }));
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
      
      // Add hidden input fields to submit with the form
      let hiddenInput = this.productForm.querySelector('input[name="properties[_processed_image_url]"]');
      if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'properties[_processed_image_url]';
        this.productForm.appendChild(hiddenInput);
      }
      hiddenInput.value = imageUrl || '';
      
      // Add job ID as property
      if (jobId) {
        let jobIdInput = this.productForm.querySelector('input[name="properties[_job_id]"]');
        if (!jobIdInput) {
          jobIdInput = document.createElement('input');
          jobIdInput.type = 'hidden';
          jobIdInput.name = 'properties[_job_id]';
          this.productForm.appendChild(jobIdInput);
        }
        jobIdInput.value = jobId;
      }
    }
    
    // Update add to cart button style
    if (this.addToCartButton) {
      this.addToCartButton.classList.add('btn--ready');
      this.addToCartButton.textContent = this.addToCartButton.dataset.readyText || 'Add to Cart (Photo Uploaded)';
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
      const mediaItems = this.productGallery.querySelectorAll(
        '.product-gallery__media img, .product__media img, .product__media-item img'
      );
      
      if (mediaItems && mediaItems.length > 0) {
        const firstMediaItem = mediaItems[0];
        if (firstMediaItem && firstMediaItem.dataset.originalSrc) {
          firstMediaItem.src = firstMediaItem.dataset.originalSrc;
          // Clear any srcset to prevent other images from loading
          if (firstMediaItem.srcset) {
            firstMediaItem.srcset = '';
          }
          this.log('Reset product gallery to original image');
        }
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