/**
 * Simple Image Cropper Component
 * 
 * Allows users to crop their images to fit a 30x40 or 50x70 vertical canvas.
 * This component is designed to be used after the initial image upload but before text addition.
 */

class ImageCropper {
  constructor(options = {}) {
    // Configuration options
    this.options = {
      aspectRatio: 3/4, // 30:40 ratio (default)
      minWidth: 100,
      minHeight: 100,
      ...options
    };
    
    // State variables
    this.originalImage = null;
    this.image = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.imagePosition = { x: 0, y: 0 };
    this.lastImagePosition = { x: 0, y: 0 };
    this.imageScale = 1;
    this.lockAxis = null; // 'x', 'y', or null (for no lock)
    
    // Create the UI
    this.createUI();
    
    // Initialize event listeners
    this.initEventListeners();
    
    console.log('ImageCropper initialized');
  }
  
  /**
   * Create the UI elements for the cropper
   */
  createUI() {
    // Remove any existing container
    const existingContainer = document.getElementById('image-cropper-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'image-cropper-container';
    this.container.className = 'image-cropper-container';
    
    // Create content wrapper
    const content = document.createElement('div');
    content.className = 'image-cropper-content';
    
    // Add title and instructions
    content.innerHTML = `
      <h2 class="image-cropper-title">Adjust Your Image</h2>
      <p class="image-cropper-subtitle">Your image will be printed on a canvas. Drag to position your image within the crop area.</p>
      
      <div class="image-cropper-area" id="image-cropper-area">
        <div class="crop-container" id="crop-container">
          <img id="crop-image" class="crop-image" />
          <div class="crop-box" id="crop-box">
            <div class="crop-handle nw" data-handle="nw"></div>
            <div class="crop-handle ne" data-handle="ne"></div>
            <div class="crop-handle se" data-handle="se"></div>
            <div class="crop-handle sw" data-handle="sw"></div>
          </div>
        </div>
      </div>
      
      <div class="aspect-ratio-buttons">
        <button id="ratio-30-40" class="ratio-button ratio-button-active">30x40</button>
        <button id="ratio-50-70" class="ratio-button">50x70</button>
      </div>
      
      <p class="crop-aspect-ratio-info">Select your preferred canvas size. Movement is restricted based on your image's orientation.</p>
      
      <div class="image-cropper-actions">
        <button id="image-cropper-cancel" class="image-cropper-button image-cropper-cancel">Cancel</button>
        <button id="image-cropper-apply" class="image-cropper-button image-cropper-apply">Apply</button>
      </div>
    `;
    
    // Add custom styles to document
    const styleElement = document.createElement('style');
    styleElement.id = 'image-cropper-styles';
    styleElement.textContent = `
      .image-cropper-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.95);
        z-index: 9999999;
        display: none;
        overflow: auto;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .image-cropper-content {
        position: relative;
        max-width: 900px;
        margin: 0 auto;
        padding: 30px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(0,0,0,0.2);
      }
      
      .image-cropper-title {
        text-align: center;
        font-size: 24px;
        margin-bottom: 20px;
        font-weight: bold;
      }
      
      .image-cropper-subtitle {
        text-align: center;
        font-size: 16px;
        margin-bottom: 30px;
        color: #666;
      }
      
      .image-cropper-area {
        position: relative;
        width: 100%;
        height: 400px;
        margin: 0 auto 20px;
        background-color: #f6f6f6;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .aspect-ratio-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .ratio-button {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 4px;
        border: 2px solid #ccc;
        background-color: #f5f5f5;
        color: #555;
        transition: all 0.2s ease;
      }
      
      .ratio-button:hover {
        background-color: #e8e8e8;
      }
      
      .ratio-button-active {
        border-color: #00C2FF;
        background-color: #e6f7ff;
        color: #0085b3;
      }
      
      .crop-container {
        position: relative;
        overflow: visible;
      }
      
      .crop-image {
        display: block;
        max-width: 100%;
        max-height: 100%;
        cursor: move;
      }
      
      .crop-box {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: 4px solid #00C2FF;
        box-shadow: 0 0 0 9999px rgba(255, 255, 255, 0.75);
      }
      
      .crop-handle {
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: #00C2FF;
        border-radius: 0;
      }
      
      .crop-handle.nw {
        top: -10px;
        left: -10px;
        cursor: nw-resize;
      }
      
      .crop-handle.ne {
        top: -10px;
        right: -10px;
        cursor: ne-resize;
      }
      
      .crop-handle.se {
        bottom: -10px;
        right: -10px;
        cursor: se-resize;
      }
      
      .crop-handle.sw {
        bottom: -10px;
        left: -10px;
        cursor: sw-resize;
      }
      
      .crop-aspect-ratio-info {
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
        color: #666;
      }
      
      .image-cropper-actions {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 30px;
      }
      
      .image-cropper-button {
        padding: 12px 30px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      
      .image-cropper-apply {
        background-color: #4CAF50;
        color: white;
        border: none;
      }
      
      .image-cropper-apply:hover {
        background-color: #3d8b40;
      }
      
      .image-cropper-cancel {
        background-color: #f5f5f5;
        color: #555;
        border: 1px solid #ccc;
      }
      
      .image-cropper-cancel:hover {
        background-color: #e8e8e8;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Add content to container
    this.container.appendChild(content);
    
    // Add container to body
    document.body.appendChild(this.container);
    
    // Store references to DOM elements
    this.cropArea = document.getElementById('image-cropper-area');
    this.cropContainer = document.getElementById('crop-container');
    this.cropImage = document.getElementById('crop-image');
    this.cropBox = document.getElementById('crop-box');
    this.applyButton = document.getElementById('image-cropper-apply');
    this.cancelButton = document.getElementById('image-cropper-cancel');
    this.ratio3040Button = document.getElementById('ratio-30-40');
    this.ratio5070Button = document.getElementById('ratio-50-70');
  }
  
  /**
   * Initialize the event listeners
   */
  initEventListeners() {
    // Mouse events for dragging
    this.cropImage.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events for mobile
    this.cropImage.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Button clicks
    this.applyButton.addEventListener('click', this.handleApply.bind(this));
    this.cancelButton.addEventListener('click', this.handleCancel.bind(this));
    
    // Aspect ratio buttons
    this.ratio3040Button.addEventListener('click', () => this.changeAspectRatio(3/4, '30x40'));
    this.ratio5070Button.addEventListener('click', () => this.changeAspectRatio(5/7, '50x70'));
  }
  
  /**
   * Change the aspect ratio and update the crop box
   * @param {number} ratio - The new aspect ratio (width/height)
   * @param {string} ratioLabel - Label for the selected ratio
   */
  changeAspectRatio(ratio, ratioLabel) {
    console.log(`Changing aspect ratio to ${ratioLabel} (${ratio})`);
    
    // Update the active button UI
    this.ratio3040Button.classList.toggle('ratio-button-active', ratio === 3/4);
    this.ratio5070Button.classList.toggle('ratio-button-active', ratio === 5/7);
    
    // Save the current position before changing the aspect ratio
    const previousPosition = { ...this.imagePosition };
    console.log('Previous position before ratio change:', previousPosition);
    
    // Store the previous crop box dimensions for reference
    const previousCropBoxWidth = this.cropContainer ? parseFloat(this.cropContainer.style.width) : 0;
    const previousCropBoxHeight = this.cropContainer ? parseFloat(this.cropContainer.style.height) : 0;
    
    // Calculate the center of the visible area in the previous crop box
    // The visible center X is (image.left + cropBox.width/2)
    // Since image.left is negative for positioning, we use: -imagePosition.x + cropBox.width/2
    const previousVisibleCenterX = -previousPosition.x + (previousCropBoxWidth / 2);
    const previousVisibleCenterY = -previousPosition.y + (previousCropBoxHeight / 2);
    
    console.log('Previous visible center:', previousVisibleCenterX, previousVisibleCenterY);
    
    // Update the aspect ratio
    this.options.aspectRatio = ratio;
    
    // Store current ratio selection in a global property to be accessed by other components
    if (window.imageProcessingManager) {
      window.imageProcessingManager.currentCropRatio = ratio;
      console.log(`Stored crop ratio ${ratio} (${ratioLabel}) globally`);
    }
    
    // If an image is loaded, update the crop box
    if (this.image) {
      this.setupCropArea(this.image, true);
      
      // After setupCropArea, get the new crop box dimensions
      const newCropBoxWidth = parseFloat(this.cropContainer.style.width);
      const newCropBoxHeight = parseFloat(this.cropContainer.style.height);
      
      // Calculate new position to maintain the same visible center point
      // For the new position, we calculate: -newPosition.x + newWidth/2 = previousVisibleCenterX
      // Therefore: newPosition.x = -(previousVisibleCenterX - newWidth/2)
      const newX = -(previousVisibleCenterX - (newCropBoxWidth / 2));
      const newY = -(previousVisibleCenterY - (newCropBoxHeight / 2));
      
      console.log('New crop box dimensions:', newCropBoxWidth, newCropBoxHeight);
      console.log('New calculated position:', newX, newY);
      
      // Apply the new position
      this.imagePosition = { x: newX, y: newY };
      this.lastImagePosition = { ...this.imagePosition };
      
      // Apply constraints to ensure the image stays within bounds
      this.updateImagePosition();
      
      console.log('Final position after constraints:', this.imagePosition);
    }
  }
  
  /**
   * Handle mouse down event
   */
  handleMouseDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.lastImagePosition = { ...this.imagePosition };
    
    console.log('Starting drag from position:', this.imagePosition.x, this.imagePosition.y);
  }
  
  /**
   * Handle mouse move event
   */
  handleMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    
    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    
    if (deltaX === 0 && deltaY === 0) return;
    
    // Apply movement constraints based on locked axis
    let newX = this.lastImagePosition.x;
    let newY = this.lastImagePosition.y;
    
    if (this.lockAxis === 'y') {
      // Only allow horizontal movement
      newX = this.lastImagePosition.x + deltaX;
    } else if (this.lockAxis === 'x') {
      // Only allow vertical movement
      newY = this.lastImagePosition.y + deltaY;
    } else {
      // Allow both directions (fallback)
      newX = this.lastImagePosition.x + deltaX;
      newY = this.lastImagePosition.y + deltaY;
    }
    
    console.log('Dragging - deltaX:', deltaX, 'deltaY:', deltaY, 'new position:', newX, newY, 'locked axis:', this.lockAxis);
    
    this.imagePosition.x = newX;
    this.imagePosition.y = newY;
    
    this.updateImagePosition();
  }
  
  /**
   * Handle mouse up event
   */
  handleMouseUp() {
    this.isDragging = false;
    this.lastImagePosition = { ...this.imagePosition };
  }
  
  /**
   * Handle touch start event
   */
  handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    this.isDragging = true;
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;
    this.lastImagePosition = { ...this.imagePosition };
    
    console.log('Starting touch drag from position:', this.imagePosition.x, this.imagePosition.y);
  }
  
  /**
   * Handle touch move event
   */
  handleTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.dragStartX;
    const deltaY = touch.clientY - this.dragStartY;
    
    if (deltaX === 0 && deltaY === 0) return;
    
    // Apply movement constraints based on locked axis
    let newX = this.lastImagePosition.x;
    let newY = this.lastImagePosition.y;
    
    if (this.lockAxis === 'y') {
      // Only allow horizontal movement
      newX = this.lastImagePosition.x + deltaX;
    } else if (this.lockAxis === 'x') {
      // Only allow vertical movement
      newY = this.lastImagePosition.y + deltaY;
    } else {
      // Allow both directions (fallback)
      newX = this.lastImagePosition.x + deltaX;
      newY = this.lastImagePosition.y + deltaY;
    }
    
    console.log('Touch dragging - deltaX:', deltaX, 'deltaY:', deltaY, 'new position:', newX, newY, 'locked axis:', this.lockAxis);
    
    this.imagePosition.x = newX;
    this.imagePosition.y = newY;
    
    this.updateImagePosition();
  }
  
  /**
   * Handle touch end event
   */
  handleTouchEnd() {
    this.isDragging = false;
    this.lastImagePosition = { ...this.imagePosition };
  }
  
  /**
   * Update the image position in the DOM
   */
  updateImagePosition() {
    // Get dimensions
    const imgWidth = this.cropImage.offsetWidth;
    const imgHeight = this.cropImage.offsetHeight;
    const cropBoxWidth = this.cropBox.offsetWidth - 8; // Subtract border width
    const cropBoxHeight = this.cropBox.offsetHeight - 8;
    
    // Calculate reasonable movement constraints
    // The constraints ensure the image can be positioned to show any part
    // within the crop box, but not move so far that it leaves empty space
    // or goes beyond the edges of the image
    
    // Original constraints (allowing empty space)
    // const minX = Math.min(0, cropBoxWidth - imgWidth);
    // const maxX = Math.max(0, imgWidth - cropBoxWidth);
    // const minY = Math.min(0, cropBoxHeight - imgHeight);
    // const maxY = Math.max(0, imgHeight - cropBoxHeight);
    
    // New constraints that prevent the crop box from extending beyond the image
    // For the minimum positions, we want to ensure the right/bottom of the image 
    // doesn't move past the right/bottom of the crop box
    // For the maximum positions, we want to ensure the left/top of the image
    // doesn't move past the left/top of the crop box
    const minX = -(imgWidth - cropBoxWidth);
    const maxX = 0;
    const minY = -(imgHeight - cropBoxHeight);
    const maxY = 0;
    
    // Apply constraints based on locked axis
    if (this.lockAxis === 'y') {
      // Only constrain horizontal movement
      this.imagePosition.x = Math.min(maxX, Math.max(minX, this.imagePosition.x));
    } else if (this.lockAxis === 'x') {
      // Only constrain vertical movement
      this.imagePosition.y = Math.min(maxY, Math.max(minY, this.imagePosition.y));
    } else {
      // Constrain both directions (fallback)
      this.imagePosition.x = Math.min(maxX, Math.max(minX, this.imagePosition.x));
      this.imagePosition.y = Math.min(maxY, Math.max(minY, this.imagePosition.y));
    }
    
    // Apply the position with transform for better performance
    this.cropImage.style.transform = `translate(${this.imagePosition.x}px, ${this.imagePosition.y}px)`;
    
    console.log('Updated image position:', this.imagePosition.x, this.imagePosition.y);
  }
  
  /**
   * Set up the crop area with the loaded image
   * @param {Image} img - The image element to use 
   * @param {boolean} preservePosition - Whether to preserve the current position (for aspect ratio changes)
   */
  setupCropArea(img, preservePosition = false) {
    // Set the image source
    this.cropImage.src = img.src;
    
    // Get original image dimensions
    const origImgWidth = img.width;
    const origImgHeight = img.height;
    console.log('Original image dimensions:', origImgWidth, 'x', origImgHeight);
    
    // Calculate image aspect ratio
    const imageAspectRatio = origImgWidth / origImgHeight;
    console.log('Image aspect ratio:', imageAspectRatio);
    
    // STEP 1: Define maximum allowed dimensions
    // Set reasonable max dimensions for the container
    const maxContainerWidth = Math.min(this.cropArea.parentElement.offsetWidth, 1024);
    const maxContainerHeight = Math.min(window.innerHeight * 0.7, 800); // 70% of viewport height, max 800px
    console.log('Max container dimensions:', maxContainerWidth, 'x', maxContainerHeight);
    
    // STEP 2: Calculate the scaled image dimensions based on aspect ratio
    let scaledImgWidth, scaledImgHeight;
    
    if (imageAspectRatio >= 1) {
      // Wide image (landscape or square) - constrain by width
      if (origImgWidth > maxContainerWidth) {
        // Scale down to fit width
        const scaleFactor = maxContainerWidth / origImgWidth;
        scaledImgWidth = Math.floor(origImgWidth * scaleFactor);
        scaledImgHeight = Math.floor(origImgHeight * scaleFactor);
        console.log('Wide image scaled by factor:', scaleFactor, 'to fit width');
      } else {
        // Already fits within width constraint
        scaledImgWidth = origImgWidth;
        scaledImgHeight = origImgHeight;
        console.log('Wide image not scaled (already fits width)');
      }
    } else {
      // Tall image (portrait) - constrain by height
      if (origImgHeight > maxContainerHeight) {
        // Scale down to fit height
        const scaleFactor = maxContainerHeight / origImgHeight;
        scaledImgWidth = Math.floor(origImgWidth * scaleFactor);
        scaledImgHeight = Math.floor(origImgHeight * scaleFactor);
        console.log('Tall image scaled by factor:', scaleFactor, 'to fit height');
      } else {
        // Already fits within height constraint
        scaledImgWidth = origImgWidth;
        scaledImgHeight = origImgHeight;
        console.log('Tall image not scaled (already fits height)');
      }
    }
    
    // Ensure we're not exceeding max dimensions in either direction
    if (scaledImgWidth > maxContainerWidth) {
      const additionalScaleFactor = maxContainerWidth / scaledImgWidth;
      scaledImgWidth = Math.floor(scaledImgWidth * additionalScaleFactor);
      scaledImgHeight = Math.floor(scaledImgHeight * additionalScaleFactor);
      console.log('Additional width scaling applied:', additionalScaleFactor);
    }
    
    if (scaledImgHeight > maxContainerHeight) {
      const additionalScaleFactor = maxContainerHeight / scaledImgHeight;
      scaledImgWidth = Math.floor(scaledImgWidth * additionalScaleFactor);
      scaledImgHeight = Math.floor(scaledImgHeight * additionalScaleFactor);
      console.log('Additional height scaling applied:', additionalScaleFactor);
    }
    
    console.log('Scaled image dimensions:', scaledImgWidth, 'x', scaledImgHeight);
    
    // STEP 3: Set the crop area container dimensions to exactly match the scaled image
    this.cropArea.style.width = `${scaledImgWidth}px`;
    this.cropArea.style.height = `${scaledImgHeight}px`;
    this.cropArea.style.paddingBottom = '0'; // Remove padding-based sizing
    this.cropArea.style.maxWidth = '100%'; // Ensure it doesn't overflow on small screens
    
    console.log('Crop area dimensions set to:', `${scaledImgWidth}px x ${scaledImgHeight}px`);
    
    // STEP 4: Size the image to exactly match the container
    this.cropImage.style.width = `${scaledImgWidth}px`;
    this.cropImage.style.height = `${scaledImgHeight}px`;
    
    // STEP 5: Create a crop box with the required aspect ratio that fits the image
    const targetRatio = this.options.aspectRatio; // ratio (width:height)
    let cropBoxWidth, cropBoxHeight;
    
    // Remove any existing lock classes
    this.cropImage.classList.remove('lock-x-axis', 'lock-y-axis');
    
    if (imageAspectRatio > targetRatio) {
      // Image is wider (more landscape) than the crop ratio
      // Fit crop box height to image height
      cropBoxHeight = scaledImgHeight;
      cropBoxWidth = cropBoxHeight * targetRatio;
      // Lock vertical movement (only allow horizontal adjustments)
      this.lockAxis = 'y';
      // Add class for CSS styling
      this.cropImage.classList.add('lock-y-axis');
      console.log('Using full HEIGHT for crop box (landscape image), locking Y axis movement');
    } else {
      // Image is taller (more portrait) than the crop ratio
      // Fit crop box width to image width
      cropBoxWidth = scaledImgWidth;
      cropBoxHeight = cropBoxWidth / targetRatio;
      // Lock horizontal movement (only allow vertical adjustments)
      this.lockAxis = 'x';
      // Add class for CSS styling
      this.cropImage.classList.add('lock-x-axis');
      console.log('Using full WIDTH for crop box (portrait image), locking X axis movement');
    }
    
    // Size the crop container to match crop box
    this.cropContainer.style.width = `${cropBoxWidth}px`;
    this.cropContainer.style.height = `${cropBoxHeight}px`;
    
    // Center the crop box in the container
    const cropBoxLeft = (scaledImgWidth - cropBoxWidth) / 2;
    const cropBoxTop = (scaledImgHeight - cropBoxHeight) / 2;
    
    this.cropContainer.style.position = 'absolute';
    this.cropContainer.style.left = `${cropBoxLeft}px`;
    this.cropContainer.style.top = `${cropBoxTop}px`;
    
    // Skip initializing position if we're preserving the current position
    if (!preservePosition) {
      // Initialize the image position. Instead of centering, we'll align the image 
      // to respect the edge constraints based on the image orientation.
      let initialImageX = 0;
      let initialImageY = 0;
      
      if (imageAspectRatio > targetRatio) {
        // For landscape images, we might want to initially position the image
        // to show the center portion horizontally
        initialImageX = -(scaledImgWidth - cropBoxWidth) / 2;
        // For Y axis, keep it at 0 to align with the top edge
      } else {
        // For portrait images, we might want to initially position the image
        // to show the center portion vertically
        initialImageY = -(scaledImgHeight - cropBoxHeight) / 2;
        // For X axis, keep it at 0 to align with the left edge
      }
      
      this.imagePosition = { x: initialImageX, y: initialImageY };
      this.lastImagePosition = { ...this.imagePosition };
      
      // Apply initial position
      this.updateImagePosition();
    }
    
    // Ensure crop box styling
    this.cropBox.style.boxShadow = '0 0 0 9999px rgba(255, 255, 255, 0.75)';
    this.cropBox.style.border = '4px solid #00C2FF';
    
    // Update cursor style based on lock direction
    if (this.lockAxis === 'y') {
      this.cropImage.style.cursor = 'ew-resize'; // Horizontal movement only
    } else if (this.lockAxis === 'x') {
      this.cropImage.style.cursor = 'ns-resize'; // Vertical movement only
    }
    
    console.log('Crop box dimensions:', cropBoxWidth, 'x', cropBoxHeight);
    console.log('Final setup - container:', scaledImgWidth, 'x', scaledImgHeight, 
                'crop box:', cropBoxWidth, 'x', cropBoxHeight);
  }
  
  /**
   * Load an image into the cropper
   */
  loadImage(source) {
    console.log('Loading image:', typeof source);
    
    return new Promise((resolve, reject) => {
      // Show the cropper
      this.show();
      
      // Create a new image to load the source
      const img = new Image();
      
      // Set crossOrigin to handle CORS issues
      if (typeof source === 'string' && source.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        this.originalImage = img;
        this.image = img;
        
        // Reset position
        this.imagePosition = { x: 0, y: 0 };
        this.lastImagePosition = { x: 0, y: 0 };
        
        // Setup the crop area with natural image dimensions
        this.setupCropArea(img);
        
        // Resolve the promise
        resolve();
      };
      
      img.onerror = (err) => {
        console.error('Error loading image:', err);
        reject(err);
      };
      
      // Load the image
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = (err) => {
          console.error('FileReader error:', err);
          reject(err);
        };
        reader.readAsDataURL(source);
      } else {
        reject(new Error('Invalid image source type'));
      }
    });
  }
  
  /**
   * Show the cropper
   */
  show() {
    this.container.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Hide the cropper
   */
  hide() {
    this.container.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  /**
   * Check if the cropper is currently visible
   * @returns {boolean} - Whether the cropper is visible
   */
  isVisible() {
    return this.container && this.container.style.display === 'block';
  }
  
  /**
   * Handle Apply button click
   */
  handleApply() {
    // Generate the cropped image
    const croppedImage = this.generateCroppedImage();
    
    // Create and dispatch event
    const event = new CustomEvent('crop-applied', {
      detail: {
        croppedImage,
        cropCoordinates: this.getCropCoordinates()
      }
    });
    
    document.dispatchEvent(event);
    
    // Hide the cropper
    this.hide();
  }
  
  /**
   * Handle Cancel button click
   */
  handleCancel() {
    // Create and dispatch event
    const event = new CustomEvent('crop-cancelled');
    document.dispatchEvent(event);
    
    // Hide the cropper
    this.hide();
  }
  
  /**
   * Generate a cropped version of the image
   */
  generateCroppedImage() {
    if (!this.originalImage) return null;
    
    const cropCanvas = document.createElement('canvas');
    const ctx = cropCanvas.getContext('2d');
    
    // Set canvas size to match crop box (maintain 3:4 ratio)
    cropCanvas.width = this.cropBox.offsetWidth - 8; // Subtract border width
    cropCanvas.height = this.cropBox.offsetHeight - 8;
    
    // Calculate scaling factor between original image and displayed image
    const displayedImgWidth = this.cropImage.offsetWidth;
    const displayedImgHeight = this.cropImage.offsetHeight;
    const originalImgWidth = this.originalImage.width;
    const originalImgHeight = this.originalImage.height;
    
    const scaleX = originalImgWidth / displayedImgWidth;
    const scaleY = originalImgHeight / displayedImgHeight;
    
    // Calculate source coordinates based on image position and scaling
    const sourceX = -this.imagePosition.x * scaleX;
    const sourceY = -this.imagePosition.y * scaleY;
    const sourceWidth = cropCanvas.width * scaleX;
    const sourceHeight = cropCanvas.height * scaleY;
    
    console.log('Cropping from source:', sourceX, sourceY, sourceWidth, sourceHeight);
    
    // Draw the cropped portion
    ctx.drawImage(
      this.originalImage,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, cropCanvas.width, cropCanvas.height
    );
    
    return cropCanvas.toDataURL('image/jpeg', 0.9);
  }
  
  /**
   * Get crop coordinates relative to the original image
   */
  getCropCoordinates() {
    if (!this.originalImage) return null;
    
    // Calculate scaling factor between original image and displayed image
    const displayedImgWidth = this.cropImage.offsetWidth;
    const displayedImgHeight = this.cropImage.offsetHeight;
    const originalImgWidth = this.originalImage.width;
    const originalImgHeight = this.originalImage.height;
    
    const scaleX = originalImgWidth / displayedImgWidth;
    const scaleY = originalImgHeight / displayedImgHeight;
    
    // Calculate source coordinates based on image position and scaling
    const sourceX = -this.imagePosition.x * scaleX;
    const sourceY = -this.imagePosition.y * scaleY;
    const sourceWidth = (this.cropBox.offsetWidth - 8) * scaleX; // Subtract border width
    const sourceHeight = (this.cropBox.offsetHeight - 8) * scaleY;
    
    return {
      x: sourceX,
      y: sourceY,
      width: sourceWidth,
      height: sourceHeight
    };
  }
}

// Make available globally
window.ImageCropper = ImageCropper; 