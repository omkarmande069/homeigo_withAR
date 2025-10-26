# Multi-Currency System 💱

## Overview
HomeGo now supports multiple currencies: **USD ($)**, **INR (₹)**, **EUR (€)**, and **GBP (£)** with automatic conversion and persistent currency selection.

## Features ✨

### 1. **Multiple Currency Support**
- 🇺🇸 USD - US Dollar ($)
- 🇮🇳 INR - Indian Rupee (₹)
- 🇪🇺 EUR - Euro (€)
- 🇬🇧 GBP - British Pound (£)

### 2. **Automatic Conversion**
- All prices stored in USD (base currency)
- Real-time conversion to selected currency
- Accurate exchange rates

### 3. **Persistent Selection**
- Currency choice saved in localStorage
- Persists across page refreshes
- User-specific currency preference

### 4. **Dynamic UI Updates**
- Instant price updates when currency changes
- Currency selector in navigation
- Formatted prices with proper symbols

## Current Exchange Rates

| Currency | Code | Symbol | Rate (per USD) |
|----------|------|--------|----------------|
| US Dollar | USD | $ | 1.00 |
| Indian Rupee | INR | ₹ | 83.12 |
| Euro | EUR | € | 0.92 |
| British Pound | GBP | £ | 0.79 |

## File Structure

```
currency.js              # Core currency manager class
currency-selector.js     # UI component for currency selection
currency-demo.html       # Demo page showcasing features
```

## Usage

### Basic Usage in Your Code

```javascript
// Initialize currency manager
const currencyManager = new CurrencyManager();

// Format a price (automatically uses selected currency)
const price = 899; // USD
console.log(currencyManager.format(price)); 
// Output: "₹74,724.88" (if INR is selected)

// Get current currency
console.log(currencyManager.getCurrency()); // "INR"

// Change currency
currencyManager.setCurrency('EUR');

// Format with specific currency
console.log(currencyManager.format(899, { currency: 'GBP' }));
// Output: "£710.21"
```

### Using the Currency Selector Component

```javascript
const currencySelector = new CurrencySelectorComponent(currencyManager);

// Render dropdown selector
currencySelector.render('currency-selector');

// Or render inline select box
currencySelector.renderInline('currency-selector-inline');
```

### Listening to Currency Changes

```javascript
document.addEventListener('currencyChanged', (event) => {
  console.log('Currency changed to:', event.detail.currency);
  console.log('Symbol:', event.detail.symbol);
  
  // Update your UI
  updatePrices();
});
```

## API Reference

### CurrencyManager Class

#### Methods

**`getCurrency()`**
- Returns: Current selected currency code (string)

**`setCurrency(currency)`**
- Parameters: currency code (string)
- Returns: boolean (success/failure)
- Emits: 'currencyChanged' event

**`getSymbol(currency?)`**
- Parameters: currency code (optional)
- Returns: Currency symbol (string)

**`getName(currency?)`**
- Parameters: currency code (optional)
- Returns: Currency name (string)

**`convert(priceInUSD, targetCurrency?)`**
- Parameters: price in USD (number), target currency code (optional)
- Returns: Converted price (number)

**`format(priceInUSD, options?)`**
- Parameters: 
  - priceInUSD (number)
  - options: { currency?, decimals?, showCode? }
- Returns: Formatted price string with symbol

**`getAvailableCurrencies()`**
- Returns: Array of currency objects

### CurrencySelectorComponent Class

#### Methods

**`render(containerId)`**
- Renders dropdown currency selector
- Parameters: DOM element ID

**`renderInline(containerId)`**
- Renders compact select box
- Parameters: DOM element ID

## Integration Examples

### Example 1: Product Card

```javascript
const product = {
  name: "Modern Sofa",
  price: 899 // in USD
};

const html = `
  <div class="product-card">
    <h3>${product.name}</h3>
    <p class="price">${currencyManager.format(product.price)}</p>
  </div>
`;
```

### Example 2: Shopping Cart

```javascript
const cartItems = [
  { name: "Sofa", price: 899, quantity: 1 },
  { name: "Table", price: 299, quantity: 2 }
];

const total = cartItems.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);

console.log('Total:', currencyManager.format(total));
```

### Example 3: Dashboard Stats

```javascript
const revenue = 12500; // USD

const html = `
  <div class="stat-card">
    <h4>Total Revenue</h4>
    <p class="amount">${currencyManager.format(revenue, { showCode: true })}</p>
  </div>
`;
// Output: "₹1,039,000.00 INR" (if INR selected)
```

## Testing

### Demo Page
Open `currency-demo.html` to see:
- Interactive currency selector
- Sample products with live price updates
- Conversion table
- Exchange rate display

### Test the Feature

1. **Open the application**
   ```bash
   npm run dev
   ```

2. **Look for currency selector** in the navigation bar

3. **Select different currencies** and watch prices update instantly

4. **Refresh the page** - your currency choice persists

## Updating Exchange Rates

To update exchange rates, modify `currency.js`:

```javascript
this.rates = {
    USD: 1,
    INR: 83.50,  // Update rate here
    EUR: 0.95,   // Update rate here
    GBP: 0.80    // Update rate here
};
```

### Future: API Integration

For real-time rates, integrate with a currency API:

```javascript
async updateRates() {
  const response = await fetch('https://api.exchangerate.com/latest/USD');
  const data = await response.json();
  this.rates = {
    USD: 1,
    INR: data.rates.INR,
    EUR: data.rates.EUR,
    GBP: data.rates.GBP
  };
}
```

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Benefits

1. **Better User Experience**
   - Users shop in their preferred currency
   - No mental conversion needed

2. **International Support**
   - Supports major global currencies
   - Easy to add more currencies

3. **Accurate Pricing**
   - Real exchange rate conversion
   - Proper formatting with symbols

4. **Persistence**
   - Remembers user preference
   - Consistent across sessions

## Troubleshooting

### Prices not updating after currency change?
- Check console for 'currencyChanged' event
- Ensure pages listen to the event
- Verify render functions are called

### Currency selector not showing?
- Check if container element exists
- Verify scripts are loaded in correct order
- Check browser console for errors

### Wrong currency symbol?
- Verify currency code is correct
- Check rates object in currency.js

## Next Steps

- 🔄 Add more currencies
- 🌐 Integrate real-time API for rates
- 📊 Add currency analytics
- 💾 Save user preference to backend
- 🔔 Notify users of rate changes

---

**Note**: All product prices should be stored in USD in the database. The currency system handles conversion on the frontend automatically.