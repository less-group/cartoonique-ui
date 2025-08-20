/**
 * Image Post-Processing API Service
 * 
 * This module handles sending post-processing requests to the backend API
 * for applying cropping and text overlays to face-swapped images.
 * It is called only when the user clicks continue on the fifth popup
 * after they have chosen their size and the image processing manager
 * has shown the image, text, and cropping data.
 */

class ImagePostProcessingAPI {
  constructor() {
    // The endpoint URL for the post-processing API
    this.apiEndpoint = 'https://letzteshemd-faceswap-api-production.up.railway.app/post-process';
    
    // Flag to track if a request is currently in progress
    this.isProcessing = false;
    
    // Log prefix for easier debugging
    this.logPrefix = '🔄 [Post-Processing API]';
    
    // Bind event handlers
    this.handleResultContinueClick = this.handleResultContinueClick.bind(this);
    this.handleFaceSwapContinueClick = this.handleFaceSwapContinueClick.bind(this);
    
    // Initialize and attach event listeners
    this.initialize();
  }
  
  /**
   * Log a message with the API prefix
   * @param {string} message - The message to log
   * @param {string} level - The log level (log, warn, error)
   */
  log(message, level = 'log') {
    if (level === 'error') {
      console.error(`${this.logPrefix} ${message}`);
    } else if (level === 'warn') {
      console.warn(`${this.logPrefix} ${message}`);
    } else {
      console.log(`${this.logPrefix} ${message}`);
    }
  }
  
