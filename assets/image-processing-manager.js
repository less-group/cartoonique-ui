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
    
    // Track loading popup element - we'll use this to know when to hide it
    document.addEventListener('DOMContentLoaded', () => {
      const loadingPopup = document.getElementById('pixar-loading-popup');
      if (loadingPopup) {
        // Create a MutationObserver to detect when loading popup is about to be hidden
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              // If popup is being hidden while processing isn't complete, keep it showing
              if (loadingPopup.style.display === 'none' && this.isProcessing && !this.finalProcessingComplete) {
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
    // Find the pixar component
    this.pixarComponent = document.querySelector('pixar-transform-file-input');
    
    if (!this.pixarComponent) {
      console.log('Pixar component not found yet, will try again later');
      setTimeout(() => this.findAndSetupPixarComponent(), 500);
      return;
    }
    
    console.log('Pixar component found, setting up');
    
    // Hook into the original file input event
    const fileInputs = this.pixarComponent.querySelectorAll('input[type="file"]');
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
  }
  
  /**
   * Handle when a file is selected via file input
   * @param {Event} event - The file input change event
   */
  handleFileSelected(event) {
    console.log('ImageProcessingManager.handleFileSelected called', event);
    if (!event.target.files || !event.target.files.length) {
      console.error('No files selected');
      return;
    }
    
    // Store the original file
    this.originalFile = event.target.files[0];
    console.log('File selected:', this.originalFile.name, this.originalFile.type, this.originalFile.size);
    
    // Reset crop and text processing flags
    this.cropComplete = false;
    this.textProcessingComplete = false;
    
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
   * Update the product image with the final processed image
   * @param {String} imageUrl - The URL of the final image
   */
  updateProductImage(imageUrl) {
    console.log('PRODUCT IMAGE: Updating all product gallery images with new image');
    
    // If the pixar component has a method for this, use it
    if (this.pixarComponent && typeof this.pixarComponent.updateProductGalleryImage === 'function') {
      console.log('PRODUCT IMAGE: Using pixar component method');
      this.pixarComponent.updateProductGalleryImage(imageUrl);
      return;
    }
    
    // Look for the global function if available
    if (window.updateProductGalleryImage) {
      console.log('PRODUCT IMAGE: Using global function');
      window.updateProductGalleryImage(imageUrl);
      return;
    }
    
    // Fallback: Find product images and update them
    console.log('PRODUCT IMAGE: Using direct DOM updates with:', imageUrl.substring(0, 100) + '...');
    
    // Find all possible product image elements
    const imagesToUpdate = [
      // Main product image (left side mockup)
      document.querySelector('.product-gallery__media.snap-center.is-selected img.rounded'),
      document.querySelector('.product-gallery__media.snap-center img'),
      document.querySelector('.product-gallery__media img'),
      document.querySelector('.product-gallery img'),
      document.querySelector('.product__media img'),
      
      // Thumbnails
      ...Array.from(document.querySelectorAll('.product-gallery__thumbnail img'))
    ].filter(Boolean); // Remove null/undefined entries
    
    // Update each image found
    if (imagesToUpdate.length > 0) {
      // Remove any existing wrappers to ensure clean replacement
      document.querySelectorAll('.pixar-crop-wrapper').forEach(wrapper => {
        // Get the original image inside
        const img = wrapper.querySelector('img');
        if (img) {
          // Get the wrapper's parent
          const parent = wrapper.parentElement;
          // Move the image outside the wrapper
          if (parent) {
            parent.insertBefore(img, wrapper);
            // Remove the wrapper
            wrapper.remove();
          }
        }
      });
      
      // Reset all styles and classes that might interfere
      document.querySelectorAll('img.pixar-cropped').forEach(img => {
        img.classList.remove('pixar-cropped');
        img.style.transform = '';
        img.style.position = '';
        img.style.width = '';
        img.style.height = '';
        img.style.objectFit = '';
        img.style.transformOrigin = '';
      });
      
      // Clear any previous crop styles
      const oldStyles = document.getElementById('pixar-crop-style');
      if (oldStyles) {
        oldStyles.remove();
      }
      
      imagesToUpdate.forEach(img => {
        // Save original src for potential restoration
        if (!img.dataset.originalSrc) {
          img.dataset.originalSrc = img.src;
        }
        
        // Update the image src directly with the new image
        img.src = imageUrl;
        
        // Try to update srcset if it exists to avoid responsive image issues
        if (img.srcset) {
          img.srcset = imageUrl;
        }
        
        // Ensure the image maintains its original dimensions
        img.style.maxWidth = '100%';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        
        // Remove any transforms or positioning that might crop the image
        img.style.transform = 'none';
        img.style.position = 'relative';
        
        // Ensure parent container properly displays the entire image
        const parent = img.parentElement;
        if (parent) {
          parent.style.overflow = 'visible';
          parent.style.position = 'relative';
          parent.style.width = '100%';
          parent.style.height = 'auto';
          parent.style.aspectRatio = '3/4';
        }
      });
      
      console.log(`PRODUCT IMAGE: Updated ${imagesToUpdate.length} product images with new design`);
    } else {
      console.warn('PRODUCT IMAGE: Could not find any product images to update');
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
    console.log('FINAL PROCESSING: Applying Railway image with CSS-based cropping');
    
    // Clean up any existing text overlays
    document.querySelectorAll('.pixar-text-overlay, .pixar-text-fallback').forEach(el => el.remove());
    
    // First, update the product image with the Railway URL (without text)
    this.updateProductImage(this.stylizedImageUrl);
    
    // Move directly to capturing the image without CSS cropping
    // Get the updated product image directly
    this.getCroppedImageFromDOM().then(croppedImage => {
      console.log('RAILWAY PROCESSING: Successfully captured image');
      
      // Check if we need to add text - allow for either name to be present
      if (this.textInfo && (this.textInfo.text || this.textInfo.text2)) {
        console.log('RAILWAY PROCESSING: Adding Name1 & Name2 text to image');
        
        // Add text to the cropped image
        this.addTextToRailwayImage(croppedImage)
          .then(finalImageWithText => {
            // Apply the final image with cropping and text embedded
            console.log('RAILWAY PROCESSING: Text added to image, applying to product');
            this.updateProductImage(finalImageWithText);
            
            // NOW that processing is truly complete, dispatch event and set flag
            this.finalProcessingComplete = true;
            this.isProcessing = false;
            document.dispatchEvent(new CustomEvent('pixar-final-processing-complete', {
              detail: { imageUrl: finalImageWithText }
            }));
            console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event after text processing');
          })
          .catch(error => {
            console.error('RAILWAY PROCESSING: Error adding text to image:', error);
            
            // Mark as complete even though there was an error
            this.finalProcessingComplete = true;
            this.isProcessing = false;
            document.dispatchEvent(new CustomEvent('pixar-final-processing-complete', {
              detail: { imageUrl: croppedImage, error: true }
            }));
            console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event (with error)');
          });
      } else {
        // No valid text needed (we require both name1 and name2), just use the cropped image
        console.log('RAILWAY PROCESSING: No text added - requires both Name1 and Name2');
        this.updateProductImage(croppedImage);
        
        // Now that processing is complete, dispatch event
        this.finalProcessingComplete = true;
        this.isProcessing = false;
        document.dispatchEvent(new CustomEvent('pixar-final-processing-complete', {
          detail: { imageUrl: croppedImage }
        }));
        console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event after cropping');
      }
    }).catch(error => {
      console.error('RAILWAY PROCESSING: Error capturing image:', error);
      
      // Mark as complete even though there was an error
      this.finalProcessingComplete = true;
      this.isProcessing = false;
      document.dispatchEvent(new CustomEvent('pixar-final-processing-complete', {
        detail: { imageUrl: this.stylizedImageUrl, error: true }
      }));
      console.log('FINAL PROCESSING: Dispatched pixar-final-processing-complete event (with capture error)');
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
                       document.querySelector('.product__media img');
                              
        if (!mainImg) {
          console.error('RAILWAY PROCESSING: Could not find main product image');
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
   * Add text to a Railway image using canvas
   * @param {string} imageUrl - The URL of the Railway image
   * @returns {Promise<string>} - Promise resolving to a data URL of the image with text
   */
  addTextToRailwayImage(imageUrl) {
    return new Promise((resolve, reject) => {
      // Create an image object to load the Railway image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('RAILWAY TEXT: Image loaded, dimensions:', img.width, 'x', img.height);
        
        // Create a canvas to draw the image and add text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image onto the canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Get both names from textInfo
        const name1 = this.textInfo.text || '';
        const name2 = this.textInfo.text2 || '';
        const subtitle = this.textInfo.subtitle || '';
        
        console.log('RAILWAY TEXT: Adding text with names:', name1, name2);
        if (subtitle) {
          console.log('RAILWAY TEXT: Adding subtitle:', subtitle);
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
        
        // Calculate text length for font sizing
        const textLength = (name1.length + name2.length + (name1 && name2 ? 3 : 0));
        
        // Calculate usable width - use 80% of the canvas width to leave margin
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
        const maxFontWidth = canvas.width * 0.8;
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
        const x = canvas.width / 2;
        const y = canvas.height * 0.87; // Position at 87% from top (was 0.92)
        
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
        
        // Convert canvas to data URL and resolve the promise
        const dataURL = canvas.toDataURL('image/png');
        console.log('RAILWAY TEXT: Canvas converted to data URL');
        resolve(dataURL);
      };
      
      img.onerror = (error) => {
        console.error('RAILWAY TEXT: Error loading image:', error);
        reject(error);
      };
      
      // Set the source to load the image
      img.src = imageUrl;
    });
  }

  // Add a new method to check if processing is complete
  isProcessingComplete() {
    return this.finalProcessingComplete;
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
}

// Make the global functions reference our manager's methods
if (window.processImageWithRunPod && !window.originalProcessImageWithRunPod) {
  window.originalProcessImageWithRunPod = window.processImageWithRunPod;
  window.processImageWithRunPod = function(file) {
    // Call the original function to send to backend
    if (window.originalProcessImageWithRunPod) {
      window.originalProcessImageWithRunPod(file);
    }
  };
}

// Export the manager for direct use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessingManager;
} 