/**
 * Pixar Button Generator
 * 
 * This script creates the upload button for the Pixar transformation
 * and sets up the necessary UI elements.
 */

(function() {
  console.log('⭐ Pixar Button Generator initializing...');

  // Check if we're on a product page that needs the transformation button
  function isOnTransformProductPage() {
    // Look for product tags or other indicators
    const productForm = document.querySelector('form[action="/cart/add"]');
    if (!productForm) return false;
    
    // Check if this product has Pixar transformation feature
    const hasFaceSwap = document.querySelector('face-swap-file-input-wrapper');
    const hasPixarTransform = document.querySelector('pixar-transform-file-input');
    
    return hasFaceSwap || hasPixarTransform;
  }
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Only proceed if we're on a product page that needs transformation
    if (!isOnTransformProductPage()) {
      console.log('⭐ Not on a transformation product page, skipping button generation');
      return;
    }
    
    createUploadButton();
    setupButtonHandlers();
  });
  
  // Create the upload button if needed
  function createUploadButton() {
    // Check if button already exists
    if (document.getElementById('pixar-upload-button')) {
      console.log('⭐ Upload button already exists, no need to create it');
      return;
    }
    
    console.log('⭐ Creating upload button');
    
    // Find a good place to insert the button
    let insertLocation = null;
    
    // Option 1: Look for pixar component area
    const pixarArea = document.getElementById('pixar-component-area');
    if (pixarArea) {
      insertLocation = pixarArea;
    }
    
    // Option 2: Look for product form
    if (!insertLocation) {
      const productForm = document.querySelector('form[action="/cart/add"]');
      if (productForm) {
        // Create a container for the button
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'pixar-upload-button-container';
        buttonContainer.style.cssText = `
          margin: 15px 0;
          width: 100%;
        `;
        
        // Insert container before add to cart button
        const addToCartButton = productForm.querySelector('button[name="add"]');
        if (addToCartButton) {
          productForm.insertBefore(buttonContainer, addToCartButton);
          insertLocation = buttonContainer;
        } else {
          // No add to cart button found, insert at end of form
          productForm.appendChild(buttonContainer);
          insertLocation = buttonContainer;
        }
      }
    }
    
    // Option 3: Fallback to body if no suitable location found
    if (!insertLocation) {
      console.log('⭐ No suitable insertion location found, creating container');
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'pixar-standalone-button-container';
      buttonContainer.style.cssText = `
        margin: 20px auto;
        max-width: 500px;
        padding: 15px;
      `;
      
      document.body.appendChild(buttonContainer);
      insertLocation = buttonContainer;
    }
    
    // Create button
    const uploadButton = document.createElement('button');
    uploadButton.id = 'pixar-upload-button';
    uploadButton.type = 'button';
    uploadButton.textContent = '📸 UPLOAD YOUR PHOTO';
    uploadButton.style.cssText = `
      display: block;
      width: 100%;
      padding: 15px 25px;
      font-size: 16px;
      font-weight: bold;
      background-color: #4a7dbd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 10px 0;
      text-transform: uppercase;
      transition: background-color 0.3s ease;
    `;
    
    // Add button to the page
    insertLocation.appendChild(uploadButton);
    console.log('⭐ Upload button created');
    
    // Create instructions popup if it doesn't exist
    createInstructionsPopup();
  }
  
  // Create the instructions popup
  function createInstructionsPopup() {
    // Check if popup already exists
    if (document.getElementById('pixar-instructions-popup')) {
      console.log('⭐ Instructions popup already exists');
      return;
    }
    
    console.log('⭐ Creating instructions popup');
    
    // Create instructions popup
    const instructionsPopup = document.createElement('div');
    instructionsPopup.id = 'pixar-instructions-popup';
    instructionsPopup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.98);
      z-index: 99999999;
      display: none;
      overflow: auto;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    // Add content to the popup
    instructionsPopup.innerHTML = `
      <div style="position: relative; max-width: 900px; margin: 30px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 0 30px rgba(0,0,0,0.2);">
        <button id="pixar-close-button" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 30px; cursor: pointer; padding: 5px; color: #555;">&times;</button>
        
        <h2 style="text-align: center; font-size: 28px; margin-bottom: 20px; font-weight: bold;">UPLOAD A PHOTO FOR YOUR PIXAR PORTRAIT</h2>
        
        <div style="margin-bottom: 30px;">
          <!-- Bad photo section -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #FF4444; text-align: center; font-size: 24px; margin-bottom: 15px; font-weight: bold;">BAD PHOTO EXAMPLES</h3>
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
              <div style="text-align: center; width: 30%; min-width: 180px; margin-bottom: 15px;">
                <div style="position: relative; border: 2px solid #FF4444; width: 100%; aspect-ratio: 1; margin-bottom: 10px; border-radius: 5px; overflow: hidden;">
                  <img src="https://cdn.shopify.com/s/files/1/0626/3416/4430/files/bad_photo_far.jpg?v=1683712345" alt="Far/Blurry Example" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 5px; right: 5px; background-color: #FF4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</div>
                </div>
                <p style="font-weight: bold; color: #FF4444; margin: 0;">FAR/BLURRY</p>
              </div>
          
              <div style="text-align: center; width: 30%; min-width: 180px; margin-bottom: 15px;">
                <div style="position: relative; border: 2px solid #FF4444; width: 100%; aspect-ratio: 1; margin-bottom: 10px; border-radius: 5px; overflow: hidden;">
                  <img src="https://cdn.shopify.com/s/files/1/0626/3416/4430/files/bad_photo_glasses.jpg?v=1683712345" alt="Glasses Example" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 5px; right: 5px; background-color: #FF4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</div>
                </div>
                <p style="font-weight: bold; color: #FF4444; margin: 0;">GLASSES</p>
              </div>
          
              <div style="text-align: center; width: 30%; min-width: 180px; margin-bottom: 15px;">
                <div style="position: relative; border: 2px solid #FF4444; width: 100%; aspect-ratio: 1; margin-bottom: 10px; border-radius: 5px; overflow: hidden;">
                  <img src="https://cdn.shopify.com/s/files/1/0626/3416/4430/files/bad_photo_multiple.jpg?v=1683712345" alt="Multiple People Example" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 5px; right: 5px; background-color: #FF4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</div>
                </div>
                <p style="font-weight: bold; color: #FF4444; margin: 0;">2+ PEOPLE</p>
              </div>
            </div>
          </div>
        
          <!-- Good photo section -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #33CC66; text-align: center; font-size: 24px; margin-bottom: 15px; font-weight: bold;">GOOD PHOTO EXAMPLES</h3>
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
              <div style="text-align: center; width: 30%; min-width: 180px; margin-bottom: 15px;">
                <div style="position: relative; border: 2px solid #33CC66; width: 100%; aspect-ratio: 1; margin-bottom: 10px; border-radius: 5px; overflow: hidden;">
                  <img src="https://cdn.shopify.com/s/files/1/0626/3416/4430/files/good_photo_closeup.jpg?v=1683712345" alt="Close-up Example" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 5px; right: 5px; background-color: #33CC66; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✓</div>
                </div>
                <p style="font-weight: bold; color: #33CC66; margin: 0;">CLOSE-UP</p>
              </div>
          
              <div style="text-align: center; width: 30%; min-width: 180px; margin-bottom: 15px;">
                <div style="position: relative; border: 2px solid #33CC66; width: 100%; aspect-ratio: 1; margin-bottom: 10px; border-radius: 5px; overflow: hidden;">
                  <img src="https://cdn.shopify.com/s/files/1/0626/3416/4430/files/good_photo_clear.jpg?v=1683712345" alt="Clear Example" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 5px; right: 5px; background-color: #33CC66; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✓</div>
                </div>
                <p style="font-weight: bold; color: #33CC66; margin: 0;">CLEAR</p>
              </div>
          
              <div style="text-align: center; width: 30%; min-width: 180px; margin-bottom: 15px;">
                <div style="position: relative; border: 2px solid #33CC66; width: 100%; aspect-ratio: 1; margin-bottom: 10px; border-radius: 5px; overflow: hidden;">
                  <img src="https://cdn.shopify.com/s/files/1/0626/3416/4430/files/good_photo_oneperson.jpg?v=1683712345" alt="One Person Example" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 5px; right: 5px; background-color: #33CC66; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✓</div>
                </div>
                <p style="font-weight: bold; color: #33CC66; margin: 0;">1 PERSON</p>
              </div>
            </div>
          </div>
        </div>

        <p style="text-align: center; font-size: 18px; margin-bottom: 30px; font-weight: bold;">
          Please make sure to upload a clear, close-up photo of one person without glasses.
        </p>

        <div id="pixar-upload-buttons" style="text-align: center;">
          <button id="pixar-popup-upload-button" style="background-color: #4a7dbd; color: white; padding: 18px 40px; font-size: 20px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; margin: 10px auto; display: block; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">UPLOAD PHOTO</button>
        </div>
        
        <div id="pixar-error-message" style="display: none; text-align: center; color: red; margin-top: 20px;"></div>
      </div>
    `;
    
    // Create loading popup
    const loadingPopup = document.createElement('div');
    loadingPopup.id = 'pixar-loading-popup';
    loadingPopup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.98);
      z-index: 99999999;
      display: none;
      overflow: auto;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    // Add content to the loading popup
    loadingPopup.innerHTML = `
      <div style="position: relative; max-width: 700px; margin: 100px auto; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.1);">
        <h3 style="text-align: center; font-size: 26px; margin-bottom: 30px; color: #333; font-weight: bold;">Generating, please wait...</h3>
        
        <div style="width: 90%; max-width: 500px; height: 12px; background-color: #f5f5f5; border-radius: 20px; margin: 30px auto; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
          <div id="pixar-progress-bar" style="height: 100%; width: 10%; background: linear-gradient(to right, #4a7dbd, #6a9ad0); transition: width 1s ease-in-out; border-radius: 20px;"></div>
        </div>
        
        <p id="pixar-progress-text" style="text-align: center; margin: 20px 0; color: #555; font-size: 18px; font-weight: 500;">Preparing your image...</p>
        
        <p style="text-align: center; margin-top: 15px; color: #777; font-size: 15px;">Usually takes 2 to 3 minutes.</p>
      </div>
    `;
    
    // Add popups to document
    document.body.appendChild(instructionsPopup);
    document.body.appendChild(loadingPopup);
    
    console.log('⭐ Instruction and loading popups created');
  }
  
  // Set up the button handlers
  function setupButtonHandlers() {
    // Wait for the DOM to be fully loaded to ensure elements exist
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachHandlers);
    } else {
      attachHandlers();
    }
    
    function attachHandlers() {
      // 1. Main upload button click - opens instructions popup
      const uploadButton = document.getElementById('pixar-upload-button');
      if (uploadButton) {
        uploadButton.addEventListener('click', function() {
          console.log('⭐ Main upload button clicked');
          const instructionsPopup = document.getElementById('pixar-instructions-popup');
          if (instructionsPopup) {
            // Clear any previous error messages
            const errorMsg = document.getElementById('pixar-error-message');
            if (errorMsg) {
              errorMsg.style.display = 'none';
              errorMsg.textContent = '';
            }
            
            // Show instructions popup
            instructionsPopup.style.display = 'block';
            document.body.style.overflow = 'hidden';
          }
        });
      }
      
      // 2. Close button in instructions popup
      const closeButton = document.getElementById('pixar-close-button');
      if (closeButton) {
        closeButton.addEventListener('click', function() {
          console.log('⭐ Close button clicked');
          const instructionsPopup = document.getElementById('pixar-instructions-popup');
          if (instructionsPopup) {
            instructionsPopup.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      }
      
      // 3. Upload button in popup
      const popupUploadButton = document.getElementById('pixar-popup-upload-button');
      if (popupUploadButton) {
        popupUploadButton.addEventListener('click', function() {
          console.log('⭐ Popup upload button clicked');
          triggerFileInput();
        });
      }
      
      console.log('⭐ Button handlers attached');
    }
  }
  
  // Function to trigger the file input
  function triggerFileInput() {
    // Find the component
    const pixarComponent = window.pixarComponent || document.querySelector('pixar-transform-file-input');
    const fileInput = pixarComponent ? 
                    pixarComponent.querySelector('input[type="file"]') || 
                    (pixarComponent.fileInput ? pixarComponent.fileInput : null) : 
                    document.querySelector('input[type="file"]');
    
    if (fileInput) {
      console.log('⭐ Found file input, triggering click', fileInput);
      
      // Add change handler to hide instructions popup when file is selected
      fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          console.log('⭐ File selected:', file.name);
          
          // Hide instructions popup 
          const instructionsPopup = document.getElementById('pixar-instructions-popup');
          if (instructionsPopup) {
            instructionsPopup.style.display = 'none';
          }
        }
      }, {once: true});
      
      // Click the file input
      fileInput.click();
    } else {
      console.log('⭐ No file input found');
      
      // Show error message
      const errorElement = document.getElementById('pixar-error-message');
      if (errorElement) {
        errorElement.textContent = 'Error: File input not found. Please refresh the page and try again.';
        errorElement.style.display = 'block';
      }
    }
  }
  
  // Listen for successful transformation to update button
  document.addEventListener('pixar-transform-complete', function(e) {
    console.log('⭐ Transform complete event detected');
    
    // Update the main upload button
    const uploadButton = document.getElementById('pixar-upload-button');
    if (uploadButton) {
      uploadButton.textContent = '✅ IMAGE UPLOADED - READY TO ADD TO CART';
      uploadButton.style.backgroundColor = '#4CAF50';
    }
  });
})(); 