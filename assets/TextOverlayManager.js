/**
 * TextOverlayManager.js
 * 
 * Manages text overlays for stylized images.
 * Responsibilities include:
 * - Text input field management
 * - Text positioning and styling
 * - Drawing text on canvas
 * - Text preview functionality
 */

class TextOverlayManager {
  constructor(options = {}) {
    // Configuration options with defaults
    this.options = {
      maxTextLength: 30,
      maxLines: 2,
      defaultFontFamily: 'Montserrat, "Arial Black", sans-serif',
      defaultFontSize: 36,
      defaultTextColor: 'white',
      defaultShadowColor: 'rgba(0,0,0,0.9)',
      defaultPosition: 'bottom',
      ...options
    };
    
    // Text field state
    this.textFields = [];
    this.textComplete = false;
    
    // Initialize event listeners
    this.eventListeners = {};
    
    // Ensure required CSS is loaded
    this.ensureRequiredCSSLoaded();
    
    console.log('TextOverlayManager initialized');
  }
  
  /**
   * Ensure required CSS for text overlays is loaded
   */
  ensureRequiredCSSLoaded() {
    // Add Montserrat font to ensure it's available
    if (!document.getElementById('pixar-font-montserrat')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'pixar-font-montserrat';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap';
      document.head.appendChild(fontLink);
      console.log('Added Montserrat font for text styling');
    }
    
    // Add global CSS for text overlays
    if (!document.getElementById('pixar-text-overlay-css')) {
      const textOverlayCss = document.createElement('style');
      textOverlayCss.id = 'pixar-text-overlay-css';
      textOverlayCss.textContent = `
        /* Text overlay container styling */
        .text-overlay-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        /* Text overlay input styling */
        .text-overlay-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .text-overlay-input:focus {
          border-color: #007bff;
          outline: none;
        }
        
        /* Text overlay label styling */
        .text-overlay-label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          font-size: 14px;
          color: #333;
        }
        
        /* Text overlay buttons */
        .text-overlay-button {
          padding: 10px 15px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 10px;
        }
        
        .text-overlay-button:hover {
          background-color: #0069d9;
        }
        
        .text-overlay-button.secondary {
          background-color: #6c757d;
        }
        
        .text-overlay-button.secondary:hover {
          background-color: #5a6268;
        }
        
        /* Text overlay preview */
        .text-overlay-preview {
          margin-top: 20px;
          padding: 10px;
          background-color: #e9ecef;
          border-radius: 4px;
          text-align: center;
        }
        
        /* Text overlay on images */
        .pixar-text-overlay {
          position: absolute;
          z-index: 999;
          width: 100%;
          text-align: center;
          color: white;
          font-weight: 900;
          font-size: 36px;
          font-family: 'Montserrat', 'Arial Black', sans-serif;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-shadow: 
            2px 2px 4px rgba(0,0,0,0.9),
            -2px -2px 4px rgba(0,0,0,0.9),
            2px -2px 4px rgba(0,0,0,0.9),
            -2px 2px 4px rgba(0,0,0,0.9);
          padding: 0 10px;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
        
        .pixar-text-overlay.top {
          top: 10%;
        }
        
        .pixar-text-overlay.bottom {
          bottom: 10%;
        }
        
        .pixar-text-line {
          width: 100%;
          text-align: center;
          margin: 2px 0;
          letter-spacing: 0.05em;
          font-weight: 900;
          text-transform: uppercase;
        }
        
        /* Special handling for ampersands */
        .pixar-text-ampersand {
          display: inline-block;
          padding: 0 3px;
          vertical-align: middle;
        }
      `;
      document.head.appendChild(textOverlayCss);
      console.log('Added text overlay CSS');
    }
  }
  
