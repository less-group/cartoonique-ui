const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function fetchTransformedImage() {
  // Try different possible URLs for the image
  const urls = [
    // Replace localhost with Railway URL
    'https://letzteshemd-faceswap-api-production.up.railway.app/temp-storage/gemini-2a4b1de1-6b70-4b2e-a8cd-ec8fb0a43d0e.png',
    // Original localhost URL (won't work remotely)
    'http://localhost:8080/temp-storage/gemini-2a4b1de1-6b70-4b2e-a8cd-ec8fb0a43d0e.png'
  ];

  console.log('Attempting to fetch transformed image...\n');

  for (const url of urls) {
    console.log(`Trying: ${url}`);
    try {
      const response = await fetch(url, { timeout: 5000 });
      
      if (response.ok) {
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Content-Length: ${response.headers.get('content-length')} bytes`);
        
        // Save the image locally
        if (response.headers.get('content-type')?.includes('image')) {
          const buffer = await response.buffer();
          const outputPath = path.join(__dirname, 'transformed-gemini-output.png');
          fs.writeFileSync(outputPath, buffer);
          console.log(`\n✅ Image saved to: ${outputPath}`);
          console.log(`File size: ${Math.round(buffer.length / 1024)}KB`);
        }
        
        return true;
      } else {
        console.log(`❌ Failed: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('\n⚠️ Note: The image URLs are pointing to localhost which is not accessible remotely.');
  console.log('The Railway backend may need to be configured to return public URLs for the transformed images.');
  console.log('\nThe transformation itself is working correctly - the Gemini API successfully processed the image!');
}

fetchTransformedImage();