/**
 * Pixar Text Manager
 * 
 * This class handles the text overlay functionality for the Pixar application.
 * It manages showing the text input dialog and applying text to images.
 */

// Prevent redeclaration
if (typeof window.PixarTextManager === 'undefined') {
  class PixarTextManager {
    constructor(options = {}) {
      this.debug = options.debug || false;
      this.textOverlay = null;
      this.names = {
        name1: '',
        name2: ''
      };
      this.hasNames = false;
      
      this.log('PixarTextManager initialized');
    }
    
    /**
     * Log helper for debugging
     */
    log(message, data) {
      if (!this.debug) return;
      
      const prefix = '[PixarTextManager]';
      if (data !== undefined) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
    
    /**
     * Check if there is text to apply
     * @returns {boolean} - True if there is text to apply
     */
    hasText() {
      return this.hasNames && (
        (this.names.name1 && this.names.name1.trim().length > 0) || 
        (this.names.name2 && this.names.name2.trim().length > 0)
      );
    }
    
    /**
     * Get the text overlay component
     */
    async getTextOverlay() {
      if (this.textOverlay) {
        return this.textOverlay;
      }
      
      // Find existing component or create one
      let overlay = document.querySelector('pixar-text-overlay');
      if (!overlay) {
        // Create the component
        overlay = document.createElement('pixar-text-overlay');
        document.body.appendChild(overlay);
        this.log('Created text overlay component');
      }
      
      this.textOverlay = overlay;
      return overlay;
    }
    
    /**
     * Show the text dialog
     * @param {File} imageFile - The image file for preview
     * @returns {Promise} - Resolves when dialog is closed
     */
    async showTextDialog(imageFile) {
      try {
        // Validate input
        if (!imageFile || !(imageFile instanceof File)) {
          this.log('Invalid image file provided', imageFile);
          return false;
        }
        
        // Get overlay component
        const overlay = await this.getTextOverlay();
        if (!overlay) {
          this.log('Failed to get overlay component');
          return false;
        }
        
        // Convert file to URL for preview
        const imageUrl = URL.createObjectURL(imageFile);
        
        // Show the dialog
        this.log('Showing text dialog');
        const result = await overlay.showDialog({
          imageUrl,
          defaultNames: this.names
        });
        
        if (result.completed) {
          // User submitted names
          this.names = result.names;
          this.hasNames = true;
          this.log('Names collected:', this.names);
        } else {
          // User cancelled
          this.log('Text dialog cancelled');
        }
        
        // Clean up URL
        URL.revokeObjectURL(imageUrl);
        
        return result.completed;
      } catch (error) {
        console.error('[PixarTextManager] Error showing text dialog:', error);
        return false; // Return false instead of throwing, to be more resilient
      }
    }
    
    /**
     * Apply text to an image
     * @param {string} imageUrl - The URL of the image to apply text to
     * @returns {Promise<string>} - The URL of the image with text
     */
    async applyTextToImage(imageUrl) {
      try {
        if (!this.hasText()) {
          this.log('No text to apply');
          return imageUrl;
        }
        
        const overlay = await this.getTextOverlay();
        
        // Apply text to image
        this.log('Applying text to image');
        const result = await overlay.applyText({
          imageUrl,
          names: this.names
        });
        
        return result.resultUrl;
      } catch (error) {
        console.error('[PixarTextManager] Error applying text to image:', error);
        return imageUrl; // Return original image on error
      }
    }
  }
  
  // Attach to window
  window.PixarTextManager = PixarTextManager;
  console.log('PixarTextManager attached to window');
} else {
  console.log('PixarTextManager already defined');
} 