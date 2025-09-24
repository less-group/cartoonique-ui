/**
 * Browser Console Test for Gemini Frontend Display
 * Run this in the browser console while on the pixar-gemini product page
 */

console.log('%c🎬 Testing Gemini Frontend Display Integration', 'color: cyan; font-size: 16px; font-weight: bold');

// Test 1: Check if template is correctly detected
console.group('📋 Template Detection');
const isPixarGemini = window?.template === "product.pixar-gemini" || 
                      location.href.includes("/products/pixar-gemini");
console.log('Current template:', window?.template);
console.log('URL includes pixar-gemini:', location.href.includes("/products/pixar-gemini"));
console.log('Is Pixar Gemini template:', isPixarGemini);
console.groupEnd();

// Test 2: Monitor transform complete events
console.group('🎯 Event Listeners');
let eventReceived = false;

document.addEventListener('pixar-transform-complete', (event) => {
  console.log('%c✅ pixar-transform-complete event received!', 'color: green; font-weight: bold');
  console.log('Event detail:', event.detail);
  
  if (event.detail?.imageUrl) {
    console.log('%c🖼️ Image URL from event:', 'color: blue', event.detail.imageUrl);
    console.log('Is Gemini response:', event.detail.isGemini === true);
    eventReceived = true;
    
    // Check if image is being displayed
    setTimeout(() => {
      const productImages = document.querySelectorAll('.product-gallery img, .product__media img, .product__media-item img');
      console.group('🖼️ Product Image Check');
      console.log(`Found ${productImages.length} product images`);
      
      let transformedFound = false;
      productImages.forEach((img, index) => {
        if (img.src.includes('railway.app') || img.src === event.detail.imageUrl) {
          console.log(`✅ Image ${index} has transformed URL:`, img.src);
          transformedFound = true;
        }
      });
      
      if (!transformedFound) {
        console.warn('⚠️ No product images have the transformed URL yet');
      }
      console.groupEnd();
    }, 1000);
  }
});

console.log('✅ Event listener registered for pixar-transform-complete');
console.groupEnd();

// Test 3: Simulate a Gemini API response (for testing response handling)
console.group('🧪 Response Handler Test');
console.log('Creating mock Gemini response handler test...');

// This simulates what should happen when the Gemini API responds
const mockGeminiResponse = {
  success: true,
  message: "Gemini transformation completed successfully",
  imageUrl: "https://example.com/test-image.png",
  watermarkedImageUrl: "https://example.com/test-watermarked.png",
  processedImageUrl: "https://example.com/test-processed.png"
};

console.log('Mock Gemini response structure:', mockGeminiResponse);
console.log('Expected behavior: Should immediately dispatch transform-complete event');
console.log('Expected behavior: Should NOT poll for status');
console.groupEnd();

// Test 4: Check if image processing manager is available
console.group('🔧 Image Processing Manager');
const hasManager = typeof ImageProcessingManager !== 'undefined';
console.log('ImageProcessingManager available:', hasManager);

if (window.imageProcessingManager) {
  console.log('Instance found:', window.imageProcessingManager);
  console.log('Stylized Image URL:', window.imageProcessingManager.stylizedImageUrl);
  console.log('Transformation Complete:', window.imageProcessingManager.transformationComplete);
}
console.groupEnd();

// Test 5: Provide manual test instructions
console.group('%c📝 Manual Test Instructions', 'color: orange; font-weight: bold');
console.log('1. Upload an image using the file input');
console.log('2. Watch the console for the following:');
console.log('   - "🖼️ Using Gemini Flash 2.5 endpoint for pixar-gemini template"');
console.log('   - "🖼️ Gemini Flash 2.5 response with direct image URLs"');
console.log('   - "✅ pixar-transform-complete event received!"');
console.log('3. The transformed image should appear in the product gallery');
console.log('4. Check that no polling messages appear (no "Polling Railway job status")');
console.groupEnd();

// Test 6: Check for common issues
console.group('⚠️ Common Issues Check');

// Check for jobId polling (shouldn't happen with Gemini)
if (window.railwayJobsStatus) {
  const jobs = Object.keys(window.railwayJobsStatus);
  if (jobs.length > 0) {
    console.warn('Job polling detected - this should NOT happen for Gemini endpoint');
    console.log('Active jobs:', window.railwayJobsStatus);
  }
}

// Check for error states
const errorElements = document.querySelectorAll('.error-message, .upload-error');
if (errorElements.length > 0) {
  console.error('Error elements found on page:', errorElements);
}

console.groupEnd();

console.log('%c🏁 Test setup complete - now upload an image to test the flow', 'color: green; font-size: 14px; font-weight: bold');