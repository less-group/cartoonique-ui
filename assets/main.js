/**
 * Main initialization script for the Letzteshemd UI
 * 
 * This script handles loading the unified configuration and API client
 * before other components to ensure they have access to these dependencies.
 * 
 * @version 1.0.0
 */

// Log initialization start
console.log('Initializing Letzteshemd UI...');

// Set loading flags
window.__LOADING_STARTED = true;

// Initialize mock mode off by default
if (typeof window.__MOCK_MODE__ === 'undefined') {
  window.__MOCK_MODE__ = false;
}

// Function to detect environment
function detectEnvironment() {
  // Check for development indicators
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('dev.') ||
    window.location.hostname.includes('staging.') ||
    (window.Shopify && window.Shopify.designMode);
  
  return isDevelopment ? 'development' : 'production';
}

// Function to log initialization events
function logInit(message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] [INIT] ${message}`);
}

// Function to load script with a promise
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Load scripts in the correct order
async function loadScripts() {
  try {
    // 1. Detect environment
    window.LETZTESHEMD_ENV = detectEnvironment();
    logInit(`Environment detected: ${window.LETZTESHEMD_ENV}`);
    
    // 2. First, load the unified configuration
    logInit('Loading unified configuration...');
    await loadScript('assets/unified-config.js');
    
    // 3. Load utility scripts
    logInit('Loading utility scripts...');
    await Promise.all([
      loadScript('assets/face-swap-utils.js'),
      loadScript('assets/pixar-utils.js')
    ]);
    
    // 4. Load the unified API client
    logInit('Loading unified API client...');
    await loadScript('assets/unified-api-client.js');
    
    // 5. Load UI components
    logInit('Loading UI components...');
    await Promise.all([
      loadScript('assets/face-swap-file-input-wrapper.js'),
      loadScript('assets/pixar-transform-file-input.js')
    ]);
    
    // Set loading complete flag
    window.__LOADING_COMPLETE = true;
    
    // Dispatch a custom event to notify the application that loading is complete
    window.dispatchEvent(new CustomEvent('letzteshemd:loaded'));
    
    logInit('Initialization complete!');
  } catch (error) {
    console.error('Failed to load scripts:', error);
    
    // Set loading failed flag
    window.__LOADING_FAILED = true;
    
    // Dispatch an error event
    window.dispatchEvent(new CustomEvent('letzteshemd:error', { 
      detail: { error: error.message } 
    }));
  }
}

// Initialize immediately if the document is already loaded,
// or wait for the DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadScripts);
} else {
  loadScripts();
} 