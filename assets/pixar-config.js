/**
 * Pixar Transformation Configuration
 * A simpler, more reliable configuration for the Pixar transformation feature
 */
 
// Prevent redeclaration by checking if config already exists
if (typeof window.pixarConfig === 'undefined') {
  console.log('Initializing pixarConfig...');
  
  // Define the configuration object
  window.pixarConfig = {
    // API Configuration
    api: {
      development: {
        baseUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app',
        timeout: 120000, // 2 minutes timeout
        pollingInterval: 2000, // Poll every 2 seconds during development
        maxPollingAttempts: 60 // Maximum polling attempts (2 minutes)
      },
      production: {
        baseUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app',
        timeout: 120000, // 2 minutes timeout
        pollingInterval: 2000, // Poll every 2 seconds in production
        maxPollingAttempts: 60 // Maximum polling attempts (2 minutes)
      }
    },
    // Configuration options
    options: {
      pollingInterval: 1000, // 1 second polling interval
      maxRetries: 5,         // Maximum number of retries for failed requests
      timeout: 300000        // 5 minute timeout for long-running operations
    },
    // File constraints
    fileConstraints: {
      maxSizeMB: 10,         // 10MB max file size
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    // API endpoints - unified endpoints for all transformations
    endpoints: {
      transform: '/transform',
      status: '/status/'
    },
    // Default transformation type
    defaultTransformationType: 'pixar',
    // File Upload Configuration
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 4096,
      maxHeight: 4096
    },
    // Default watermark configuration
    watermark: {
      url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/watermark.png',
      width: 200,
      height: 200,
      spaceBetweenWatermarks: 100
    },
    // UI Configuration
    ui: {
      showDebugInfo: false,
      animateTransitions: true,
      autoClosePopups: true,
      popupTimeout: 5000, // 5 seconds
      showProgressBar: true
    }
  };
  
  // Set the current environment
  if (typeof window.currentEnv === 'undefined') {
    window.currentEnv = window.Shopify?.theme?.role === 'published' ? 'production' : 'development';
    console.log('Environment set to:', window.currentEnv);
  }
  
  // Set the API URL
  window.pixarApiUrl = window.pixarConfig.api[window.currentEnv].baseUrl;
  
  // For backward compatibility
  window.faceSwapApiUrl = window.pixarApiUrl;
  
  // Set polling interval (1 second)
  window.pollingInterval = 1000;
  
  // Make watermark configuration available globally
  window.watermarkImage = window.pixarConfig.watermark;
  
  console.log('pixarConfig initialized with environment:', window.currentEnv);
} else {
  console.log('pixarConfig already defined, skipping initialization');
} 