class FaceSwapFileInputWrapper extends HTMLElement {
  constructor() {
    super();

    const sectionId = this.dataset.sectionId ?? '';

    this.cartDrawer = document.getElementById('cart-drawer');

    // @ts-ignore
    this.productVariants = window?.selectedProductVariants ?? [];
    this.productColor = this.dataset.color ?? null;
    // @ts-ignore
    this.watermarkImage = window?.watermarkImage ?? null;
    // @ts-ignore
    this.faceSwapResultImageType = window?.faceSwapResultImageType ?? 'product_image';

    this.popup = this.querySelector('[data-faceswap-popup]');
    this.popupContent = this.popup?.querySelector('[data-popup-content]');
    this.openPopupButton = this.querySelector(`#popup-open-btn-${sectionId}`);
    this.closePopupButton = this.popup?.querySelector('[data-close-faceswap-popup]');
    this.helpTextPopupContainer = this.popup?.querySelector('[data-help-popup-text]');

    this.resultWrapper = this.querySelector('[data-result-wrapper]');
    this.resultImageWrapper = this.resultWrapper?.querySelector('[data-result-image-wrapper]');
    this.helpTextResultContainer = this.resultWrapper?.querySelector('[data-help-result-text]');

    this.progressBarWrapper = this.popup?.querySelector('[data-popup-progress-bar-wrapper]');
    this.progressBar = this.popup?.querySelector('[data-progress-bar]');

    //@ts-ignore
    this.progressBarSettings = window?.progressBarSettings ?? {
      containerBackgroundColor: '#f3f3f3',
      backgroundColor: '#4caf50',
      textColor: '#fff',
      speed: 1,
    };

    this.fileInput = this.querySelector(`#file-input-wrapper__input-${sectionId}`);
    this.uploadButton = this.querySelector(`#upload-button-${sectionId}`);

    this.productId = this.dataset.productId || null;
    this.productVariantId = this.dataset.productVariantId || null;
    this.customerId = this.dataset.customerId || null;
    this.targetImageUrl = this.dataset.targetImageUrl || null;
    this.printImageUrl = this.dataset.printImageUrl || null;

    this.orderId = null;
    this.processedImageUrl = null;
    this.processedPrintImageUrl = null;
    this.watermarkedImageUrl = null;

    this.addImageUrlToProductInCartListener = this.addImageUrlToProductInCart.bind(this);
    this.faceSwapImageListener = this.faceSwapImage.bind(this);
    this.triggerFileInputListener = this.triggerFileInput.bind(this);
    this.openPopupListener = this.openPopup.bind(this);
    this.closePopupListener = this.closePopup.bind(this);
    this.checkPopupHasScrollListener = this.checkPopupHasScroll.bind(this);
    this.onRefreshDefaultCartListener = this.onRefreshDefaultCart.bind(this);
    this.onUpdateSelectedVariantListener = this.onUpdateSelectedVariant.bind(this);

    this.progressBarListener = this.createProgressBar();
    this.faceSwapRequestController = new AbortController();
    this.isFaceSwapping = false;
  }

  connectedCallback() {
    this.initProgressBarSettings();
    this.initUpCartListeners();

    document.addEventListener('variant:change', this.onUpdateSelectedVariantListener);
    document.addEventListener('variant:add', this.addImageUrlToProductInCartListener);
    document.addEventListener('cart:refresh', this.onRefreshDefaultCartListener);

    this.fileInput?.addEventListener('change', this.faceSwapImageListener);
    this.uploadButton?.addEventListener('click', this.triggerFileInputListener);
    this.openPopupButton?.addEventListener('click', this.openPopupListener);
    this.closePopupButton?.addEventListener('click', this.closePopupListener);

    window.addEventListener('load', this.checkPopupHasScrollListener);
    window.addEventListener('resize', this.checkPopupHasScrollListener);
  }

  disconnectedCallback() {
    document.removeEventListener('variant:change', this.onUpdateSelectedVariantListener);
    document.removeEventListener('variant:add', this.addImageUrlToProductInCartListener);
    document.removeEventListener('cart:refresh', this.onRefreshDefaultCartListener);

    this.fileInput?.removeEventListener('change', this.faceSwapImageListener);
    this.uploadButton?.removeEventListener('click', this.triggerFileInputListener);
    this.openPopupButton?.removeEventListener('click', this.openPopupListener);
    this.closePopupButton?.removeEventListener('click', this.closePopupListener);

    window.removeEventListener('load', this.checkPopupHasScrollListener);
    window.removeEventListener('resize', this.checkPopupHasScrollListener);
  }

