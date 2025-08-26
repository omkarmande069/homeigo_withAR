// Configuration file for HomeGo
const config = {
  // Supabase Configuration
  supabase: {
    url: 'https://qqqbpibgweewnwkmpmzn.supabase.co', // Your actual Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWJwaWJnd2Vld253a21wbXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODkzNjEsImV4cCI6MjA3MTM2NTM2MX0.IgJn42y9ZEPZWT4bw0IfBYSuRSJ64DCUbebRGH75RLM' // Your actual Supabase anon key
  },
  
  // App Configuration
  app: {
    name: 'HomeGo',
    version: '1.0.0',
    description: 'Furniture Store with AR Experience'
  },
  
  // Feature Flags
  features: {
    arEnabled: true,
    authEnabled: true,
    cartEnabled: true,
    wishlistEnabled: true
  },
  
  // API Endpoints (if you have a backend)
  api: {
    baseUrl: '/api',
    endpoints: {
      products: '/products',
      orders: '/orders',
      users: '/users',
      cart: '/cart'
    }
  },
  
  // UI Configuration
  ui: {
    theme: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24'
    },
    breakpoints: {
      mobile: '768px',
      tablet: '1024px',
      desktop: '1280px'
    }
  }
};

// Export for use in other modules
window.config = config;
