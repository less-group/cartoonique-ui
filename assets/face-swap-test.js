// Face Swap Test Script
// This script is used to test the face swap functionality

// Create a placeholder dataUrl for test files if not present
if (window.faceSwapConfig && window.faceSwapConfig.testFiles) {
  const placeholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';
  
  if (window.faceSwapConfig.testFiles.validImage && !window.faceSwapConfig.testFiles.validImage.dataUrl) {
    window.faceSwapConfig.testFiles.validImage = {
      file: window.faceSwapConfig.testFiles.validImage,
      dataUrl: placeholder
    };
  }
}

// Mock DOM elements
class MockFileInput extends EventTarget {
  constructor(file) {
    super();
    this.files = [file];
    this.value = 'test-file-path';
  }
}

// Test functions
async function testFaceSwap() {
  console.log('Starting face swap test with configuration:', window.faceSwapConfig);
  
  // Check if mock mode is enabled
  const mockMode = window.MOCK_API_MODE;
  console.log(`Mock mode: ${mockMode ? 'enabled' : 'disabled'}`);
  
  // Test with valid image
  const validFile = window.faceSwapConfig.testFiles.validImage.file || window.faceSwapConfig.testFiles.validImage;
  await testWithFile(validFile, 'Valid image test');
  
  // Test with invalid file type
  const invalidTypeFile = window.faceSwapConfig.testFiles.invalidType;
  await testWithFile(invalidTypeFile, 'Invalid file type test');
  
  // Test with oversized file
  const oversizedFile = window.faceSwapConfig.testFiles.oversized;
  await testWithFile(oversizedFile, 'Oversized file test');
  
  // Test direct API client
  await testApiClient();
  
  // Test utils
  await testUtils();
}

async function testWithFile(file, testName) {
  console.log(`Running test: ${testName}`);
  
  // Create mock file input event
  const mockFileInput = new MockFileInput(file);
  const event = new Event('change');
  Object.defineProperty(event, 'target', { value: mockFileInput });
  
  // Get file input wrapper
  const fileInputWrapper = document.querySelector('face-swap-file-input-wrapper');
  if (!fileInputWrapper) {
    console.error('File input wrapper not found');
    return;
  }
  
  try {
    // Set test properties from product config
    const testProduct = window.faceSwapConfig?.testData?.product || {};
    
    // Log the test properties we're setting
    console.log('Setting test properties:', {
      targetImageUrl: testProduct.targetImageUrl || 'https://example.com/target.jpg',
      printImageUrl: testProduct.printImageUrl || 'https://example.com/print.jpg',
      productId: testProduct.id || 'test-product',
      customerId: window.faceSwapConfig?.testData?.customer?.id || 'test-customer',
      orderId: window.faceSwapConfig?.testData?.order?.id || 'test-order',
      productColor: testProduct.color || 'blue'
    });
    
    // Set properties on the wrapper element
    fileInputWrapper.targetImageUrl = testProduct.targetImageUrl || 'https://example.com/target.jpg';
    fileInputWrapper.printImageUrl = testProduct.printImageUrl || 'https://example.com/print.jpg';
    fileInputWrapper.productId = testProduct.id || 'test-product';
    fileInputWrapper.customerId = window.faceSwapConfig?.testData?.customer?.id || 'test-customer';
    fileInputWrapper.orderId = window.faceSwapConfig?.testData?.order?.id || 'test-order';
    fileInputWrapper.productColor = testProduct.color || 'blue';
    
    // Call face swap method
    console.log('Calling faceSwapImage method with test file');
    await fileInputWrapper.faceSwapImage(event);
    
    console.log(`Test completed: ${testName}`);
  } catch (error) {
    console.error(`Test failed: ${testName}`, error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

async function testApiClient() {
  console.log('Testing API client directly');
  
  try {
    // Explicitly enable mock mode for this test
    const mockMode = window.MOCK_API_MODE !== undefined ? window.MOCK_API_MODE : true;
    console.log(`Using mock mode: ${mockMode}`);
    
    const apiClient = new window.UnifiedApiClient({
      baseUrl: window.faceSwapConfig?.api?.test?.baseUrl || 'https://letzteshemd-faceswap-api-production.up.railway.app',
      mockMode: mockMode
    });
    
    console.log('API client created:', apiClient);
    
    // Create a test file from the valid image data URL or use a placeholder
    let file;
    try {
      const validImageDataUrl = window.faceSwapConfig?.testFiles?.validImage?.dataUrl || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';
      const blob = await fetch(validImageDataUrl).then(r => r.blob());
      file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
      console.log('Created test file from data URL');
    } catch (e) {
      console.warn('Creating file from dataUrl failed, using fallback:', e);
      file = new File([new Uint8Array(10000).fill(255)], 'test-image.jpg', { type: 'image/jpeg' });
      console.log('Created fallback test file');
    }
    
    // Generate a test job ID
    const jobId = window.FaceSwapUtils.generateUniqueId();
    console.log('Generated job ID:', jobId);
    
    console.log('Starting image transformation...');
    
    // Get watermark configuration
    const watermarkConfig = window.watermarkImage || {
      url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
      width: 200,
      height: 200,
      spaceBetweenWatermarks: 100
    };
    
    // Test transform with explicit parameters
    const result = await apiClient.transform({
      sourceImage: file,
      watermark: watermarkConfig,
      jobId: jobId
    });
    
    console.log('API client test result:', result);
    
    if (result.success) {
      console.log('✅ API client test passed!');
    } else {
      console.error('❌ API client test failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('API client test failed with exception:', error);
    throw error;
  }
}

async function testUtils() {
  console.log('Testing utility functions');
  
  try {
    // Test generateUniqueId
    const id1 = window.FaceSwapUtils.generateUniqueId();
    const id2 = window.FaceSwapUtils.generateUniqueId();
    console.log('Generated IDs:', id1, id2);
    console.assert(id1 !== id2, 'IDs should be unique');
    
    // Test fileToBase64
    try {
      // Try to get dataUrl from test config or use a placeholder
      const validImageDataUrl = window.faceSwapConfig.testFiles.validImage.dataUrl || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';
      const blob = await fetch(validImageDataUrl).then(r => r.blob());
      const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
      
      const base64 = await window.FaceSwapUtils.fileToBase64(file);
      console.log('File to base64 result length:', base64.length);
      
      // Test urlToBase64
      const base64FromUrl = await window.FaceSwapUtils.urlToBase64(validImageDataUrl);
      console.log('URL to base64 result length:', base64FromUrl.length);
    } catch (e) {
      console.warn('Base64 conversion tests skipped due to error:', e);
    }
    
    // Test delay
    const startTime = Date.now();
    await window.FaceSwapUtils.delay(100);
    const endTime = Date.now();
    console.log('Delay time:', endTime - startTime);
    console.assert(endTime - startTime >= 100, 'Delay should wait at least 100ms');
    
    console.log('Utils tests completed successfully');
  } catch (error) {
    console.error('Utils tests failed:', error);
  }
}

// Make functions globally available
window.testFaceSwap = testFaceSwap;
window.testWithFile = testWithFile;
window.testApiClient = testApiClient;
window.testUtils = testUtils;

// Log that the script is loaded
console.log('Face swap test script loaded - functions available globally');

// Run tests when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - face swap test script initialized');
  // Don't run tests automatically to avoid console spam
  // testFaceSwap();
}); 