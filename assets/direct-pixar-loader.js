/**
 * Direct Pixar Component Loader
 * 
 * This script directly creates and initializes the Pixar transform component
 * regardless of the theme's rendering system. It serves as a fallback for
 * when the normal component loading fails.
 */

(function() {
  console.log('⭐ Direct Pixar Component Loader initializing...');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
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
        
        // Find component
        const component = window.pixarComponent || document.querySelector('pixar-transform-file-input');
        
        if (component) {
          // Use proper popup flow if available
          if (typeof component.openPopup === 'function') {
            console.log('⭐ Using component\'s native openPopup method');
            component.openPopup();
            return;
          }
          
          // Try to find and show enhanced popup first
          const instructionsPopup = document.getElementById('pixar-instructions-popup');
          if (instructionsPopup) {
            console.log('⭐ Found enhanced instructions popup, showing it');
            instructionsPopup.style.display = 'block';
            document.body.style.overflow = 'hidden';
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
        
        // Fallback to direct file input click
        const fileInput = document.querySelector('#direct-pixar-component-container input[type="file"]');
        if (fileInput) {
          console.log('⭐ Fallback: Clicking file input directly');
          fileInput.click();
        } else {
          console.log('⭐ No file input found');
        }
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
      
      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('pixar-component-ready', {
        detail: { component: pixarComponent }
      }));
    } else {
      console.log('⭐ Could not find component container');
    }
    
    // Set up form handling
    const productForm = document.querySelector('form[action="/cart/add"]');
    if (productForm) {
      console.log('⭐ Setting up form interception');
      
      // Track if an image has been uploaded
      window.pixarTransformComplete = false;
      
      // Listen for transform complete event
      document.addEventListener('pixar-transform-complete', function() {
        console.log('⭐ Transform complete event received');
        window.pixarTransformComplete = true;
        
        // Update upload button
        const uploadButton = uploadContainer.querySelector('button');
        if (uploadButton) {
          uploadButton.textContent = '✅ IMAGE UPLOADED - READY TO ADD TO CART';
          uploadButton.style.backgroundColor = '#4CAF50';
        }
      });
      
      // Intercept form submission
      productForm.addEventListener('submit', function(e) {
        if (!window.pixarTransformComplete) {
          console.log('⭐ Preventing form submission until image is uploaded');
          e.preventDefault();
          
          // Trigger file selection
          const fileInput = document.querySelector('#direct-pixar-component-container input[type="file"]');
          if (fileInput) {
            fileInput.click();
          } else {
            console.log('⭐ No file input found');
          }
          
          return false;
        } else {
          console.log('⭐ Image already uploaded, allowing form submission');
          return true;
        }
      }, true);
      
      console.log('⭐ Form interception set up');
    } else {
      console.log('⭐ Could not find product form');
    }
    
    console.log('⭐ Direct Pixar Component Loader initialized successfully');
  });
})(); 