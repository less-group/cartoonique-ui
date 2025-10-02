# Complete Guide: Duplicating the Gemini-Pixar Product Template

## Overview
This guide provides step-by-step instructions for duplicating the "pixar-gemini" product template with full functionality, including the popup image transformation feature. The template uses advanced AI image transformation with a two-popup workflow system.

## Architecture Overview

### Key Components:
1. **Template File**: `product.pixar-gemini.json` - Main template configuration
2. **JavaScript Files**: Handle image processing, API communication, and UI interactions
3. **CSS Files**: Styling for upload components and popups
4. **Liquid Snippets**: Template integration and form handling
5. **API Integration**: Railway backend for image transformation

## Step-by-Step Duplication Process

### Step 1: Create New Product Template

1. **Duplicate the template file:**
```bash
# In templates/ directory
cp product.pixar-gemini.json product.YOUR-NEW-TEMPLATE.json
```

2. **Update template name in the file:**
   - Open `product.YOUR-NEW-TEMPLATE.json`
   - Keep all section configurations identical
   - This preserves the layout and structure

### Step 2: Copy All Required JavaScript Files

**Core Processing Files (Required):**
```
assets/image-processing-manager.js    # Main image processing controller
assets/unified-api-client.js         # API communication handler
assets/pixar-config.js               # Configuration settings
assets/pixar-utils.js                # Utility functions
```

**UI Component Files (Required):**
```
assets/pixar-transform-file-input.js # Main upload component
assets/pixar-text-overlay.js        # Text overlay functionality
assets/pixar-text-manager.js        # Text management system
assets/pixar-integration.js         # Integration coordinator
assets/result-popup-manager.js      # Result display manager
assets/image-cropper.js             # Image cropping tool
assets/aurora-pixar-adapter.js      # Theme adapter
```

**Optional Enhancement Files:**
```
assets/pixar-upload-button.js       # Custom upload button
assets/pixar-button-generator.js    # Button generation utility
assets/pixar-debug.js               # Debug utilities
```

### Step 3: Copy CSS Files

**Required CSS:**
```
assets/pixar-transform-file-input.css  # Main component styles
assets/image-cropper.css              # Cropper styles
assets/main-product.out.css           # Product page styles
assets/face-swap-file-input-wrapper.out.css # Legacy wrapper styles
```

### Step 4: Copy Liquid Snippets

**Essential Snippets:**
```
snippets/pixar-transform-file-input.liquid  # Main upload widget
snippets/product-form-block.liquid         # Product form integration
snippets/aurora-pixar-integration.liquid   # Theme integration
```

### Step 5: Update Template Detection Logic

The template uses multiple detection methods. Update these in your duplicated files:

#### In `assets/image-processing-manager.js`:

Find (around line 4726):
```javascript
const isPixarGeminiTemplate = window?.template === "product.pixar-gemini" || 
                              location.href.includes("/products/pixar-gemini");
```

Add your template:
```javascript
const isPixarGeminiTemplate = window?.template === "product.pixar-gemini" || 
                              window?.template === "product.YOUR-NEW-TEMPLATE" ||
                              location.href.includes("/products/pixar-gemini") ||
                              location.href.includes("/products/YOUR-NEW-TEMPLATE");
```

#### In `assets/direct-pixar-loader.js` (if used):

Similar update around lines 431-468 for template detection.

### Step 6: Configure Product Tags

Products using this template need specific tags for activation:

**Required Tags (at least one):**
- `cartoonique`
- `pixar-transform`

Add these tags to products in Shopify Admin:
1. Go to Products → Select product
2. Add tag: `pixar-transform`
3. Save product

### Step 7: API Configuration

The template uses Railway API for image processing:

#### In `assets/pixar-config.js`:
```javascript
window.pixarConfig = {
  api: {
    production: {
      baseUrl: 'https://letzteshemd-faceswap-api-production.up.railway.app',
      timeout: 120000,
      pollingInterval: 2000,
      maxPollingAttempts: 60
    }
  },
  endpoints: {
    transform: '/transform',      // Standard endpoint
    status: '/status/',           // Polling endpoint
    gemini: '/gemini-transform'   // Gemini-specific endpoint
  }
}
```

### Step 8: Template-Specific Features

#### A. Two-Popup Workflow System

The template uses a sophisticated two-popup approach:

1. **Instructions Popup**: Shows good/bad photo examples
2. **Loading Popup**: Shows progress during transformation

Both are defined in `snippets/pixar-transform-file-input.liquid`

#### B. Background Color Support (Optional)

For templates like pet products that need background colors:
```javascript
// Add to transformation payload
backgroundColor: selectedColor || 'pink'
```

#### C. Text Overlay Feature

Allows adding custom text to transformed images:
- Managed by `pixar-text-overlay.js` and `pixar-text-manager.js`
- Automatically integrated when files are included

