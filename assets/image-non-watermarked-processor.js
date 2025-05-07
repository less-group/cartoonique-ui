/**
 * Image Non-Watermarked Processor
 * 
 * This module processes the non-watermarked images from Railway API responses
 * by applying the same cropping and text overlay that was applied to the 
 * watermarked images shown on the frontend.
 * 
 * It is triggered when the user selects a size and clicks "continue" in the
 * fifth popup, but works separately from any frontend display logic.
 */

class ImageNonWatermarkedProcessor {
  constructor() {
    this.logPrefix = '✂️ [NonWatermarked]';
    this.isProcessing = false;
    this.processingQueue = [];
    
    // Bind methods
    this.handleContinueButtonClick = this.handleContinueButtonClick.bind(this);
    
    // Initialize event listeners
    this.initialize();
  }
  
  /**
   * Log a message with the processor prefix
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
   * Initialize the processor and set up event listeners
   */
  initialize() {
    // Attach listener for the continue button click
    this.attachContinueButtonListener();
    
    // Set up a mutation observer to attach the listener to dynamically added buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          this.attachContinueButtonListener();
        }
      });
    });
    
    // Start observing the DOM for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    this.log('Initialized and ready to process non-watermarked images');
  }
  
  /**
   * Attach event listener to the continue button
   */
  attachContinueButtonListener() {
    const continueButton = document.getElementById('pixar-result-continue');
    if (continueButton && !continueButton.dataset.nonWatermarkedListenerAttached) {
      this.log('Attaching non-watermarked processor listener to continue button');
      
      // Use event delegation to ensure our handler runs alongside other handlers
      // We'll use the capture phase to ensure this runs before other handlers
      document.addEventListener('click', (event) => {
        if (event.target.id === 'pixar-result-continue' || event.target.closest('#pixar-result-continue')) {
          // Don't stop propagation - let other handlers run
          this.handleContinueButtonClick(event);
        }
      }, true);
      
      // Mark the button as having our listener attached
      continueButton.dataset.nonWatermarkedListenerAttached = 'true';
    }
  }
  
  /**
   * Handle the continue button click event
   * @param {Event} event - The click event
   */
  handleContinueButtonClick(event) {
    if (this.isProcessing) {
      this.log('Already processing a non-watermarked image, queueing this request', 'warn');
      return;
    }
    
    this.isProcessing = true;
    this.log('Continue button clicked, preparing to process non-watermarked image');
    
    // Get the image processing manager
    const imageProcessingManager = window.imageProcessingManager;
    if (!imageProcessingManager) {
      this.log('Image Processing Manager not found, cannot proceed', 'error');
      this.isProcessing = false;
      return;
    }
    
    // Extract the Railway job data from the API response
    this.extractAndProcessNonWatermarkedImage(imageProcessingManager);
  }
  
  /**
   * Extract non-watermarked image data from the most recent Railway job
   * @param {Object} imageProcessingManager - The image processing manager instance
   */
  async extractAndProcessNonWatermarkedImage(imageProcessingManager) {
    try {
      // Get the job ID from the watermarked image URL
      const watermarkedImageUrl = imageProcessingManager.stylizedImageUrl;
      if (!watermarkedImageUrl) {
        throw new Error('No watermarked image URL found');
      }
      
      // Extract job ID from the URL
      const jobId = this.extractJobIdFromImageUrl(watermarkedImageUrl);
      if (!jobId) {
        throw new Error('Could not extract job ID from image URL');
      }
      
      this.log(`Found job ID: ${jobId} from watermarked image URL`);
      
      // Get the job status from the Railway API
      const jobStatus = await this.fetchJobStatus(jobId);
      
      // Check if we have the non-watermarked image URL
      const nonWatermarkedImageUrl = jobStatus.processedImageUrl;
      if (!nonWatermarkedImageUrl) {
        throw new Error('No non-watermarked image URL found in job status');
      }
      
      this.log(`Found non-watermarked image URL: ${nonWatermarkedImageUrl}`);
      
      // Apply the same cropping and text overlay to the non-watermarked image
      await this.processFinalImage(nonWatermarkedImageUrl, imageProcessingManager);
      
    } catch (error) {
      this.log(`Error processing non-watermarked image: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      
      // Process next item in queue if any
      if (this.processingQueue.length > 0) {
        const nextItem = this.processingQueue.shift();
        this.handleContinueButtonClick(nextItem.event);
      }
    }
  }
  
  /**
   * Extract the job ID from an image URL
   * @param {string} imageUrl - The image URL from Railway API
   * @returns {string|null} - The extracted job ID or null if not found
   */
  extractJobIdFromImageUrl(imageUrl) {
    if (!imageUrl) return null;
    
    try {
      // Parse the URL to extract parts
      const url = new URL(imageUrl);
      
      // Check if this is a Railway URL
      if (!url.hostname.includes('railway.app')) {
        return null;
      }
      
      // Extract job ID from pathname
      const pathParts = url.pathname.split('/');
      for (let i = 0; i < pathParts.length; i++) {
        // Job IDs are typically UUIDs or long alphanumeric strings
        if (pathParts[i].length > 20 || pathParts[i].includes('-')) {
          return pathParts[i];
        }
      }
      
      // Fallback: try to extract from query parameters
      const jobId = url.searchParams.get('jobId') || url.searchParams.get('id');
      if (jobId) {
        return jobId;
      }
      
      // If not found in pathname or query, look in the full URL for pattern
      const jobIdMatch = imageUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (jobIdMatch) {
        return jobIdMatch[0];
      }
      
      // Another pattern to try
      const alphaNumericMatch = imageUrl.match(/[a-z0-9]{24,}/i);
      if (alphaNumericMatch) {
        return alphaNumericMatch[0];
      }
      
      return null;
    } catch (error) {
      this.log(`Error extracting job ID from URL: ${error.message}`, 'error');
      return null;
    }
  }
  
  /**
   * Fetch the job status from the Railway API
   * @param {string} jobId - The job ID
   * @returns {Promise<Object>} - The job status data
   */
  async fetchJobStatus(jobId) {
    this.log(`Fetching job status for job ID: ${jobId}`);
    
    const response = await fetch(`https://letzteshemd-faceswap-api-production.up.railway.app/status/${jobId}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    this.log(`Received job status data: ${JSON.stringify(data)}`);
    
    return data;
  }
  
  /**
   * Process the final non-watermarked image with cropping and text overlay
   * @param {string} imageUrl - The non-watermarked image URL
   * @param {Object} imageProcessingManager - The image processing manager instance
   * @returns {Promise<string>} - The processed image data URL
   */
  async processFinalImage(imageUrl, imageProcessingManager) {
    this.log('Processing the final non-watermarked image');
    
    // Get the selected size
    const size = imageProcessingManager.selectedSize || 'S';
    this.log(`Selected size: ${size}`);
    
    // Get crop coordinates and text info from the image processing manager
    const cropCoordinates = imageProcessingManager.cropCoordinates;
    const textInfo = imageProcessingManager.textInfo;
    
    if (!cropCoordinates) {
      this.log('No crop coordinates found, using full image', 'warn');
    }
    
    if (!textInfo) {
      this.log('No text info found, processing without text overlay', 'warn');
    }
    
    // Create a canvas to process the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Get original image dimensions
          const originalWidth = img.width;
          const originalHeight = img.height;
          
          let croppedWidth, croppedHeight, croppedX, croppedY;
          
          // Apply crop coordinates if available
          if (cropCoordinates) {
            // Calculate scaling factor if original images sizes don't match
            const scaleX = originalWidth / cropCoordinates.originalImageWidth;
            const scaleY = originalHeight / cropCoordinates.originalImageHeight;
            
            // Calculate cropped dimensions in the displayed image
            croppedX = Math.round(cropCoordinates.x * scaleX);
            croppedY = Math.round(cropCoordinates.y * scaleY);
            croppedWidth = Math.round(cropCoordinates.width * scaleX);
            croppedHeight = Math.round(cropCoordinates.height * scaleY);
            
            // Force 3:4 aspect ratio if it doesn't match
            const currentRatio = croppedWidth / croppedHeight;
            const targetRatio = 3/4; // 3:4 aspect ratio is our standard
            
            if (Math.abs(currentRatio - targetRatio) > 0.01) {
              // Adjust width to match height
              const newWidth = Math.round(croppedHeight * targetRatio);
              
              // If new width is smaller than current, center the crop
              if (newWidth < croppedWidth) {
                const diff = croppedWidth - newWidth;
                croppedX += Math.floor(diff / 2);
                croppedWidth = newWidth;
              } 
              // If new width is larger, we need to adjust height instead
              else {
                const newHeight = Math.round(croppedWidth / targetRatio);
                
                // If new height is smaller than current, center the crop
                if (newHeight < croppedHeight) {
                  const diff = croppedHeight - newHeight;
                  croppedY += Math.floor(diff / 2);
                  croppedHeight = newHeight;
                }
              }
            }
          } else {
            // Set default crop to full image with 3:4 aspect ratio
            const fullImageRatio = originalWidth / originalHeight;
            const targetRatio = 3/4; // Target 3:4 ratio
            
            if (fullImageRatio > targetRatio) {
              // Image is wider than 3:4, use full height and crop width
              croppedY = 0;
              croppedHeight = originalHeight;
              croppedWidth = Math.round(originalHeight * targetRatio);
              croppedX = Math.round((originalWidth - croppedWidth) / 2);
            } else {
              // Image is taller than 3:4, use full width and crop height
              croppedX = 0;
              croppedWidth = originalWidth;
              croppedHeight = Math.round(originalWidth / targetRatio);
              croppedY = Math.round((originalHeight - croppedHeight) / 2);
            }
          }
          
          // Set canvas dimensions to match the cropped area
          canvas.width = croppedWidth;
          canvas.height = croppedHeight;
          
          // Draw the cropped image
          ctx.drawImage(
            img,
            croppedX, croppedY, croppedWidth, croppedHeight,
            0, 0, croppedWidth, croppedHeight
          );
          
          // Add text if available
          if (textInfo) {
            this.drawTextOnCanvas(ctx, croppedWidth, croppedHeight, textInfo);
          }
          
          // Convert to data URL
          const processedImageDataUrl = canvas.toDataURL('image/png');
          
          // Store the processed image for later use
          this.storeProcessedImage(processedImageDataUrl, size);
          
          this.log('Successfully processed non-watermarked image');
          resolve(processedImageDataUrl);
          
        } catch (error) {
          this.log(`Error processing image: ${error.message}`, 'error');
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        this.log(`Error loading image: ${error}`, 'error');
        reject(new Error('Failed to load image'));
      };
      
      // Start loading the image
      img.src = imageUrl;
    });
  }
  
  /**
   * Draw text overlay on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height 
   * @param {Object} textInfo - Text information and styling
   */
  drawTextOnCanvas(ctx, width, height, textInfo) {
    // Get both names from textInfo
    const name1 = textInfo.name1 || textInfo.text || '';
    const name2 = textInfo.name2 || textInfo.text2 || '';
    const subtitle = textInfo.subtitle || '';
        
    // Format text in "Name 1 & Name 2" format
    let formattedText = '';
    if (name1 && name2) {
      formattedText = name1.toUpperCase() + ' & ' + name2.toUpperCase();
    } else if (name1) {
      formattedText = name1.toUpperCase();
    } else if (name2) {
      formattedText = name2.toUpperCase();
    }
    
    // Calculate text length for font sizing
    const textLength = (name1.length + name2.length + (name1 && name2 ? 3 : 0));
    
    // Calculate usable width - use 80% of the canvas width to leave margin
    const usableWidth = width * 0.8;
    
    // Auto-fit text based on canvas width and text length
    const maxFontSize = 200;
    const calculatedFontSize = Math.floor(usableWidth / (textLength * 0.45));
    let scaledFontSize = Math.min(maxFontSize, calculatedFontSize);
    
    // Ensure minimum font size for readability
    const minFontSize = Math.max(30, Math.floor(width / 16));
    scaledFontSize = Math.max(minFontSize, scaledFontSize);
    
    // Now precisely calculate width for Name1 & Name2 format
    ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
    
    // Measure the exact width of each component
    const firstPartWidth = name1 ? ctx.measureText(name1.toUpperCase()).width : 0;
    const ampersandWidth = (name1 && name2) ? ctx.measureText(' & ').width : 0;
    const secondPartWidth = name2 ? ctx.measureText(name2.toUpperCase()).width : 0;
    const totalTextWidth = firstPartWidth + ampersandWidth + secondPartWidth;
    
    // Calculate the scaling factor needed to make text exactly 80% of canvas width
    const targetWidth = usableWidth;
    const scaleFactor = totalTextWidth ? (targetWidth / totalTextWidth) : 1;
    
    // Apply the scaling factor to font size
    scaledFontSize = Math.floor(scaledFontSize * scaleFactor);
    
    // Apply final bounds
    scaledFontSize = Math.max(minFontSize, Math.min(maxFontSize, scaledFontSize));
    
    this.log(`Font size calculation: ${scaledFontSize}px`);
    
    // Apply text settings
    ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
    ctx.fillStyle = textInfo.color || '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate letter spacing inversely proportional to font size
    const letterSpacingEm = Math.max(0.01, 0.04 - (scaledFontSize / 2000));
    
    // Do a test measurement to see if the text would fit within the usable width
    const maxFontWidth = width * 0.8;
    const testTextWidth = ctx.measureText(formattedText).width;
    if (testTextWidth > maxFontWidth) {
      // If it doesn't fit, recalculate font size to ensure it fits
      scaledFontSize = Math.floor(scaledFontSize * (maxFontWidth / testTextWidth));
      ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
    }
    
    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Calculate text position
    const x = width / 2;
    let y;
    
    // Position text based on textInfo.position setting
    if (textInfo.position === 'top') {
      y = height * 0.13; // Position at 13% from top
    } else if (textInfo.position === 'bottom') {
      y = height * 0.87; // Position at 87% from top
    } else {
      y = height * 0.5; // Center vertically
    }
    
    // Handle multi-line text
    const lines = formattedText.split('\n');
    const lineHeight = scaledFontSize * 1.2; // 1.2x line height
    
    if (lines.length > 1) {
      // For multi-line text, calculate the total height and position accordingly
      const totalTextHeight = lineHeight * lines.length;
      let startY;
      
      if (textInfo.position === 'top') {
        startY = y;
      } else if (textInfo.position === 'bottom') {
        startY = y - (totalTextHeight - lineHeight);
      } else {
        startY = y - (totalTextHeight / 2) + (lineHeight / 2);
      }
      
      // Draw each line
      lines.forEach((line, index) => {
        const lineY = startY + (index * lineHeight);
        ctx.fillText(line, x, lineY);
      });
    } else {
      // Single line handling with names
      if (name1 && name2) {
        // Handle the special case with ampersand between names
        const letterSpacingPx = scaledFontSize * letterSpacingEm;
        
        // Calculate the total width with adjusted spacing for name1
        let totalName1Width = 0;
        for (let i = 0; i < name1.length; i++) {
          totalName1Width += ctx.measureText(name1[i].toUpperCase()).width;
        }
        totalName1Width += letterSpacingPx * (name1.length - 1);
        
        // Calculate the total width with adjusted spacing for name2
        let totalName2Width = 0;
        for (let i = 0; i < name2.length; i++) {
          totalName2Width += ctx.measureText(name2[i].toUpperCase()).width;
        }
        totalName2Width += letterSpacingPx * (name2.length - 1);
        
        // Calculate total width for centering
        const ampersandWidth = ctx.measureText(' & ').width;
        const totalWidth = totalName1Width + ampersandWidth + totalName2Width;
        
        // Adjust font size if total width exceeds 80% of canvas width
        if (totalWidth > width * 0.8) {
          const scaleFactor = (width * 0.8) / totalWidth;
          scaledFontSize = Math.floor(scaledFontSize * scaleFactor);
          ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        }
        
        // Calculate starting position for left-aligned text that will be centered
        const startX = x - (totalWidth / 2);
        
        // Draw name1 with letter spacing
        let currentX = startX;
        for (let i = 0; i < name1.length; i++) {
          const char = name1[i].toUpperCase();
          const charWidth = ctx.measureText(char).width;
          ctx.fillText(char, currentX + (charWidth / 2), y);
          currentX += charWidth + letterSpacingPx;
        }
        
        // Draw ampersand
        ctx.fillText(' & ', currentX + (ampersandWidth / 2), y);
        currentX += ampersandWidth;
        
        // Draw name2 with letter spacing
        for (let i = 0; i < name2.length; i++) {
          const char = name2[i].toUpperCase();
          const charWidth = ctx.measureText(char).width;
          ctx.fillText(char, currentX + (charWidth / 2), y);
          currentX += charWidth + letterSpacingPx;
        }
      } else {
        // Single name
        ctx.fillText(formattedText, x, y);
      }
    }
    
    // Add subtitle if available
    if (subtitle) {
      const subtitleFontSize = scaledFontSize * 0.5; // Half the size of main text
      ctx.font = `700 ${subtitleFontSize}px 'Montserrat', Arial, sans-serif`;
      
      // Position subtitle below main text
      const subtitleY = y + (scaledFontSize * 0.7);
      ctx.fillText(subtitle, x, subtitleY);
    }
  }
  
  /**
   * Store the processed image for use during checkout
   * @param {string} imageDataUrl - The processed image data URL
   * @param {string} size - The selected size (S, M, or L)
   */
  storeProcessedImage(imageDataUrl, size) {
    this.log(`Storing processed non-watermarked image for size: ${size}`);
    
    try {
      // Map sizes to variant IDs (same as in ImageProcessingManager)
      const variantId = {
        'S': '54215893451100',  // Shopify variant ID for size S
        'M': '54215893483868',  // Shopify variant ID for size M
        'L': '54215893516636'   // Shopify variant ID for size L
      }[size];
      
      if (!variantId) {
        throw new Error(`Invalid size: ${size}`);
      }
      
      // Always store the non-watermarked image in window memory
      if (!window.cartoonique_unwatermarked_images) {
        window.cartoonique_unwatermarked_images = {};
      }
      window.cartoonique_unwatermarked_images[variantId] = imageDataUrl;
      
      // Try to store a reference in localStorage
      try {
        // Store a flag indicating non-watermarked image is available
        const cartImages = JSON.parse(localStorage.getItem('cartoonique_unwatermarked_images') || '{}');
        cartImages[variantId] = 'MEMORY_IMAGE_UNWATERMARKED:' + variantId;
        localStorage.setItem('cartoonique_unwatermarked_images', JSON.stringify(cartImages));
        
        // Store metadata with timestamp
        const metadata = {
          timestamp: Date.now(),
          size: size,
          variantId: variantId
        };
        localStorage.setItem('cartoonique_unwatermarked_metadata', JSON.stringify(metadata));
        
        this.log('Successfully stored non-watermarked image reference in localStorage');
      } catch (e) {
        this.log(`Could not store image reference in localStorage: ${e.message}`, 'warn');
      }
      
      // Dispatch an event to notify other components that the non-watermarked image is ready
      const event = new CustomEvent('non-watermarked-image-ready', {
        detail: {
          variantId: variantId,
          size: size,
          timestamp: Date.now()
        },
        bubbles: true
      });
      document.dispatchEvent(event);
      
      this.log('Successfully stored non-watermarked image and dispatched ready event');
    } catch (error) {
      this.log(`Error storing non-watermarked image: ${error.message}`, 'error');
    }
  }
}

// Initialize the processor when the DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!window.imageNonWatermarkedProcessor) {
    window.imageNonWatermarkedProcessor = new ImageNonWatermarkedProcessor();
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.imageNonWatermarkedProcessor) {
      window.imageNonWatermarkedProcessor = new ImageNonWatermarkedProcessor();
    }
  });
} 