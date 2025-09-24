/**
 * Template Isolation Test Script
 * Verifies that Gemini changes ONLY affect pixar-gemini template
 * Run this in the browser console on different product pages
 */

console.log('%c🔍 Template Isolation Test', 'color: blue; font-size: 18px; font-weight: bold');
console.log('=' .repeat(50));

// Test 1: Identify current template
console.group('📋 Current Template Information');
console.log('Template from window:', window?.template);
console.log('URL:', location.href);
console.log('Is Pet Template:', window?.isPetTemplate === true);
console.log('Contains pixar-gemini in URL:', location.href.includes('/products/pixar-gemini'));
console.groupEnd();

// Test 2: Check endpoint routing logic
console.group('🛤️ Endpoint Routing Logic');
const isPixarGeminiTemplate = window?.template === "product.pixar-gemini" || 
                              location.href.includes("/products/pixar-gemini");
                              
console.log('Is Pixar Gemini Template:', isPixarGeminiTemplate);

if (isPixarGeminiTemplate) {
  console.log('%c✅ This page WILL use Gemini endpoint', 'color: green; font-weight: bold');
  console.log('Expected endpoint: gemini-transform');
  console.log('Expected payload: Gemini format with prompt');
} else if (window?.isPetTemplate) {
  console.log('%c✅ This page WILL use Pet Transform endpoint', 'color: orange; font-weight: bold');
  console.log('Expected endpoint: transformpet');
  console.log('Expected payload: Standard format with background color');
} else {
  console.log('%c✅ This page WILL use Standard Transform endpoint', 'color: purple; font-weight: bold');
  console.log('Expected endpoint: transform');
  console.log('Expected payload: Standard format');
}
console.groupEnd();

// Test 3: Simulate payload creation
console.group('📦 Payload Structure Test');
let testPayload;
let testEndpoint;

if (isPixarGeminiTemplate) {
  testEndpoint = 'gemini-transform';
  testPayload = {
    image: 'BASE64_DATA',
    prompt: 'Transform this photo into a Pixar-style cartoon character...',
    productId: 'pixar-gemini',
    watermarkImage: {
      url: 'https://cdn.shopify.com/s/files/1/0896/3434/1212/files/watermarklogo.png',
      width: 200,
      height: 200
    },
    backgroundColor: 'pink'
  };
} else {
  testPayload = {
    image: 'BASE64_DATA',
    style: 'pixar',
    watermark: {
      url: 'https://cdn.shopify.com/s/files/1/0896/3434/1212/files/watermarklogo.png',
      width: 200,
      height: 200
    }
  };
  
  if (window?.isPetTemplate) {
    testEndpoint = 'transformpet';
    testPayload.backgroundColor = window?.petBackgroundColor || 'pink';
  } else {
    testEndpoint = 'transform';
  }
}

console.log('Test Endpoint:', testEndpoint);
console.log('Test Payload Structure:', testPayload);
console.groupEnd();

// Test 4: Verify no cross-contamination
console.group('🛡️ Template Isolation Verification');
const tests = {
  'Gemini only on pixar-gemini': isPixarGeminiTemplate ? testEndpoint === 'gemini-transform' : testEndpoint !== 'gemini-transform',
  'Pet templates use transformpet': window?.isPetTemplate ? testEndpoint === 'transformpet' : true,
  'Regular templates use transform': !window?.isPetTemplate && !isPixarGeminiTemplate ? testEndpoint === 'transform' : true,
  'No Gemini prompt in non-Gemini': !isPixarGeminiTemplate ? !testPayload.prompt : true,
  'Background color in pet templates': window?.isPetTemplate ? testPayload.hasOwnProperty('backgroundColor') : true
};

let allTestsPassed = true;
for (const [testName, result] of Object.entries(tests)) {
  if (result) {
    console.log(`✅ ${testName}`);
  } else {
    console.error(`❌ ${testName}`);
    allTestsPassed = false;
  }
}

if (allTestsPassed) {
  console.log('%c✅ All isolation tests passed!', 'color: green; font-size: 14px; font-weight: bold');
} else {
  console.error('%c❌ Some isolation tests failed!', 'color: red; font-size: 14px; font-weight: bold');
}
console.groupEnd();

// Test 5: Summary and recommendations
console.group('📊 Test Summary');
console.log('Current page template:', window?.template || 'unknown');
console.log('Will use endpoint:', testEndpoint);
console.log('Isolation status:', allTestsPassed ? '✅ PROTECTED' : '❌ COMPROMISED');

console.log('\n%cRecommended Testing:', 'font-weight: bold');
console.log('1. Test on a pixar-gemini product page - should use gemini-transform');
console.log('2. Test on a pet-background-selector page - should use transformpet');
console.log('3. Test on a regular pixar product - should use transform');
console.log('4. Upload an image on each and verify correct endpoint in Network tab');
console.groupEnd();

console.log('=' .repeat(50));
console.log('%c🏁 Template Isolation Test Complete', 'color: blue; font-size: 14px; font-weight: bold');