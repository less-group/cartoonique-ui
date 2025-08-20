/**
 * UIController.js
 * 
 * Coordinates the overall flow and UI states for the image processing application.
 * Acts as the central coordinator between modules.
 */

class UIController {
  constructor(options = {}) {
    // References to component managers
    this.imageUploader = options.imageUploader || null;
    this.imageCropper = options.imageCropper || null;
    this.textOverlayManager = options.textOverlayManager || null;
    this.styleAPIClient = options.styleAPIClient || null;
    this.storageManager = options.storageManager || null;
    this.cartManager = options.cartManager || null;
    
    // State tracking
    this.currentStep = 'idle'; // idle, uploading, cropping, styling, text, finalizing, complete
    this.currentImageData = null;
    
    // DOM References
    this.containerElement = options.containerElement || null;
    this.loadingElement = options.loadingElement || null;
    this.resultElement = options.resultElement || null;
    
    // Initialize event listeners
    this.eventListeners = {};
    
    // Setup event handlers
    this.setupEventHandlers();
    
    console.log('UIController initialized');
  }
  
  /**
   * Set up event handlers for all managed components
   */
  setupEventHandlers() {
    // Image uploader events
    if (this.imageUploader) {
      document.addEventListener('image-uploader-file-loaded', (event) => {
        console.log('File loaded, proceeding to crop step');
        this.setStep('cropping');
        this.showImageCropper(event.detail.imageDataUrl);
      });
    }
    
    // Image cropper events
    document.addEventListener('crop-applied', (event) => {
      console.log('Crop applied, proceeding to style transformation');
      this.handleCropApplied(event);
    });
    
    document.addEventListener('crop-cancelled', () => {
      console.log('Crop cancelled, returning to upload step');
      this.handleCropCancelled();
    });
    
    // Style API events
    if (this.styleAPIClient) {
      document.addEventListener('style-api-job-completed', (event) => {
        console.log('Style transformation complete');
        this.handleTransformComplete(event);
      });
    }
    
    // Text overlay events
    if (this.textOverlayManager) {
      document.addEventListener('text-overlay-text-applied', (event) => {
        console.log('Text applied, proceeding to finalization');
        this.handleTextApplied(event);
      });
      
      document.addEventListener('text-overlay-text-skipped', () => {
        console.log('Text skipped, proceeding to finalization');
        this.handleTextSkipped();
      });
    }
    
    // DOM ready event
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDomReady());
    } else {
      setTimeout(() => this.onDomReady(), 0);
    }
  }
  
  /**
   * Handle DOM ready event
   */
  onDomReady() {
    console.log('DOM ready, initializing UI components');
    this.findAndSetupComponents();
  }
  
  /**
   * Find and set up UI components
   */
  findAndSetupComponents() {
    // Find container if not provided
    if (!this.containerElement) {
      this.containerElement = document.getElementById('pixar-app-container') || 
                              document.querySelector('.pixar-app-container');
    }
    
    // Find loading element if not provided
    if (!this.loadingElement) {
      this.loadingElement = document.getElementById('pixar-loading-popup') ||
                            document.querySelector('.pixar-loading-popup');
    }
    
    // Find result element if not provided
    if (!this.resultElement) {
      this.resultElement = document.getElementById('pixar-result-popup') ||
                           document.querySelector('.pixar-result-popup');
    }
  }
  
  /**
   * Set the current processing step
   * @param {string} step - The new step
   */
  setStep(step) {
    const previousStep = this.currentStep;
    this.currentStep = step;
    
    console.log(`Step changed: ${previousStep} -> ${step}`);
    
    // Dispatch step-changed event
    this.dispatchEvent('step-changed', {
      previousStep,
      currentStep: step
    });
    
    // Update UI based on step
    this.updateUIForStep(step);
  }
  
  /**
   * Update UI elements based on current step
   * @param {string} step - The current step
   */
  updateUIForStep(step) {
    // Hide all components first
    this.hideAllComponents();
    
    // Show appropriate component for the step
    switch (step) {
      case 'idle':
        // Show upload button/area
        break;
        
      case 'uploading':
        this.showLoading('Uploading image...');
        break;
        
      case 'cropping':
        // Cropper is shown separately
        break;
        
      case 'styling':
        this.showLoading('Transforming your image...');
        break;
        
      case 'text':
        // Text overlay is shown separately
        break;
        
      case 'finalizing':
        this.showLoading('Finalizing your image...');
        break;
        
      case 'complete':
        this.hideLoading();
        break;
    }
  }
  
  /**
   * Hide all UI components
   */
  hideAllComponents() {
    // Hide loading popup
    this.hideLoading();
    
    // Hide cropper if available
    if (this.imageCropper) {
      // Use appropriate method on imageCropper to hide it
    }
    
    // Hide text overlay if available
    if (this.textOverlayManager) {
      // Use appropriate method on textOverlayManager to hide it
    }
    
    // Hide result popup
    this.hideResultPopup();
  }
  
  /**
   * Show the loading popup
   * @param {string} message - The loading message to display
   */
  showLoading(message = 'Loading...') {
    if (this.loadingElement) {
      const messageEl = this.loadingElement.querySelector('.loading-message') || 
                        this.loadingElement;
      
      if (messageEl) {
        messageEl.textContent = message;
      }
      
      this.loadingElement.style.display = 'flex';
    }
  }
  
  /**
   * Hide the loading popup
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }
  
  /**
   * Show the image cropper
   * @param {string} imageDataUrl - The image data URL to crop
   */
  showImageCropper(imageDataUrl) {
    if (!this.imageCropper) {
      console.error('No image cropper available');
      return;
    }
    
    // Create container for cropper if needed
    if (!document.getElementById('pixar-cropper-container')) {
      const cropperContainer = document.createElement('div');
      cropperContainer.id = 'pixar-cropper-container';
      
      if (this.containerElement) {
        this.containerElement.appendChild(cropperContainer);
      } else {
        document.body.appendChild(cropperContainer);
      }
    }
    
    // Show cropper
    this.imageCropper.show(imageDataUrl, document.getElementById('pixar-cropper-container'));
  }
  
  /**
   * Handle crop applied event
   * @param {CustomEvent} event - The crop applied event
   */
  handleCropApplied(event) {
    const { croppedImageDataUrl, cropCoordinates } = event.detail;
    
    // Store cropped image data
    this.currentImageData = {
      ...this.currentImageData,
      croppedImageDataUrl,
      cropCoordinates
    };
    
    // Move to styling step
    this.setStep('styling');
    
    // Start style transformation
    if (this.styleAPIClient && this.imageUploader) {
      const originalFile = this.imageUploader.getOriginalFile();
      
      if (originalFile) {
        // Convert cropped data URL to blob
        const blob = this.dataURLToBlob(croppedImageDataUrl);
        
        // Send to the style API
        this.styleAPIClient.sendImageForStyleTransformation(blob)
          .catch((error) => {
            console.error('Error sending image for transformation:', error);
            this.handleError('Failed to transform image', error);
          });
      }
    }
  }
  
  /**
   * Handle crop cancelled event
   */
  handleCropCancelled() {
    // Reset to idle state
    this.setStep('idle');
    
    // Clear current image data
    this.currentImageData = null;
  }
  
  /**
   * Handle transform complete event
   * @param {CustomEvent} event - The transform complete event
   */
  handleTransformComplete(event) {
    const { resultUrl } = event.detail;
    
    // Store transformed image URL
    this.currentImageData = {
      ...this.currentImageData,
      transformedImageUrl: resultUrl
    };
    
    // Move to text overlay step
    this.setStep('text');
    
    // Show text overlay UI
    if (this.textOverlayManager) {
      this.showTextOverlay(resultUrl);
    } else {
      // If no text overlay manager, proceed to finalization
      this.setStep('finalizing');
      this.applyFinalProcessing();
    }
  }
  
  /**
   * Show text overlay interface
   * @param {string} imageUrl - The transformed image URL
   */
  showTextOverlay(imageUrl) {
    if (!this.textOverlayManager) {
      console.error('No text overlay manager available');
      return;
    }
    
    // Create container for text overlay if needed
    if (!document.getElementById('pixar-text-container')) {
      const textContainer = document.createElement('div');
      textContainer.id = 'pixar-text-container';
      
      if (this.containerElement) {
        this.containerElement.appendChild(textContainer);
      } else {
        document.body.appendChild(textContainer);
      }
    }
    
    // Show text overlay UI
    this.textOverlayManager.showTextInputInterface(
      document.getElementById('pixar-text-container'),
      { imageUrl }
    );
  }
  
  /**
   * Handle text applied event
   * @param {CustomEvent} event - The text applied event
   */
  handleTextApplied(event) {
    const { textFields, position } = event.detail;
    
    // Store text data
    this.currentImageData = {
      ...this.currentImageData,
      textFields,
      textPosition: position
    };
    
    // Move to finalization step
    this.setStep('finalizing');
    
    // Apply final processing
    this.applyFinalProcessing();
  }
  
  /**
   * Handle text skipped event
   */
  handleTextSkipped() {
    // Move to finalization step
    this.setStep('finalizing');
    
    // Apply final processing without text
    this.applyFinalProcessing();
  }
  
  /**
   * Apply final processing to the image
   */
  applyFinalProcessing() {
    if (!this.currentImageData || !this.currentImageData.transformedImageUrl) {
      console.error('No transformed image available for final processing');
      return;
    }
    
    const { transformedImageUrl, textFields, textPosition } = this.currentImageData;
    
    // Create a canvas for the final image
    const finalizeImage = (imageElement) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      
      // Draw the image
      ctx.drawImage(imageElement, 0, 0);
      
      // Draw text if available
      if (textFields && textFields.length > 0 && this.textOverlayManager) {
        // Store text position in text manager
        this.textOverlayManager.textPosition = textPosition || 'bottom';
        this.textOverlayManager.textFields = textFields;
        
        // Draw text on canvas
        this.textOverlayManager.drawTextOnCanvas(ctx, canvas.width, canvas.height);
      }
      
      // Get the final image data URL
      const finalImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Store the final image URL
      this.currentImageData.finalImageUrl = finalImageUrl;
      
      // Show the result
      this.setStep('complete');
      this.showResultPopup(finalImageUrl);
    };
    
    // Load the transformed image
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    
    image.onload = () => finalizeImage(image);
    
    image.onerror = (error) => {
      console.error('Error loading transformed image for finalization:', error);
      
      // Try directly with the transformed URL as fallback
      this.setStep('complete');
      this.showResultPopup(transformedImageUrl);
    };
    
    image.src = transformedImageUrl;
  }
  
  /**
   * Show the result popup with the final image
   * @param {string} imageUrl - The final image URL
   */
  showResultPopup(imageUrl) {
    if (!this.resultElement) {
      console.warn('No result popup element available');
      return;
    }
    
    // Find or create the image element in the popup
    let imageElement = this.resultElement.querySelector('img');
    
    if (!imageElement) {
      imageElement = document.createElement('img');
      imageElement.className = 'pixar-result-image';
      
      const imageContainer = this.resultElement.querySelector('.pixar-result-image-container') || 
                             this.resultElement;
      
      imageContainer.appendChild(imageElement);
    }
    
    // Set the image source
    imageElement.src = imageUrl;
    
    // Show the popup
    this.resultElement.style.display = 'block';
    
    // Dispatch result-shown event
    this.dispatchEvent('result-shown', {
      imageUrl
    });
  }
  
  /**
   * Hide the result popup
   */
  hideResultPopup() {
    if (this.resultElement) {
      this.resultElement.style.display = 'none';
    }
  }
  
  /**
   * Handle checkout button click
   * @param {string} size - The selected product size
   */
  handleCheckout(size) {
    if (!this.cartManager || !this.currentImageData || !this.currentImageData.finalImageUrl) {
      console.error('Cannot checkout: missing cart manager or final image');
      return;
    }
    
    // Add to cart and redirect to checkout
    this.cartManager.addToCartAndRedirect(
      size,
      this.currentImageData.finalImageUrl,
      {
        _has_text: this.currentImageData.textFields && this.currentImageData.textFields.length > 0
      }
    ).catch((error) => {
      console.error('Error during checkout:', error);
      this.handleError('Failed to add product to cart', error);
    });
  }
  
  /**
   * Handle errors in the UI
   * @param {string} message - The error message
   * @param {Error} error - The error object
   */
  handleError(message, error) {
    console.error(message, error);
    
    // Hide loading
    this.hideLoading();
    
    // Show error message
    alert(`Error: ${message}\n${error ? error.message : ''}`);
    
    // Dispatch error event
    this.dispatchEvent('error', {
      message,
      error: error ? error.message : null
    });
  }
  
  /**
   * Reset the UI state
   */
  reset() {
    // Reset state
    this.currentImageData = null;
    
    // Reset step
    this.setStep('idle');
    
    // Reset components
    if (this.imageUploader) {
      this.imageUploader.reset();
    }
    
    if (this.imageCropper) {
      // Reset cropper
    }
    
    if (this.textOverlayManager) {
      this.textOverlayManager.reset();
    }
    
    // Hide all UI components
    this.hideAllComponents();
    
    console.log('UI Controller reset');
  }
  
  /**
   * Convert data URL to Blob
   * @param {string} dataURL - The data URL to convert
   * @returns {Blob} The resulting Blob object
   */
  dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        listener => listener !== callback
      );
    }
  }
  
  /**
   * Dispatch an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  dispatchEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
    
    // Also dispatch as a DOM CustomEvent
    const customEvent = new CustomEvent(`ui-controller-${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
} else {
  window.UIController = UIController;
}