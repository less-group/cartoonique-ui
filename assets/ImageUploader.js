/**
 * ImageUploader.js
 * 
 * Handles file selection and uploading for image processing.
 * Responsibilities include:
 * - File input setup and configuration
 * - Image format validation 
 * - Initial image preview
 * - Emitting events for successful uploads
 */

class ImageUploader {
  constructor() {
    // State variables
    this.originalFile = null;
    this.originalImageDataUrl = null;
    this.fileLoaded = false;
    
    // Initialize event listeners
    this.eventListeners = {};
    
    console.log('ImageUploader initialized');
  }
  
  /**
   * Set up the file input component for image selection
   * @param {HTMLElement} fileInput - The file input element to set up
   */
  setupFileInput(fileInput) {
    if (!fileInput) {
      console.error('No file input element provided to setup');
      return;
    }
    
    this.fileInput = fileInput;
    
    // Add event listener for file selection
    this.fileInput.addEventListener('change', this.handleFileSelected.bind(this));
    
    console.log('File input setup complete');
  }
  
  /**
   * Handle file selection from the input element
   * @param {Event} event - The file selection event
   */
  handleFileSelected(event) {
    const file = event.target.files[0];
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      console.error('Selected file is not an image');
      this.dispatchEvent('error', { 
        message: 'Please select a valid image file.' 
      });
      return;
    }
    
    console.log('File selected:', file.name, file.type, file.size);
    
    // Store the file reference
    this.originalFile = file;
    
    // Create a URL for the file for preview
    const reader = new FileReader();
    
    reader.onload = (e) => {
      this.originalImageDataUrl = e.target.result;
      this.fileLoaded = true;
      
      // Dispatch file-loaded event with the image data URL
      this.dispatchEvent('file-loaded', {
        file: this.originalFile,
        imageDataUrl: this.originalImageDataUrl
      });
    };
    
    reader.onerror = () => {
      console.error('Error reading the file');
      this.dispatchEvent('error', {
        message: 'Error reading the selected file. Please try again.'
      });
    };
    
    // Start reading the file
    reader.readAsDataURL(file);
  }
  
  /**
   * Get the original selected file
   * @returns {File} The original file
   */
  getOriginalFile() {
    return this.originalFile;
  }
  
  /**
   * Get the data URL for the original image
   * @returns {string} The data URL
   */
  getOriginalImageDataUrl() {
    return this.originalImageDataUrl;
  }
  
  /**
   * Check if a file has been loaded
   * @returns {boolean} True if a file is loaded
   */
  isFileLoaded() {
    return this.fileLoaded;
  }
  
  /**
   * Reset the uploader state (clear file and image data)
   */
  reset() {
    this.originalFile = null;
    this.originalImageDataUrl = null;
    this.fileLoaded = false;
    
    // Reset the file input if available
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    
    console.log('ImageUploader reset');
  }
  
  /**
   * Utility to convert a data URL to a Blob object
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
    const customEvent = new CustomEvent(`image-uploader-${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageUploader;
} else {
  window.ImageUploader = ImageUploader;
} 