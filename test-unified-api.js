/**
 * Unified API Client Test Script
 * This script tests the unified API client with real API endpoints for Pixar transformations
 */

// Define base URL
const API_BASE_URL = 'https://letzteshemd-faceswap-api-production.up.railway.app';

// Run test when loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Unified API test script loaded');
  
  // Create a button to run the tests
  const testButton = document.createElement('button');
  testButton.textContent = 'Test Pixar API';
  testButton.style.padding = '10px 20px';
  testButton.style.backgroundColor = '#4CAF50';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '4px';
  testButton.style.cursor = 'pointer';
  testButton.style.margin = '10px';
  
  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'api-test-results';
  resultsContainer.style.margin = '10px';
  resultsContainer.style.padding = '10px';
  resultsContainer.style.border = '1px solid #ddd';
  resultsContainer.style.borderRadius = '4px';
  resultsContainer.style.backgroundColor = '#f5f5f5';
  resultsContainer.style.fontFamily = 'monospace';
  resultsContainer.style.whiteSpace = 'pre-wrap';
  resultsContainer.style.maxHeight = '400px';
  resultsContainer.style.overflow = 'auto';
  
  // Add to document
  document.body.appendChild(testButton);
  document.body.appendChild(resultsContainer);
  
  // Add event listener
  testButton.addEventListener('click', runApiTests);
});

// Log to screen and console
function log(message, data) {
  const resultsContainer = document.getElementById('api-test-results');
  
  if (!resultsContainer) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const formattedMessage = data 
    ? `${timestamp} - ${message}: ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`
    : `${timestamp} - ${message}`;
  
  const entry = document.createElement('div');
  entry.textContent = formattedMessage;
  resultsContainer.appendChild(entry);
  resultsContainer.scrollTop = resultsContainer.scrollHeight;
  
  console.log(message, data);
}

// Run all API tests
async function runApiTests() {
  log('Starting Pixar API tests...');
  
  try {
    // Test 1: Check health endpoint
    await testHealthEndpoint();
    
    // Test 2: Test unified client with mock mode
    await testUnifiedClientMock();
    
    // Test 3: Test Pixar transformation with watermark (optional - uses real API call)
    if (confirm('Do you want to test with a real API call? This will upload an image.')) {
      await testPixarTransform();
    }
    
    log('All tests completed!', '✅');
  } catch (error) {
    log('Tests failed with error:', error.message);
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  log('Testing health endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    log('Health endpoint response:', data);
    
    if (data.status === 'ok') {
      log('Health endpoint test passed!', '✅');
      return true;
    } else {
      throw new Error('Health endpoint returned unexpected status');
    }
  } catch (error) {
    log('Health endpoint test failed:', error.message);
    throw error;
  }
}

// Test unified client with mock mode
async function testUnifiedClientMock() {
  log('Testing UnifiedApiClient with mock mode...');
  
  try {
    // Check if UnifiedApiClient is available
    if (!window.UnifiedApiClient) {
      throw new Error('UnifiedApiClient not found! Make sure unified-api-client.js is loaded.');
    }
    
    // Create client with mock mode
    const client = new window.UnifiedApiClient({
      baseUrl: API_BASE_URL,
      mockMode: true
    });
    
    log('UnifiedApiClient created with configuration:', {
      baseUrl: client.baseUrl,
      mockMode: client.mockMode
    });
    
    // Create test file
    const testFile = new File(
      [new Uint8Array(1000).fill(255)],
      'test-face.jpg',
      { type: 'image/jpeg' }
    );
    
    // Test the transform method with simplified payload (no transformationType)
    log('Testing transform method with simplified payload...');
    const result = await client.transform({
      sourceImage: testFile,
      watermark: {
        url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
        width: 200,
        height: 200,
        spaceBetweenWatermarks: 100
      }
    });
    
    log('Transform result:', result);
    
    if (result.success) {
      log('UnifiedApiClient mock test passed!', '✅');
      return true;
    } else {
      throw new Error('Mock test failed - no success flag in response');
    }
  } catch (error) {
    log('UnifiedApiClient mock test failed:', error.message);
    throw error;
  }
}

// Test Pixar transformation with a real API call
async function testPixarTransform() {
  log('Testing Pixar transformation with real API call...');
  
  try {
    // Create a client without mock mode
    const client = new window.UnifiedApiClient({
      baseUrl: API_BASE_URL,
      mockMode: false
    });
    
    log('Created UnifiedApiClient for real API testing');
    
    // Create a small canvas image for testing
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a red square with a blue border
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, 100, 100);
    
    // Convert to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
    
    log('Created test image file');
    
    // Make API request
    log('Calling transform API with simplified payload...');
    
    // Add progress logging
    const progressCallback = (progress) => {
      log(`Transform progress: ${progress}%`);
    };
    
    // Execute transform with simplified payload (no transformationType)
    const result = await client.transform({
      sourceImage: file,
      watermark: {
        url: 'https://cdn.shopify.com/s/files/1/0626/3416/4430/files/letzteshemd-watermark.png',
        width: 100,
        height: 100,
        spaceBetweenWatermarks: 50
      }
    }, progressCallback);
    
    log('Transform API result:', result);
    
    // Check the result and show images if available
    if (result.success && result.imageUrl) {
      log('Pixar transformation test passed!', '✅');
      
      // Show the resulting image
      const img = document.createElement('img');
      img.src = result.imageUrl;
      img.style.maxWidth = '300px';
      img.style.border = '1px solid #ddd';
      img.style.borderRadius = '4px';
      img.style.margin = '10px 0';
      
      document.getElementById('api-test-results').appendChild(img);
      
      return true;
    } else {
      throw new Error('API test failed - missing imageUrl in response');
    }
  } catch (error) {
    log('Pixar transformation test failed:', error.message);
    throw error;
  }
}

// Export for console use
window.runApiTests = runApiTests; 