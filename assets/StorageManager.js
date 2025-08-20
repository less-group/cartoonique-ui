/**
 * StorageManager.js
 * 
 * Manages persistent storage for processed images and data.
 * Responsibilities include:
 * - IndexedDB management for image storage
 * - Local storage for user preferences and metadata
 * - Session storage for temporary data
 * - Cleanup of old/stale data
 */

class StorageManager {
  constructor(options = {}) {
    // Configuration options with defaults
    this.options = {
      dbName: 'CartooniquePersistentStorage',
      dbVersion: 1,
      imageStoreName: 'processedImages',
      maxStorageAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      ...options
    };
    
    // Database connection
    this.db = null;
    
    // Initialize database
    this.initDatabase();
    
    // Setup cleanup routine
    this.setupCleanupRoutine();
    
    // Initialize event listeners
    this.eventListeners = {};
    
    console.log('StorageManager initialized');
  }
  
  /**
   * Initialize the IndexedDB database
   */
  async initDatabase() {
    try {
      if (!window.indexedDB) {
        console.error('IndexedDB not supported by this browser');
        this.dispatchEvent('error', {
          message: 'Your browser does not support the persistent storage required by this application.'
        });
        return;
      }
      
      const request = window.indexedDB.open(
        this.options.dbName,
        this.options.dbVersion
      );
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        this.dispatchEvent('error', {
          message: 'Failed to open storage database',
          error: event.target.error
        });
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for processed images if it doesn't exist
        if (!db.objectStoreNames.contains(this.options.imageStoreName)) {
          const store = db.createObjectStore(this.options.imageStoreName, {
            keyPath: 'id'
          });
          
          // Create indexes for faster lookups
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('variantId', 'variantId', { unique: false });
          
          console.log('Created image store in IndexedDB');
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Successfully opened IndexedDB database');
        
        // Dispatch database-ready event
        this.dispatchEvent('database-ready', {
          dbName: this.options.dbName
        });
      };
    } catch (error) {
      console.error('Error initializing database:', error);
      this.dispatchEvent('error', {
        message: 'Failed to initialize storage database',
        error: error.message
      });
    }
  }
  
