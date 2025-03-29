/**
 * Result Popup Manager
 * 
 * This module manages the final result popup that displays the processed image
 * and lets users select a size before adding to cart.
 */

class ResultPopupManager {
  constructor() {
    // State variables
    this.resultPopupShown = false;
    this.resultImageUrl = null;
    this.selectedSize = 'S'; // Default selected size
    
    // Size aspect ratios
    this.sizeAspectRatios = {
      'S': 20/30, // 20x30"
      'M': 30/40, // 30x40"
      'L': 50/70  // 50x70"
    };
    
    // Variant IDs for each size
    this.variantIds = {
      'S': '54215893451100',  // Shopify variant ID for size S
      'M': '54215893483868',  // Shopify variant ID for size M
      'L': '54215893516636'   // Shopify variant ID for size L
    };
    
    // Detect template type - pixar or face-swap
    this.templateType = this.detectTemplateType();
    console.log(`Detected template type: ${this.templateType}`);
    
    // Make this instance globally available
    window.resultPopupManager = this;
    
    console.log('Result Popup Manager initialized');
  }
  
  /**
   * Detect whether we're on a pixar or face-swap template page
   */
  detectTemplateType() {
    if (document.body.classList.contains('template-product--with-faceswap')) {
      return 'face-swap';
    }
    
    // Look for face-swap elements in the DOM
    if (document.querySelector('face-swap-file-input-wrapper')) {
      return 'face-swap';
    }
    
    // Look for pixar transform elements
    if (document.querySelector('pixar-transform-file-input')) {
      return 'pixar';
    }
    
    // Check URL parameters and template values in page metadata
    if (window.location.search.includes('faceswap') || 
        document.querySelector('meta[property="og:template"]')?.content?.includes('faceswap')) {
      return 'face-swap';
    }
    
    // Default to pixar template
    return 'pixar';
  }
  
