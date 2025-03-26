# Letzteshemd Aurora Theme

This is a custom implementation of the Cartoonique Aurora theme for Letzteshemd, which includes all the pixar transformation functionality from the original theme.

## Features

- Modern Aurora theme with improved aesthetics and user experience
- Fully integrated pixar transformation feature for product customization
- Custom product templates for pixar transform products
- Optimized for mobile and desktop viewing

## Pixar Transform Functionality

The pixar transformation feature allows customers to customize products by uploading their own images, which are then processed and transformed for high-quality printing on products.

### Using Pixar Transform Template

1. To assign a product to use the pixar transformation feature, change its template to "product.pixar-transform".

2. Access the product in the Shopify admin panel:
   - Go to Products > Select the product
   - Scroll down to "Theme template" section
   - Select "product.pixar-transform" from the dropdown

## Key Files

- `templates/product.pixar-transform.json` - Custom template for pixar transformation products
- `snippets/pixar-transform-file-input.liquid` - Main functionality for pixar transformation
- `assets/pixar-*.js` - JavaScript files for the pixar transformation functionality
- `assets/image-*.js` - Image processing JavaScript files
- `assets/unified-*.js` - API client JavaScript files

## Theme Settings

The theme uses a blue-based color scheme with:
- Primary button color: #4a7dbd
- Text color: #333333
- Clean modern interface with rounded elements

## Testing

Before pushing to production, test the following:
1. Pixar transformation functionality on the product detail page
2. Image upload and transformation process
3. Mobile responsiveness
4. Cart functionality
5. Checkout process with transformed products 