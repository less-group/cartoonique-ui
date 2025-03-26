/**
 * Direct Pixar Component Loader
 * 
 * This script directly creates and initializes the Pixar transform component
 * regardless of the theme's rendering system. It serves as a fallback for
 * when the normal component loading fails.
 */

(function() {
  console.log('⭐ Direct Pixar Component Loader initializing...');

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
          
          // Add a change handler to process the file after selection
          fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              console.log('⭐ File selected for processing:', file.name);
              
              // Hide instructions popup 
              const instructionsPopup = document.getElementById('pixar-instructions-popup');
              if (instructionsPopup) {
                instructionsPopup.style.display = 'none';
              }
              
              // Show loading popup
              const loadingPopup = document.getElementById('pixar-loading-popup');
              if (loadingPopup) {
                loadingPopup.style.display = 'block';
                
                // Update progress indicators
                const progressBar = document.getElementById('pixar-progress-bar');
                const progressText = document.getElementById('pixar-progress-text');
                
                if (progressBar) progressBar.style.width = '10%';
                if (progressText) progressText.textContent = 'Uploading your image...';
              }
              
              // Let the pixarComponent or ImageProcessingManager handle the file
              if (pixarComponent && typeof pixarComponent.handleFileSelect === 'function') {
                console.log('⭐ Using pixarComponent.handleFileSelect for processing');
                pixarComponent.handleFileSelect(e);
              } else if (window.imageProcessingManager && typeof window.imageProcessingManager.handleFileSelected === 'function') {
                console.log('⭐ Using imageProcessingManager for processing');
                window.imageProcessingManager.handleFileSelected(e);
              } else {
                console.log('⭐ No existing processing handler found, falling back to basic processing');
                
                // Provide a basic fallback for processing
                processImageWithRunPod(file);
              }
            }
          }, {once: true}); // Only run this handler once
          
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

  // Process image using RunPod service
  function processImageWithRunPod(file) {
    console.log('⭐ Processing image with RunPod:', file.name);
    
    // Show loading popup with initial progress
    const loadingPopup = document.getElementById('pixar-loading-popup');
    if (loadingPopup) {
      loadingPopup.style.display = 'block';
    }
    
    // Update progress indicators
    const progressBar = document.getElementById('pixar-progress-bar');
    const progressText = document.getElementById('pixar-progress-text');
    
    if (progressBar) progressBar.style.width = '10%';
    if (progressText) progressText.textContent = 'Reading your image...';
    
    // Dispatch event that RunPod processing has started
    document.dispatchEvent(new CustomEvent('runpod-processing-started', {
      detail: {
        filename: file.name,
        timestamp: Date.now()
      }
    }));
    
    // Read the file as data URL
    const reader = new FileReader();
    
    reader.onload = function(e) {
      if (progressBar) progressBar.style.width = '20%';
      if (progressText) progressText.textContent = 'Preparing to upload...';
      
      const imageBase64 = e.target.result;
      
      // Create the payload for the RunPod API
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
      
      if (progressBar) progressBar.style.width = '30%';
      if (progressText) progressText.textContent = 'Uploading to server...';
      
      // Dispatch progress event
      document.dispatchEvent(new CustomEvent('pixar-transform-progress', {
        detail: {
          progress: 30,
          stage: 'uploading'
        }
      }));
      
      // Call the RunPod API endpoint
      fetch('https://letzteshemd-faceswap-api-production.up.railway.app/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (progressBar) progressBar.style.width = '60%';
        if (progressText) progressText.textContent = 'Processing image...';
        
        // Dispatch progress event
        document.dispatchEvent(new CustomEvent('pixar-transform-progress', {
          detail: {
            progress: 60,
            stage: 'processing'
          }
        }));
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        if (progressBar) progressBar.style.width = '90%';
        if (progressText) progressText.textContent = 'Finalizing...';
        
        // Dispatch progress event
        document.dispatchEvent(new CustomEvent('pixar-transform-progress', {
          detail: {
            progress: 90,
            stage: 'finalizing'
          }
        }));
        
        console.log('⭐ RunPod processing complete:', data);
        
        // Handle successful response
        if (data && data.image) {
          if (progressBar) progressBar.style.width = '100%';
          if (progressText) progressText.textContent = 'Complete!';
          
          // Hide loading popup
          if (loadingPopup) {
            loadingPopup.style.display = 'none';
          }
          
          // Store the processed image URL
          const processedImageUrl = data.image;
          
          // Update product images if available
          const productImages = document.querySelectorAll('.product-gallery img, .product__media img, .product__media-item img');
          if (productImages.length > 0) {
            productImages.forEach(img => {
              img.src = processedImageUrl;
              // Clear srcset to ensure our processed image is shown
              if (img.srcset) {
                img.srcset = '';
              }
            });
          }
          
          // Dispatch the transform complete event
          document.dispatchEvent(new CustomEvent('pixar-transform-complete', {
            detail: {
              imageUrl: processedImageUrl,
              timestamp: Date.now()
            }
          }));
          
          // Dispatch RunPod processing complete event specifically for the adapter
          document.dispatchEvent(new CustomEvent('runpod-processing-complete', {
            detail: {
              imageUrl: processedImageUrl,
              timestamp: Date.now()
            }
          }));
          
          // Mark upload as complete
          window.pixarTransformComplete = true;
          
          // Store processed image URL globally for form submission
          window.processedImageUrl = processedImageUrl;
          
          // Update upload button text if available
          const uploadContainer = document.getElementById('direct-pixar-loader-container');
          if (uploadContainer) {
            const uploadButton = uploadContainer.querySelector('button');
            if (uploadButton) {
              uploadButton.textContent = '✅ IMAGE UPLOADED - READY TO ADD TO CART';
              uploadButton.style.backgroundColor = '#4CAF50';
            }
          }
          
          // If we're in Aurora theme, find the form and add hidden inputs
          const productForm = document.querySelector('form[action="/cart/add"], form[data-type="add-to-cart-form"]');
          if (productForm) {
            // Add hidden input for the processed image URL
            let hiddenInput = productForm.querySelector('input[name="properties[_processed_image_url]"]');
            if (!hiddenInput) {
              hiddenInput = document.createElement('input');
              hiddenInput.type = 'hidden';
              hiddenInput.name = 'properties[_processed_image_url]';
              productForm.appendChild(hiddenInput);
            }
            hiddenInput.value = processedImageUrl;
            
            // Mark the form as transformed
            productForm.dataset.pixarTransformed = 'true';
            productForm.dataset.pixarImageUrl = processedImageUrl;
            
            console.log('⭐ Updated form with processed image URL');
          }
        } else {
          throw new Error('Invalid response from server: No image URL received');
        }
      })
      .catch(error => {
        console.error('⭐ Error processing image:', error);
        
        // Update error display
        if (progressText) progressText.textContent = 'Error: ' + error.message;
        if (progressBar) progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#FF4444';
        
        // Update error message in popup
        const errorElement = document.getElementById('pixar-error-message');
        if (errorElement) {
          errorElement.textContent = 'Error processing image: ' + error.message;
          errorElement.style.display = 'block';
        }
        
        // Dispatch error event
        document.dispatchEvent(new CustomEvent('pixar-transform-error', {
          detail: {
            error: error.message,
            timestamp: Date.now()
          }
        }));
      });
    };
    
    reader.onerror = function(error) {
      console.error('⭐ Error reading file:', error);
      
      // Update error message
      if (progressText) progressText.textContent = 'Error reading file';
      
      // Update error message in popup
      const errorElement = document.getElementById('pixar-error-message');
      if (errorElement) {
        errorElement.textContent = 'Error reading file. Please try again with a different image.';
        errorElement.style.display = 'block';
      }
      
      // Dispatch error event
      document.dispatchEvent(new CustomEvent('pixar-transform-error', {
        detail: {
          error: 'Error reading file',
          timestamp: Date.now()
        }
      }));
    };
    
    // Start reading the file
    reader.readAsDataURL(file);
  }

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check for and create instructions popup
    checkForInstructionsPopup();
    
    // Only run on product pages with the with-faceswap template
    if (!window.location.pathname.includes('/products/')) {
      console.log('⭐ Not a product page, skipping direct loader');
      return;
    }

    // Check if we're on a faceswap product page
    let isFaceswapProduct = false;
    
    // Method 1: Check body classes
    const bodyClasses = document.body.className.split(' ');
    for (const cls of bodyClasses) {
      if (cls.includes('template--product') && cls.includes('with-faceswap')) {
        isFaceswapProduct = true;
        break;
      }
    }
    
    // Method 2: Check URL
    if (window.location.pathname.includes('pixar') || 
        window.location.pathname.includes('face') || 
        window.location.search.includes('faceswap')) {
      isFaceswapProduct = true;
    }
    
    // Method 3: Check metafields directly
    const metaTags = document.querySelectorAll('meta[property^="product:"]');
    if (metaTags.length > 0) {
      isFaceswapProduct = true; // If it has product meta tags, assume it's a product page
    }

    console.log('⭐ Is faceswap product:', isFaceswapProduct);

    // Don't continue if not a faceswap product
    if (!isFaceswapProduct && !window.forceFaceswapLoader) {
      console.log('⭐ Not a faceswap product, skipping direct loader');
      return;
    }

    // Try to find existing component first
    let pixarComponent = document.querySelector('pixar-transform-file-input');
    
    if (pixarComponent) {
      console.log('⭐ Pixar component already exists, registering it globally');
      window.pixarComponentReady = true;
      window.pixarComponent = pixarComponent;
      
      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('pixar-component-ready', {
        detail: { component: pixarComponent }
      }));
      
      // Set up form interception
      setupFormInterception();
      
      return;
    }

    console.log('⭐ No existing component found, creating one directly');

    // Get product information
    const productInfo = {
      id: null,
      variantId: null,
      sectionId: 'direct-loader-' + Date.now()
    };
    
    // Try to get product ID from URL
    const urlParts = window.location.pathname.split('/');
    const productIndex = urlParts.indexOf('products');
    if (productIndex !== -1 && urlParts.length > productIndex + 1) {
      // Assume it's /products/product-handle
      const productHandle = urlParts[productIndex + 1];
      console.log('⭐ Product handle from URL:', productHandle);
      
      // Try to find product ID from meta tags
      const metaTags = document.querySelectorAll('meta[property="og:product_id"]');
      if (metaTags.length > 0) {
        productInfo.id = metaTags[0].content;
        console.log('⭐ Product ID from meta tags:', productInfo.id);
      }
      
      // Try to find variant ID from URL or element
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('variant')) {
        productInfo.variantId = urlParams.get('variant');
        console.log('⭐ Variant ID from URL:', productInfo.variantId);
      } else {
        // Try to find variant ID from form
        const variantInput = document.querySelector('form[action="/cart/add"] input[name="id"]');
        if (variantInput) {
          productInfo.variantId = variantInput.value;
          console.log('⭐ Variant ID from form:', productInfo.variantId);
        }
      }
    }
    
    // If we couldn't get the product info, don't continue
    if (!productInfo.id && !productInfo.variantId) {
      console.log('⭐ Could not determine product ID or variant ID, skipping');
      console.log('⭐ Will try a more direct approach');
      
      // Try to get from existing product variable
      if (window.product) {
        productInfo.id = window.product.id;
        productInfo.variantId = window.product.variants[0].id;
        console.log('⭐ Found product info from window.product:', productInfo);
      }
    }

    // Create upload container if needed
    let uploadContainer = document.getElementById('direct-pixar-loader-container');
    
    if (!uploadContainer) {
      uploadContainer = document.createElement('div');
      uploadContainer.id = 'direct-pixar-loader-container';
      uploadContainer.style.margin = '20px 0';
      uploadContainer.style.padding = '15px';
      uploadContainer.style.border = '1px solid #ddd';
      uploadContainer.style.borderRadius = '4px';
      
      // Create title
      const title = document.createElement('h3');
      title.textContent = 'Upload Your Photo';
      title.style.marginTop = '0';
      uploadContainer.appendChild(title);
      
      // Create component container
      const componentContainer = document.createElement('div');
      componentContainer.id = 'direct-pixar-component-container';
      componentContainer.style.minHeight = '50px';
      uploadContainer.appendChild(componentContainer);
      
      // Create upload button
      const uploadButton = document.createElement('button');
      uploadButton.textContent = '📸 UPLOAD YOUR PHOTO FIRST';
      uploadButton.style.display = 'block';
      uploadButton.style.width = '100%';
      uploadButton.style.padding = '15px 25px';
      uploadButton.style.marginTop = '15px';
      uploadButton.style.backgroundColor = '#4a7dbd';
      uploadButton.style.color = 'white';
      uploadButton.style.border = 'none';
      uploadButton.style.borderRadius = '4px';
      uploadButton.style.fontSize = '16px';
      uploadButton.style.fontWeight = 'bold';
      uploadButton.style.cursor = 'pointer';
      
      uploadButton.addEventListener('click', function() {
        console.log('⭐ Upload button clicked');
        
        // Check for and ensure instructions popup exists
        checkForInstructionsPopup();
        
        // Find instructions popup first - this is the primary approach we want
        const instructionsPopup = document.getElementById('pixar-instructions-popup');
        if (instructionsPopup) {
          console.log('⭐ Found instructions popup, showing it first');
          instructionsPopup.style.display = 'block';
          document.body.style.overflow = 'hidden';
          return;
        }
        
        // If no instructions popup, try component methods as fallback
        const component = window.pixarComponent || document.querySelector('pixar-transform-file-input');
        if (component) {
          // Use proper popup flow if available
          if (typeof component.openPopup === 'function') {
            console.log('⭐ Using component\'s native openPopup method');
            component.openPopup();
            return;
          }
          
          // Fall back to original popup if enhanced not found
          const popup = document.querySelector('.file-input-wrapper__popup');
          if (popup) {
            console.log('⭐ Found original popup element, showing it directly');
            popup.style.display = 'block';
            popup.style.visibility = 'visible';
            popup.style.opacity = '1';
            return;
          }
        }
        
        // If absolutely nothing else works, show a message
        console.log('⭐ Could not display popup - please check implementation');
        alert('Please refresh the page and try again. If the issue persists, contact support.');
      });
      
      uploadContainer.appendChild(uploadButton);
      
      // Add to page before the add to cart button
      const addToCartButton = document.querySelector('form[action="/cart/add"] button[type="submit"]');
      if (addToCartButton) {
        const addToCartParent = addToCartButton.closest('.buy-buttons') || addToCartButton.parentElement;
        if (addToCartParent) {
          addToCartParent.parentElement.insertBefore(uploadContainer, addToCartParent);
          console.log('⭐ Upload container inserted before add to cart button');
        } else {
          // Fallback: add to product form
          const productForm = document.querySelector('form[action="/cart/add"]');
          if (productForm) {
            productForm.insertBefore(uploadContainer, productForm.firstChild);
            console.log('⭐ Upload container inserted at beginning of product form');
          } else {
            // Last resort: add to product section
            const productSection = document.querySelector('section.product');
            if (productSection) {
              productSection.appendChild(uploadContainer);
              console.log('⭐ Upload container appended to product section');
            } else {
              // Very last resort: add to main content
              const mainContent = document.getElementById('MainContent');
              if (mainContent) {
                mainContent.appendChild(uploadContainer);
                console.log('⭐ Upload container appended to main content');
              } else {
                console.log('⭐ Could not find a place to insert upload container');
              }
            }
          }
        }
      } else {
        console.log('⭐ Could not find add to cart button');
      }
    }

    // Create Pixar component
    pixarComponent = document.createElement('pixar-transform-file-input');
    pixarComponent.setAttribute('data-section-id', productInfo.sectionId);
    
    if (productInfo.id) {
      pixarComponent.setAttribute('data-product-id', productInfo.id);
    }
    
    if (productInfo.variantId) {
      pixarComponent.setAttribute('data-product-variant-id', productInfo.variantId);
    }
    
    pixarComponent.setAttribute('class', 'file-input-wrapper');
    
    // Add to container
    const componentContainer = document.getElementById('direct-pixar-component-container');
    if (componentContainer) {
      componentContainer.innerHTML = '';
      componentContainer.appendChild(pixarComponent);
      console.log('⭐ Pixar component created and added to container');
      
      // Register component globally
      window.pixarComponentReady = true;
      window.pixarComponent = pixarComponent;
      
      // Override openPopup method to ensure we always have an instructions popup
      const originalOpenPopup = pixarComponent.openPopup;
      pixarComponent.openPopup = function() {
        console.log('⭐ Enhanced openPopup method called');
        
        // Ensure instructions popup exists
        checkForInstructionsPopup();
        
        // Show our instructions popup
        const instructionsPopup = document.getElementById('pixar-instructions-popup');
        if (instructionsPopup) {
          instructionsPopup.style.display = 'block';
          document.body.style.overflow = 'hidden';
        } else {
          console.log('⭐ Failed to find or create instructions popup');
          // Fall back to original method
          if (typeof originalOpenPopup === 'function') {
            originalOpenPopup.call(this);
          }
        }
      };
      
      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('pixar-component-ready', {
        detail: { component: pixarComponent }
      }));
    } else {
      console.log('⭐ Could not find component container');
    }
    
    // Set up form interception at the end
    setupFormInterception();
    
    console.log('⭐ Direct Pixar Component Loader initialized successfully');
  });
  
  /**
   * Find the add to cart form
   */
  function findAddToCartForm() {
    // Try multiple selectors to support both Aurora and other themes
    const formSelectors = [
      'form[action="/cart/add"]', 
      'form[data-type="add-to-cart-form"]',
      'form.product-form'
    ];
    
    for (const selector of formSelectors) {
      const form = document.querySelector(selector);
      if (form) {
        console.log('⭐ Found add to cart form with selector:', selector);
        return form;
      }
    }
    
    console.log('⭐ Could not find add to cart form with any selector');
    return null;
  }
  
  /**
   * Set up interception of form submission to ensure image is transformed
   */
  function setupFormInterception() {
    const form = findAddToCartForm();
    if (!form) {
      console.log('⭐ Could not find add to cart form');
      return;
    }
    
    console.log('⭐ Setting up form interception');
    
    // Listen for form submission
    form.addEventListener('submit', function(event) {
      // Check if we have a processed image URL
      if (!window.processedImageUrl && !form.dataset.pixarTransformed) {
        // Check if there's a loading popup visible
        const loadingPopup = document.getElementById('pixar-loading-popup');
        if (loadingPopup && loadingPopup.style.display === 'block') {
          console.log('⭐ Processing in progress, preventing form submission');
          event.preventDefault();
          alert('Please wait for image processing to complete before adding to cart.');
          return;
        }
        
        // Open the file dialog 
        console.log('⭐ No processed image, preventing form submission');
        event.preventDefault();
        
        // Show alert to instruct user
        alert('Please upload and transform your image before adding to cart.');
        
        // Open popup or click upload button
        const uploadButton = document.getElementById('pixar-upload-button');
        if (uploadButton) {
          uploadButton.click();
        }
        return;
      }
      
      // If we have a processed image URL but no hidden input, add one
      if (window.processedImageUrl) {
        let hiddenInput = form.querySelector('input[name="properties[_processed_image_url]"]');
        if (!hiddenInput) {
          hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'properties[_processed_image_url]';
          form.appendChild(hiddenInput);
        }
        hiddenInput.value = window.processedImageUrl;
        
        console.log('⭐ Added processed image URL to form:', window.processedImageUrl);
      }
      
      console.log('⭐ Form submission allowed with transformed image');
    });
    
    console.log('⭐ Form interception setup complete');
  }
})(); 