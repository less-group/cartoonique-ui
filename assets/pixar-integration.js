/**
 * Pixar Text Integration
 * 
 * This file provides functions to integrate the text overlay functionality
 * with the existing Pixar transformation workflow.
 * 
 * Implementation steps:
 * 1. Include this file in your project
 * 2. Make sure pixar-text-overlay.js and pixar-text-manager.js are included
 * 3. Call setupTextOverlay() after your file input setup
 */

// Prevent redeclaration
if (typeof window.PixarTextIntegration === 'undefined') {
  console.log('Initializing PixarTextIntegration...');
  
  class PixarTextIntegration {
    constructor(options = {}) {
      this.debug = options.debug !== false;
      this.textManager = null;
      this.transformFileInput = null;
      this.originalTransformHandler = null;
      this.processingStarted = false;
      
      // The section ID to integrate with
      this.sectionId = options.sectionId || null;
      
      if (this.debug) {
        console.log('PixarTextIntegration initialized');
      }
    }
    
    /**
     * Log helper for debugging
     */
    log(message, data) {
      if (!this.debug) return;
      
      const prefix = '[PixarTextIntegration]';
      if (data !== undefined) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
    
    /**
     * Ensure the required scripts are loaded
     */
    async ensureScriptsLoaded() {
      try {
        // Try to access the text manager
        if (!window.PixarTextManager) {
          this.log('Loading PixarTextManager script...');
          await this.loadScript('assets/pixar-text-manager.js');
        }
        
        // Try to access the text overlay component
        if (!window.PixarTextOverlay) {
          this.log('Loading PixarTextOverlay script...');
          await this.loadScript('assets/pixar-text-overlay.js');
        }
        
        return true;
      } catch (error) {
        console.error('[PixarTextIntegration] Error loading scripts:', error);
        return false;
      }
    }
    
    /**
     * Load a script dynamically
     * @param {string} src - Script URL
     * @returns {Promise} - Resolves when script is loaded
     */
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    /**
     * Initialize the text manager
     */
    async initTextManager() {
      if (this.textManager) {
        return this.textManager;
      }
      
      // Make sure scripts are loaded
      await this.ensureScriptsLoaded();
      
      // Create text manager
      this.textManager = new window.PixarTextManager({
        debug: this.debug
      });
      
      this.log('Text manager initialized');
      return this.textManager;
    }
    
    /**
     * Find the PixarTransformFileInput component in the page
     */
    findTransformComponent() {
      if (this.transformFileInput) {
        return this.transformFileInput;
      }
      
      if (this.sectionId) {
        // Try to find by section ID
        this.transformFileInput = document.querySelector(`pixar-transform-file-input[data-section-id="${this.sectionId}"]`);
      } else {
        // Find any pixar transform component
        this.transformFileInput = document.querySelector('pixar-transform-file-input');
      }
      
      if (this.transformFileInput) {
        this.log('Found transform component:', this.transformFileInput);
        return this.transformFileInput;
      } else {
        this.log('Transform component not found');
        return null;
      }
    }
    
    /**
     * Setup the text overlay with the Pixar transformation workflow
     * @returns {Promise<boolean>} Success status
     */
    async setupTextOverlay() {
      try {
        this.log('Setting up text overlay integration...');
        
        // Initialize text manager
        await this.initTextManager();
        
        // Find the transform component
        const component = this.findTransformComponent();
        if (!component) {
          this.log('Cannot set up text overlay: Transform component not found');
          return false;
        }
        
        // Already set up?
        if (component.textOverlayEnabled) {
          this.log('Integration already set up for this component');
          return true;
        }
        
        // Mark component as set up
        component.textOverlayEnabled = true;
        
        // Override the transformImage method to intercept the process
        if (!component.originalTransformImage) {
          component.originalTransformImage = component.transformImage;
          
          // Replace with our integrated version
          component.transformImage = async function() {
            if (!this.state.file) {
              this.showError('No image file selected');
              return;
            }
            
            try {
              // We'll let the ImageProcessingManager handle the flow
              // This ensures crop happens before text overlay
              
              // Start the transformation process without showing the text dialog here
              // The text dialog will be shown by ImageProcessingManager after cropping
              this.log('Starting transformation process - text dialog will appear after cropping');
              
              // Proceed with normal transformation
              return await this.originalTransformImage.call(this);
            } catch (error) {
              console.error('Error in integrated transformImage:', error);
              
              // If there's an error with text overlay, fall back to original behavior
              this.showError(error.message || 'Failed to process image');
              return null;
            }
          };
        }
        
        // Add listener for when the transformation is complete to apply text to the result
        document.addEventListener('pixar:transform:complete', async (event) => {
          try {
            const { imageUrl } = event.detail;
            
            if (imageUrl && this.textManager && this.textManager.hasText()) {
              this.log('Applying text overlay to stylized image...');
              
              // Apply text to the stylized image
              const finalImageWithText = await this.textManager.applyTextToImage(imageUrl);
              
              if (finalImageWithText) {
                // Replace the image in UI
                const resultImage = document.querySelector('.pixar-transform-result img');
                if (resultImage) {
                  resultImage.src = finalImageWithText;
                  this.log('Applied text overlay to result image');
                }
              }
            }
          } catch (error) {
            console.error('[PixarTextIntegration] Error applying text to stylized image:', error);
          }
        });
        
        this.log('Text overlay integration complete');
        return true;
      } catch (error) {
        console.error('[PixarTextIntegration] Setup error:', error);
        return false;
      }
    }
    
    /**
     * Initialize the application
     */
    async init() {
      try {
        console.log('[PixarTextIntegration] Initializing...');
        
        // Preload Montserrat font to ensure it's available for text rendering
        await this.preloadFonts();
        
        // Initialize text manager early
        await this.initTextManager();
        
        // Set up text overlay integration
        await this.setupTextOverlay();
        
        console.log('[PixarTextIntegration] Initialized successfully');
        return true;
      } catch (error) {
        console.error('[PixarTextIntegration] Initialization error:', error);
        return false;
      }
    }
    
    /**
     * Preload fonts used for text rendering
     */
    async preloadFonts() {
      try {
        // Use the FontFace API to preload Montserrat font with 900 weight
        const fontLoader = new FontFace('Montserrat', 'url(https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvC3js6aXp-p7K4GLvztg.woff2)', {
          weight: '900'
        });
        
        // Load and add to document fonts
        const font = await fontLoader.load();
        document.fonts.add(font);
        
        // Add preload link to head for additional browser support
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap';
        preloadLink.as = 'style';
        document.head.appendChild(preloadLink);
        
        // Also add the actual stylesheet
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap';
        document.head.appendChild(styleLink);
        
        this.log('Montserrat 900 weight font preloaded successfully');
        return true;
      } catch (err) {
        console.warn('[PixarTextIntegration] Failed to preload font, will fall back to system fonts', err);
        return false;
      }
    }
  }
  
  // Create global instance
  window.PixarTextIntegration = PixarTextIntegration;
  // Don't automatically create an instance here, we'll do it in DOMContentLoaded
  
  console.log('PixarTextIntegration class attached to window');
} else {
  console.log('PixarTextIntegration already defined, skipping initialization');
}

/**
 * Quick setup function for external use
 */
async function setupPixarTextOverlay(options = {}) {
  try {
    // If the integration doesn't exist, create it
    if (!window.pixarTextIntegration) {
      if (!window.PixarTextIntegration) {
        console.error('PixarTextIntegration not found');
        return false;
      }
      
      window.pixarTextIntegration = new window.PixarTextIntegration(options);
    }
    
    // Setup the integration
    return await window.pixarTextIntegration.setupTextOverlay();
  } catch (error) {
    console.error('Error setting up Pixar text overlay:', error);
    return false;
  }
}

// Create and initialize the integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create the integration
  window.pixarTextIntegration = new PixarTextIntegration({
    debug: true
  });
  
  // Initialize the integration
  window.pixarTextIntegration.init()
    .then(success => {
      console.log('PixarTextIntegration initialization result:', success);
    })
    .catch(error => {
      console.error('Error initializing PixarTextIntegration:', error);
    });
}); 