  /**
   * Create and display the text input interface
   * @param {HTMLElement} container - Container element to append the interface to
   * @param {Object} imageData - Data about the image being edited
   */
  showTextInputInterface(container, imageData = {}) {
    if (!container) {
      console.error('No container provided for text input interface');
      return;
    }
    
    // Clear any existing interface
    this.clearTextInputInterface(container);
    
    // Create interface container
    const interfaceContainer = document.createElement('div');
    interfaceContainer.className = 'text-overlay-container';
    interfaceContainer.id = 'text-overlay-interface';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Add Text to Your Image';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    interfaceContainer.appendChild(title);
    
    // Create form for inputs
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.applyText();
    });
    
    // First text input
    const line1Label = document.createElement('label');
    line1Label.className = 'text-overlay-label';
    line1Label.textContent = 'First Line (optional)';
    form.appendChild(line1Label);
    
    const line1Input = document.createElement('input');
    line1Input.type = 'text';
    line1Input.className = 'text-overlay-input';
    line1Input.id = 'text-line1';
    line1Input.maxLength = this.options.maxTextLength;
    line1Input.placeholder = 'Enter text for first line';
    line1Input.addEventListener('input', () => this.updateTextPreview());
    form.appendChild(line1Input);
    
    // Second text input
    const line2Label = document.createElement('label');
    line2Label.className = 'text-overlay-label';
    line2Label.textContent = 'Second Line (optional)';
    form.appendChild(line2Label);
    
    const line2Input = document.createElement('input');
    line2Input.type = 'text';
    line2Input.className = 'text-overlay-input';
    line2Input.id = 'text-line2';
    line2Input.maxLength = this.options.maxTextLength;
    line2Input.placeholder = 'Enter text for second line';
    line2Input.addEventListener('input', () => this.updateTextPreview());
    form.appendChild(line2Input);
    
    // Position selector
    const positionLabel = document.createElement('label');
    positionLabel.className = 'text-overlay-label';
    positionLabel.textContent = 'Text Position';
    form.appendChild(positionLabel);
    
    const positionSelect = document.createElement('select');
    positionSelect.className = 'text-overlay-input';
    positionSelect.id = 'text-position';
    positionSelect.addEventListener('change', () => this.updateTextPreview());
    
    const positions = [
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' }
    ];
    
    positions.forEach(pos => {
      const option = document.createElement('option');
      option.value = pos.value;
      option.textContent = pos.label;
      if (pos.value === this.options.defaultPosition) {
        option.selected = true;
      }
      positionSelect.appendChild(option);
    });
    
    form.appendChild(positionSelect);
    
    // Preview section
    const previewContainer = document.createElement('div');
    previewContainer.className = 'text-overlay-preview';
    previewContainer.id = 'text-preview-container';
    
    // Add image preview if available
    if (imageData.imageUrl) {
      const imagePreview = document.createElement('div');
      imagePreview.style.position = 'relative';
      imagePreview.style.maxWidth = '300px';
      imagePreview.style.margin = '0 auto';
      
      const image = document.createElement('img');
      image.src = imageData.imageUrl;
      image.style.width = '100%';
      image.style.height = 'auto';
      imagePreview.appendChild(image);
      
      // Add text overlay container
      const textOverlay = document.createElement('div');
      textOverlay.className = `pixar-text-overlay ${this.options.defaultPosition}`;
      textOverlay.id = 'text-preview-overlay';
      imagePreview.appendChild(textOverlay);
      
      previewContainer.appendChild(imagePreview);
    } else {
      const previewText = document.createElement('p');
      previewText.textContent = 'Text Preview';
      previewText.style.fontWeight = 'bold';
      previewContainer.appendChild(previewText);
      
      const textOverlay = document.createElement('div');
      textOverlay.id = 'text-preview-overlay';
      textOverlay.style.padding = '10px';
      textOverlay.style.minHeight = '80px';
      textOverlay.style.display = 'flex';
      textOverlay.style.flexDirection = 'column';
      textOverlay.style.justifyContent = 'center';
      textOverlay.style.alignItems = 'center';
      
      previewContainer.appendChild(textOverlay);
    }
    
    form.appendChild(previewContainer);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.marginTop = '20px';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'center';
    
    // Apply button
    const applyButton = document.createElement('button');
    applyButton.type = 'submit';
    applyButton.className = 'text-overlay-button';
    applyButton.textContent = 'Apply Text';
    buttonsContainer.appendChild(applyButton);
    
    // Skip button
    const skipButton = document.createElement('button');
    skipButton.type = 'button';
    skipButton.className = 'text-overlay-button secondary';
    skipButton.textContent = 'Skip';
    skipButton.addEventListener('click', () => {
      this.skipText();
    });
    buttonsContainer.appendChild(skipButton);
    
    form.appendChild(buttonsContainer);
    interfaceContainer.appendChild(form);
    
    // Add the interface to the container
    container.appendChild(interfaceContainer);
    
    // Initialize the preview
    this.updateTextPreview();
    
    // Dispatch interface-shown event
    this.dispatchEvent('interface-shown', { container });
  }
  
  /**
   * Update the text preview based on current input values
   */
  updateTextPreview() {
    const textOverlay = document.getElementById('text-preview-overlay');
    if (!textOverlay) return;
    
    // Clear current content
    textOverlay.innerHTML = '';
    
    // Get current values
    const line1 = document.getElementById('text-line1')?.value || '';
    const line2 = document.getElementById('text-line2')?.value || '';
    const position = document.getElementById('text-position')?.value || this.options.defaultPosition;
    
    // Update position class
    if (textOverlay.classList.contains('top')) {
      textOverlay.classList.remove('top');
    }
    if (textOverlay.classList.contains('bottom')) {
      textOverlay.classList.remove('bottom');
    }
    textOverlay.classList.add(position);
    
    // Add text lines if they exist
    if (line1) {
      const line1Element = document.createElement('div');
      line1Element.className = 'pixar-text-line';
      line1Element.innerHTML = this.formatTextWithAmpersands(line1);
      textOverlay.appendChild(line1Element);
    }
    
    if (line2) {
      const line2Element = document.createElement('div');
      line2Element.className = 'pixar-text-line';
      line2Element.innerHTML = this.formatTextWithAmpersands(line2);
      textOverlay.appendChild(line2Element);
    }
  }
  
  /**
   * Format text with special handling for ampersands
   * @param {string} text - The text to format
   * @returns {string} Formatted HTML
   */
  formatTextWithAmpersands(text) {
    return text.replace(/&/g, '<span class="pixar-text-ampersand">&</span>');
  }
  
  /**
   * Apply text from the input form
   */
  applyText() {
    // Get current values
    const line1 = document.getElementById('text-line1')?.value || '';
    const line2 = document.getElementById('text-line2')?.value || '';
    const position = document.getElementById('text-position')?.value || this.options.defaultPosition;
    
    // Store the text fields
    this.textFields = [
      { text: line1, position: 0 },
      { text: line2, position: 1 }
    ].filter(field => field.text.trim() !== '');
    
    this.textPosition = position;
    this.textComplete = true;
    
    console.log('Applied text:', this.textFields, 'Position:', position);
    
    // Remove the interface
    const container = document.getElementById('text-overlay-interface')?.parentElement;
    if (container) {
      this.clearTextInputInterface(container);
    }
    
    // Dispatch text-applied event
    this.dispatchEvent('text-applied', {
      textFields: this.textFields,
      position: position
    });
  }
  
  /**
   * Skip text addition
   */
  skipText() {
    // Clear text fields
    this.textFields = [];
    this.textComplete = true;
    
    console.log('Text addition skipped');
    
    // Remove the interface
    const container = document.getElementById('text-overlay-interface')?.parentElement;
    if (container) {
      this.clearTextInputInterface(container);
    }
    
    // Dispatch text-skipped event
    this.dispatchEvent('text-skipped', {});
  }
  
  /**
   * Clear the text input interface from the container
   * @param {HTMLElement} container - The container element
   */
  clearTextInputInterface(container) {
    const interface = document.getElementById('text-overlay-interface');
    if (interface && container.contains(interface)) {
      container.removeChild(interface);
    }
  }
  
  /**
   * Draw text on a canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawTextOnCanvas(ctx, width, height) {
    if (!ctx || !this.textFields.length) return;
    
    // Configure text style
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate base font size relative to canvas size
    const baseFontSize = Math.min(width, height) * 0.06;
    
    // Configure font
    ctx.font = `900 ${baseFontSize}px ${this.options.defaultFontFamily}`;
    
    // Apply text shadow
    ctx.shadowColor = this.options.defaultShadowColor;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Calculate text position
    const textX = width / 2;
    let textY;
    
    if (this.textPosition === 'top') {
      textY = height * 0.15;
    } else { // bottom
      textY = height * 0.85;
    }
    
    // Adjust Y for multiple lines
    const lineHeight = baseFontSize * 1.2;
    const totalHeight = this.textFields.length * lineHeight;
    const startY = textY - (totalHeight / 2) + (lineHeight / 2);
    
    // Draw each text line
    ctx.fillStyle = this.options.defaultTextColor;
    this.textFields.forEach((field, index) => {
      const lineY = startY + (index * lineHeight);
      ctx.fillText(field.text.toUpperCase(), textX, lineY);
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  /**
   * Add text overlay to an image element
   * @param {HTMLImageElement} image - The image element to add text to
   */
  addTextOverlayToImage(image) {
    if (!image || !this.textFields.length) return;
    
    // Find or create container
    let container = image.parentElement;
    if (!container || !container.classList.contains('pixar-crop-wrapper')) {
      container = document.createElement('div');
      container.className = 'pixar-crop-wrapper';
      container.style.position = 'relative';
      container.style.overflow = 'visible';
      if (image.parentElement) {
        image.parentElement.insertBefore(container, image);
      }
      container.appendChild(image);
    }
    
    // Create overlay
    let overlay = container.querySelector('.pixar-text-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = `pixar-text-overlay ${this.textPosition || 'bottom'}`;
      container.appendChild(overlay);
    }
    
    // Clear any existing text
    overlay.innerHTML = '';
    
    // Add text lines
    this.textFields.forEach(field => {
      const lineElement = document.createElement('div');
      lineElement.className = 'pixar-text-line';
      lineElement.innerHTML = this.formatTextWithAmpersands(field.text);
      overlay.appendChild(lineElement);
    });
  }
  
  /**
   * Get the current text fields
   * @returns {Array} Array of text field objects
   */
  getTextFields() {
    return this.textFields;
  }
  
  /**
   * Get the text position
   * @returns {string} The position ('top' or 'bottom')
   */
  getTextPosition() {
    return this.textPosition || this.options.defaultPosition;
  }
  
  /**
   * Check if text processing is complete
   * @returns {boolean} True if text has been applied or skipped
   */
  isTextComplete() {
    return this.textComplete;
  }
  
  /**
   * Reset the text manager state
   */
  reset() {
    this.textFields = [];
    this.textComplete = false;
    this.textPosition = this.options.defaultPosition;
    
    console.log('TextOverlayManager reset');
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
    const customEvent = new CustomEvent(`text-overlay-${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextOverlayManager;
} else {
  window.TextOverlayManager = TextOverlayManager;
} 