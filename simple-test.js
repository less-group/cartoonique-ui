// Simple API Client Test
// This standalone file helps debug API client issues

console.log('Simple test script loaded');

// Function to run when clicked
async function runSimpleTest() {
  console.log('Running simple API client test');
  
  try {
    // Check if we have the required objects
    if (!window.UnifiedApiClient) {
      throw new Error('UnifiedApiClient is not defined');
    }
    
    if (!window.FaceSwapUtils) {
      throw new Error('FaceSwapUtils is not defined');
    }
    
    console.log('Required objects found, creating test file');
    
    // Create a simple test file
    const testFile = new File(
      [new Uint8Array(1000).fill(255)],
      'test-face.jpg',
      { type: 'image/jpeg' }
    );
    
    console.log('Test file created, initializing API client with mock mode');
    
    // Create API client with mock mode enabled
    const apiClient = new window.UnifiedApiClient({
      baseUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app',
      mockMode: true
    });
    
    console.log('API client created:', apiClient);
    console.log('Mock mode enabled:', apiClient.mockMode);
    
    // Generate a test job ID
    const jobId = window.FaceSwapUtils.generateUniqueId ? 
                 window.FaceSwapUtils.generateUniqueId() : 
                 'test-job-id-' + Date.now();
    
    console.log('Generated job ID:', jobId);
    
    // Get watermark configuration
    const watermarkConfig = window.watermarkImage || {
      url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
      width: 200,
      height: 200,
      spaceBetweenWatermarks: 100
    };
    
    console.log('Calling transform method...');
    
    // Call the transform method
    const result = await apiClient.transform({
      sourceImage: testFile,
      watermark: watermarkConfig,
      productId: 'test-product',
      jobId: jobId
    });
    
    console.log('Transform result:', result);
    
    if (result.success) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
}

// Add button to page when loaded
window.addEventListener('DOMContentLoaded', () => {
  const testControls = document.querySelector('.test-controls');
  if (testControls) {
    const simpleButton = document.createElement('button');
    simpleButton.id = 'run-simple-test';
    simpleButton.textContent = 'Run Simple Test';
    simpleButton.style.backgroundColor = '#ff9800';
    simpleButton.addEventListener('click', async () => {
      try {
        await runSimpleTest();
      } catch (e) {
        console.error('Error running simple test:', e);
      }
    });
    testControls.appendChild(simpleButton);
    console.log('Simple test button added');
  }
});

// Expose for console testing
window.runSimpleTest = runSimpleTest; 