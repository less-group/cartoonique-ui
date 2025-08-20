/**
 * CartManager.js
 * 
 * Manages cart functionality for the Shopify store.
 * Responsibilities include:
 * - Adding products to cart
 * - Redirecting to checkout
 * - Managing cart image replacements
 * - Handling variant selection
 */

class CartManager {
  constructor(options = {}) {
    // Configuration options with defaults
    this.options = {
      addToCartEndpoint: '/cart/add.js',
      cartEndpoint: '/cart.js',
      cartUpdateEndpoint: '/cart/update.js',
      cartChangeEndpoint: '/cart/change.js',
      redirectToCartPath: '/cart',
      checkoutPath: '/checkout',
      ...options
    };
    
    // Size and variant mapping
    this.sizeToVariantMap = {
      '30x40': null, // Will be populated dynamically
      '50x70': null  // Will be populated dynamically
    };
    
    // Reference to storage manager if provided
    this.storageManager = options.storageManager || null;
    
    // Initialize event listeners
    this.eventListeners = {};
    
    // Setup cart image replacement functionality
    this.setupCartImageReplacement();
    
    console.log('CartManager initialized');
  }
  
  /**
   * Set the variant IDs for different sizes
   * @param {Object} variantMap - Map of size keys to variant IDs
   */
  setVariantMapping(variantMap) {
    if (variantMap && typeof variantMap === 'object') {
      Object.assign(this.sizeToVariantMap, variantMap);
      console.log('Updated variant mapping:', this.sizeToVariantMap);
    }
  }
  
  /**
   * Get the variant ID for a specific size
   * @param {string} size - The size key (e.g., '30x40')
   * @returns {string|null} The variant ID or null if not found
   */
  getVariantIdForSize(size) {
    return this.sizeToVariantMap[size] || null;
  }
  
  /**
   * Add a product to the cart
   * @param {string} variantId - The variant ID to add
   * @param {number} quantity - The quantity to add (default: 1)
   * @param {Object} properties - Optional line item properties
   * @returns {Promise} A promise that resolves to the cart data
   */
  async addToCart(variantId, quantity = 1, properties = {}) {
    try {
      if (!variantId) {
        throw new Error('No variant ID provided');
      }
      
      console.log(`Adding product to cart: Variant ID ${variantId}, Quantity ${quantity}`);
      
      // Create the request data
      const data = {
        id: variantId,
        quantity: quantity
      };
      
      // Add properties if provided
      if (Object.keys(properties).length > 0) {
        data.properties = properties;
      }
      
      // Make the API request
      const response = await fetch(this.options.addToCartEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status} ${response.statusText}`);
      }
      
      const cartData = await response.json();
      
      console.log('Successfully added to cart:', cartData);
      
      // Dispatch added-to-cart event
      this.dispatchEvent('added-to-cart', {
        variantId,
        quantity,
        properties,
        cartData
      });
      
      return cartData;
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to add product to cart',
        variantId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Get the current cart data
   * @returns {Promise} A promise that resolves to the cart data
   */
  async getCart() {
    try {
      console.log('Fetching cart data');
      
      // Make the API request
      const response = await fetch(this.options.cartEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get cart: ${response.status} ${response.statusText}`);
      }
      
      const cartData = await response.json();
      
      console.log('Successfully fetched cart:', cartData);
      
