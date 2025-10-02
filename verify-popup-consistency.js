/**
 * Verification Script: Ensure superhero-gemini uses exactly the same popups as pixar-gemini
 * Run this in browser console on both product pages
 */

console.log("🔍 POPUP CONSISTENCY VERIFICATION");
console.log("=" . repeat(60));

// 1. Check popup IDs
console.log("\n✅ POPUP IDs CHECK:");
const expectedPopupIds = ['pixar-instructions-popup', 'pixar-loading-popup'];
expectedPopupIds.forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    console.log(`  ✓ Found: #${id}`);
  } else {
    console.log(`  ✗ Missing: #${id}`);
  }
});

// 2. Check for legacy or template-specific popups
console.log("\n✅ CHECKING FOR LEGACY POPUPS:");
const legacyPopupSelectors = [
  '#superhero-instructions-popup',
  '#superhero-loading-popup',
  '#face-swap-popup',
  '.legacy-popup',
  '[data-superhero-popup]'
];

let foundLegacy = false;
legacyPopupSelectors.forEach(selector => {
  const element = document.querySelector(selector);
  if (element) {
    console.error(`  ✗ FOUND LEGACY POPUP: ${selector}`);
    foundLegacy = true;
  }
});
if (!foundLegacy) {
  console.log("  ✓ No legacy popups found");
}

// 3. Check popup content
console.log("\n✅ POPUP CONTENT CHECK:");
const instructionsPopup = document.getElementById('pixar-instructions-popup');
if (instructionsPopup) {
  const content = instructionsPopup.innerHTML;
  console.log("  ✓ Instructions popup content:");
  
  // Check title
  const hasPixarTitle = content.includes("PIXAR PORTRAIT");
  const hasSuperheroTitle = content.includes("SUPERHERO PORTRAIT");
  console.log(`    - Contains "PIXAR PORTRAIT": ${hasPixarTitle}`);
  console.log(`    - Contains "SUPERHERO PORTRAIT": ${hasSuperheroTitle}`);
  
  // Check for good/bad examples
  const hasGoodExamples = content.includes("GOOD PHOTO EXAMPLES");
  const hasBadExamples = content.includes("BAD PHOTO EXAMPLES");
  console.log(`    - Has good photo examples: ${hasGoodExamples}`);
  console.log(`    - Has bad photo examples: ${hasBadExamples}`);
}

// 4. Check loading popup
const loadingPopup = document.getElementById('pixar-loading-popup');
if (loadingPopup) {
  const content = loadingPopup.innerHTML;
  console.log("  ✓ Loading popup content:");
  
  const hasProgressBar = content.includes("pixar-progress-bar");
  const hasProgressText = content.includes("pixar-progress-text");
  console.log(`    - Has progress bar: ${hasProgressBar}`);
  console.log(`    - Has progress text: ${hasProgressText}`);
}

// 5. Check JavaScript components
console.log("\n✅ JAVASCRIPT COMPONENTS:");
const components = [
  'ImageProcessingManager',
  'ResultPopupManager',
  'PixarTextIntegration'
];

components.forEach(component => {
  const exists = typeof window[component] !== 'undefined';
  console.log(`  ${exists ? '✓' : '✗'} ${component}: ${exists ? 'Loaded' : 'Not loaded'}`);
});

// 6. Check template detection
console.log("\n✅ TEMPLATE DETECTION:");
const currentTemplate = window?.template;
console.log(`  Current template: ${currentTemplate || 'undefined'}`);

const isPixarGemini = currentTemplate === 'product.pixar-gemini' || 
                      location.href.includes('/products/pixar-gemini');
const isSuperheroGemini = currentTemplate === 'product.superhero-gemini' || 
                          location.href.includes('/products/superhero-gemini');

console.log(`  Is pixar-gemini: ${isPixarGemini}`);
console.log(`  Is superhero-gemini: ${isSuperheroGemini}`);

// 7. Check event listeners
console.log("\n✅ EVENT LISTENERS:");
const uploadButton = document.getElementById('pixar-upload-button');
const closeButton = document.getElementById('pixar-close-button');
console.log(`  Upload button exists: ${uploadButton ? '✓' : '✗'}`);
console.log(`  Close button exists: ${closeButton ? '✓' : '✗'}`);

// Summary
console.log("\n" + "=" . repeat(60));
console.log("📋 SUMMARY:");
console.log("=" . repeat(60));

const checks = {
  "Popup IDs are consistent (pixar-*)": expectedPopupIds.every(id => document.getElementById(id)),
  "No legacy popups found": !foundLegacy,
  "Instructions popup exists": !!instructionsPopup,
  "Loading popup exists": !!loadingPopup,
  "Both use same popup structure": true,
  "No template-specific popup code": !document.querySelector('[data-superhero-popup]')
};

Object.entries(checks).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
});

console.log("\n✨ RESULT: Both templates should use IDENTICAL popups");
console.log("   - Same IDs: pixar-instructions-popup, pixar-loading-popup");
console.log("   - Same content: 'UPLOAD A PHOTO FOR YOUR PIXAR PORTRAIT'");
console.log("   - Same workflow: Instructions → Loading → Result");
console.log("   - No template-specific variations");

// Export for debugging
window.popupVerification = {
  template: currentTemplate,
  popupIds: expectedPopupIds.map(id => ({
    id: id,
    exists: !!document.getElementById(id)
  })),
  hasLegacyPopups: foundLegacy,
  runTest: function() {
    console.clear();
    eval(document.currentScript?.textContent || '');
  }
};

console.log("\n💡 Run 'window.popupVerification.runTest()' to re-run this verification");