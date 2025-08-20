# Pet Background Color Selection - A-Z Testing Guide

## Overview
This guide provides comprehensive testing instructions for the pet background color selection feature implementation in the Cartoonique Shopify theme.

## Prerequisites
- Node.js 18.20+ or 20.10+
- Shopify CLI
- Git
- Access to a Shopify development store or partner account

## 🚀 Quick Start Testing

### Step 1: Local Development Setup
```bash
# Install Shopify CLI globally
npm install -g @shopify/cli@latest

# Navigate to theme directory
cd /path/to/your/theme

# Start local development
shopify theme dev --store=your-store.myshopify.com
```

### Step 2: Access Test Environment
- Open: http://127.0.0.1:9292
- Navigate to a pet product page (template: `product.pet.json`)
- Open browser developer tools for console logging

### Step 3: Run Automated Tests
```javascript
// In browser console, run:
window.petBackgroundColorTests.runAllTests()
```

## 📋 Comprehensive Test Checklist

### Phase 1: Environment Verification ✅
- [ ] **Template Detection**: Verify `window.isPetTemplate` is `true` on pet products
- [ ] **Global State**: Confirm `window.petBackgroundColor` exists and defaults to `'pink'`
- [ ] **Script Loading**: Ensure all required scripts are loaded
- [ ] **Console Logging**: Check for initialization messages

### Phase 2: UI Component Testing ✅
- [ ] **Upload Button**: Click upload button triggers popup
- [ ] **Color Selector**: `#pet-background-color-selector` element exists
- [ ] **Color Options**: Pink and blue radio buttons are rendered
- [ ] **Default Selection**: Pink is selected by default
- [ ] **Visual Design**: Color swatches display correct gradients
- [ ] **Legend Text**: "Choose Background Color:" is visible
- [ ] **Responsive Design**: Works on mobile viewports

### Phase 3: State Management Testing ✅
- [ ] **Initial State**: `window.petBackgroundColor === 'pink'`
- [ ] **State Changes**: Selecting blue updates global state
- [ ] **Event Handling**: Change events properly trigger state updates
- [ ] **State Persistence**: Color selection persists across popup interactions
- [ ] **Console Logging**: State changes are logged

### Phase 4: API Integration Testing ✅
- [ ] **Payload Structure**: Base payload contains image, style, watermark
- [ ] **Background Color Inclusion**: `backgroundColor` field added for pet templates
- [ ] **Color Value Sync**: Payload reflects current color selection
- [ ] **Endpoint Selection**: Uses `/transformpet` for pet templates
- [ ] **Conditional Logic**: Non-pet templates don't include backgroundColor
- [ ] **API Logging**: Payload construction is logged

### Phase 5: End-to-End Testing 🧪
- [ ] **Upload Flow**: Complete image upload with color selection
- [ ] **API Request**: Verify actual API call includes backgroundColor
- [ ] **Processing**: Confirm backend receives and processes color parameter
- [ ] **Result Display**: Generated image reflects selected background color
- [ ] **Error Handling**: Invalid images handled gracefully

### Phase 6: Edge Cases & Error Handling ⚠️
- [ ] **Non-Pet Products**: Color selector not visible on human products
- [ ] **Missing Elements**: Graceful handling of missing DOM elements
- [ ] **Invalid States**: System handles invalid color values
- [ ] **Network Errors**: API failures handled appropriately
- [ ] **Mobile Compatibility**: Works on various mobile devices

### Phase 7: Performance & Accessibility ♿
- [ ] **Load Time**: Color selector doesn't impact page load
- [ ] **Memory Leaks**: No excessive event listeners created
- [ ] **ARIA Labels**: Proper accessibility attributes
- [ ] **Keyboard Navigation**: Can navigate with Tab/Enter keys
- [ ] **Screen Reader**: Works with assistive technologies

## 🔧 Manual Testing Procedures

### Test 1: Basic Functionality
1. Navigate to pet product page
2. Click "Upload Photo" button
3. Verify color selector appears below upload button
4. Select blue color option
5. Check console: `window.petBackgroundColor` should be `'blue'`
6. Select pink option
7. Check console: `window.petBackgroundColor` should be `'pink'`

### Test 2: API Payload Verification
```javascript
// Mock API test in console:
const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

// Simulate the API payload construction
const payload = {
  image: 'data:image/jpeg;base64,test',
  style: "pixar",
  watermark: {
    url: "https://cdn.shopify.com/s/files/1/0896/3434/1212/files/watermarklogo.png",
    width: 200,
    height: 200,
    spaceBetweenWatermarks: 100,
  },
};

// Check if backgroundColor is added for pet templates
if (window?.isPetTemplate && window?.petBackgroundColor) {
  payload.backgroundColor = window.petBackgroundColor;
}

console.log('API Payload:', payload);
// Should include backgroundColor field with current color selection
```

### Test 3: Cross-Template Verification
1. Test on pet product page (should show color selector)
2. Test on human product page (should NOT show color selector)
3. Verify `window.isPetTemplate` values
4. Check conditional rendering logic

### Test 4: Mobile Responsiveness
1. Open browser dev tools
2. Switch to mobile viewport (375px width)
3. Navigate to pet product
4. Open upload popup
5. Verify color selector is visible and usable
6. Test touch interactions

### Test 5: Image Replacement Functionality
1. Navigate to pet product page
2. Click "Upload Photo" and select a dog image
3. Verify image preview appears with title "Your Uploaded Image"
4. Check helper text: "Click on the image to upload a different one"
5. Hover over image - should show "Click to Change Image" overlay
6. Click on the image - should trigger file selection dialog
7. Select a different dog image
8. Verify image preview updates with new image
9. Test with invalid file (non-image) - should show error message
10. Test with oversized file (>10MB) - should show size error
11. Verify state is reset after replacement (console check)

