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
          console.log('⭐ No file input found, creating fallback input');
          
          // Create a fallback file input
          const fallbackInput = document.createElement('input');
          fallbackInput.type = 'file';
          fallbackInput.accept = 'image/*';
          fallbackInput.style.display = 'none';
          
          // Add change event listener
          fallbackInput.addEventListener('change', function(event) {
            if (event.target.files && event.target.files.length) {
              console.log('⭐ Fallback input file selected:', event.target.files[0].name);
              
              // Get the selected file
              const selectedFile = event.target.files[0];
              
              // Hide instructions popup if it exists
              const instructionsPopup = document.getElementById('pixar-instructions-popup');
              if (instructionsPopup) {
                instructionsPopup.style.display = 'none';
              }
              
              // Show loading popup
              const loadingPopup = document.getElementById('pixar-loading-popup');
              if (loadingPopup) {
                loadingPopup.style.display = 'block';
                document.body.style.overflow = 'hidden';
              }
              
              // OPTION 1: Try to use the global processImageWithRunPod function
              if (typeof window.processImageWithRunPod === 'function') {
                console.log('⭐ Using global processImageWithRunPod function');
                window.processImageWithRunPod(selectedFile);
                return;
              }
              
              // OPTION 2: Try to use the Image Processing Manager
              if (window.imageProcessingManager) {
                console.log('⭐ Using ImageProcessingManager.handleFileSelected');
                window.imageProcessingManager.handleFileSelected(event);
                return;
              }
              
              // OPTION 3: Direct implementation (FALLBACK)
              console.log('⭐ No processImageWithRunPod or ImageProcessingManager found, implementing direct API call');
              
              // Create a unique file identifier to prevent duplicate processing
              const fileIdentifier = `${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified || Date.now()}`;
              
              // Check global tracking
              if (!window.railwayApiCallsInProgress) {
                window.railwayApiCallsInProgress = {};
              }
              
              if (window.railwayApiCallsInProgress[fileIdentifier]) {
                console.log('⭐ This file is already being processed, skipping duplicate API call');
                return;
              }
              
              // Mark file as being processed
              window.railwayApiCallsInProgress[fileIdentifier] = true;
              
              const reader = new FileReader();
              reader.onload = function(e) {
                const imageBase64 = e.target.result;
                
                // Create payload with image and watermark
                const payload = {
                  image: imageBase64,
                  style: 'pixar',
                  watermark: {
                    url: "https://cdn.shopify.com/s/files/1/0626/3416/4430/files/watermark.png",
                    width: 200,
                    height: 100,
                    spaceBetweenWatermarks: 100
                  }
                };
                
                // Call the API endpoint
                fetch('https://letzteshemd-faceswap-api-production.up.railway.app/transform', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(payload),
                  timeout: 60000 // 60 second timeout
                })
                .then(response => {
                  console.log('⭐ Transform API response received, status:', response.status);
                  if (!response.ok) {
                    throw new Error(`API response error: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  console.log('⭐ Transform response data:', data);
                  
                  // Check for explicit error field in response
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  
                  // Extract jobId
                  let jobId = data.jobId || data.id;
                  
                  if (jobId) {
                    console.log('⭐ Successfully received jobId:', jobId);
                    
                    // Start polling for job status if we have a global tracking system
                    if (window.imageProcessingManager && typeof window.imageProcessingManager.pollRailwayJobStatus === 'function') {
                      window.imageProcessingManager.pollRailwayJobStatus(jobId);
                    } else {
                      // Otherwise dispatch event for other components to handle
                      const customEvent = new CustomEvent('pixar-job-started', {
                        detail: { jobId: jobId, file: selectedFile }
                      });
                      document.dispatchEvent(customEvent);
                    }
                    
                    // Show success message on button
                    const uploadButton = document.querySelector('#direct-pixar-loader-container button');
                    if (uploadButton) {
                      uploadButton.textContent = '✅ IMAGE UPLOADED - PROCESSING';
                      uploadButton.style.backgroundColor = '#FFA500';
                    }
                  } else {
                    console.error('⭐ No jobId in response');
                    throw new Error('Failed to process image. Please try again.');
                  }
                })
                .catch(error => {
                  console.error('⭐ Error in transform call:', error);
                  // Remove file from tracking on error
                  delete window.railwayApiCallsInProgress[fileIdentifier];
                  
                  // Show error message
                  const errorElement = document.getElementById('pixar-error-message');
                  if (errorElement) {
                    errorElement.textContent = 'Error: ' + (error.message || 'Unknown error processing image');
                    errorElement.style.display = 'block';
                  }
                  
                  // Hide loading popup
                  if (loadingPopup) {
                    loadingPopup.style.display = 'none';
                  }
                });
              };
              reader.onerror = function(error) {
                console.error('⭐ Error reading file:', error);
                // Remove file from tracking on error
                delete window.railwayApiCallsInProgress[fileIdentifier];
                
                const errorElement = document.getElementById('pixar-error-message');
                if (errorElement) {
                  errorElement.textContent = 'Error: Could not read file';
                  errorElement.style.display = 'block';
                }
              };
              reader.readAsDataURL(selectedFile);
            }
          });
          
          // Add to document and trigger click
          document.body.appendChild(fallbackInput);
          fallbackInput.click();
          
          // Clean up after selecting (or canceling)
          setTimeout(() => {
            if (document.body.contains(fallbackInput)) {
              document.body.removeChild(fallbackInput);
            }
          }, 5000);
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
      margin: 10px auto;
      text-align: center;
      width: 100%;
      max-width: none;
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
      margin-bottom: 10px;
      height: 50px; /* Match height of Add to cart button */
    `;
    
    // Try to match the current theme's button style
    setTimeout(() => {
      try {
        // Find the Add to cart button to copy its styles
        const addToCartBtn = document.querySelector('button[aria-label="Add to cart"]') || 
                           document.querySelector('.add-to-cart-btn') || 
                           document.querySelector('button[name="add"]');
        
        if (addToCartBtn) {
          // Get computed styles
          const styles = window.getComputedStyle(addToCartBtn);
          
          // Apply matching styles
          button.style.backgroundColor = '#4a7dbd'; // Keep our blue color
          button.style.color = styles.color;
          button.style.padding = styles.padding;
          button.style.fontSize = styles.fontSize;
          button.style.borderRadius = styles.borderRadius;
          button.style.height = styles.height;
          button.style.fontFamily = styles.fontFamily;
          button.style.width = styles.width;
          button.style.lineHeight = styles.lineHeight;
          button.style.fontWeight = styles.fontWeight;
        }
      } catch(e) {
        console.log('⭐ Error matching button styles:', e);
      }
    }, 300);
    
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
    
    // DIRECT TARGET: Find Add to cart button or form
    const addToCartButton = document.querySelector('button[data-testid="AddToCartButton"]') || 
                          document.querySelector('button[aria-label="Add to cart"]') ||
                          document.querySelector('.add-to-cart-btn') || 
                          document.querySelector('button[name="add"]') ||
                          document.querySelector('.add-to-cart') || 
                          document.querySelector('[data-action="add-to-cart"]') ||
                          document.querySelector('.product-form__submit') ||
                          document.querySelector('button:not([type="button"]):contains("Add to cart")');
                          
    // Get the ADD TO CART text content button if none found by ID/class
    if (!addToCartButton) {
      const allButtons = document.querySelectorAll('button');
      for (const btn of allButtons) {
        if (btn.textContent.trim().toLowerCase().includes('add to cart')) {
          addToCartButton = btn;
          break;
        }
      }
    }
    
    // Look for cart form or buttons container
    let targetContainer;
    
    if (addToCartButton) {
      console.log('⭐ Add to cart button found, inserting upload button nearby');
      // Get the parent of the add to cart button
      targetContainer = addToCartButton.closest('form[action*="/cart/add"]') || 
                        addToCartButton.closest('.product-form__buttons') ||
                        addToCartButton.closest('.cart-functions') ||
                        addToCartButton.parentNode;
      
      // Insert our button directly before the add to cart button
      if (targetContainer) {
        try {
          // First check if the addToCartButton is a direct child of targetContainer
          if (Array.from(targetContainer.children).includes(addToCartButton)) {
            targetContainer.insertBefore(container, addToCartButton);
            console.log('⭐ Upload button container added before Add to cart button');
          } else {
            // If not, just prepend to the target container
            targetContainer.prepend(container);
            console.log('⭐ Upload button container added to the beginning of target container');
          }
          return;
        } catch (e) {
          console.log('⭐ Error inserting button:', e);
          // Continue to fallback methods
        }
      }
    }
    
    // Try finding the blue Add to cart button shown in the screenshot
    const blueAddToCartButton = document.querySelector('button.add-to-cart');
    if (blueAddToCartButton) {
      console.log('⭐ Blue Add to cart button found, inserting upload button before it');
      const buttonParent = blueAddToCartButton.parentNode;
      if (buttonParent) {
        try {
          buttonParent.insertBefore(container, blueAddToCartButton);
          console.log('⭐ Upload button container added before blue Add to cart button');
          return;
        } catch (e) {
          console.log('⭐ Error inserting button before blue Add to cart button:', e);
          // Continue to fallback methods
        }
      }
    }
    
    // Very specific fix for the with-faceswap template causing the insertBefore error
    try {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const directAddButton = allButtons.find(btn => 
        btn.textContent && btn.textContent.trim() === 'Add to cart');
      
      if (directAddButton) {
        console.log('⭐ Found exact Add to cart button by text content');
        
        // Create a new div as a wrapper for both buttons
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          margin-bottom: 10px;
        `;
        
        // Get parent element to ensure we can replace safely
        const parent = directAddButton.parentElement;
        if (parent) {
          // Clone our container to ensure we don't get reference issues
          const clonedContainer = container.cloneNode(true);
          
          // Add event listener to the cloned button
          const clonedButton = clonedContainer.querySelector('button');
          if (clonedButton) {
            clonedButton.addEventListener('click', function() {
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
          }
          
          // Create a safe replacement approach
          try {
            buttonWrapper.appendChild(clonedContainer);
            
            // Capture the original button
            const originalButton = directAddButton.cloneNode(true);
            
            // Replace the original button with our new wrapper
            parent.replaceChild(buttonWrapper, directAddButton);
            
            // Add the original button back inside our wrapper
            buttonWrapper.appendChild(originalButton);
            
            console.log('⭐ Successfully replaced Add to cart button with wrapper containing both buttons');
            return;
          } catch (e) {
            console.log('⭐ Error in direct replacement approach:', e);
          }
        }
      }
    } catch (e) {
      console.log('⭐ Error in with-faceswap specific fix:', e);
    }
    
    // Special case for with-faceswap template
    try {
      // For the template with error, add button directly to form
      const addToCartForm = document.querySelector('form[action*="/cart/add"]');
      if (addToCartForm) {
        const submitButton = addToCartForm.querySelector('button[type="submit"]');
        if (submitButton) {
          console.log('⭐ Found submit button in cart form, inserting before it');
          addToCartForm.insertBefore(container, submitButton);
          return;
        } else {
          console.log('⭐ Adding to beginning of cart form');
          addToCartForm.prepend(container);
          return;
        }
      }
    } catch (e) {
      console.log('⭐ Error with special case for with-faceswap template:', e);
    }
    
    // Direct DOM manipulation for the with-faceswap template
    try {
      // Look for the specific "Add to cart" button shown in the UI
      const addToCartButtons = Array.from(document.querySelectorAll('button'));
      const cartButton = addToCartButtons.find(btn => 
        btn.textContent && btn.textContent.trim().toLowerCase() === 'add to cart');
      
      if (cartButton) {
        console.log('⭐ Found direct Add to cart text button');
        // Get the closest product form container
        const productFormContainer = cartButton.closest('.product-form') || 
                                   cartButton.closest('.form') || 
                                   cartButton.closest('form') ||
                                   cartButton.parentElement?.parentElement;
        
        if (productFormContainer) {
          // Insert before the cart button's parent or grandparent for correct positioning
          const buttonContainer = cartButton.parentElement;
          if (buttonContainer && productFormContainer.contains(buttonContainer)) {
            productFormContainer.insertBefore(container, buttonContainer);
            console.log('⭐ Added transform button before button container');
            return;
          } else if (productFormContainer.contains(cartButton)) {
            productFormContainer.insertBefore(container, cartButton);
            console.log('⭐ Added transform button directly before cart button');
            return;
          } else {
            productFormContainer.prepend(container);
            console.log('⭐ Added transform button to beginning of product form');
            return;
          }
        }
      }

      // Look for any form with add to cart in it
      const forms = document.querySelectorAll('form');
      for (const form of forms) {
        if (form.innerHTML.toLowerCase().includes('add to cart')) {
          form.prepend(container);
          console.log('⭐ Added transform button to beginning of form containing Add to cart text');
          return;
        }
      }
    } catch (e) {
      console.log('⭐ Error with direct DOM manipulation:', e);
    }
    
    // Special case for the theme in the screenshot - look for Size options and add after them
    let sizeContainer = document.querySelector('.size-option-cont') || 
                      document.querySelector('.color-option-cont');
    
    // Try to find fieldset with Size legend
    if (!sizeContainer) {
      const fieldsets = document.querySelectorAll('fieldset');
      for (const fieldset of fieldsets) {
        const legend = fieldset.querySelector('legend');
        if (legend && legend.textContent.includes('Size')) {
          sizeContainer = fieldset;
          break;
        }
      }
    }
    
    if (sizeContainer) {
      const sizeParent = sizeContainer.parentNode;
      if (sizeParent) {
        const nextElement = sizeContainer.nextElementSibling;
        if (nextElement) {
          sizeParent.insertBefore(container, nextElement);
        } else {
          sizeParent.appendChild(container);
        }
        console.log('⭐ Upload button container added after size options');
        return;
      }
    }
    
    // Fallback to other containers if specific targets not found
    targetContainer = document.querySelector('.product-form__buttons') || 
                     document.querySelector('.cart-functions') ||
                     document.querySelector('form[action*="/cart/add"]') ||
                     document.querySelector('.product__container') || 
                     document.querySelector('.product__info-container');
    
    if (targetContainer) {
      // If it's a form and we found the submit button, insert before
      if (targetContainer.tagName === 'FORM' && targetContainer.querySelector('button[type="submit"]')) {
        const submitButton = targetContainer.querySelector('button[type="submit"]');
        targetContainer.insertBefore(container, submitButton);
      } else {
        // Otherwise prepend as the first element
        targetContainer.prepend(container);
      }
      console.log('⭐ Upload button container added to product form container');
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