  /**
   * Store an image in IndexedDB
   * @param {string} id - Unique identifier for the image
   * @param {Object} imageData - Object containing image data
   * @returns {Promise} A promise that resolves when the storage is complete
   */
  async storeImage(id, imageData) {
    if (!this.db) {
      await new Promise((resolve) => {
        const checkDb = () => {
          if (this.db) {
            resolve();
          } else {
            setTimeout(checkDb, 100);
          }
        };
        checkDb();
      });
    }
    
    try {
      if (!id) {
        throw new Error('No ID provided for image storage');
      }
      
      // Prepare the data to store
      const dataToStore = {
        id,
        ...imageData,
        timestamp: new Date().getTime()
      };
      
      // Open a transaction and store the data
      const transaction = this.db.transaction([this.options.imageStoreName], 'readwrite');
      const store = transaction.objectStore(this.options.imageStoreName);
      
      const request = store.put(dataToStore);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log(`Successfully stored image with ID: ${id}`);
          
          // Dispatch image-stored event
          this.dispatchEvent('image-stored', {
            id,
            size: imageData.size || 'unknown'
          });
          
          resolve(id);
        };
        
        request.onerror = (event) => {
          console.error(`Error storing image with ID: ${id}`, event.target.error);
          
          // Dispatch error event
          this.dispatchEvent('error', {
            message: 'Failed to store image',
            id,
            error: event.target.error
          });
          
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in storeImage:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to store image',
        id,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Retrieve an image from IndexedDB
   * @param {string} id - Unique identifier for the image
   * @returns {Promise} A promise that resolves to the image data
   */
  async getImage(id) {
    if (!this.db) {
      await new Promise((resolve) => {
        const checkDb = () => {
          if (this.db) {
            resolve();
          } else {
            setTimeout(checkDb, 100);
          }
        };
        checkDb();
      });
    }
    
    try {
      // Open a transaction and get the data
      const transaction = this.db.transaction([this.options.imageStoreName], 'readonly');
      const store = transaction.objectStore(this.options.imageStoreName);
      
      const request = store.get(id);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const result = event.target.result;
          
          if (result) {
            console.log(`Successfully retrieved image with ID: ${id}`);
            
            // Dispatch image-retrieved event
            this.dispatchEvent('image-retrieved', { id });
            
            resolve(result);
          } else {
            console.log(`No image found with ID: ${id}`);
            
            // Dispatch image-not-found event
            this.dispatchEvent('image-not-found', { id });
            
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          console.error(`Error retrieving image with ID: ${id}`, event.target.error);
          
          // Dispatch error event
          this.dispatchEvent('error', {
            message: 'Failed to retrieve image',
            id,
            error: event.target.error
          });
          
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in getImage:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to retrieve image',
        id,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Delete an image from IndexedDB
   * @param {string} id - Unique identifier for the image
   * @returns {Promise} A promise that resolves when the deletion is complete
   */
  async deleteImage(id) {
    if (!this.db) {
      await new Promise((resolve) => {
        const checkDb = () => {
          if (this.db) {
            resolve();
          } else {
            setTimeout(checkDb, 100);
          }
        };
        checkDb();
      });
    }
    
    try {
      // Open a transaction and delete the data
      const transaction = this.db.transaction([this.options.imageStoreName], 'readwrite');
      const store = transaction.objectStore(this.options.imageStoreName);
      
      const request = store.delete(id);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log(`Successfully deleted image with ID: ${id}`);
          
          // Dispatch image-deleted event
          this.dispatchEvent('image-deleted', { id });
          
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error deleting image with ID: ${id}`, event.target.error);
          
          // Dispatch error event
          this.dispatchEvent('error', {
            message: 'Failed to delete image',
            id,
            error: event.target.error
          });
          
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteImage:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to delete image',
        id,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Store a value in local storage
   * @param {string} key - The key to store the value under
   * @param {*} value - The value to store (will be JSON stringified)
   */
  setLocalStorageItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      
      console.log(`Stored item in local storage: ${key}`);
    } catch (error) {
      console.error(`Error storing item in local storage: ${key}`, error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to store item in local storage',
        key,
        error: error.message
      });
    }
  }
  
  /**
   * Retrieve a value from local storage
   * @param {string} key - The key to retrieve
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} The stored value (JSON parsed) or defaultValue
   */
  getLocalStorageItem(key, defaultValue = null) {
    try {
      const serializedValue = localStorage.getItem(key);
      
      if (serializedValue === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(`Error retrieving item from local storage: ${key}`, error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to retrieve item from local storage',
        key,
        error: error.message
      });
      
      return defaultValue;
    }
  }
  
  /**
   * Store a value in session storage
   * @param {string} key - The key to store the value under
   * @param {*} value - The value to store (will be JSON stringified)
   */
  setSessionStorageItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      
      console.log(`Stored item in session storage: ${key}`);
    } catch (error) {
      console.error(`Error storing item in session storage: ${key}`, error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to store item in session storage',
        key,
        error: error.message
      });
    }
  }
  
  /**
   * Retrieve a value from session storage
   * @param {string} key - The key to retrieve
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} The stored value (JSON parsed) or defaultValue
   */
  getSessionStorageItem(key, defaultValue = null) {
    try {
      const serializedValue = sessionStorage.getItem(key);
      
      if (serializedValue === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(`Error retrieving item from session storage: ${key}`, error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to retrieve item from session storage',
        key,
        error: error.message
      });
      
      return defaultValue;
    }
  }
  
  /**
   * Set up routine to clean up old data
   */
  setupCleanupRoutine() {
    // Run cleanup immediately
    this.cleanupOldData();
    
    // Schedule regular cleanup (once per day)
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
  }
  
  /**
   * Clean up old data from storage
   */
  async cleanupOldData() {
    if (!this.db) {
      await new Promise((resolve) => {
        const checkDb = () => {
          if (this.db) {
            resolve();
          } else {
            setTimeout(checkDb, 100);
          }
        };
        checkDb();
      });
    }
    
    try {
      const now = Date.now();
      const cutoffTime = now - this.options.maxStorageAge;
      
      // Open a transaction and get the index
      const transaction = this.db.transaction([this.options.imageStoreName], 'readwrite');
      const store = transaction.objectStore(this.options.imageStoreName);
      const index = store.index('timestamp');
      
      // Use a cursor to iterate through old items
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      let deleteCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          // Delete this item
          store.delete(cursor.primaryKey);
          deleteCount++;
          
          // Move to next item
          cursor.continue();
        } else {
          // Done iterating
          if (deleteCount > 0) {
            console.log(`Cleaned up ${deleteCount} old items from storage`);
            
            // Dispatch cleanup-complete event
            this.dispatchEvent('cleanup-complete', {
              itemsDeleted: deleteCount
            });
          }
        }
      };
      
      request.onerror = (event) => {
        console.error('Error during storage cleanup', event.target.error);
        
        // Dispatch error event
        this.dispatchEvent('error', {
          message: 'Failed to clean up old data',
          error: event.target.error
        });
      };
    } catch (error) {
      console.error('Error in cleanupOldData:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to clean up old data',
        error: error.message
      });
    }
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
    const customEvent = new CustomEvent(`storage-manager-${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else {
  window.StorageManager = StorageManager;
} 