  /**
   * Initialize the post-processing API service and attach event listeners
   */
  initialize() {
    // Listen for when the fifth popup's continue button is clicked (for Image Processing Manager)
    document.addEventListener('pixar-fifth-popup-continue-click', this.handleResultContinueClick);
    
    // Listen for face-swap specific events (for with-faceswap template)
    document.addEventListener('faceswap-continue-clicked', this.handleFaceSwapContinueClick);
    
    // Direct event listener for the continue button in the result popup
    const attachContinueButtonListener = () => {
      // For the Image Processing Manager result popup
      const continueButton = document.getElementById('pixar-result-continue');
      if (continueButton && !continueButton.dataset.postProcessListenerAttached) {
        this.log('Attaching post-processing listener to continue button');
        
        // Use the capture phase to ensure our listener runs before others
        const originalClickHandler = continueButton.onclick;
        
        continueButton.onclick = (event) => {
          // Only proceed if we're not already processing
          if (!this.isProcessing) {
            // Call our post-processing handler
            this.handleResultContinueClick(event);
          }
          
          // Call the original click handler if it exists
          if (typeof originalClickHandler === 'function') {
            return originalClickHandler.call(continueButton, event);
          }
        };
        
        // Mark the button as having our listener attached
        continueButton.dataset.postProcessListenerAttached = 'true';
      }
      
      // For the legacy face-swap continue button
      const faceSwapContinueButtons = document.querySelectorAll('[data-add-to-cart-faceswap]');
      faceSwapContinueButtons.forEach(button => {
        if (!button.dataset.postProcessListenerAttached) {
          this.log('Attaching post-processing listener to face-swap continue button');
          
          const originalClickHandler = button.onclick;
          
          button.onclick = (event) => {
            // Only proceed if we're not already processing
            if (!this.isProcessing) {
              // Call our post-processing handler for face-swap
              this.handleFaceSwapContinueClick(event);
            }
            
            // Call the original click handler if it exists
            if (typeof originalClickHandler === 'function') {
              return originalClickHandler.call(button, event);
            }
          };
          
          // Mark the button as having our listener attached
          button.dataset.postProcessListenerAttached = 'true';
        }
      });
    };
    
    // Try to attach the listener immediately if the button already exists
    attachContinueButtonListener();
    
    // Also set up a mutation observer to watch for the button being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          attachContinueButtonListener();
        }
      });
    });
    
    // Start observing the body for any changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    this.log('Initialized and ready to process images');
  }
  
  /**
   * Handle when the user clicks continue on the fifth popup (for Image Processing Manager)
   * @param {Event} event - The click event object
   */
  async handleResultContinueClick(event) {
    // Prevent multiple calls
    if (this.isProcessing) {
      this.log('Post-processing request already in progress, skipping', 'warn');
      return;
    }
    
    this.isProcessing = true;
    this.log('Continue button clicked on fifth popup, preparing post-processing');
    
    // Get the necessary data for the post-processing request
    const imageProcessingManager = window.imageProcessingManager;
    if (!imageProcessingManager) {
      this.log('Image Processing Manager not found, cannot proceed with post-processing', 'error');
      this.isProcessing = false;
      return;
    }
    
    // Extract necessary data from the image processing manager
    const jobId = this.extractJobIdFromImageUrl(imageProcessingManager.processedImageUrl);
    const size = imageProcessingManager.selectedSize || 'M';
    const textFields = imageProcessingManager.textFields;
    const cropCoordinates = imageProcessingManager.cropCoordinates;
    
    // Check if we have a valid job ID
    if (!jobId) {
      this.log('No job ID found for post-processing, skipping this step', 'warn');
      this.isProcessing = false;
      return;
    }
    
    this.log(`Preparing post-processing request with job ID: ${jobId} and size: ${size}`);
    
    try {
      // Prepare the request payload asynchronously
      const postProcessPayload = await this.buildRequestPayload(jobId, size, textFields, cropCoordinates);
      
      // Log the request being sent
      this.log(`Sending post-processing request with data: ${JSON.stringify(postProcessPayload).substring(0, 150)}...`);
      
      // Send the post-processing request
      this.sendPostProcessingRequest(postProcessPayload);
    } catch (error) {
      this.log(`Error preparing post-processing request: ${error.message}`, 'error');
      this.isProcessing = false;
    }
  }
  
  /**
   * Handle when the user clicks continue for face-swap specific implementation
   * @param {Event} event - The event object
   */
  handleFaceSwapContinueClick(event) {
    // Prevent multiple calls
    if (this.isProcessing) {
      this.log('Post-processing request already in progress, skipping', 'warn');
      return;
    }
    
    this.isProcessing = true;
    this.log('Continue button clicked on face-swap, preparing post-processing');
    
    // Get the face-swap file input wrapper
    const faceSwapWrapper = document.querySelector('face-swap-file-input-wrapper');
    if (!faceSwapWrapper) {
      this.log('Face-swap wrapper not found, cannot proceed with post-processing', 'error');
      this.isProcessing = false;
      return;
    }
    
    // Extract necessary data from the face-swap wrapper
    const processedImageUrl = faceSwapWrapper.processedImageUrl;
    const jobId = this.extractJobIdFromImageUrl(processedImageUrl);
    
    // Determine size from selected variant or default to M
    let size = 'M';
    const variantSelector = document.querySelector('[data-variant-selector]');
    if (variantSelector) {
      const selectedOption = variantSelector.querySelector('option:checked');
      if (selectedOption && selectedOption.textContent) {
        const optionText = selectedOption.textContent.toLowerCase();
        if (optionText.includes('klein') || optionText.includes('small') || optionText.includes('20x30')) {
          size = 'S';
        } else if (optionText.includes('groß') || optionText.includes('large') || optionText.includes('40x50') || optionText.includes('50x70')) {
          size = 'L';
        }
      }
    }
    
    // Check if we have a valid job ID
    if (!jobId) {
      this.log('No job ID found for face-swap post-processing, skipping this step', 'warn');
      this.isProcessing = false;
      return;
    }
    
    this.log(`Preparing face-swap post-processing request with job ID: ${jobId} and size: ${size}`);
    
    // Prepare the request payload
    const postProcessPayload = {
      jobId: jobId,
      size: size,
      productId: faceSwapWrapper.productId || null,
      customerId: faceSwapWrapper.customerId || null,
      orderId: faceSwapWrapper.orderId || null
    };
    
    // Log the request being sent
    this.log(`Sending face-swap post-processing request with data: ${JSON.stringify(postProcessPayload)}`);
    
    // Send the post-processing request
    this.sendPostProcessingRequest(postProcessPayload);
  }
  
  /**
   * Get image dimensions asynchronously
   * @param {string} url - The URL of the image
   * @returns {Promise<{width: number, height: number}>} - A promise resolving to the image dimensions
   */
  getImageDimensions(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => {
        this.log(`Error loading image for dimensions: ${url}`, 'warn');
        resolve({ width: 1000, height: 1000 }); // Fallback dimensions
      };
      img.src = url;
    });
  }
  
  /**
   * Extract the job ID from the processed image URL
   * @param {string} imageUrl - The URL of the processed image
   * @returns {string|null} - The extracted job ID or null if not found
   */
  extractJobIdFromImageUrl(imageUrl) {
    if (!imageUrl) return null;
    
    // Primary pattern: Extract jobId from URL if it includes '/result/'
    if (imageUrl.includes('/result/')) {
      const urlParts = imageUrl.split('/');
      const resultIndex = urlParts.indexOf('result');
      if (resultIndex !== -1 && resultIndex < urlParts.length - 1) {
        return urlParts[resultIndex + 1];
      }
    }
    
    // Fallback 1: Check for jobId as URL parameter
    try {
      const url = new URL(imageUrl);
      const jobId = url.searchParams.get('jobId');
      if (jobId) {
        this.log(`Found jobId in URL parameters: ${jobId}`);
        return jobId;
      }
    } catch (e) {
      // URL parsing failed, continue with other extraction methods
    }
    
    // Fallback 2: Look for UUID-like pattern in the URL
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = imageUrl.match(uuidPattern);
    if (match) {
      this.log(`Found UUID-like jobId in URL: ${match[0]}`);
      return match[0];
    }
    
    return null;
  }
  
  /**
   * Build the request payload for the post-processing API
   * @param {string} jobId - The RunPod job ID from the original face swap operation
   * @param {string} size - The selected size (S, M, or L)
   * @param {Object} textFields - Text overlay configuration data
   * @param {Object} cropCoordinates - Crop coordinates for the image
   * @returns {Promise<Object>} - The formatted request payload
   */
  async buildRequestPayload(jobId, size, textFields, cropCoordinates) {
    // Create the basic payload with required fields
    const payload = {
      jobId: jobId,
      size: size
    };
    
    // Add optional product, customer, and order IDs if available
    const imageProcessingManager = window.imageProcessingManager;
    if (imageProcessingManager) {
      if (imageProcessingManager.productId) {
        payload.productId = imageProcessingManager.productId;
      }
      
      if (imageProcessingManager.customerId) {
        payload.customerId = imageProcessingManager.customerId;
      }
      
      if (imageProcessingManager.orderId) {
        payload.orderId = imageProcessingManager.orderId;
      }
    }
    
    // Add text fields if available
    if (textFields) {
      payload.text = {
        // Names to display (fallback to empty strings if not available)
        name1: textFields.text || '',
        name2: textFields.text2 || '',
        subtitle: textFields.subtitle || '',
        
        // Text styling
        ampersandStyle: true, // Use special '&' styling between names
        fontFamily: textFields.fontFamily || 'Montserrat',
        fontWeight: 900,
        fontSize: {
          main: parseInt(textFields.fontSize) || 48,
          subtitle: parseInt(textFields.fontSize) / 2 || 24
        },
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: textFields.color || '#FFFFFF',
        
        // Text positioning
        positioning: {
          relative: true,
          xPercent: 0.5, // Center horizontally
          yPercent: textFields.position === 'top' ? 0.13 : 
                   textFields.position === 'bottom' ? 0.87 : 0.5,
          position: textFields.position || 'bottom',
          percentage: textFields.positionPercentage || 
                     (textFields.position === 'top' ? 10 : 
                      textFields.position === 'bottom' ? 90 : 50)
        },
        
        // Subtitle styling
        subtitleStyle: {
          marginTop: 10
        }
      };
    }
    
    // Add crop parameters if available
    if (cropCoordinates && imageProcessingManager) {
      // Get image dimensions asynchronously
      let dimensions = { width: 1000, height: 1000 }; // Default fallback
      
      try {
        if (imageProcessingManager.originalImageDataUrl) {
          dimensions = await this.getImageDimensions(imageProcessingManager.originalImageDataUrl);
          this.log(`Got original image dimensions: ${dimensions.width}x${dimensions.height}`);
        }
      } catch (error) {
        this.log(`Error getting image dimensions, using fallback: ${error.message}`, 'warn');
      }
      
      // Add basic crop format
      payload.crop = {
        left: Math.round(cropCoordinates.x),
        top: Math.round(cropCoordinates.y),
        width: Math.round(cropCoordinates.width),
        height: Math.round(cropCoordinates.height)
      };
      
      // Add enhanced crop format for more precise control
      payload.crop.enhanced = {
        exact: {
          x: Math.round(cropCoordinates.x),
          y: Math.round(cropCoordinates.y),
          width: Math.round(cropCoordinates.width),
          height: Math.round(cropCoordinates.height)
        },
        relative: {
          x: cropCoordinates.x / dimensions.width,
          y: cropCoordinates.y / dimensions.height,
          width: cropCoordinates.width / dimensions.width,
          height: cropCoordinates.height / dimensions.height
        },
        originalImageWidth: dimensions.width,
        originalImageHeight: dimensions.height
      };
    }
    
    return payload;
  }
  
  /**
   * Send the post-processing request to the API with retry logic
   * @param {Object} payload - The request payload to send
   * @param {number} maxRetries - Maximum number of retry attempts (default: 2)
   */
  async sendPostProcessingRequest(payload, maxRetries = 2) {
    const startTime = Date.now();
    this.log(`Making API request to ${this.apiEndpoint}`);
    
    let attempts = 0;
    let lastError = null;
    
    while (attempts <= maxRetries) {
      try {
        // Make the API request
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Request was successful
        const duration = Date.now() - startTime;
        this.log(`Post-processing successful (${duration}ms): ${JSON.stringify(data)}`);
        
        // Dispatch an event to notify other components of successful processing
        const successEvent = new CustomEvent('post-processing-complete', {
          detail: {
            success: true,
            jobId: payload.jobId,
            size: payload.size,
            response: data,
            attemptCount: attempts + 1
          },
          bubbles: true
        });
        document.dispatchEvent(successEvent);
        
        this.isProcessing = false;
        return data;
      } catch (error) {
        attempts++;
        lastError = error;
        
        if (attempts <= maxRetries) {
          // Calculate backoff time (exponential backoff)
          const backoffTime = 1000 * Math.pow(2, attempts - 1);
          this.log(`API request failed, retrying in ${backoffTime}ms (attempt ${attempts}/${maxRetries})`, 'warn');
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          // We've exhausted all retries
          const duration = Date.now() - startTime;
          this.log(`Post-processing error after ${attempts} attempts (${duration}ms): ${error.message}`, 'error');
          
          // Dispatch an event to notify other components of failed processing
          const errorEvent = new CustomEvent('post-processing-error', {
            detail: {
              success: false,
              jobId: payload.jobId,
              size: payload.size,
              error: error.message,
              attemptCount: attempts
            },
            bubbles: true
          });
          document.dispatchEvent(errorEvent);
          
          this.isProcessing = false;
          
          // Don't block the checkout flow - let it continue even with post-processing error
          break;
        }
      }
    }
  }
}

// Initialize the post-processing API service when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  window.imagePostProcessingAPI = new ImagePostProcessingAPI();
});

// Also initialize immediately in case the document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!window.imagePostProcessingAPI) {
    window.imagePostProcessingAPI = new ImagePostProcessingAPI();
  }
} 