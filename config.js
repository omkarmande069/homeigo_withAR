// Configuration file for HomeGo
const config = {
  // Supabase Configuration
  supabase: {
    url: 'https://your-project.supabase.co', // Replace with your Supabase URL
    anonKey: 'your-anon-key' // Replace with your Supabase anon key
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
