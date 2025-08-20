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
    this.attachShadow({ mode: "open" });

    // State
    this.isDialogOpen = false;
    this.resolveDialogPromise = null;
    this.rejectDialogPromise = null;

    // Dialog options
    this.options = {
      imageUrl: "",
      defaultNames: {
        name1: "",
        name2: "",
        subtitle: "",
      },
    };

    // Cache for faster rendering
    this.cachedImage = null;

    // Keep track of the currently selected crop ratio
    this.currentAspectRatio =
      window.imageProcessingManager?.currentCropRatio || 3 / 4;

    console.log("PixarTextOverlay constructed");
  }

  connectedCallback() {
    console.log("PixarTextOverlay connected");
    this.render();
  }

  disconnectedCallback() {
    console.log("PixarTextOverlay disconnected");
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
    const style = document.createElement("style");
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
        position: relative;
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
        font-size: 30px;
        color: #555;
        transition: color 0.2s;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
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
      .inputs-container input::placeholder,
      .subtitle-container input::placeholder {
    	font-size: 12px;
      }
      .inputs-container input,
      .subtitle-container input {
    	box-sizing: border-box;
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
    const dialogOverlay = document.createElement("div");
    dialogOverlay.className = "dialog-overlay";
    dialogOverlay.style.display = "none";

    const dialogContainer = document.createElement("div");
    dialogContainer.className = "dialog-container";

    const dialogHeader = document.createElement("div");
    dialogHeader.className = "dialog-header";

    const dialogTitle = document.createElement("h3");
    dialogTitle.className = "dialog-title";
    dialogTitle.textContent = "Add Your Names";

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => this.closeDialog(false));

    dialogHeader.appendChild(dialogTitle);
    dialogContainer.appendChild(closeButton);

    const dialogContent = document.createElement("div");
    dialogContent.className = "dialog-content";

    // Create preview container
    const previewContainer = document.createElement("div");
    previewContainer.className = "preview-container";

    const previewImage = document.createElement("img");
    previewImage.className = "preview-image";
    previewImage.alt = "Preview";

    previewContainer.appendChild(previewImage);

    // Add preview container to content first
    dialogContent.appendChild(previewContainer);

    // Create name inputs container
    const inputsContainer = document.createElement("div");
    inputsContainer.className = "inputs-container";

    // First input
    const inputWrapper1 = document.createElement("div");
    inputWrapper1.style.flex = "1";

    // add label
    const nameInput1Label = document.createElement("label");
    nameInput1Label.className = "subtitle-label";
    nameInput1Label.textContent = "Person One";
    nameInput1Label.htmlFor = "nameInput1";

    const nameInput1 = document.createElement("input");
    nameInput1.type = "text";
    nameInput1.id = "nameInput1";
    nameInput1.placeholder = "Enter his name";
    nameInput1.maxLength = 15; // Add a hard character limit

    // character limit of 15
    // Create character counter element
    const nameInput1CharCounter = document.createElement("div");
    nameInput1CharCounter.className = "nameInput1-char-counter";
    nameInput1CharCounter.style.fontSize = "12px";
    nameInput1CharCounter.style.color = "#666";
    nameInput1CharCounter.style.marginTop = "5px";
    nameInput1CharCounter.style.display = "none";

    // Create warning message
    const nameInput1warningMessage = document.createElement("div");
    nameInput1warningMessage.className = "nameInput1-warning";
    nameInput1warningMessage.style.fontSize = "12px";
    nameInput1warningMessage.style.color = "#e74c3c";
    nameInput1warningMessage.style.marginTop = "5px";
    nameInput1warningMessage.style.display = "none";
    nameInput1warningMessage.textContent = "Person One Name may be truncated";
    // character limit of 15

    // Use more efficient immediate input handling with RAF for smoother rendering
    nameInput1.addEventListener("input", () => {
      const maxChars = 15;
      const text = nameInput1.value;

      // Update character counter
      if (text.length > maxChars * 0.7) {
        nameInput1CharCounter.style.display = "block";
        nameInput1CharCounter.textContent = `${text.length}/${maxChars} characters`;

        // Change color based on length
        if (text.length > maxChars) {
          nameInput1CharCounter.style.color = "#e74c3c"; // Red for over limit
          nameInput1CharCounter.style.borderColor = "#e74c3c";
          nameInput1warningMessage.style.display = "block";
        } else if (text.length > maxChars * 0.9) {
          nameInput1CharCounter.style.color = "#e67e22"; // Orange for close to limit
          nameInput1.style.borderColor = "#e67e22";
          nameInput1warningMessage.style.display = "block";
        } else {
          nameInput1CharCounter.style.color = "#666"; // Default gray
          nameInput1.style.borderColor = "";
          nameInput1warningMessage.style.display = "none";
        }
      } else {
        nameInput1CharCounter.style.display = "none";
        nameInput1warningMessage.style.display = "none";
        nameInput1.style.borderColor = "";
      }

      if (!this._updatePending) {
        this._updatePending = true;
        requestAnimationFrame(() => {
          this.updatePreview();
          this._updatePending = false;
        });
      }
    });

    inputWrapper1.appendChild(nameInput1Label);
    inputWrapper1.appendChild(nameInput1);
    inputWrapper1.appendChild(nameInput1CharCounter);
    inputWrapper1.appendChild(nameInput1warningMessage);

    // Second input
    const inputWrapper2 = document.createElement("div");
    inputWrapper2.style.flex = "1";

    // add label
    const nameInput2Label = document.createElement("label");
    nameInput2Label.className = "subtitle-label";
    nameInput2Label.textContent = "Person Two";
    nameInput2Label.htmlFor = "nameInput2";

    const nameInput2 = document.createElement("input");
    nameInput2.type = "text";
    nameInput2.id = "nameInput2";
    nameInput2.placeholder = "Enter her name";
    nameInput2.maxLength = 15; // Add a hard character limit

    // character limit of 15
    // Create character counter element
    const nameInput2CharCounter = document.createElement("div");
    nameInput2CharCounter.className = "nameInput2-char-counter";
    nameInput2CharCounter.style.fontSize = "12px";
    nameInput2CharCounter.style.color = "#666";
    nameInput2CharCounter.style.marginTop = "5px";
    nameInput2CharCounter.style.display = "none";

    // Create warning message
    const nameInput2warningMessage = document.createElement("div");
    nameInput2warningMessage.className = "nameInput2-warning";
    nameInput2warningMessage.style.fontSize = "12px";
    nameInput2warningMessage.style.color = "#e74c3c";
    nameInput2warningMessage.style.marginTop = "5px";
    nameInput2warningMessage.style.display = "none";
    nameInput2warningMessage.textContent = "Person Two Name may be truncated";
    // character limit of 15

    // Use more efficient immediate input handling with RAF for smoother rendering
    nameInput2.addEventListener("input", () => {
      const maxChars = 15;
      const text = nameInput2.value;

      // Update character counter
      if (text.length > maxChars * 0.7) {
        nameInput2CharCounter.style.display = "block";
        nameInput2CharCounter.textContent = `${text.length}/${maxChars} characters`;

        // Change color based on length
        if (text.length > maxChars) {
          nameInput2CharCounter.style.color = "#e74c3c"; // Red for over limit
          nameInput2CharCounter.style.borderColor = "#e74c3c";
          nameInput2warningMessage.style.display = "block";
        } else if (text.length > maxChars * 0.9) {
          nameInput2CharCounter.style.color = "#e67e22"; // Orange for close to limit
          nameInput2.style.borderColor = "#e67e22";
          nameInput2warningMessage.style.display = "block";
        } else {
          nameInput2CharCounter.style.color = "#666"; // Default gray
          nameInput2.style.borderColor = "";
          nameInput2warningMessage.style.display = "none";
        }
      } else {
        nameInput2CharCounter.style.display = "none";
        nameInput2warningMessage.style.display = "none";
        nameInput2.style.borderColor = "";
      }

      if (!this._updatePending) {
        this._updatePending = true;
        requestAnimationFrame(() => {
          this.updatePreview();
          this._updatePending = false;
        });
      }
    });

    inputWrapper2.appendChild(nameInput2Label);
    inputWrapper2.appendChild(nameInput2);
    inputWrapper2.appendChild(nameInput2CharCounter);
    inputWrapper2.appendChild(nameInput2warningMessage);

    // Add inputs to container
    inputsContainer.appendChild(inputWrapper1);
    inputsContainer.appendChild(inputWrapper2);

    // Add inputs after preview
    dialogContent.appendChild(inputsContainer);

    // Add subtitle input
    const subtitleContainer = document.createElement("div");
    subtitleContainer.className = "subtitle-container";

    const subtitleLabel = document.createElement("label");
    subtitleLabel.className = "subtitle-label";
    subtitleLabel.textContent = "Subtitle";
    subtitleLabel.htmlFor = "subtitle-input";

    const subtitleInput = document.createElement("input");
    subtitleInput.type = "text";
    subtitleInput.id = "subtitle-input";
    subtitleInput.placeholder = "based on a true story - your text here";
    subtitleInput.maxLength = 35; // Add a hard character limit

    // Create character counter element
    const subtitleCharCounter = document.createElement("div");
    subtitleCharCounter.className = "subtitle-char-counter";
    subtitleCharCounter.style.fontSize = "12px";
    subtitleCharCounter.style.color = "#666";
    subtitleCharCounter.style.marginTop = "5px";
    subtitleCharCounter.style.display = "none";

    // Create warning message
    const warningMessage = document.createElement("div");
    warningMessage.className = "subtitle-warning";
    warningMessage.style.fontSize = "12px";
    warningMessage.style.color = "#e74c3c";
    warningMessage.style.marginTop = "5px";
    warningMessage.style.display = "none";
    warningMessage.textContent =
      "Subtitle may be truncated or wrapped on the final image";

    // Use more efficient immediate input handling with RAF for smoother rendering
    subtitleInput.addEventListener("input", () => {
      const maxChars = 35;
      const text = subtitleInput.value;

      // Update character counter
      if (text.length > maxChars * 0.7) {
        subtitleCharCounter.style.display = "block";
        subtitleCharCounter.textContent = `${text.length}/${maxChars} characters`;

        // Change color based on length
        if (text.length > maxChars) {
          subtitleCharCounter.style.color = "#e74c3c"; // Red for over limit
          subtitleInput.style.borderColor = "#e74c3c";
          warningMessage.style.display = "block";
        } else if (text.length > maxChars * 0.9) {
          subtitleCharCounter.style.color = "#e67e22"; // Orange for close to limit
          subtitleInput.style.borderColor = "#e67e22";
          warningMessage.style.display = "block";
        } else {
          subtitleCharCounter.style.color = "#666"; // Default gray
          subtitleInput.style.borderColor = "";
          warningMessage.style.display = "none";
        }
      } else {
        subtitleCharCounter.style.display = "none";
        warningMessage.style.display = "none";
        subtitleInput.style.borderColor = "";
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
    const dialogFooter = document.createElement("div");
    dialogFooter.className = "dialog-footer";

    // const cancelButton = document.createElement("button");
    // cancelButton.className = "btn btn-cancel";
    // cancelButton.textContent = "Cancel";
    // cancelButton.addEventListener("click", () => this.closeDialog(false));

    const submitButton = document.createElement("button");
    submitButton.className = "btn btn-submit";
    submitButton.textContent = "Apply";
    submitButton.addEventListener("click", () => this.closeDialog(true));

    // dialogFooter.appendChild(cancelButton);
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
      const ctx = canvas.getContext("2d");

      // Use cached image if available and URL matches
      const useCache = this.cachedImage && this.cachedImage.src === imageUrl;

      const renderWithImage = (img) => {
        // Set canvas dimensions to match the image
        // Check if we need to use 50x70 aspect ratio based on crop selection
        const imageManager = window.imageProcessingManager;
        const is5070Selected =
          imageManager &&
          imageManager.currentCropRatio &&
          Math.abs(imageManager.currentCropRatio - 5 / 7) < 0.01;

        // Determine the target aspect ratio based on user's crop choice
        const targetRatio = is5070Selected ? 5 / 7 : 3 / 4; // Either 50x70 or 30x40 aspect ratio

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
        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          canvasWidth,
          canvasHeight,
          0,
          0,
          canvasWidth,
          canvasHeight
        );

        // updated code
        let width = canvasWidth;
        let height = canvasHeight;

        const name1 = names.name1?.toUpperCase() || "HIS";
        const name2 = names.name2?.toUpperCase() || "HER";
        const subtitle = names.subtitle || "your subtitle here";

        let displayText =
          name1 && name2
            ? `${name1} & ${name2}`
            : (name1 || name2 || "");
        let fontSize = Math.max(Math.floor(width / 5), 60);
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
        let line1measure = ctx.measureText(displayText);
        let textWidth = line1measure.width;
        const maxWidth = width * 0.9;

        console.log("fontSize : " + fontSize);

        // Reduce font size until text fits if needed
        if (textWidth > maxWidth) {
          const ratio = maxWidth / textWidth;
          fontSize = Math.floor(fontSize * ratio);

          ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
          line1measure = ctx.measureText(displayText);
          console.log("fontSize updated : " + fontSize);
        }

        // Add subtitle if provided
        const x = width / 2;

        let subtitleY = height * 0.975;

        let line2measure = null;

        // Calculate subtitle font size as a proportion of the main text size
        let subtitleFontSize = Math.max(Math.floor(fontSize * 0.4), 25);

        console.log("subtitleFontSize : " + subtitleFontSize);

        // Configure subtitle style - use italic for a more movie subtitle appearance
        ctx.font = `italic ${subtitleFontSize}px VersinaExtraBoldItalic, Montserrat, Arial, sans-serif`;

        if (subtitle) {
          ctx.fillStyle = "white"; // White text

          // Add shadow for readability
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          // Check if subtitle needs to be wrapped
          const maxSubtitleWidth = width * 0.9; // Use 90% of canvas width for subtitle
          line2measure = ctx.measureText(subtitle);
          let subtitleWidth = line2measure.width;

          if (subtitleWidth > maxSubtitleWidth) {
            const ratio = maxSubtitleWidth / subtitleWidth;
            subtitleFontSize = Math.floor(subtitleFontSize * ratio);

            ctx.font = `italic ${subtitleFontSize}px VersinaExtraBoldItalic, Montserrat, Arial, sans-serif`;
            line2measure = ctx.measureText(subtitle);
            console.log("subtitleFontSize updated : " + subtitleFontSize);
          }

          // Draw the subtitle as a single line
          ctx.fillText(subtitle, x, subtitleY); // pointy2
          console.log("subtitleY : " + subtitleY);
        } else {
          line2measure = ctx.measureText("your subtitle here");
        }

        const y =
          subtitleY -
          line2measure.actualBoundingBoxAscent -
          height * 0.025 -
          line1measure.actualBoundingBoxDescent;
        console.log("point y : " + y);

      if (name1 && name2) {
      const amp = "&";
        
      ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
      const name1Width = ctx.measureText(name1).width;
      const name2Width = ctx.measureText(name2).width;
      
      ctx.font = `900 ${fontSize * 1.15}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
      const ampWidth = ctx.measureText(amp).width;
      
      // Set back to main font to measure space width
      ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;
      const spacing = ctx.measureText(" ").width;
      
      // ✅ Correctly recalculate textWidth now
      const textWidth = name1Width + spacing + ampWidth + spacing + name2Width;

      const name1X = x - textWidth / 2 + name1Width / 2;
      const ampX = name1X + name1Width / 2 + spacing + ampWidth / 2;
      const name2X = ampX + ampWidth / 2 + spacing + name2Width / 2;

      // Set the same font on the main text
      ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;

      // Multiple shadow passes for a professional look
      // First pass: outer shadow
      ctx.fillStyle = "white";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = fontSize * 0.07;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = fontSize * 0.03;
      ctx.fillText(name1, name1X, y);

      // Second pass: deeper shadow for 3D effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = fontSize * 0.12;
      ctx.shadowOffsetY = fontSize * 0.05;
      ctx.fillText(name1, name1X, y);

      // Third pass: add subtle white glow
      ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
      ctx.shadowBlur = fontSize * 0.04;
      ctx.shadowOffsetY = 0;
      ctx.fillText(name1, name1X, y);

      // Set the same font on the main text
      ctx.font = `900 ${
        fontSize * 1.15
      }px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;

      ctx.fillStyle = "white";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = fontSize * 0.07;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = fontSize * 0.03;
      ctx.fillText(amp, ampX, y);

      // Second pass: deeper shadow for 3D effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = fontSize * 0.12;
      ctx.shadowOffsetY = fontSize * 0.05;
      ctx.fillText(amp, ampX, y);

      // Third pass: add subtle white glow
      ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
      ctx.shadowBlur = fontSize * 0.04;
      ctx.shadowOffsetY = 0;
      ctx.fillText(amp, ampX, y);

      // Set the same font on the main text
      ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;

      // Multiple shadow passes for a professional look
      // First pass: outer shadow
      ctx.fillStyle = "white";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = fontSize * 0.07;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = fontSize * 0.03;
      ctx.fillText(name2, name2X, y);

      // Second pass: deeper shadow for 3D effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = fontSize * 0.12;
      ctx.shadowOffsetY = fontSize * 0.05;
      ctx.fillText(name2, name2X, y);

      // Third pass: add subtle white glow
      ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
      ctx.shadowBlur = fontSize * 0.04;
      ctx.shadowOffsetY = 0;
      ctx.fillText(name2, name2X, y);
              
    } else {
        
        // Set the same font on the main text
        ctx.font = `900 ${fontSize}px Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif`;

        // Multiple shadow passes for a professional look
        // First pass: outer shadow
        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = fontSize * 0.07;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = fontSize * 0.03;
        ctx.fillText(displayText, x, y);

        // Second pass: deeper shadow for 3D effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = fontSize * 0.12;
        ctx.shadowOffsetY = fontSize * 0.05;
        ctx.fillText(displayText, x, y);

        // Third pass: add subtle white glow
        ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
        ctx.shadowBlur = fontSize * 0.04;
        ctx.shadowOffsetY = 0;
        ctx.fillText(displayText, x, y);
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
      img.crossOrigin = "anonymous"; // Handle CORS if needed

      // Set up the image load handler
      img.onload = () => {
        // Cache the loaded image
        this.cachedImage = img;
        renderWithImage(img);
      };

      // Handle image loading errors
      img.onerror = (err) => {
        console.error("Error loading image for rendering:", err);
        reject(new Error("Failed to load image for rendering"));
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
      function toTitleCase(str) {
        const exceptions = [
          "a",
          "an",
          "and",
          "is",
          "the",
          "of",
          "in",
          "on",
          "at",
          "to",
          "for",
          "but",
          "or",
          "nor",
          "with",
        ];

        return str
          .toLowerCase()
          .split(" ")
          .map((word, index) => {
            if (!exceptions.includes(word)) {
              return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
          })
          .join(" ");
      }

      // Get current values from inputs
      const name1 = this.nameInput1.value.trim();
      const name2 = this.nameInput2.value.trim();
      const subtitle = this.subtitleInput.value.trim();

      // Store values
      this.currentNames = {
        name1,
        name2,
        subtitle,
      };

      // Create canvas for rendering
      const canvas = document.createElement("canvas");

      // Render text on image
      const result = await this.renderTextOnCanvas(
        canvas,
        this.options.imageUrl,
        this.currentNames
      );

      // Update preview image
      this.previewImage.src = canvas.toDataURL("image/jpeg");
    } catch (error) {
      console.error("Error updating preview:", error);
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
    this.nameInput1.value = this.options.defaultNames.name1 || "";
    this.nameInput2.value = this.options.defaultNames.name2 || "";
    this.subtitleInput.value = this.options.defaultNames.subtitle || "";

    // Show dialog with animation
    this.classList.add("active");
    this.dialogOverlay.style.display = "flex";

    // Add event listener to block scrolling
    document.body.style.overflow = "hidden";

    // Determine if we need to adjust preview aspect ratio based on crop selection
    // Check if the image processing manager has selected a 50x70 crop
    const imageManager = window.imageProcessingManager;
    const is5070Selected =
      imageManager &&
      imageManager.currentCropRatio &&
      Math.abs(imageManager.currentCropRatio - 5 / 7) < 0.01;

    // Make sure previewContainer exists before trying to set its style
    if (this.previewContainer) {
      if (is5070Selected) {
        console.log("Using 50x70 aspect ratio for preview container");
        // Set the preview container aspect ratio to match 50x70
        this.previewContainer.style.aspectRatio = "5/7";
      } else {
        console.log("Using default 30x40 aspect ratio for preview container");
        // Ensure we use the default 30x40 aspect ratio
        this.previewContainer.style.aspectRatio = "3/4";
      }
    } else {
      console.error("Preview container not found in showDialog");
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
    this.classList.remove("active");
    this.dialogOverlay.style.display = "none";

    // Restore scrolling
    document.body.style.overflow = "";

    if (!completed) {
      this.isDialogOpen = false;
      this.previewImage.src = "";
      this.nameInput1.value = "";
      this.nameInput2.value = "";
      this.subtitleInput.value = "";

      if (
        window.railwayJobsStatus[window.imageProcessingManager.jobId] ==
        "COMPLETED"
      ) {
        const uploadContainer = document.getElementById(
          "direct-pixar-loader-container"
        );
        if (uploadContainer) {
          const uploadButton = uploadContainer.querySelector("button");
          if (uploadButton) {
            uploadButton.textContent = "TRANSFORM YOUR PHOTO";
            uploadButton.style.backgroundColor = "#4a7dbd";
          }
        }
      } else {
        window.railwayJobsStatus[window.imageProcessingManager.jobId] ==
          "FAILED";
        window.railwayApiCallsInProgress[
          window.imageProcessingManager.fileIdentifier
        ] == false;
        window.imageProcessingManager.isRailwayUrlNeeded = false;
      }
      const fileInput = pixarComponent
        ? pixarComponent.querySelector('input[type="file"]') ||
          (pixarComponent.fileInput ? pixarComponent.fileInput : null)
        : document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = ""; // This resets the file input
      }
      window.imageProcessingManager.originalImageDataUrl = null;
      window.imageProcessingManager.croppedImageDataUrl = null;
      window.imageProcessingManager.transformationComplete = false;
      window.imageProcessingManager.stylizedImageUrl = null;
      window.imageProcessingManager.stylizednonImageUrl = null;

      return;
    }

    // Resolve the promise
    if (this.resolveDialogPromise) {
      const names = completed
        ? {
            name1: this.nameInput1.value.trim(),
            name2: this.nameInput2.value.trim(),
            subtitle: this.subtitleInput.value.trim(), // Include subtitle in returned names
          }
        : this.options.defaultNames;

      this.resolveDialogPromise({
        completed,
        names,
      });

      this.resolveDialogPromise = null;
      this.rejectDialogPromise = null;
    }

    this.previewImage.src = "";
    this.nameInput1.value = "";
    this.nameInput2.value = "";
    this.subtitleInput.value = "";
    this.isDialogOpen = false;
  }

  /**
   * Apply text to an image
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Result with URL
   */
  async applyText(options) {
    console.log("Applying text to image with options:", options);

    // Get the names from options or current values
    const names = options.names || {
      name1: this.nameInput1?.value || "",
      name2: this.nameInput2?.value || "",
    };

    // Always render text - we'll use placeholders if fields are empty
    // Removed check for empty text since we'll always show at least placeholders

    try {
      // Create a canvas to render the image with text
      const canvas = document.createElement("canvas");

      // Render text on canvas using the same styling as preview
      await this.renderTextOnCanvas(canvas, options.imageUrl, names);

      // Return the canvas content as a data URL with higher quality
      const resultUrl = canvas.toDataURL("image/jpeg", 0.97);
      return { resultUrl };
    } catch (error) {
      console.error("Error applying text to image:", error);
      return { resultUrl: options.imageUrl }; // Return original on error
    }
  }
}

// Register the custom element
if (!customElements.get("pixar-text-overlay")) {
  customElements.define("pixar-text-overlay", PixarTextOverlay);
  console.log("PixarTextOverlay registered");
}
