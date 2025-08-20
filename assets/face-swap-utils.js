// Face Swap Utilities
class FaceSwapUtils {
  /**
   * Converts a File object to a base64 string
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - A promise that resolves to the base64 string
   */
  static async fileToBase64(file) {
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
  }

  /**
   * Converts a URL to a base64 string
   * @param {string} url - The URL to convert
   * @returns {Promise<string>} - A promise that resolves to the base64 string
   */
  static async urlToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await this.fileToBase64(blob);
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      throw error;
    }
  }

  /**
   * Generates a unique ID for tracking jobs
   * @returns {string} - A unique ID
   */
  static generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Delays execution for a specified time
   * @param {number} ms - The number of milliseconds to delay
   * @returns {Promise<void>} - A promise that resolves after the delay
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a transformation workflow for Railway API
   * @param {Object} params - Parameters for the workflow
   * @param {string} params.transformationType - Type of transformation (pixar or railway)
   * @returns {Object} - The workflow JSON
   * @deprecated This method is no longer used as the workflow is handled by the backend
   */
  static createFaceSwapWorkflow(params) {
    console.warn('createFaceSwapWorkflow is deprecated. The Railway API now handles the workflow internally.');
    
    // This method is kept for backward compatibility but is no longer used
    // as the Railway API now handles single-image transformations directly
    return {
      transformationType: params.transformationType || 'pixar'
    };
  }

  /**
   * Ensures this utility is properly loaded in the window object
   */
  static ensureLoaded() {
    if (!window.FaceSwapUtils) {
      console.warn('FaceSwapUtils was not loaded properly, attaching to window now');
      window.FaceSwapUtils = FaceSwapUtils;
    }
    return window.FaceSwapUtils;
  }

  /**
   * Creates a fallback unique ID if the utility isn't available
   * @returns {string} - A unique ID 
   */
  static createFallbackId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// Export for use in other files
window.FaceSwapUtils = FaceSwapUtils;

// Self-invoke to ensure it's loaded
FaceSwapUtils.ensureLoaded(); 