### Test 6: Image Replacement Error Handling
```javascript
// Test invalid file type
const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
// Should show: "Please select a valid image file."

// Test oversized file
const largeFile = new File(['x'.repeat(11*1024*1024)], 'large.jpg', { type: 'image/jpeg' });
// Should show: "File size is too large. Please select an image smaller than 10MB."
```

## 🐛 Debugging Guide

### Common Issues & Solutions

#### Color Selector Not Appearing
```javascript
// Debug checklist:
console.log('isPetTemplate:', window?.isPetTemplate);
console.log('Popup exists:', !!document.querySelector('#pixar-instructions-popup'));
console.log('Color selector:', !!document.querySelector('#pet-background-color-selector'));
```

#### State Not Updating
```javascript
// Check event listeners:
document.addEventListener('change', function(e) {
  console.log('Change event:', e.target.name, e.target.value);
});
```

#### API Payload Issues
```javascript
// Test payload construction:
console.log('Current color:', window.petBackgroundColor);
console.log('Is pet template:', window.isPetTemplate);
```

#### Image Replacement Not Working
```javascript
// Debug image replacement:
console.log('Image wrapper exists:', !!document.querySelector('#pet-image-wrapper'));
console.log('Image preview exists:', !!document.querySelector('#pet-image-preview'));
console.log('Replacement input exists:', !!document.querySelector('#pet-image-replacement-input'));
console.log('Image overlay exists:', !!document.querySelector('#pet-image-overlay'));

// Check event listeners
const wrapper = document.querySelector('#pet-image-wrapper');
if (wrapper) {
  console.log('Wrapper has click listener:', wrapper.onclick !== null);
}
```

### Console Commands for Testing
```javascript
// Force set pet template mode
window.isPetTemplate = true;

// Manually set background color
window.petBackgroundColor = 'blue';

// Trigger change event manually
const event = new Event('change');
const mockTarget = { name: 'petBackgroundColor', value: 'pink' };
Object.defineProperty(event, 'target', { value: mockTarget });
document.dispatchEvent(event);

// Run specific test phases
window.petBackgroundColorTests.PetBackgroundColorTests.testUIComponents();
window.petBackgroundColorTests.PetBackgroundColorTests.testStateManagement();

// Test image replacement functionality
window.petBackgroundColorTests.PetBackgroundColorTests.testImageReplacement();
window.petBackgroundColorTests.PetBackgroundColorTests.testImageReplacementErrorHandling();

// Manually trigger image replacement
const imageWrapper = document.querySelector('#pet-image-wrapper');
if (imageWrapper) {
  imageWrapper.click(); // Should open file dialog
}
```

## 🔍 Shopify-Specific Testing

### Theme Check Validation
```bash
# Run theme check for errors
shopify theme check

# Check for liquid syntax errors
shopify theme check --auto-correct
```

### Local Development Testing
```bash
# Start development server with specific theme
shopify theme dev --theme=pet-background-test

# Push changes to development theme
shopify theme push --development

# Share preview for testing
shopify theme share
```

### Production Testing Checklist
- [ ] Test on actual Shopify store
- [ ] Verify with real pet product data
- [ ] Test image upload with actual files
- [ ] Confirm API integration works end-to-end
- [ ] Check cart functionality after image transformation
- [ ] Validate checkout process with customized products

## 📊 Test Results Interpretation

### Expected Test Results
```
✅ Environment Setup: 4/4 tests passed (100%)
✅ UI Components: 4/4 tests passed (100%) 
✅ State Management: 3/3 tests passed (100%)
✅ API Payload: 5/5 tests passed (100%)
Overall Status: PASS (16/16 tests - 100%)
```

### Failure Analysis
- **Environment Setup Failures**: Check script loading and template detection
- **UI Component Failures**: Verify DOM structure and CSS classes
- **State Management Failures**: Check event listeners and global variables
- **API Payload Failures**: Validate conditional logic and payload structure

## 🚨 Critical Test Scenarios

### Scenario 1: New Pet Product Upload
1. User selects blue background
2. Uploads pet image
3. Verifies generated image has blue background
4. Adds to cart successfully

### Scenario 2: Color Change Mid-Process
1. User starts with pink selection
2. Changes to blue before uploading
3. Uploads image
4. Confirms blue background in result

### Scenario 3: Mobile User Journey
1. Mobile user opens pet product
2. Selects background color on small screen
3. Uploads image via mobile camera
4. Completes purchase on mobile

### Scenario 4: Image Replacement Workflow
1. User uploads initial pet image
2. Selects blue background color
3. Clicks on image preview to replace it
4. Selects a different pet image
5. Verifies new image appears in preview
6. Confirms background color selection is preserved
7. Clicks "Generate Image" successfully

## 📈 Performance Benchmarks
- Color selector rendering: < 100ms
- State change response: < 50ms  
- API payload construction: < 10ms
- No memory leaks after 100 interactions
- Mobile touch response: < 300ms

## ✅ Deployment Checklist
- [ ] All automated tests passing
- [ ] Manual testing completed
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility requirements met
- [ ] Performance benchmarks achieved
- [ ] Error handling validated
- [ ] Production API integration tested
- [ ] Image replacement functionality tested
- [ ] Hover effects working on all devices
- [ ] File validation error messages displaying
- [ ] State reset working after image replacement

---

**Remember**: Always test on a development store first before deploying to production! 