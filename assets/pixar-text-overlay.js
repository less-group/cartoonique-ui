/**
 * Pixar Text Overlay Custom Element
 * 
 * This custom element provides a dialog for users to input their names
 * and view a live preview of the text overlay.
 */

class PixarTextOverlay extends HTMLElement {
  constructor() {
    super();
    
    // Create a shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // State
    this.isDialogOpen = false;
    this.resolveDialogPromise = null;
    this.rejectDialogPromise = null;
    
    // Dialog options
    this.options = {
      imageUrl: '',
      defaultNames: {
        name1: '',
        name2: '',
        subtitle: ''
      }
    };
    
    // Cache for faster rendering
    this.cachedImage = null;
    
    // Keep track of the currently selected crop ratio
    this.currentAspectRatio = window.imageProcessingManager?.currentCropRatio || 3/4;
    
    console.log('PixarTextOverlay constructed');
  }
  
  connectedCallback() {
    console.log('PixarTextOverlay connected');
    this.render();
  }
  
  disconnectedCallback() {
    console.log('PixarTextOverlay disconnected');
    this.cleanup();
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    // Nothing to clean up anymore
  }
  
  /**
   * Render the component
   */
  render() {
    const shadowRoot = this.shadowRoot;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
    
      :host {
        display: block;
        position: fixed;
        z-index: -1;
        opacity: 0;
      }
      
      :host(.active) {
        z-index: 9999;
        opacity: 1;
      }
      
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(3px);
      }
      
      .dialog-container {
        background-color: white;
        border-radius: 16px;
        padding: 24px;
        width: 80%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
      }
      
