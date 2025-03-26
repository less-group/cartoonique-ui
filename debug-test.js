// Debug Test Script
// This script helps identify issues with the test page

// When the page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('Debug script loaded');
  
  // Add a debug test button
  const testControls = document.querySelector('.test-controls');
  if (testControls) {
    const debugButton = document.createElement('button');
    debugButton.id = 'run-debug';
    debugButton.textContent = 'Run Debug Test';
    debugButton.addEventListener('click', runDebugTest);
    testControls.appendChild(debugButton);
    console.log('Debug button added');
  } else {
    console.error('Could not find .test-controls element');
  }
  
  // Check if the required global objects are available
  checkGlobals();
});

// Debug test function
function runDebugTest() {
  console.log('Running debug test...');
  
  try {
    // Test DOM elements
    testDomElements();
    
    // Test global objects
    testGlobalObjects();
    
    // Test utils directly
    testUtilsFunctions();
    
    console.log('Debug test completed');
  } catch (error) {
    console.error('Debug test failed:', error);
  }
}

// Check if DOM elements exist
function testDomElements() {
  console.log('Testing DOM elements...');
  
  const elements = {
    'face-swap-file-input-wrapper': document.querySelector('face-swap-file-input-wrapper'),
    'run-tests button': document.getElementById('run-tests'),
    'run-api-test button': document.getElementById('run-api-test'),
    'run-utils-test button': document.getElementById('run-utils-test'),
    'test-results div': document.getElementById('test-results')
  };
  
  let allFound = true;
  for (const [name, element] of Object.entries(elements)) {
    if (element) {
      console.log(`✅ Found ${name}`);
    } else {
      console.error(`❌ Could not find ${name}`);
      allFound = false;
    }
  }
  
  return allFound;
}

// Check global objects
function checkGlobals() {
  console.log('Checking global objects...');
  
  const globals = {
    'window.faceSwapConfig': window.faceSwapConfig,
    'window.faceSwapApiUrl': window.faceSwapApiUrl,
    'window.faceSwapApiKey': window.faceSwapApiKey,
    'window.FaceSwapUtils': window.FaceSwapUtils,
    'window.FaceSwapApiClient': window.FaceSwapApiClient,
    'window.customElements': window.customElements
  };
  
  let allFound = true;
  for (const [name, object] of Object.entries(globals)) {
    if (object) {
      console.log(`✅ Found ${name}`);
    } else {
      console.error(`❌ Could not find ${name}`);
      allFound = false;
    }
  }
  
  return allFound;
}

// Test global objects
function testGlobalObjects() {
  if (!window.FaceSwapUtils) {
    console.error('FaceSwapUtils not found');
    return false;
  }
  
  if (!window.FaceSwapApiClient) {
    console.error('FaceSwapApiClient not found');
    return false;
  }
  
  return true;
}

// Test utility functions directly
function testUtilsFunctions() {
  console.log('Testing utility functions directly...');
  
  if (!window.FaceSwapUtils) {
    console.error('FaceSwapUtils not found, skipping direct function tests');
    return;
  }
  
  try {
    // Test generateUniqueId
    const id = window.FaceSwapUtils.generateUniqueId();
    console.log('Generated ID:', id);
    
    // Test delay (non-blocking)
    window.FaceSwapUtils.delay(100).then(() => {
      console.log('Delay completed');
    });
    
    console.log('Utility function tests started');
  } catch (error) {
    console.error('Error testing utility functions:', error);
  }
}

// Add a global debug function
window.debugFaceSwap = {
  runDebugTest,
  testDomElements,
  checkGlobals,
  testGlobalObjects,
  testUtilsFunctions
};

console.log('Debug script initialized - window.debugFaceSwap available in console'); 