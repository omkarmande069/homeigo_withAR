// Currency Management System for HomeGo
class CurrencyManager {
    constructor() {
        // Exchange rates (base: USD)
        this.rates = {
            USD: 1,
            INR: 83.12,     // Indian Rupee
            EUR: 0.92,      // Euro
            GBP: 0.79       // British Pound
        };

        // Currency symbols
        this.symbols = {
            USD: '$',
            INR: '₹',
            EUR: '€',
            GBP: '£'
        };

        // Currency names
        this.names = {
            USD: 'US Dollar',
            INR: 'Indian Rupee',
            EUR: 'Euro',
            GBP: 'British Pound'
        };

        // Get saved currency or default to USD
        this.currentCurrency = localStorage.getItem('currency') || 'USD';
    }

    /**
     * Get current currency
     */
    getCurrency() {
        return this.currentCurrency;
    }

    /**
     * Set current currency
     */
    setCurrency(currency) {
        if (this.rates[currency]) {
            this.currentCurrency = currency;
            localStorage.setItem('currency', currency);
            // Dispatch event for UI updates
            document.dispatchEvent(new CustomEvent('currencyChanged', {
                detail: { currency, symbol: this.symbols[currency] }
            }));
            return true;
        }
        return false;
    }

    /**
     * Get currency symbol
     */
    getSymbol(currency = this.currentCurrency) {
        return this.symbols[currency] || '$';
    }

    /**
     * Get currency name
     */
    getName(currency = this.currentCurrency) {
        return this.names[currency] || 'US Dollar';
    }

    /**
     * Convert price from USD to target currency
     */
    convert(priceInUSD, targetCurrency = this.currentCurrency) {
        const rate = this.rates[targetCurrency] || 1;
        return priceInUSD * rate;
    }

    /**
     * Convert price from any currency to another
     */
    convertBetween(price, fromCurrency, toCurrency) {
        // Convert to USD first
        const priceInUSD = price / this.rates[fromCurrency];
        // Then convert to target currency
        return priceInUSD * this.rates[toCurrency];
    }

    /**
     * Format price with currency symbol
     */
    format(priceInUSD, options = {}) {
        const {
            currency = this.currentCurrency,
            decimals = 2,
            showCode = false
        } = options;

        const convertedPrice = this.convert(priceInUSD, currency);
        const symbol = this.getSymbol(currency);
        const formatted = convertedPrice.toFixed(decimals);

        // Format with thousand separators
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedPrice = parts.join('.');

        // Return with symbol
        if (showCode) {
            return `${symbol}${formattedPrice} ${currency}`;
        }
        return `${symbol}${formattedPrice}`;
    }

    /**
     * Get all available currencies
     */
    getAvailableCurrencies() {
        return Object.keys(this.rates).map(code => ({
            code,
            name: this.names[code],
            symbol: this.symbols[code],
            rate: this.rates[code]
        }));
    }

    /**
     * Update exchange rates (for future API integration)
     */
    async updateRates() {
        // This can be connected to a real-time currency API
        // For now, using static rates
        console.log('📊 Using static exchange rates');
        console.log('Rates:', this.rates);
        return this.rates;
    }
}

// Export for use in other modules
window.CurrencyManager = CurrencyManager;
