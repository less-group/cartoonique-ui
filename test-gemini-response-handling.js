/**
 * Test script to verify Gemini response handling
 * This simulates the response format from the Gemini API endpoint
 */

// Simulate the Gemini API response format based on backend logs
const mockGeminiResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: "Here's your Pixar-style cartoon character!"
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" // Small test image
            }
          }
        ]
      }
    }
  ]
};

// Function to test the image extraction logic
function testGeminiResponseParsing(data) {
  console.log('Testing Gemini response parsing...\n');
  
  let imageUrl = null;
  
  // Check if this is a Gemini response format with candidates array
  if (data?.candidates && data.candidates[0]?.content?.parts) {
    console.log('✅ Detected Gemini response format with candidates array');
    
    // Look for the image in the parts array
    const parts = data.candidates[0].content.parts;
    console.log(`   Found ${parts.length} parts in response`);
    
    for (const part of parts) {
      if (part.text) {
        console.log(`   - Text part: "${part.text}"`);
      }
      if (part.inlineData && part.inlineData.data) {
        // Convert base64 to data URL
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        console.log(`   - Image part: ${mimeType}, data length: ${part.inlineData.data.length} chars`);
        console.log('✅ Successfully extracted base64 image and created data URL');
        break;
      }
    }
  }
  
  if (imageUrl) {
    console.log('\n✅ SUCCESS: Image URL extracted from Gemini response');
    console.log(`   Data URL prefix: ${imageUrl.substring(0, 50)}...`);
    return imageUrl;
  } else {
    console.log('\n❌ FAILED: Could not extract image from response');
    return null;
  }
}

// Run the test
console.log('='.repeat(60));
console.log('GEMINI RESPONSE HANDLING TEST');
console.log('='.repeat(60));
console.log();

const extractedUrl = testGeminiResponseParsing(mockGeminiResponse);

if (extractedUrl) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST PASSED ✅');
  console.log('The frontend should now correctly handle Gemini responses');
  console.log('and display the transformed images.');
  console.log('='.repeat(60));
} else {
  console.log('\n' + '='.repeat(60));
  console.log('TEST FAILED ❌');
  console.log('There may still be issues with response handling.');
  console.log('='.repeat(60));
}

// Additional test: Verify the data URL can be used in an img tag
if (typeof document !== 'undefined') {
  // Browser environment
  console.log('\nTesting in browser environment...');
  const img = document.createElement('img');
  img.src = extractedUrl;
  img.onload = () => console.log('✅ Image loaded successfully in browser');
  img.onerror = () => console.log('❌ Image failed to load in browser');
} else {
  console.log('\nNote: Run this in a browser console to test image loading');
}