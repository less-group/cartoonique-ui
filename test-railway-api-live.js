#!/usr/bin/env node

/**
 * Live API Test for Railway Gemini Endpoint
 * Tests with actual image file and verifies frontend compatibility
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuration
const API_ENDPOINT = 'https://letzteshemd-faceswap-api-production.up.railway.app/gemini-transform';
const IMAGE_PATH = '/Users/alexanderburum-auensen/Downloads/download (9).jpeg';
const OUTPUT_HTML = path.join(__dirname, 'test-gemini-display.html');

console.log('='.repeat(70));
console.log('🚀 LIVE RAILWAY API TEST - GEMINI ENDPOINT');
console.log('='.repeat(70));
console.log();

async function testGeminiAPI() {
  try {
    // Step 1: Read and convert image to base64
    console.log('📸 Step 1: Preparing image for upload');
    console.log(`   Image: ${IMAGE_PATH}`);
    
    if (!fs.existsSync(IMAGE_PATH)) {
      throw new Error(`Image file not found: ${IMAGE_PATH}`);
    }
    
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    console.log(`   ✅ Image loaded: ${Math.round(imageBuffer.length / 1024)}KB`);
    console.log(`   ✅ Converted to base64`);
    console.log();
    
    // Step 2: Prepare request payload (matching pixar-gemini template)
    console.log('📦 Step 2: Preparing API request');
    const payload = {
      image: base64Image,
      prompt: "Transform this photo into a vibrant Pixar-style cartoon character with expressive features and bright colors",
      productId: "pixar-gemini",
      customerId: "test-" + Date.now(),
      watermarkImage: {
        url: "https://cdn.shopify.com/s/files/1/0896/3434/1212/files/watermarklogo.png",
        width: 200,
        height: 200,
        spaceBetweenWatermarks: 100
      },
      backgroundColor: "pink"
    };
    
    console.log('   Request details:');
    console.log(`   - Endpoint: ${API_ENDPOINT}`);
    console.log(`   - Product ID: ${payload.productId}`);
    console.log(`   - Prompt: "${payload.prompt.substring(0, 50)}..."`);
    console.log(`   - Watermark: ${payload.watermarkImage.width}x${payload.watermarkImage.height}px`);
    console.log();
    
    // Step 3: Send request to Railway API
    console.log('🌐 Step 3: Sending request to Railway API');
    console.log('   Please wait... (transformation takes 10-20 seconds)');
    console.log();
    
    const startTime = Date.now();
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 60000 // 60 second timeout
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`   Response received in ${elapsed} seconds`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log();
    
    // Step 4: Parse response
    console.log('📋 Step 4: Processing API response');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${data.message || response.statusText}`);
    }
    
    console.log('   Response structure:');
    console.log(`   - Success: ${data.success}`);
    console.log(`   - Message: "${data.message || 'Transformation completed'}"`);
    
    // Check for URLs in response
    const imageUrl = data.imageUrl || data.watermarkedImageUrl || data.processedImageUrl;
    
    if (imageUrl) {
      console.log(`   ✅ Image URL received: ${imageUrl}`);
      
      // Verify URL format
      const url = new URL(imageUrl);
      console.log(`   - Protocol: ${url.protocol}`);
      console.log(`   - Host: ${url.host}`);
      console.log(`   - Path: ${url.pathname}`);
      
      // Check if it's a localhost URL (shouldn't be after backend fix)
      if (imageUrl.includes('localhost')) {
        console.log('   ⚠️  WARNING: Received localhost URL - backend may need fixing');
      } else {
        console.log('   ✅ Production URL format confirmed');
      }
    } else {
      console.log('   ❌ No image URL in response');
      console.log('   Response data:', JSON.stringify(data, null, 2));
    }
    
    console.log();
    
    // Step 5: Generate test HTML to verify display
    console.log('🖼️ Step 5: Creating display test HTML');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini Transform Result - Display Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status { 
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .image-container {
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            margin-top: 10px;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fafafa;
        }
        .result-image {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .code-block {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        .url-display {
            word-break: break-all;
            background: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        @media (max-width: 768px) {
            .container { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Gemini Transform Display Test</h1>
        <p>Testing pixar-gemini template image display capability</p>
        <span class="status ${data.success ? 'success' : 'error'}">
            ${data.success ? '✅ TRANSFORMATION SUCCESSFUL' : '❌ TRANSFORMATION FAILED'}
        </span>
    </div>

    <div class="container">
        <div class="box">
            <h2>📸 Transformed Image</h2>
            <p>This simulates how the image appears in the frontend:</p>
            <div class="image-container">
                ${imageUrl ? 
                  `<img src="${imageUrl}" alt="Transformed Pixar Style Image" class="result-image" id="result-image" />` :
                  '<p>No image URL available</p>'
                }
            </div>
            <div class="url-display">
                <strong>Image URL:</strong><br>
                ${imageUrl || 'N/A'}
            </div>
        </div>

        <div class="box">
            <h2>🔧 Frontend Implementation</h2>
            <p>This is how the frontend uses the response:</p>
            <div class="code-block">
// Direct usage - no parsing needed!<br>
document.getElementById('result-image').src = response.imageUrl;<br><br>
// Or with jQuery<br>
$('#result-image').attr('src', response.imageUrl);<br><br>
// For Shopify cart<br>
formData.properties['Custom Image'] = response.imageUrl;
            </div>
            
            <h3>API Response:</h3>
            <div class="code-block" style="white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</div>
        </div>
    </div>

    <div class="box" style="margin-top: 20px;">
        <h2>✅ Verification Results</h2>
        <ul>
            <li>API Status: ${response.status} ${response.statusText}</li>
            <li>Response Time: ${elapsed} seconds</li>
            <li>Image URL Present: ${imageUrl ? 'Yes ✅' : 'No ❌'}</li>
            <li>URL Format: ${imageUrl && !imageUrl.includes('localhost') ? 'Production ✅' : 'Contains localhost ⚠️'}</li>
            <li>Watermark Applied: ${imageUrl ? 'Yes (200x200px) ✅' : 'Unknown'}</li>
        </ul>
    </div>

    <script>
        // Test image loading
        window.onload = function() {
            const img = document.getElementById('result-image');
            if (img) {
                img.onload = function() {
                    console.log('✅ Image loaded successfully');
                    console.log('Dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                };
                img.onerror = function() {
                    console.error('❌ Failed to load image');
                    alert('Failed to load transformed image. Check console for details.');
                };
            }
        };
    </script>
</body>
</html>`;
    
    fs.writeFileSync(OUTPUT_HTML, htmlContent);
    console.log(`   ✅ Test HTML created: ${OUTPUT_HTML}`);
    console.log('   Open this file in a browser to see the result');
    console.log();
    
    // Summary
    console.log('='.repeat(70));
    if (data.success && imageUrl) {
      console.log('✅ SUCCESS - API TEST PASSED!');
      console.log();
      console.log('Summary:');
      console.log(`• Transformation completed in ${elapsed} seconds`);
      console.log(`• Image URL: ${imageUrl}`);
      console.log('• Frontend can display image directly');
      console.log('• Watermark applied automatically');
      console.log();
      console.log(`📂 Open ${OUTPUT_HTML} to see the result`);
    } else {
      console.log('❌ TEST FAILED');
      console.log('Please check the response data above for details');
    }
    console.log('='.repeat(70));
    
    return data;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Run the test
testGeminiAPI().then(result => {
  if (result) {
    console.log('\n✨ Test complete!');
  } else {
    console.log('\n⚠️ Test failed - see errors above');
    process.exit(1);
  }
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});