// Pet product pricing configuration for different currencies
const PET_PRICES = {
  // British Pounds
  GBP: {
    S: { price: 45, size: '20x30"' },
    M: { price: 55, size: '30x40"' },
    L: { price: 70, size: '50x70"' }
  },
  // US Dollars (converted from GBP at approximately 1.3x rate)
  USD: {
    S: { price: 59, size: '20x30"' },
    M: { price: 69, size: '30x40"' },
    L: { price: 89, size: '50x70"' }
  }
};

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  GBP: '£',
  USD: '$'
};

// Helper function to get price for a specific size and currency
function getPetPrice(size, currencyCode) {
  // Default to GBP if currency not supported
  const currency = currencyCode && PET_PRICES[currencyCode] ? currencyCode : 'GBP';
  const priceData = PET_PRICES[currency][size];
  const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.GBP;
  
  return {
    price: priceData.price,
    formattedPrice: `${symbol}${priceData.price}`,
    size: priceData.size,
    currency: currency,
    symbol: symbol
  };
}

// Helper function to get all prices for a currency
function getAllPetPrices(currencyCode) {
  const currency = currencyCode && PET_PRICES[currencyCode] ? currencyCode : 'GBP';
  const prices = {};
  
  ['S', 'M', 'L'].forEach(size => {
    prices[size] = getPetPrice(size, currency);
  });
  
  return prices;
}

// Export for use in other scripts
window.PetPricing = {
  prices: PET_PRICES,
  symbols: CURRENCY_SYMBOLS,
  getPetPrice: getPetPrice,
  getAllPetPrices: getAllPetPrices
};