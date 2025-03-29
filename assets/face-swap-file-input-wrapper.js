class FaceSwapFileInputWrapper extends HTMLElement {
  constructor() {
    super();
    
    // Add component properties
    this.targetImageUrl = null;
    this.printImageUrl = null;
    this.productId = null;
    this.customerId = null;
    this.orderId = null;
    this.productColor = null;
    this.watermarkImage = null;
    this.faceSwapResultImageType = null;
    this.transformationType = window.faceSwapConfig?.defaultTransformationType || 'pixar';
    
    // UI state
    this.isFaceSwapping = false;
    this.watermarkedImageUrl = null;
    this.processedImageUrl = null;
    this.processedPrintImageUrl = null;
    
    // Add job tracking
    this.currentJobId = null;
    
    // Ensure we have an abort controller
    this.faceSwapRequestController = new AbortController();
    
    // Create a simple HTML structure for testing
    this.innerHTML = `
      <div class="face-swap-container">
        <div class="face-swap-input">
          <input type="file" class="file-input" accept="image/*">
          <button class="upload-button">Hochladen</button>
        </div>
        <div class="face-swap-transform-type">
          <label>
            <input type="radio" name="transform-type" value="pixar" checked> Pixar-Stil
          </label>
        </div>
        <div class="face-swap-loader" style="display: none;">Transformiere...</div>
        <div class="face-swap-results"></div>
        <div class="face-swap-help"></div>
      </div>
    `;
    
    // Get elements
    this.fileInput = this.querySelector('.file-input');
    this.uploadButton = this.querySelector('.upload-button');
    this.resultsContainer = this.querySelector('.face-swap-results');
    this.helpContainer = this.querySelector('.face-swap-help');
    this.transformTypeRadios = this.querySelectorAll('input[name="transform-type"]');
    
    // Add event listeners
    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.handleFileChange.bind(this));
    }
    
    // Add transform type change listener
    this.transformTypeRadios.forEach(radio => {
      radio.addEventListener('change', this.handleTransformTypeChange.bind(this));
    });
    
    console.log('FaceSwapFileInputWrapper initialized');
  }

  // Handle transform type change
  handleTransformTypeChange(event) {
    this.transformationType = event.target.value;
    console.log('Transform type changed to:', this.transformationType);
  }

  // Handle file input change
  handleFileChange(event) {
    console.log('File input changed, calling faceSwapImage');
    this.faceSwapImage(event);
  }

  async faceSwapImage(event) {
    console.log('faceSwapImage called with event:', event);
    const file = event?.target?.files?.[0];
    if (!file) {
      console.warn('No file found in event');
      return;
    }

    console.log('Processing file:', file.name, file.type, file.size);
    const maxSize = window.faceSwapConfig?.upload?.maxFileSize || 10 * 1024 * 1024; // 10MB

    // Validate file type
    if (!file?.type?.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      this.appendHelpText(window.faceSwapConfig?.ui?.messages?.error?.invalidType || 'Invalid file type. Please upload an image.');
      event.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      this.appendHelpText(window.faceSwapConfig?.ui?.messages?.error?.tooLarge || 'File is too large. Maximum size is 10MB.');
      event.target.value = '';
      return;
    }

    try {
      console.log('Creating API client...');
      // Create API client with mock mode from global setting
      const apiClient = new window.UnifiedApiClient({
        baseUrl: window.faceSwapApiUrl || window.faceSwapConfig?.api?.development?.baseUrl,
        mockMode: window.MOCK_API_MODE
      });

      console.log('API client created:', apiClient);
      this.isFaceSwapping = true;
      this.showLoader();
      this.appendHelpText(window.faceSwapConfig?.ui?.messages?.loading || 'Downloading may take 1-2 minutes.');

      // Generate a unique job ID with fallback if FaceSwapUtils is not available
      try {
        this.currentJobId = window.FaceSwapUtils ? window.FaceSwapUtils.generateUniqueId() : 
          (Date.now().toString(36) + Math.random().toString(36).substring(2));
        console.log('Generated job ID:', this.currentJobId);
      } catch (error) {
        console.error('Error generating job ID:', error);
        // Fallback to a simple unique ID
        this.currentJobId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        console.log('Using fallback job ID:', this.currentJobId);
      }

      // Log parameters
      console.log('Image transformation parameters:', {
        sourceImage: file.name
      });

      // Get watermark configuration
      const watermarkConfig = window.watermarkImage || {
        url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
        width: 200,
        height: 200,
        spaceBetweenWatermarks: 100
      };

      // Call transform API
      const result = await apiClient.transform({
        sourceImage: file,
        watermark: watermarkConfig,
        signal: this.faceSwapRequestController.signal,
        jobId: this.currentJobId
      });

      console.log('Transform result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      const {
        watermarkedOriginalImageUrl,
        watermarkedImageUrlToShow,
        processedImageUrl,
        processedPrintImageUrl
      } = result.data;

      this.isFaceSwapping = false;
      this.watermarkedImageUrl = watermarkedOriginalImageUrl;
      this.processedImageUrl = processedImageUrl;
      this.processedPrintImageUrl = processedPrintImageUrl;

      this.appendHelpText(window.faceSwapConfig?.ui?.messages?.success || 'Face swap was successful.');
      
      // Check if ResultPopupManager is available
      if (window.resultPopupManager) {
        console.log('Using ResultPopupManager to display the result');
        // Use ResultPopupManager to display the transformed image
        window.resultPopupManager.showResultPopup(watermarkedImageUrlToShow || processedImageUrl);
      } else {
        console.log('ResultPopupManager not available, falling back to standard display');
        // Fallback to traditional method
        this.appendResult(watermarkedImageUrlToShow);
        
        // Try to dynamically load ResultPopupManager if not available
        this.loadResultPopupManager().then(() => {
          if (window.resultPopupManager) {
            window.resultPopupManager.showResultPopup(watermarkedImageUrlToShow || processedImageUrl);
          }
        }).catch(err => {
          console.warn('Could not load ResultPopupManager:', err);
        });
      }
      
      console.log('Face swap completed successfully');

    } catch (error) {
      console.error('Face swap error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      this.isFaceSwapping = false;
      this.hideLoader();
      
      // Determine error message based on error type
      let errorMessage = error.message || window.faceSwapConfig?.ui?.messages?.error?.generic || 'Error occurred while sending file';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request was aborted.';
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = window.faceSwapConfig?.ui?.messages?.error?.timeout || 'Processing is taking too long. Please try again later.';
      }
      
      this.appendHelpText(errorMessage, true);
    } finally {
      this.hideLoader();
      if (this.fileInput) this.fileInput.value = '';
      this.currentJobId = null;
    }
  }

  abortFaceSwap() {
    console.log('Aborting face swap...');
    this.faceSwapRequestController.abort();
    this.clearFaceSwapData();
    
    // Just log cancellation of the current job for now
    if (this.currentJobId) {
      console.log(`Request cancelled for job: ${this.currentJobId}`);
    }
  }

  /**
   * Clears all face swap data
   */
  clearFaceSwapData() {
    console.log('Clearing face swap data');
    this.watermarkedImageUrl = null;
    this.processedImageUrl = null;
    this.processedPrintImageUrl = null;
    this.currentJobId = null;
  }

  /**
   * Shows the loader element
   */
  showLoader() {
    const loader = this.querySelector('.face-swap-loader');
    if (loader) {
      loader.style.display = 'block';
    }
  }

  /**
   * Hides the loader element
   */
  hideLoader() {
    const loader = this.querySelector('.face-swap-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Appends help text
   */
  appendHelpText(text, isError = false) {
    if (this.helpContainer) {
      const p = document.createElement('p');
      p.textContent = text;
      if (isError) {
        p.style.color = 'red';
      }
      this.helpContainer.appendChild(p);
    }
  }

  /**
   * Appends result image
   */
  appendResult(imageUrl) {
    if (this.resultsContainer && imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%';
      this.resultsContainer.appendChild(img);
    }
  }

  /**
   * Dynamically loads the ResultPopupManager if not already loaded
   */
  async loadResultPopupManager() {
    if (window.resultPopupManager) {
      return Promise.resolve(window.resultPopupManager);
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = window.ASSET_BASE_URL 
        ? `${window.ASSET_BASE_URL}result-popup-manager.js` 
        : 'result-popup-manager.js';
      
      script.onload = () => {
        // Initialize ResultPopupManager if it's not already initialized
        if (!window.resultPopupManager && typeof ResultPopupManager === 'function') {
          new ResultPopupManager();
        }
        resolve(window.resultPopupManager);
      };
      
      script.onerror = (error) => {
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  }
}

// Register the custom element only if it hasn't been registered already
if (!customElements.get('face-swap-file-input-wrapper')) {
  window.customElements.define('face-swap-file-input-wrapper', FaceSwapFileInputWrapper);
  console.log('Registered face-swap-file-input-wrapper custom element');
} 