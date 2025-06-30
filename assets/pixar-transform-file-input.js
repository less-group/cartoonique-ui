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
      
      // Initialize event listeners and element references (will be set in connectedCallback)
      this.popup = null;
      this.popupContent = null;
      this.processingContent = null;
      this.progressBar = null;
      this.fileInput = null;
      this.openPopupButton = null;
      this.closePopupButton = null;
      this.resultWrapper = null;
      this.resultHelpText = null;
      this.resultImageWrapper = null;
      this.tryAgainButton = null;
      this.continueButton = null;
      
      // Debugging
      this.debug = true;
      
      // Ensure UnifiedApiClient is available
      this.ensureUnifiedApiClient();
      
      // Log initial attributes
      this.log('Constructor initialized with attributes:', {
        sectionId: this.sectionId,
        productId: this.productId,
        productVariantId: this.productVariantId,
        customerId: this.customerId,
        targetImageUrl: this.targetImageUrl,
        printImageUrl: this.printImageUrl,
        color: this.color
      });
    }
    
    /**
     * Ensure the UnifiedApiClient is available
     */
    ensureUnifiedApiClient() {
      if (!window.unifiedApiClient && window.UnifiedApiClient) {
        this.log('Creating UnifiedApiClient instance');
        // Initialize the API client with Railway endpoint
        window.unifiedApiClient = new window.UnifiedApiClient({
          baseUrl: window.pixarApiUrl || 
                  window.unifiedConfig?.api?.current()?.baseUrl ||
                  'https://letzteshemd-faceswap-api-production.up.railway.app',
          debug: this.debug
        });
        this.log('UnifiedApiClient instance created');
      } else if (window.unifiedApiClient) {
        this.log('UnifiedApiClient already available');
      } else {
        console.warn('[PixarTransformFileInput] UnifiedApiClient not available and cannot be created');
      }
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
        
        // Make the open popup button visible
        if (this.openPopupButton) {
          this.openPopupButton.style.display = 'block';
        }
        
        this.log('Component setup complete');
      } catch (error) {
        console.error('[PixarTransformFileInput] Setup error:', error);
      }
    }
    
    /**
     * DisconnectedCallback lifecycle method
     */
    disconnectedCallback() {
      this.log('Component disconnected from DOM');
      
      // Clean up event listeners if needed
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
      this.popup = this.querySelector('[data-pixar-popup]');
      this.popupContent = this.querySelector('[data-popup-content]');
      this.processingContent = this.querySelector('[data-processing-content]');
      this.progressBar = this.querySelector('[data-progress-bar]');
      
      // Buttons
      this.openPopupButton = this.querySelector('.file-input-wrapper__popup-open-btn');
      this.closePopupButton = this.querySelector('[data-popup-close]');
      this.tryAgainButton = this.querySelector('[data-try-again]');
      this.continueButton = this.querySelector('[data-continue]');
      
      // Result elements
      this.resultWrapper = this.querySelector('[data-result-wrapper]');
      this.resultHelpText = this.querySelector('[data-help-result-text]');
      this.resultImageWrapper = this.querySelector('[data-result-image-wrapper]');
      
      this.log('UI elements setup complete');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
      this.log('Setting up event listeners');
      
      // Set up file input change event
      if (this.fileInput) {
        // Use a debounced function to prevent multiple triggers
        const debouncedChange = this.debounce(this.handleFileInputChange.bind(this), 300);
        this.fileInput.addEventListener('change', debouncedChange);
        this.log('Added debounced change listener to file input');
      }
      
      // Set up popup open button click event
      if (this.openPopupButton) {
        this.openPopupButton.addEventListener('click', this.openPopup.bind(this));
        this.log('Added click listener to open popup button');
      }
      
      // Set up popup close button click event
      if (this.closePopupButton) {
        this.closePopupButton.addEventListener('click', this.closePopup.bind(this));
        this.log('Added click listener to close popup button');
      }
      
      // Set up try again button click event
      if (this.tryAgainButton) {
        this.tryAgainButton.addEventListener('click', this.handleTryAgain.bind(this));
        this.log('Added click listener to try again button');
      }
      
      // Set up continue button click event
      if (this.continueButton) {
        this.continueButton.addEventListener('click', this.handleContinue.bind(this));
        this.log('Added click listener to continue button');
      }
      
      // Set up drag and drop events
      if (this.popup) {
        const uploadArea = this.popup.querySelector('.file-input-wrapper__upload-area');
        if (uploadArea) {
          // Prevent default to allow drop
          uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('dragging');
          });
          
          uploadArea.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('dragging');
          });
          
          uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragging');
          });
          
          uploadArea.addEventListener('drop', this.handleDrop.bind(this));
          this.log('Added drag and drop listeners to upload area');
        }
      }
      
      this.log('Event listeners setup complete');
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
     * Initialize up cart listeners for Pixar transformations
     */
    initUpCartListeners() {
      this.log('Initializing UpCart listeners for Pixar transformations');
      document.addEventListener('up:cart:add', (event) => {
        // Only intercept for the product associated with this component
        if (event.detail && event.detail.items && event.detail.items.length > 0) {
          const items = event.detail.items;
          if (items.some(item => String(item.id) === String(this.productVariantId) || String(item.id) === String(this.productId))) {
            this.log('UpCart add event detected for this product');
            
            // Check if transformation is complete
            if (this.processedImageUrl) {
              this.log('Transformation complete, allowing cart add');
            } else {
              this.log('Transformation not complete, opening upload popup');
              this.openPopup();
              
              // Prevent the default cart add
              event.preventDefault();
            }
          }
        }
      });
      this.log('UpCart listeners initialized');
    }
    
    /**
     * Open the upload popup
     */
    openPopup() {
      this.log('Opening popup');
      
      if (this.popup) {
        this.popup.style.display = 'flex';
      }
    }
    
    /**
     * Close the upload popup
     */
    closePopup() {
      this.log('Closing popup');
      
      if (this.popup) {
        this.popup.style.display = 'none';
      }
    }
    
    /**
     * Show the processing content
     */
    showProcessingContent() {
      this.log('Showing processing content');
      
      // Hide popup if it's open
      if (this.popup) {
        this.popup.style.display = 'none';
      }
      
      // Show processing content
      if (this.processingContent) {
        this.processingContent.style.display = 'flex';
      }
      
      // Reset progress bar
      if (this.progressBar) {
        this.progressBar.style.width = '0%';
      }
      
      // Reset progress text
      const percentageDisplay = this.querySelector('[data-progress-percentage]');
      if (percentageDisplay) {
        percentageDisplay.textContent = '0';
      }
    }
    
    /**
     * Hide the processing content
     */
    hideProcessingContent() {
      this.log('Hiding processing content');
      
      if (this.processingContent) {
        this.processingContent.style.display = 'none';
      }
    }
    
    /**
     * Show the result content
     */
    showResultContent(imageUrl) {
      this.log('Showing result content with image:', imageUrl);
      
      // Hide processing content
      this.hideProcessingContent();
      
      // Set up result image
      if (this.resultImageWrapper) {
        // Clear previous content
        this.resultImageWrapper.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Transformed image';
        img.className = 'file-input-wrapper__result-image';
        
        // Add to wrapper
        this.resultImageWrapper.appendChild(img);
      }
      
      // Set result text
      if (this.resultHelpText) {
        this.resultHelpText.textContent = 'Your image has been successfully transformed into a Pixar-style portrait!';
      }
      
      // Show result wrapper
      if (this.resultWrapper) {
        this.resultWrapper.style.display = 'flex';
      }
      
      // Dispatch event for successful transformation
      document.dispatchEvent(new CustomEvent('pixar-transform-complete', {
        detail: {
          imageUrl: imageUrl,
          productId: this.productId,
          productVariantId: this.productVariantId
        },
        bubbles: true
      }));
      
      // Set transform complete flag in window
      window.pixarTransformComplete = true;
    }
    
    /**
     * Hide the result content
     */
    hideResultContent() {
      this.log('Hiding result content');
      
      if (this.resultWrapper) {
        this.resultWrapper.style.display = 'none';
      }
    }
    
    /**
     * Clear any previous result
     */
    clearResult() {
      this.log('Clearing previous result');
      
      // Clear processed image URLs
      this.processedImageUrl = null;
      this.processedPrintImageUrl = null;
      
      // Clear result image wrapper
      if (this.resultImageWrapper) {
        this.resultImageWrapper.innerHTML = '';
      }
      
      // Hide result wrapper
      this.hideResultContent();
    }
    
    /**
     * Update UI based on current state
     */
    updateUI() {
      this.log('Updating UI with state:', this.state);
      
      if (this.state.isUploading || this.state.isProcessing) {
        // Show processing content
        this.showProcessingContent();
      } else if (this.processedImageUrl) {
        // Show result content
        this.showResultContent(this.processedImageUrl);
      } else {
        // Show upload popup
        this.openPopup();
      }
    }
    
    /**
     * Update progress bar
     */
    updateProgress(progress) {
      // Ensure progress is between 0 and 100
      const clampedProgress = Math.min(100, Math.max(0, progress));
      
      // Assign to state
      this.state.progress = clampedProgress;
      
      // Compute visual progress (smoother animation)
      let visualProgress = clampedProgress;
      
      // If at 100%, maintain it, otherwise smooth out the progress
      if (clampedProgress < 100) {
        // Apply easing - start quickly, slow down as we approach 100%
        visualProgress = clampedProgress * 0.8; // Cap at 80% until truly complete
      }
      
      // Update progress bar
      if (this.progressBar) {
        this.progressBar.style.width = `${visualProgress}%`;
        
        // Update any percentage text displays
        const percentageDisplay = this.querySelector('[data-progress-percentage]');
        if (percentageDisplay) {
          percentageDisplay.textContent = `${Math.round(visualProgress)}`;
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
     * Handle Try Again button click
     */
    handleTryAgain() {
      this.log('Try Again button clicked');
      
      // Clear previous result
      this.clearResult();
      
      // Reset state
      this.state.file = null;
      this.state.isUploading = false;
      this.state.isProcessing = false;
      this.state.progress = 0;
      this.state.jobId = null;
      this.state.error = null;
      
      // Show upload popup
      this.openPopup();
    }
    
    /**
     * Handle Continue button click
     */
    handleContinue() {
      this.log('Continue button clicked');
      
      // Hide result content
      this.hideResultContent();
      
      // Trigger form submission
      const form = this.closest('form');
      if (form) {
        this.log('Submitting form');
        form.submit();
      } else {
        this.log('No form found to submit');
      }
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
     * Debounce helper to prevent multiple function calls
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    
    /**
     * Handle file input change
     */
    handleFileInputChange(event) {
      if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
        this.log('No files selected');
        return;
      }
      
      const file = event.target.files[0];
      
      this.log('File selected:', file.name);
      
      // Store the selected file
      this.state.file = file;
      
      // Update UI
      this.updateUI();
      
      // If we're configured to transform directly, do it now
      if (this.getAttribute('data-auto-transform') === 'true') {
        this.log('Auto-transform enabled, processing immediately');
        this.transformImage();
      }
    }
    
    /**
     * Handle file select
     */
    handleFileSelect(event) {
      this.log('Handle file select called');
      
      // Check if event has files
      if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
        this.log('No files in event');
        return;
      }
      
      // Get the file
      const file = event.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        this.log('Invalid file type:', file.type);
        this.showError('Please select a valid image file (JPEG or PNG).');
        return;
      }
      
      // Store the file
      this.state.file = file;
      
      // Show processing content
      this.showProcessingContent();
      
      // Reset error state
      this.state.error = null;
      
      // Start transformation
      this.transformImage();
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

    /**
     * Transform the image
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
        this.log('Starting transformation process - text dialog will appear after cropping');
        this.log('Clearing previous result');
        
        // First try unified API client - this is the preferred method
        if (window.unifiedApiClient) {
          this.log('Using UnifiedApiClient for processing');
          await this.useUnifiedApiClient();
          return;
        }
        
        // Use image processing manager if available as fallback
        if (window.imageProcessingManager) {
          this.log('Unified API client not available, using ImageProcessingManager');
          this.useImageProcessingManager();
          return;
        }
        
        // Try direct processing with RunPod if other methods are unavailable
        if (typeof window.processImageWithRunPod === 'function') {
          this.log('Using direct processImageWithRunPod function as last resort');
          window.processImageWithRunPod(this.state.file);
          this.requestInProgress = false;
          return;
        }
        
        // All methods unavailable
        throw new Error('No processing method available - Cannot find UnifiedApiClient, ImageProcessingManager, or processImageWithRunPod');
        
      } catch (error) {
        console.error('[PixarTransformFileInput] Transform error:', error);
        this.showError('Error processing image: ' + error.message);
      } finally {
        this.requestInProgress = false;
      }
    }
    
    /**
     * Use the Image Processing Manager for transformation
     */
    useImageProcessingManager() {
      this.log('Delegating to ImageProcessingManager');
      
      // Create a fake event to pass to the manager
      const fakeEvent = {
        target: {
          files: [this.state.file]
        }
      };
      
      // Call the manager's file selection handler
      window.imageProcessingManager.handleFileSelected(fakeEvent);
      
      // The manager will handle everything from here
      this.requestInProgress = false;
    }
    
    /**
     * Use the Unified API Client for transformation
     */
    async useUnifiedApiClient() {
      this.log('Using UnifiedApiClient for transformation');
      
      try {
        // Get the API client
        const apiClient = window.unifiedApiClient;
        
        if (!apiClient) {
          throw new Error('Unified API Client not available');
        }
        
        // Update progress to show upload starting
        this.updateProgress(10);
        
        // Configure watermark
        const watermarkConfig = {
          url: "https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png",
          width: 200,
          height: 200,
          spaceBetweenWatermarks: 100
        };
        
        // Use the transform method directly - it handles everything including polling
        this.log('Starting transformation via UnifiedApiClient.transform');
        const result = await apiClient.transform({
          sourceImage: this.state.file,
          watermark: watermarkConfig
        }, (progress) => {
          // Progress callback
          this.log(`Transform progress: ${progress}%`);
          this.updateProgress(progress);
        });
        
        this.log('Transformation complete:', result);
        
        if (!result.success) {
          throw new Error('Transformation failed: ' + (result.error || 'Unknown error'));
        }
        
        // Check that we have an image URL
        const imageUrl = result.imageUrl || 
                        result.watermarkedImageUrlToShow || 
                        result.processedImageUrl;
                        
        if (!imageUrl) {
          throw new Error('No image URL received from server');
        }
        
        // Store the processed image URL
        this.processedImageUrl = imageUrl;
        this.processedPrintImageUrl = result.processedPrintImageUrl || null;
        
        // Update UI
        this.state.isUploading = false;
        this.state.isProcessing = false;
        this.updateProgress(100);
        
        // Show the result
        this.showResultContent(this.processedImageUrl);
        
        // Dispatch complete event
        this.dispatchEvent(new CustomEvent('pixar-transform-complete', {
          detail: {
            imageUrl: this.processedImageUrl,
            timestamp: Date.now()
          },
          bubbles: true
        }));
        
      } catch (error) {
        console.error('[PixarTransformFileInput] UnifiedApiClient error:', error);
        this.showError('Error processing image: ' + error.message);
      } finally {
        this.requestInProgress = false;
      }
    }
    
    /**
     * Show an error message
     */
    showError(message) {
      this.log('Showing error:', message);
      
      // Set error in state
      this.state.error = message;
      this.state.isUploading = false;
      this.state.isProcessing = false;
      
      // Hide processing content
      this.hideProcessingContent();
      
      // Show error message
      alert('Error: ' + message);
      
      // Reopen popup
      this.openPopup();
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