  /**
   * Show the result popup with the processed image
   */
  showResultPopup(imageUrl) {
    console.log('RESULT POPUP: Showing result popup with image:', imageUrl);
    
    // Prevent showing multiple times
    if (this.resultPopupShown) {
      console.log('RESULT POPUP: Already shown, not showing again');
      return;
    }
    
    this.resultPopupShown = true;
    
    // Store the original image URL for aspect ratio adjustments
    this.resultImageUrl = imageUrl;
    
    // Check if popup already exists
    let resultPopup = document.getElementById('pixar-result-popup');
    
    // Create the popup if it doesn't exist
    if (!resultPopup) {
      // Create the standard popup
      resultPopup = document.createElement('div');
      resultPopup.id = 'pixar-result-popup';
      resultPopup.style.cssText = `
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
      
      // Add content to the result popup
      resultPopup.innerHTML = `
        <div style="position: relative; max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; height: calc(100vh - 40px); max-height: 800px;">
          <div id="pixar-result-image-container" style="flex: 1; min-height: 0; margin: 0 auto; width: 100%; max-width: 400px; position: relative; display: flex; align-items: center; justify-content: center; padding: 10px;">
            <div id="pixar-image-shadow" style="position: absolute; top: 15px; left: 15px; right: 15px; bottom: 5px; border-radius: 8px; background: #f5f5f5; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 0;"></div>
            <img id="pixar-result-image" src="" alt="Processed image" style="position: relative; z-index: 1; max-width: 100%; max-height: 100%; display: block; object-fit: contain; transition: all 0.3s ease-in-out; border-radius: 8px; background: white;">
            <div id="pixar-result-image-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; z-index: 2;"></div>
          </div>
          
          <!-- Fixed position controls container -->
          <div style="flex-shrink: 0; margin-top: 15px;">
            <!-- Size selection menu -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin: 0 auto; max-width: 90%;">
                <!-- Size S -->
                <div data-size="S" style="flex: 1; margin: 0 5px; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; background-color: #f0f5fb; transition: all 0.2s ease-in-out;">
                  <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: bold; font-size: 18px;">S</div>
                  <div style="font-weight: bold; margin-top: 5px; font-size: 16px;">$85</div>
                  <div style="font-size: 12px; color: #000000; margin-top: 3px;">20x30"</div>
                </div>
                
                <!-- Size M -->
                <div data-size="M" style="flex: 1; margin: 0 5px; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; transition: all 0.2s ease-in-out;">
                  <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: bold; font-size: 18px;">M</div>
                  <div style="font-weight: bold; margin-top: 5px; font-size: 16px;">$130</div>
                  <div style="font-size: 12px; color: #000000; margin-top: 3px;">30x40"</div>
                </div>
                
                <!-- Size L -->
                <div data-size="L" style="flex: 1; margin: 0 5px; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; transition: all 0.2s ease-in-out;">
                  <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: bold; font-size: 18px;">L</div>
                  <div style="font-weight: bold; margin-top: 5px; font-size: 16px;">$190</div>
                  <div style="font-size: 12px; color: #000000; margin-top: 3px;">50x70"</div>
                </div>
              </div>
              
              <h4 style="text-align: center; font-size: 16px; margin-top: 10px; margin-bottom: 5px; color: #000000; font-weight: bold; text-transform: uppercase;">Choose the size</h4>
              
              <div style="text-align: center; margin-top: 5px;">
                <a href="#" style="color: #4A7DBD; text-decoration: underline; font-size: 12px;">Size guide</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
              <button id="pixar-result-continue" style="background-color: #4A7DBD; color: white; padding: 12px 25px; font-size: 16px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; margin: 0 10px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: background-color 0.2s ease-in-out;">CONTINUE</button>
            </div>
          </div>
        </div>
      `;
      
      // Add the popup to the document body
      document.body.appendChild(resultPopup);
      
      // Add event listeners for size buttons first
      const sizeOptions = resultPopup.querySelectorAll('[data-size]');
      sizeOptions.forEach(option => {
        // Add hover effect for size options
        option.addEventListener('mouseenter', () => {
          if (option.getAttribute('data-size') !== this.selectedSize) {
            option.style.backgroundColor = '#f8f8f8';
            option.style.transform = 'translateY(-2px)';
          }
        });
        
        option.addEventListener('mouseleave', () => {
          if (option.getAttribute('data-size') !== this.selectedSize) {
            option.style.backgroundColor = '';
            option.style.transform = 'translateY(0)';
          }
        });
        
        option.addEventListener('click', () => {
          // Get the selected size
          const size = option.getAttribute('data-size');
          
          // If same size is clicked, do nothing
          if (this.selectedSize === size) return;
          
          // Store previous size for transition
          const previousSize = this.selectedSize;
          this.selectedSize = size;
          
          // Remove highlight from all options
          sizeOptions.forEach(opt => {
            opt.style.backgroundColor = '';
            opt.style.transform = 'translateY(0)';
            opt.style.boxShadow = 'none';
          });
          
          // Highlight selected option
          option.style.backgroundColor = '#f0f5fb';
          option.style.transform = 'translateY(-2px)';
          option.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
          
          // Apply the appropriate aspect ratio to the image with animation
          this.applyAspectRatioToResultImage(size, previousSize);
        });
      });
      
      // Add event listener for the continue button
      const continueButton = document.getElementById('pixar-result-continue');
      if (continueButton) {
        // Add click event listener
        continueButton.addEventListener('click', (event) => {
          // Prevent default action
          event.preventDefault();
          
          // Show loading animation immediately when clicked
          const button = event.currentTarget;
          const originalButtonText = button.textContent;
          button.textContent = 'Adding to cart...';
          button.disabled = true;
          button.classList.add('loading');
          
          // Update the text shown on the popup to indicate cart redirection
          const imageContainer = document.getElementById('pixar-result-image-container');
          if (imageContainer) {
            // Create status message if it doesn't exist
            let statusMessage = document.getElementById('pixar-cart-status');
            if (!statusMessage) {
              statusMessage = document.createElement('div');
              statusMessage.id = 'pixar-cart-status';
              statusMessage.style.cssText = `
                position: absolute;
                bottom: 10px;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px;
                text-align: center;
                font-weight: bold;
                border-radius: 0 0 8px 8px;
                z-index: 10;
              `;
              imageContainer.appendChild(statusMessage);
            }
            statusMessage.textContent = 'Adding to cart... You will be redirected shortly';
          }
          
          // Add loading spinner style if not already present
          if (!document.querySelector('#pixar-loading-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'pixar-loading-spinner-style';
            style.textContent = `
              .pixar-continue-button.loading,
              #pixar-result-continue.loading {
                position: relative;
                color: transparent !important;
                transition: background-color 0.3s ease;
              }
              .pixar-continue-button.loading::after,
              #pixar-result-continue.loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 24px;
                height: 24px;
                margin: -12px 0 0 -12px;
                border-radius: 50%;
                border: 3px solid rgba(255, 255, 255, 0.8);
                border-top-color: transparent;
                animation: pixar-spinner 0.8s linear infinite;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
              }
              @keyframes pixar-spinner {
                to {transform: rotate(360deg);}
              }
              /* Second animation for pulse effect */
              .pixar-continue-button.loading,
              #pixar-result-continue.loading {
                animation: pixar-pulse 2s infinite ease-in-out;
              }
              @keyframes pixar-pulse {
                0% { background-color: var(--original-bg, #4a7dbd); }
                50% { background-color: var(--pulse-bg, #3a6dad); }
                100% { background-color: var(--original-bg, #4a7dbd); }
              }
            `;
            document.head.appendChild(style);
            
            // Cache the original background color for pulse animation
            const computedStyle = window.getComputedStyle(button);
            const originalBg = computedStyle.backgroundColor;
            document.documentElement.style.setProperty('--original-bg', originalBg);
            document.documentElement.style.setProperty('--pulse-bg', this.adjustColor(originalBg, -20));
          }
          
          // Disable size buttons during the transition
          const popup = document.getElementById('pixar-result-popup');
          const sizeButtons = popup.querySelectorAll('[data-size]');
          sizeButtons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';
          });
          
          // Update message to indicate cart redirection is happening
          console.log(`Continue clicked with size ${this.selectedSize || 'S'} selected, redirecting to checkout`);
          
          // Flag to indicate we're in the process of redirecting to cart
          localStorage.setItem('cartoonique_redirecting_to_cart', 'true');
          localStorage.setItem('cartoonique_preload_cart_images', 'true');
          
          // Redirect to checkout with the selected size
          this.redirectToCheckout(this.selectedSize || 'S');
        });
        
        // Add hover effect for continue button
        continueButton.addEventListener('mouseenter', () => {
          if (!continueButton.classList.contains('loading')) {
            continueButton.style.backgroundColor = '#3a6dad';
          }
        });
        
        continueButton.addEventListener('mouseleave', () => {
          if (!continueButton.classList.contains('loading')) {
            continueButton.style.backgroundColor = '#4a7dbd';
          }
        });
      }
      
      // Set the image source
      const resultImage = document.getElementById('pixar-result-image');
      if (resultImage) {
        resultImage.src = imageUrl;
        
        // When the image is loaded, apply the default aspect ratio (Size S)
        resultImage.onload = () => {
          this.applyAspectRatioToResultImage(this.selectedSize);
        };
      }
      
      // Display the popup
      resultPopup.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Adjust for mobile view if needed
      this.adjustPopupForMobile();
      
      // If we're on a face-swap template, also update the product gallery with the image
      if (this.templateType === 'face-swap') {
        this.updateProductGalleryForFaceSwap(imageUrl);
      }
    }
  }
  
  /**
   * Update the product gallery image for face-swap template
   */
  updateProductGalleryForFaceSwap(imageUrl) {
    if (!imageUrl) return;
    
    console.log('Updating product gallery for face-swap template with image:', imageUrl);
    
    // Find all relevant image elements that need updating
    const imagesToUpdate = [
      // Main product image
      document.querySelector('.product__media-item.is-active img'),
      document.querySelector('.product-gallery__media.is-selected img'),
      document.querySelector('.product-gallery__media.snap-center img'),
      document.querySelector('.product-gallery__media img'),
      document.querySelector('.product-gallery img'),
      document.querySelector('.product__media img'),
      
      // Thumbnails
      ...Array.from(document.querySelectorAll('.product-gallery__thumbnail img')),
    ].filter(Boolean); // Remove null/undefined entries
    
    // Update each image found
    if (imagesToUpdate.length > 0) {
      imagesToUpdate.forEach(img => {
        // Save original src for potential restoration
        if (!img.dataset.originalSrc) {
          img.dataset.originalSrc = img.src;
        }
        
        // Update the image src
        img.src = imageUrl;
        
        // Try to update srcset if it exists
        if (img.srcset) {
          img.srcset = imageUrl;
        }
      });
      
      console.log(`Updated ${imagesToUpdate.length} product images with transformed design`);
    } else {
      console.warn('Could not find any product images to update');
      
      // Fallback approach - query all images and look for ones that might be product-related
      const allImages = document.querySelectorAll('img');
      let updatedCount = 0;
      
      allImages.forEach(img => {
        const src = img.src || '';
        // Only update images that appear to be product-related
        if ((src.includes('product') || src.includes('files/')) && 
            !img.closest('#pixar-result-image-container') && 
            !img.closest('[data-result-wrapper]')) {
          
          // Save original src for potential restoration
          if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.src;
          }
          
          // Update the image src
          img.src = imageUrl;
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        console.log(`Fallback approach: Updated ${updatedCount} potential product images`);
      }
    }
    
    // Hide any result wrappers to prevent duplicate images
    const resultWrappers = document.querySelectorAll('[data-result-wrapper], .result-wrapper');
    resultWrappers.forEach(wrapper => {
      wrapper.style.display = 'none';
    });
  }
  
  /**
   * Adjust popup layout for mobile devices
   */
  adjustPopupForMobile() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      const popup = document.getElementById('pixar-result-popup');
      if (popup) {
        const popupContent = popup.querySelector('div');
        if (popupContent) {
          popupContent.style.margin = '0 auto';
          popupContent.style.maxWidth = '100%';
          popupContent.style.borderRadius = '0';
          popupContent.style.height = '100%';
        }
      }
    }
  }
  
  /**
   * Apply the appropriate aspect ratio to the result image
   */
  applyAspectRatioToResultImage(size, previousSize) {
    // Get the aspect ratio for the selected size
    const aspectRatio = this.sizeAspectRatios[size];
    if (!aspectRatio) return;
    
    console.log(`Applying aspect ratio ${aspectRatio} for size ${size}`);
    
    // Get the image element and container
    const image = document.getElementById('pixar-result-image');
    const container = document.getElementById('pixar-result-image-container');
    const shadow = document.getElementById('pixar-image-shadow');
    if (!image || !container) return;

    // Set container's aspect ratio while maintaining flexibility
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.background = 'transparent';
    
    // Create canvas to maintain aspect ratio
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Determine the canvas dimensions based on the desired aspect ratio
      let canvasWidth, canvasHeight;
      
      // Calculate canvas dimensions
      if (img.width / img.height > aspectRatio) {
        // Image is wider than target ratio, crop width
        canvasHeight = img.height;
        canvasWidth = img.height * aspectRatio;
      } else {
        // Image is taller than target ratio, crop height
        canvasWidth = img.width;
        canvasHeight = img.width / aspectRatio;
      }
      
      // Set canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Draw the image onto the canvas with the center crop
      const ctx = canvas.getContext('2d');
      
      // Fill with transparent background
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      const offsetX = (img.width - canvasWidth) / 2;
      const offsetY = (img.height - canvasHeight) / 2;
      
      // Draw the portion of the image that fits the aspect ratio
      ctx.drawImage(
        img,
        offsetX, offsetY, canvasWidth, canvasHeight,  // Source rectangle
        0, 0, canvasWidth, canvasHeight              // Destination rectangle
      );
      
      // Replace the image src with the canvas data
      image.src = canvas.toDataURL('image/png');
      
      // Adjust shadow to match image dimensions once loaded
      image.onload = () => {
        this.adjustShadowToImage(image, shadow);
      };
      
      // Adjust container to maintain the aspect ratio without affecting layout
      image.style.maxWidth = '100%';
      image.style.maxHeight = '100%';
      image.style.objectFit = 'contain';
      image.style.borderRadius = '8px';
    };
    
    img.src = this.resultImageUrl || image.src;
  }
  
  /**
   * Adjust the shadow to match the image dimensions
   */
  adjustShadowToImage(image, shadow) {
    if (!image || !shadow) return;
    
    // We need to wait for the image to be fully rendered to get its displayed dimensions
    setTimeout(() => {
      // Get the actual displayed dimensions of the image
      const rect = image.getBoundingClientRect();
      const displayedWidth = rect.width;
      const displayedHeight = rect.height;
      
      // Adjust the shadow to match the image size with a slight offset
      shadow.style.width = `${displayedWidth}px`;
      shadow.style.height = `${displayedHeight}px`;
      shadow.style.top = '10px';
      shadow.style.left = '50%';
      shadow.style.transform = 'translateX(-50%)';
      shadow.style.borderRadius = '8px';
    }, 50); // Small delay to ensure image is rendered
  }
  
  /**
   * Adjust a color's brightness
   */
  adjustColor(color, amount) {
    // Handle different color formats
    let r, g, b;
    
    if (color.startsWith('rgb')) {
      // Parse RGB format
      const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (rgbMatch) {
        r = parseInt(rgbMatch[1]);
        g = parseInt(rgbMatch[2]);
        b = parseInt(rgbMatch[3]);
      } else {
        return color; // Can't parse, return original
      }
    } else if (color.startsWith('#')) {
      // Parse hex format
      const hex = color.substring(1);
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    } else {
      return color; // Unsupported format, return original
    }
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  /**
   * Redirect to checkout with the selected size
   */
  redirectToCheckout(size) {
    console.log('Adding to cart with size:', size);
    
    // Get the variant ID for the selected size
    const variantId = this.variantIds[size];
    
    if (!variantId) {
      console.error('Invalid size selected:', size);
      return;
    }
    
    // Get the processed image URL
    let processedImageUrl = this.resultImageUrl;
    console.log('Found image from resultImageUrl:', processedImageUrl ? 'yes' : 'no');
    
    // If not found, try to get it from the DOM
    if (!processedImageUrl) {
      const resultImage = document.getElementById('pixar-result-image');
      if (resultImage && resultImage.src) {
        processedImageUrl = resultImage.src;
      }
    }
    
    if (!processedImageUrl) {
      console.error('No processed image found - will attempt to continue anyway');
      processedImageUrl = '';
    }
    
    // Store the image safely
    this.storeImageSafely(variantId, processedImageUrl);
    
    // Direct redirect function without an iframe
    const redirectToCart = () => {
      console.log('Executing immediate redirect to cart...');
      
      try {
        // Make sure we have the image in window memory
        if (!window.cartoonique_memory_images) {
          window.cartoonique_memory_images = {};
        }
        
        // Store the image in memory
        if (processedImageUrl) {
          window.cartoonique_memory_images[variantId] = processedImageUrl;
        }
        
        // Create navigation data with the actual image
        const navigationData = {
          timestamp: Date.now(),
          imageUrl: processedImageUrl,
          variantId: variantId,
          size: size
        };
        
        localStorage.setItem('cartoonique_navigating_to_cart', 'true');
        localStorage.setItem('cartoonique_cart_navigation_time', Date.now().toString());
        
        // Store navigation data directly
        try {
          localStorage.setItem('cartoonique_navigation_data', JSON.stringify(navigationData));
        } catch(e) {
          console.warn('Unable to store navigation data:', e);
        }
        
        // Try to use sessionStorage with a unique key for direct URL parameter passing
        try {
          // Create a unique blob key
          const blobKey = 'cartoonique_blob_' + Date.now();
          // Store the image data with this key
          sessionStorage.setItem(blobKey, processedImageUrl);
          // Use URL parameters to pass both the variant ID and the blob key
          window.location.href = `/cart?variant_id=${variantId}&blob_key=${blobKey}&t=${Date.now()}`;
          return;
        } catch(e) {
          console.warn('Failed to use sessionStorage for image passing:', e);
        }
      } catch (e) {
        console.error('Error setting navigation flags:', e);
      }
      
      // Fallback: The original navigation method if the above fails
      window.location.href = '/cart?nocache=' + Date.now();
    };
    
    // Simple cart addition data
    const formDataSimple = {
      'items': [{
        'id': variantId,
        'quantity': 1
      }]
    };
    
    // Add to cart via API
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formDataSimple)
    })
    .then(response => {
      if (!response.ok) {
        console.error('Cart addition error with status:', response.status);
        return response.text().then(text => {
          console.error('Error response:', text);
          throw new Error('Network response was not ok: ' + response.statusText);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Successfully added to cart:', data);
      redirectToCart();
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      
      // Reset the button state on error
      const continueButton = document.getElementById('pixar-result-continue');
      if (continueButton) {
        continueButton.textContent = 'Continue';
        continueButton.disabled = false;
        continueButton.classList.remove('loading');
      }
      
      // Re-enable size buttons
      const sizeButtons = document.querySelectorAll('[data-size]');
      if (sizeButtons) {
        sizeButtons.forEach(button => {
          button.disabled = false;
        });
      }
      
      // Try with a direct form submission as last resort
      const form = document.createElement('form');
      form.method = 'post';
      form.action = '/cart/add';
      
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'id';
      idInput.value = variantId;
      
      const quantityInput = document.createElement('input');
      quantityInput.type = 'hidden';
      quantityInput.name = 'quantity';
      quantityInput.value = '1';
      
      form.appendChild(idInput);
      form.appendChild(quantityInput);
      document.body.appendChild(form);
      
      // Show a message before submitting
      const errorMessage = document.createElement('div');
      errorMessage.className = 'pixar-error-message';
      errorMessage.style.color = 'orange';
      errorMessage.style.margin = '10px 0';
      errorMessage.style.textAlign = 'center';
      errorMessage.innerHTML = `
        Trying alternate method to add to cart...
      `;
      
      // Find an appropriate place to show the error
      const popup = document.getElementById('pixar-result-popup');
      const messageContainer = popup && popup.querySelector('.pixar-result-buttons') || 
                            popup && popup.querySelector('.pixar-result-controls');
      if (messageContainer) {
        messageContainer.appendChild(errorMessage);
      }
      
      // Submit the form after a short delay
      setTimeout(() => {
        form.submit();
      }, 1000);
    });
  }
  
  /**
   * Store the image safely to prevent quota errors
   */
  storeImageSafely(variantId, imageUrl) {
    try {
      // Always store the raw image data in window memory
      if (!window.cartoonique_memory_images) {
        window.cartoonique_memory_images = {};
      }
      window.cartoonique_memory_images[variantId] = imageUrl;
      console.log('Stored image in window memory for variant', variantId);
      
      // Try to store a reference in localStorage
      try {
        const cartImages = JSON.parse(localStorage.getItem('cartoonique_cart_images') || '{}');
        // Store just a reference to the memory image
        cartImages[variantId] = 'MEMORY_IMAGE:' + variantId;
        localStorage.setItem('cartoonique_cart_images', JSON.stringify(cartImages));
        
        // Also store navigation data for immediate use
        const navigationData = {
          timestamp: Date.now(),
          imageUrl: imageUrl,
          variantId: variantId
        };
        localStorage.setItem('cartoonique_navigation_data', JSON.stringify(navigationData));
      } catch (e) {
        console.warn('Could not store image reference in localStorage:', e);
      }
      
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }
}

// Initialize the ResultPopupManager when the script loads
document.addEventListener('DOMContentLoaded', () => {
  new ResultPopupManager();
});

// Export for direct use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultPopupManager;
} 