/**
 * Pixar Upload Button Handler
 * 
 * This script creates the upload button UI elements and handles their functionality
 * without duplicating the image processing logic from UnifiedApiClient.
 */

(function() {
  console.log('⭐ Pixar Upload Button Handler initializing...');

  // Function to check for and create instructions popup if needed
  function checkForInstructionsPopup() {
    // Check if popup already exists
    const existingPopup = document.getElementById('pixar-instructions-popup');
    if (existingPopup) {
      console.log('⭐ Instructions popup already exists, no need to create it');
      return;
    }
    
    console.log('⭐ Instructions popup not found, creating it from template');
    
    // Create the instructions popup
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
    
    // Add content to the instructions popup
    instructionsPopup.innerHTML = `
      <div style="position: relative; max-width: 900px; margin: 30px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 0 30px rgba(0,0,0,0.2);">
        <button id="pixar-close-button" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 30px; cursor: pointer; padding: 5px; color: #555;">&times;</button>
        
        <h2 style="text-align: center; font-size: 28px; margin-bottom: 20px; font-weight: bold;">UPLOAD A PHOTO FOR YOUR PIXAR PORTRAIT</h2>
        
        <div style="margin-bottom: 30px;">
          <!-- Good and Bad photo sections -->
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
          <button id="pixar-upload-button" style="background-color: #4a7dbd; color: white; padding: 18px 40px; font-size: 20px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; margin: 10px auto; display: block; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">UPLOAD PHOTO</button>
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
    
    // Set up event handlers
    const closeBtn = document.getElementById('pixar-close-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        instructionsPopup.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
    
    const uploadBtn = document.getElementById('pixar-upload-button');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', function() {
        // Find the file input
        const pixarComponent = window.pixarComponent || document.querySelector('pixar-transform-file-input');
        const fileInput = pixarComponent ? 
                      pixarComponent.querySelector('input[type="file"]') || 
                      (pixarComponent.fileInput ? pixarComponent.fileInput : null) : 
                      document.querySelector('input[type="file"]');
        
        if (fileInput) {
          console.log('⭐ Upload button clicked, triggering file input');
          fileInput.click();
        } else {
          console.log('⭐ No file input found');
          const errorElement = document.getElementById('pixar-error-message');
          if (errorElement) {
            errorElement.textContent = 'Error: File input not found. Please refresh the page and try again.';
            errorElement.style.display = 'block';
          }
        }
      });
    }
  }

  // Function to create the main upload button container
  function createUploadButtonContainer() {
    // Check if container already exists
    const existingContainer = document.getElementById('direct-pixar-loader-container');
    if (existingContainer) {
      console.log('⭐ Upload button container already exists');
      return;
    }
    
    console.log('⭐ Creating upload button container');
    
    // Create container
    const container = document.createElement('div');
    container.id = 'direct-pixar-loader-container';
    container.style.cssText = `
      position: relative;
      display: block;
      margin: 20px auto;
      text-align: center;
      max-width: 300px;
    `;
    
    // Create button
    const button = document.createElement('button');
    button.textContent = 'TRANSFORM YOUR PHOTO';
    button.style.cssText = `
      background-color: #4a7dbd;
      color: white;
      padding: 15px 25px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: block;
      width: 100%;
      text-transform: uppercase;
    `;
    
    // Add hover effect
    button.addEventListener('mouseover', function() {
      this.style.backgroundColor = '#3a6dac';
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
      this.style.transition = 'all 0.2s ease-in-out';
    });
    
    button.addEventListener('mouseout', function() {
      this.style.backgroundColor = '#4a7dbd';
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    });
    
    // Add click event
    button.addEventListener('click', function() {
      // Show instructions popup
      const popup = document.getElementById('pixar-instructions-popup');
      if (popup) {
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';
      } else {
        checkForInstructionsPopup();
        // After creating, show it
        document.getElementById('pixar-instructions-popup').style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
    });
    
    // Add button to container
    container.appendChild(button);
    
    // Find where to append the button
    let targetContainer = document.querySelector('.product__container') || 
                         document.querySelector('.product__info-container') ||
                         document.querySelector('.product-form__buttons') ||
                         document.querySelector('.product__buttons');
    
    if (targetContainer) {
      targetContainer.appendChild(container);
      console.log('⭐ Upload button container added to page');
    } else {
      console.log('⭐ Could not find target container for upload button, appending to product page');
      // Use different selectors for various themes
      targetContainer = document.querySelector('.product') || 
                      document.querySelector('[data-product-form-container]') ||
                      document.querySelector('main') ||
                      document.body;
      
      targetContainer.appendChild(container);
    }
  }

  // Run on document ready
  function init() {
    console.log('⭐ Pixar Upload Button Handler ready');
    createUploadButtonContainer();
    checkForInstructionsPopup();
    
    // Set up event listeners for integration with UnifiedApiClient
    document.addEventListener('pixar-transform-complete', function(event) {
      console.log('⭐ Transform complete event received', event);
      
      // Hide loading popup
      const loadingPopup = document.getElementById('pixar-loading-popup');
      if (loadingPopup) {
        loadingPopup.style.display = 'none';
      }
      
      // Update upload button text
      const uploadButton = document.querySelector('#direct-pixar-loader-container button');
      if (uploadButton) {
        uploadButton.textContent = '✅ IMAGE UPLOADED - READY TO ADD TO CART';
        uploadButton.style.backgroundColor = '#4CAF50';
      }
    });
    
    // Also listen for UnifiedApiClient progress updates
    document.addEventListener('pixar-transform-progress', function(event) {
      const progressBar = document.getElementById('pixar-progress-bar');
      const progressText = document.getElementById('pixar-progress-text');
      
      if (progressBar && progressText && event.detail && event.detail.progress) {
        // Update progress bar
        progressBar.style.width = `${event.detail.progress}%`;
        
        // Update text based on progress stage
        if (event.detail.progress < 30) {
          progressText.textContent = 'Uploading your image...';
        } else if (event.detail.progress < 60) {
          progressText.textContent = 'Processing your image...';
        } else if (event.detail.progress < 90) {
          progressText.textContent = 'Finalizing...';
        } else {
          progressText.textContent = 'Complete!';
        }
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 