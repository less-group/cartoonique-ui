# Pixar Text Overlay Integration Guide

This guide explains how to add the text overlay feature to the existing Pixar transformation workflow. This feature allows couples to add their names to stylized images directly on the frontend, without sending any text data to the backend.

## Overview

The text overlay feature consists of three main components:

1. **Text Overlay Component** (`pixar-text-overlay.js`): A custom element that displays a dialog allowing users to enter their names and see a live preview.

2. **Text Manager** (`pixar-text-manager.js`): A utility class that handles text overlay functionality and applies text to images.

3. **Integration Helper** (`pixar-integration.js`): Helps integrate the text overlay feature with the existing workflow.

## Implementation

### Step 1: Add Required Files

Add these files to your project's assets directory:

- `assets/pixar-text-overlay.js`
- `assets/pixar-text-manager.js`
- `assets/pixar-integration.js`

### Step 2: Include Scripts in Your HTML

Add these script tags to your HTML file (typically in the theme's product template):

```html
<script src="{{ 'pixar-text-overlay.js' | asset_url }}" defer></script>
<script src="{{ 'pixar-text-manager.js' | asset_url }}" defer></script>
<script src="{{ 'pixar-integration.js' | asset_url }}" defer></script>
```

### Step 3: Initialize Integration

Add this code to your main JavaScript file or in a script tag:

```javascript
document.addEventListener('DOMContentLoaded', async function() {
  // Wait for all components to load
  setTimeout(async () => {
    // Setup the text overlay integration
    await setupPixarTextOverlay();
  }, 1000);
});
```

## User Flow

1. User uploads an image
2. Immediately after upload, the name input dialog appears (no loading screen in between)
3. User enters their names and selects a format
4. After names are entered, the processing/generation screen appears
5. When the stylized image returns from RunPod, the entered text is applied
6. The final image with text is displayed to the user

## Important Notes

- **Client-Side Only**: All text processing happens on the client-side. No text data is sent to the backend.
- **Proper Sequence**: The name dialog appears immediately after upload, before any processing UI.
- **Original Image Only**: The original image without text is sent to RunPod for stylization.
- **Customization**: You can adjust the font, color, and position in the `pixar-text-overlay.js` file.
- **Browser Support**: This feature requires modern browser support for Canvas and Web Components.

## Troubleshooting

If the text overlay doesn't appear:

1. Check browser console for errors.
2. Ensure all script files are loaded correctly.
3. Verify that the component is correctly intercepting the transformation process.
4. Ensure the integration is initialized after all components are loaded.

## Advanced Configuration

You can pass options to the `setupPixarTextOverlay` function:

```javascript
await setupPixarTextOverlay({
  debug: true,                 // Enable debug logging
  sectionId: 'my-section-id'   // Target specific section
});
```

---

## Technical Details

### Data Flow

1. User uploads an image
2. Name input dialog appears immediately (frontend only)
3. User enters names and chooses format
4. After names are entered, the image is sent to RunPod
5. When stylized image returns, text is applied using Canvas
6. Final image with text is displayed to user

### Key Functions

- `showTextDialog(imageFile)`: Shows the text dialog for user input
- `applyTextToImage(imageUrl, text)`: Applies text to an image
- `setupTextOverlay()`: Sets up the integration with existing workflow

### Event Handling

The integration overwrites the transformImage method of the component to show the text dialog before processing, and listens for the `pixar:transform:complete` event to know when the stylized image is ready, then applies the text overlay. 