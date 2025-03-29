/**
 * Image Editor Manager
 * 
 * This module handles the image editing flow:
 * 1. Cropping the uploaded image using ImageCropper
 * 2. Adding text overlay using PixarTextManager
 */

class ImageEditorManager {
  constructor() {
    // State variables
    this.originalImageDataUrl = null;
    this.croppedImageDataUrl = null;
    this.originalFile = null;
    this.cropCoordinates = null;
    
    // Processing state flags
    this.cropComplete = false;
    this.textProcessingComplete = false;
    this.isProcessing = false;
    
    // Current crop ratio (3/4 for 30x40 or 5/7 for 50x70)
    this.currentCropRatio = 3/4; // Default to 30x40
    
    // Store cropper instance
    this.imageCropper = null;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Make this instance globally available
    window.imageEditorManager = this;
    
    console.log('Image Editor Manager initialized');
  }
  
  /**
   * Set up event listeners for cropping and text events
   */
  setupEventListeners() {
    // Listen for crop applied/canceled events
    document.addEventListener('crop-applied', (event) => {
      console.log('Received crop-applied event');
      this.handleCropApplied(event);
    });
    
    document.addEventListener('crop-cancelled', () => {
      console.log('Received crop-cancelled event');
      this.handleCropCancelled();
    });
  }
  
  /**
   * Process an image through cropping and text editing
   * @param {File|Blob} file - The image file to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - The processing result with cropped image and text data
   */
  async processImage(file, options = {}) {
    this.isProcessing = true;
    this.cropComplete = false;
    this.textProcessingComplete = false;
    
    // Store the original file
    this.originalFile = file;
    
    try {
      // Convert file to data URL if needed
      if (!this.originalImageDataUrl && file) {
        this.originalImageDataUrl = await this.fileToDataUrl(file);
      }
      
      // Show the image cropper
      await this.showImageCropper();
      
      // Wait for cropping to complete
      await this.waitForCropComplete();
      
      // Process text overlay if enabled
      let textData = null;
      if (options.enableTextOverlay !== false) {
        textData = await this.processTextOverlay(file);
      } else {
        this.textProcessingComplete = true;
      }
      
      // Return the processed result
      this.isProcessing = false;
      return {
        croppedImageDataUrl: this.croppedImageDataUrl,
        cropCoordinates: this.cropCoordinates,
        textData: textData
      };
    } catch (error) {
      this.isProcessing = false;
      console.error('Error in image processing:', error);
      throw error;
    }
  }
  
  /**
   * Convert a file to a data URL
   * @param {File|Blob} file - The file to convert
   * @returns {Promise<string>} - The data URL
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Show the image cropper interface
   * @returns {Promise<void>}
   */
  async showImageCropper() {
    console.log('Showing image cropper');
    
    return new Promise((resolve, reject) => {
      // Initialize image cropper if not already created
      if (!this.imageCropper) {
        console.log('Creating new ImageCropper instance');
        this.imageCropper = new ImageCropper({
          aspectRatio: this.currentCropRatio
        });
      } else {
        console.log('Using existing ImageCropper instance');
      }
      
      if (!this.originalImageDataUrl) {
        console.error('No image data URL available to load into cropper');
        reject(new Error('No image data URL available'));
        return;
      }
      
      console.log('Loading image into cropper, data URL length:', this.originalImageDataUrl.length);
      
      // Ensure document is ready
      if (document.readyState !== 'complete') {
        console.log('Document not ready yet, waiting before initializing cropper...');
        window.addEventListener('load', () => {
          this.loadImageIntoCropper(resolve, reject);
        });
      } else {
        this.loadImageIntoCropper(resolve, reject);
      }
    });
  }
  
