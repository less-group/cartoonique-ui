/**
 * Pixar Transform File Input Component
 * 
 * A custom element that handles file uploads and transformation using the Pixar API.
 * Based on the original working implementation with simplified functionality.
 */

// Prevent multiple declarations by checking if already defined
if (!window.PixarTransformFileInput || typeof window.PixarTransformFixApplied === 'undefined') {
  console.log('PIXAR DEBUG: Initializing PixarTransformFileInput with direct file handling...');
  window.PixarTransformFixApplied = true;

  /**
   * Custom element for Pixar transformation file input
   */
class PixarTransformFileInput extends HTMLElement {
  constructor() {
    super();
      console.log('PIXAR DEBUG: PixarTransformFileInput constructor called');
      
      // Component state - make it public so it can be accessed from outside
      this.state = {
        file: null,
        isUploading: false,
        isProcessing: false,
        progress: 0,
        jobId: null,
        error: null
      };
      
      // Request management to prevent duplicate requests
      this.requestInProgress = false;
      this.lastRequestTime = 0;
      this.requestCooldown = 2000; // 2 seconds cooldown between requests
      this.currentRequestId = null;
      
      // Get attributes from element
      this.sectionId = this.getAttribute('data-section-id');
      this.productId = this.getAttribute('data-product-id');
      this.productVariantId = this.getAttribute('data-product-variant-id');
      this.customerId = this.getAttribute('data-customer-id');
      this.targetImageUrl = this.getAttribute('data-target-image-url');
      this.printImageUrl = this.getAttribute('data-print-image-url');
      this.color = this.getAttribute('data-color');
      
      // Store processed image URLs
      this.processedImageUrl = null;
      this.processedPrintImageUrl = null; 
      this.watermarkedImageUrl = null;
      
      // Debugging
      this.debug = true; // Always enable debug to troubleshoot upload issues
      this.log('Constructor initialized with attributes:', {
        sectionId: this.sectionId,
        productId: this.productId,
        productVariantId: this.productVariantId,
        targetImageUrl: this.targetImageUrl,
        printImageUrl: this.printImageUrl,
        color: this.color
      });
    }
    
    /**
     * Log helper for debugging
     */
    log(message, data) {
      if (!this.debug) return;
      
      const prefix = '[PixarTransformFileInput]';
      if (data !== undefined) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
    
    /**
     * ConnectedCallback lifecycle method
     */
    connectedCallback() {
      this.log('Component connected to DOM');
      
      try {
        // Explicitly register this component globally for easy access
        window.pixarComponentReady = true;
        window.pixarComponent = this;
        
        // Dispatch an event for other systems to listen for
        document.dispatchEvent(new CustomEvent('pixar-component-ready', {
          detail: { component: this }
        }));
        
        // Setup global handlers first for reliable operation
        this.setupGlobalHandlers();
        
        // Set up file inputs
        this.setupFileInputs();
        
        // Set up UI elements
        this.setupUIElements(); 
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up direct file input listeners
        this.setupDirectFileInputListeners();
        
        // Initialize UpCart integration for cart image replacement
        this.initUpCartListeners();
        
        // Make component visible
        this.style.display = 'block';
        this.style.visibility = 'visible';
        this.style.opacity = '1';
        
        this.log('Component setup complete');
      } catch (error) {
        console.error('[PixarTransformFileInput] Setup error:', error);
      }
    }
    
    /**
     * Initialize UpCart listeners for cart integration with transformed images
     */
    initUpCartListeners() {
      this.log('Initializing UpCart listeners for Pixar transformations');
      
      // Handle add to cart event from UpCart
      window.upcartOnAddToCart = async (id, quantity, lineItem) => {
        const upCartWrapper = document.getElementById('upCart');
        
        // Check if we have all necessary data
        if (!upCartWrapper || !this.processedImageUrl || !this.watermarkedImageUrl || 
            !this.productVariantId || !this.processedPrintImageUrl) {
          this.log('Missing required data for cart integration, skipping cart update');
          return;
        }
        
        try {
          // Modify cart data to include our processed images
          window.upcartModifyCart = (cart) => {
            for (const lineItem of cart.items) {
              if (lineItem.variant_id !== Number(this.productVariantId || 0)) {
                continue;
              }
              
              this.log('Adding image properties to cart item:', lineItem.title);
              
              // Add image URLs as line item properties
              lineItem.properties = {
                _processed_image_url: this.processedImageUrl,
                _watermarked_image_url: this.watermarkedImageUrl,
                _processed_print_image_url: this.processedPrintImageUrl
              };
            }
            
            return cart;
          };
          
          // Update existing line item to include our image URLs
          this.log('Updating cart item with image properties');
          await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: lineItem.key,
              properties: {
                _processed_image_url: this.processedImageUrl,
                _watermarked_image_url: this.watermarkedImageUrl,
                _processed_print_image_url: this.processedPrintImageUrl
              }
            })
          });
          
          // Refresh the cart to show updated images
          window.upcartRefreshCart && window.upcartRefreshCart();
          
          this.log('Cart updated successfully with transformed images');
        } catch (error) {
          console.error('Error occurred while updating cart with transformed images:', error);
        }
      };
      
      this.log('UpCart listeners initialized');
    }
    
    /**
     * Debounce function to prevent multiple calls in quick succession
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in ms
     * @returns {Function} - Debounced function
     */
    debounce(fn, delay) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    }
    
    /**
     * Generate a unique request ID
     * @returns {string} - A unique ID for the current request
     */
    generateRequestId() {
      return 'req_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    }
    
    /**
     * Setup direct file input listeners
     * This ensures that file input changes are captured at the document level
     */
    setupDirectFileInputListeners() {
      this.log('Setting up direct file input listeners');
      
      // Debounce function for file input change
      const debouncedProcessFile = this.debounce((file) => {
        this.state.file = file;
        this.transformImage();
      }, 300);
      
      // Add global document listener for all file inputs
      document.addEventListener('change', (event) => {
        if (event.target.type === 'file') {
          this.log('File input change detected at document level:', event.target.id);
          
          if (event.target.files && event.target.files.length > 0) {
            this.log('Files detected:', event.target.files.length);
            
            // Use debounced function to prevent multiple calls
            debouncedProcessFile(event.target.files[0]);
          }
        }
      });
      
      // Count and log all file inputs for debugging
      setTimeout(() => {
        const allInputs = document.querySelectorAll('input[type="file"]');
        this.log(`Found ${allInputs.length} file inputs on page`);
        
        allInputs.forEach((input, index) => {
          this.log(`File input #${index}:`, {
            id: input.id || 'no-id',
            accept: input.accept,
            parent: input.parentNode ? input.parentNode.tagName : 'none'
          });
        });
      }, 1000);
      
      this.log('Direct file input listeners setup complete');
    }
    
    /**
     * Setup file inputs
     */
    setupFileInputs() {
      this.log('Setting up file inputs');
      
      // Use input with specific ID instead of querying by type
      this.fileInput = document.getElementById(`file-input-wrapper__input-${this.sectionId}`);
      
      if (!this.fileInput) {
        this.log('File input not found by ID, falling back to generic query');
        this.fileInput = this.querySelector('input[type="file"]');
      }
      
      if (!this.fileInput) {
        this.log('No file input found within component, creating a fallback input');
        
        // Create fallback input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.setAttribute('id', `file-input-wrapper__input-fallback-${this.sectionId}`);
        this.fileInput.style.display = 'none';
        this.appendChild(this.fileInput);
      }
      
      this.log('File input setup:', this.fileInput.id);
    }
    
    /**
     * Setup UI elements
     */
    setupUIElements() {
      this.log('Setting up UI elements');
      
      // Popup elements
      this.popup = document.querySelector('[data-pixar-popup]');
      this.popupContent = document.querySelector('[data-popup-content]');
      this.processingContent = document.querySelector('[data-processing-content]');
      this.progressBar = document.querySelector('[data-progress-bar]');
      
      // Buttons
      this.openPopupButton = this.querySelector('.file-input-wrapper__popup-open-btn');
      
      // Result elements
      this.resultWrapper = document.querySelector('[data-result-wrapper]');
      this.resultHelpText = document.querySelector('[data-help-result-text]');
      this.resultImageWrapper = document.querySelector('[data-result-image-wrapper]');
      
      this.log('UI elements setup complete');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
      this.log('Setting up event listeners');
      
      // Debounce function for file input change
      const debouncedFileInputChange = this.debounce(this.handleFileInputChange.bind(this), 300);
      
      // File input change event
      if (this.fileInput) {
        this.fileInput.addEventListener('change', debouncedFileInputChange);
        this.log('Added debounced change listener to file input');
      }
      
      // Open popup button click event - ONLY open popup, do NOT trigger file upload
      if (this.openPopupButton) {
        // Remove any existing click listeners to be safe
        const newButton = this.openPopupButton.cloneNode(true);
        if (this.openPopupButton.parentNode) {
          this.openPopupButton.parentNode.replaceChild(newButton, this.openPopupButton);
          this.openPopupButton = newButton;
        }
        
        // Add new clean listener that ONLY opens popup
        this.openPopupButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.openPopup();
          this.log('Product page upload button clicked - opening popup ONLY');
        });
        this.log('Added clean click listener to open popup button');
      }
      
      // Make sure any other product page buttons don't trigger file upload
      const allProductButtons = document.querySelectorAll('button[id*="upload"], [class*="upload-button"]');
      allProductButtons.forEach(button => {
        if (button !== this.openPopupButton && !button.closest('.upload-popup')) {
          // Skip buttons inside the popup
          // Remove any existing listeners
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
          }
          
          // Add clean listener
          newButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.openPopup();
            this.log('Other product page button clicked - opening popup ONLY');
          });
        }
      });
      
      // Close popup buttons
      const closeButtons = document.querySelectorAll('[data-close-pixar-popup]');
      closeButtons.forEach(button => {
        button.addEventListener('click', this.closePopup.bind(this));
        this.log('Added click listener to close button');
      });
      
      // Add click handler for upload buttons INSIDE the popup
      const popupUploadButtons = document.querySelectorAll('.upload-popup .file-input-label, .upload-popup [id^="upload-button-"]');
      popupUploadButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.log('Popup upload button clicked - triggering file selection');
          if (this.fileInput) {
            this.fileInput.click();
          }
        });
        this.log('Added click listener to popup upload button');
      });
      
      this.log('Event listeners setup complete');
    }
    
    /**
     * File input change handler
     */
    handleFileInputChange(event) {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        this.log('File selected:', file.name);
        
        this.state.file = file;
        this.transformImage();
      }
    }
    
    /**
     * Open popup
     */
    openPopup() {
      this.log('Opening popup');
      
      if (this.popup) {
        this.popup.classList.add('active');
        
        const overlay = document.querySelector('.file-input-wrapper__overlay');
        if (overlay) {
          overlay.classList.add('active');
        }
      }
    }
    
    /**
     * Close popup
     */
    closePopup() {
      this.log('Closing popup');
      
      if (this.popup) {
        this.popup.classList.remove('active');
        
        const overlay = document.querySelector('.file-input-wrapper__overlay');
        if (overlay) {
          overlay.classList.remove('active');
        }
      }
    }
    
    /**
     * Show processing UI
     */
    showProcessingUI() {
      this.log('Showing processing UI');
      
      if (this.popupContent && this.processingContent) {
        this.popupContent.style.display = 'none';
        this.processingContent.style.display = 'block';
      }
    }
    
    /**
     * Show content UI
     */
    showContentUI() {
      this.log('Showing content UI');
      
      if (this.popupContent && this.processingContent) {
        this.processingContent.style.display = 'none';
        this.popupContent.style.display = 'block';
      }
    }
    
    /**
     * Update progress
     */
    updateProgress(progress) {
      this.log('Updating progress:', progress);
      
      this.state.progress = progress;
      
      // Update the simplified progress bar
      if (this.progressBar) {
        // Calculate the visual progress to complete in ~1 minute regardless of actual process time
        // We'll use a non-linear curve to make it look more natural
        const now = Date.now();
        
        // If this is the first progress update, save the start time
        if (!this.progressStartTime) {
          this.progressStartTime = now;
        }
        
        // Calculate elapsed time in seconds
        const elapsedSeconds = (now - this.progressStartTime) / 1000;
        
        // Target completing the visual progress bar in about 60 seconds
        const targetTime = 60; // seconds
        
        // Calculate visual progress (non-linear, to give a feeling of progress)
        // Use the square root function for a more natural curve
        let visualProgress;
        
        if (progress < 100) {
          // For in-progress, use time-based with a cap based on actual progress
          visualProgress = Math.min(
            // Cap at slightly less than actual progress to prevent showing ahead of actual state
            progress - 5, 
            // Time-based calculation: non-linear curve that approaches 100% as time reaches target
            Math.min(95, Math.round(100 * Math.sqrt(elapsedSeconds / targetTime)))
          );
          
          // Keep progress at least at 10% after starting
          visualProgress = Math.max(10, visualProgress);
        } else {
          // For completed state, show 100%
          visualProgress = 100;
          
          // Reset the start time for the next upload
          this.progressStartTime = null;
        }
        
        // Update the progress bar width
        this.progressBar.style.width = `${visualProgress}%`;
        
        // Update any percentage text displays
        const percentageDisplay = document.querySelector('[data-progress-percentage]');
        if (percentageDisplay) {
          percentageDisplay.textContent = `${visualProgress}%`;
        }
      }
      
      // Use the global progress update function if available
      if (typeof window.pixarUpdateProgress === 'function') {
        window.pixarUpdateProgress(progress);
      }
      
      // Dispatch progress event for external listeners
      this.dispatchEvent(new CustomEvent('pixar-transform-progress', {
        detail: {
          progress: progress
        },
        bubbles: true
      }));
    }
    
    /**
     * Show error
     */
    showError(message) {
      this.log('Showing error:', message);
      
      this.state.error = message;
      
      // Show error in help text
      const helpText = document.getElementById('upload-popup__help-text');
      if (helpText) {
        helpText.textContent = message;
        helpText.style.display = 'block';
      }
      
      // Show content UI if we're in processing state
      this.showContentUI();
      
      // Reset request flags
      this.requestInProgress = false;
      this.currentRequestId = null;
      
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('pixar-transform-error', {
        detail: {
          message: message
        },
        bubbles: true
      }));
    }
    
    /**
     * Setup global handlers that can be called from outside the component
     */
    setupGlobalHandlers() {
      this.log('Setting up global handlers');
      
      // Debounce function for external file handling
      const debouncedHandleFile = this.debounce((file) => {
        this.state.file = file;
        this.transformImage();
      }, 300);
      
      // Make these methods available globally
      window.pixarTransformFile = this.transformImage.bind(this);
      window.setPixarFile = (file) => {
        debouncedHandleFile(file);
      };
      
      // Set up a global function to handle file selection from anywhere
      window.handlePixarFileSelection = (file) => {
        this.log('File selected via global handler:', file.name);
        debouncedHandleFile(file);
      };
      
      // Add a direct file change handler on the window
      window.addEventListener('pixar-file-selected', (event) => {
        if (event.detail && event.detail.file) {
          this.log('File selected via custom event:', event.detail.file.name);
          debouncedHandleFile(event.detail.file);
        }
      });
      
      this.log('Global handlers setup complete');
    }
    
    /**
     * Show result image
     */
    showResult(imageUrl) {
      this.log('Showing result image:', imageUrl);
      
      // Close popup
      this.closePopup();
      
      // Create and show result image
      if (this.resultImageWrapper) {
        this.resultImageWrapper.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Transformed image';
        img.className = 'result-image';
        img.style.maxWidth = '100%';
        
        this.resultImageWrapper.appendChild(img);
        
        // Show result wrapper
        if (this.resultWrapper) {
          this.resultWrapper.style.display = 'block';
          
          // Hide open popup button
          if (this.openPopupButton) {
            this.openPopupButton.style.display = 'none';
          }
        }
      }
      
      // Reset request flags
      this.requestInProgress = false;
      this.currentRequestId = null;
      
      // Dispatch complete event
      this.dispatchEvent(new CustomEvent('pixar-transform-complete', {
        detail: {
          imageUrl: imageUrl
        },
        bubbles: true
      }));
      
      this.log('Result image shown');
    }

    /**
     * This is the main transformation method that handles the API call
     */
    async transformImage() {
      // Get file from file input
      if (!this.state.file) {
        this.log('No file selected');
        return;
      }
      
      // Check if a request is already in progress
      if (this.requestInProgress) {
        this.log('Request already in progress, ignoring');
        return;
      }
      
      // Check for rate limiting
      const now = Date.now();
      if (now - this.lastRequestTime < this.requestCooldown) {
        this.log('Request rate limited, ignoring request');
        return;
      }
      
      this.lastRequestTime = now;
      this.requestInProgress = true;
      this.state.isUploading = true;
      this.state.isProcessing = false;
      this.state.progress = 0;
      this.state.error = null;
      
      // Clear previous results
      this.clearResult();
      
      // Update UI to show upload in progress
      this.updateUI();
      
      try {
        // Create API client - use UnifiedApiClient
        const ApiClient = window.UnifiedApiClient;
        if (!ApiClient) {
          throw new Error('UnifiedApiClient not found! Make sure unified-api-client.js is loaded before this component.');
        }
  
        // Initialize the API client with configuration
        const apiClient = new ApiClient({
          baseUrl: window.pixarApiUrl || window.unifiedConfig?.api?.current()?.baseUrl,
          mockMode: window.mockMode || false
        });
  
        // Get watermark configuration
        const watermarkConfig = window.watermarkImage || {
          url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
          width: 200,
          height: 200,
          spaceBetweenWatermarks: 100
        };
        
        // Transform image with progress reporting
        this.log('Submitting image for transformation', {
          fileSize: this.state.file.size,
          fileType: this.state.file.type,
          fileName: this.state.file.name
        });
        
        // Use transform method with progress callback
        const result = await apiClient.transform({
          sourceImage: this.state.file,
          watermark: watermarkConfig
        }, (progress) => {
          this.log(`Progress update: ${progress}%`);
          this.state.progress = progress;
          this.updateUI();
        });
        
        this.log('Transformation completed successfully:', result);
        
        // Store the job ID
        this.state.jobId = result.jobId;
        
        // Store URLs for cart integration
        this.processedImageUrl = result.processedImageUrl;
        this.processedPrintImageUrl = result.processedPrintImageUrl;
        this.watermarkedImageUrl = result.watermarkedImageUrlToShow || result.watermarkedOriginalImageUrl;
        
        // Update UI state
        this.state.isUploading = false;
        this.state.isProcessing = false;
        this.state.progress = 100;
        
        // Append the result to the component
        this.appendResult(result.watermarkedImageUrlToShow || result.watermarkedOriginalImageUrl || result.imageUrl);
        
        // Update UI
        this.updateUI();
        
        // Fire success event
        this.dispatchEvent(new CustomEvent('pixar-transform-success', {
          bubbles: true,
          detail: {
            result: result,
            processedImageUrl: this.processedImageUrl,
            processedPrintImageUrl: this.processedPrintImageUrl,
            watermarkedImageUrl: this.watermarkedImageUrl,
            productVariantId: this.productVariantId
          }
        }));
      } catch (error) {
        this.log('Error during transformation:', error);
        
        // Show error
        this.showError(error.message || 'Transformation failed');
        
        // Update state
        this.state.isUploading = false;
        this.state.isProcessing = false;
        
        // Fire error event
        this.dispatchEvent(new CustomEvent('pixar-transform-error', {
          bubbles: true,
          detail: {
            error: error
          }
        }));
      } finally {
        // Reset request state
        this.requestInProgress = false;
      }
    }

    /**
     * Show a direct preview of the selected image for testing/fallback
     */
    showDirectPreview(file) {
      this.log('Showing direct preview of file (fallback method):', file.name);
      
      // Create a FileReader
      const reader = new FileReader();
      
      reader.onload = (event) => {
        // Create preview in result area
        if (this.resultImageWrapper) {
          this.resultImageWrapper.innerHTML = '';
          
          const img = document.createElement('img');
          img.src = event.target.result;
          img.alt = 'Selected image';
          img.style.maxWidth = '100%';
          
          this.resultImageWrapper.appendChild(img);
          
          // Show result wrapper
          if (this.resultWrapper) {
            this.resultWrapper.style.display = 'block';
            
            // Hide open popup button
            if (this.openPopupButton) {
              this.openPopupButton.style.display = 'none';
            }
          }
          
          // Close the popup
          this.closePopup();
          
          // Update state
          this.state.isUploading = false;
          this.state.isProcessing = false;
          this.state.progress = 100;
          
          // Reset request flags
          this.requestInProgress = false;
          this.currentRequestId = null;
          
          // Dispatch complete event for compatibility
          this.dispatchEvent(new CustomEvent('pixar-transform-complete', {
            detail: {
              imageUrl: event.target.result
            },
            bubbles: true
          }));
        }
      };
      
      reader.onerror = (event) => {
        this.log('FileReader error:', event.target.error);
        this.showError('Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.');
      };
      
      reader.readAsDataURL(file);
    }
    
    /**
     * Handle drop event for drag and drop functionality
     */
    handleDrop(event) {
      this.log('Drop event detected');
      
      event.preventDefault();
      event.stopPropagation();
      
      const dt = event.dataTransfer;
      if (dt.files && dt.files.length > 0) {
        this.state.file = dt.files[0];
        this.transformImage();
      }
    }
    
    /**
     * Process a base64 image directly
     * @param {string} base64Image - Base64 encoded image data
     */
    processBase64Image(base64Image) {
      // Check if a request is already in progress
      if (this.requestInProgress) {
        this.log('Request already in progress, ignoring base64 image processing');
        return;
      }
      
      this.log('Processing base64 image');
      
      try {
        // Convert base64 to Blob
        const byteString = atob(base64Image.split(',')[1]);
        const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeType });
        const file = new File([blob], "uploadedImage." + mimeType.split('/')[1], { type: mimeType });
        
        // Set the file in state
        this.state.file = file;
        
        // Open popup and start transform
        this.openPopup();
        this.transformImage();
        
      } catch (error) {
        console.error('[PixarTransformFileInput] Error processing base64 image:', error);
        this.showError('Error processing image: ' + error.message);
      }
    }
  }

  // Define custom element
  if (!customElements.get('pixar-transform-file-input')) {
    customElements.define('pixar-transform-file-input', PixarTransformFileInput);
    console.log('PIXAR DEBUG: Custom element defined');
  } else {
    console.log('PIXAR DEBUG: Custom element already defined');
  }
} else {
  console.log('PIXAR DEBUG: PixarTransformFileInput already defined or fix already applied');
} 