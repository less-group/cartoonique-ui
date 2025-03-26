/**
 * Shopify Integration Example for Pixar Style Transformation
 * 
 * This script demonstrates how to integrate the Pixar style transformation functionality
 * into a Shopify store using the unified Face Swap API.
 * 
 * Usage:
 * 1. Include the required JS files in your theme.liquid or product template
 * 2. Add the custom element where you want the Pixar transformation UI to appear
 * 3. Customize the UI and messaging as needed
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a product page
  if (!document.querySelector('.product')) {
    return;
  }
  
  // Initialize pixar transformation configuration
  initPixarConfig();
  
  // Find product container
  const productContainer = document.querySelector('.product__info-container');
  if (!productContainer) {
    console.warn('Product container not found, cannot add Pixar transformation UI');
    return;
  }
  
  // Create pixar transformation container
  const pixarContainer = document.createElement('div');
  pixarContainer.className = 'pixar-container';
  pixarContainer.innerHTML = `
    <h3 class="pixar-title">Pixar-Stil Transformation</h3>
    <p class="pixar-description">Lade ein Foto von dir hoch und verwandle es in Pixar-Stil – perfekt für dieses Produkt!</p>
    <pixar-transform-file-input></pixar-transform-file-input>
  `;
  
  // Add container after product form
  const productForm = productContainer.querySelector('.product-form');
  if (productForm) {
    productForm.parentNode.insertBefore(pixarContainer, productForm.nextSibling);
  } else {
    productContainer.appendChild(pixarContainer);
  }
  
  // Get product information
  const productId = document.querySelector('input[name="id"]')?.value;
  const productTitle = document.querySelector('.product__title')?.textContent?.trim();
  const productImage = document.querySelector('.product__media img');
  
  // Get file input wrapper and set properties (support both new and old element names for compatibility)
  const fileInputWrapper = document.querySelector('pixar-transform-file-input') || 
                          document.querySelector('face-swap-file-input-wrapper');
                          
  if (fileInputWrapper && productImage) {
    // Set wrapper attributes
    fileInputWrapper.transformationType = 'pixar'; // Only Pixar style is available
    
    // Add the Add to Cart button handler to update the image
    const addToCartButton = document.querySelector('.product-form__submit');
    if (addToCartButton && fileInputWrapper.processedPrintImageUrl) {
      addToCartButton.addEventListener('click', function(event) {
        // Store the processed image URL in sessionStorage
        if (fileInputWrapper.processedPrintImageUrl) {
          sessionStorage.setItem('pixar_image_' + productId, fileInputWrapper.processedPrintImageUrl);
          // For backward compatibility
          sessionStorage.setItem('face_swap_image_' + productId, fileInputWrapper.processedPrintImageUrl);
        }
      });
    }
  }

  // Ensure the utility functions are properly loaded
  if (window.PixarUtils && typeof window.PixarUtils.ensureLoaded === 'function') {
    window.PixarUtils.ensureLoaded();
  } else if (window.FaceSwapUtils && typeof window.FaceSwapUtils.ensureLoaded === 'function') {
    window.FaceSwapUtils.ensureLoaded();
  }
});

/**
 * Initialize pixar transformation configuration
 */
function initPixarConfig() {
  console.log('==== WATERMARK DEBUG ====');
  console.log('Initializing Pixar config and watermark settings');
  
  window.pixarConfig = {
    // API Configuration
    api: {
      development: {
        baseUrl: 'https://api.letzteshemd-faceswap.com',
        timeout: 120000, // 2 minutes
        pollingInterval: 5000, // 5 seconds as recommended by the backend
        maxPollingAttempts: 60 // Maximum number of polling attempts (5 minutes total)
      },
      production: {
        baseUrl: 'https://api.letzteshemd-faceswap.com',
        timeout: 120000, // 2 minutes
        pollingInterval: 5000, // 5 seconds as recommended by the backend
        maxPollingAttempts: 60 // Maximum number of polling attempts (5 minutes total)
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
  
    // File Upload Configuration
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB as recommended by the backend
      allowedTypes: ['image/jpeg', 'image/png'],
      maxWidth: 4096,
      maxHeight: 4096
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
    },
    
    // Default Watermark Configuration
    watermark: {
      url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
      width: 200,
      height: 200,
      spaceBetweenWatermarks: 100
    }
  };
  
  // For backward compatibility
  window.faceSwapConfig = window.pixarConfig;
  
  // Set the current environment
  const env = window.Shopify?.theme?.role === 'unpublished' ? 'development' : 'production';
  window.pixarApiUrl = window.pixarConfig.api[env].baseUrl;
  window.faceSwapApiUrl = window.pixarApiUrl; // For backward compatibility
  
  // Define a fallback unique ID generator in case FaceSwapUtils isn't loaded
  if (!window.generateUniqueId) {
    window.generateUniqueId = function() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
  }
  
  // Validate or setup watermark configuration
  if (!window.watermarkImage) {
    console.log('No watermark image configuration found, using default');
    window.watermarkImage = window.pixarConfig.watermark;
    console.log('Set watermarkImage to default:', window.watermarkImage);
  } else if (typeof window.watermarkImage === 'object') {
    console.log('Existing watermarkImage found:', JSON.stringify(window.watermarkImage));
    // Validate watermark object structure
    if (!window.watermarkImage.url) {
      console.warn('Invalid watermark info format: Missing URL');
      window.watermarkImage.url = window.pixarConfig.watermark.url;
      console.log('Updated watermarkImage URL:', window.watermarkImage.url);
    }
    // Ensure width and height are set
    if (!window.watermarkImage.width) {
      window.watermarkImage.width = window.pixarConfig.watermark.width;
      console.log('Set default watermarkImage width:', window.watermarkImage.width);
    }
    if (!window.watermarkImage.height) {
      window.watermarkImage.height = window.pixarConfig.watermark.height;
      console.log('Set default watermarkImage height:', window.watermarkImage.height);
    }
    if (!window.watermarkImage.spaceBetweenWatermarks) {
      window.watermarkImage.spaceBetweenWatermarks = window.pixarConfig.watermark.spaceBetweenWatermarks;
      console.log('Set default watermarkImage spacing:', window.watermarkImage.spaceBetweenWatermarks);
    }
    console.log('Final watermarkImage configuration:', JSON.stringify(window.watermarkImage));
  } else {
    console.error('Invalid watermark image format, should be an object');
    window.watermarkImage = window.pixarConfig.watermark;
    console.log('Reset watermarkImage to default:', window.watermarkImage);
  }
  
  console.log('==== WATERMARK CONFIG COMPLETE ====');
} 