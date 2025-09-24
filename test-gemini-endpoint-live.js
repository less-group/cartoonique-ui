/**
 * Live test for Gemini Flash 2.5 endpoint
 * This mimics the exact frontend user flow for pixar-gemini template
 */

const fs = require('fs').promises;
const fetch = require('node-fetch');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testGeminiEndpoint() {
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     GEMINI FLASH 2.5 ENDPOINT LIVE TEST               ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     Mimicking Exact Frontend User Flow                ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // Step 1: Read the image file
    const imagePath = '/Users/alexanderburum-auensen/Downloads/download (9).jpeg';
    console.log(`${colors.yellow}[1/5]${colors.reset} Reading image file...`);
    console.log(`${colors.dim}  Path: ${imagePath}${colors.reset}`);
    
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    console.log(`${colors.green}  ✓ Image loaded${colors.reset} (${Math.round(imageBuffer.length / 1024)}KB)\n`);

    // Step 2: Prepare the payload (exactly as frontend does for pixar-gemini)
    console.log(`${colors.yellow}[2/5]${colors.reset} Preparing Gemini payload...`);
    const payload = {
      image: base64Image,
      prompt: "Transform this pet photo into a Pixar-style cartoon character with vibrant colors and expressive features",
      productId: "pixar-gemini",
      customerId: "test-customer",
      watermarkImage: {
        url: "https://cdn.shopify.com/s/files/1/0896/3434/1212/files/watermarklogo.png",
        width: 200,
        height: 200,
        spaceBetweenWatermarks: 100
      },
      backgroundColor: "pink" // Default background color
    };
    
    console.log(`${colors.dim}  Payload structure:${colors.reset}`);
    console.log(`${colors.dim}    - Image: ${base64Image.substring(0, 50)}...${colors.reset}`);
    console.log(`${colors.dim}    - Prompt: "Transform this pet photo..."${colors.reset}`);
    console.log(`${colors.dim}    - Product ID: pixar-gemini${colors.reset}`);
    console.log(`${colors.dim}    - Background: pink${colors.reset}`);
    console.log(`${colors.dim}    - Watermark: configured${colors.reset}\n`);

    // Step 3: Send to Railway Gemini endpoint
    const endpoint = 'https://letzteshemd-faceswap-api-production.up.railway.app/gemini-transform';
    console.log(`${colors.yellow}[3/5]${colors.reset} Sending to Railway Gemini endpoint...`);
    console.log(`${colors.dim}  URL: ${endpoint}${colors.reset}`);
    console.log(`${colors.dim}  Method: POST${colors.reset}`);
    console.log(`${colors.dim}  Content-Type: application/json${colors.reset}\n`);

    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Pixar-Gemini-Test/1.0'
      },
      body: JSON.stringify(payload),
      timeout: 60000 // 60 second timeout
    });

    const responseTime = Date.now() - startTime;
    
    // Step 4: Process response
    console.log(`${colors.yellow}[4/5]${colors.reset} Processing response...`);
    console.log(`${colors.dim}  Status: ${response.status} ${response.statusText}${colors.reset}`);
    console.log(`${colors.dim}  Response time: ${responseTime}ms${colors.reset}\n`);

    const responseData = await response.json();

    // Step 5: Display results
    console.log(`${colors.yellow}[5/5]${colors.reset} Response from Gemini endpoint:\n`);
    
    if (response.ok && responseData) {
      console.log(`${colors.green}${colors.bright}✅ SUCCESS${colors.reset}\n`);
      
      // Display response data
      console.log(`${colors.cyan}Response Data:${colors.reset}`);
      console.log(JSON.stringify(responseData, null, 2));
      
      // Extract key information
      if (responseData.imageUrl || responseData.watermarkedImageUrl || responseData.processedImageUrl) {
        console.log(`\n${colors.bright}Generated Image URLs:${colors.reset}`);
        if (responseData.imageUrl) {
          console.log(`  ${colors.green}Main:${colors.reset} ${responseData.imageUrl}`);
        }
        if (responseData.watermarkedImageUrl) {
          console.log(`  ${colors.green}Watermarked:${colors.reset} ${responseData.watermarkedImageUrl}`);
        }
        if (responseData.processedImageUrl) {
          console.log(`  ${colors.green}Processed:${colors.reset} ${responseData.processedImageUrl}`);
        }
      }
      
      if (responseData.jobId) {
        console.log(`\n${colors.bright}Job Information:${colors.reset}`);
        console.log(`  ${colors.cyan}Job ID:${colors.reset} ${responseData.jobId}`);
        console.log(`  ${colors.cyan}Status:${colors.reset} ${responseData.status || 'PROCESSING'}`);
      }
      
      if (responseData.message) {
        console.log(`\n${colors.bright}Message:${colors.reset} ${responseData.message}`);
      }
      
    } else {
      console.log(`${colors.red}${colors.bright}❌ ERROR${colors.reset}\n`);
      
      if (responseData.error) {
        console.log(`${colors.red}Error:${colors.reset} ${responseData.error}`);
      }
      if (responseData.message) {
        console.log(`${colors.red}Message:${colors.reset} ${responseData.message}`);
      }
      
      console.log(`\n${colors.dim}Full error response:${colors.reset}`);
      console.log(JSON.stringify(responseData, null, 2));
    }

    // Summary
    console.log(`\n${colors.bright}${colors.cyan}════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}TEST COMPLETE${colors.reset}`);
    console.log(`${colors.cyan}════════════════════════════════════════════════════════${colors.reset}`);
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  • Endpoint: ${endpoint}`);
    console.log(`  • Response Status: ${response.status}`);
    console.log(`  • Response Time: ${responseTime}ms`);
    console.log(`  • Payload Type: Gemini Flash 2.5 format`);
    console.log(`  • Template Simulated: product.pixar-gemini`);
    
    if (responseData.jobId) {
      console.log(`\n${colors.yellow}Note:${colors.reset} If the job is still processing, you may need to poll:`);
      console.log(`  ${colors.dim}GET ${endpoint.replace('/gemini-transform', `/status/${responseData.jobId}`)}${colors.reset}`);
    }

  } catch (error) {
    console.log(`\n${colors.red}${colors.bright}❌ TEST FAILED${colors.reset}`);
    console.log(`${colors.red}Error:${colors.reset} ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log(`${colors.yellow}The Railway API endpoint could not be reached.${colors.reset}`);
      console.log(`${colors.dim}Check your internet connection and that the Railway service is running.${colors.reset}`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`${colors.yellow}Request timed out after 60 seconds.${colors.reset}`);
      console.log(`${colors.dim}The image processing might be taking longer than expected.${colors.reset}`);
    } else if (error.code === 'ENOENT') {
      console.log(`${colors.yellow}Image file not found at the specified path.${colors.reset}`);
      console.log(`${colors.dim}Please check the file path and try again.${colors.reset}`);
    }
    
    console.log(`\n${colors.dim}Stack trace:${colors.reset}`);
    console.log(error.stack);
  }
}

// Check if node-fetch is installed
try {
  require('node-fetch');
} catch (e) {
  console.log(`${colors.yellow}Installing node-fetch...${colors.reset}`);
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
}

// Run the test
console.log(`${colors.cyan}Starting Gemini endpoint test...${colors.reset}\n`);
testGeminiEndpoint();