      .dialog-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .dialog-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        font-family: 'Montserrat', sans-serif;
        color: #000000;
      }
      
      .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        color: #4A7DBD;
        transition: color 0.2s;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .close-button:hover {
        color: #3A6AA6;
        background-color: #f7fafc;
      }
      
      .dialog-content {
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #E2E8F0;
        border-radius: 4px;
        font-size: 16px;
        background-color: #F7FAFC;
        color: #000000;
        transition: all 0.2s;
        font-family: 'Montserrat', sans-serif;
      }
      
      input:focus {
        outline: none;
        border-color: #4A7DBD;
        background-color: white;
        box-shadow: 0 0 0 2px rgba(74, 125, 189, 0.15);
      }
      
      input:hover {
        border-color: #CBD5E0;
      }
      
      input::placeholder {
        color: #A0AEC0;
      }
      
      .preview-container {
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
        aspect-ratio: 3/4; /* Default 30x40 aspect ratio, can be changed dynamically */
        transition: aspect-ratio 0.3s ease;
      }
      
      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      
      .inputs-container {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .subtitle-container {
        margin-bottom: 20px;
      }
      
      .subtitle-label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        font-size: 14px;
        color: #000000;
        font-family: 'Montserrat', sans-serif;
      }
      
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
      }
      
      .btn {
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        transition: all 0.2s;
        border: none;
      }
      
      .btn-cancel {
        background-color: #EDF2F7;
        color: #000000;
      }
      
      .btn-cancel:hover {
        background-color: #E2E8F0;
      }
      
      .btn-submit {
        background-color: #4A7DBD;
        color: white;
        box-shadow: 0 4px 6px rgba(74, 125, 189, 0.2);
      }
      
      .btn-submit:hover {
        background-color: #3A6AA6;
        box-shadow: 0 4px 10px rgba(74, 125, 189, 0.3);
      }
    `;
    
    // Create dialog structure
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.style.display = 'none';
    
    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'dialog-container';
    
    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'dialog-header';
    
    const dialogTitle = document.createElement('h3');
    dialogTitle.className = 'dialog-title';
    dialogTitle.textContent = 'Add Your Names';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => this.closeDialog(false));
    
    dialogHeader.appendChild(dialogTitle);
    dialogContainer.appendChild(closeButton);
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    
    const previewImage = document.createElement('img');
    previewImage.className = 'preview-image';
    previewImage.alt = 'Preview';
    
    previewContainer.appendChild(previewImage);
    
    // Add preview container to content first
    dialogContent.appendChild(previewContainer);
    
    // Create name inputs container
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'inputs-container';
    
    // First input 
    const inputWrapper1 = document.createElement('div');
    inputWrapper1.style.flex = '1';
    
    const nameInput1 = document.createElement('input');
    nameInput1.type = 'text';
    nameInput1.placeholder = 'YOUR';
    
    // Use more efficient immediate input handling with RAF for smoother rendering
    nameInput1.addEventListener('input', () => {
      if (!this._updatePending) {
        this._updatePending = true;
        requestAnimationFrame(() => {
          this.updatePreview();
          this._updatePending = false;
        });
      }
    });
    
    inputWrapper1.appendChild(nameInput1);
    
    // Second input
    const inputWrapper2 = document.createElement('div');
    inputWrapper2.style.flex = '1';
    
    const nameInput2 = document.createElement('input');
    nameInput2.type = 'text';
    nameInput2.placeholder = 'NAMES';
    
    // Use more efficient immediate input handling with RAF for smoother rendering
    nameInput2.addEventListener('input', () => {
      if (!this._updatePending) {
        this._updatePending = true;
        requestAnimationFrame(() => {
          this.updatePreview();
          this._updatePending = false;
        });
      }
    });
    
    inputWrapper2.appendChild(nameInput2);
    
    // Add inputs to container
    inputsContainer.appendChild(inputWrapper1);
    inputsContainer.appendChild(inputWrapper2);
    
    // Add inputs after preview
    dialogContent.appendChild(inputsContainer);
    
    // Add subtitle input
    const subtitleContainer = document.createElement('div');
    subtitleContainer.className = 'subtitle-container';
    
    const subtitleLabel = document.createElement('label');
    subtitleLabel.className = 'subtitle-label';
    subtitleLabel.textContent = 'Subtitle';
    subtitleLabel.htmlFor = 'subtitle-input';
    
    const subtitleInput = document.createElement('input');
    subtitleInput.type = 'text';
    subtitleInput.id = 'subtitle-input';
    subtitleInput.placeholder = 'based on a true story - your text here';
    subtitleInput.maxLength = 35; // Add a hard character limit
    
    // Create character counter element
    const subtitleCharCounter = document.createElement('div');
    subtitleCharCounter.className = 'subtitle-char-counter';
    subtitleCharCounter.style.fontSize = '12px';
    subtitleCharCounter.style.color = '#666';
    subtitleCharCounter.style.marginTop = '5px';
    subtitleCharCounter.style.display = 'none';
    
    // Create warning message
    const warningMessage = document.createElement('div');
    warningMessage.className = 'subtitle-warning';
    warningMessage.style.fontSize = '12px';
    warningMessage.style.color = '#e74c3c';
    warningMessage.style.marginTop = '5px';
    warningMessage.style.display = 'none';
    warningMessage.textContent = 'Subtitle may be truncated or wrapped on the final image';
    
    // Use more efficient immediate input handling with RAF for smoother rendering
    subtitleInput.addEventListener('input', () => {
      const maxChars = 35;
      const text = subtitleInput.value;
      
      // Update character counter
      if (text.length > (maxChars * 0.7)) {
        subtitleCharCounter.style.display = 'block';
        subtitleCharCounter.textContent = `${text.length}/${maxChars} characters`;
        
        // Change color based on length
        if (text.length > maxChars) {
          subtitleCharCounter.style.color = '#e74c3c'; // Red for over limit
          subtitleInput.style.borderColor = '#e74c3c';
          warningMessage.style.display = 'block';
        } else if (text.length > (maxChars * 0.9)) {
          subtitleCharCounter.style.color = '#e67e22'; // Orange for close to limit
          subtitleInput.style.borderColor = '#e67e22';
          warningMessage.style.display = 'block';
        } else {
          subtitleCharCounter.style.color = '#666'; // Default gray
          subtitleInput.style.borderColor = '';
          warningMessage.style.display = 'none';
        }
      } else {
        subtitleCharCounter.style.display = 'none';
        warningMessage.style.display = 'none';
        subtitleInput.style.borderColor = '';
      }
      
      // Update preview
      if (!this._updatePending) {
        this._updatePending = true;
        requestAnimationFrame(() => {
          this.updatePreview();
          this._updatePending = false;
        });
      }
    });
    
    subtitleContainer.appendChild(subtitleLabel);
    subtitleContainer.appendChild(subtitleInput);
    subtitleContainer.appendChild(subtitleCharCounter);
    subtitleContainer.appendChild(warningMessage);
    
    // Add subtitle container after name inputs
    dialogContent.appendChild(subtitleContainer);
    
    // Dialog footer
    const dialogFooter = document.createElement('div');
    dialogFooter.className = 'dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => this.closeDialog(false));
    
    const submitButton = document.createElement('button');
    submitButton.className = 'btn btn-submit';
    submitButton.textContent = 'Apply';
    submitButton.addEventListener('click', () => this.closeDialog(true));
    
    dialogFooter.appendChild(cancelButton);
    dialogFooter.appendChild(submitButton);
    
    // Assemble the dialog
    dialogContainer.appendChild(dialogHeader);
    dialogContainer.appendChild(dialogContent);
    dialogContainer.appendChild(dialogFooter);
    dialogOverlay.appendChild(dialogContainer);
    
    // Add to shadow DOM
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(dialogOverlay);
    
    // Store references
    this.dialogOverlay = dialogOverlay;
    this.nameInput1 = nameInput1;
    this.nameInput2 = nameInput2;
    this.subtitleInput = subtitleInput;
    this.previewImage = previewImage;
    this.previewContainer = previewContainer;
  }
  
  /**
   * Render text on a canvas
   * @param {HTMLCanvasElement} canvas - The canvas to render on
   * @param {string} imageUrl - The URL of the image
   * @param {Object} names - The names to render
   * @returns {Promise<HTMLCanvasElement>} - The canvas with rendered text
   */
  async renderTextOnCanvas(canvas, imageUrl, names) {
    return new Promise((resolve, reject) => {
      const ctx = canvas.getContext('2d');
      
      // Use cached image if available and URL matches
      const useCache = this.cachedImage && this.cachedImage.src === imageUrl;
      
      const renderWithImage = (img) => {
        // Set canvas dimensions to match the image
        // Check if we need to use 50x70 aspect ratio based on crop selection
        const imageManager = window.imageProcessingManager;
        const is5070Selected = imageManager && imageManager.currentCropRatio && 
                              Math.abs(imageManager.currentCropRatio - 5/7) < 0.01;
        
        // Determine the target aspect ratio based on user's crop choice
        const targetRatio = is5070Selected ? 5/7 : 3/4; // Either 50x70 or 30x40 aspect ratio
        
        // Calculate dimensions that maintain aspect ratio
        let canvasWidth, canvasHeight;
        const imgRatio = img.width / img.height;
        
        if (imgRatio > targetRatio) {
          // Image is wider than target ratio
          canvasHeight = img.height;
          canvasWidth = canvasHeight * targetRatio;
        } else {
          // Image is taller than target ratio
          canvasWidth = img.width;
          canvasHeight = canvasWidth / targetRatio;
        }
        
        // Set canvas dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Draw the original image centered in the canvas
        const offsetX = (img.width - canvasWidth) / 2;
        const offsetY = (img.height - canvasHeight) / 2;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw the image, centered if needed
        ctx.drawImage(img, offsetX, offsetY, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
        
        // Get name values
        const name1 = (names.name1 || '').trim().toUpperCase();
        const name2 = (names.name2 || '').trim().toUpperCase();
        const subtitle = (names.subtitle || '').trim();
        
        // Determine text to display with placeholders for empty fields
        let displayText;
        
        if (name1 && name2) {
          // Both names provided
          displayText = `${name1}\u200A&\u200A${name2}`;
        } else if (name1) {
          // Only first name provided, use placeholder for second
          displayText = `${name1}\u200A&\u200ANAMES`;
        } else if (name2) {
          // Only second name provided, use placeholder for first
          displayText = `YOUR\u200A&\u200A${name2}`;
        } else {
          // No names provided, show default placeholder
          displayText = "YOUR\u200A&\u200ANAMES";
        }
        
        // Start with a base font size proportional to image width
        let fontSize = Math.max(Math.floor(canvas.width / 8), 60);
        
        // Configure text style
        ctx.textAlign = 'center';
        
        // Use Montserrat with 900 weight to match the reference
        ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
        
        // Measure text width and adjust if needed
        let textWidth = ctx.measureText(displayText).width;
        const maxWidth = canvas.width * 0.85; // Allow text to use up to 85% of canvas width
        
        // Reduce font size until text fits if needed
        if (textWidth > maxWidth) {
          const ratio = maxWidth / textWidth;
          fontSize = Math.floor(fontSize * ratio);
          ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
          textWidth = ctx.measureText(displayText).width;
        }
        
        // Position text at the bottom of the image with some padding
        const x = canvas.width / 2;
        const y = canvas.height * 0.92;
        
        // Performance optimization: Draw to offscreen canvas for shadow effects
        const textCanvas = document.createElement('canvas');
        textCanvas.width = canvas.width;
        textCanvas.height = canvas.height;
        const textCtx = textCanvas.getContext('2d');
        
        // Set the same font on the text canvas
        textCtx.textAlign = 'center';
        textCtx.font = ctx.font;
        
        // Multiple shadow passes for a professional look
        // First pass: outer shadow
        textCtx.fillStyle = 'white';
        textCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        textCtx.shadowBlur = fontSize * 0.07;
        textCtx.shadowOffsetX = 0;
        textCtx.shadowOffsetY = fontSize * 0.03;
        textCtx.fillText(displayText, x, y);
        
        // Second pass: deeper shadow for 3D effect
        textCtx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        textCtx.shadowBlur = fontSize * 0.12;
        textCtx.shadowOffsetY = fontSize * 0.05;
        textCtx.fillText(displayText, x, y);
        
        // Third pass: add subtle white glow
        textCtx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        textCtx.shadowBlur = fontSize * 0.04;
        textCtx.shadowOffsetY = 0;
        textCtx.fillText(displayText, x, y);
        
        // Draw the text canvas onto the main canvas
        ctx.drawImage(textCanvas, 0, 0);
        
        // Add subtitle if provided
        if (subtitle) {
          // Calculate subtitle font size as a proportion of the main text size
          const subtitleFontSize = Math.max(Math.floor(fontSize * 0.35), 16);
          
          // Configure subtitle style - use italic for a more movie subtitle appearance
          ctx.font = `italic ${subtitleFontSize}px Montserrat, Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = 'white'; // White text
          
          // Add shadow for readability
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          
          // Position subtitle below main text
          const subtitleY = y + fontSize * 0.7;
          
          // Check if subtitle needs to be wrapped
          const maxSubtitleWidth = canvas.width * 0.9; // Use 90% of canvas width for subtitle
          const subtitleWidth = ctx.measureText(subtitle).width;
          
          if (subtitleWidth > maxSubtitleWidth) {
            // Try to break subtitle into words for wrapping
            const words = subtitle.split(' ');
            let line = '';
            let lines = [];
            
            // Create wrapped lines that fit within max width
            for (let i = 0; i < words.length; i++) {
              const testLine = line + (line ? ' ' : '') + words[i];
              const testWidth = ctx.measureText(testLine).width;
              
              if (testWidth > maxSubtitleWidth && line !== '') {
                lines.push(line);
                line = words[i];
              } else {
                line = testLine;
              }
            }
            
            // Add the last line
            if (line) {
              lines.push(line);
            }
            
            // If we have more than 2 lines, truncate to 2 lines with ellipsis
            if (lines.length > 2) {
              const lastLine = lines[1];
              const truncateAt = Math.floor(lastLine.length * 0.8);
              lines[1] = lastLine.substring(0, truncateAt) + '...';
              lines = lines.slice(0, 2);
            }
            
            // Draw each line of the subtitle
            const lineHeight = subtitleFontSize * 1.2;
            lines.forEach((line, index) => {
              ctx.fillText(line, x, subtitleY + (index * lineHeight));
            });
          } else {
            // Draw the subtitle as a single line
            ctx.fillText(subtitle, x, subtitleY);
          }
        }
        
        resolve(canvas);
      };
      
      // If we have a cached image, use it immediately
      if (useCache) {
        renderWithImage(this.cachedImage);
        return;
      }
      
      // Create an image element to load the source image
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS if needed
      
      // Set up the image load handler
      img.onload = () => {
        // Cache the loaded image
        this.cachedImage = img;
        renderWithImage(img);
      };
      
      // Handle image loading errors
      img.onerror = (err) => {
        console.error('Error loading image for rendering:', err);
        reject(new Error('Failed to load image for rendering'));
      };
      
      // Load the image
      img.src = imageUrl;
    });
  }
  
  /**
   * Update the preview image
   */
  async updatePreview() {
    try {
      // Get current values from inputs
      const name1 = this.nameInput1.value.trim();
      const name2 = this.nameInput2.value.trim();
      const subtitle = this.subtitleInput.value.trim();
      
      // Store values
      this.currentNames = {
        name1,
        name2,
        subtitle
      };
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      
      // Render text on image
      const result = await this.renderTextOnCanvas(
        canvas,
        this.options.imageUrl,
        this.currentNames
      );
      
      // Update preview image
      this.previewImage.src = canvas.toDataURL('image/jpeg');
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }
  
  /**
   * Show the dialog
   * @param {Object} options - The options for the dialog
   * @returns {Promise} - Resolves with the dialog result
   */
  async showDialog(options = {}) {
    if (this.isDialogOpen) {
      // Another dialog is already open
      return { completed: false };
    }
    
    this.isDialogOpen = true;
    this.options = { ...this.options, ...options };
    
    // Set initial values
    this.nameInput1.value = this.options.defaultNames.name1 || '';
    this.nameInput2.value = this.options.defaultNames.name2 || '';
    this.subtitleInput.value = this.options.defaultNames.subtitle || '';
    
    // Show dialog with animation
    this.classList.add('active');
    this.dialogOverlay.style.display = 'flex';
    
    // Add event listener to block scrolling
    document.body.style.overflow = 'hidden';
    
    // Determine if we need to adjust preview aspect ratio based on crop selection
    // Check if the image processing manager has selected a 50x70 crop
    const imageManager = window.imageProcessingManager;
    const is5070Selected = imageManager && imageManager.currentCropRatio && 
                          Math.abs(imageManager.currentCropRatio - 5/7) < 0.01;
    
    // Make sure previewContainer exists before trying to set its style
    if (this.previewContainer) {
      if (is5070Selected) {
        console.log('Using 50x70 aspect ratio for preview container');
        // Set the preview container aspect ratio to match 50x70
        this.previewContainer.style.aspectRatio = '5/7';
      } else {
        console.log('Using default 30x40 aspect ratio for preview container');
        // Ensure we use the default 30x40 aspect ratio
        this.previewContainer.style.aspectRatio = '3/4';
      }
    } else {
      console.error('Preview container not found in showDialog');
    }
    
    // Load image for preview
    if (this.options.imageUrl) {
      // Update the preview
      await this.updatePreview();
    }
    
    // Return promise that will be resolved when dialog is closed
    return new Promise((resolve, reject) => {
      this.resolveDialogPromise = resolve;
      this.rejectDialogPromise = reject;
    });
  }
  
  /**
   * Close the dialog
   * @param {boolean} completed - Whether the dialog was completed or cancelled
   */
  closeDialog(completed = false) {
    if (!this.isDialogOpen) {
      return;
    }
    
    // Hide dialog
    this.classList.remove('active');
    this.dialogOverlay.style.display = 'none';
    
    // Restore scrolling
    document.body.style.overflow = '';
    
    // Resolve the promise
    if (this.resolveDialogPromise) {
      const names = completed ? {
        name1: this.nameInput1.value.trim(),
        name2: this.nameInput2.value.trim(),
        subtitle: this.subtitleInput.value.trim() // Include subtitle in returned names
      } : this.options.defaultNames;
      
      this.resolveDialogPromise({
        completed,
        names
      });
      
      this.resolveDialogPromise = null;
      this.rejectDialogPromise = null;
    }
    
    this.isDialogOpen = false;
  }
  
  /**
   * Apply text to an image
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Result with URL
   */
  async applyText(options) {
    console.log('Applying text to image with options:', options);
    
    // Get the names from options or current values
    const names = options.names || {
      name1: this.nameInput1?.value || '',
      name2: this.nameInput2?.value || ''
    };
    
    // Always render text - we'll use placeholders if fields are empty
    // Removed check for empty text since we'll always show at least placeholders
    
    try {
      // Create a canvas to render the image with text
      const canvas = document.createElement('canvas');
      
      // Render text on canvas using the same styling as preview
      await this.renderTextOnCanvas(canvas, options.imageUrl, names);
      
      // Return the canvas content as a data URL with higher quality
      const resultUrl = canvas.toDataURL('image/jpeg', 0.97);
      return { resultUrl };
    } catch (error) {
      console.error('Error applying text to image:', error);
      return { resultUrl: options.imageUrl }; // Return original on error
    }
  }
}

// Register the custom element
if (!customElements.get('pixar-text-overlay')) {
  customElements.define('pixar-text-overlay', PixarTextOverlay);
  console.log('PixarTextOverlay registered');
} 