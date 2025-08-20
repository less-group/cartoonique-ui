// Face Swap Test Configuration
window.faceSwapConfig = {
  // API Configuration
  api: {
    development: {
      baseUrl: 'https://api.letzteshemd-faceswap.com',
      timeout: 120000, // 2 minutes
      pollingInterval: 5000, // 5 seconds as recommended by the backend
      maxPollingAttempts: 60 // Maximum number of polling attempts (5 minutes total)
    },
    test: {
      baseUrl: 'https://api.letzteshemd-faceswap.com',
      timeout: 120000, // 2 minutes
      pollingInterval: 5000, // 5 seconds as recommended by the backend
      maxPollingAttempts: 10 // Fewer attempts for testing
    }
  },

  // API Endpoints
  endpoints: {
    transform: '/transform',
    status: '/status/',
    // Legacy endpoints (for backward compatibility)
    pixarTransform: '/transform',
    pixarStatus: '/status/'
  },

  // Default transformation type
  defaultTransformationType: 'pixar', // Only Pixar style is available

  // Upload settings
  upload: {
    maxFileSize: 10 * 1024 * 1024 // 10MB as recommended by the backend
  },

  // Default watermark configuration
  watermark: {
    url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
    width: 200,
    height: 200,
    spaceBetweenWatermarks: 100
  },

  // Test Data
  testData: {
    // Sample transformation types for testing
    transformationTypes: {
      pixar: 'pixar'
    }
  },

  // Test Files - Create more realistic test files with actual content
  testFiles: {
    validImage: new File(
      [new Uint8Array(10000).fill(255)], // Create a small binary file with some content
      'test-face.jpg', 
      { type: 'image/jpeg' }
    ),
    invalidType: new File(
      ['This is a text file'], 
      'test.txt', 
      { type: 'text/plain' }
    ),
    oversized: new File(
      [new Uint8Array(11 * 1024 * 1024).fill(255)], // 11MB file (just over the limit)
      'oversized-image.jpg', 
      { type: 'image/jpeg' }
    )
  },
  
  // UI Configuration
  ui: {
    progressBar: {
      containerBackgroundColor: '#f3f3f3',
      backgroundColor: '#4caf50',
      textColor: '#fff',
      speed: 1
    },
    messages: {
      loading: 'Das Herunterladen kann bis zu 1-2 Minuten dauern.',
      processing: 'Dein Bild wird verarbeitet...',
      success: 'Der Gesichtstausch war erfolgreich. Lege den Artikel in deinen Warenkorb, um den Artikel mit dem neuen Gesicht zu bestellen.',
      error: {
        invalidType: 'Ungültiger Dateityp. Bitte lade ein Bild hoch',
        tooLarge: 'Die Datei ist zu groß. Die maximale Größe beträgt 10 MB.',
        generic: 'Etwas ist schief gelaufen, erneut versuchen',
        timeout: 'Die Verarbeitung dauert zu lange. Bitte versuche es später erneut.'
      }
    }
  }
};

// Create placeholder dataUrl for test files
const placeholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';

// Add dataUrl to testFiles
if (window.faceSwapConfig.testFiles.validImage && !window.faceSwapConfig.testFiles.validImage.dataUrl) {
  window.faceSwapConfig.testFiles.validImage = {
    file: window.faceSwapConfig.testFiles.validImage,
    dataUrl: placeholder
  };
}

// Set test environment
window.faceSwapApiUrl = window.faceSwapConfig.api.test.baseUrl;

// Set global mock mode
window.MOCK_API_MODE = true;

// Expose watermark configuration globally for components to use
window.watermarkImage = window.faceSwapConfig.watermark;

// Log configuration for debugging
console.log('Face Swap Test Configuration loaded:', window.faceSwapConfig);