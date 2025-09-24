#!/usr/bin/env node

/**
 * Railway Backend Production Test
 * This script sends real requests to the deployed Railway API
 * Run with: node test-railway-backend.js
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Configuration
const CONFIG = {
    // Production Railway endpoint
    apiUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app/gemini-transform',
    
    // Test image path
    imagePath: '/Users/alexanderburum-auensen/Downloads/download (9).jpeg',
    
    // Transformation styles to test
    styles: [
        'Transform this into a vibrant Pixar-style 3D cartoon character with big expressive eyes',
        'Transform this into a Disney animation style with magical features',
        'Transform this into a Studio Ghibli anime style with soft features'
    ],
    
    // Default watermark config
    watermark: {
        url: 'https://cdn.shopify.com/s/files/1/0857/8378/5643/files/watermark.png',
        width: 410,
        height: 410,
        spaceBetweenWatermarks: 100
    }
};

// Main test function
async function testRailwayAPI() {
    console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════╗
║     RAILWAY PRODUCTION API TEST                    ║
║     Testing Real Backend Deployment                ║
╚════════════════════════════════════════════════════╝
${colors.reset}`);
    
    console.log(`${colors.yellow}API Endpoint:${colors.reset} ${CONFIG.apiUrl}`);
    console.log(`${colors.yellow}Image Path:${colors.reset} ${CONFIG.imagePath}\n`);
    
    try {
        // Step 1: Load and encode image
        console.log(`${colors.cyan}[Step 1]${colors.reset} Loading test image...`);
        const imageBase64 = await loadAndEncodeImage(CONFIG.imagePath);
        console.log(`${colors.green}✓${colors.reset} Image loaded: ${(imageBase64.length / 1024).toFixed(2)} KB encoded\n`);
        
        // Step 2: Test API connection
        console.log(`${colors.cyan}[Step 2]${colors.reset} Testing API connection...`);
        const isOnline = await testConnection();
        if (!isOnline) {
            console.log(`${colors.red}✗${colors.reset} API appears to be offline or unreachable\n`);
            return;
        }
        console.log(`${colors.green}✓${colors.reset} API is online and reachable\n`);
        
        // Step 3: Send transformation request
        console.log(`${colors.cyan}[Step 3]${colors.reset} Sending transformation request...`);
        console.log(`${colors.yellow}Style:${colors.reset} ${CONFIG.styles[0].substring(0, 50)}...`);
        
        const requestData = {
            image: `data:image/jpeg;base64,${imageBase64}`,
            prompt: CONFIG.styles[0],
            productId: 'test-product-pixar-gemini',
            customerId: 'test-customer-123',
            orderId: 'test-order-456',
            watermarkImage: CONFIG.watermark
        };
        
        console.log(`${colors.yellow}Payload size:${colors.reset} ${JSON.stringify(requestData).length} bytes`);
        
        const startTime = Date.now();
        const response = await sendRequest(requestData);
        const duration = Date.now() - startTime;
        
        console.log(`${colors.yellow}Response time:${colors.reset} ${duration}ms\n`);
        
        // Step 4: Process response
        console.log(`${colors.cyan}[Step 4]${colors.reset} Processing response...`);
        
        if (response.success) {
            console.log(`${colors.green}✓ TRANSFORMATION SUCCESSFUL!${colors.reset}`);
            console.log(`${colors.green}Message:${colors.reset} ${response.message}`);
            
            if (response.imageUrl) {
                console.log(`${colors.green}Image URL:${colors.reset} ${response.imageUrl}`);
            }
            if (response.watermarkedImageUrl) {
                console.log(`${colors.green}Watermarked URL:${colors.reset} ${response.watermarkedImageUrl}`);
            }
            if (response.processedImageUrl) {
                console.log(`${colors.green}Processed URL:${colors.reset} ${response.processedImageUrl}`);
            }
            
            // Display metadata if available
            if (response.metadata) {
                console.log(`\n${colors.cyan}Metadata:${colors.reset}`);
                Object.entries(response.metadata).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            }
            
            // Test if image is downloadable
            if (response.imageUrl || response.watermarkedImageUrl) {
                const imageUrl = response.imageUrl || response.watermarkedImageUrl;
                console.log(`\n${colors.cyan}[Step 5]${colors.reset} Testing image accessibility...`);
                const isAccessible = await testImageUrl(imageUrl);
                if (isAccessible) {
                    console.log(`${colors.green}✓${colors.reset} Image is accessible and can be downloaded`);
                } else {
                    console.log(`${colors.yellow}⚠${colors.reset} Image URL returned but may not be accessible`);
                }
            }
            
        } else {
            console.log(`${colors.red}✗ TRANSFORMATION FAILED${colors.reset}`);
            console.log(`${colors.red}Error:${colors.reset} ${response.message || response.error || 'Unknown error'}`);
            
            if (response.details) {
                console.log(`${colors.red}Details:${colors.reset} ${JSON.stringify(response.details, null, 2)}`);
            }
        }
        
        // Summary
        console.log(`\n${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════╗
║     TEST COMPLETE                                  ║
╚════════════════════════════════════════════════════╝
${colors.reset}`);
        
        console.log(`${colors.yellow}Summary:${colors.reset}`);
        console.log(`  • API Status: ${isOnline ? '✅ Online' : '❌ Offline'}`);
        console.log(`  • Request Status: ${response.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`  • Processing Time: ${duration}ms`);
        console.log(`  • Timestamp: ${new Date().toISOString()}\n`);
        
    } catch (error) {
        console.error(`${colors.red}Fatal error:${colors.reset} ${error.message}`);
        console.error(error.stack);
    }
}

// Load and encode image as base64
async function loadAndEncodeImage(imagePath) {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        // If file not found, create a test image
        console.log(`${colors.yellow}⚠ Could not load ${imagePath}, using generated test image${colors.reset}`);
        
        // Generate a simple test image (1x1 pixel PNG)
        const testPng = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x5A, 0x9C, 0x84,
            0x72, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        return testPng.toString('base64');
    }
}

// Test API connection
async function testConnection() {
    return new Promise((resolve) => {
        const url = new URL(CONFIG.apiUrl);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'OPTIONS',
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            resolve(res.statusCode < 500);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Send request to Railway API
async function sendRequest(data) {
    return new Promise((resolve, reject) => {
        const url = new URL(CONFIG.apiUrl);
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Accept': 'application/json',
                'User-Agent': 'Shopify-Gemini-Test/1.0'
            },
            timeout: 30000 // 30 second timeout
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (error) {
                    // If not JSON, return raw response
                    resolve({
                        success: false,
                        message: 'Invalid JSON response',
                        rawResponse: responseData,
                        statusCode: res.statusCode
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                message: error.message,
                error: error.code
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                message: 'Request timeout (30s)',
                error: 'TIMEOUT'
            });
        });
        
        req.write(postData);
        req.end();
    });
}

// Test if image URL is accessible
async function testImageUrl(imageUrl) {
    return new Promise((resolve) => {
        try {
            const url = new URL(imageUrl);
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'HEAD',
                timeout: 5000
            };
            
            const req = https.request(options, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        } catch (error) {
            resolve(false);
        }
    });
}

// Run test if executed directly
if (require.main === module) {
    testRailwayAPI();
}

module.exports = { testRailwayAPI, sendRequest };