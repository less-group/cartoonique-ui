// Only define if not already defined
if (typeof window.PixarUtils === 'undefined') {
  console.log('Defining PixarUtils...');
  
  /**
   * Utility functions for Pixar transformation
   */
  window.PixarUtils = {
    /**
     * Resizes an image to the specified maximum dimensions while maintaining aspect ratio
     * @param {File} file - The source image file
     * @param {Object} options - Resize options
     * @param {number} options.maxWidth - Maximum width (default: 1500)
     * @param {number} options.maxHeight - Maximum height (default: 1500)
     * @param {string} options.format - Output format (default: 'image/jpeg')
     * @param {number} options.quality - Output quality for lossy formats (default: 0.9)
     * @returns {Promise<Blob>} - Resized image blob
     */
    resizeImage: function(file, options = {}) {
      const maxWidth = options.maxWidth || 1500;
      const maxHeight = options.maxHeight || 1500;
      const format = options.format || 'image/jpeg';
      const quality = options.quality || 0.9;
      
      return new Promise((resolve, reject) => {
        // Create a FileReader to read the file
        const reader = new FileReader();
        
        reader.onload = (readerEvent) => {
          // Create an image to get the dimensions
          const img = new Image();
          
          img.onload = () => {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
            
            // Create a canvas to resize the image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            canvas.toBlob((blob) => {
              resolve(blob);
            }, format, quality);
          };
          
          img.onerror = () => {
            reject(new Error('Failed to load image'));
          };
          
          img.src = readerEvent.target.result;
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
      });
    },
    
    /**
     * Adds a watermark to an image
     * @param {Blob|File} imageBlob - The source image blob or file
     * @param {Object} options - Watermark options
     * @param {string} options.watermarkText - Watermark text (default: 'PREVIEW')
     * @param {string} options.fillStyle - Watermark color (default: 'rgba(255, 255, 255, 0.5)')
     * @param {string} options.font - Watermark font (default: '48px Arial')
     * @returns {Promise<Blob>} - Watermarked image blob
     */
    addWatermark: function(imageBlob, options = {}) {
      const watermarkText = options.watermarkText || 'PREVIEW';
      const fillStyle = options.fillStyle || 'rgba(255, 255, 255, 0.5)';
      const font = options.font || '48px Arial';
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (readerEvent) => {
          const img = new Image();
          
          img.onload = () => {
            // Create a canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the image
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Draw the watermark diagonally
            ctx.save();
            ctx.fillStyle = fillStyle;
            ctx.font = font;
            ctx.globalAlpha = 0.5;
            
            // For better visibility, create multiple diagonal watermarks
            for (let i = -img.height; i < img.width + img.height; i += 200) {
              ctx.save();
              ctx.translate(i, 0);
              ctx.rotate(Math.PI / 4);
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
            
            ctx.restore();
            
            // Convert to blob
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.9);
          };
          
          img.onerror = () => {
            reject(new Error('Failed to load image for watermarking'));
          };
          
          img.src = readerEvent.target.result;
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read image file for watermarking'));
        };
        
        reader.readAsDataURL(imageBlob);
      });
    },
    
    /**
     * Converts a File object to a base64 string
     * @param {File} file - The file to convert
     * @returns {Promise<string>} - A promise that resolves to the base64 string
     */
    fileToBase64: function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // The result includes the data URL prefix
          const base64String = reader.result;
          resolve(base64String);
        };
        reader.onerror = error => reject(error);
      });
    },
    
    /**
     * Converts a URL to a base64 string
     * @param {string} url - The URL to convert
     * @returns {Promise<string>} - A promise that resolves to the base64 string
     */
    urlToBase64: function(url) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          this.fileToBase64(blob).then(resolve).catch(reject);
        } catch (error) {
          console.error('Error converting URL to base64:', error);
          reject(error);
        }
      });
    },
    
    /**
     * Generates a unique ID for tracking jobs
     * @returns {string} - A unique ID
     */
    generateUniqueId: function() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    
    /**
     * Delays execution for a specified time
     * @param {number} ms - The number of milliseconds to delay
     * @returns {Promise<void>} - A promise that resolves after the delay
     */
    delay: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };
  
  console.log('PixarUtils defined successfully');
} else {
  console.log('PixarUtils already defined, skipping declaration');
}

// For backward compatibility
window.FaceSwapUtils = window.PixarUtils; 