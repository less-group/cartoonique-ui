# Unified Configuration System

## Overview

The unified configuration system consolidates all API-related settings for Pixar-style transformations. It replaces and merges the functionality from both `face-swap-config.js` and `pixar-config.js` into a single, coherent configuration system.

## File Structure

- `assets/unified-config.js` - The main configuration file that contains all settings
- `assets/main.js` - Script that handles proper loading order of dependencies 
- `config-test.html` - Test page to verify configuration is working correctly

## Configuration Usage

### Basic Usage

For any new components, use the unified configuration directly:

```javascript
// Get the API base URL
const apiUrl = window.unifiedConfig.api.current().baseUrl;

// Get watermark configuration
const watermark = window.unifiedConfig.watermark;

// Access environment
const env = window.unifiedConfig.environment; // 'production' or 'development'

// Use API endpoints
const transformEndpoint = window.unifiedConfig.endpoints.transform; // '/transform'
```

### With UnifiedApiClient

The UnifiedApiClient is designed to work with the unified configuration:

```javascript
// Create a client that automatically uses the unified configuration
const client = new window.UnifiedApiClient();

// The client will use:
// - baseUrl from unifiedConfig.api.current().baseUrl
// - watermark from unifiedConfig.watermark
// - polling settings from unifiedConfig.api.current()
```

## Backward Compatibility

For backward compatibility, the unified configuration also populates the legacy configuration objects:

- `window.faceSwapConfig` - Contains the same data as `window.unifiedConfig`
- `window.pixarConfig` - Contains data mapped from `window.unifiedConfig`
- `window.watermarkImage` - References `window.unifiedConfig.watermark`
- `window.faceSwapApiUrl` - References `window.unifiedConfig.api.current().baseUrl`
- `window.pixarApiUrl` - References `window.unifiedConfig.api.current().baseUrl`

## Configuration Structure

```javascript
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
      backgroundColor: '#4caf50',
      textColor: '#fff',
      speed: 1
    },
    messages: {
      loading: 'Die Transformation kann bis zu 1-2 Minuten dauern.',
      processing: 'Dein Bild wird in Pixar-Stil umgewandelt...',
      success: 'Die Pixar-Transformation war erfolgreich.',
      error: {
        invalidType: 'Ungültiger Dateityp. Bitte lade ein Bild hoch (JPG oder PNG)',
        tooLarge: 'Die Datei ist zu groß. Die maximale Größe beträgt 10 MB.',
        generic: 'Etwas ist schief gelaufen, bitte versuche es erneut',
        timeout: 'Die Verarbeitung dauert zu lange. Bitte versuche es später erneut.'
      }
    }
  }
}
```

## Environment Detection

The configuration automatically detects whether it's running in development or production:

- **Development**: 
  - When running on localhost
  - When `window.Shopify.designMode` is true
  - When running on a URL containing 'dev.' or 'staging.'

- **Production**:
  - All other cases

## Testing

To verify that the unified configuration is working correctly, open `config-test.html` in a browser and run the tests.

## Migration Guide

1. Update script tags to load unified configuration:
   ```html
   <!-- Old approach -->
   <script src="assets/face-swap-config.js"></script>
   <script src="assets/pixar-config.js"></script>
   
   <!-- New approach -->
   <script src="assets/unified-config.js"></script>
   ```

2. Update API client usage:
   ```javascript
   // Old approach
   const client = new window.FaceSwapApiClient({
     baseUrl: window.faceSwapApiUrl
   });
   
   // New approach
   const client = new window.UnifiedApiClient();
   ```

3. For complete dependency management, use main.js:
   ```html
   <script src="assets/main.js"></script>
   ```

## Important Note About Transformation Types

The API now only supports Pixar-style transformations. The transformation type parameter has been removed from the API client and configuration. When calling the API, you only need to provide the source image and optional watermark configuration.

### API Request Format

```javascript
// Current simplified API request format
{
  "image": "base64-encoded-image-data",
  "watermark": {
    "url": "https://example.com/watermark.png",
    "width": 200,
    "height": 200,
    "spaceBetweenWatermarks": 100
  }
}
``` 