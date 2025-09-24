/**
 * Gemini API Integration Validation Script
 * Run this in the browser console on a product page using the pixar-gemini template
 */

console.log('%c🚀 Gemini API Integration Validation Starting...', 'color: #667eea; font-size: 16px; font-weight: bold');

// Validation test suite
const GeminiValidation = {
    tests: [],
    passed: 0,
    failed: 0,
    
    // Add a test
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    },
    
    // Run all tests
    async runAll() {
        console.log('\n%c📋 Running Validation Tests...', 'color: #764ba2; font-weight: bold');
        
        for (const test of this.tests) {
            try {
                const result = await test.testFn();
                if (result) {
                    console.log(`✅ ${test.name}: PASSED`);
                    this.passed++;
                } else {
                    console.error(`❌ ${test.name}: FAILED`);
                    this.failed++;
                }
            } catch (error) {
                console.error(`❌ ${test.name}: ERROR - ${error.message}`);
                this.failed++;
            }
        }
        
        // Summary
        console.log('\n%c📊 Test Summary', 'color: #667eea; font-size: 14px; font-weight: bold');
        console.log(`Total Tests: ${this.tests.length}`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        
        if (this.failed === 0) {
            console.log('%c🎉 All tests passed! The Gemini integration is ready.', 'color: #4caf50; font-size: 16px; font-weight: bold');
        } else {
            console.log('%c⚠️ Some tests failed. Please review the errors above.', 'color: #ff9800; font-size: 16px; font-weight: bold');
        }
    }
};

// Test 1: Check if widget exists
GeminiValidation.addTest('Widget HTML Structure', () => {
    const widget = document.getElementById('gemini-transform-widget');
    const fileInput = document.getElementById('gemini-image-upload');
    const transformBtn = document.getElementById('gemini-transform-btn');
    const styleSelect = document.getElementById('gemini-style-select');
    
    return widget && fileInput && transformBtn && styleSelect;
});

// Test 2: Check if CSS is loaded
GeminiValidation.addTest('CSS Styles Loaded', () => {
    const widget = document.querySelector('.gemini-widget');
    if (!widget) return false;
    
    const styles = window.getComputedStyle(widget);
    return styles.background && styles.background !== 'none';
});

// Test 3: Check if JavaScript client is initialized
GeminiValidation.addTest('JavaScript Client Initialized', () => {
    return window.geminiClient && typeof window.geminiClient === 'object';
});

// Test 4: Check product data
GeminiValidation.addTest('Product Data Available', () => {
    return window.geminiProductData && 
           window.geminiProductData.productId && 
           window.geminiProductData.variantId;
});

// Test 5: Test file input functionality
GeminiValidation.addTest('File Input Handler', async () => {
    return new Promise((resolve) => {
        const fileInput = document.getElementById('gemini-image-upload');
        if (!fileInput) {
            resolve(false);
            return;
        }
        
        // Check if change event listener is attached
        const hasListener = fileInput.onchange !== null || fileInput._listeners;
        
        // Create a test file
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        canvas.getContext('2d').fillRect(0, 0, 10, 10);
        
        canvas.toBlob((blob) => {
            const file = new File([blob], 'test.png', { type: 'image/png' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // Trigger change
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
            
            // Check if preview appears
            setTimeout(() => {
                const preview = document.querySelector('.gemini-widget__preview-image');
                const transformBtn = document.getElementById('gemini-transform-btn');
                resolve(preview !== null && !transformBtn.disabled);
            }, 500);
        });
    });
});

// Test 6: Check style options
GeminiValidation.addTest('Style Options Available', () => {
    const styleSelect = document.getElementById('gemini-style-select');
    if (!styleSelect) return false;
    
    const options = styleSelect.options;
    return options.length >= 5; // Should have at least 5 style options
});

// Test 7: Check API endpoint configuration
GeminiValidation.addTest('API Endpoint Configured', () => {
    if (!window.geminiClient) return false;
    
    const endpoint = window.geminiClient.apiEndpoint;
    return endpoint && endpoint.includes('gemini');
});

// Test 8: Check cart integration
GeminiValidation.addTest('Cart Integration Ready', () => {
    const addToCartBtn = document.getElementById('gemini-add-to-cart');
    return addToCartBtn !== null;
});

// Test 9: Check error handling
GeminiValidation.addTest('Error Display Elements', () => {
    const errorDiv = document.getElementById('gemini-error-message');
    const loadingDiv = document.getElementById('gemini-loading-state');
    const resultDiv = document.getElementById('gemini-result-section');
    
    return errorDiv && loadingDiv && resultDiv;
});

// Test 10: Check responsive design
GeminiValidation.addTest('Responsive Design', () => {
    const widget = document.querySelector('.gemini-widget');
    if (!widget) return false;
    
    const styles = window.getComputedStyle(widget);
    return styles.maxWidth || styles.width;
});

// Manual test helper
window.testGeminiTransform = async function() {
    console.log('\n%c🎨 Starting Manual Transform Test...', 'color: #667eea; font-weight: bold');
    
    // Create a colorful test image
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#4a90e2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Add some shapes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(150, 150, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Convert to file
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        
        // Set file on input
        const fileInput = document.getElementById('gemini-image-upload');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
        
        console.log('✅ Test image uploaded');
        console.log('📝 Now click "Transform My Image" to test the transformation');
        
        // Auto-click after 1 second
        setTimeout(() => {
            const transformBtn = document.getElementById('gemini-transform-btn');
            if (!transformBtn.disabled) {
                console.log('🔄 Auto-clicking transform button...');
                transformBtn.click();
            }
        }, 1000);
    });
};

// Check current page template
window.checkTemplate = function() {
    console.log('\n%c📄 Template Information:', 'color: #764ba2; font-weight: bold');
    console.log('Current Template:', window.template || 'Not set');
    console.log('Is Pet Template:', window.isPetTemplate || false);
    console.log('Page URL:', window.location.href);
    
    if (window.location.href.includes('pixar-gemini')) {
        console.log('✅ URL contains "pixar-gemini"');
    } else {
        console.log('⚠️ URL does not contain "pixar-gemini" - make sure you are on the correct product page');
    }
};

// Display helpful information
console.log('\n%c📚 Available Commands:', 'color: #667eea; font-weight: bold');
console.log('• GeminiValidation.runAll() - Run all validation tests');
console.log('• testGeminiTransform() - Test the transform functionality with a sample image');
console.log('• checkTemplate() - Check current page template');
console.log('• window.geminiClient - Access the Gemini API client directly');

// Auto-run validation after a short delay
setTimeout(() => {
    console.log('\n%c🔄 Auto-running validation tests...', 'color: #764ba2');
    GeminiValidation.runAll();
}, 1000);

// Return validation object for manual testing
window.GeminiValidation = GeminiValidation;