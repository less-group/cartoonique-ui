/**
 * Image Processing Manager
 * 
 * This module manages the flow of image processing:
 * 1. Upload image to RunPod/Railway for stylization
 * 2. Show the image cropping interface immediately after upload
 * 3. Show the text overlay interface after cropping
 * 4. Show loading screen only if backend processing isn't complete
 * 5. Apply both cropping and text to the final stylized image
 */

class ImageProcessingManager {
  constructor() {
    // State variables
    this.originalFile = null;
    this.originalImageDataUrl = null;
    this.croppedImageDataUrl = null;
    this.railwayImageUrl = null;
    this.finalImageUrl = null;
    this.cropCoordinates = null;
    this.textFields = null;
    
    // Processing state flags
    this.fileLoaded = false;
    this.cropComplete = false;
    this.transformationStarted = false;
    this.transformationComplete = false;
    this.textProcessingComplete = false;
    this.finalProcessingComplete = false;
    this.resultPopupShown = false;
    
    // User customization state
    this.userSelectedStyle = 'pixarStyle';
    this.userSelectedFormat = 'portrait';
    
    // Current crop ratio (3/4 for 30x40 or 5/7 for 50x70)
    this.currentCropRatio = 3/4; // Default to 30x40
    
    // Store cropper instance
    this.imageCropper = null;
    
    // Load required CSS
    this.loadCss();
    
    // Setup event handlers
    this.setupEventListeners();
    
    // Try to find and setup the pixar component
    this.findAndSetupPixarComponent();
    
    // Make this instance globally available
    window.imageProcessingManager = this;
    
    console.log('Image Processing Manager initialized');
  }
  
  /**
   * Load the required CSS files
   */
  loadCss() {
    // Add the image cropper CSS if not already loaded
    if (!document.querySelector('link[href*="image-cropper.css"]')) {
      const cropperCss = document.createElement('link');
      cropperCss.rel = 'stylesheet';
      cropperCss.href = window.ASSET_BASE_URL 
        ? `${window.ASSET_BASE_URL}image-cropper.css` 
        : 'image-cropper.css';
      document.head.appendChild(cropperCss);
    }
    
    // Add Montserrat font to ensure it's available
    if (!document.getElementById('pixar-font-montserrat')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'pixar-font-montserrat';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap';
      document.head.appendChild(fontLink);
      console.log('Added Montserrat font for text styling');
    }
    
    // Add global CSS for text overlays
    if (!document.getElementById('pixar-global-text-css')) {
      const globalTextCss = document.createElement('style');
      globalTextCss.id = 'pixar-global-text-css';
      globalTextCss.textContent = `
        /* Ensure text overlays are always visible */
        .pixar-text-overlay,
        .pixar-text-fallback {
          position: absolute !important;
          z-index: 9999 !important;
          width: 100% !important;
          text-align: center !important;
          color: white !important;
          font-weight: 900 !important; /* Extra bold */
          font-size: 36px !important;
          font-family: 'Montserrat', 'Arial Black', sans-serif !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          text-shadow: 
            2px 2px 4px rgba(0,0,0,0.9),
            -2px -2px 4px rgba(0,0,0,0.9),
            2px -2px 4px rgba(0,0,0,0.9),
            -2px 2px 4px rgba(0,0,0,0.9) !important;
          padding: 0 10px !important;
          pointer-events: none !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          flex-direction: column !important;
        }
        
        /* Railway specific text positioning */
        .product-gallery__media .pixar-crop-wrapper .pixar-text-overlay,
        .product-gallery .pixar-crop-wrapper .pixar-text-overlay {
          bottom: 10% !important;
          left: 0 !important;
          right: 0 !important;
        }
        
        /* Ensure wrapper allows text to be visible */
        .pixar-crop-wrapper {
          overflow: visible !important;
          z-index: 10 !important;
        }

        /* Text line item styling with proper spacing */
        .pixar-text-line {
          width: 100% !important;
          text-align: center !important;
          margin: 2px 0 !important;
          letter-spacing: 0.05em !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
        }

        /* When there's an ampersand, give it special styling */
        .pixar-text-ampersand {
          display: inline-block !important;
          padding: 0 3px !important;
          vertical-align: middle !important;
        }
      `;
      document.head.appendChild(globalTextCss);
      console.log('Added global text overlay CSS');
    }
  }
  
  /**
   * Set up event listeners for all components
   */
  setupEventListeners() {
    // Listen for pixar component initialization
    document.addEventListener('DOMContentLoaded', () => {
      this.findAndSetupPixarComponent();
    });
    
    // For cases where DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(() => this.findAndSetupPixarComponent(), 100);
    }
    
    // Listen for crop applied/canceled events
    document.addEventListener('crop-applied', (event) => {
      console.log('Received crop-applied event');
      this.handleCropApplied(event);
    });
    
    document.addEventListener('crop-cancelled', () => {
      console.log('Received crop-cancelled event');
      this.handleCropCancelled();
    });
    
    // Listen for stylized image ready event
    document.addEventListener('pixar-transform-complete', (event) => {
      console.log('Received pixar-transform-complete event with data:', event.detail);
      this.handleTransformComplete(event);
    });
    
    // Listen for final processing complete event
    document.addEventListener('pixar-final-processing-complete', (event) => {
      console.log('Received pixar-final-processing-complete event with data:', event.detail);
      
      // Reset resultPopupShown flag to allow showing again for new sessions
      this.resultPopupShown = false;
      
      // Show the result popup with the processed image if it's not already showing
      if (event.detail && event.detail.imageUrl) {
        // Slightly delay to ensure loading popup is closed first
        setTimeout(() => {
          this.showResultPopup(event.detail.imageUrl);
        }, 100);
      }
    });
    
