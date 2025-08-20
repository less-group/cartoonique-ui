/**
 * Debug Watermark Logger
 * This script adds a floating console to the page for debugging watermark API responses
 */

(function() {
  console.log('Debug Watermark Logger initialized');
  
  // Create the logger container
  const loggerContainer = document.createElement('div');
  loggerContainer.id = 'watermark-debug-logger';
  loggerContainer.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 400px;
    max-height: 300px;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    border-radius: 5px;
    z-index: 9999;
    overflow-y: auto;
    display: none;
  `;
  
  // Create header with title and toggle button
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    cursor: move;
  `;
  
  const title = document.createElement('div');
  title.textContent = 'Watermark Debug Console';
  title.style.fontWeight = 'bold';
  
  const buttonContainer = document.createElement('div');
  
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'X';
  toggleButton.style.cssText = `
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    margin-left: 10px;
  `;
  toggleButton.addEventListener('click', () => {
    loggerContainer.style.display = 'none';
  });
  
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.style.cssText = `
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
  `;
  clearButton.addEventListener('click', () => {
    logContent.innerHTML = '';
  });
  
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(toggleButton);
  
  header.appendChild(title);
  header.appendChild(buttonContainer);
  
  // Create content area
  const logContent = document.createElement('div');
  logContent.id = 'watermark-debug-log-content';
  
  // Add elements to container
  loggerContainer.appendChild(header);
  loggerContainer.appendChild(logContent);
  
  // Add to page
  document.body.appendChild(loggerContainer);
  
  // Make the logger draggable
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - loggerContainer.getBoundingClientRect().left;
    dragOffsetY = e.clientY - loggerContainer.getBoundingClientRect().top;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      loggerContainer.style.left = (e.clientX - dragOffsetX) + 'px';
      loggerContainer.style.top = (e.clientY - dragOffsetY) + 'px';
      loggerContainer.style.bottom = 'auto';
      loggerContainer.style.right = 'auto';
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Keypress handler to toggle logger
  document.addEventListener('keydown', (e) => {
    // Alt+W to toggle logger
    if (e.altKey && e.key === 'w') {
      loggerContainer.style.display = loggerContainer.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Add logging functions
  window.WatermarkDebug = {
    show() {
      loggerContainer.style.display = 'block';
    },
    
    hide() {
      loggerContainer.style.display = 'none';
    },
    
    log(message, data) {
      const entry = document.createElement('div');
      entry.style.marginBottom = '5px';
      entry.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
      entry.style.paddingBottom = '5px';
      
      const timestamp = new Date().toLocaleTimeString();
      const messageText = document.createElement('div');
      messageText.innerHTML = `<span style="color: #888;">[${timestamp}]</span> ${message}`;
      
      entry.appendChild(messageText);
      
      if (data !== undefined) {
        const dataText = document.createElement('pre');
        dataText.style.cssText = `
          margin: 5px 0 0 10px;
          white-space: pre-wrap;
          word-break: break-all;
          color: #aaa;
          font-size: 11px;
        `;
        
        try {
          if (typeof data === 'object') {
            dataText.textContent = JSON.stringify(data, null, 2);
          } else {
            dataText.textContent = String(data);
          }
        } catch (error) {
          dataText.textContent = '[Error displaying data]';
        }
        
        entry.appendChild(dataText);
      }
      
      logContent.appendChild(entry);
      logContent.scrollTop = logContent.scrollHeight;
      loggerContainer.style.display = 'block';
      
      // Also log to console
      if (data !== undefined) {
        console.log(`[WatermarkDebug] ${message}`, data);
      } else {
        console.log(`[WatermarkDebug] ${message}`);
      }
    },
    
    clear() {
      logContent.innerHTML = '';
    }
  };
  
  // Monkey patch XMLHttpRequest to intercept and log API responses
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function() {
    this._requestUrl = arguments[1];
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    if (this._requestUrl && 
        (this._requestUrl.includes('/pixar-status/') || 
         this._requestUrl.includes('/pixar-transform'))) {
      
      this.addEventListener('load', function() {
        try {
          const response = JSON.parse(this.responseText);
          
          if ((this._requestUrl.includes('/pixar-status/') || this._requestUrl.includes('/status/')) && response.status === 'COMPLETED') {
            window.WatermarkDebug.log('Pixar status COMPLETED:', {
              url: this._requestUrl,
              hasWatermarkedImageUrl: !!response.watermarkedImageUrlToShow,
              hasWatermarkedOriginalImageUrl: !!response.watermarkedOriginalImageUrl,
              hasResultImageUrl: !!response.resultImageUrl,
              response: response
            });
          } else if (this._requestUrl.includes('/pixar-transform')) {
            window.WatermarkDebug.log('Pixar transform request:', {
              url: this._requestUrl,
              response: response
            });
          }
        } catch (e) {
          // Not JSON or other error, ignore
        }
      });
    }
    
    return originalXHRSend.apply(this, arguments);
  };
  
  // Also monkey patch fetch
  const originalFetch = window.fetch;
  window.fetch = function() {
    const url = arguments[0].url || arguments[0];
    const fetchPromise = originalFetch.apply(this, arguments);
    
    if (typeof url === 'string' && 
        (url.includes('/pixar-status/') || 
         url.includes('/pixar-transform'))) {
      
      fetchPromise.then(response => {
        // Clone the response so we can read it
        const clonedResponse = response.clone();
        
        clonedResponse.json().then(data => {
          if ((url.includes('/pixar-status/') || url.includes('/status/')) && data.status === 'COMPLETED') {
            window.WatermarkDebug.log('Fetch: Pixar status COMPLETED:', {
              url: url,
              hasWatermarkedImageUrl: !!data.watermarkedImageUrlToShow,
              hasWatermarkedOriginalImageUrl: !!data.watermarkedOriginalImageUrl,
              hasResultImageUrl: !!data.resultImageUrl,
              response: data
            });
          } else if (url.includes('/pixar-transform')) {
            window.WatermarkDebug.log('Fetch: Pixar transform request:', {
              url: url,
              response: data
            });
          }
        }).catch(() => {
          // Not JSON or other error, ignore
        });
      });
    }
    
    return fetchPromise;
  };
  
  // Add instructions
  window.WatermarkDebug.log('Watermark Debug Logger initialized. Press Alt+W to toggle.');
  
})(); 