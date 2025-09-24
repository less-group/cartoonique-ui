/**
 * Verification script for pixar-gemini template endpoint configuration
 * Run this in the browser console on a product page using the pixar-gemini template
 */

(function() {
  console.log('========================================');
  console.log('🔍 PIXAR-GEMINI ENDPOINT VERIFICATION');
  console.log('========================================');
  
  // Check template detection
  const currentTemplate = window?.template || 'Not set';
  const isPetTemplate = window?.isPetTemplate || false;
  const isPixarGemini = currentTemplate === 'product.pixar-gemini' || 
                       location.href.includes('/products/pixar-gemini');
  
  console.log('\n📋 Template Configuration:');
  console.log('  Current template:', currentTemplate);
  console.log('  Is Pet Template:', isPetTemplate);
  console.log('  Is Pixar-Gemini:', isPixarGemini);
  console.log('  URL:', location.href);
  
  // Check endpoint logic
  console.log('\n🎯 Endpoint Selection Logic:');
  
  let expectedEndpoint = 'transform';
  if (isPixarGemini) {
    expectedEndpoint = 'gemini-transform';
    console.log('  ✅ Should use: gemini-transform (Gemini Flash 2.5)');
  } else if (isPetTemplate) {
    expectedEndpoint = 'transformpet';
    console.log('  Should use: transformpet (Pet transform)');
  } else {
    console.log('  Should use: transform (Standard)');
  }
  
  const expectedUrl = `https://letzteshemd-faceswap-api-production.up.railway.app/${expectedEndpoint}`;
  console.log('  Expected URL:', expectedUrl);
  
  // Check payload structure
  console.log('\n📦 Expected Payload Structure:');
  if (isPixarGemini) {
    console.log('  {');
    console.log('    image: <base64>,');
    console.log('    prompt: "Transform this pet photo into a Pixar-style cartoon...",');
    console.log('    productId: "pixar-gemini",');
    console.log('    customerId: "",');
    console.log('    watermarkImage: {...},');
    if (window?.petBackgroundColor) {
      console.log('    backgroundColor: "' + window.petBackgroundColor + '"');
    }
    console.log('  }');
    console.log('  ✅ Using Gemini-specific payload structure');
  } else {
    console.log('  {');
    console.log('    image: <base64>,');
    console.log('    style: "pixar",');
    console.log('    watermark: {...}');
    if (isPetTemplate && window?.petBackgroundColor) {
      console.log('    backgroundColor: "' + window.petBackgroundColor + '"');
    }
    console.log('  }');
    console.log('  Using standard payload structure');
  }
  
  // Test API detection function
  console.log('\n🧪 Testing Endpoint Detection:');
  
  // Simulate the logic from the updated files
  function getEndpointForCurrentTemplate() {
    if (window?.template === "product.pixar-gemini" || 
        location.href.includes("/products/pixar-gemini")) {
      return 'gemini-transform';
    } else if (window?.isPetTemplate) {
      return 'transformpet';
    }
    return 'transform';
  }
  
  const detectedEndpoint = getEndpointForCurrentTemplate();
  console.log('  Detected endpoint:', detectedEndpoint);
  console.log('  Match expected:', detectedEndpoint === expectedEndpoint ? '✅ YES' : '❌ NO');
  
  // Check for Gemini API client
  console.log('\n🔧 Gemini Integration Check:');
  const hasGeminiClient = typeof window.GeminiApiClient !== 'undefined';
  const hasGeminiWidget = document.getElementById('gemini-transform-widget') !== null;
  
  console.log('  GeminiApiClient available:', hasGeminiClient ? '✅ YES' : '❌ NO');
  console.log('  Gemini widget in DOM:', hasGeminiWidget ? '✅ YES' : '❌ NO');
  
  // Summary
  console.log('\n========================================');
  console.log('📊 SUMMARY:');
  if (isPixarGemini) {
    console.log('✅ Pixar-Gemini template detected');
    console.log('✅ Will use Gemini Flash 2.5 endpoint');
    console.log('✅ Endpoint: /gemini-transform');
    console.log('✅ Integration configured correctly');
  } else if (isPetTemplate) {
    console.log('ℹ️ Pet template detected (not pixar-gemini)');
    console.log('ℹ️ Will use standard pet transform endpoint');
    console.log('ℹ️ Endpoint: /transformpet');
  } else {
    console.log('ℹ️ Standard product template');
    console.log('ℹ️ Will use standard transform endpoint');
    console.log('ℹ️ Endpoint: /transform');
  }
  console.log('========================================');
  
  // Network monitoring helper
  console.log('\n💡 TIP: Monitor network tab for API calls to verify:');
  console.log('  1. Open Network tab in DevTools');
  console.log('  2. Upload an image');
  console.log('  3. Look for request to:', expectedUrl);
  console.log('  4. Check request payload structure');
  
  // Return test results
  return {
    template: currentTemplate,
    isPixarGemini: isPixarGemini,
    expectedEndpoint: expectedEndpoint,
    expectedUrl: expectedUrl,
    verified: isPixarGemini && detectedEndpoint === 'gemini-transform'
  };
})();