    // Track loading popup element - we'll use this to know when to hide it
    document.addEventListener('DOMContentLoaded', () => {
      const loadingPopup = document.getElementById('pixar-loading-popup');
      if (loadingPopup) {
        // Create a MutationObserver to detect when loading popup is about to be hidden
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              // Only prevent hiding if processing is active AND final processing is not complete
              // AND text processing is not complete
              if (loadingPopup.style.display === 'none' && 
                  this.isProcessing && 
                  !this.finalProcessingComplete &&
                  !this.textProcessingComplete) {
                console.log('LOADING POPUP: Preventing early hiding of loading popup while processing is active');
                loadingPopup.style.display = 'block';
              }
            }
          });
        });
        
        // Start observing the loading popup for style changes
        observer.observe(loadingPopup, { attributes: true });
      }
    });
    
    console.log('Event listeners set up');
  }
  
  /**
   * Find and set up the pixar transform file input component
   */
  findAndSetupPixarComponent() {
    // First try the Window reference if available
    if (window.pixarComponentReady && window.pixarComponent) {
      console.log('Pixar component found via global reference');
      this.pixarComponent = window.pixarComponent;
      this.setupPixarComponent(this.pixarComponent);
      return;
    }
    
    // Fallback to DOM query
    this.pixarComponent = document.querySelector('pixar-transform-file-input');
    
    if (!this.pixarComponent) {
      console.log('Pixar component not found yet, will try again later');
      
      // Listen for the custom event
      document.addEventListener('pixar-component-ready', (event) => {
        console.log('Received pixar-component-ready event');
        this.pixarComponent = event.detail.component;
        this.setupPixarComponent(this.pixarComponent);
      }, { once: true });
      
      // If component still not found after multiple attempts, create a fallback component
      if (!window.pixarComponentRetryCount) {
        window.pixarComponentRetryCount = 0;
      }
      
      window.pixarComponentRetryCount++;
      
      // After 5 retries, create a fallback component
      if (window.pixarComponentRetryCount >= 5) {
        console.log('Creating fallback pixar component after multiple retry attempts');
        
        // Create component if it doesn't exist
        if (!document.querySelector('pixar-transform-file-input')) {
          // Create and insert a new component
          const fallbackComponent = document.createElement('div');
          fallbackComponent.id = 'pixar-fallback-component';
          fallbackComponent.setAttribute('data-is-fallback', 'true');
          
          // Create the file input element
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.id = 'pixar-fallback-file-input';
          fileInput.style.display = 'none';
          
          // Add the file input to the component
          fallbackComponent.appendChild(fileInput);
          
          // Add the component to the page
          document.body.appendChild(fallbackComponent);
          
          // Set this as the pixar component
          this.pixarComponent = fallbackComponent;
          window.pixarComponent = fallbackComponent;
          window.pixarComponentReady = true;
          
          // Set up the component
          this.setupPixarComponent(fallbackComponent);
          
          // Dispatch event to notify others
          const event = new CustomEvent('pixar-component-ready', {
            detail: { component: fallbackComponent }
          });
          document.dispatchEvent(event);
          
          console.log('Fallback pixar component created and set up');
          return;
        }
      }
      
      // Try again
      setTimeout(() => this.findAndSetupPixarComponent(), 500);
      return;
    }
    
    console.log('Pixar component found, setting up');
    this.setupPixarComponent(this.pixarComponent);
  }
  
  /**
   * Setup the pixar component once found
   * @param {HTMLElement} component - The pixar component to set up
   */
  setupPixarComponent(component) {
    console.log('Setting up Pixar component:', component);
    
    // Hook into the original file input event
    const fileInputs = component.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      // Store the original change handler if it exists
      const originalOnChange = input.onchange;
      
      // Set our new handler that will trigger the original one
      input.onchange = (event) => {
        // Handle with our code first
        this.handleFileSelected(event);
        
        // Then call the original handler if it exists
        if (typeof originalOnChange === 'function') {
          originalOnChange.call(input, event);
        }
      };
    });
    
    // Dispatch event to notify other systems
    document.dispatchEvent(new CustomEvent('pixar-component-setup-complete', {
      detail: { component: component }
    }));
  }
  
  /**
   * Handle when a file is selected from the input
   * @param {Event} event - The file input change event
   */
  handleFileSelected(event) {
    console.log('ImageProcessingManager.handleFileSelected called', event);
    
    // Handle both direct file objects and event.target.files
    let file = null;
    
    if (event instanceof File) {
      // Handle direct file object
      file = event;
      console.log('Received direct File object');
    } else if (event.detail && event.detail.file instanceof File) {
      // Handle custom event with file in detail
      file = event.detail.file;
      console.log('Received File from event.detail');
    } else if (event.target && event.target.files && event.target.files.length) {
      // Handle standard file input event
      file = event.target.files[0];
      console.log('Received File from event.target.files');
    } else {
      console.error('No valid file found in the event or argument');
      return;
    }
    
    // Store the original file
    this.originalFile = file;
    console.log('File selected:', this.originalFile.name, this.originalFile.type, this.originalFile.size);
    
    // Reset crop and text processing flags
    this.cropComplete = false;
    this.textProcessingComplete = false;
    
    // IMPORTANT: Send the original file to Railway immediately for processing in the background
    // while the user is doing cropping and text editing
    if (typeof window.processImageWithRunPod === 'function' && this.originalFile) {
      console.log('🖼️ Immediately sending original image to Railway for processing in the background via global function');
      // Pass isOriginal: true to indicate this is the uncropped image
      window.processImageWithRunPod(this.originalFile, { isOriginal: true });
    } else {
      console.log('🖼️ Global processImageWithRunPod not available, using centralized method');
      // Use our centralized method instead of implementing API call here
      this.sendImageToRailway(this.originalFile, { isOriginal: true })
        .then(result => {
          if (result.alreadyProcessing) {
            console.log('🖼️ File is already being processed, no need to send again');
          } else {
            console.log(`🖼️ File sent to Railway, job ID: ${result.jobId}`);
          }
        })
        .catch(error => {
          console.error('🖼️ Error sending file to Railway:', error);
        });
    }
    
    // Convert file to data URL for later use
    const reader = new FileReader();
    reader.onload = (e) => {
      this.originalImageDataUrl = e.target.result;
      console.log('File converted to data URL, length:', this.originalImageDataUrl.length);
      
      // Hide the instructions popup if it's visible
      const instructionsPopup = document.getElementById('pixar-instructions-popup');
      if (instructionsPopup) {
        instructionsPopup.style.display = 'none';
      }
      
      // Show the image cropper immediately after upload
      this.showImageCropper();
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsDataURL(this.originalFile);
  }
  
  /**
   * Show the image cropper interface
   */
  showImageCropper() {
    console.log('Showing image cropper');
    
    // Note: We don't hide the loading popup here immediately anymore
    // Let the calling methods handle hiding the popup with the appropriate timing
    
    // Initialize image cropper if not already created
    if (!this.imageCropper) {
      console.log('Creating new ImageCropper instance');
      this.imageCropper = new ImageCropper({
        aspectRatio: 3/4 // Default to 30x40 ratio for vertical canvas
      });
    } else {
      console.log('Using existing ImageCropper instance');
    }
    
    // Validate we have an image
    if (!this.originalImageDataUrl) {
      console.error('No image data URL available to load into cropper');
      return;
    }
    
    console.log('Loading image into cropper, data URL length:', this.originalImageDataUrl.length);
    
    // Create a queue system to ensure processing happens in order
    const processImage = () => {
      // Ensure the DOM is fully loaded and rendered
      if (document.readyState !== 'complete') {
        console.log('Document not ready yet, waiting before initializing cropper...');
        setTimeout(processImage, 300);
        return;
      }
      
      // Now we can hide the loading popup if it's visible
      const loadingPopup = document.getElementById('pixar-loading-popup');
      if (loadingPopup && loadingPopup.style.display === 'block') {
        loadingPopup.style.display = 'none';
      }
      
      // Load the original image into the cropper
      this.imageCropper.loadImage(this.originalImageDataUrl)
        .then(() => {
          console.log('Image successfully loaded into cropper');
        })
        .catch(error => {
          console.error('Error loading image into cropper:', error);
          
          // Fallback approach if loading fails
          if (this.originalFile) {
            console.log('Trying fallback: loading file directly instead of data URL');
            this.imageCropper.loadImage(this.originalFile)
              .then(() => console.log('Fallback image loading successful'))
              .catch(err => console.error('Fallback image loading also failed:', err));
          }
        });
    };
    
    // Start the process
    processImage();
  }
  
  /**
   * Handle when a crop is applied
   * @param {CustomEvent} event - The crop-applied event
   */
  handleCropApplied(event) {
    console.log('Crop applied, event:', event);
    
    // Save the crop coordinates and cropped image
    if (event.detail && event.detail.cropCoordinates) {
      // Create temporary image to get the original dimensions
      const tempImg = new Image();
      tempImg.src = this.originalImageDataUrl;
      
      // Store a clone of the crop coordinates to avoid reference issues
      this.cropCoordinates = {
        x: event.detail.cropCoordinates.x,
        y: event.detail.cropCoordinates.y,
        width: event.detail.cropCoordinates.width,
        height: event.detail.cropCoordinates.height,
        // Store the original image dimensions for later scaling calculations
        originalImageWidth: tempImg.width || 800,
        originalImageHeight: tempImg.height || 600
      };
      console.log('Crop coordinates saved with original dimensions:', JSON.stringify(this.cropCoordinates));
    } else {
      console.warn('No crop coordinates in event');
    }
    
    // Store the cropped image preview
    if (event.detail && event.detail.croppedImage) {
      this.croppedImageDataUrl = event.detail.croppedImage;
      console.log('Cropped image preview saved, length:', this.croppedImageDataUrl ? this.croppedImageDataUrl.length : 0);
    }
    
    // Mark crop as complete
    this.cropComplete = true;
    console.log('Crop marked as complete');
    
    // Hide any loading popup that might be showing
    const loadingPopup = document.getElementById('pixar-loading-popup');
    if (loadingPopup && loadingPopup.style.display === 'block') {
      console.log('Hiding loading popup after crop is applied');
      loadingPopup.style.display = 'none';
    }
    
    // Short delay to ensure the loading popup is fully hidden before showing text overlay
    setTimeout(() => {
      // Show the existing text overlay functionality if it exists
      this.showTextOverlay();
      
      // If we already received the result from Railway, process it now
      if (this.transformationComplete && this.textProcessingComplete) {
        console.log('Railway image already received, applying crop immediately');
        this.applyFinalProcessing();
      }
    }, 50);
  }
  
  /**
   * Handle when a crop is cancelled
   */
  handleCropCancelled() {
    console.log('Crop cancelled');
    
    // Use the original image without cropping
    this.croppedImageDataUrl = this.originalImageDataUrl;
    
    // Mark crop as complete
    this.cropComplete = true;
    
    // Set default crop to center of the image (for proper aspect ratio)
    // This ensures we still maintain the proper aspect ratio even when cropping is cancelled
    const tempImg = new Image();
    tempImg.onload = () => {
      const width = tempImg.width;
      const height = tempImg.height;
      
      // Get the current aspect ratio from the cropper
      const targetRatio = this.imageCropper ? this.imageCropper.options.aspectRatio : 3/4; // Default to 30x40 if cropper not available
      console.log(`Using aspect ratio: ${targetRatio} for default crop`);
      
      let cropWidth, cropHeight;
      if (width / height > targetRatio) {
        // Image is wider than target ratio
        cropHeight = height;
        cropWidth = cropHeight * targetRatio;
      } else {
        // Image is taller than target ratio
        cropWidth = width;
        cropHeight = cropWidth / targetRatio;
      }
      
      // Center the crop
      const cropX = (width - cropWidth) / 2;
      const cropY = (height - cropHeight) / 2;
      
      // Store the crop coordinates
      this.cropCoordinates = {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      };
      
      console.log('Default crop coordinates applied:', this.cropCoordinates);
      
      // Show the existing text overlay functionality
      this.showTextOverlay();
      
      // If we already received the result from Railway, process it now
      if (this.transformationComplete && this.textProcessingComplete) {
        this.applyFinalProcessing();
      }
    };
    
    // Set source to trigger onload
    tempImg.src = this.originalImageDataUrl;
  }
  
  /**
   * Show the existing text overlay interface
   */
  showTextOverlay() {
    console.log('Showing text overlay');
    
    // Ensure crop is complete before showing text overlay
    if (!this.cropComplete) {
      console.warn('Cannot show text overlay before crop is complete');
      return;
    }
    
    // Hide loading popup before showing text overlay
    const loadingPopup = document.getElementById('pixar-loading-popup');
    if (loadingPopup && loadingPopup.style.display === 'block') {
      console.log('Hiding loading popup before showing text overlay');
      loadingPopup.style.display = 'none';
    }
    
    // Look for the existing text overlay functionality
    if (window.pixarTextManager || window.PixarTextManager) {
      // Access the text manager, create it if needed
      let textManager = window.pixarTextManager;
      if (!textManager && window.PixarTextManager) {
        console.log('Creating new PixarTextManager instance');
        textManager = window.pixarTextManager = new window.PixarTextManager();
      }
      
      if (textManager) {
        try {
          console.log('Text manager found, converting cropped image to file');
          if (!this.croppedImageDataUrl) {
            console.error('ERROR: No cropped image data URL available');
            throw new Error('No cropped image data URL available');
          }
          
          // Convert data URL to Blob/File for text manager
          const blob = this.dataURLToBlob(this.croppedImageDataUrl);
          const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
          
          // Set flag to track text editing state
          textManager.isEditing = true;
          
          // Add subtitle field to the text manager if it doesn't already have one
          if (!textManager.hasSubtitleField) {
            this.addSubtitleFieldToTextManager(textManager);
          }
          
          // Check if user selected a specific crop ratio, especially 50x70
          const selectedRatio = this.imageCropper ? this.imageCropper.options.aspectRatio : 3/4;
          const is5070Selected = Math.abs(selectedRatio - 5/7) < 0.01; // Check if close to 5/7 ratio (50x70)
          
          console.log(`Using crop ratio: ${selectedRatio}, 50x70 selected: ${is5070Selected}`);
          
          // Store current crop selection for later use
          this.currentCropRatio = selectedRatio;
          
          // Pass the cropped image to be displayed in the "Add your names" popup
          console.log('Showing text dialog with cropped image');
          
          // Show the text dialog with cropped image
          textManager.showTextDialog(file).then(completed => {
            textManager.isEditing = false;
            
            if (completed) {
              // Only save if there are names provided (allow using just one name)
              if (textManager.names.name1 || textManager.names.name2) {
                // Capture more detailed text information
                const textPosition = textManager.textPosition || 'bottom';
                const fontSize = textManager.fontSize || '32px';
                const fontFamily = textManager.fontFamily || 'Arial, sans-serif';
                const color = textManager.textColor || '#FFFFFF';
                const positionPercentage = textManager.positionPercentage || 
                  (textPosition === 'top' ? 10 : textPosition === 'bottom' ? 90 : 50);
                
                // Calculate the dimensions of the cropped image to store relative positioning
                const croppedImg = new Image();
                croppedImg.src = this.croppedImageDataUrl;
                const croppedWidth = croppedImg.width || this.cropCoordinates.width;
                const croppedHeight = croppedImg.height || this.cropCoordinates.height;
                
                // Text was added - save more detailed positioning data
                this.textFields = {
                  text: textManager.names.name1 || '',
                  text2: textManager.names.name2 || '',
                  subtitle: textManager.names.subtitle || '',
                  position: textPosition,
                  positionPercentage: positionPercentage,
                  fontSize: fontSize,
                  fontFamily: fontFamily,
                  color: color,
                  // Store coordinates relative to the cropped image to maintain position
                  relativeCoordinates: {
                    x: croppedWidth / 2, // Center horizontally
                    y: textPosition === 'top' ? croppedHeight * 0.1 : 
                       textPosition === 'bottom' ? croppedHeight * 0.9 : 
                       croppedHeight / 2,
                    // Store the cropped image dimensions for scaling
                    croppedImageWidth: croppedWidth,
                    croppedImageHeight: croppedHeight
                  }
                };
                
                console.log('TEXT OVERLAY: Text information captured:', this.textFields);
                console.log('TEXT OVERLAY: Cropped dimensions for text:', croppedWidth, 'x', croppedHeight);
              } else {
                console.log('TEXT OVERLAY: No text provided.');
                // Clear any existing text fields
                this.textFields = null;
              }
            }
            
            // Mark text processing as complete
            this.textProcessingComplete = true;
            
            // Check if the transformation completed while editing text
            if (this.transformationComplete) {
              this.applyFinalProcessing();
            } else {
              // Show loading until transform completes
              const loadingPopup = document.getElementById('pixar-loading-popup');
              if (loadingPopup) {
                loadingPopup.style.display = 'block';
              }
            }
          });
        } catch (error) {
          console.error('Error showing text overlay:', error);
          textManager.isEditing = false;
          
          // Mark text processing as complete
          this.textProcessingComplete = true;
          
          // If there's an error, just proceed without text
          if (this.transformationComplete) {
            this.applyFinalProcessing();
          } else {
            // Show loading until transform completes
            const loadingPopup = document.getElementById('pixar-loading-popup');
            if (loadingPopup) {
              loadingPopup.style.display = 'block';
            }
          }
        }
      }
    } else {
      console.warn('Text manager not found, skipping text overlay step');
      
      // Mark text processing as complete
      this.textProcessingComplete = true;
      
      // No text manager found, proceed to final step or show loading
      if (this.transformationComplete) {
        this.applyFinalProcessing();
      } else {
        // Show loading until transform completes
        const loadingPopup = document.getElementById('pixar-loading-popup');
        if (loadingPopup) {
          loadingPopup.style.display = 'block';
        }
      }
    }
  }
  
  /**
   * Add subtitle field to the text manager
   * @param {Object} textManager - The text manager instance
   */
  addSubtitleFieldToTextManager(textManager) {
    // Flag to prevent adding the field multiple times
    textManager.hasSubtitleField = true;
    
    // Store original showTextDialog method
    const originalShowTextDialog = textManager.showTextDialog;
    
    // Override showTextDialog method to add subtitle field
    textManager.showTextDialog = function(file) {
      // Call original method to initialize dialog
      return originalShowTextDialog.call(this, file).then(result => {
        // After the dialog is shown, inject subtitle field
        const dialogContainer = document.querySelector('.pixar-text-dialog');
        if (dialogContainer) {
          // Find the Apply/Cancel buttons to insert before them
          const buttonsRow = dialogContainer.querySelector('.pixar-text-buttons');
          
          // Check if subtitle field already exists
          if (!dialogContainer.querySelector('#pixar-subtitle-input')) {
            // Create subtitle field container
            const subtitleRow = document.createElement('div');
            subtitleRow.className = 'pixar-text-input-row subtitle-row';
            subtitleRow.style.marginTop = '15px';
            subtitleRow.style.marginBottom = '15px';
            
            // Create label
            const subtitleLabel = document.createElement('label');
            subtitleLabel.textContent = 'Subtitle';
            subtitleLabel.htmlFor = 'pixar-subtitle-input';
            subtitleLabel.style.display = 'block';
            subtitleLabel.style.marginBottom = '5px';
            subtitleLabel.style.fontWeight = 'bold';
            
            // Create input field
            const subtitleInput = document.createElement('input');
            subtitleInput.type = 'text';
            subtitleInput.id = 'pixar-subtitle-input';
            subtitleInput.className = 'pixar-text-input';
            subtitleInput.placeholder = 'based on a true story - your text here';
            subtitleInput.value = this.names.subtitle || '';
            subtitleInput.style.width = '100%';
            subtitleInput.style.padding = '8px';
            subtitleInput.style.marginBottom = '10px';
            subtitleInput.style.borderRadius = '4px';
            subtitleInput.style.border = '1px solid #ddd';
            subtitleInput.maxLength = 35; // Hard limit on character count
            subtitleInput.style.overflow = 'hidden';
            subtitleInput.style.textOverflow = 'ellipsis';
            
            // Create character counter/warning element
            const subtitleCharCounter = document.createElement('div');
            subtitleCharCounter.id = 'pixar-subtitle-char-counter';
            subtitleCharCounter.style.fontSize = '12px';
            subtitleCharCounter.style.color = '#666';
            subtitleCharCounter.style.marginTop = '5px';
            subtitleCharCounter.style.display = 'none';
            
            // Create warning message
            const warningMessage = document.createElement('div');
            warningMessage.id = 'pixar-subtitle-warning';
            warningMessage.style.fontSize = '12px';
            warningMessage.style.color = '#e74c3c';
            warningMessage.style.marginTop = '5px';
            warningMessage.style.display = 'none';
            warningMessage.textContent = 'Subtitle may be truncated or wrapped on the final image';
            
            // Add change event to update names object and check character count
            subtitleInput.addEventListener('input', (e) => {
              const maxChars = 35; // Maximum recommended characters
              const text = e.target.value;
              this.names.subtitle = text;
              
              // Display character count if approaching limit
              if (text.length > (maxChars * 0.7)) {
                subtitleCharCounter.style.display = 'block';
                subtitleCharCounter.textContent = `${text.length}/${maxChars} characters`;
                
                // Change color based on length
                if (text.length > maxChars) {
                  subtitleCharCounter.style.color = '#e74c3c'; // Red for over limit
                  warningMessage.style.display = 'block';
                } else if (text.length > (maxChars * 0.9)) {
                  subtitleCharCounter.style.color = '#e67e22'; // Orange for close to limit
                  warningMessage.style.display = 'block';
                } else {
                  subtitleCharCounter.style.color = '#666'; // Default gray
                  warningMessage.style.display = 'none';
                }
              } else {
                subtitleCharCounter.style.display = 'none';
                warningMessage.style.display = 'none';
              }
              
              // Add a visual indicator if text is too long
              if (text.length > maxChars) {
                subtitleInput.style.borderColor = '#e74c3c';
              } else {
                subtitleInput.style.borderColor = '#ddd';
              }
            });
            
            // Add preview text that shows how subtitle will look
            const subtitlePreview = document.createElement('div');
            subtitlePreview.id = 'pixar-subtitle-preview';
            subtitlePreview.style.marginTop = '8px';
            subtitlePreview.style.padding = '5px';
            subtitlePreview.style.backgroundColor = 'rgba(0,0,0,0.1)';
            subtitlePreview.style.borderRadius = '4px';
            subtitlePreview.style.textAlign = 'center';
            subtitlePreview.style.fontStyle = 'italic';
            subtitlePreview.style.fontSize = '14px';
            subtitlePreview.style.lineHeight = '1.2';
            subtitlePreview.style.maxWidth = '100%';
            subtitlePreview.style.wordWrap = 'break-word';
            subtitlePreview.style.whiteSpace = 'normal';
            subtitlePreview.style.display = 'none';
            subtitlePreview.style.overflowWrap = 'break-word';
            subtitlePreview.style.hyphens = 'auto';
            subtitlePreview.style.maxHeight = '3.6em'; // Limit to 3 lines
            subtitlePreview.style.overflow = 'hidden';
            
            // Update preview with subtitle
            subtitleInput.addEventListener('input', () => {
              const text = subtitleInput.value.trim();
              if (text) {
                subtitlePreview.textContent = text;
                subtitlePreview.style.display = 'block';
              } else {
                subtitlePreview.style.display = 'none';
              }
            });
            
            // Append elements to container
            subtitleRow.appendChild(subtitleLabel);
            subtitleRow.appendChild(subtitleInput);
            subtitleRow.appendChild(subtitleCharCounter);
            subtitleRow.appendChild(warningMessage);
            subtitleRow.appendChild(subtitlePreview);
            
            // Insert before buttons
            if (buttonsRow && buttonsRow.parentNode) {
              buttonsRow.parentNode.insertBefore(subtitleRow, buttonsRow);
            } else {
              // Fallback - append to dialog
              dialogContainer.appendChild(subtitleRow);
            }
            
            // Initialize preview if there's existing text
            if (this.names.subtitle) {
              subtitlePreview.textContent = this.names.subtitle;
              subtitlePreview.style.display = 'block';
              
              // Check character count for existing text
              const maxChars = 35;
              if (this.names.subtitle.length > (maxChars * 0.7)) {
                subtitleCharCounter.style.display = 'block';
                subtitleCharCounter.textContent = `${this.names.subtitle.length}/${maxChars} characters`;
                
                if (this.names.subtitle.length > maxChars) {
                  subtitleCharCounter.style.color = '#e74c3c';
                  subtitleInput.style.borderColor = '#e74c3c';
                  warningMessage.style.display = 'block';
                } else if (this.names.subtitle.length > (maxChars * 0.9)) {
                  subtitleCharCounter.style.color = '#e67e22';
                  warningMessage.style.display = 'block';
                }
              }
            }
            
            // Additionally, let's fix the display in the image preview
            // Find the subtitle in the existing preview
            const previewSubtitle = dialogContainer.querySelector('.pixar-subtitle-overlay');
            if (!previewSubtitle && this.names.subtitle) {
              // If subtitle overlay doesn't exist but we have subtitle text, create it
              const imagePreview = dialogContainer.querySelector('.pixar-preview-image');
              if (imagePreview) {
                const previewContainer = imagePreview.parentElement;
                if (previewContainer) {
                  // Create a subtitle overlay element
                  const subtitleOverlay = document.createElement('div');
                  subtitleOverlay.className = 'pixar-subtitle-overlay';
                  subtitleOverlay.style.position = 'absolute';
                  subtitleOverlay.style.bottom = '15%';
                  subtitleOverlay.style.left = '0';
                  subtitleOverlay.style.right = '0';
                  subtitleOverlay.style.textAlign = 'center';
                  subtitleOverlay.style.color = 'white';
                  subtitleOverlay.style.fontStyle = 'italic';
                  subtitleOverlay.style.fontSize = '14px';
                  subtitleOverlay.style.fontWeight = 'normal';
                  subtitleOverlay.style.textShadow = '2px 2px 3px rgba(0,0,0,0.7)';
                  subtitleOverlay.style.zIndex = '10';
                  subtitleOverlay.style.maxWidth = '90%';
                  subtitleOverlay.style.margin = '0 auto';
                  subtitleOverlay.style.wordWrap = 'break-word';
                  subtitleOverlay.style.overflow = 'hidden';
                  subtitleOverlay.style.maxHeight = '2.4em'; // Limit to 2 lines 
                  
                  // Set text content
                  subtitleOverlay.textContent = this.names.subtitle;
                  
                  // Append to preview container
                  previewContainer.style.position = 'relative';
                  previewContainer.appendChild(subtitleOverlay);
                  
                  // Update subtitle overlay when subtitle changes
                  subtitleInput.addEventListener('input', () => {
                    subtitleOverlay.textContent = subtitleInput.value.trim();
                  });
                }
              }
            } else if (previewSubtitle) {
              // If subtitle overlay exists, make sure it has the correct styling
              previewSubtitle.style.maxWidth = '90%';
              previewSubtitle.style.margin = '0 auto';
              previewSubtitle.style.wordWrap = 'break-word';
              previewSubtitle.style.overflow = 'hidden';
              previewSubtitle.style.maxHeight = '2.4em'; // Limit to 2 lines
              
              // Update subtitle overlay when subtitle changes
              subtitleInput.addEventListener('input', () => {
                previewSubtitle.textContent = subtitleInput.value.trim();
              });
            }
            
            console.log('Added subtitle field to text dialog');
          }
        }
        
        return result;
      });
    };
    
    // Initialize names object if needed
    if (!textManager.names) {
      textManager.names = {};
    }
    
    // Add subtitle property
    if (!textManager.names.hasOwnProperty('subtitle')) {
      textManager.names.subtitle = '';
    }
    
    console.log('Subtitle field functionality added to text manager');
  }
  
  /**
   * Convert a data URL to a Blob
   * @param {string} dataURL - The data URL to convert
   * @returns {Blob} - The resulting Blob
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
   * Handle when the pixar transformation is complete
   * @param {CustomEvent} event - The pixar-transform-complete event
   */
  handleTransformComplete(event) {
    if (!event.detail || !event.detail.imageUrl) {
      console.error('TRANSFORM COMPLETE: Invalid event, missing imageUrl:', event);
      return;
    }
    
    const imageUrl = event.detail.imageUrl;
    const isRailwayUrl = imageUrl.includes('railway.app');
    
    console.log('TRANSFORM COMPLETE: Received ' + (isRailwayUrl ? 'RAILWAY' : 'non-Railway') + ' image:', imageUrl);
    
    // Store the stylized image URL
    this.stylizedImageUrl = imageUrl;
    this.transformationComplete = true;
    
    // IMPORTANT: Do NOT update product gallery image here.
    // We need to wait until cropping and text are applied.
    
    // Check if we're still in text editing
    if (window.pixarTextManager && window.pixarTextManager.isEditing) {
      console.log('TRANSFORM COMPLETE: Text editing still in progress, will apply processing when complete');
      return;
    }
    
    // If this is a Railway URL and we've never run the crop step, show the cropper now
    if (isRailwayUrl && !this.cropComplete && this.originalImageDataUrl) {
      console.log('TRANSFORM COMPLETE: Railway image received but crop not complete, showing cropper');
      
      // Keep loading screen visible for a moment before showing cropper
      setTimeout(() => {
        // Hide loading popup to show cropper
        const loadingPopup = document.getElementById('pixar-loading-popup');
        if (loadingPopup) {
          loadingPopup.style.display = 'none';
        }
        this.showImageCropper();
      }, 300);
      return;
    }
    
    // Check if we've completed the user interaction flow (cropping and text)
    if (this.cropComplete && this.textProcessingComplete) {
      // If we have an originalProcessedImageUrl from the first Railway call, use that instead
      if (window.originalProcessedImageUrl) {
        console.log('TRANSFORM COMPLETE: Using pre-processed image from earlier Railway call');
        this.stylizedImageUrl = window.originalProcessedImageUrl;
      }
      
      // Apply final processing if both crop and text steps are done
      console.log('TRANSFORM COMPLETE: Both crop and text are complete, applying final processing');
      
      // Add small delay to ensure all data is ready
      setTimeout(() => this.applyFinalProcessing(), 100);
    } else if (this.cropComplete) {
      // If crop is complete but text isn't, continue with text process
      console.log('TRANSFORM COMPLETE: Crop is complete, proceeding with text processing');
      this.showTextOverlay();
    } else {
      console.log('TRANSFORM COMPLETE: Waiting for user to complete cropping before applying final processing');
      
      // Crop not yet complete, ensure the loading popup is hidden
      // so user can continue with the crop step
      const loadingPopup = document.getElementById('pixar-loading-popup');
      if (loadingPopup && loadingPopup.style.display === 'block') {
        console.log('TRANSFORM COMPLETE: Hiding loading popup to allow user to complete cropping');
        
        // Add a small delay before hiding the popup
        setTimeout(() => {
          loadingPopup.style.display = 'none';
        }, 300);
      }
      
      // If user canceled out of crop step, we need to make sure to show it again
      // This prevents a stuck state where user gets no UI
      if (!this.imageCropper || !this.imageCropper.isVisible()) {
        console.log('TRANSFORM COMPLETE: Image cropper not visible, showing it again');
        setTimeout(() => this.showImageCropper(), 400);
      }
    }
  }
  
  /**
   * Apply final processing to image after both crop and text completion
   */
  applyFinalProcessing() {
    console.log('FINAL PROCESSING: Applying to RAILWAY image:', this.stylizedImageUrl);
    
    try {
      // Use the crop coordinates relative to original image
      console.log('FINAL PROCESSING: Using crop coordinates:', this.cropCoordinates);
      
      // Take different paths based on whether this is direct vs Railway
      if (this.stylizedImageUrl) {
        // RAILWAY / API path - use CSS cropping and text overlays
        console.log('FINAL PROCESSING: Using CSS-based cropping for Railway image');
        console.log('FINAL PROCESSING: Text info stored:', this.textInfo ? 'Yes' : 'No');
      
        // First apply crop styling and update product image
        this.applyRailwayCropStyling();
        
        // Add text after the Railway image is loaded and cropped
        if (this.textInfo) {
          // Add text after we've cropped and loaded the image
          this.addTextToRailwayImage(this.stylizedImageUrl);
        } else {
          // If no text to add, dispatch the final processing event right away
          // since we've already updated the product image
          const finalEvent = new CustomEvent('pixar-final-processing-complete', {
            detail: { 
              imageUrl: this.stylizedImageUrl,
              timestamp: Date.now()
            }
          });
          document.dispatchEvent(finalEvent);
          
          // Hide any loading popup that might still be visible
          this.hideLoadingPopup();
        }
      } else {
        console.error('FINAL PROCESSING: No stylized image URL to process');
        
        // Hide any loading popup that might still be visible
        this.hideLoadingPopup();
      }
    } catch (error) {
      console.error('FINAL PROCESSING: Error applying final processing:', error);
      
      // Hide any loading popup that might still be visible in case of error
      this.hideLoadingPopup();
    }
  }
  
  /**
   * Helper method to hide any loading popup that might be visible
   */
  hideLoadingPopup() {
    const loadingPopup = document.getElementById('pixar-loading-popup');
    // Check if the loading popup exists and is visible
    if (loadingPopup && loadingPopup.style.display !== 'none') {
      // Only check processing status if we're not in final completion state
      if (this.finalProcessingComplete) {
        console.log('🖼️ Forcing loading popup to close because final processing is complete');
        loadingPopup.style.display = 'none';
        document.body.style.overflow = '';
        
        // Show the result popup if processing is complete
        if (this.finalImageUrl || this.stylizedImageUrl) {
          this.showResultPopup(this.finalImageUrl || this.stylizedImageUrl);
        }
      } else if (!this.isProcessing) {
        console.log('🖼️ Hiding loading popup after processing');
        loadingPopup.style.display = 'none';
        document.body.style.overflow = '';
      } else {
        console.log('⚠️ Loading popup hide attempt while processing is still active - checking status');
        // Check if we're in a state where we should allow hiding anyway
        if (this.textProcessingComplete) {
          console.log('🖼️ Text processing is complete, allowing popup to close even though isProcessing is true');
          this.isProcessing = false; // Force processing to be considered complete
          loadingPopup.style.display = 'none';
          document.body.style.overflow = '';
          
          // Show the result popup if we're now complete
          if (this.finalProcessingComplete && (this.finalImageUrl || this.stylizedImageUrl)) {
            this.showResultPopup(this.finalImageUrl || this.stylizedImageUrl);
          }
        }
      }
    }
  }
  
  /**
   * Show the result popup with the processed image
   * @param {string} imageUrl - The URL of the processed image to display
   */
  showResultPopup(imageUrl) {
    console.log('RESULT POPUP: Showing result popup with image:', imageUrl);
    
    // Prevent showing multiple times
    if (this.resultPopupShown) {
      console.log('RESULT POPUP: Already shown, not showing again');
      return;
    }
    
    this.resultPopupShown = true;
    
    // Store the original image URL for aspect ratio adjustments
    this.resultImageUrl = imageUrl;
    
    // Define aspect ratios for each size
    this.sizeAspectRatios = {
      'S': 20/30, // 20x30"
      'M': 30/40, // 30x40"
      'L': 50/70  // 50x70"
    };
    
    // Default selected size
    this.selectedSize = 'S';
    
    // Check if popup already exists
    let resultPopup = document.getElementById('pixar-result-popup');
    
    // Create the popup if it doesn't exist
    if (!resultPopup) {
      resultPopup = document.createElement('div');
      resultPopup.id = 'pixar-result-popup';
      resultPopup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.98);
        z-index: 99999999;
        display: none;
        overflow: auto;
        padding: 20px;
        box-sizing: border-box;
      `;
      
      // Add content to the result popup
      resultPopup.innerHTML = `
        <div style="position: relative; max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; height: calc(100vh - 40px); max-height: 800px;">
          <div id="pixar-result-image-container" style="flex: 1; min-height: 0; margin: 0 auto; width: 100%; max-width: 400px; position: relative; display: flex; align-items: center; justify-content: center; padding: 10px;">
            <div id="pixar-image-shadow" style="position: absolute; top: 15px; left: 15px; right: 15px; bottom: 5px; border-radius: 8px; background: #f5f5f5; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 0;"></div>
            <img id="pixar-result-image" src="" alt="Processed image" style="position: relative; z-index: 1; max-width: 100%; max-height: 100%; display: block; object-fit: contain; transition: all 0.3s ease-in-out; border-radius: 8px; background: white;">
            <div id="pixar-result-image-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; z-index: 2;"></div>
          </div>
          
          <!-- Fixed position controls container -->
          <div style="flex-shrink: 0; margin-top: 15px;">
            <!-- Size selection menu -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin: 0 auto; max-width: 90%;">
                <!-- Size S -->
                <div data-size="S" style="flex: 1; margin: 0 5px; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; background-color: #f0f5fb; transition: all 0.2s ease-in-out;">
                  <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: bold; font-size: 18px;">S</div>
                  <div style="font-weight: bold; margin-top: 5px; font-size: 16px;">$85</div>
                  <div style="font-size: 12px; color: #666; margin-top: 3px;">20x30"</div>
                </div>
                
                <!-- Size M -->
                <div data-size="M" style="flex: 1; margin: 0 5px; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; transition: all 0.2s ease-in-out;">
                  <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: bold; font-size: 18px;">M</div>
                  <div style="font-weight: bold; margin-top: 5px; font-size: 16px;">$130</div>
                  <div style="font-size: 12px; color: #666; margin-top: 3px;">30x40"</div>
                </div>
                
                <!-- Size L -->
                <div data-size="L" style="flex: 1; margin: 0 5px; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; transition: all 0.2s ease-in-out;">
                  <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: bold; font-size: 18px;">L</div>
                  <div style="font-weight: bold; margin-top: 5px; font-size: 16px;">$190</div>
                  <div style="font-size: 12px; color: #666; margin-top: 3px;">50x70"</div>
                </div>
              </div>
              
              <h4 style="text-align: center; font-size: 16px; margin-top: 10px; margin-bottom: 5px; color: #333; font-weight: bold; text-transform: uppercase;">Choose the size</h4>
              
              <div style="text-align: center; margin-top: 5px;">
                <a href="#" style="color: #4a7dbd; text-decoration: underline; font-size: 12px;">Size guide</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
              <button id="pixar-result-continue" style="background-color: #4a7dbd; color: white; padding: 12px 25px; font-size: 16px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; margin: 0 10px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: background-color 0.2s ease-in-out;">CONTINUE</button>
            </div>
          </div>
        </div>
      `;
      
      // Add the popup to the document body
      document.body.appendChild(resultPopup);
      
      // Add event listener for the continue button
      const continueButton = document.getElementById('pixar-result-continue');
      if (continueButton) {
        // Define the adjustColor function globally to ensure it's available
        function adjustColor(color, amount) {
          // Handle different color formats
          let r, g, b;
          
          if (color.startsWith('rgb')) {
            // Parse RGB format
            const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            if (rgbMatch) {
              r = parseInt(rgbMatch[1]);
              g = parseInt(rgbMatch[2]);
              b = parseInt(rgbMatch[3]);
            } else {
              return color; // Can't parse, return original
            }
          } else if (color.startsWith('#')) {
            // Parse hex format
            const hex = color.substring(1);
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
          } else {
            return color; // Unsupported format, return original
          }
          
          // Adjust brightness
          r = Math.max(0, Math.min(255, r + amount));
          g = Math.max(0, Math.min(255, g + amount));
          b = Math.max(0, Math.min(255, b + amount));
          
          return `rgb(${r}, ${g}, ${b})`;
        }
        
        continueButton.addEventListener('click', (event) => {
          // Prevent default action
          event.preventDefault();
          
          // Show loading animation immediately when clicked
          const button = event.currentTarget;
          const originalButtonText = button.textContent;
          button.textContent = 'Adding to cart...';
          button.disabled = true;
          button.classList.add('loading');
          
          // Add loading spinner style if not already present
          if (!document.querySelector('#pixar-loading-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'pixar-loading-spinner-style';
            style.textContent = `
              .pixar-continue-button.loading,
              #pixar-result-continue.loading {
                position: relative;
                color: transparent !important;
                transition: background-color 0.3s ease;
              }
              .pixar-continue-button.loading::after,
              #pixar-result-continue.loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 24px;
                height: 24px;
                margin: -12px 0 0 -12px;
                border-radius: 50%;
                border: 3px solid rgba(255, 255, 255, 0.8);
                border-top-color: transparent;
                animation: pixar-spinner 0.8s linear infinite;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
              }
              @keyframes pixar-spinner {
                to {transform: rotate(360deg);}
              }
              /* Second animation for pulse effect */
              .pixar-continue-button.loading,
              #pixar-result-continue.loading {
                animation: pixar-pulse 2s infinite ease-in-out;
              }
              @keyframes pixar-pulse {
                0% { background-color: var(--original-bg, #4a7dbd); }
                50% { background-color: var(--pulse-bg, #3a6dad); }
                100% { background-color: var(--original-bg, #4a7dbd); }
              }
            `;
            document.head.appendChild(style);
            
            // Cache the original background color for pulse animation
            const computedStyle = window.getComputedStyle(button);
            const originalBg = computedStyle.backgroundColor;
            document.documentElement.style.setProperty('--original-bg', originalBg);
            document.documentElement.style.setProperty('--pulse-bg', adjustColor(originalBg, -20));
          }
          
          // Disable size buttons during the transition
          const popup = document.getElementById('pixar-result-popup');
          const sizeButtons = popup.querySelectorAll('[data-size]');
          sizeButtons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';
          });
          
          // IMPORTANT: Don't hide the popup here - we'll keep it visible until the redirect happens
          console.log(`Continue clicked with size ${this.selectedSize || 'S'} selected, redirecting to checkout`);
          
          // Redirect to checkout with the selected size
          this.redirectToCheckout(this.selectedSize || 'S');
        });
        
        // Add hover effect for continue button
        continueButton.addEventListener('mouseenter', () => {
          if (!continueButton.classList.contains('loading')) {
            continueButton.style.backgroundColor = '#3a6dad';
          }
        });
        
        continueButton.addEventListener('mouseleave', () => {
          if (!continueButton.classList.contains('loading')) {
            continueButton.style.backgroundColor = '#4a7dbd';
          }
        });
      }
      
      // Add event listeners for size selection
      const sizeOptions = resultPopup.querySelectorAll('[data-size]');
      sizeOptions.forEach(option => {
        // Add hover effect for size options
        option.addEventListener('mouseenter', () => {
          if (option.getAttribute('data-size') !== this.selectedSize) {
            option.style.backgroundColor = '#f8f8f8';
            option.style.transform = 'translateY(-2px)';
          }
        });
        
        option.addEventListener('mouseleave', () => {
          if (option.getAttribute('data-size') !== this.selectedSize) {
            option.style.backgroundColor = '';
            option.style.transform = 'translateY(0)';
          }
        });
        
        option.addEventListener('click', () => {
          // Get the selected size
          const size = option.getAttribute('data-size');
          
          // If same size is clicked, do nothing
          if (this.selectedSize === size) return;
          
          // Store previous size for transition
          const previousSize = this.selectedSize;
          this.selectedSize = size;
          
          // Remove highlight from all options
          sizeOptions.forEach(opt => {
            opt.style.backgroundColor = '';
            opt.style.transform = 'translateY(0)';
            opt.style.boxShadow = 'none';
          });
          
          // Highlight selected option
          option.style.backgroundColor = '#f0f5fb';
          option.style.transform = 'translateY(-2px)';
          option.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
          
          // Apply the appropriate aspect ratio to the image with animation
          this.applyAspectRatioToResultImage(size, previousSize);
        });
      });
    }
    
    // Set the image source
    const resultImage = document.getElementById('pixar-result-image');
    if (resultImage) {
      resultImage.src = imageUrl;
      
      // When the image is loaded, apply the default aspect ratio (Size S)
      resultImage.onload = () => {
        this.applyAspectRatioToResultImage(this.selectedSize);
      };
    }
    
    // Display the popup
    resultPopup.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Adjust for mobile view if needed
    this.adjustPopupForMobile();
  }
  
  /**
   * Adjust the popup layout for mobile devices
   */
  adjustPopupForMobile() {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      const container = document.querySelector('#pixar-result-popup > div');
      if (container) {
        // Adjust container padding and margins for mobile
        container.style.padding = '15px';
        container.style.margin = '10px auto';
        container.style.maxWidth = '90%';
        container.style.height = 'calc(100vh - 20px)';
      }
      
      // Make image container smaller on mobile
      const imageContainer = document.getElementById('pixar-result-image-container');
      if (imageContainer) {
        imageContainer.style.maxHeight = '60vh';
      }
      
      // Adjust size options for mobile
      const sizeOptions = document.querySelectorAll('[data-size]');
      sizeOptions.forEach(option => {
        // Make size options more compact
        option.style.padding = '5px';
        
        // Make circle and text smaller
        const circle = option.querySelector('div');
        if (circle) {
          circle.style.width = '30px';
          circle.style.height = '30px';
          circle.style.fontSize = '16px';
        }
        
        // Adjust prices text
        const price = option.querySelectorAll('div')[1];
        if (price) {
          price.style.fontSize = '14px';
          price.style.marginTop = '3px';
        }
        
        // Adjust dimensions text
        const dimensions = option.querySelectorAll('div')[2];
        if (dimensions) {
          dimensions.style.fontSize = '10px';
          dimensions.style.marginTop = '2px';
        }
      });
      
      // Make continue button smaller
      const continueButton = document.getElementById('pixar-result-continue');
      if (continueButton) {
        continueButton.style.padding = '8px 20px';
        continueButton.style.fontSize = '14px';
      }
    }
  }
  
  /**
   * Apply the selected aspect ratio to the result image
   * @param {string} size - The selected size (S, M, or L)
   * @param {string} previousSize - The previously selected size (for transition effects)
   */
  applyAspectRatioToResultImage(size, previousSize) {
    // Get the aspect ratio for the selected size
    const aspectRatio = this.sizeAspectRatios[size];
    if (!aspectRatio) return;
    
    console.log(`Applying aspect ratio ${aspectRatio} for size ${size}`);
    
    // Get the image element and container
    const image = document.getElementById('pixar-result-image');
    const container = document.getElementById('pixar-result-image-container');
    const shadow = document.getElementById('pixar-image-shadow');
    if (!image || !container) return;

    // Set container's aspect ratio while maintaining flexibility
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.background = 'transparent';
    
    // Create canvas to maintain aspect ratio
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Determine the canvas dimensions based on the desired aspect ratio
      let canvasWidth, canvasHeight;
      
      // Calculate canvas dimensions
      if (img.width / img.height > aspectRatio) {
        // Image is wider than target ratio, crop width
        canvasHeight = img.height;
        canvasWidth = img.height * aspectRatio;
      } else {
        // Image is taller than target ratio, crop height
        canvasWidth = img.width;
        canvasHeight = img.width / aspectRatio;
      }
      
      // Set canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Draw the image onto the canvas with the center crop
      const ctx = canvas.getContext('2d');
      
      // Fill with transparent background
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      const offsetX = (img.width - canvasWidth) / 2;
      const offsetY = (img.height - canvasHeight) / 2;
      
      // Draw the portion of the image that fits the aspect ratio
      ctx.drawImage(
        img,
        offsetX, offsetY, canvasWidth, canvasHeight,  // Source rectangle
        0, 0, canvasWidth, canvasHeight              // Destination rectangle
      );
      
      // Replace the image src with the canvas data
      image.src = canvas.toDataURL('image/png');
      
      // Adjust shadow to match image dimensions once loaded
      image.onload = () => {
        this.adjustShadowToImage(image, shadow);
      };
      
      // Adjust container to maintain the aspect ratio without affecting layout
      image.style.maxWidth = '100%';
      image.style.maxHeight = '100%';
      image.style.objectFit = 'contain';
      image.style.borderRadius = '8px';
    };
    
    img.src = this.resultImageUrl || image.src;
  }
  
  /**
   * Adjust the shadow element to match the displayed image dimensions
   * @param {HTMLImageElement} image - The image element
   * @param {HTMLElement} shadow - The shadow element
   */
  adjustShadowToImage(image, shadow) {
    if (!image || !shadow) return;
    
    // We need to wait for the image to be fully rendered to get its displayed dimensions
    setTimeout(() => {
      // Get the actual displayed dimensions of the image
      const rect = image.getBoundingClientRect();
      const displayedWidth = rect.width;
      const displayedHeight = rect.height;
      
      // Adjust the shadow to match the image size with a slight offset
      shadow.style.width = `${displayedWidth}px`;
      shadow.style.height = `${displayedHeight}px`;
      shadow.style.top = '10px';
      shadow.style.left = '50%';
      shadow.style.transform = 'translateX(-50%)';
      shadow.style.borderRadius = '8px';
    }, 50); // Small delay to ensure image is rendered
  }
  
  /**
   * Apply the final processing to combine stylized image with cropping and text
   */
  applyFinalProcessing() {
    if (!this.stylizedImageUrl) {
      console.error('No stylized image URL available');
      return;
    }
    
    const isRailwayUrl = this.stylizedImageUrl.includes('railway.app');
    console.log('FINAL PROCESSING: Applying to ' + (isRailwayUrl ? 'RAILWAY' : 'non-Railway') + ' image:', this.stylizedImageUrl);
    
    // Reset final processing complete flag
    this.finalProcessingComplete = false;
    
    // Validate crop coordinates before proceeding
    if (!this.cropCoordinates || !this.cropCoordinates.width || !this.cropCoordinates.height) {
      console.warn('FINAL PROCESSING: Invalid crop coordinates - will use default centered crop');
      
      // Set up default crop if not available - center crop with 3:4 aspect ratio
      this.setupDefaultCrop();
    }
    
    console.log('FINAL PROCESSING: Using crop coordinates:', JSON.stringify(this.cropCoordinates));
    
    this.isProcessing = true; // Set to true while processing
    
    // Show loading popup while processing the final image
    const loadingPopup = document.getElementById('pixar-loading-popup');
    if (loadingPopup) {
      loadingPopup.style.display = 'block';
      
      // Update progress text
      const progressText = document.getElementById('pixar-progress-text');
      if (progressText) {
        progressText.textContent = 'Applying your personal touch...';
      }
      
      // Update progress bar to 95%
      const progressBar = document.getElementById('pixar-progress-bar');
      if (progressBar) {
        progressBar.style.width = '95%';
      }
    }
    
    // For Railway URLs, we need to use CSS-based cropping since we can't manipulate the image directly
    if (isRailwayUrl) {
      // Store the text info for use with Railway images
      this.textInfo = this.textFields && (this.textFields.text || this.textFields.text2) ? 
        { 
          text: this.textFields.text || '',
          text2: this.textFields.text2 || '',
          subtitle: this.textFields.subtitle || '',
          position: this.textFields.position || 'bottom',
          positionPercentage: this.textFields.positionPercentage || 
            (this.textFields.position === 'top' ? 10 : 
             this.textFields.position === 'bottom' ? 90 : 50),
          color: this.textFields.color || '#FFFFFF',
          fontSize: this.textFields.fontSize || '32px', 
          fontFamily: this.textFields.fontFamily || 'Arial, sans-serif',
          // Pass along the relative coordinates data for more precise positioning
          relativeCoordinates: this.textFields && this.textFields.relativeCoordinates ? 
            this.textFields.relativeCoordinates : null
        } : null;
      
      console.log('FINAL PROCESSING: Using CSS-based cropping for Railway image');
      console.log('FINAL PROCESSING: Text info stored:', this.textInfo ? 'Yes' : 'No');
      
      // Now apply Railway crop styling (which will handle text after cropping)
      this.applyRailwayCropStyling();
      
      // Do NOT dispatch completion event or hide loading popup here
      // The event will be dispatched from applyRailwayCropStyling when processing is truly complete
      
      return;
    }
    
    // Continue with canvas-based approach for non-Railway images
    // Load the stylized image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('FINAL PROCESSING: Stylized image loaded successfully, dimensions:', img.width, 'x', img.height);
      
      // Create a canvas for the final image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions based on the original image aspect ratio (3:4 for 30x40)
      const targetRatio = 3/4; // 30x40 aspect ratio
      const finalWidth = img.width;
      const finalHeight = (finalWidth / 3) * 4; // Force 3:4 aspect ratio
      
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      
      console.log('FINAL PROCESSING: Canvas dimensions set to:', finalWidth, 'x', finalHeight);
      
      // Always fill with white background first to handle transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply cropping if coordinates are available
      if (this.cropCoordinates && this.cropCoordinates.width && this.cropCoordinates.height) {
        console.log('FINAL PROCESSING: Applying crop coordinates:', JSON.stringify(this.cropCoordinates));
        
        try {
          // Get the original image dimensions from stored crop coordinates if available
          const originalWidth = this.cropCoordinates.originalImageWidth || 800;
          const originalHeight = this.cropCoordinates.originalImageHeight || 600;
          
          // Calculate the scaling factors between original uploaded image and stylized image
          const originalToStylizedScaleX = img.width / originalWidth;
          const originalToStylizedScaleY = img.height / originalHeight;
          
          console.log('FINAL PROCESSING: Original image dimensions:', originalWidth, 'x', originalHeight);
          console.log('FINAL PROCESSING: Stylized image dimensions:', img.width, 'x', img.height);
          console.log('FINAL PROCESSING: Scale factors from original to stylized - X:', originalToStylizedScaleX, 'Y:', originalToStylizedScaleY);
          
          // Adjust crop coordinates to account for different sizes between original and stylized
          const adjustedCropX = this.cropCoordinates.x * originalToStylizedScaleX;
          const adjustedCropY = this.cropCoordinates.y * originalToStylizedScaleY;
          const adjustedCropWidth = this.cropCoordinates.width * originalToStylizedScaleX;
          const adjustedCropHeight = this.cropCoordinates.height * originalToStylizedScaleY;
          
          // Store these for text positioning
          this.adjustedCropDimensions = {
            x: adjustedCropX,
            y: adjustedCropY,
            width: adjustedCropWidth,
            height: adjustedCropHeight
          };
          
          console.log('FINAL PROCESSING: Original crop coordinates:', JSON.stringify(this.cropCoordinates));
          console.log('FINAL PROCESSING: Adjusted crop coordinates:', JSON.stringify(this.adjustedCropDimensions));
          
          // Calculate how the adjusted crop fits into the canvas 3:4 space
          const cropToCanvasScaleX = finalWidth / adjustedCropWidth;
          const cropToCanvasScaleY = finalHeight / adjustedCropHeight;
          
          console.log('FINAL PROCESSING: Scale factors from crop to canvas - X:', cropToCanvasScaleX, 'Y:', cropToCanvasScaleY);
          
          // Calculate the position offsets to achieve the crop effect
          const offsetX = -adjustedCropX;
          const offsetY = -adjustedCropY;
          
          console.log('FINAL PROCESSING: Applied offsets - X:', offsetX, 'Y:', offsetY);
          
          // Draw the image with the correct scaling to match the crop selection
          ctx.drawImage(
            img,                         // Source image
            0, 0,                        // Source position (0,0)
            img.width, img.height,       // Source dimensions (full image)
            offsetX, offsetY,            // Destination position (with offsets to show cropped area)
            img.width * cropToCanvasScaleX, // Destination width (scaled)
            img.height * cropToCanvasScaleY  // Destination height (scaled)
          );
          
          console.log('FINAL PROCESSING: Image successfully drawn with crop applied');
        } catch (error) {
          console.error('FINAL PROCESSING: Error drawing image with crop:', error);
          // Fallback to drawing without crop
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          console.log('FINAL PROCESSING: Fallback - Image drawn without crop due to error');
        }
      } else {
        // No cropping - just center the image
        console.log('FINAL PROCESSING: No crop coordinates available, centering image');
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      }
      
      // Add text if available and both names are provided
      if (this.textFields && (this.textFields.text || this.textFields.text2)) {
        // Get both names
        const name1 = this.textFields.text || '';
        const name2 = this.textFields.text2 || '';
        const subtitle = this.textFields.subtitle || '';
        
        console.log('FINAL PROCESSING: Adding Name1 & Name2 text to image:', name1, name2);
        if (subtitle) {
          console.log('FINAL PROCESSING: Adding subtitle text:', subtitle);
        }
        
        // Format text in "Name 1 & Name 2" format
        let formattedText = '';
        if (name1 && name2) {
          formattedText = name1.toUpperCase() + ' & ' + name2.toUpperCase();
        } else if (name1) {
          formattedText = name1.toUpperCase();
        } else if (name2) {
          formattedText = name2.toUpperCase();
        }
        
        // Extract the crop-to-canvas scale factors from earlier calculation
        const scaleXForText = cropToCanvasScaleX || 1;
        const scaleYForText = cropToCanvasScaleY || 1;
        
        // Calculate font size based on canvas dimensions and text length
        const baseFontSize = parseInt(this.textFields.fontSize) || 32;
        const textLength = (name1.length + name2.length + (name1 && name2 ? 3 : 0));
        
        // Define usable width - 80% of the canvas width
        const usableWidth = canvas.width * 0.8;
        
        // Auto-fit text based on canvas width and text length - INITIAL ESTIMATE
        const maxFontSize = 200; // Increased from 150 to allow larger text
        const calculatedFontSize = Math.floor(usableWidth / (textLength * 0.45)); // Reduced multiplier from 0.55 to 0.45 for bigger text
        let scaledFontSize = Math.min(maxFontSize, calculatedFontSize);
        
        // Ensure minimum font size for readability
        const minFontSize = Math.max(30, Math.floor(canvas.width / 16)); // Increased minimum font size
        scaledFontSize = Math.max(minFontSize, scaledFontSize);
        
        // Now precisely calculate width for Name1 & Name2 format
        ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        
        // Measure the exact width of each component
        const firstPartWidth = ctx.measureText(name1.toUpperCase()).width;
        const ampersandWidth = ctx.measureText(' & ').width;
        const secondPartWidth = ctx.measureText(name2.toUpperCase()).width;
        const totalTextWidth = firstPartWidth + ampersandWidth + secondPartWidth;
        
        // Calculate the scaling factor needed to make text exactly 80% of canvas width
        const targetWidth = usableWidth;
        const scaleFactor = targetWidth / totalTextWidth;
        
        // Apply the scaling factor to font size (scale up or down as needed)
        scaledFontSize = Math.floor(scaledFontSize * scaleFactor);
        
        // Apply final bounds
        scaledFontSize = Math.max(minFontSize, Math.min(maxFontSize, scaledFontSize));
        
        console.log('FINAL PROCESSING: Font size precision scaling - initial:', calculatedFontSize, 
                   'measured width:', totalTextWidth, 'target width:', targetWidth, 
                   'scale factor:', scaleFactor, 'final size:', scaledFontSize);
        
        console.log('FINAL PROCESSING: Text scaling - textLength:', textLength, 'calculated font size:', scaledFontSize);
        
        // Apply text settings with scaled font size - Use Montserrat or Arial Black for matching the popup style
        ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        ctx.fillStyle = this.textFields.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate letter spacing inversely proportional to font size
        // As font size increases, letter spacing should decrease
        const letterSpacingEm = Math.max(0.01, 0.04 - (scaledFontSize / 2000)); // Reduced letter spacing for taller text
        console.log('FINAL PROCESSING: Dynamic letter spacing:', letterSpacingEm + 'em', 'for font size:', scaledFontSize);
        
        // Do a test measurement to see if the text would fit within the usable width
        const maxFontWidth = canvas.width * 0.8;
        const testTextWidth = ctx.measureText(formattedText).width;
        if (testTextWidth > maxFontWidth) {
          // If it doesn't fit, recalculate font size to ensure it fits
          scaledFontSize = Math.floor(scaledFontSize * (maxFontWidth / testTextWidth)); // Removed safety margin
          console.log('FINAL PROCESSING: Adjusting font size to', scaledFontSize, 'because text width', testTextWidth, 'exceeds usable width', maxFontWidth);
          ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        }
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 7; // Increased shadow blur
        ctx.shadowOffsetX = 3; // Increased shadow offset
        ctx.shadowOffsetY = 3; // Increased shadow offset
        
        // Calculate position based on crop-adjusted coordinates
        let x, y;
        
        if (this.textFields.relativeCoordinates) {
          // If we have stored relative coordinates from the crop, use those
          
          // Calculate the scaled position relative to the canvas size
          // We need to map from the cropped image to the final canvas
          
          // Get stored dimensions or default to calculated values
          const croppedWidth = this.textFields.relativeCoordinates.croppedImageWidth || this.cropCoordinates.width;
          const croppedHeight = this.textFields.relativeCoordinates.croppedImageHeight || this.cropCoordinates.height;
          
          // Calculate the position as a percentage of the cropped area
          const xPercent = this.textFields.relativeCoordinates.x / croppedWidth;
          const yPercent = this.textFields.relativeCoordinates.y / croppedHeight;
          
          // Apply these percentages to the canvas
          x = canvas.width * xPercent;
          y = canvas.height * yPercent;
          
          console.log('FINAL PROCESSING: Text positioned using relative coordinates - X:', x, 'Y:', y);
          console.log('FINAL PROCESSING: Text position calculation - xPercent:', xPercent, 'yPercent:', yPercent);
        } else {
          // Fallback to standard positioning
          x = canvas.width / 2;
          y = this.textFields.position === 'top' 
            ? canvas.height * 0.1 
            : this.textFields.position === 'bottom'
              ? canvas.height * 0.87 // Position at 87% from top (was 0.9)
              : canvas.height / 2;
              
          console.log('FINAL PROCESSING: Text positioned using standard method - X:', x, 'Y:', y);
        }
        
        // Handle multi-line text and special ampersand case
        const lines = formattedText.split('\n');
        const lineHeight = scaledFontSize * 1.2; // 1.2x line height
        
        if (lines.length > 1) {
          // For multi-line text, calculate the total height and position accordingly
          const totalTextHeight = lineHeight * lines.length;
          let startY;
          
          if (this.textFields.position === 'top') {
            startY = y;
          } else if (this.textFields.position === 'bottom') {
            startY = y - (totalTextHeight - lineHeight);
          } else {
            startY = y - (totalTextHeight / 2) + (lineHeight / 2);
          }
          
          console.log('FINAL PROCESSING: Drawing multi-line text, total height:', totalTextHeight);
          
          // Draw each line
          lines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);
            ctx.fillText(line, x, lineY);
            console.log('FINAL PROCESSING: Drawing line', index, 'at Y:', lineY);
          });
        } else {
          // Handle all text rendering cases
          if (name1 && name2) {
            // Canvas doesn't support HTML, so we'll draw the ampersand with special spacing
            // Calculate letter spacing proportional to font size
            const letterSpacingPx = scaledFontSize * letterSpacingEm;
            const ampersandWidth = ctx.measureText(' & ').width;
            
            // Draw Name 1 with adjusted letter spacing
            const name1Text = name1.toUpperCase();
            
            // Calculate the total width with adjusted spacing
            let totalName1Width = 0;
            for (let i = 0; i < name1Text.length; i++) {
              totalName1Width += ctx.measureText(name1Text[i]).width;
            }
            // Add spacing between all characters except the last
            totalName1Width += letterSpacingPx * (name1Text.length - 1);
            
            // Draw Name 2 with adjusted letter spacing
            const name2Text = name2.toUpperCase();
            
            // Calculate the total width with adjusted spacing
            let totalName2Width = 0;
            for (let i = 0; i < name2Text.length; i++) {
              totalName2Width += ctx.measureText(name2Text[i]).width;
            }
            // Add spacing between all characters except the last
            totalName2Width += letterSpacingPx * (name2Text.length - 1);
            
            // Calculate total width for centering
            const totalWidth = totalName1Width + ampersandWidth + totalName2Width;
            
            // Adjust font size if total width exceeds 80% of canvas width
            if (totalWidth > canvas.width * 0.8) {
              const scaleFactor = (canvas.width * 0.8) / totalWidth;
              scaledFontSize = Math.floor(scaledFontSize * scaleFactor);
              ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
              
              // Recalculate everything with new font size
              const newLetterSpacingPx = scaledFontSize * letterSpacingEm;
              const newAmpersandWidth = ctx.measureText(' & ').width;
              
              // Recalculate Name1 width
              let newTotalName1Width = 0;
              for (let i = 0; i < name1Text.length; i++) {
                newTotalName1Width += ctx.measureText(name1Text[i]).width;
              }
              newTotalName1Width += newLetterSpacingPx * (name1Text.length - 1);
              
              // Recalculate Name2 width
              let newTotalName2Width = 0;
              for (let i = 0; i < name2Text.length; i++) {
                newTotalName2Width += ctx.measureText(name2Text[i]).width;
              }
              newTotalName2Width += newLetterSpacingPx * (name2Text.length - 1);
              
              // Update all variables with new measurements
              totalName1Width = newTotalName1Width;
              totalName2Width = newTotalName2Width;
              const newTotalWidth = totalName1Width + newAmpersandWidth + totalName2Width;
              
              console.log('FINAL PROCESSING: Adjusted font size to', scaledFontSize, 'for custom letter spacing, new total width:', newTotalWidth);
            }
            
            // Calculate starting position for the entire text
            const startX = x - (totalWidth / 2);
            
            // Starting position for first name
            let currentX = startX;
            
            // Draw each character of Name 1 with spacing
            for (let i = 0; i < name1Text.length; i++) {
              const char = name1Text[i];
              const charWidth = ctx.measureText(char).width;
              
              // Draw the character
              ctx.fillText(char, currentX + (charWidth / 2), y);
              
              // Move to the next position
              currentX += charWidth + letterSpacingPx;
            }
            
            // Adjust for the last letter spacing that we don't need
            currentX -= letterSpacingPx;
            
            // Draw ampersand with slightly different styling if possible
            ctx.fillText('&', currentX + (ampersandWidth / 2), y);
            currentX += ampersandWidth;
            
            // Draw each character of Name 2 with spacing
            for (let i = 0; i < name2Text.length; i++) {
              const char = name2Text[i];
              const charWidth = ctx.measureText(char).width;
              
              // Draw the character
              ctx.fillText(char, currentX + (charWidth / 2), y);
              
              // Move to the next position
              currentX += charWidth + letterSpacingPx;
            }
            
            console.log('FINAL PROCESSING: Drew "Name 1 & Name 2" format with adjusted letter spacing');
          } else if (name1) {
            // Draw just name1
            ctx.fillText(name1.toUpperCase(), x, y);
            console.log('FINAL PROCESSING: Drew single name (name1):', name1);
          } else if (name2) {
            // Draw just name2
            ctx.fillText(name2.toUpperCase(), x, y);
            console.log('FINAL PROCESSING: Drew single name (name2):', name2);
          } else {
            console.log('FINAL PROCESSING: No text to draw - empty names');
          }
        }
        
        // After drawing the main text, add the subtitle if available
        if (subtitle) {
          // Calculate subtitle font size (smaller than main text, but proportional)
          const subtitleFontSize = Math.max(Math.floor(scaledFontSize * 0.35), 16);
          
          // Set subtitle styling
          ctx.font = `italic ${subtitleFontSize}px 'Montserrat', 'Arial', sans-serif`;
          ctx.fillStyle = this.textFields.color || '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add shadow for subtitle
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Position subtitle below the main text
          const subtitleY = y + (scaledFontSize * 0.8);
          
          // Check if subtitle is too long and needs to be wrapped
          const maxSubtitleWidth = usableWidth * 0.9; // Use slightly more width than main text
          const subtitleWidth = ctx.measureText(subtitle).width;
          
          if (subtitleWidth > maxSubtitleWidth) {
            console.log('FINAL PROCESSING: Subtitle too long, wrapping or truncating');
            
            // Try to break subtitle into words for wrapping
            const words = subtitle.split(' ');
            let line = '';
            let lines = [];
            
            // Create wrapped lines that fit the max width
            for (let i = 0; i < words.length; i++) {
              const testLine = line + (line ? ' ' : '') + words[i];
              const testWidth = ctx.measureText(testLine).width;
              
              if (testWidth > maxSubtitleWidth && line !== '') {
                lines.push(line);
                line = words[i];
              } else {
                line = testLine;
              }
            }
            
            // Add the last line
            if (line) {
              lines.push(line);
            }
            
            // If we have more than 2 lines, truncate to 2 lines with ellipsis
            if (lines.length > 2) {
              console.log('FINAL PROCESSING: Subtitle has too many lines, truncating to 2');
              const lastLine = lines[1];
              const truncateAt = Math.floor(lastLine.length * 0.8);
              lines[1] = lastLine.substring(0, truncateAt) + '...';
              lines = lines.slice(0, 2);
            }
            
            // Draw each line of the subtitle
            const lineHeight = subtitleFontSize * 1.2;
            lines.forEach((line, index) => {
              ctx.fillText(line, x, subtitleY + (index * lineHeight));
            });
            
            console.log('FINAL PROCESSING: Wrapped subtitle into', lines.length, 'lines');
          } else {
            // Draw the subtitle as a single line
            ctx.fillText(subtitle, x, subtitleY);
            console.log('FINAL PROCESSING: Subtitle added as single line at Y:', subtitleY);
          }
        }
        
        console.log('FINAL PROCESSING: Text added to image');
      }
      
      // Convert to data URL
      this.finalImageUrl = canvas.toDataURL('image/png');
      console.log('FINAL PROCESSING: Final image created, updating product gallery');
      
      // Update the product gallery image to show the final result
      this.updateProductImage(this.finalImageUrl);
      
      // Update progress bar to 100%
      if (progressBar) {
        progressBar.style.width = '100%';
      }
      
      // Update progress text
      if (progressText) {
        progressText.textContent = 'Complete!';
      }
      
      // Set processing flags
      this.isProcessing = false;
      this.finalProcessingComplete = true;
      
      // Dispatch event indicating final processing is complete
      document.dispatchEvent(new CustomEvent('pixar-final-processing-complete', {
        detail: { imageUrl: this.finalImageUrl }
      }));
      console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event');
      
      // Hide loading UI after a delay to ensure smooth transition
      setTimeout(() => {
        if (loadingPopup) {
          loadingPopup.style.display = 'none';
          document.body.style.overflow = '';
          
          // Show the result popup with the processed image
          this.showResultPopup(this.finalImageUrl);
        }
      }, 1000);
    };
    
    img.onerror = (error) => {
      console.error('FINAL PROCESSING: Error loading stylized image:', error);
      
      // Fallback to using the original stylized image without modifications
      console.warn('FINAL PROCESSING: Fallback - Displaying original stylized image without crop modifications');
      this.updateProductImage(this.stylizedImageUrl);
      
      // Set processing flags
      this.isProcessing = false;
      this.finalProcessingComplete = true;
      
      // Dispatch event indicating final processing is complete (even though it failed)
      document.dispatchEvent(new CustomEvent('pixar-final-processing-complete', {
        detail: { imageUrl: this.stylizedImageUrl, error: true }
      }));
      console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event (with error)');
      
      // Hide any loading UI
      if (loadingPopup) {
        loadingPopup.style.display = 'none';
        document.body.style.overflow = '';
        
        // Show the result popup with the fallback image
        this.showResultPopup(this.stylizedImageUrl);
      }
    };
    
    console.log('FINAL PROCESSING: Loading stylized image:', this.stylizedImageUrl);
    // Set the source to load the image
    img.src = this.stylizedImageUrl;
  }
  
  /**
   * Set up default crop if no crop coordinates are available
   * This ensures we maintain the proper aspect ratio
   */
  setupDefaultCrop() {
    // Create a temporary image to get dimensions
    const tempImg = new Image();
    tempImg.src = this.originalImageDataUrl || this.croppedImageDataUrl || this.stylizedImageUrl;
    
    // Use default dimensions if image isn't loaded yet
    const width = tempImg.width || 800;
    const height = tempImg.height || 600;
    
    // Get the current aspect ratio from the cropper
    const targetRatio = this.imageCropper ? this.imageCropper.options.aspectRatio : 3/4; // Default to 30x40 if cropper not available
    console.log(`Using aspect ratio: ${targetRatio} for default crop`);
    
    let cropWidth, cropHeight;
    if (width / height > targetRatio) {
      // Image is wider than target ratio
      cropHeight = height;
      cropWidth = cropHeight * targetRatio;
    } else {
      // Image is taller than target ratio
      cropWidth = width;
      cropHeight = cropWidth / targetRatio;
    }
    
    // Center the crop
    const cropX = (width - cropWidth) / 2;
    const cropY = (height - cropHeight) / 2;
    
    // Store the crop coordinates
    this.cropCoordinates = {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    };
    
    console.log('FINAL PROCESSING: Created default centered crop coordinates:', this.cropCoordinates);
  }
  
  /**
   * Update all product images with the new image URL
   * @param {string} imageUrl - The URL of the new image
   */
  updateProductImage(imageUrl) {
    console.log('PRODUCT IMAGE: Updating all product gallery images with new image');
    
    try {
      // Find the main product image (if already transformed, use that one first)
      const mainImage = document.querySelector('.pixar-transformed-image') || this.findMainProductImage();
      
      if (mainImage) {
        // Simply update the source of the image - don't apply any cropping
        console.log('PRODUCT IMAGE: Using direct DOM updates with:', imageUrl.substring(0, 100) + '...');
        
        // Clear any previous cropping classes or styles
        mainImage.classList.remove('pixar-crop-applied');
        
        // Save original styling for potential restoration
        if (!mainImage.dataset.originalStyles) {
          mainImage.dataset.originalStyles = JSON.stringify({
            objectFit: mainImage.style.objectFit,
            objectPosition: mainImage.style.objectPosition,
            width: mainImage.style.width,
            height: mainImage.style.height,
            aspectRatio: mainImage.style.aspectRatio,
            maxWidth: mainImage.style.maxWidth,
            maxHeight: mainImage.style.maxHeight,
            minWidth: mainImage.style.minWidth,
            minHeight: mainImage.style.minHeight
          });
          
          // Also save attributes that might affect display
          mainImage.dataset.originalAttributes = JSON.stringify({
            width: mainImage.getAttribute('width'),
            height: mainImage.getAttribute('height')
          });
        }
        
        // Remove any attributes that might restrict dimensions
        mainImage.removeAttribute('width');
        mainImage.removeAttribute('height');
        
        // Set appropriate styling to ensure correct aspect ratio display
        mainImage.style.objectFit = 'contain';
        mainImage.style.objectPosition = 'center';
        mainImage.style.width = '100%';
        mainImage.style.height = 'auto';
        mainImage.style.aspectRatio = '3/4'; // Force 3:4 aspect ratio
        mainImage.style.maxWidth = '100%';
        mainImage.style.minWidth = 'auto';
        mainImage.style.minHeight = 'auto';
        mainImage.style.maxHeight = 'none';
        
        // Update the image source
        mainImage.setAttribute('src', imageUrl);
        mainImage.setAttribute('srcset', imageUrl);
        
        // Handle Aurora theme specific configuration
        // First check if we're in an Aurora theme
        const isAuroraTheme = !!document.querySelector('.product-gallery__media') || 
                               !!document.querySelector('.product-gallery__media-list');
                               
        if (isAuroraTheme) {
          console.log('PRODUCT IMAGE: Detected Aurora theme, applying special handling');
          
          // Find the gallery media container - this could be several levels up
          const mediaContainer = mainImage.closest('.product-gallery__media') || 
                                mainImage.closest('.product__media');
                                
          if (mediaContainer) {
            // Add a special class to identify our customization
            mediaContainer.classList.add('pixar-transformed-media-container');
            
            // Save original styles
            if (!mediaContainer.dataset.originalStyles) {
              mediaContainer.dataset.originalStyles = JSON.stringify({
                aspectRatio: mediaContainer.style.aspectRatio,
                display: mediaContainer.style.display,
                position: mediaContainer.style.position
              });
            }
            
            // Force the container to respect our aspect ratio, not the theme's
            mediaContainer.style.aspectRatio = '3/4';
            
            // Also handle the parent list item if it exists
            const mediaListItem = mediaContainer.closest('.product-gallery__media-list-item');
            if (mediaListItem) {
              if (!mediaListItem.dataset.originalStyles) {
                mediaListItem.dataset.originalStyles = JSON.stringify({
                  aspectRatio: mediaListItem.style.aspectRatio,
                  width: mediaListItem.style.width,
                  height: mediaListItem.style.height
                });
              }
              mediaListItem.classList.add('pixar-transformed-list-item');
              mediaListItem.style.aspectRatio = '3/4';
            }
            
            // Update media wrapper if present
            const mediaWrapper = mainImage.closest('.product-gallery__media-wrapper');
            if (mediaWrapper) {
              if (!mediaWrapper.dataset.originalStyles) {
                mediaWrapper.dataset.originalStyles = JSON.stringify({
                  aspectRatio: mediaWrapper.style.aspectRatio,
                  paddingBottom: mediaWrapper.style.paddingBottom
                });
              }
              mediaWrapper.classList.add('pixar-transformed-wrapper');
              mediaWrapper.style.aspectRatio = '3/4';
              // Remove any padding-bottom that might be forcing square ratio
              mediaWrapper.style.paddingBottom = 'unset';
            }
          }
          
          // Handle thumbnails - find the active thumbnail and update it
          this.updateActiveThumbnail(imageUrl);
        }
        
        // Mark as transformed for future reference
        mainImage.classList.add('pixar-transformed-image');
        
        // Handle general container aspect ratio for any theme
        let container = mainImage.parentElement;
        
        if (container) {
          // Save original container styling if not already saved
          if (!container.dataset.originalStyles) {
            container.dataset.originalStyles = JSON.stringify({
              aspectRatio: container.style.aspectRatio,
              display: container.style.display,
              position: container.style.position,
              width: container.style.width,
              height: container.style.height,
              maxWidth: container.style.maxWidth,
              maxHeight: container.style.maxHeight,
              minWidth: container.style.minWidth,
              minHeight: container.style.minHeight,
              overflow: container.style.overflow,
              paddingBottom: container.style.paddingBottom
            });
          }
          
          // Apply appropriate container styling to maintain aspect ratio
          container.style.display = 'flex';
          container.style.alignItems = 'center';
          container.style.justifyContent = 'center';
          container.style.position = 'relative';
          container.style.width = '100%';
          container.style.maxWidth = '100%';
          container.style.height = 'auto';
          container.style.aspectRatio = '3/4';
          container.style.overflow = 'visible';
          // Remove any padding-bottom that might be forcing square ratio
          container.style.paddingBottom = 'unset';
          
          // Add a helpful class for later identification
          container.classList.add('pixar-image-container');
          
          // Also check for a grandparent container that might be constraining dimensions
          const grandparent = container.parentElement;
          if (grandparent) {
            if (!grandparent.dataset.originalStyles) {
              grandparent.dataset.originalStyles = JSON.stringify({
                overflow: grandparent.style.overflow,
                maxHeight: grandparent.style.maxHeight,
                height: grandparent.style.height,
                paddingBottom: grandparent.style.paddingBottom
              });
            }
            
            // Ensure grandparent doesn't constrain height
            grandparent.style.overflow = 'visible';
            grandparent.style.maxHeight = 'none';
            // Remove padding-bottom if it exists
            grandparent.style.paddingBottom = 'unset';
          }
        }
        
        // As a final measure, set explicit inline styles with !important to override any CSS rules
        this.injectOverrideStyles();
        
        // Also search for and update any alternate views or thumbnails with same image pattern
        let additionalImagesUpdated = 0;
        const mainImageSrc = mainImage.getAttribute('data-original-src') || '';
        if (mainImageSrc) {
          const similarImages = document.querySelectorAll(`img[data-original-src="${mainImageSrc}"]`);
          similarImages.forEach(img => {
            // Update only if not the main image we already updated
            if (img !== mainImage) {
              img.setAttribute('src', imageUrl);
              img.setAttribute('srcset', imageUrl);
              additionalImagesUpdated++;
            }
          });
        }
        
        console.log(`PRODUCT IMAGE: Updated ${1 + additionalImagesUpdated} product images with new design`);
        
        // Run a final check after a short delay to ensure aspect ratio is applied
        setTimeout(() => {
          this.validateImageDisplay(mainImage);
        }, 100);
      } else {
        // If we can't find an existing image, create a new one as fallback
        this.createReplacementImage(imageUrl);
      }
    } catch (error) {
      console.error('PRODUCT IMAGE: Error updating product image:', error);
    }
  }
  
  /**
   * Updates the active thumbnail with the new image
   * @param {string} imageUrl - The URL of the new image
   */
  updateActiveThumbnail(imageUrl) {
    try {
      // Look for thumbnails in various theme structures
      const thumbnailSelectors = [
        // Aurora theme thumbnails
        '.product-gallery__thumbnail[aria-current="true"] img',
        '.product-gallery__thumbnail--active img',
        '.product-gallery__thumbnail.is-active img',
        // General Shopify thumbnails
        '.product-single__thumbnails .active img',
        '.product__thumbnails .active-thumb img'
      ];
      
      for (const selector of thumbnailSelectors) {
        const activeThumbnailImg = document.querySelector(selector);
        if (activeThumbnailImg) {
          console.log('PRODUCT IMAGE: Updating active thumbnail');
          activeThumbnailImg.src = imageUrl;
          activeThumbnailImg.srcset = imageUrl;
          
          // Also update container if needed
          const container = activeThumbnailImg.closest('.product-gallery__thumbnail');
          if (container) {
            container.classList.add('pixar-transformed-thumbnail');
          }
          break;
        }
      }
    } catch (error) {
      console.error('PRODUCT IMAGE: Error updating thumbnail:', error);
    }
  }
  
  /**
   * Injects CSS override styles to handle theme-specific styling
   */
  injectOverrideStyles() {
    const styleId = 'pixar-image-override-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    // Create high-specificity CSS rules to override theme styling
    styleEl.textContent = `
      /* General image overrides */
      .pixar-transformed-image {
        object-fit: contain !important;
        object-position: center !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 3/4 !important;
        max-width: 100% !important;
        max-height: none !important;
      }
      
      .pixar-image-container {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 3/4 !important;
        overflow: visible !important;
        padding-bottom: unset !important;
      }
      
      /* Aurora theme specific overrides */
      .product-gallery__media.pixar-transformed-media-container {
        aspect-ratio: 3/4 !important;
        padding-bottom: unset !important;
      }
      
      .product-gallery__media-wrapper.pixar-transformed-wrapper {
        aspect-ratio: 3/4 !important;
        padding-bottom: unset !important;
      }
      
      .product-gallery__media-list-item.pixar-transformed-list-item {
        aspect-ratio: 3/4 !important;
      }
      
      /* Target square images specifically in Aurora theme */
      .product-gallery--layout-grid.product-gallery--img-ratio-square .pixar-transformed-media-container,
      .product-gallery--layout-grid.product-gallery--img-ratio-square .pixar-transformed-image,
      .product-gallery--layout-list.product-gallery--img-ratio-square .pixar-transformed-media-container,
      .product-gallery--layout-list.product-gallery--img-ratio-square .pixar-transformed-image {
        aspect-ratio: 3/4 !important;
        padding-bottom: unset !important;
      }
      
      /* Handle thumbnails */
      .product-gallery__thumbnail.pixar-transformed-thumbnail img {
        aspect-ratio: 3/4 !important;
        object-fit: contain !important;
      }
    `;
  }
  
  /**
   * Validate that the image is displaying with the correct aspect ratio
   * @param {HTMLImageElement} image - The image to validate
   */
  validateImageDisplay(image) {
    if (!image) return;
    
    const computedStyle = window.getComputedStyle(image);
    const currentRatio = parseFloat(image.clientWidth) / parseFloat(image.clientHeight);
    const targetRatio = 3/4;
    
    // Check if the aspect ratio is significantly different from our target
    if (Math.abs(currentRatio - targetRatio) > 0.1) {
      console.warn(`PRODUCT IMAGE: Aspect ratio validation failed - current: ${currentRatio.toFixed(2)}, target: ${targetRatio.toFixed(2)}`);
      
      // Apply more aggressive styling to force the aspect ratio
      image.style.cssText = `
        object-fit: contain !important;
        object-position: center !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 3/4 !important;
        max-width: 100% !important;
        display: block !important;
      `;
      
      // Try creating a wrapper if not already in one
      const isInWrapper = image.parentElement && image.parentElement.classList.contains('pixar-transform-container');
      if (!isInWrapper) {
        this.wrapImageInContainer(image);
      }
    } else {
      console.log('PRODUCT IMAGE: Aspect ratio validation passed');
    }
  }
  
  /**
   * Create a replacement image when the original one can't be found
   * @param {string} imageUrl - The URL of the new image
   */
  createReplacementImage(imageUrl) {
    console.log('PRODUCT IMAGE: Creating replacement image');
    
    // Find a suitable container for the replacement image
    const container = document.querySelector('.product__media') ||
                    document.querySelector('.product-single__media') ||
                    document.querySelector('.product-single__photo') ||
                    document.querySelector('.product-gallery');
    
    if (container) {
      // Create a new image element
      const newImage = document.createElement('img');
      newImage.src = imageUrl;
      newImage.classList.add('pixar-transformed-image');
      newImage.style.width = '100%';
      newImage.style.height = 'auto';
      newImage.style.objectFit = 'contain';
      newImage.style.aspectRatio = '3/4';
      
      // Create a wrapper to maintain aspect ratio
      const wrapper = document.createElement('div');
      wrapper.classList.add('pixar-transform-container');
      wrapper.style.width = '100%';
      wrapper.style.height = 'auto';
      wrapper.style.aspectRatio = '3/4';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      wrapper.appendChild(newImage);
      
      // Clear and append to container
      container.innerHTML = '';
      container.appendChild(wrapper);
      
      console.log('PRODUCT IMAGE: Successfully created replacement image');
    } else {
      console.error('PRODUCT IMAGE: Could not find any suitable container for replacement image');
    }
  }
  
  /**
   * Ensure text is visible by adding it directly to the product gallery
   * This is a fallback method to guarantee text visibility
   */
  ensureTextVisibility() {
    // Disable this method entirely - we don't want text overlays on the product page
    console.log('Text overlays disabled per configuration');
    return;
  }
  
  /**
   * Apply CSS-based cropping for Railway images
   */
  applyRailwayCropStyling() {
    console.log('RAILWAY PROCESSING: Applying Railway image with CSS-based cropping');
    
    try {
      // Update the product image with the Railway image
      this.updateProductImage(this.stylizedImageUrl);
      
      // Get the main displayed image to apply the crop to
      const mainImage = this.findMainProductImage();
      
      // If we couldn't find the main image through DOM selectors, try again after a short delay
      // This is necessary because some themes load images dynamically
      if (!mainImage) {
        console.log('RAILWAY PROCESSING: Main product image not found initially, trying again after delay');
        
        // Set a timeout to try again after 500ms
        setTimeout(() => {
          const retryMainImage = this.findMainProductImage();
          
          if (retryMainImage) {
            console.log('RAILWAY PROCESSING: Found main product image on retry:', retryMainImage.src);
            this.processCropForMainImage(retryMainImage);
          } else {
            console.log('RAILWAY PROCESSING: Still could not find main product image, proceeding with fallback');
            this.handleMainImageNotFound();
          }
        }, 500);
        
        return;
      }
      
      // If we found the main image, process it
      this.processCropForMainImage(mainImage);
    } catch (error) {
      console.error('RAILWAY PROCESSING: Error applying Railway image crop:', error);
      
      // Set flags to indicate processing is done even on error
      this.textProcessingComplete = true;
      this.finalProcessingComplete = true;
      this.isProcessing = false;
      
      // Hide loading popup on error
      this.hideLoadingPopup();
      
      // Dispatch final event with error
      const finalEvent = new CustomEvent('pixar-final-processing-complete', {
        detail: { 
          imageUrl: this.stylizedImageUrl,
          timestamp: Date.now(),
          error: error.message || 'Error applying Railway image crop'
        }
      });
      document.dispatchEvent(finalEvent);
    }
  }
  
  /**
   * Process crop for main image when found
   * @param {HTMLImageElement} mainImage - The main product image
   */
  processCropForMainImage(mainImage) {
    console.log('RAILWAY PROCESSING: Found main product image:', mainImage.src);
    
    // Check dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('RAILWAY PROCESSING: Original image loaded', img.width, 'x', img.height);
      
      // Calculate crop dimensions
      this.originalImageWidth = img.width;
      this.originalImageHeight = img.height;
      
      // Get the cropped area from our crop coordinates
      if (this.cropCoordinates) {
        const crop = this.cropCoordinates;
        
        // Calculate scaling factor if original images sizes don't match
        const scaleX = this.originalImageWidth / crop.originalImageWidth;
        const scaleY = this.originalImageHeight / crop.originalImageHeight;
        
        console.log(`RAILWAY PROCESSING: Original crop from ${crop.originalImageWidth}x${crop.originalImageHeight} to current ${this.originalImageWidth}x${this.originalImageHeight}`);
        console.log(`RAILWAY PROCESSING: Scaling factors - X: ${scaleX}, Y: ${scaleY}`);
        
        // Calculate cropped dimensions in the displayed image
        this.croppedImageX = Math.round(crop.x * scaleX);
        this.croppedImageY = Math.round(crop.y * scaleY);
        this.croppedImageWidth = Math.round(crop.width * scaleX);
        this.croppedImageHeight = Math.round(crop.height * scaleY);
        
        console.log(`RAILWAY PROCESSING: Adjusted crop coordinates: X: ${this.croppedImageX}, Y: ${this.croppedImageY}, Width: ${this.croppedImageWidth}, Height: ${this.croppedImageHeight}`);
        
        // Force 3:4 aspect ratio if it doesn't match (important for proper display)
        const currentRatio = this.croppedImageWidth / this.croppedImageHeight;
        const targetRatio = 3/4; // 3:4 aspect ratio is our standard
        
        if (Math.abs(currentRatio - targetRatio) > 0.01) { // Allow small deviation
          console.log(`RAILWAY PROCESSING: Current aspect ratio ${currentRatio.toFixed(2)} doesn't match target ${targetRatio.toFixed(2)}, adjusting`);
          
          // Adjust width to match height
          const newWidth = Math.round(this.croppedImageHeight * targetRatio);
          
          // If new width is smaller than current, center the crop
          if (newWidth < this.croppedImageWidth) {
            const diff = this.croppedImageWidth - newWidth;
            this.croppedImageX += Math.floor(diff / 2);
            this.croppedImageWidth = newWidth;
          } 
          // If new width is larger, we need to adjust height instead
          else {
            const newHeight = Math.round(this.croppedImageWidth / targetRatio);
            
            // If new height is smaller than current, center the crop
            if (newHeight < this.croppedImageHeight) {
              const diff = this.croppedImageHeight - newHeight;
              this.croppedImageY += Math.floor(diff / 2);
              this.croppedImageHeight = newHeight;
            }
          }
          
          console.log(`RAILWAY PROCESSING: Adjusted to 3:4 ratio - Width: ${this.croppedImageWidth}, Height: ${this.croppedImageHeight}`);
        }
        
        // DO NOT apply crop styling to product images - we'll directly crop in canvas
      } else {
        console.log('RAILWAY PROCESSING: No crop coordinates available, using full image');
        
        // Set default crop to full image with 3:4 aspect ratio
        const fullImageRatio = this.originalImageWidth / this.originalImageHeight;
        const targetRatio = 3/4; // Target 3:4 ratio
        
        if (fullImageRatio > targetRatio) {
          // Image is wider than 3:4, use full height and crop width
          this.croppedImageY = 0;
          this.croppedImageHeight = this.originalImageHeight;
          this.croppedImageWidth = Math.round(this.originalImageHeight * targetRatio);
          this.croppedImageX = Math.round((this.originalImageWidth - this.croppedImageWidth) / 2);
        } else {
          // Image is taller than 3:4, use full width and crop height
          this.croppedImageX = 0;
          this.croppedImageWidth = this.originalImageWidth;
          this.croppedImageHeight = Math.round(this.originalImageWidth / targetRatio);
          this.croppedImageY = Math.round((this.originalImageHeight - this.croppedImageHeight) / 2);
        }
        
        console.log(`RAILWAY PROCESSING: Set default crop to X: ${this.croppedImageX}, Y: ${this.croppedImageY}, Width: ${this.croppedImageWidth}, Height: ${this.croppedImageHeight}`);
        
        // DO NOT apply crop styling to product images - we'll directly crop in canvas
      }
      
      // Create a new promise chain to ensure correct execution order
      this.getCroppedImageFromDOM()
        .then(croppedImage => {
          if (croppedImage) {
            console.log('RAILWAY PROCESSING: Successfully captured cropped image');
            
            // If no text to add, we're done - update product image with the cropped image
            if (!this.textInfo) {
              console.log('RAILWAY PROCESSING: No text to add, updating image and dispatching final event');
              
              // Update the product image with the cropped image
              this.updateProductImage(croppedImage);
              
              // Set flags to indicate processing is done
              this.textProcessingComplete = true;
              this.finalProcessingComplete = true;
              
              // Dispatch event to signal final processing is complete
              const finalEvent = new CustomEvent('pixar-final-processing-complete', {
                detail: { 
                  imageUrl: croppedImage,
                  timestamp: Date.now()
                }
              });
              document.dispatchEvent(finalEvent);
              
              // Hide any loading popup that might still be visible
              this.hideLoadingPopup();
            } else {
              console.log('RAILWAY PROCESSING: Adding Name1 & Name2 text to image');
              
              // If the image is captured successfully, add text to it
              this.addTextToRailwayImage(croppedImage);
            }
          } else {
            console.log('RAILWAY PROCESSING: Could not capture cropped image, using original image');
            
            // If we can't capture the cropped image, use the original stylized image
            if (this.textInfo) {
              this.addTextToRailwayImage(this.stylizedImageUrl);
            } else {
              // No text to add, just finish the process with original image
              this.updateProductImage(this.stylizedImageUrl);
              
              // Set flags to indicate processing is done
              this.textProcessingComplete = true;
              this.finalProcessingComplete = true;
              
              const finalEvent = new CustomEvent('pixar-final-processing-complete', {
                detail: { 
                  imageUrl: this.stylizedImageUrl,
                  timestamp: Date.now()
                }
              });
              document.dispatchEvent(finalEvent);
              this.hideLoadingPopup();
            }
          }
        })
        .catch(error => {
          console.error('RAILWAY PROCESSING: Error in processing pipeline:', error);
          this.handleMainImageNotFound();
        });
    };
    
    img.onerror = (error) => {
      console.error('RAILWAY PROCESSING: Error loading image:', error);
      this.handleMainImageNotFound();
    };
    
    // Start loading the image
    img.src = this.stylizedImageUrl;
  }
  
  /**
   * Handle case where main image could not be found or loaded
   */
  handleMainImageNotFound() {
    console.error('RAILWAY PROCESSING: Could not find or load main product image');
    
    // We can still try to process the image for text if needed
    if (this.textInfo) {
      console.log('RAILWAY PROCESSING: Attempting to add text to original image without cropping');
      // Create default crop coordinates if none exist
      if (!this.cropCoordinates || !this.croppedImageWidth) {
        // Set default crop dimensions - assume source is 1000x1000 as fallback
        this.originalImageWidth = 1000;
        this.originalImageHeight = 1000;
        
        // Set a default center crop with 3:4 aspect ratio
        this.croppedImageWidth = 750;
        this.croppedImageHeight = 1000;
        this.croppedImageX = 125; // Centered horizontally
        this.croppedImageY = 0;
        
        console.log(`RAILWAY PROCESSING: Set default fallback crop - W:${this.croppedImageWidth}, H:${this.croppedImageHeight}`);
      }
      
      // Process directly without DOM cropping
      this.addTextToRailwayImage(this.stylizedImageUrl);
    } else {
      // No text to add, just finish the process and use the original image
      // Set flags to indicate processing is done
      this.textProcessingComplete = true;
      this.finalProcessingComplete = true;
      this.isProcessing = false;
      
      const finalEvent = new CustomEvent('pixar-final-processing-complete', {
        detail: { 
          imageUrl: this.stylizedImageUrl,
          timestamp: Date.now(),
          error: 'Could not find main product image'
        }
      });
      document.dispatchEvent(finalEvent);
      
      // Update the product image with the uncropped railway image
      this.updateProductImage(this.stylizedImageUrl);
      
      // Hide any loading popup
      this.hideLoadingPopup();
    }
  }
  
  /**
   * Load a fallback image directly without requiring DOM elements
   * @returns {Promise<string>} - Promise resolving to a data URL of the base image
   */
  loadDirectImageFallback() {
    return new Promise((resolve, reject) => {
      // Use the base mockup image URL from the screenshot
      const baseImageUrl = 'https://cartoonique.com/cdn/shop/files/f8336544-577a-4aff-9e06-c9df35868714.webp';
      
      console.log('RAILWAY PROCESSING: Loading fallback image from:', baseImageUrl);
      
      // Create a new image element to load the base image
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      
      baseImg.onload = () => {
        try {
          console.log('RAILWAY PROCESSING: Fallback base image loaded, dimensions:', baseImg.width, 'x', baseImg.height);
          
          // Create a canvas and draw the base image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to match the image
          canvas.width = baseImg.width;
          canvas.height = baseImg.height;
          
          // Draw the base image
          ctx.drawImage(baseImg, 0, 0, baseImg.width, baseImg.height);
          
          // Convert canvas to data URL
          const dataURL = canvas.toDataURL('image/png', 0.95);
          console.log('RAILWAY PROCESSING: Successfully captured fallback image');
          resolve(dataURL);
        } catch (err) {
          console.error('RAILWAY PROCESSING: Error processing fallback image:', err);
          reject(err);
        }
      };
      
      baseImg.onerror = (err) => {
        console.error('RAILWAY PROCESSING: Error loading fallback image:', err);
        
        // Try with a different protocol as a second fallback
        const alternateUrl = baseImageUrl.replace('https://', '//');
        console.log('RAILWAY PROCESSING: Trying alternate URL:', alternateUrl);
        
        const alternateImg = new Image();
        alternateImg.crossOrigin = 'anonymous';
        
        alternateImg.onload = () => {
          try {
            console.log('RAILWAY PROCESSING: Alternate fallback image loaded');
            
            // Create a canvas and draw the alternate image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = alternateImg.width;
            canvas.height = alternateImg.height;
            
            // Draw the alternate image
            ctx.drawImage(alternateImg, 0, 0, alternateImg.width, alternateImg.height);
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/png', 0.95);
            resolve(dataURL);
          } catch (altErr) {
            reject(altErr);
          }
        };
        
        alternateImg.onerror = (altErr) => {
          console.error('RAILWAY PROCESSING: Error loading alternate fallback image:', altErr);
          reject(altErr);
        };
        
        alternateImg.src = alternateUrl;
      };
      
      // Start loading the base image
      baseImg.src = baseImageUrl;
    });
  }
  
  /**
   * Apply CSS-based cropping to images after they are loaded
   * @returns {Promise} - A promise that resolves when cropping is complete
   */
  applyCropStylingToImages() {
    return new Promise((resolve) => {
      // This method is now simplified since we're using a different approach
      // that captures the image directly rather than applying CSS transforms
      
      console.log('CROP STYLING: Using direct image capture instead of CSS styling');
      resolve();
    });
  }
  
  /**
   * Get the cropped image from the DOM after CSS cropping has been applied
   * @returns {Promise<string>} - Promise resolving to a data URL of the cropped image
   */
  getCroppedImageFromDOM() {
    return new Promise((resolve, reject) => {
      try {
        // Find the main product image - look for all possible selectors
        const mainImg = document.querySelector('.product-gallery__media.snap-center.is-selected img') || 
                       document.querySelector('.product-gallery__media img') ||
                       document.querySelector('.product-gallery img') ||
                       document.querySelector('.product__media img') ||
                       // Add additional selectors based on the screenshot
                       document.querySelector('.product-media__image') ||
                       document.querySelector('img.lazyloaded[srcset*="f8336544-577a"]') ||
                       document.querySelector('img[alt="product-media__image"]') ||
                       document.querySelector('.media__image') ||
                       document.querySelector('img.product__image') ||
                       document.querySelector('img[data-zoom-src]') ||
                       document.querySelector('img[data-image-id]') ||
                       document.querySelector('.product-single__photo img') ||
                       // Last resort - any image in the product container
                       document.querySelector('.product-single img') ||
                       document.querySelector('.product__media-item img') ||
                       document.querySelector('.product-media img');
                              
        if (!mainImg) {
          console.error('RAILWAY PROCESSING: Could not find main product image');
          
          // Log all available image elements on the page to help with debugging
          const allImages = document.querySelectorAll('img');
          console.log('RAILWAY PROCESSING: Available images on page:', allImages.length);
          allImages.forEach((img, index) => {
            console.log(`Image ${index}:`, {
              src: img.src.substring(0, 100) + '...',
              alt: img.alt,
              class: img.className,
              id: img.id,
              parentClass: img.parentElement?.className
            });
          });
          
          reject(new Error('Could not find main product image'));
          return;
        }
        
        console.log('RAILWAY PROCESSING: Found main product image:', mainImg.src.substring(0, 100) + '...');
        
        // Create a new image to load the original source
        const sourceImg = new Image();
        sourceImg.crossOrigin = 'anonymous';
        
        sourceImg.onload = () => {
          try {
            console.log('RAILWAY PROCESSING: Original image loaded', sourceImg.width, 'x', sourceImg.height);
            
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate scaled crop based on the original image dimensions and crop coordinates
            const originalWidth = this.cropCoordinates.originalImageWidth;
            const originalHeight = this.cropCoordinates.originalImageHeight;
            
            // Calculate scaling factors between original and loaded image
            const scaleX = sourceImg.width / originalWidth;
            const scaleY = sourceImg.height / originalHeight;
            
            // Calculate actual crop dimensions with 5% padding to ensure we don't crop too tightly
            const padding = 0.05; // 5% padding
            const cropWidth = this.cropCoordinates.width * scaleX * (1 + padding * 2);
            const cropHeight = this.cropCoordinates.height * scaleY * (1 + padding * 2);
            
            // Center the crop with the padding
            const cropX = Math.max(0, (this.cropCoordinates.x * scaleX) - (this.cropCoordinates.width * scaleX * padding));
            const cropY = Math.max(0, (this.cropCoordinates.y * scaleY) - (this.cropCoordinates.height * scaleY * padding));
            
            // Make sure we don't exceed the original image dimensions
            const adjustedCropWidth = Math.min(cropWidth, sourceImg.width - cropX);
            const adjustedCropHeight = Math.min(cropHeight, sourceImg.height - cropY);
            
            // Set canvas size to match the crop dimensions while maintaining 3:4 aspect ratio
            if (adjustedCropWidth / adjustedCropHeight > 3/4) {
              // Width is the limiting factor
              canvas.width = adjustedCropWidth;
              canvas.height = adjustedCropWidth * (4/3);
            } else {
              // Height is the limiting factor
              canvas.height = adjustedCropHeight;
              canvas.width = adjustedCropHeight * (3/4);
            }
            
            // Fill with white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Center the image in the canvas
            const drawX = (canvas.width - adjustedCropWidth) / 2;
            const drawY = (canvas.height - adjustedCropHeight) / 2;
            
            // Draw the cropped portion of the original image
            ctx.drawImage(
              sourceImg,
              cropX, cropY, adjustedCropWidth, adjustedCropHeight,  // Source rectangle
              drawX, drawY, adjustedCropWidth, adjustedCropHeight   // Destination rectangle
            );
            
            // Convert canvas to data URL
            const dataURL = canvas.toDataURL('image/png', 0.95); // Use 0.95 quality to reduce size
            console.log('RAILWAY PROCESSING: Successfully captured cropped image');
            resolve(dataURL);
          } catch (err) {
            console.error('RAILWAY PROCESSING: Error capturing cropped image:', err);
            reject(err);
          }
        };
        
        sourceImg.onerror = (err) => {
          console.error('RAILWAY PROCESSING: Error loading source image:', err);
          reject(err);
        };
        
        // Load the original image
        sourceImg.src = mainImg.src;
      } catch (err) {
        console.error('RAILWAY PROCESSING: Error getting cropped image:', err);
        reject(err);
      }
    });
  }
  
  /**
   * Add text to the Railway processed image
   * @param {string} imageUrl - The URL of the image to add text to
   */
  addTextToRailwayImage(imageUrl) {
    console.log('RAILWAY TEXT: Image loaded, dimensions:', this.croppedImageWidth, 'x', this.croppedImageHeight);
    
    // Use text from the stored text info
    if (!this.textInfo) {
      console.error('RAILWAY TEXT: No text info available');
      
      // Set flags to indicate processing is done
      this.textProcessingComplete = true;
      this.finalProcessingComplete = true;
      
      // Dispatch a final event even with error
      const finalEvent = new CustomEvent('pixar-final-processing-complete', {
        detail: { 
          imageUrl: imageUrl,
          timestamp: Date.now(),
          error: 'No text info available'
        }
      });
      document.dispatchEvent(finalEvent);
      
      // Update product image with the cropped image even without text
      this.updateProductImage(imageUrl);
      
      // Hide any loading popup
      this.hideLoadingPopup();
      return;
    }
    
    // Add text with names
    console.log('RAILWAY TEXT: Adding text with names:', this.textInfo.text, this.textInfo.text2);
    if (this.textInfo.subtitle) {
      console.log('RAILWAY TEXT: Adding subtitle:', this.textInfo.subtitle);
    }
    
    // We'll create a canvas element to add text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Calculate canvas size (use the cropped image dimensions)
        const width = this.croppedImageWidth;
        const height = this.croppedImageHeight;
        
        // Set up canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image first
        ctx.drawImage(img, 0, 0, width, height);
        
        // Now add the text
        this.drawTextOnCanvas(ctx, width, height);
        
        // Convert the canvas to a data URL
        const dataURL = canvas.toDataURL('image/png');
        console.log('RAILWAY TEXT: Canvas converted to data URL');
        
        // Update the product image with the new image containing text
        this.updateProductImage(dataURL);
        
        // Set flags to indicate processing is done
        this.textProcessingComplete = true;
        this.finalProcessingComplete = true;
        
        // Dispatch event to signal final processing is complete
        console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event after text processing');
        const finalEvent = new CustomEvent('pixar-final-processing-complete', {
          detail: { 
            imageUrl: dataURL,
            timestamp: Date.now()
          }
        });
        document.dispatchEvent(finalEvent);
        
        // Hide any loading popup that might still be visible
        this.hideLoadingPopup();
      } catch (error) {
        console.error('RAILWAY TEXT: Error adding text to image:', error);
        
        // Set flags to indicate processing is done even on error
        this.textProcessingComplete = true;
        this.finalProcessingComplete = true;
        
        // Still dispatch event with error
        const finalEvent = new CustomEvent('pixar-final-processing-complete', {
          detail: { 
            imageUrl: imageUrl,
            timestamp: Date.now(),
            error: error.message || 'Error adding text to image'
          }
        });
        document.dispatchEvent(finalEvent);
        
        // Update product image with at least the cropped version
        this.updateProductImage(imageUrl);
        
        // Hide any loading popup
        this.hideLoadingPopup();
      }
    };
    
    img.onerror = (error) => {
      console.error('RAILWAY TEXT: Error loading image:', error);
      
      // Set flags to indicate processing is done even on error
      this.textProcessingComplete = true;
      this.finalProcessingComplete = true;
      
      // Try to use a cached version if available
      const cachedImage = document.querySelector('.pixar-transformed-image');
      const currentImageUrl = cachedImage ? cachedImage.src : imageUrl;
      
      // Still dispatch event with error
      const finalEvent = new CustomEvent('pixar-final-processing-complete', {
        detail: { 
          imageUrl: currentImageUrl,
          timestamp: Date.now(),
          error: 'Error loading image'
        }
      });
      document.dispatchEvent(finalEvent);
      
      // Update product image with the original Railway URL
      this.updateProductImage(this.stylizedImageUrl);
      
      // Hide any loading popup
      this.hideLoadingPopup();
    };
    
    // Start loading the image
    img.src = imageUrl;
  }

  // Add a new method to check if processing is complete
  isProcessingComplete() {
    return this.finalProcessingComplete;
  }

  /**
   * Poll Railway job status
   * @param {string} jobId - The job ID to poll
   * @param {number} attempt - The current attempt number (for backoff)
   */
  pollRailwayJobStatus(jobId, attempt = 1) {
    console.log(`🖼️ Polling Railway job status for job ${jobId}, attempt ${attempt}`);
    
    // Initialize job status tracking if needed
    if (!window.railwayJobsStatus) {
      window.railwayJobsStatus = {};
    }
    
    // Check if this job is already completed or failed
    if (window.railwayJobsStatus[jobId] === 'COMPLETED' || window.railwayJobsStatus[jobId] === 'FAILED') {
      console.log(`🖼️ Job ${jobId} already has final status: ${window.railwayJobsStatus[jobId]}, skipping poll`);
      return;
    }
    
    // Track that we're polling this job
    window.railwayJobsStatus[jobId] = window.railwayJobsStatus[jobId] || 'PENDING';
    
    // Implement reasonable timeout/limits
    if (attempt > 30) {
      console.log(`🖼️ Giving up on polling job ${jobId} after ${attempt} attempts`);
      window.railwayJobsStatus[jobId] = 'FAILED';
      return;
    }
    
    // Also track if we've already processed this job's completion
    if (!window.railwayJobsProcessed) {
      window.railwayJobsProcessed = {};
    }
    
    if (window.railwayJobsProcessed[jobId]) {
      console.log(`🖼️ Job ${jobId} already processed, skipping poll`);
      return;
    }
    
    fetch(`https://letzteshemd-faceswap-api-production.up.railway.app/status/${jobId}`, {
      method: 'GET'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`🖼️ Railway job status for ${jobId}:`, data);
      
      // Update global status tracking
      if (data.status) {
        window.railwayJobsStatus[jobId] = data.status.toUpperCase();
      }
      
      // Check job status
      if (data.status && data.status.toUpperCase() === 'COMPLETED') {
        // Get the image URL
        const imageUrl = data.watermarkedImageUrlToShow || 
                         data.processedImageUrl || 
                         data.watermarkedOriginalImageUrl ||
                         data.resultImageUrl ||
                         (data.image && data.image.url);
                         
        if (imageUrl) {
          console.log('🖼️ Railway job completed, image URL:', imageUrl);
          
          // Mark as processed to prevent duplicate processing
          window.railwayJobsProcessed[jobId] = true;
          
          // Store the URL and mark as complete
          this.stylizedImageUrl = imageUrl;
          this.transformationComplete = true;
          
          // Track that we've dispatched an event for this job
          if (!window.railwayJobsEventDispatched) {
            window.railwayJobsEventDispatched = {};
          }
          
          // Only dispatch event once per job
          if (!window.railwayJobsEventDispatched[jobId]) {
            window.railwayJobsEventDispatched[jobId] = true;
            
            // Trigger the transform complete event
            const customEvent = new CustomEvent('pixar-transform-complete', {
              detail: { imageUrl: imageUrl, timestamp: Date.now() }
            });
            document.dispatchEvent(customEvent);
          }
          
          // If crop is already complete, apply final processing
          if (this.cropComplete && this.textProcessingComplete) {
            this.applyFinalProcessing();
          }
        }
      } else if (data.status && data.status.toUpperCase() === 'FAILED') {
        console.error('🖼️ Railway job failed:', data);
        window.railwayJobsStatus[jobId] = 'FAILED';
      } else {
        // Continue polling with exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(1.5, Math.min(attempt - 1, 10)), 10000);
        console.log(`🖼️ Continuing to poll job ${jobId} in ${backoffTime}ms`);
        setTimeout(() => this.pollRailwayJobStatus(jobId, attempt + 1), backoffTime);
      }
    })
    .catch(error => {
      console.error('🖼️ Error polling Railway job status:', error);
      
      // Retry with backoff
      const backoffTime = Math.min(2000 * Math.pow(1.5, Math.min(attempt - 1, 8)), 15000);
      setTimeout(() => this.pollRailwayJobStatus(jobId, attempt + 1), backoffTime);
    });
  }
  
  /**
   * Utility method to clean up stale Railway job registrations
   * This helps prevent memory leaks from unfinished jobs
   * Called periodically or when the page is idle
   */
  cleanupStaleJobs() {
    // Clean up the tracking objects
    if (window.railwayApiCallsInProgress) {
      console.log('🖼️ Cleaning up stale Railway API calls tracking');
      
      // Remove tracking for files that have been processed more than 5 minutes ago
      const now = Date.now();
      const cutoffTime = 5 * 60 * 1000; // 5 minutes
      
      // Initialize timestamps for tracking if not already done
      if (!window.railwayApiCallTimestamps) {
        window.railwayApiCallTimestamps = {};
        
        // For existing entries, set current timestamp
        for (const fileId in window.railwayApiCallsInProgress) {
          window.railwayApiCallTimestamps[fileId] = now;
        }
      }
      
      // Check each file and remove stale entries
      for (const fileId in window.railwayApiCallsInProgress) {
        // If no timestamp exists, create one now
        if (!window.railwayApiCallTimestamps[fileId]) {
          window.railwayApiCallTimestamps[fileId] = now;
          continue;
        }
        
        const timestamp = window.railwayApiCallTimestamps[fileId];
        if (now - timestamp > cutoffTime) {
          console.log(`🖼️ Removing stale API call tracking for file ${fileId}`);
          delete window.railwayApiCallsInProgress[fileId];
          delete window.railwayApiCallTimestamps[fileId];
        }
      }
    }
  }
  
  /**
   * Returns stats about ongoing Railway API calls and job statuses
   * Useful for debugging duplicate calls
   */
  getRailwayStats() {
    const stats = {
      activeApiCalls: 0,
      completedJobs: 0,
      failedJobs: 0,
      pendingJobs: 0,
      totalTrackedFiles: 0
    };
    
    if (window.railwayApiCallsInProgress) {
      stats.totalTrackedFiles = Object.keys(window.railwayApiCallsInProgress).length;
      stats.activeApiCalls = stats.totalTrackedFiles;
    }
    
    if (window.railwayJobsStatus) {
      for (const jobId in window.railwayJobsStatus) {
        const status = window.railwayJobsStatus[jobId];
        if (status === 'COMPLETED') stats.completedJobs++;
        else if (status === 'FAILED') stats.failedJobs++;
        else stats.pendingJobs++;
      }
    }
    
    return stats;
  }

  /**
   * Centralized method to send an image to Railway API
   * This is the ONLY method that should directly call the Railway API
   * @param {File} file - The file to send
   * @param {Object} options - Additional options
   * @returns {Promise} - Promise that resolves with the job ID
   */
  sendImageToRailway(file, options = {}) {
    if (!file) {
      console.error('🖼️ Cannot send to Railway: No file provided');
      return Promise.reject(new Error('No file provided'));
    }
    
    // Create a unique file identifier to prevent duplicate processing
    const fileIdentifier = `${file.name}-${file.size}-${file.lastModified || Date.now()}`;
    
    // Initialize tracking for API calls if not already done
    if (!window.railwayApiCallsInProgress) {
      window.railwayApiCallsInProgress = {};
    }
    
    // Check if we're already processing this file
    if (window.railwayApiCallsInProgress[fileIdentifier]) {
      console.log(`🖼️ Already processing file ${file.name}, skipping duplicate request`);
      return Promise.resolve({ 
        alreadyProcessing: true, 
        fileIdentifier: fileIdentifier 
      });
    }
    
    // Mark this file as being processed
    window.railwayApiCallsInProgress[fileIdentifier] = true;
    
    // Initialize tracking timestamps if not already done
    if (!window.railwayApiCallTimestamps) {
      window.railwayApiCallTimestamps = {};
    }
    window.railwayApiCallTimestamps[fileIdentifier] = Date.now();
    
    return new Promise((resolve, reject) => {
      // Use FileReader to convert file to base64
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageBase64 = e.target.result;
        
        // Create payload
        const payload = {
          image: imageBase64,
          style: 'pixar',
          watermark: {
            url: "https://cdn.shopify.com/s/files/1/0626/3416/4430/files/watermark.png",
            width: 200,
            height: 100,
            spaceBetweenWatermarks: 100
          }
        };
        
        console.log(`🖼️ Sending image ${file.name} to Railway API`);
        
        // Call the Railway transform endpoint
        fetch('https://letzteshemd-faceswap-api-production.up.railway.app/transform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          timeout: 60000 // 60 second timeout
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('🖼️ Railway API response:', data);
          
          // Extract jobId
          const jobId = data.jobId || data.id;
          
          if (jobId) {
            console.log(`🖼️ Successfully received jobId: ${jobId} for file ${file.name}`);
            
            // Initialize job status tracking if needed
            if (!window.railwayJobsStatus) {
              window.railwayJobsStatus = {};
            }
            
            // Mark job as 'PENDING' initially
            window.railwayJobsStatus[jobId] = 'PENDING';
            
            // Start polling for status - but only once
            this.pollRailwayJobStatus(jobId);
            
            // Return the job ID
            resolve({
              jobId: jobId,
              fileIdentifier: fileIdentifier
            });
          } else {
            const error = new Error('No job ID returned from Railway API');
            console.error('🖼️ ' + error.message);
            
            // Clean up tracking
            delete window.railwayApiCallsInProgress[fileIdentifier];
            delete window.railwayApiCallTimestamps[fileIdentifier];
            
            reject(error);
          }
        })
        .catch(error => {
          console.error('🖼️ Error calling Railway API:', error);
          
          // Clean up tracking on error
          delete window.railwayApiCallsInProgress[fileIdentifier];
          delete window.railwayApiCallTimestamps[fileIdentifier];
          
          reject(error);
        });
      };
      
      reader.onerror = (error) => {
        console.error('🖼️ Error reading file:', error);
        
        // Clean up tracking on error
        delete window.railwayApiCallsInProgress[fileIdentifier];
        delete window.railwayApiCallTimestamps[fileIdentifier];
        
        reject(new Error('Could not read file'));
      };
      
      // Start the file reading process
      reader.readAsDataURL(file);
    });
  }

  /**
   * Draw text on canvas with proper styling
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawTextOnCanvas(ctx, width, height) {
    // Get both names from textInfo
    const name1 = this.textInfo.name1 || this.textInfo.text || '';
    const name2 = this.textInfo.name2 || this.textInfo.text2 || '';
    const subtitle = this.textInfo.subtitle || '';
        
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
        
        // Auto-fit text based on canvas width and text length - INITIAL ESTIMATE
        const maxFontSize = 200; // Increased from 150 to allow larger text
        const calculatedFontSize = Math.floor(usableWidth / (textLength * 0.45)); // Reduced multiplier from 0.55 to 0.45 for bigger text
        let scaledFontSize = Math.min(maxFontSize, calculatedFontSize);
        
        // Ensure minimum font size for readability
    const minFontSize = Math.max(30, Math.floor(width / 16)); // Increased minimum font size
        scaledFontSize = Math.max(minFontSize, scaledFontSize);
        
        // Now precisely calculate width for Name1 & Name2 format
        ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        
        // Measure the exact width of each component
        const firstPartWidth = ctx.measureText(name1.toUpperCase()).width;
        const ampersandWidth = ctx.measureText(' & ').width;
        const secondPartWidth = ctx.measureText(name2.toUpperCase()).width;
        const totalTextWidth = firstPartWidth + ampersandWidth + secondPartWidth;
        
        // Calculate the scaling factor needed to make text exactly 80% of canvas width
        const targetWidth = usableWidth;
        const scaleFactor = targetWidth / totalTextWidth;
        
        // Apply the scaling factor to font size (scale up or down as needed)
        scaledFontSize = Math.floor(scaledFontSize * scaleFactor);
        
        // Apply final bounds
        scaledFontSize = Math.max(minFontSize, Math.min(maxFontSize, scaledFontSize));
        
        console.log('RAILWAY TEXT: Font size precision scaling - initial:', calculatedFontSize, 
                   'measured width:', totalTextWidth, 'target width:', targetWidth, 
                   'scale factor:', scaleFactor, 'final size:', scaledFontSize);
        
        console.log('RAILWAY TEXT: Font size calculation - usableWidth:', usableWidth, 'textLength:', textLength);
        console.log('RAILWAY TEXT: Calculated font size:', scaledFontSize, 'from raw calculation:', calculatedFontSize);
        
        // Apply text settings
        ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        ctx.fillStyle = this.textInfo.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate letter spacing inversely proportional to font size
        // As font size increases, letter spacing should decrease
        const letterSpacingEm = Math.max(0.01, 0.04 - (scaledFontSize / 2000)); // Reduced letter spacing for taller text
        console.log('RAILWAY TEXT: Dynamic letter spacing:', letterSpacingEm + 'em', 'for font size:', scaledFontSize);
        
        // Do a test measurement to see if the text would fit within the usable width
    const maxFontWidth = width * 0.8;
        const testTextWidth = ctx.measureText(formattedText).width;
        if (testTextWidth > maxFontWidth) {
          // If it doesn't fit, recalculate font size to ensure it fits
          scaledFontSize = Math.floor(scaledFontSize * (maxFontWidth / testTextWidth)); // Removed safety margin
          console.log('RAILWAY TEXT: Adjusting font size to', scaledFontSize, 'because text width', testTextWidth, 'exceeds usable width', maxFontWidth);
          ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        }
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 7; // Increased shadow blur
        ctx.shadowOffsetX = 3; // Increased shadow offset
        ctx.shadowOffsetY = 3; // Increased shadow offset
        
        // Calculate text position (centered horizontally, near bottom)
    const x = width / 2;
    const y = height * 0.87; // Position at 87% from top (was 0.92)
        
        // Handle multi-line text and special ampersand case
        const lines = formattedText.split('\n');
        const lineHeight = scaledFontSize * 1.2; // 1.2x line height
        
        if (lines.length > 1) {
          // For multi-line text, calculate the total height and position accordingly
          const totalTextHeight = lineHeight * lines.length;
          let startY;
          
          if (this.textInfo.position === 'top') {
            startY = y;
          } else if (this.textInfo.position === 'bottom') {
            startY = y - (totalTextHeight - lineHeight);
          } else {
            startY = y - (totalTextHeight / 2) + (lineHeight / 2);
          }
          
          console.log('FINAL PROCESSING: Drawing multi-line text, total height:', totalTextHeight);
          
          // Draw each line
          lines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);
            ctx.fillText(line, x, lineY);
            console.log('FINAL PROCESSING: Drawing line', index, 'at Y:', lineY);
          });
        } else {
          // Handle all text rendering cases
          if (name1 && name2) {
            // Canvas doesn't support HTML, so we'll draw the ampersand with special spacing
            // Calculate letter spacing proportional to font size
            const letterSpacingPx = scaledFontSize * letterSpacingEm;
            const ampersandWidth = ctx.measureText(' & ').width;
            
            // Draw Name 1 with adjusted letter spacing
            const name1Text = name1.toUpperCase();
            
            // Calculate the total width with adjusted spacing
            let totalName1Width = 0;
            for (let i = 0; i < name1Text.length; i++) {
              totalName1Width += ctx.measureText(name1Text[i]).width;
            }
            // Add spacing between all characters except the last
            totalName1Width += letterSpacingPx * (name1Text.length - 1);
            
            // Draw Name 2 with adjusted letter spacing
            const name2Text = name2.toUpperCase();
            
            // Calculate the total width with adjusted spacing
            let totalName2Width = 0;
            for (let i = 0; i < name2Text.length; i++) {
              totalName2Width += ctx.measureText(name2Text[i]).width;
            }
            // Add spacing between all characters except the last
            totalName2Width += letterSpacingPx * (name2Text.length - 1);
            
            // Calculate total width for centering
            const totalWidth = totalName1Width + ampersandWidth + totalName2Width;
            
            // Adjust font size if total width exceeds 80% of canvas width
        if (totalWidth > width * 0.8) {
          const scaleFactor = (width * 0.8) / totalWidth;
              scaledFontSize = Math.floor(scaledFontSize * scaleFactor);
              ctx.font = `900 ${scaledFontSize}px 'Montserrat', 'Arial Black', sans-serif`;
              
              // Recalculate everything with new font size
              const newLetterSpacingPx = scaledFontSize * letterSpacingEm;
              const newAmpersandWidth = ctx.measureText(' & ').width;
              
              // Recalculate Name1 width
              let newTotalName1Width = 0;
              for (let i = 0; i < name1Text.length; i++) {
                newTotalName1Width += ctx.measureText(name1Text[i]).width;
              }
              newTotalName1Width += newLetterSpacingPx * (name1Text.length - 1);
              
              // Recalculate Name2 width
              let newTotalName2Width = 0;
              for (let i = 0; i < name2Text.length; i++) {
                newTotalName2Width += ctx.measureText(name2Text[i]).width;
              }
              newTotalName2Width += newLetterSpacingPx * (name2Text.length - 1);
              
              // Update all variables with new measurements
              totalName1Width = newTotalName1Width;
              totalName2Width = newTotalName2Width;
              const newTotalWidth = totalName1Width + newAmpersandWidth + totalName2Width;
              
              console.log('FINAL PROCESSING: Adjusted font size to', scaledFontSize, 'for custom letter spacing, new total width:', newTotalWidth);
            }
            
            // Calculate starting position for the entire text
            const startX = x - (totalWidth / 2);
            
            // Starting position for first name
            let currentX = startX;
            
            // Draw each character of Name 1 with spacing
            for (let i = 0; i < name1Text.length; i++) {
              const char = name1Text[i];
              const charWidth = ctx.measureText(char).width;
              
              // Draw the character
              ctx.fillText(char, currentX + (charWidth / 2), y);
              
              // Move to the next position
              currentX += charWidth + letterSpacingPx;
            }
            
            // Adjust for the last letter spacing that we don't need
            currentX -= letterSpacingPx;
            
            // Draw ampersand with slightly different styling if possible
            ctx.fillText('&', currentX + (ampersandWidth / 2), y);
            currentX += ampersandWidth;
            
            // Draw each character of Name 2 with spacing
            for (let i = 0; i < name2Text.length; i++) {
              const char = name2Text[i];
              const charWidth = ctx.measureText(char).width;
              
              // Draw the character
              ctx.fillText(char, currentX + (charWidth / 2), y);
              
              // Move to the next position
              currentX += charWidth + letterSpacingPx;
            }
            
            console.log('FINAL PROCESSING: Drew "Name 1 & Name 2" format with adjusted letter spacing');
          } else if (name1) {
            // Draw just name1
            ctx.fillText(name1.toUpperCase(), x, y);
            console.log('FINAL PROCESSING: Drew single name (name1):', name1);
          } else if (name2) {
            // Draw just name2
            ctx.fillText(name2.toUpperCase(), x, y);
            console.log('FINAL PROCESSING: Drew single name (name2):', name2);
          } else {
            console.log('FINAL PROCESSING: No text to draw - empty names');
          }
        }
        
        // After drawing the main text, add the subtitle if available
        if (subtitle) {
          // Calculate subtitle font size (smaller than main text, but proportional)
          const subtitleFontSize = Math.max(Math.floor(scaledFontSize * 0.35), 16);
          
          // Set subtitle styling
          ctx.font = `italic ${subtitleFontSize}px 'Montserrat', 'Arial', sans-serif`;
      ctx.fillStyle = this.textInfo.color || '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add shadow for subtitle
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Position subtitle below the main text
          const subtitleY = y + (scaledFontSize * 0.8);
          
          // Check if subtitle is too long and needs to be wrapped
          const maxSubtitleWidth = usableWidth * 0.9; // Use slightly more width than main text
          const subtitleWidth = ctx.measureText(subtitle).width;
          
          if (subtitleWidth > maxSubtitleWidth) {
            console.log('FINAL PROCESSING: Subtitle too long, wrapping or truncating');
            
            // Try to break subtitle into words for wrapping
            const words = subtitle.split(' ');
            let line = '';
            let lines = [];
            
            // Create wrapped lines that fit the max width
            for (let i = 0; i < words.length; i++) {
              const testLine = line + (line ? ' ' : '') + words[i];
              const testWidth = ctx.measureText(testLine).width;
              
              if (testWidth > maxSubtitleWidth && line !== '') {
                lines.push(line);
                line = words[i];
              } else {
                line = testLine;
              }
            }
            
            // Add the last line
            if (line) {
              lines.push(line);
            }
            
            // If we have more than 2 lines, truncate to 2 lines with ellipsis
            if (lines.length > 2) {
              console.log('FINAL PROCESSING: Subtitle has too many lines, truncating to 2');
              const lastLine = lines[1];
              const truncateAt = Math.floor(lastLine.length * 0.8);
              lines[1] = lastLine.substring(0, truncateAt) + '...';
              lines = lines.slice(0, 2);
            }
            
            // Draw each line of the subtitle
            const lineHeight = subtitleFontSize * 1.2;
            lines.forEach((line, index) => {
              ctx.fillText(line, x, subtitleY + (index * lineHeight));
            });
            
            console.log('FINAL PROCESSING: Wrapped subtitle into', lines.length, 'lines');
          } else {
            // Draw the subtitle as a single line
            ctx.fillText(subtitle, x, subtitleY);
            console.log('FINAL PROCESSING: Subtitle added as single line at Y:', subtitleY);
      }
    }
  }

  /**
   * Find the main product image on the page
   * @returns {HTMLImageElement|null} - The main product image element or null if not found
   */
  findMainProductImage() {
    console.log('🖼️ Searching for main product image');
    
    try {
      // Try various selectors for main product image based on common theme patterns
      let mainImage = null;
      
      // First check if we have already updated any images that have our special class
      mainImage = document.querySelector('.pixar-transformed-image');
      if (mainImage) {
        console.log('🖼️ Found previously transformed product image');
        return mainImage;
      }
      
      // Dawn theme pattern
      mainImage = document.querySelector('.product__media img:not(.product__thumbnail)') ||
                document.querySelector('.product-media-modal__content img.product__media-item');
                
      // Empire theme pattern
      if (!mainImage) {
        mainImage = document.querySelector('.product-single__photo:not(.hide) img') ||
                  document.querySelector('.photoswipe__image:not([aria-hidden="true"]) img');
      }
      
      // Debut theme pattern 
      if (!mainImage) {
        mainImage = document.querySelector('.product-featured-img') ||
                  document.querySelector('#ProductPhotoImg');
      }
      
      // Brooklyn theme pattern
      if (!mainImage) {
        mainImage = document.querySelector('.product-single__photo:not(.hide) img') ||
                  document.querySelector('.slick-current .product-single__photo img');
      }
      
      // Narrative theme pattern
      if (!mainImage) {
        mainImage = document.querySelector('.product__image-wrapper img') ||
                  document.querySelector('.product__images-container img');
      }
      
      // Venture theme pattern
      if (!mainImage) {
        mainImage = document.querySelector('.product-single__media--featured img') ||
                  document.querySelector('.product-single__media--active img');
      }
      
      // Try to find images inside a gallery
      if (!mainImage) {
        const galleryContainer = document.querySelector('.product-gallery') ||
                               document.querySelector('.product__media-list') ||
                               document.querySelector('.product-single__photos') ||
                               document.querySelector('.product-single__media-group');
        
        if (galleryContainer) {
          mainImage = galleryContainer.querySelector('img:not(.product__thumbnail)');
        }
      }
      
      // Generic fallback - find largest visible image in product area
      if (!mainImage) {
        const productContainer = document.querySelector('.product') ||
                               document.querySelector('[data-product-container]') ||
                               document.querySelector('[data-section-type="product-template"]');
        
        if (productContainer) {
          let largestImage = null;
          let largestArea = 0;
          
          // Find all images in the product container
          const productImages = productContainer.querySelectorAll('img');
          for (const img of productImages) {
            // Skip thumbnails and icons
            if (img.width < 100 || img.height < 100) continue;
            if (img.classList.contains('product__thumbnail')) continue;
            
            // Skip hidden images
            const style = window.getComputedStyle(img);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            
            // Calculate visible area
            const area = img.width * img.height;
            if (area > largestArea) {
              largestArea = area;
              largestImage = img;
            }
          }
          
          if (largestImage) {
            mainImage = largestImage;
          }
        }
      }
      
      // Last resort - look for any large image on the page
      if (!mainImage) {
        const allImages = document.querySelectorAll('img');
        let largestImage = null;
        let largestArea = 0;
        
        for (const img of allImages) {
          // Skip very small images (likely icons)
          if (img.width < 100 || img.height < 100) continue;
          
          // Calculate area
          const area = img.width * img.height;
          if (area > largestArea) {
            largestArea = area;
            largestImage = img;
          }
        }
        
        if (largestImage) {
          mainImage = largestImage;
        }
      }
      
      if (mainImage) {
        console.log('🖼️ Found main product image:', mainImage);
        // Add our special class for future reference
        mainImage.classList.add('pixar-transformed-image');
        return mainImage;
      }
      
      console.error('🖼️ Could not find main product image');
      return null;
    } catch (error) {
      console.error('🖼️ Error finding main product image:', error);
      return null;
    }
  }

  /**
   * Get the cropped image from the DOM
   * @returns {string|null} - Data URL of the cropped image or null if not found
   */
  getCroppedImageFromDOM() {
    try {
      console.log('🖼️ Attempting to capture cropped image from DOM');
      
      // For cropping, we don't need the main product image since it might be using wrong source
      // We'll always work directly with the Railway image URL (this.stylizedImageUrl)
      if (!this.stylizedImageUrl) {
        console.log('🖼️ No Railway image URL available for cropping');
        return null;
      }
      
      // Check if we have crop coordinates
      if (!this.cropCoordinates || !this.originalImageWidth) {
        console.log('🖼️ No crop coordinates available, returning full image');
        return this.stylizedImageUrl;
      }
      
      // Create a canvas with 3:4 aspect ratio for the final image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set the canvas to the cropped dimensions (already calculated in processCropForMainImage)
      // These should already be in the correct 3:4 aspect ratio
      canvas.width = this.croppedImageWidth;
      canvas.height = this.croppedImageHeight;
      
      // Log the dimensions we're using
      console.log(`🖼️ Creating crop canvas with dimensions ${canvas.width}x${canvas.height}`);
      console.log(`🖼️ Using crop coordinates X:${this.croppedImageX}, Y:${this.croppedImageY}, W:${this.croppedImageWidth}, H:${this.croppedImageHeight}`);
      
      // Create an image to draw from - we'll use the railway image directly
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Return a promise that resolves with the cropped image
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            console.log(`🖼️ Source image loaded with dimensions ${img.width}x${img.height}`);
            
            // Fill with white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw only the cropped portion of the image
            ctx.drawImage(
              img,
              this.croppedImageX,  // Source X
              this.croppedImageY,  // Source Y
              this.croppedImageWidth,  // Source width
              this.croppedImageHeight, // Source height
              0, 0, // Destination X, Y (always 0, 0 for our canvas)
              canvas.width, // Destination width
              canvas.height // Destination height
            );
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/png', 0.95);
            console.log('🖼️ Successfully captured cropped image from DOM');
            resolve(dataURL);
          } catch (error) {
            console.error('🖼️ Error drawing cropped image on canvas:', error);
            
            // If there's an error with our sophisticated approach, try a simpler approach
            console.log('🖼️ Trying simpler cropping approach as fallback');
            try {
              // Clear canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Try to draw the entire image and let the browser calculate scaling
              // This draws the entire source image, scaled to fit our target dimensions
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              const dataURL = canvas.toDataURL('image/png', 0.95);
              console.log('🖼️ Successfully captured image with fallback approach');
              resolve(dataURL);
            } catch (fallbackError) {
              console.error('🖼️ Error with fallback approach:', fallbackError);
              // Fall back to the original image source
              resolve(this.stylizedImageUrl);
            }
          }
        };
        
        img.onerror = (error) => {
          console.error('🖼️ Error loading image for cropping:', error);
          // Fall back to the original image source
          resolve(this.stylizedImageUrl);
        };
        
        // Start loading the image - use the stylized image URL for cropping
        img.src = this.stylizedImageUrl;
      });
    } catch (error) {
      console.error('🖼️ Error in getCroppedImageFromDOM:', error);
      return this.stylizedImageUrl;
    }
  }

  /**
   * Apply crop styling to all product images
   */
  applyCropStylingToImages() {
    try {
      console.log('🖼️ Applying crop styling to product images');
      
      // Create a style element for the crop styling if it doesn't exist
      let cropStyle = document.getElementById('pixar-crop-style');
      if (!cropStyle) {
        cropStyle = document.createElement('style');
        cropStyle.id = 'pixar-crop-style';
        document.head.appendChild(cropStyle);
      }
      
      // Create CSS for the crop
      const cssRules = `
        .pixar-transformed-image {
          object-position: -${this.croppedImageX}px -${this.croppedImageY}px !important;
          object-fit: none !important;
          width: ${this.croppedImageWidth}px !important;
          height: ${this.croppedImageHeight}px !important;
        }
        
        .pixar-transform-container {
          position: relative;
          width: ${this.croppedImageWidth}px;
          height: ${this.croppedImageHeight}px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .pixar-transform-container img {
          position: absolute;
          top: -${this.croppedImageY}px;
          left: -${this.croppedImageX}px;
          width: auto;
          height: auto;
          max-width: none;
          max-height: none;
        }
      `;
      
      // Set the CSS
      cropStyle.textContent = cssRules;
      
      // Start with the main product image (this is guaranteed to exist because we just updated it)
      const mainImage = this.findMainProductImage();
      if (mainImage) {
        // Ensure the main image has our class
        mainImage.classList.add('pixar-transformed-image');
        
        // Wrap in a container if needed
        this.wrapImageInContainer(mainImage);
        
        // Now find all images that should have the same styling
        // This includes product images, gallery images, carousel images, etc.
        const productImages = document.querySelectorAll([
          '[data-product-image]', 
          '.product__media img', 
          '.product-single__photo img', 
          '.product-featured-img',
          '.product__image-container img',
          '.product-image-main',
          '.product-image img',
          '.product-gallery img',
          '.product-single__media img',
          '.product__slide img',
          '.product-single__media--featured img',
          '.product__image img',
          '.featured-img'
        ].join(', '));
        
        // Count only images that aren't already transformed and meet minimum size
        const imagesToTransform = Array.from(productImages).filter(img => {
          // Skip the main image (already done)
          if (img === mainImage) return false;
          
          // Skip small images (thumbnails)
          if (img.naturalWidth < 100 || img.naturalHeight < 100) return false;
          
          // Skip non-visible images
          const style = window.getComputedStyle(img);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          
          // Skip images already styled
          if (img.classList.contains('pixar-transformed-image')) return false;
          
          return true;
        });
        
        console.log(`🖼️ Found ${imagesToTransform.length} additional product images to apply styling to`);
        
        // Apply styling to these images
        imagesToTransform.forEach((img, index) => {
          img.classList.add('pixar-transformed-image');
          this.wrapImageInContainer(img);
        });
        
        console.log(`🖼️ Applied crop styling to ${imagesToTransform.length + 1} product images (including main image)`);
      } else {
        console.warn('🖼️ Main product image not found, cannot apply crop styling');
      }
    } catch (error) {
      console.error('🖼️ Error applying crop styling to images:', error);
    }
  }
  
  /**
   * Helper method to wrap an image in a container if needed
   * @param {HTMLImageElement} img - The image element to wrap
   */
  wrapImageInContainer(img) {
    // For some themes, we need to wrap the image in a container
    if (img.parentElement && !img.parentElement.classList.contains('pixar-transform-container')) {
      // Check if the parent is a suitable container (e.g., already has positioning)
      const style = window.getComputedStyle(img.parentElement);
      const needsContainer = style.position === 'static';
      
      if (needsContainer) {
        console.log(`🖼️ Creating wrapper container for image ${img.src.substring(0, 50)}...`);
        
        // Create a wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('pixar-transform-container');
        
        // Replace the image with the wrapper containing the image
        const parent = img.parentElement;
        parent.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }
    }
  }

  /**
   * Redirect to checkout (or cart) with the processed image
   * @param {string} size - The size of the product (e.g., "30x40")
   */
  redirectToCheckout(size) {
    console.log('Adding to cart with size:', size);
    
    // Find variant ID based on the size
    const variantSelector = document.querySelector('select.product-variant-select, select[name="id"], [data-variant-selector]');
    const variantId = variantSelector ? variantSelector.value : null;
    
    if (!variantId) {
      console.error('No variant ID found for checkout');
      // Fallback to try to find variant ID from the DOM
      const metaVariant = document.querySelector('meta[property="product:variant_id"], [data-variant-id]');
      if (metaVariant) {
        metaVariant.getAttribute('content') || metaVariant.getAttribute('data-variant-id');
      }
    }
    
    if (!this.processedImageUrl) {
      console.error('No processed image URL found for checkout');
      // Try with default settings if available
      this.generateTransformedImage();
      
      if (!this.processedImageUrl) {
        alert('Unable to generate a transformed image. Please try again or contact support.');
        return;
      }
    }
    
    // Ensure we have a numeric variant ID
    const numericVariantId = variantId ? parseInt(variantId, 10) : null;
    
    // Store the processed image URL for cart display
    const processedImageUrl = this.processedImageUrl;
    
    // Helper function to safely store image in various storage mechanisms
    const storeImageSafely = (variantId, imageUrl) => {
      try {
        if (!variantId || !imageUrl) {
          console.error('Missing variant ID or image URL for storage');
          return false;
        }
        
        // Handle large base64 images - convert to blob URL for better performance
        if (imageUrl.startsWith('data:image')) {
          console.log('Converting base64 image to blob URL for better performance');
          try {
            // Convert base64 to blob
            const byteString = atob(imageUrl.split(',')[1]);
            const mimeType = imageUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([ab], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            
            // Store in localStorage - just store a marker that we're using a blob
            // Then store the blob URL in the window object for immediate access
            const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
            cartImages[variantId] = 'BLOB_URL:' + variantId;
            localStorage.setItem('cartoonique_cart_images', JSON.stringify(cartImages));
            
            // Store the variant ID -> blob URL mapping in the window object for immediate access
            if (!window.cartoonique_blob_urls) {
              window.cartoonique_blob_urls = {};
            }
            window.cartoonique_blob_urls[variantId] = blobUrl;
            
            // Store the current variant and image URL for cart page preloading
            sessionStorage.setItem('cartoonique_current_variant', variantId);
            window.cartoonique_current_image = blobUrl;
            
            // Set a flag for the cart page to know it should preload images
            localStorage.setItem('cartoonique_preload_cart_images', 'true');
            
            // Also store navigation data for faster page transitions
            const navigationData = {
              variantId: variantId,
              imageUrl: blobUrl,
              timestamp: Date.now()
            };
            localStorage.setItem('cartoonique_navigation_data', JSON.stringify(navigationData));
            
            return true;
          } catch (e) {
            console.error('Error converting base64 to blob:', e);
            // Fallback to storing in window object
            if (!window.cartoonique_memory_images) {
              window.cartoonique_memory_images = {};
            }
            window.cartoonique_memory_images[variantId] = imageUrl;
            
            // Store reference in localStorage
            const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
            cartImages[variantId] = 'MEMORY_IMAGE:' + variantId;
            localStorage.setItem('cartoonique_cart_images', JSON.stringify(cartImages));
            
            return true;
          }
        } else {
          // Not a base64 image, store as is
          const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
          cartImages[variantId] = imageUrl;
          localStorage.setItem('cartoonique_cart_images', JSON.stringify(cartImages));
          
          // Also store in window object for immediate access
          if (!window.cartoonique_blob_urls) {
            window.cartoonique_blob_urls = {};
          }
          window.cartoonique_blob_urls[variantId] = imageUrl;
          
          // Set preload flag and navigation data
          localStorage.setItem('cartoonique_preload_cart_images', 'true');
          const navigationData = {
            variantId: variantId,
            imageUrl: imageUrl,
            timestamp: Date.now()
          };
          localStorage.setItem('cartoonique_navigation_data', JSON.stringify(navigationData));
          
          return true;
        }
      } catch (error) {
        console.error('Storage error:', error);
        
        // If we still hit an error, revert to the window object approach
        try {
          console.log('Storing image in memory as fallback');
          if (!window.cartoonique_memory_images) {
            window.cartoonique_memory_images = {};
          }
          window.cartoonique_memory_images[variantId] = imageUrl;
          
          // Store just a reference in localStorage
          const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
          cartImages[variantId] = 'MEMORY_IMAGE:' + variantId;
          localStorage.setItem('cartoonique_cart_images', JSON.stringify(cartImages));
          
          return true;
        } catch (fallbackError) {
          console.error('Failed to store image with fallback method:', fallbackError);
          return false;
        }
      }
    };
    
    // Try to store the image
    const storageResult = storeImageSafely(numericVariantId, processedImageUrl);
    
    // Update cart image replacement code to be aware of our storage approach
    this.setupCartImageReplacementWithFallbacks();
    
    // Show loading state in the popup instead of closing it immediately
    const popup = document.querySelector('#pixar-result-popup');
    const popupContent = popup ? popup.querySelector('.result-popup__content') : null;
    const resultImage = popup ? popup.querySelector('.result-wrapper__image') : null;
    
    if (popup && popupContent && resultImage) {
      // Create loading UI
      const loadingElement = document.createElement('div');
      loadingElement.className = 'result-popup__loading';
      loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Adding to cart...</p>
      `;
      
      // Hide the result image and show loading
      resultImage.style.opacity = '0.3';
      popupContent.appendChild(loadingElement);
    }
    
    // Prepare for cart/checkout with line item properties
    const formData = new FormData();
    formData.append('id', numericVariantId);
    formData.append('quantity', 1);
    
    // Add line item properties to store our image URLs with the cart item
    formData.append('properties[_processed_image_url]', processedImageUrl);
    formData.append('properties[_watermarked_image_url]', processedImageUrl); // Using same URL for now, but could be different in future
    
    // If we generated a print-ready version, store that too
    if (this.processedPrintImageUrl) {
      formData.append('properties[_processed_print_image_url]', this.processedPrintImageUrl);
    }
    
    // Get the form
    const form = document.querySelector('form[action="/cart/add"]');
    
    // Get form action - default to /cart/add if not found
    const formAction = form ? form.getAttribute('action') || '/cart/add' : '/cart/add';
    
    // Add fetch options
    const fetchOptions = {
      method: 'POST',
      body: formData
    };
    
    // Add to cart using fetch
    fetch(formAction + '.js', fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(cartData => {
        console.log('Product added to cart:', cartData);
        
        // Directly trigger our image update method for cart image refresh
        // This ensures the image shows up immediately in the cart without refresh
        this.updateCartImages(processedImageUrl, numericVariantId).then(updatedCount => {
          console.log(`Updated ${updatedCount} cart images directly after add to cart`);
        });
        
        // Check if we should go to cart or checkout
        const goToCheckout = false; // Toggle this if you want direct checkout
        
        // Close popup if it exists
        if (popup) {
          // Remove loading UI first
          const loadingElement = popup.querySelector('.result-popup__loading');
          if (loadingElement) {
            loadingElement.remove();
          }
          
          // Restore image visibility
          if (resultImage) {
            resultImage.style.opacity = '1';
          }
          
          // Toggle popup closed
          popup.setAttribute('aria-hidden', 'true');
        }
        
        // Redirect based on preference
        if (goToCheckout) {
          // Go directly to checkout
          window.location.href = '/checkout';
        } else {
          // Update the cart count
          this.updateCartCount(cartData.item_count);
          
          // Look for cart drawer toggle
          const cartDrawerToggle = document.querySelector('[data-cart-toggle], [data-action="open-drawer"][data-drawer="cart"], [aria-controls="cart-drawer"]');
          if (cartDrawerToggle) {
            cartDrawerToggle.click();
          } else {
            // If no drawer toggle, just go to cart page
            window.location.href = '/cart';
          }
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        alert('There was a problem adding this item to your cart. Please try again.');
        
        // Remove loading state if present
        if (popup) {
          const loadingElement = popup.querySelector('.result-popup__loading');
          if (loadingElement) {
            loadingElement.remove();
          }
          
          // Restore image visibility
          if (resultImage) {
            resultImage.style.opacity = '1';
          }
        }
      });
  }
  
  /**
   * Set up hooks to replace cart images with processed images
   * This version handles fallback storage methods
   */
  setupCartImageReplacementWithFallbacks() {
    console.log('Setting up cart image replacement with fallback storage handling');
    
    // Create a script element with a direct approach to image replacement
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        console.log('Direct cart image replacement script started with fallback support');
        
        // Cache DOM queries and data to avoid repeated lookups
        const cachedImages = new Map();
        const processedVariants = new Set();
        
        // Function to get an image URL from our various storage locations
        function getStoredImageForVariant(variantId) {
          // Check if we already looked up this variant
          if (processedVariants.has(variantId)) {
            return cachedImages.get(variantId) || null;
          }
          
          // Mark as processed to avoid redundant lookups
          processedVariants.add(variantId);
          
          let imageUrl = null;
          
          // First check if we have a blob URL in the window object
          if (window.cartoonique_blob_urls && window.cartoonique_blob_urls[variantId]) {
            imageUrl = window.cartoonique_blob_urls[variantId];
          }
          // Then check if we have a memory image
          else if (window.cartoonique_memory_images && window.cartoonique_memory_images[variantId]) {
            imageUrl = window.cartoonique_memory_images[variantId];
          }
          // Finally check localStorage
          else {
            try {
              const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
              const storedValue = cartImages[variantId];
              
              if (storedValue) {
                // Handle various storage formats
                if (typeof storedValue === 'string') {
                  if (storedValue.startsWith('MEMORY_IMAGE:')) {
                    const memoryVariantId = storedValue.split(':')[1];
                    if (window.cartoonique_memory_images && window.cartoonique_memory_images[memoryVariantId]) {
                      imageUrl = window.cartoonique_memory_images[memoryVariantId];
                    }
                  } else if (storedValue.startsWith('SESSION_STORAGE:')) {
                    imageUrl = sessionStorage.getItem('cartoonique_image_' + variantId);
                  } else if (storedValue === 'CURRENT_PROCESSED_IMAGE') {
                    const currentVariant = sessionStorage.getItem('cartoonique_current_variant');
                    if (currentVariant === variantId && window.cartoonique_current_image) {
                      imageUrl = window.cartoonique_current_image;
                    }
                  } else {
                    imageUrl = storedValue;
                  }
                }
              }
            } catch (error) {
              console.error('Error retrieving image from storage:', error);
            }
          }
          
          // Cache the result for future lookups
          cachedImages.set(variantId, imageUrl);
          return imageUrl;
        }
        
        // Check for preload details (if coming from product page)
        let navigationData = null;
        try {
          const navDataStr = localStorage.getItem('cartoonique_navigation_data');
          if (navDataStr) {
            navigationData = JSON.parse(navDataStr);
            // Use this data for instant image replacement if possible
            if (navigationData && navigationData.variantId && navigationData.imageUrl) {
              cachedImages.set(navigationData.variantId, navigationData.imageUrl);
            }
          }
        } catch (e) {
          console.warn('Error parsing navigation data', e);
        }
        
        // Direct replacement function
        function replaceCartImages() {
          // Target specifically the exact class combination we see in the cart
          console.log('Searching for cart images to replace...');
          
          // Method 1: Direct target by class - including the exact class combination from provided HTML
          const cartImages = document.querySelectorAll(
            '.cart-item__image.shape__target-image.multiply-mode__target.lazyautosizes.ls-is-cached.lazyloaded, ' +
            '.cart-item__image.shape__target-image.multiply-mode__target, ' + 
            '.cart-item__image.shape__target-image.lazyautosizes.lazyloaded, ' +
            '.cart-item__image.shape__target-image, ' + 
            '.cart-item__image'
          );
          console.log('Found ' + cartImages.length + ' cart images with target classes');
          
          // Early exit if no images found - don't waste processing
          if (cartImages.length === 0) {
            return 0;
          }
          
          let replacedCount = 0;
          
          cartImages.forEach(img => {
            // Check if we've already processed this image
            if (img.dataset.processed === 'true') {
              return;
            }
            
            // Get image src, alt and srcset
            const src = img.src || '';
            const alt = img.alt || '';
            
            // Try to find the variant ID for this image
            let foundVariantId = null;
            
            // Look for variant ID in various places
            function findVariantIdForImage(img) {
              // First check if the image itself has any data attributes
              if (img.dataset.variantId) return img.dataset.variantId;
              if (img.dataset.id) return img.dataset.id;
              
              // Check parent elements for variant ID
              let element = img.parentElement;
              const checkedElements = new Set();
              
              for (let depth = 0; depth < 10; depth++) {
                if (!element || checkedElements.has(element)) break;
                checkedElements.add(element);
                
                // Check for data attributes
                const variantId = element.dataset.variantId || 
                                 element.dataset.id || 
                                 element.dataset.variant || 
                                 element.dataset.itemId ||
                                 element.dataset.cartItemId;
                
                if (variantId) return variantId;
                
                // Check href attributes
                const href = element.getAttribute('href');
                if (href) {
                  const variantMatch = href.match(/variant=([0-9]+)/);
                  if (variantMatch && variantMatch[1]) return variantMatch[1];
                  
                  const pathVariantMatch = href.match(/\\?variant=([0-9]+)/);
                  if (pathVariantMatch && pathVariantMatch[1]) return pathVariantMatch[1];
                }
                
                // Move up the DOM tree
                element = element.parentElement;
              }
              
              // Check the cart item ID from cart drawer if available
              const cartItemContainer = img.closest('[id^="CartItem-"]');
              if (cartItemContainer) {
                const cartItemId = cartItemContainer.id;
                const idMatch = cartItemId.match(/CartItem-([0-9]+)/);
                if (idMatch && idMatch[1]) return idMatch[1];
              }
              
              return null;
            }
            
            // Try to find variant ID using the function
            foundVariantId = findVariantIdForImage(img);
            
            // If we found a variant ID, check if we have a stored image for it
            if (foundVariantId) {
              const storedImageUrl = getStoredImageForVariant(foundVariantId);
              
              if (storedImageUrl) {
                // Save original attributes before changing
                if (!img.dataset.originalSrc) {
                  img.dataset.originalSrc = img.src || '';
                }
                if (!img.dataset.originalSrcset) {
                  img.dataset.originalSrcset = img.getAttribute('srcset') || '';
                }
                if (!img.dataset.originalSizes) {
                  img.dataset.originalSizes = img.getAttribute('sizes') || '';
                }
                
                // Apply image directly without creating a new one for faster replacement
                // Clear srcset completely for consistent display
                img.removeAttribute('srcset');
                img.removeAttribute('sizes');
                img.removeAttribute('data-srcset');
                img.removeAttribute('data-sizes');
                
                // Set the new image source
                img.src = storedImageUrl;
                img.dataset.processed = 'true';
                img.loading = 'eager';
                
                // Also update style properties for better display
                img.style.objectFit = 'contain';
                img.style.width = '100%';
                img.style.height = 'auto';
                
                replacedCount++;
              }
            }
          });
          
          // Log the results only if replacements happened
          if (replacedCount > 0) {
            console.log('Replaced ' + replacedCount + ' cart images');
          }
          
          return replacedCount;
        }
        
        // Check if we're on the cart page and preloading is needed
        if (window.location.pathname === '/cart' && localStorage.getItem('cartoonique_preload_cart_images') === 'true') {
          // We're loading the cart page for the first time - do immediate replacement
          console.log('Detected first cart page load, starting immediate image replacement');
          localStorage.removeItem('cartoonique_preload_cart_images');
          
          // Run on page interactive - don't wait for full page load
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              replaceCartImages();
            });
          } else {
            replaceCartImages();
          }
        }
        
        // Run immediately and after short delays with increasing frequency at the beginning
        // to catch various rendering scenarios
        replaceCartImages();
        setTimeout(replaceCartImages, 100);
        setTimeout(replaceCartImages, 250); 
        setTimeout(replaceCartImages, 500);
        setTimeout(replaceCartImages, 1000);
        
        // Also observe DOM changes to catch any dynamically added content
        const observer = new MutationObserver((mutations) => {
          // Check if any mutations involve relevant nodes before running expensive operation
          let shouldReplace = false;
          
          for (const mutation of mutations) {
            // For added nodes
            if (mutation.addedNodes.length > 0) {
              for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element node
                  if (node.classList && 
                      (node.classList.contains('cart-item') || 
                       node.classList.contains('cart-item__image') ||
                       node.tagName === 'IMG')) {
                    shouldReplace = true;
                    break;
                  }
                  
                  // Check if node contains relevant elements
                  if (node.querySelector && node.querySelector('.cart-item__image')) {
                    shouldReplace = true;
                    break;
                  }
                }
              }
            }
            
            // For attribute changes on images
            if (mutation.type === 'attributes' && 
                mutation.target.tagName === 'IMG' &&
                !mutation.target.dataset.processed &&
                (mutation.target.classList.contains('cart-item__image') ||
                 mutation.target.classList.contains('shape__target-image'))) {
              shouldReplace = true;
              break;
            }
            
            if (shouldReplace) break;
          }
          
          // Only run replacement if needed
          if (shouldReplace) {
            replaceCartImages();
          }
        });
        
        // Start observing immediately
        observer.observe(document.body, { 
          childList: true, 
          subtree: true,
          attributes: true, 
          attributeFilter: ['src', 'srcset', 'class', 'data-src', 'style']
        });
        
        // Handle AJAX cart updates by listening for custom events
        document.addEventListener('cart:refresh', function(event) {
          console.log('Caught cart:refresh event, will update images');
          setTimeout(replaceCartImages, 100);
          setTimeout(replaceCartImages, 500);
        });
        
        // Also listen for standard Shopify events
        document.addEventListener('cart:updated', function(event) {
          console.log('Caught cart:updated event, will update images');
          setTimeout(replaceCartImages, 100);
          setTimeout(replaceCartImages, 500);
        });
      })();
    `;
    
    // Add the script to the document
    document.head.appendChild(script);
    
    // If we're already on the cart page, inject an immediate execution script
    if (window.location.pathname.includes('/cart')) {
      console.log('Already on cart page, triggering immediate image replacement');
      const immediateScript = document.createElement('script');
      immediateScript.textContent = `
        console.log('Immediate cart image replacement executing');
        
        // Directly inject CSS to ensure our images display correctly
        const style = document.createElement('style');
        style.textContent = \`
          .cart-item__image.shape__target-image.multiply-mode__target[data-processed="true"],
          .cart-item__image.shape__target-image[data-processed="true"],
          .cart-item__image[data-processed="true"] {
            object-fit: contain !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 !important;
          }
        \`;
        document.head.appendChild(style);
      `;
      document.head.appendChild(immediateScript);
    }
  }

  // Add this method to maintain compatibility with existing code
  setupCartImageReplacement() {
    console.log('Redirecting to setupCartImageReplacementWithFallbacks for better storage handling');
    this.setupCartImageReplacementWithFallbacks();
  }
  
  /**
   * Directly update cart images with provided image URL or stored images
   * @param {string} imageUrl - Optional specific image URL to use
   * @param {string} variantId - Optional specific variant ID to target
   * @returns {number} - Number of images updated
   */
  updateCartImages(imageUrl = null, variantId = null) {
    console.log('Manually updating cart images', variantId ? `for variant ${variantId}` : '');
    
    // Create and execute an immediate script to update cart images
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        // Utility function to find images
        function findCartImages() {
          return document.querySelectorAll(
            '.cart-item__image.shape__target-image.multiply-mode__target.lazyautosizes.ls-is-cached.lazyloaded, ' +
            '.cart-item__image.shape__target-image.multiply-mode__target, ' + 
            '.cart-item__image.shape__target-image.lazyautosizes.lazyloaded, ' +
            '.cart-item__image.shape__target-image, ' + 
            '.cart-item__image'
          );
        }
        
        // Get stored image for variant
        function getStoredImageForVariant(targetVariantId) {
          // First check provided image URL
          if ('${imageUrl}' && targetVariantId === '${variantId}') {
            return '${imageUrl}';
          }
          
          // Then check window storage mechanisms
          if (window.cartoonique_blob_urls && window.cartoonique_blob_urls[targetVariantId]) {
            return window.cartoonique_blob_urls[targetVariantId];
          }
          
          if (window.cartoonique_memory_images && window.cartoonique_memory_images[targetVariantId]) {
            return window.cartoonique_memory_images[targetVariantId];
          }
          
          try {
            // Check localStorage
            const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
            const storedValue = cartImages[targetVariantId];
            
            if (storedValue) {
              if (typeof storedValue === 'string') {
                if (storedValue.startsWith('MEMORY_IMAGE:')) {
                  const memoryVariantId = storedValue.split(':')[1];
                  if (window.cartoonique_memory_images && window.cartoonique_memory_images[memoryVariantId]) {
                    return window.cartoonique_memory_images[memoryVariantId];
                  }
                } else if (storedValue.startsWith('SESSION_STORAGE:')) {
                  return sessionStorage.getItem('cartoonique_image_' + targetVariantId);
                } else if (storedValue === 'CURRENT_PROCESSED_IMAGE') {
                  const currentVariant = sessionStorage.getItem('cartoonique_current_variant');
                  if (currentVariant === targetVariantId && window.cartoonique_current_image) {
                    return window.cartoonique_current_image;
                  }
                } else {
                  return storedValue;
                }
              }
            }
          } catch (error) {
            console.error('Error getting stored image:', error);
          }
          
          return null;
        }
        
        // Find variant ID for image
        function findVariantIdForImage(img) {
          // Direct data attributes
          if (img.dataset.variantId) return img.dataset.variantId;
          if (img.dataset.id) return img.dataset.id;
          
          // Check parent elements
          let element = img.parentElement;
          const checkedElements = new Set();
          
          for (let depth = 0; depth < 10; depth++) {
            if (!element || checkedElements.has(element)) break;
            checkedElements.add(element);
            
            // Data attributes
            const variantId = element.dataset.variantId || 
                             element.dataset.id || 
                             element.dataset.variant || 
                             element.dataset.itemId ||
                             element.dataset.cartItemId;
            
            if (variantId) return variantId;
            
            // URL parameters
            const href = element.getAttribute('href');
            if (href) {
              const variantMatch = href.match(/variant=([0-9]+)/);
              if (variantMatch && variantMatch[1]) return variantMatch[1];
              
              const pathVariantMatch = href.match(/\\?variant=([0-9]+)/);
              if (pathVariantMatch && pathVariantMatch[1]) return pathVariantMatch[1];
            }
            
            element = element.parentElement;
          }
          
          // Cart item container ID
          const cartItemContainer = img.closest('[id^="CartItem-"]');
          if (cartItemContainer) {
            const cartItemId = cartItemContainer.id;
            const idMatch = cartItemId.match(/CartItem-([0-9]+)/);
            if (idMatch && idMatch[1]) return idMatch[1];
          }
          
          // Use provided variant ID if all else fails
          return '${variantId}' || null;
        }
        
        // Apply the update
        function updateImages() {
          const cartImages = findCartImages();
          console.log('Found ' + cartImages.length + ' cart images to potentially update');
          
          let updatedCount = 0;
          
          cartImages.forEach(img => {
            // Skip already processed images unless we're forcing an update
            if (img.dataset.processed === 'true' && !Boolean(${!!imageUrl})) {
              return;
            }
            
            // Get variant ID
            const foundVariantId = findVariantIdForImage(img);
            
            // Skip if we have a specific variant ID target and this isn't it
            if ('${variantId}' && foundVariantId !== '${variantId}') {
              return;
            }
            
            // Get image URL - either provided directly or from storage
            const targetImageUrl = '${imageUrl}' || getStoredImageForVariant(foundVariantId);
            
            if (targetImageUrl) {
              // Save original attributes if not saved already
              if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src || '';
              }
              if (!img.dataset.originalSrcset) {
                img.dataset.originalSrcset = img.getAttribute('srcset') || '';
              }
              if (!img.dataset.originalSizes) {
                img.dataset.originalSizes = img.getAttribute('sizes') || '';
              }
              
              // Remove potentially conflicting attributes
              img.removeAttribute('srcset');
              img.removeAttribute('sizes');
              img.removeAttribute('data-srcset');
              img.removeAttribute('data-sizes');
              
              // Update the image
              img.src = targetImageUrl;
              img.dataset.processed = 'true';
              img.loading = 'eager';
              
              // Style for better display
              img.style.objectFit = 'contain';
              img.style.width = '100%';
              img.style.height = 'auto';
              
              updatedCount++;
            }
          });
          
          console.log('Updated ' + updatedCount + ' cart images');
          return updatedCount;
        }
        
        // Run update immediately and after a short delay
        const initial = updateImages();
        setTimeout(updateImages, 100);
        setTimeout(updateImages, 500);
        
        // Return initial count
        return initial;
      })();
    `;
    
    document.head.appendChild(script);
    
    // Return a promise that resolves with the number of images updated
    return new Promise(resolve => {
      // Give it time to run
      setTimeout(() => {
        // Look for cart images with data-processed attribute as a proxy for success
        const processedImages = document.querySelectorAll('.cart-item__image[data-processed="true"]');
        resolve(processedImages.length);
      }, 700);
    });
  }

  /**
   * Update the cart count indicator in the UI
   * @param {number} count - The new cart count
   */
  updateCartCount(count) {
    console.log('Updating cart count to:', count);
    
    if (!count && count !== 0) return;
    
    // Find all cart count indicators
    const cartCountIndicators = document.querySelectorAll(
      '.cart-count, .cart-count-bubble, [data-cart-count], [data-cart-indicator], .js-cart-count'
    );
    
    // Update each indicator
    cartCountIndicators.forEach(indicator => {
      // Check if this is a span or div that should have its text content updated
      if (indicator.tagName === 'SPAN' || indicator.tagName === 'DIV') {
        indicator.textContent = count;
      }
      
      // Check if this is an element with a data-count attribute
      if (indicator.hasAttribute('data-count')) {
        indicator.setAttribute('data-count', count);
      }
      
      // Show/hide based on count
      if (count > 0) {
        indicator.classList.remove('hidden', 'hide', 'is-hidden');
        indicator.removeAttribute('hidden');
      } else {
        indicator.classList.add('hidden');
      }
    });
    
    // Also dispatch a custom event for other components that might be listening
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { cartCount: count }
    }));
  }
}

// Initialize static instance property
ImageProcessingManager.instance = null;

// Export the class
window.ImageProcessingManager = ImageProcessingManager;

// Initialize the manager when the script loads
if (!window.imageProcessingManager) {
  window.imageProcessingManager = new ImageProcessingManager();
  console.log('🖼️ Image Processing Manager loaded and initialized');
  
  // Set up periodic cleanup of stale jobs
  setInterval(() => {
    if (window.imageProcessingManager) {
      window.imageProcessingManager.cleanupStaleJobs();
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
  
  // Also set up cleanup when the page becomes idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      if (window.imageProcessingManager) {
        window.imageProcessingManager.cleanupStaleJobs();
      }
    });
  }
}

// Make the global functions reference our manager's methods
if (window.processImageWithRunPod && !window.originalProcessImageWithRunPod) {
  window.originalProcessImageWithRunPod = window.processImageWithRunPod;
  window.processImageWithRunPod = function(file, options = {}) {
    console.log('🖼️ Image Processing Manager intercepted processImageWithRunPod call for file:', file.name);
    
    // Delegate to our centralized method if we have an ImageProcessingManager instance
    if (window.imageProcessingManager) {
      window.imageProcessingManager.sendImageToRailway(file, options)
        .then(result => {
          if (result.alreadyProcessing) {
            console.log('🖼️ File is already being processed by Railway, avoiding duplicate call');
          } else {
            console.log(`🖼️ File sent to Railway via centralized method, job ID: ${result.jobId}`);
          }
        })
        .catch(error => {
          console.error('🖼️ Error sending to Railway via centralized method:', error);
          
          // Fallback to original implementation only if our centralized method fails
    if (window.originalProcessImageWithRunPod) {
            console.log('🖼️ Falling back to original processImageWithRunPod implementation');
            try {
              window.originalProcessImageWithRunPod(file, options);
            } catch(err) {
              console.error('🖼️ Error in original processImageWithRunPod:', err);
            }
          }
        });
    } else {
      // If ImageProcessingManager isn't available, use the original function
      console.log('🖼️ ImageProcessingManager not available, using original implementation');
      if (window.originalProcessImageWithRunPod) {
        try {
          window.originalProcessImageWithRunPod(file, options);
        } catch(err) {
          console.error('🖼️ Error in original processImageWithRunPod:', err);
        }
      }
    }
  };
} else {
  console.log('🖼️ processImageWithRunPod not found at initialization time, will check later');
  
  // Try to set it up after a short delay to ensure it's available
  setTimeout(() => {
    if (window.processImageWithRunPod && !window.originalProcessImageWithRunPod) {
      console.log('🖼️ Found processImageWithRunPod on retry, setting up interception');
      window.originalProcessImageWithRunPod = window.processImageWithRunPod;
      window.processImageWithRunPod = function(file, options = {}) {
        console.log('🖼️ Image Processing Manager intercepted processImageWithRunPod call for file:', file.name);
        
        // Delegate to our centralized method if we have an ImageProcessingManager instance
        if (window.imageProcessingManager) {
          window.imageProcessingManager.sendImageToRailway(file, options)
            .then(result => {
              if (result.alreadyProcessing) {
                console.log('🖼️ File is already being processed by Railway, avoiding duplicate call');
              } else {
                console.log(`🖼️ File sent to Railway via centralized method, job ID: ${result.jobId}`);
              }
            })
            .catch(error => {
              console.error('🖼️ Error sending to Railway via centralized method:', error);
              
              // Fallback to original implementation only if our centralized method fails
        if (window.originalProcessImageWithRunPod) {
                console.log('🖼️ Falling back to original processImageWithRunPod implementation');
                try {
                  window.originalProcessImageWithRunPod(file, options);
                } catch(err) {
                  console.error('🖼️ Error in original processImageWithRunPod:', err);
                }
              }
            });
        } else {
          // If ImageProcessingManager isn't available, use the original function
          console.log('🖼️ ImageProcessingManager not available, using original implementation');
          if (window.originalProcessImageWithRunPod) {
            try {
              window.originalProcessImageWithRunPod(file, options);
            } catch(err) {
              console.error('🖼️ Error in original processImageWithRunPod:', err);
            }
          }
        }
      };
    } else {
      console.log('🖼️ processImageWithRunPod still not available after delay');
    }
  }, 1000);
}

// When the cropping is complete, we need to ensure the file gets sent to Railway
const originalHandleCropComplete = ImageProcessingManager.prototype.handleCropComplete;
if (originalHandleCropComplete) {
  ImageProcessingManager.prototype.handleCropComplete = function(croppedImage) {
    console.log('🖼️ Enhanced handleCropComplete called with cropped image');
    
    // Call the original method first
    originalHandleCropComplete.call(this, croppedImage);
    
    // Track that we've handled the crop completion
    this.cropHandled = true;
    
    // After cropping is complete, check if we need to send to Railway
    // Only send if the image wasn't already sent in handleFileSelected
    if (this.processedImage && !this.sentToRailway && typeof window.processImageWithRunPod !== 'function') {
      console.log('🖼️ Cropping complete, checking if we need to send to Railway');
      
      // Convert data URL to File object for processImageWithRunPod
      const byteString = atob(this.processedImage.split(',')[1]);
      const mimeType = this.processedImage.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeType });
      const filename = 'cropped-image-' + Date.now() + '.png';
      const file = new File([blob], filename, { type: mimeType });
      
      console.log('🖼️ Created File object from cropped image data URL');
      
      // Use our centralized method to send the cropped image
      this.sendImageToRailway(file, { isCropped: true })
        .then(result => {
          if (result.alreadyProcessing) {
            console.log('🖼️ Cropped file is already being processed');
          } else {
            // Mark as sent to Railway to avoid duplicate sends
            this.sentToRailway = true;
            console.log(`🖼️ Cropped image sent to Railway, job ID: ${result.jobId}`);
          }
        })
        .catch(error => {
          console.error('🖼️ Error sending cropped image to Railway:', error);
          
          // Try using the component's handleFileSelect if our method fails
          if (typeof window.pixarComponent?.handleFileSelect === 'function') {
            console.log('🖼️ Falling back to pixarComponent.handleFileSelect with cropped image');
        // Create a fake event object
        const fakeEvent = {
          target: {
            files: [file]
          }
        };
        window.pixarComponent.handleFileSelect(fakeEvent);
      }
        });
    } else {
      console.log('🖼️ Cropping complete, but image was already sent to Railway earlier or processImageWithRunPod is available');
    }
  };
  console.log('🖼️ Enhanced handleCropComplete method installed');
} else {
  console.log('🖼️ Original handleCropComplete method not found');
}

// Export the manager for direct use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessingManager;
} 