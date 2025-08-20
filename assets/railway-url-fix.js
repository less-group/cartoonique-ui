/**
 * Fix for malformed Railway URLs that are missing file extensions
 * This function takes a URL that may be incomplete and ensures it has proper file extension
 * @param {string} url - The URL to check and fix
 * @returns {string} - The fixed URL with proper file extension
 */
function fixRailwayImageUrl(url) {
  if (!url) return url;
  
  // Check if this is a Railway temp-storage URL missing an extension
  if (url.includes('/temp-storage/pixar-watermarked-') && 
      !url.includes('.png') && !url.includes('.jpg') && !url.includes('.jpeg')) {
    
    console.log('🖼️ Fixing malformed Railway URL:', url);
    
    // Split URL into base and ID portions
    const baseUrl = url.split('/temp-storage/')[0];
    const idPortion = url.split('/temp-storage/')[1];
    
    // Add timestamp and random ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    
    // Construct the fixed URL with PNG extension
    const fixedUrl = `${baseUrl}/temp-storage/${idPortion}${timestamp}-${randomId}.png`;
    console.log('🖼️ Fixed URL:', fixedUrl);
    
    return fixedUrl;
  }
  
  // Return original URL if no fix needed
  return url;
}

// Make function available globally
window.fixRailwayImageUrl = fixRailwayImageUrl;

// Add event listener to intercept and fix Railway image URLs
document.addEventListener('pixar-transform-complete', function(event) {
  if (event.detail && event.detail.imageUrl) {
    // Fix the URL if needed
    event.detail.imageUrl = fixRailwayImageUrl(event.detail.imageUrl);
  }
}, true); // Use capture phase to get event before other handlers

// Also patch XMLHttpRequest to check and fix URLs in responses
(function() {
  // Store the original open method
  const originalOpen = XMLHttpRequest.prototype.open;
  
  // Override open method
  XMLHttpRequest.prototype.open = function() {
    // Call the original method
    originalOpen.apply(this, arguments);
    
    // Check if this is a request to the Railway API
    if (arguments[1] && arguments[1].includes('letzteshemd-faceswap-api-production.up.railway.app')) {
      // Add a response handler
      this.addEventListener('load', function() {
        try {
          // Parse the response
          const response = JSON.parse(this.responseText);
          
          // Check for image URLs in the response
          if (response) {
            // Check common image URL fields
            const fields = ['watermarkedImageUrlToShow', 'processedImageUrl', 
                           'watermarkedOriginalImageUrl', 'resultImageUrl'];
            
            let modified = false;
            
            // Fix each field if needed
            fields.forEach(field => {
              if (response[field]) {
                const original = response[field];
                response[field] = fixRailwayImageUrl(original);
                
                if (original !== response[field]) {
                  modified = true;
                }
              }
            });
            
            // If nested in image object
            if (response.image && response.image.url) {
              const original = response.image.url;
              response.image.url = fixRailwayImageUrl(original);
              
              if (original !== response.image.url) {
                modified = true;
              }
            }
            
            // If response was modified, update the responseText
            if (modified) {
              // We can't modify responseText directly, but we can log
              console.log('🖼️ Fixed Railway API response URLs');
              
              // Store the fixed response for retrieval
              this._fixedResponse = response;
            }
          }
        } catch (error) {
          console.error('Error fixing Railway API response:', error);
        }
      });
    }
  };
  
  // Store the original JSON parse
  const originalJSONParse = JSON.parse;
  
  // Override JSON.parse
  JSON.parse = function(text) {
    const result = originalJSONParse.apply(this, arguments);
    
    // If result has Railway image URLs, fix them
    if (result && typeof result === 'object') {
      // Check common image URL fields
      const fields = ['watermarkedImageUrlToShow', 'processedImageUrl', 
                     'watermarkedOriginalImageUrl', 'resultImageUrl'];
      
      // Fix each field if needed
      fields.forEach(field => {
        if (result[field]) {
          result[field] = fixRailwayImageUrl(result[field]);
        }
      });
      
      // If nested in image object
      if (result.image && result.image.url) {
        result.image.url = fixRailwayImageUrl(result.image.url);
      }
    }
    
    return result;
  };
})();

console.log('Railway URL fix utility loaded successfully'); 