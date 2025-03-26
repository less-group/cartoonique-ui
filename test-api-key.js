#!/usr/bin/env node

/**
 * RunPod API Key Test Script
 * 
 * This script tests if your RunPod API key is valid by making a simple request
 * to the API endpoint. It helps verify that your configuration is correct
 * before deploying to production.
 * 
 * Usage:
 *   node test-api-key.js YOUR_API_KEY
 *   or
 *   node test-api-key.js --key=YOUR_API_KEY --endpoint=YOUR_ENDPOINT
 */

const https = require('https');
const url = require('url');

// Default endpoint - update this if your endpoint is different
const DEFAULT_ENDPOINT = 'https://api.runpod.ai/v2/zaqgn8ju2ym55r';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    apiKey: null,
    endpoint: DEFAULT_ENDPOINT
  };

  // Parse named arguments (--key=value format)
  args.forEach(arg => {
    if (arg.startsWith('--key=')) {
      result.apiKey = arg.substring(6);
    } else if (arg.startsWith('--endpoint=')) {
      result.endpoint = arg.substring(11);
    } else if (!arg.startsWith('--') && !result.apiKey) {
      // First positional argument is the API key
      result.apiKey = arg;
    }
  });

  return result;
}

// Parse arguments
const { apiKey, endpoint } = parseArgs();

// Check for API key
if (!apiKey) {
  console.error('Error: API key is required');
  console.error('Usage: node test-api-key.js YOUR_API_KEY');
  console.error('   or: node test-api-key.js --key=YOUR_API_KEY --endpoint=YOUR_ENDPOINT');
  process.exit(1);
}

console.log(`Testing RunPod API key at endpoint: ${endpoint}`);
console.log('API Key: ' + apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
console.log('');

// Parse the endpoint URL
const parsedUrl = url.parse(endpoint + '/status/test-job-id');

// Set up the request options
const options = {
  hostname: parsedUrl.hostname,
  path: parsedUrl.path,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

// Make the request
const req = https.request(options, (res) => {
  let data = '';
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log(`Response Status Code: ${res.statusCode}`);
    
    try {
      const parsedData = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(parsedData, null, 2));
      console.log('');
      
      if (res.statusCode === 200) {
        console.log('✅ API key is valid!');
        console.log('✨ This confirms that your API key works with the RunPod API.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Update the API key in assets/face-swap-config.js');
        console.log('2. Update the API key in assets/face-swap-config.test.js');
        console.log('3. Deploy to your Shopify theme or test locally with mock mode');
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        console.log('❌ API key is invalid or unauthorized');
        console.log('🔑 Please check your API key and try again.');
      } else if (res.statusCode === 404) {
        console.log('⚠️ Endpoint exists but job ID not found (expected for test)');
        console.log('✅ API key appears to be valid!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Update the API key in assets/face-swap-config.js');
        console.log('2. Update the API key in assets/face-swap-config.test.js');
        console.log('3. Deploy to your Shopify theme or test locally with mock mode');
      } else {
        console.log('⚠️ Unexpected status code');
        console.log('This might indicate an issue with the API endpoint.');
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('Error making request:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.error(`Could not resolve hostname: ${parsedUrl.hostname}`);
    console.error('Please check your internet connection and the endpoint URL');
  } else if (error.code === 'ECONNREFUSED') {
    console.error(`Connection refused to: ${parsedUrl.hostname}`);
    console.error('Please check if the endpoint is correct and accessible');
  }
  
  process.exit(1);
});

// End the request
req.end();

console.log('Request sent, waiting for response...'); 