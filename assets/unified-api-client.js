/**
 * Unified API Client for Face Swap / Pixar Transformations
 * 
 * This client handles all API communications with the unified Face Swap API.
 * It supports Pixar-style transformations.
 */

// Prevent redeclaration errors by checking if already defined
if (typeof window.UnifiedApiClient === 'undefined') {
  console.log('Initializing UnifiedApiClient...');

  class UnifiedApiClient {
    constructor(options = {}) {
      // API base URL - use the configured URL or fall back to defaults
      this.baseUrl = options.baseUrl || 
                     window.unifiedConfig?.api?.current()?.baseUrl ||
                     window.faceSwapApiUrl || 
                     window.pixarApiUrl || 
                     'https://letzteshemd-faceswap-api-production.up.railway.app';
      
      // Enable debug logging based on options or environment
      this.debug = options.debug || 
                   window.unifiedConfig?.ui?.showDebugInfo ||
                   window.settings?.environment !== 'production';
      
      // Enable mock mode for testing
      this.mockMode = options.mockMode || 
                      window.MOCK_API_MODE || 
                      false;
      
      // API endpoints - use unified endpoints
      this.endpoints = options.endpoints ||
                       window.unifiedConfig?.endpoints || {
        transform: '/transform',
        status: '/status/'
      };
      
      // Request tracking to prevent duplicates
      this.activeRequests = new Map();
      this.requestTimeouts = new Map();
      
      // Configuration
      this.pollingInterval = options.pollingInterval || 
                            window.unifiedConfig?.api?.current()?.pollingInterval ||
                            2000; // Default: 2 seconds
      
      this.maxPollingAttempts = options.maxPollingAttempts || 
                               window.unifiedConfig?.api?.current()?.maxPollingAttempts ||
                               60; // Default: 2 minutes max
      
      this.log('Initialized with configuration:', {
        baseUrl: this.baseUrl,
        debug: this.debug,
        mockMode: this.mockMode,
        endpoints: this.endpoints,
        pollingInterval: this.pollingInterval,
        maxPollingAttempts: this.maxPollingAttempts
      });
    }

    /**
     * Logs a message if debug is enabled
     * @param {string} message - The message to log
     * @param {*} data - Optional data to log
     */
    log(message, data) {
      if (this.debug) {
        if (data !== undefined) {
          console.log(`UnifiedApiClient: ${message}`, data);
        } else {
          console.log(`UnifiedApiClient: ${message}`);
        }
      }
    }

    /**
     * Performs an image transformation using the API
     * @param {Object} params - Parameters for the transformation
     * @param {File} params.sourceImage - The source image file to transform
     * @param {Object} params.watermark - Watermark configuration object (optional)
     * @param {Function} onProgress - Optional callback for progress updates
     * @returns {Promise<Object>} - A promise that resolves to the transformation result
     */
    async transform(params, onProgress) {
      try {
        this.log('Transform method called with params:', params);
        
        // Validate required parameters
        if (!params.sourceImage) {
          throw new Error('Source image is required');
        }
        
        // Generate a unique request ID to track this request
        const requestId = this._generateRequestId(params.sourceImage);
        
        // Check if this exact request is already in progress
        if (this.activeRequests.has(requestId)) {
          this.log(`Request ${requestId} already in progress, returning existing promise`);
          return this.activeRequests.get(requestId);
        }
        
        // Process transformation
        const promise = this._processTransform(params, requestId, onProgress);
        
        // Store promise for request tracking
        this.activeRequests.set(requestId, promise);
        
        // Clear request tracking after a delay
        const timeoutId = setTimeout(() => {
          this.activeRequests.delete(requestId);
          this.requestTimeouts.delete(requestId);
        }, 5000);
        
        this.requestTimeouts.set(requestId, timeoutId);
        
        return promise;
      } catch (error) {
        this.log('Error in transform method:', error);
        return {
          success: false,
          error: error.message || 'An error occurred during transformation'
        };
      }
    }
    
    /**
     * Process the transformation internally
     * @private
     */
    async _processTransform(params, requestId, onProgress) {
      try {
        // Extract parameters
        const { 
          sourceImage,
          watermark: customWatermark,
          watermarkConfig: legacyWatermark, // For backward compatibility
        } = params;
        
        // Use provided watermark config or fall back to defaults
        const watermarkConfig = customWatermark || 
                                legacyWatermark || 
                                window.watermarkImage || 
                                this._getDefaultWatermarkConfig();
        
        this.log('Using watermark configuration:', watermarkConfig);
        
        // Convert file to base64
        const base64Image = await this._fileToBase64(sourceImage);
        this.log('Image converted to base64');
        
        // Mock response for testing if enabled
        if (this.mockMode) {
          this.log('MOCK MODE: Returning mock transformation result');
          await new Promise(r => setTimeout(r, 1000));
          
          const mockResult = this._createMockResult();
          return mockResult;
        }
        
        // Create payload according to API specification - simplified for Pixar only
        const payload = {
          image: base64Image,
          watermark: watermarkConfig
        };
        
        // Submit transformation request
        const transformUrl = `${this.baseUrl}${this.endpoints.transform}`;
        this.log(`Submitting transformation request to ${transformUrl}`);
        
        // Update progress if callback provided
        if (onProgress) onProgress(10);
        
        // Make API request
        const response = await fetch(transformUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        this.log('Transformation submitted successfully:', data);
        
        // Update progress if callback provided
        if (onProgress) onProgress(30);
        
        if (!data.jobId) {
          throw new Error('No job ID returned from API');
        }
        
        // Poll for results
        const statusResult = await this._pollForStatus(data.jobId, onProgress);
        this.log('Transformation completed:', statusResult);
        
        // Format and return the final result
        return {
          success: true,
          jobId: data.jobId,
          status: statusResult.status,
          // Try all possible image URL fields in order of preference
          imageUrl: statusResult.imageUrl || 
                   statusResult.watermarkedImageUrlToShow || 
                   statusResult.processedImageUrl || 
                   statusResult.watermarkedOriginalImageUrl ||
                   statusResult.resultImageUrl ||
                   (statusResult.image && statusResult.image.url) ||
                   statusResult.image,
          watermarkedImageUrlToShow: statusResult.watermarkedImageUrlToShow,
          watermarkedOriginalImageUrl: statusResult.watermarkedOriginalImageUrl,
          processedImageUrl: statusResult.processedImageUrl,
          processedPrintImageUrl: statusResult.processedPrintImageUrl
        };
      } catch (error) {
        this.log('Error in transformation process:', error);
        throw error;
      }
    }
    
    /**
     * Poll for status until job is complete or fails
     * @private
     */
    async _pollForStatus(jobId, onProgress) {
      this.log(`Starting to poll for status of job ${jobId}`);
      
      // Mock response for testing if enabled
      if (this.mockMode) {
        this.log('MOCK MODE: Returning mock status result');
        await new Promise(r => setTimeout(r, 3000));
        
        return {
          success: true,
          status: "COMPLETED",
          imageUrl: "https://picsum.photos/400/600",
          watermarkedImageUrlToShow: "https://picsum.photos/400/600",
          watermarkedOriginalImageUrl: "https://picsum.photos/400/600",
          processedImageUrl: "https://picsum.photos/400/600",
          processedPrintImageUrl: "https://picsum.photos/400/600"
        };
      }
      
      let attempts = 0;
      const statusUrl = `${this.baseUrl}${this.endpoints.status}${jobId}`;
      const startTime = Date.now();
      
      while (attempts < this.maxPollingAttempts) {
        try {
          this.log(`Polling attempt ${attempts + 1}/${this.maxPollingAttempts}`);
          
          const response = await fetch(statusUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            const text = await response.text();
            this.log(`Error response (${response.status}):`, text);
            throw new Error(`Status check failed with status: ${response.status}`);
          }
          
          const data = await response.json();
          this.log('Poll response:', data);
          
          if (data.status === 'COMPLETED') {
            // Check if we have any image URL fields
            const hasImageUrl = data.imageUrl || 
                              data.watermarkedImageUrlToShow || 
                              data.processedImageUrl || 
                              data.watermarkedOriginalImageUrl ||
                              data.resultImageUrl ||
                              (data.image && data.image.url) ||
                              data.image;
                              
            if (hasImageUrl) {
              // We have both COMPLETED status and image URL - success!
              // Update progress to 100% if callback provided
              if (onProgress) onProgress(100);
              return data;
            } else {
              // We have COMPLETED status but no image URL yet
              // If we're within reasonable attempts, keep polling
              if (attempts < Math.min(10, this.maxPollingAttempts / 2)) {
                this.log('Status is COMPLETED but no image URL yet, continuing to poll');
                // Wait before next poll
                await new Promise(r => setTimeout(r, this.pollingInterval));
                attempts++;
                continue;
              } else {
                // We've tried enough times with COMPLETED status but no URL
                this.log('No image URL received after multiple attempts with COMPLETED status');
                return data; // Return what we have and let the caller handle it
              }
            }
          } else if (['FAILED', 'CANCELLED', 'TIMED_OUT'].includes(data.status)) {
            throw new Error(`Job failed with status: ${data.status}`);
          } else {
            // Still processing (IN_QUEUE or IN_PROGRESS)
            const elapsedTime = Date.now() - startTime;
            const progress = this._calculateProgress(elapsedTime, data.status);
            
            // Update progress if callback provided
            if (onProgress) onProgress(progress);
            
            // Wait before next poll
            await new Promise(r => setTimeout(r, this.pollingInterval));
            attempts++;
          }
        } catch (error) {
          this.log(`Error during polling (attempt ${attempts + 1}):`, error);
          
          // Wait before retry
          await new Promise(r => setTimeout(r, this.pollingInterval));
          attempts++;
        }
      }
      
      throw new Error(`Max polling attempts (${this.maxPollingAttempts}) reached`);
    }
    
    /**
     * Helper function to convert a file to base64
     * @private
     */
    async _fileToBase64(file) {
      try {
        this.log('Converting file to base64', { 
          name: file.name, 
          size: file.size, 
          type: file.type 
        });
        
        // Simple conversion for most cases
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.log('File conversion successful', { 
              resultSize: reader.result.length 
            });
            resolve(reader.result);
          };
          reader.onerror = error => {
            this.log('File conversion failed', error);
            reject(error);
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        this.log('Error in fileToBase64', error);
        throw new Error(`Failed to convert file to base64: ${error.message}`);
      }
    }
    
    /**
     * Generate a unique request ID based on file
     * @private
     */
    _generateRequestId(file) {
      if (!file) return 'no-file';
      return `req_${file.name}_${file.size}_${file.lastModified}`;
    }
    
    /**
     * Get default watermark configuration
     * @private
     */
    _getDefaultWatermarkConfig() {
      // Use unified config if available, or fall back to hardcoded defaults
      return window.unifiedConfig?.watermark || window.watermarkImage || {
        url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
        width: 200,
        height: 200,
        spaceBetweenWatermarks: 100
      };
    }
    
    /**
     * Calculate estimated progress based on elapsed time
     * @private
     */
    _calculateProgress(elapsedTime, status) {
      // Assume average processing time is 60 seconds
      const estimatedTotal = 60000;
      
      // Base progress on status and elapsed time
      if (status === 'IN_QUEUE') {
        return Math.min(25, Math.round((elapsedTime / estimatedTotal) * 100));
      } else if (status === 'IN_PROGRESS') {
        return Math.min(90, 25 + Math.round((elapsedTime / estimatedTotal) * 75));
      }
      
      // Default - use elapsed time with a cap at 90%
      return Math.min(90, Math.round((elapsedTime / estimatedTotal) * 100));
    }
    
    /**
     * Create a mock result for testing
     * @private
     */
    _createMockResult() {
      const mockId = 'mock-' + Date.now();
      return {
        success: true,
        jobId: mockId,
        status: "COMPLETED",
        imageUrl: "https://picsum.photos/400/600",
        watermarkedImageUrlToShow: "https://picsum.photos/400/600",
        watermarkedOriginalImageUrl: "https://picsum.photos/400/600",
        processedImageUrl: "https://picsum.photos/400/600",
        processedPrintImageUrl: "https://picsum.photos/400/600"
      };
    }
    
    /**
     * Legacy method to maintain compatibility with FaceSwapApiClient
     * @deprecated Use transform() instead
     */
    async faceSwap(params, onProgress) {
      this.log('faceSwap called (legacy method) - redirecting to transform');
      return this.transform({
        sourceImage: params.sourceImage,
        watermark: params.watermarkConfig
      }, onProgress);
    }
    
    /**
     * Legacy method to maintain compatibility with PixarApiClient
     * @deprecated Use transform() instead
     */
    async transformImage(params, onProgress) {
      this.log('transformImage called (legacy method) - redirecting to transform');
      return this.transform({
        sourceImage: params.imageFile,
        watermark: params.watermarkConfig
      }, onProgress);
    }
  }

  // Export the client to the window object
  window.UnifiedApiClient = UnifiedApiClient;
  
  // For backward compatibility, also create aliases to the old client names
  window.FaceSwapApiClient = UnifiedApiClient;
  window.PixarApiClient = UnifiedApiClient;
  
  console.log('UnifiedApiClient initialized and attached to window with compatibility aliases');
} else {
  console.log('UnifiedApiClient already defined, skipping initialization');
} 