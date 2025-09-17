// Global app configuration
export const config = {
    apiBaseUrl: 'http://localhost:3000/api',
    defaultCurrency: 'USD',
    taxRate: 0.08,
    shippingFee: 9.99
};

// Environment settings
export const env = {
    isProduction: false,
    apiVersion: 'v1',
    debug: true
};

// App routes
export const routes = {
    home: '/',
    products: '/products',
    cart: '/cart',
    checkout: '/checkout',
    payment: '/payment',
    account: {
        login: '/login',
        register: '/register',
        dashboard: '/dashboard',
        profile: '/profile'
    }
};

// Event names
export const events = {
    authStateChanged: 'authStateChanged',
    cartUpdated: 'cartUpdated',
    paymentCompleted: 'paymentCompleted'
};