### Step 9: Form Validation Setup

In `sections/main-product.liquid` or your product section:

```liquid
{% if product.tags contains 'cartoonique' or product.tags contains 'pixar-transform' %}
  <script>
    productForm.addEventListener('submit', function(event) {
      const pixarComponent = document.querySelector('pixar-transform-file-input');
      if (pixarComponent && !pixarComponent.processedImageUrl) {
        event.preventDefault();
        alert('Please upload and transform your image before adding to cart');
        pixarComponent.openPopup();
        return false;
      }
    });
  </script>
{% endif %}
```

### Step 10: Initialize Components

Add initialization script to your template:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Image Processing Manager
  if (typeof ImageProcessingManager !== 'undefined') {
    window.imageProcessingManager = new ImageProcessingManager();
  }
  
  // Initialize Pixar Text Integration
  if (typeof PixarTextIntegration !== 'undefined') {
    const pixarIntegration = new PixarTextIntegration({
      sectionId: '{{ section.id }}',
      debug: true
    });
    pixarIntegration.init();
  }
});
```

### Step 11: Cart Integration

Update cart display to show transformed images:

In `snippets/cart-item.liquid`:
```liquid
{% if item.properties._transformedImage %}
  <img src="{{ item.properties._transformedImage }}" alt="Transformed image">
{% else %}
  <!-- Show regular product image -->
{% endif %}
```

### Step 12: Testing Your Duplicated Template

#### Test Checklist:
- [ ] Template loads correctly on product page
- [ ] Upload button appears for tagged products
- [ ] Instructions popup shows on button click
- [ ] File upload triggers image transformation
- [ ] Progress bar animates during processing
- [ ] Result displays in popup after transformation
- [ ] Add to cart is blocked until transformation completes
- [ ] Transformed image appears in cart
- [ ] Order contains transformed image URL

#### Console Verification:
```javascript
// Check template is detected
console.log(window?.template); // Should show your template name

// Check components are loaded
console.log(typeof ImageProcessingManager); // Should be 'function'
console.log(typeof PixarTextIntegration); // Should be 'function'

// Check API configuration
console.log(window.pixarConfig); // Should show config object
```

## Troubleshooting

### Common Issues and Solutions:

1. **Upload button not appearing:**
   - Check product has required tags
   - Verify template detection in console
   - Check browser console for JS errors

2. **API transformation fails:**
   - Verify API endpoint is accessible
   - Check network tab for request/response
   - Ensure image meets requirements (max 10MB, JPEG/PNG)

3. **Popup not showing:**
   - Check z-index in CSS (should be 99999999)
   - Verify popup HTML is added to DOM
   - Check for conflicting styles

4. **Add to cart not working:**
   - Ensure form validation is properly configured
   - Check `processedImageUrl` is set after transformation
   - Verify form submission event handling

## File Structure Summary

```
/templates/
  product.YOUR-NEW-TEMPLATE.json

/assets/
  # Core JS
  image-processing-manager.js
  unified-api-client.js
  pixar-config.js
  pixar-utils.js
  
  # UI Components
  pixar-transform-file-input.js
  pixar-text-overlay.js
  pixar-text-manager.js
  pixar-integration.js
  result-popup-manager.js
  image-cropper.js
  aurora-pixar-adapter.js
  
  # Styles
  pixar-transform-file-input.css
  image-cropper.css
  main-product.out.css
  
/snippets/
  pixar-transform-file-input.liquid
  product-form-block.liquid
  aurora-pixar-integration.liquid
```

## Advanced Customization

### Changing Transformation Style:

In API payload, modify the style parameter:
```javascript
style: 'pixar',     // Default
style: 'cartoon',   // Alternative style
style: 'anime',     // Another option
```

### Adding Custom Watermarks:

```javascript
watermark: {
  url: 'https://your-cdn.com/watermark.png',
  width: 200,
  height: 200,
  spaceBetweenWatermarks: 100
}
```

### Modifying Progress Messages:

In `snippets/pixar-transform-file-input.liquid`, update progress text:
```javascript
if (progress < 30) {
  progressText.textContent = "Your custom message...";
}
```

## Important Notes

1. **API Key Management**: Keep API endpoints secure
2. **Image Privacy**: Images are deleted after processing
3. **Performance**: Template loads ~15 JS files, consider bundling for production
4. **Mobile Optimization**: Test thoroughly on mobile devices
5. **Browser Support**: Requires modern browsers with ES6 support

## Support and Maintenance

- Test template after theme updates
- Monitor API endpoint availability
- Keep transformation styles consistent across products
- Regular testing of the full user flow
- Document any customizations for future reference

## Conclusion

This template provides a sophisticated image transformation feature with excellent UX through its two-popup workflow. The modular architecture allows for easy customization while maintaining core functionality. Follow all steps carefully to ensure complete functionality is preserved in your duplicated template.