// Currency Management System for HomeGo
class CurrencyManager {
    constructor() {
        // Exchange rates (base: USD)
        this.rates = {
            USD: 1,
            INR: 83.12,     // Indian Rupee
            EUR: 0.92,      // Euro
            GBP: 0.79,      // British Pound
            AED: 3.67,      // UAE Dirham
            AUD: 1.52,      // Australian Dollar
            CAD: 1.35,      // Canadian Dollar
            SGD: 1.34       // Singapore Dollar
        };

        // Currency symbols
        this.symbols = {
            USD: '$',
            INR: '₹',
            EUR: '€',
            GBP: '£',
            AED: 'د.إ',
            AUD: 'A$',
            CAD: 'C$',
            SGD: 'S$'
        };

        // Currency names
        this.names = {
            USD: 'US Dollar',
            INR: 'Indian Rupee',
            EUR: 'Euro',
            GBP: 'British Pound',
            AED: 'UAE Dirham',
            AUD: 'Australian Dollar',
            CAD: 'Canadian Dollar',
            SGD: 'Singapore Dollar'
        };

        // Get saved currency or default to USD
        this.currentCurrency = localStorage.getItem('currency') || 'USD';
        
        // Try to load saved rates on initialization
        const storedRates = localStorage.getItem('exchangeRates');
        if (storedRates) {
            const { rates, timestamp } = JSON.parse(storedRates);
            const hoursSinceUpdate = (Date.now() - timestamp) / (1000 * 60 * 60);
            
            if (hoursSinceUpdate < 24) {
                this.rates = rates;
                console.log('📊 Initialized with stored rates from', Math.round(hoursSinceUpdate), 'hours ago');
            } else {
                // Rates are too old, fetch new ones
                this.updateRates().catch(console.error);
            }
        } else {
            // No stored rates, try to fetch from API
            this.updateRates().catch(console.error);
        }
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
     * Get last update time for exchange rates
     */
    getLastUpdateTime() {
        const storedRates = localStorage.getItem('exchangeRates');
        if (storedRates) {
            const { timestamp } = JSON.parse(storedRates);
            return new Date(timestamp);
        }
        return null;
    }

    /**
     * Check if rates need updating (older than 24 hours)
     */
    needsUpdate() {
        const storedRates = localStorage.getItem('exchangeRates');
        if (!storedRates) return true;

        const { timestamp } = JSON.parse(storedRates);
        const hoursSinceUpdate = (Date.now() - timestamp) / (1000 * 60 * 60);
        return hoursSinceUpdate >= 24;
    }

    /**
     * Get rate for specific currency
     */
    getRate(currency) {
        return this.rates[currency] || 1;
    }

    /**
     * Update exchange rates from API
     * Uses ExchangeRate-API for real-time rates
     * Fallback to static rates if API fails
     */
    async updateRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            
            const data = await response.json();
            
            // Update only the currencies we support
            Object.keys(this.rates).forEach(currency => {
                if (data.rates[currency]) {
                    this.rates[currency] = data.rates[currency];
                }
            });
            
            // Save rates to localStorage with timestamp
            localStorage.setItem('exchangeRates', JSON.stringify({
                rates: this.rates,
                timestamp: Date.now()
            }));
            
            console.log('📊 Exchange rates updated from API');
            return this.rates;
        } catch (error) {
            console.warn('⚠️ Failed to fetch rates, using stored/static rates:', error);
            
            // Try to use stored rates if available
            const storedRates = localStorage.getItem('exchangeRates');
            if (storedRates) {
                const { rates, timestamp } = JSON.parse(storedRates);
                const hoursSinceUpdate = (Date.now() - timestamp) / (1000 * 60 * 60);
                
                if (hoursSinceUpdate < 24) {
                    this.rates = rates;
                    console.log('📊 Using stored rates from', Math.round(hoursSinceUpdate), 'hours ago');
                    return this.rates;
                }
            }
            
            // Fallback to static rates
            console.log('📊 Using static exchange rates');
            return this.rates;
        }
    }
}

// Export for use in other modules
window.CurrencyManager = CurrencyManager;