      return cartData;
    } catch (error) {
      console.error('Error getting cart:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to get cart data',
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Update a line item in the cart
   * @param {string} lineItemKey - The key of the line item to update
   * @param {number} quantity - The new quantity
   * @returns {Promise} A promise that resolves to the updated cart data
   */
  async updateLineItem(lineItemKey, quantity) {
    try {
      console.log(`Updating line item: ${lineItemKey} to quantity ${quantity}`);
      
      // Create the request data
      const data = {
        updates: {
          [lineItemKey]: quantity
        }
      };
      
      // Make the API request
      const response = await fetch(this.options.cartUpdateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update cart: ${response.status} ${response.statusText}`);
      }
      
      const cartData = await response.json();
      
      console.log('Successfully updated cart:', cartData);
      
      // Dispatch line-item-updated event
      this.dispatchEvent('line-item-updated', {
        lineItemKey,
        quantity,
        cartData
      });
      
      return cartData;
    } catch (error) {
      console.error('Error updating line item:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to update line item',
        lineItemKey,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Redirect user to the cart page
   */
  redirectToCart() {
    console.log('Redirecting to cart');
    window.location.href = this.options.redirectToCartPath;
  }
  
  /**
   * Redirect user to checkout
   */
  redirectToCheckout() {
    console.log('Redirecting to checkout');
    window.location.href = this.options.checkoutPath;
  }
  
  /**
   * Add a product to cart and redirect to checkout
   * @param {string} size - The product size to add
   * @param {string} imageUrl - The custom image URL
   * @param {Object} additionalProperties - Any additional line item properties
   * @returns {Promise} A promise that resolves when the product is added
   */
  async addToCartAndRedirect(size, imageUrl, additionalProperties = {}) {
    try {
      // Get the variant ID for the selected size
      const variantId = this.getVariantIdForSize(size);
      
      if (!variantId) {
        throw new Error(`No variant ID found for size: ${size}`);
      }
      
      // Prepare properties with the image URL
      const properties = {
        _custom_image_url: imageUrl,
        ...additionalProperties
      };
      
      // If we have a storage manager, store the image
      if (this.storageManager && imageUrl) {
        try {
          // Store image with variant ID as the key
          await this.storeImageSafely(variantId, imageUrl);
        } catch (storageError) {
          console.error('Failed to store image in storage manager:', storageError);
          // Continue with checkout even if storage fails
        }
      }
      
      // Add to cart
      await this.addToCart(variantId, 1, properties);
      
      // Redirect to cart or checkout
      this.redirectToCart();
      
      return true;
    } catch (error) {
      console.error('Error in addToCartAndRedirect:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to add product to cart',
        size,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Store image safely using the storage manager
   * @param {string} variantId - The variant ID to use as key
   * @param {string} imageUrl - The image URL to store
   * @returns {Promise} A promise that resolves when the image is stored
   */
  async storeImageSafely(variantId, imageUrl) {
    if (!this.storageManager) {
      console.warn('No storage manager available for storing images');
      return;
    }
    
    try {
      console.log(`Storing image for variant ID: ${variantId}`);
      
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const imageBlob = await response.blob();
      
      // Convert blob to data URL for storage
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
      });
      
      // Store in the storage manager
      await this.storageManager.storeImage(variantId, {
        imageUrl: imageUrl,
        dataUrl: dataUrl,
        timestamp: Date.now()
      });
      
      console.log(`Successfully stored image for variant ID: ${variantId}`);
      
      return true;
    } catch (error) {
      console.error(`Error storing image for variant ID: ${variantId}`, error);
      throw error;
    }
  }
  
  /**
   * Setup cart image replacement functionality
   */
  setupCartImageReplacement() {
    // Wait for DOM content to be loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initCartImageReplacement());
    } else {
      this.initCartImageReplacement();
    }
    
    // Also listen for cart updates
    document.addEventListener('cart:refresh', () => this.initCartImageReplacement());
    document.addEventListener('cart:updated', () => this.initCartImageReplacement());
  }
  
  /**
   * Initialize cart image replacement
   */
  initCartImageReplacement() {
    // Check if we're on a cart page
    const cartItems = document.querySelectorAll('.cart-item, .line-item, .cart__item');
    
    if (cartItems.length === 0) return;
    
    console.log('Found cart items, initializing image replacement');
    
    // Look for cart items with custom images
    cartItems.forEach(async (item) => {
      // Find variant ID in the cart item
      const variantIdElement = item.querySelector('[data-variant-id], [name*="id"]');
      if (!variantIdElement) return;
      
      let variantId;
      
      if (variantIdElement.getAttribute('data-variant-id')) {
        variantId = variantIdElement.getAttribute('data-variant-id');
      } else if (variantIdElement.name && variantIdElement.name.includes('id')) {
        variantId = variantIdElement.value;
      }
      
      if (!variantId) return;
      
      // If we have a storage manager, try to get the custom image
      if (this.storageManager) {
        try {
          const imageData = await this.storageManager.getImage(variantId);
          
          if (imageData && (imageData.dataUrl || imageData.imageUrl)) {
            // Find the image element in the cart item
            const imageElement = item.querySelector('img');
            
            if (imageElement) {
              // Replace the image source
              const imageUrl = imageData.dataUrl || imageData.imageUrl;
              
              console.log(`Replacing cart image for variant ID: ${variantId}`);
              
              // Keep original image URL as a backup
              const originalSrc = imageElement.src;
              imageElement.setAttribute('data-original-src', originalSrc);
              
              // Set the new image
              imageElement.src = imageUrl;
              
              // Dispatch image-replaced event
              this.dispatchEvent('image-replaced', {
                variantId,
                element: imageElement,
                originalSrc,
                newSrc: imageUrl
              });
            }
          }
        } catch (error) {
          console.error(`Error replacing cart image for variant ID: ${variantId}`, error);
        }
      }
    });
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        listener => listener !== callback
      );
    }
  }
  
  /**
   * Dispatch an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  dispatchEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
    
    // Also dispatch as a DOM CustomEvent
    const customEvent = new CustomEvent(`cart-manager-${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartManager;
} else {
  window.CartManager = CartManager;
} 