  onUpdateSelectedVariant(event) {
    this.clearFaceSwapData();

    const newVariantId = event.detail.variant.id;
    const currentPreviewImage = event.detail.variant.featured_image.src;
    const prevPreviewImage = this.targetImageUrl;

    const [preivewImageName] = currentPreviewImage.split('/').at(-1).split('?');
    const newPreviewImageUrl = prevPreviewImage?.replace(/\/[^/]+\.[a-z]+$/, `/${preivewImageName}`) ?? '';

    const newColor = this.productVariants.find(({ id }) => +id === +newVariantId)?.current_color?.toLowerCase() ?? null;

    this.productVariantId = newVariantId;
    this.targetImageUrl = newPreviewImageUrl;
    this.productColor = newColor;
  }

  initUpCartListeners() {
    // @ts-ignore
    window.upcartOnAddToCart = async (id, quantity, lineItem) => {
      const upCartWrapper = document.getElementById('upCart');

      if (!upCartWrapper || !this.processedImageUrl || !this.watermarkedImageUrl || !this.productVariantId || !this.processedPrintImageUrl) {
        return;
      }

      try {
        // @ts-ignore
        window.upcartModifyCart = (cart) => {
          for (const lineItem of cart.items) {
            if (lineItem.variant_id !== +(this.productVariantId ?? 0)) {
              continue;
            }

            lineItem.properties = {
              _processed_image_url: this.processedImageUrl,
              _watermarked_image_url: this.watermarkedImageUrl,
              _processed_print_image_url: this.processedPrintImageUrl,
            };
          }

          return cart;
        };

        await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: lineItem.key,
            properties: {
              _processed_image_url: this.processedImageUrl,
              _watermarked_image_url: this.watermarkedImageUrl,
              _processed_print_image_url: this.processedPrintImageUrl,
            },
          }),
        });

        // @ts-ignore
        window.upcartRefreshCart();
      } catch (err) {
        console.error('Error occurred while removing existing product: ', err);
      }
    };
  }

  updateUpCartLineItemImage(lineItemId, imageUrl) {
    const upCartWrapper = document.getElementById('upCart');
    const upCartLineItemImageWrapper = upCartWrapper?.querySelector(`[id='${lineItemId}']`);
    const lineItemImage = upCartLineItemImageWrapper?.querySelector('img');

    if (!lineItemImage) {
      return;
    }

    lineItemImage.setAttribute('src', imageUrl);
  }

  onRefreshDefaultCart(event) {
    const afterFaceSwap = event?.detail?.afterFaceSwap ?? false;

    if (!afterFaceSwap) {
      return;
    }

    this.cartDrawer?.setAttribute('open', '');
  }

  checkPopupHasScroll() {
    //@ts-ignore
    if (this.popup.scrollHeight > this.popup.clientHeight) {
      //@ts-ignore
      this.popup.classList.add('has-scroll');
    } else {
      //@ts-ignore
      this.popup.classList.remove('has-scroll');
    }
  }

  initProgressBarSettings() {
    document.documentElement.style.setProperty('--progressbar-container-background-color', this.progressBarSettings.containerBackgroundColor);
    document.documentElement.style.setProperty('--progressbar-background-color', this.progressBarSettings.backgroundColor);
    document.documentElement.style.setProperty('--progressbar-text-color', this.progressBarSettings.textColor);
  }

  createProgressBar() {
    let fillInterval;
    let displayInterval;

    const start = () => {
      // @ts-ignore
      this.progressBar.textContent = '0%';

      const duration = this.progressBarSettings.speed * 1000;

      let currentPercentage = 0;
      const maxPercentage = 100;

      const fillIntervalRate = 100;
      const displayIntervalRate = duration / maxPercentage
      const totalFillSteps = duration / fillIntervalRate;
      const fillRate = maxPercentage / totalFillSteps;

      fillInterval = setInterval(() => {
        if (currentPercentage < maxPercentage) {
          currentPercentage += fillRate;
          // @ts-ignore
          this.progressBar.style.width = `${Math.min(currentPercentage, maxPercentage)}%`;
        } else {
          clearInterval(fillInterval);
        }
      }, fillIntervalRate);

      let displayPercentage = 0;
      displayInterval = setInterval(() => {
        if (displayPercentage < maxPercentage) {
          displayPercentage += 1;
          // @ts-ignore
          this.progressBar.textContent = `${Math.min(displayPercentage, maxPercentage).toFixed(0)}%`;
        } else {
          clearInterval(displayInterval);
        }
      }, displayIntervalRate);
    };

    const clear = () => {
      clearInterval(fillInterval);
      clearInterval(displayInterval);

      // @ts-ignore
      this.progressBar.textContent = '0%';
      // @ts-ignore
      this.progressBar.style.width = '0%';
    };

    return { start, clear };
  }
  // createProgressBar() {
  //   let fillInterval;
  //   let displayInterval;

  //   const start = () => {
  //     // @ts-ignore
  //     this.progressBar.textContent = '0%';

  //     let currentPercentage = 0;
  //     const maxPercentage = 100;
  //     const fillRate = maxPercentage / 100;
  //     const displayRate = 10;

  //     fillInterval = setInterval(() => {
  //       if (currentPercentage < maxPercentage) {
  //         currentPercentage += fillRate;
  //         // @ts-ignore
  //         this.progressBar.style.width = `${Math.min(currentPercentage, maxPercentage)}%`;
  //       } else {
  //         clearInterval(fillInterval);
  //       }
  //     }, 100);

  //     let displayPercentage = 0;
  //     displayInterval = setInterval(() => {
  //       if (displayPercentage < maxPercentage) {
  //         displayPercentage += displayRate / 10;
  //         // @ts-ignore
  //         this.progressBar.textContent = `${Math.min(displayPercentage, maxPercentage).toFixed(0)}%`;
  //       } else {
  //         clearInterval(displayInterval);
  //       }
  //     }, 100);
  //   };

  //   const clear = () => {
  //     clearInterval(fillInterval);
  //     clearInterval(displayInterval);

  //     // @ts-ignore
  //     this.progressBar.textContent = '0%';
  //     // @ts-ignore
  //     this.progressBar.style.width = '0%';
  //   };

  //   return { start, clear };
  // }

  async addImageUrlToProductInCart(event) {
    const { cart } = event.detail;

    if (!this.processedImageUrl || !this.processedPrintImageUrl || !this.watermarkedImageUrl) {
      return;
    }

    const lineItem = cart.items.find(({ variant_id }) => +variant_id === +(this.productVariantId ?? 0));

    this.cartDrawer?.removeAttribute('open');

    if (lineItem) {
      try {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: lineItem.key,
            quantity: (lineItem.quantity ?? 1) - 1,
          }),
        });
      } catch (err) {
        console.error('Error occurred while removing existing product: ', err);
      }
    }

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.productVariantId,
          quantity: 1,
          properties: {
            _processed_image_url: this.processedImageUrl,
            _watermarked_image_url: this.watermarkedImageUrl,
            _processed_print_image_url: this.processedPrintImageUrl,
          },
        }),
      });

      if (response.ok && this.processedImageUrl && this.watermarkedImageUrl) {
        document.dispatchEvent(
          new CustomEvent('cart:refresh', {
            detail: {
              afterFaceSwap: true,
            },
          })
        );
      }
    } catch (err) {
      console.error('Error occured while updating product attribute: ', err);
    }
  }

  async faceSwapImage(event) {
    const file = event?.target?.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    this.clearHelpPopupText();

    if (!file?.type?.startsWith('image/')) {
      this.appendPopupHelpText('Ungültiger Dateityp. Bitte lade ein Bild hoch', { isError: true, clearPrevText: true });

      event.target.value = '';
      return;
    }

    if (file?.size > maxSize) {
      this.appendPopupHelpText('Die Datei ist zu groß. Die maximale Größe beträgt 5 MB.', { isError: true, clearPrevText: true });

      event.target.value = '';
      return;
    }

    const formData = new FormData();

    formData.append('sourceImage', file);
    formData.append('targetImage', this?.targetImageUrl ?? '');
    formData.append('printImage', this?.printImageUrl ?? '');
    formData.append('productId', this?.productId ?? '');
    formData.append('customerId', this?.customerId ?? '');
    formData.append('orderId', this?.orderId ?? '');
    formData.append('productColor', this?.productColor ?? '');
    formData.append('watermarkImage', JSON.stringify(this?.watermarkImage) ?? '');
    formData.append('faceSwapResultImageType', this.faceSwapResultImageType ?? '');

    try {
      this.isFaceSwapping = true;
      this.hidePopupContent();
      this.setDisableUploadButton(true);
      this.showLoader();
      this.progressBarListener.start();
      this.appendPopupHelpText('Das Herunterladen kann bis zu 1-2 Minuten dauern.');
      this.checkPopupHasScroll();

      const res = await fetch('https://letzteshemd-faceswap-api-production.up.railway.app/faceswap/', {
        method: 'POST',
        body: formData,
        signal: this.faceSwapRequestController.signal,
      });

      const { watermarkedOriginalImageUrl = null, watermarkedImageUrlToShow = null, processedImageUrl = null, processedPrintImageUrl = null, success = false, message = '' } = await res.json();

      if (!success || !watermarkedOriginalImageUrl || !processedImageUrl || !watermarkedImageUrlToShow) {
        const errorText = message || 'Etwas ist schief gelaufen, erneut versuchen';

        this.showPopupContent();
        this.appendPopupHelpText(errorText, { isError: true, clearPrevText: true });

        return;
      }

      this.isFaceSwapping = false;
      this.watermarkedImageUrl = watermarkedOriginalImageUrl;
      this.processedImageUrl = processedImageUrl;
      this.processedPrintImageUrl = processedPrintImageUrl;

      this.closePopup();
      this.appendHelpResultText('Der Gesichtstausch war erfolgreich. Lege den Artikel in deinen Warenkorb, um den Artikel mit dem neuen Gesicht zu bestellen.');
      this.appendResult(watermarkedImageUrlToShow);
    } catch (err) {
      this.isFaceSwapping = false;
      this.showPopupContent();
      this.hideLoader();
      this.appendPopupHelpText(err?.message ?? 'Error occured while sending file', { isError: true, clearPrevText: true });
      console.error('Error occured while sending file: ', err);
    } finally {
      this.progressBarListener.clear();
      this.setDisableUploadButton(false);
      this.hideLoader();

      // @ts-ignore
      this.fileInput.value = '';
    }
  }

  hidePopupContent() {
    // @ts-ignore
    this.popupContent.classList.add('disabled');
    // @ts-ignore
    this.progressBarWrapper.classList.remove('disabled');
  }

  showPopupContent() {
    // @ts-ignore
    this.popupContent.classList.remove('disabled');
    // @ts-ignore
    this.progressBarWrapper.classList.add('disabled');
  }

  createImage(imageUrl, alt) {
    const image = document.createElement('img');
    image.setAttribute('src', imageUrl);
    image.setAttribute('alt', alt);

    return image;
  }

  setDisableUploadButton(disabled = true) {
    if (disabled) {
      // @ts-ignore
      this.uploadButton.setAttribute('disabled', '');

      return;
    }

    // @ts-ignore
    this.uploadButton.removeAttribute('disabled');
  }

  openPopup() {
    this.hideLoader();
    this.showPopupContent();
    this.clearHelpPopupText();
    this.setDisableUploadButton(false);

    this.faceSwapRequestController = new AbortController();

    this.popup?.classList.add('open');
    document.documentElement.classList.add('lock');
  }

  clearFaceSwapData() {
    this.clearHelpResultText();
    this.clearResultImageWrapper();

    this.watermarkedImageUrl = null;
    this.processedImageUrl = null;
  }

  abortFaceSwap() {
    this.faceSwapRequestController.abort();

    this.clearFaceSwapData();
  }

  closePopup() {
    if (this.isFaceSwapping) {
      this.abortFaceSwap();
    }

    this.progressBarListener.clear();
    this.popup?.classList.remove('open');
    document.documentElement.classList.remove('lock');
  }

  triggerFileInput() {
    // @ts-ignore
    this.fileInput?.click?.();
  }

  showLoader() {
    this.uploadButton?.setAttribute('aria-busy', 'true');
  }

  hideLoader() {
    this.uploadButton?.setAttribute('aria-busy', 'false');
  }

  appendResult(imageUrl) {
    const resultImage = this.createImage(imageUrl, 'Result FaceSwap Image');

    // @ts-ignore
    this.resultImageWrapper.innerHTML = '';

    // @ts-ignore
    this.resultImageWrapper.appendChild(resultImage);

    // @ts-ignore
    this.resultWrapper.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  appendPopupHelpText(helpText, { isError = false, clearPrevText = false } = {}) {
    const className = `upload-popup__${isError ? 'error-text' : 'help-text'}`;

    const helpTextParagraph = document.createElement('p');
    helpTextParagraph.classList.add(className);

    helpTextParagraph.innerHTML = helpText;

    if (clearPrevText) {
      // @ts-ignore
      this.helpTextPopupContainer.innerHTML = '';
    }

    // @ts-ignore
    this.helpTextPopupContainer.appendChild(helpTextParagraph);
  }

  appendHelpResultText(helpText, { clearPrevText = false } = {}) {
    const helpTextParagraph = document.createElement('p');
    helpTextParagraph.classList.add('upload-popup__help-text');

    helpTextParagraph.innerHTML = helpText;

    if (clearPrevText) {
      this.clearHelpResultText();
    }

    // @ts-ignore
    this.helpTextResultContainer.appendChild(helpTextParagraph);
  }

  clearHelpResultText() {
    // @ts-ignore
    this.helpTextResultContainer.innerHTML = '';
  }

  clearHelpPopupText() {
    // @ts-ignore
    this.helpTextPopupContainer.innerHTML = '';
  }

  clearResultImageWrapper() {
    // @ts-ignore
    this.resultImageWrapper.innerHTML = '';
  }
}

window.customElements.define('face-swap-file-input-wrapper', FaceSwapFileInputWrapper);
