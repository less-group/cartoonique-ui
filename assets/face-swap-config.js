/**
 * Configuration for Face Swap API integration
 * This file provides centralized configuration for all API-related settings
 */

// Check if configuration already exists to prevent re-initialization
if (!window.faceSwapConfig) {
  // Define the configuration object
  window.faceSwapConfig = {
    // API configuration by environment
    api: {
      development: {
        baseUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app',
        timeout: 120000, // 2 minutes timeout
        pollingInterval: 1000, // Poll every 1 second during development
        maxPollingAttempts: 120 // Maximum polling attempts (2 minutes)
      },
      production: {
        baseUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app',
        timeout: 120000, // 2 minutes timeout
        pollingInterval: 2000, // Poll every 2 seconds in production
        maxPollingAttempts: 60 // Maximum polling attempts (2 minutes)
      }
    },
    
    // API endpoints - using the new unified endpoints
    endpoints: {
      // Primary unified endpoints
      transform: '/transform',
      status: '/status/',
      
      // Legacy endpoints (for backward compatibility)
      pixarTransform: '/transform',
      pixarStatus: '/status/',
      railwayTransform: '/transform',
      railwayStatus: '/status/'
    },
    
    // Default transformation type
    defaultTransformationType: 'pixar',
    
    // Default watermark configuration
    watermark: {
      url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
      width: 200,
      height: 200,
      spaceBetweenWatermarks: 100
    },
    
    // File upload configuration
    fileUpload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 4096, // Maximum image width
      maxHeight: 4096, // Maximum image height
      quality: 0.9 // Image quality for compression
    },
    
    // UI Configuration
    ui: {
      showDebugInfo: false, // Whether to show debug information
      autoCloseTimeout: 5000, // Auto-close popups after 5 seconds
      useModernUI: true, // Use modern UI components
      animateTransitions: true, // Animate UI transitions
      progressBar: {
        containerBackgroundColor: '#f3f3f3',
        backgroundColor: '#4caf50',
        textColor: '#fff',
        speed: 1
      },
      messages: {
        loading: 'Die Transformation kann bis zu 1-2 Minuten dauern.',
        processing: 'Dein Bild wird in Pixar-Stil umgewandelt...',
        success: 'Die Pixar-Transformation war erfolgreich. Lege den Artikel in deinen Warenkorb, um das Produkt mit deinem transformierten Bild zu bestellen.',
        error: {
          invalidType: 'Ungültiger Dateityp. Bitte lade ein Bild hoch (JPG oder PNG)',
          tooLarge: 'Die Datei ist zu groß. Die maximale Größe beträgt 10 MB.',
          generic: 'Etwas ist schief gelaufen, bitte versuche es erneut',
          timeout: 'Die Verarbeitung dauert zu lange. Bitte versuche es später erneut.'
        }
      }
    }
  };
  
  // Set the current environment
  window.faceSwapConfig.environment = 
    (window.Shopify && window.Shopify.designMode) ? 'development' : 'production';
  
  // Create a shorthand reference to the current environment's API configuration
  window.faceSwapConfig.currentApi = 
    window.faceSwapConfig.api[window.faceSwapConfig.environment];
  
  // Log initialization
  console.log('Face Swap config initialized with environment:', window.faceSwapConfig.environment);
  
  // Set global API URL for legacy component compatibility
  window.faceSwapApiUrl = window.faceSwapConfig.currentApi.baseUrl;

  // Expose watermark configuration globally for components to use
  window.watermarkImage = window.faceSwapConfig.watermark;
} else {
  console.log('Face Swap config already initialized, skipping');
} 