  /**
   * Load the image into the cropper
   * @param {Function} resolve - Promise resolve function
   * @param {Function} reject - Promise reject function
   */
  loadImageIntoCropper(resolve, reject) {
    // Load the original image into the cropper
    this.imageCropper.loadImage(this.originalImageDataUrl)
      .then(() => {
        console.log('Image successfully loaded into cropper');
        resolve();
      })
      .catch(error => {
        console.error('Error loading image into cropper:', error);
        // Try loading it directly from the file as a fallback
        if (this.originalFile) {
          this.imageCropper.loadImage(this.originalFile)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  }
  
  /**
   * Handle when a crop is applied
   * @param {CustomEvent} event - The crop-applied event
   */
  handleCropApplied(event) {
    console.log('Crop applied, event:', event);
    
    // Save the crop coordinates and cropped image
    if (event.detail && event.detail.cropCoordinates) {
      // Ensure we note original dimensions for reference
      this.originalImageDimensions = event.detail.originalDimensions;
      
      // Store a clone of the crop coordinates to avoid reference issues
      this.cropCoordinates = {
        x: event.detail.cropCoordinates.x,
        y: event.detail.cropCoordinates.y,
        width: event.detail.cropCoordinates.width,
        height: event.detail.cropCoordinates.height,
        originalWidth: event.detail.originalDimensions?.width,
        originalHeight: event.detail.originalDimensions?.height
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
    
    // Dispatch event for crop completion
    const cropCompletedEvent = new CustomEvent('crop-processing-complete', {
      detail: {
        cropCoordinates: this.cropCoordinates,
        croppedImageDataUrl: this.croppedImageDataUrl
      }
    });
    document.dispatchEvent(cropCompletedEvent);
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
    if (this.originalImageDataUrl) {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
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
        
        // Calculate crop coordinates centered in the image
        const x = (width - cropWidth) / 2;
        const y = (height - cropHeight) / 2;
        
        // Set the crop coordinates
        this.cropCoordinates = {
          x,
          y,
          width: cropWidth,
          height: cropHeight,
          originalWidth: width,
          originalHeight: height
        };
        
        console.log('Default crop coordinates set:', JSON.stringify(this.cropCoordinates));
        
        // Dispatch event for crop completion
        const cropCompletedEvent = new CustomEvent('crop-processing-complete', {
          detail: {
            cropCoordinates: this.cropCoordinates,
            croppedImageDataUrl: this.croppedImageDataUrl
          }
        });
        document.dispatchEvent(cropCompletedEvent);
      };
      
      img.src = this.originalImageDataUrl;
    }
  }
  
  /**
   * Wait for the crop to be completed
   * @returns {Promise<void>}
   */
  waitForCropComplete() {
    if (this.cropComplete) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.cropComplete) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Also listen for the event as a backup
      document.addEventListener('crop-processing-complete', () => {
        clearInterval(checkInterval);
        resolve();
      }, { once: true });
    });
  }
  
  /**
   * Process text overlay for the image
   * @param {File|Blob} file - The image file
   * @returns {Promise<Object>} - Text overlay data
   */
  async processTextOverlay(file) {
    try {
      // Find or create text manager
      if (window.pixarTextManager || window.PixarTextManager) {
        console.log('Setting up text manager...');
        
        let textManager = window.pixarTextManager;
        if (!textManager && window.PixarTextManager) {
          console.log('Creating new PixarTextManager instance');
          textManager = window.pixarTextManager = new window.PixarTextManager();
        }
        
        if (textManager) {
          console.log('Text manager found, showing text dialog');
          
          // Make sure text manager is in editing mode
          textManager.isEditing = true;
          
          // Add subtitle field if needed
          if (!textManager.hasSubtitleField) {
            this.addSubtitleFieldToTextManager(textManager);
          }
          
          // Return a promise that resolves when text editing is done
          return new Promise((resolve, reject) => {
            textManager.showTextDialog(file).then(completed => {
              textManager.isEditing = false;
              console.log('Text dialog completed:', completed);
              
              if (textManager.names.name1 || textManager.names.name2) {
                // Extract text settings from the text manager
                console.log('Text names found:', textManager.names);
                const textPosition = textManager.textPosition || 'bottom';
                const fontSize = textManager.fontSize || '32px';
                const fontFamily = textManager.fontFamily || 'Arial, sans-serif';
                const color = textManager.textColor || '#FFFFFF';
                const positionPercentage = textManager.positionPercentage || 
                  (textPosition === 'bottom' ? 85 : 
                   textPosition === 'top' ? 15 : 50);
                
                // Return text settings
                const textData = {
                  position: textPosition,
                  fontSize: fontSize,
                  fontFamily: fontFamily,
                  color: color,
                  positionPercentage: positionPercentage,
                  text: textManager.names.name1 || '',
                  text2: textManager.names.name2 || '',
                  subtitle: textManager.names.subtitle || '',
                };
                
                console.log('Text data prepared:', textData);
                this.textProcessingComplete = true;
                resolve(textData);
              } else {
                console.log('No text entered, continuing without text');
                this.textProcessingComplete = true;
                resolve(null);
              }
            }).catch(error => {
              console.error('Error in text dialog:', error);
              textManager.isEditing = false;
              this.textProcessingComplete = true;
              reject(error);
            });
          });
        } else {
          console.log('No text manager available, skipping text editing');
          this.textProcessingComplete = true;
          return null;
        }
      } else {
        console.log('No PixarTextManager class found, skipping text editing');
        this.textProcessingComplete = true;
        return null;
      }
    } catch (error) {
      console.error('Error in text overlay processing:', error);
      this.textProcessingComplete = true;
      return null;
    }
  }
  
  /**
   * Add subtitle field to the text manager
   * @param {Object} textManager - The text manager instance
   */
  addSubtitleFieldToTextManager(textManager) {
    console.log('Adding subtitle field to text manager');
    
    textManager.hasSubtitleField = true;
    
    // Store the original showTextDialog function
    const originalShowTextDialog = textManager.showTextDialog;
    
    // Monkey patch the showTextDialog function to add a subtitle field
    textManager.showTextDialog = function(file) {
      return new Promise((resolve, reject) => {
        // Call the original function to create the dialog
        originalShowTextDialog.call(this, file).then(resolve).catch(reject);
        
        // Try to find the text dialog
        setTimeout(() => {
          const textDialog = document.querySelector('#pixar-text-dialog');
          if (!textDialog) return;
          
          // Find the container where we should add the subtitle field
          const container = textDialog.querySelector('.pixar-text-inputs');
          if (!container) return;
          
          // Check if the subtitle field already exists
          if (container.querySelector('#pixar-text-subtitle')) return;
          
          // Create a subtitle field after the second name field
          const subtitleField = document.createElement('div');
          subtitleField.className = 'pixar-text-input-group';
          subtitleField.innerHTML = `
            <label for="pixar-text-subtitle">Subtitle (optional):</label>
            <input type="text" id="pixar-text-subtitle" placeholder="E.g. 'est. 2023'">
          `;
          
          // Add the subtitle field to the container
          container.appendChild(subtitleField);
          
          // Get the input element
          const subtitleInput = subtitleField.querySelector('#pixar-text-subtitle');
          
          // Add event listener to update the subtitle value
          subtitleInput.addEventListener('input', () => {
            if (!textManager.names) {
              textManager.names = {};
            }
            
            // Add subtitle property if not already there
            if (!textManager.names.hasOwnProperty('subtitle')) {
              textManager.names.subtitle = '';
            }
            
            // Update the subtitle value
            textManager.names.subtitle = subtitleInput.value;
          });
          
          // Set initial value if available
          if (textManager.names && textManager.names.subtitle) {
            subtitleInput.value = textManager.names.subtitle;
          }
        }, 300);
      });
    };
  }
  
  /**
   * Apply text overlay to an image
   * @param {string} imageUrl - The image URL
   * @param {Object} textData - Text overlay data
   * @returns {Promise<string>} - Data URL of the image with text overlay
   */
  async applyTextOverlay(imageUrl, textData) {
    if (!textData || !imageUrl) {
      return imageUrl;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Create canvas with the same dimensions as the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Configure text style
        ctx.fillStyle = textData.color || '#FFFFFF';
        ctx.font = `bold ${textData.fontSize || '32px'} ${textData.fontFamily || 'Arial, sans-serif'}`;
        ctx.textAlign = 'center';
        
        // Calculate text position
        const position = textData.position || 'bottom';
        const positionPercentage = textData.positionPercentage || 
          (position === 'bottom' ? 85 : position === 'top' ? 15 : 50);
        
        const y = (canvas.height * positionPercentage) / 100;
        const x = canvas.width / 2;
        
        // Draw text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw the main text
        if (textData.text) {
          ctx.fillText(textData.text, x, y - 40);
        }
        
        // Draw second text line if available
        if (textData.text2) {
          ctx.fillText(textData.text2, x, y);
        }
        
        // Draw subtitle if available
        if (textData.subtitle) {
          // Use smaller font for subtitle
          ctx.font = `bold ${parseInt(textData.fontSize) * 0.6}px ${textData.fontFamily || 'Arial, sans-serif'}`;
          ctx.fillText(textData.subtitle, x, y + 40);
        }
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };
      
      img.onerror = (error) => {
        console.error('Error loading image for text overlay:', error);
        reject(error);
      };
      
      img.src = imageUrl;
    });
  }
}

// Initialize the ImageEditorManager when the script loads
document.addEventListener('DOMContentLoaded', () => {
  new ImageEditorManager();
});

// Export for direct use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageEditorManager;
} 