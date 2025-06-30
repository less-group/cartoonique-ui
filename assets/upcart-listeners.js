document.addEventListener('DOMContentLoaded', () => {
  // @ts-ignore
  window.upcartOnCartLoaded = async (cart) => {
    const lineItems = cart.items;
    for (const lineItem of lineItems) {
      const watermarkedImageUrl = lineItem.properties?.['_watermarked_image_url'];

      if (!watermarkedImageUrl) {
        continue;
      }

      const upCartWrapper = document.getElementById('upCart');
      const upCartLineItemImageWrapper = upCartWrapper?.querySelector(`[id='${lineItem.key}']`);
      const lineItemImage = upCartLineItemImageWrapper?.querySelector('img');

      if (!lineItemImage) {
        return;
      }

      lineItemImage.setAttribute('src', watermarkedImageUrl);
    }
  };
});
