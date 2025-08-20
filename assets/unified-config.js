/**
 * Unified Configuration for Image Transformation API
 * 
 * This file provides centralized configuration for all API-related settings for
 * Pixar-style transformations. It replaces and consolidates
 * the functionality from both face-swap-config.js and pixar-config.js.
 * 
 * @version 1.0.0
 */

// Prevent redeclaration by checking if config already exists
if (typeof window.unifiedConfig === 'undefined') {
  console.log('Initializing unified configuration...');
  
  // Determine environment
  const determineEnvironment = () => {
    // Check for Shopify environment indicators
    if (window.Shopify) {
      if (window.Shopify.designMode) return 'development';
      if (window.Shopify.theme && window.Shopify.theme.role === 'published') return 'production';
    }
    
    // Default to production for safety
    return 'production';
  };
  
  // Current environment
  const currentEnv = determineEnvironment();
  console.log('Environment detected:', currentEnv);
  
  // Define the unified configuration object
  window.unifiedConfig = {
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
      },
      // Helper to get current environment's API config
      current() {
        return this[currentEnv];
      }
    },
    
    // API endpoints - only Pixar transformation is supported
    endpoints: {
      // Primary endpoints
      transform: '/transform',
      status: '/status/',
      health: '/health',
      
      // Legacy endpoints (for backward compatibility)
      pixarTransform: '/transform',
      pixarStatus: '/status/'
    },
    
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
    
    // Request configuration
    requests: {
      retries: {
        max: 5,         // Maximum number of retries for failed requests
        backoffFactor: 1.5, // Exponential backoff factor
        initialDelay: 1000  // Initial delay in ms before retrying
      }
    },
    
    // UI Configuration
    ui: {
      showDebugInfo: false, // Whether to show debug information
      autoCloseTimeout: 5000, // Auto-close popups after 5 seconds
      useModernUI: true, // Use modern UI components
      animateTransitions: true, // Animate UI transitions
      showProgressBar: true, // Show progress bar during transformations
      progressBar: {
        containerBackgroundColor: '#f3f3f3',
        backgroundColor: '#4a7dbd',
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
  
  // Store environment reference
  window.unifiedConfig.environment = currentEnv;
  
  // Create a shorthand reference to the current environment's API configuration
  window.unifiedConfig.currentApi = window.unifiedConfig.api[currentEnv];
  
  // Set global variables for backward compatibility
  // ---------------------------------------------
  
  // Face swap config compatibility
  window.faceSwapConfig = {
    ...window.unifiedConfig,
    currentApi: window.unifiedConfig.api[currentEnv]
  };
  
  // Pixar config compatibility
  window.pixarConfig = {
    ...window.unifiedConfig,
    options: {
      pollingInterval: window.unifiedConfig.api[currentEnv].pollingInterval,
      maxRetries: window.unifiedConfig.requests.retries.max,
      timeout: window.unifiedConfig.api[currentEnv].timeout
    },
    fileConstraints: {
      maxSizeMB: window.unifiedConfig.fileUpload.maxFileSize / (1024 * 1024),
      acceptedTypes: window.unifiedConfig.fileUpload.allowedTypes
    },
    upload: window.unifiedConfig.fileUpload
  };
  
  // Set global API URLs for backward compatibility
  window.faceSwapApiUrl = window.unifiedConfig.api[currentEnv].baseUrl;
  window.pixarApiUrl = window.unifiedConfig.api[currentEnv].baseUrl;
  
  // Set polling interval for legacy code
  window.pollingInterval = window.unifiedConfig.api[currentEnv].pollingInterval;
  
  // Make watermark configuration available globally for components to use
  window.watermarkImage = window.unifiedConfig.watermark;
  
  // Log initialization complete
  console.log('Unified configuration initialized successfully');
} else {
  console.log('Unified configuration already initialized, skipping');
} 