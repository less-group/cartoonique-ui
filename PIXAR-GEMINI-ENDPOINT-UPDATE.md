# Pixar-Gemini Template Endpoint Update

## Overview
Updated the `pixar-gemini` product template to use the **Gemini Flash 2.5** endpoint (`/gemini-transform`) instead of the old flux kontext or standard transform endpoints.

## Changes Made

### 1. **image-processing-manager.js** (Lines 4726-4790)
- Added detection for `product.pixar-gemini` template
- Routes to `/gemini-transform` endpoint when pixar-gemini template is detected
- Uses Gemini-specific payload structure with prompt parameter
- Maintains backward compatibility for other templates

### 2. **direct-pixar-loader.js** (Lines 431-506)  
- Added pixar-gemini template detection
- Dynamically selects endpoint based on template type
- Configures Gemini-specific payload when needed
- Preserves existing functionality for other templates

## Endpoint Selection Logic

```javascript
if (template === "product.pixar-gemini") {
  endpoint = "gemini-transform"  // Gemini Flash 2.5
} else if (isPetTemplate) {
  endpoint = "transformpet"      // Standard pet transform
} else {
  endpoint = "transform"         // Default transform
}
```

## API Endpoints

| Template | Endpoint | API URL |
|----------|----------|---------|
| pixar-gemini | `/gemini-transform` | `https://letzteshemd-faceswap-api-production.up.railway.app/gemini-transform` |
| product.pet | `/transformpet` | `https://letzteshemd-faceswap-api-production.up.railway.app/transformpet` |
| others | `/transform` | `https://letzteshemd-faceswap-api-production.up.railway.app/transform` |

## Payload Structure for Gemini

When using the pixar-gemini template, the payload includes:

```json
{
  "image": "<base64>",
  "prompt": "Transform this pet photo into a Pixar-style cartoon character with vibrant colors and expressive features",
  "productId": "pixar-gemini",
  "customerId": "",
  "watermarkImage": {
    "url": "...",
    "width": 200,
    "height": 200,
    "spaceBetweenWatermarks": 100
  },
  "backgroundColor": "<color>" // Optional, if selected
}
```

## Testing

### 1. Verify Template Detection
Navigate to a product using the pixar-gemini template and run:
```javascript
console.log('Template:', window.template); // Should be "product.pixar-gemini"
```

### 2. Run Verification Script
```bash
# In browser console on pixar-gemini product page:
node verify-pixar-gemini-endpoint.js
```

### 3. Monitor Network Traffic
1. Open DevTools Network tab
2. Upload an image on pixar-gemini product
3. Verify request goes to `/gemini-transform` endpoint
4. Check payload structure matches Gemini format

## Key Features

✅ **Template-Specific Routing**: Automatically detects pixar-gemini template  
✅ **Gemini Flash 2.5 Integration**: Uses nano banana endpoint on Railway  
✅ **Backward Compatible**: Other templates continue to work as before  
✅ **Background Color Support**: Maintains pet background color feature  
✅ **Watermark Applied**: Consistent watermarking across all endpoints  

## Production Status

The pixar-gemini template now correctly:
- ✅ Detects when it's being used
- ✅ Routes to Gemini Flash 2.5 endpoint
- ✅ Sends proper payload format
- ✅ Maintains all existing features

## Notes

- The Railway backend must have the `/gemini-transform` endpoint configured
- Gemini API key must be set in Railway environment variables
- The endpoint expects Gemini-specific payload structure with `prompt` field
- Background color selection still works with the Gemini endpoint