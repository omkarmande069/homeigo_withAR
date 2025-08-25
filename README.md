# HomeGo - Furniture Store with AR & Session Management

A modern furniture store website with AR visualization capabilities and integrated user authentication.

## Features

- 🛍️ **E-commerce Platform**: Browse and purchase furniture
- 🥽 **AR Visualization**: View furniture in your space using AR
- 🔐 **User Authentication**: Secure login/signup with Supabase
- 📊 **User Dashboard**: Personalized dashboard for users
- 🛒 **Shopping Cart**: Add items to cart and manage orders
- 📱 **Responsive Design**: Works on all devices

## Session Management Integration

The application now includes comprehensive session management that integrates with all pages:

### Files Added/Modified

1. **`session.js`** - Core session management module
2. **`config.js`** - Centralized configuration
3. **`dashboard.html`** - Protected user dashboard
4. **`index.html`** - Updated with session integration
5. **`script.js`** - Updated navigation with user menu
6. **`login.html`** - Updated redirect to dashboard

### Session Features

- **Automatic Authentication Check**: Verifies user login status on page load
- **Dynamic Navigation**: Shows different UI for logged-in vs guest users
- **User Menu**: Dropdown with profile, orders, wishlist, and logout
- **Protected Routes**: Dashboard requires authentication
- **Session Persistence**: Maintains login state across page refreshes
- **Secure Logout**: Properly clears session and redirects

## Setup Instructions

### 1. Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update `config.js` with your credentials:

```javascript
const config = {
  supabase: {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
  },
  // ... rest of config
};
```

### 2. Database Setup

In your Supabase dashboard, create the following tables:

#### Users Table (auto-created by Supabase Auth)
```sql
-- This is automatically created by Supabase Auth
-- You can add custom columns if needed
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Wishlist Table
```sql
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)

Enable RLS on your tables and add policies:

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);
```

## Usage

### For Users

1. **Registration**: Visit `login.html` to create an account
2. **Login**: Use your email and password to sign in
3. **Dashboard**: Access your personalized dashboard at `dashboard.html`
4. **Shopping**: Browse products and add to cart
5. **Orders**: View your order history in the dashboard
6. **Logout**: Use the user menu to sign out

### For Developers

#### Session Management API

```javascript
// Initialize session manager
const sessionManager = new SessionManager();

// Check if user is logged in
if (sessionManager.isLoggedIn()) {
  console.log('User is authenticated');
}

// Get current user
const user = sessionManager.getUser();
const userName = sessionManager.getUserName();
const userEmail = sessionManager.getUserEmail();

// Logout
await sessionManager.logout();

// Protect routes
if (!sessionManager.requireAuth()) {
  // User will be redirected to login
  return;
}
```

#### Event Listeners

```javascript
// Listen for auth state changes
document.addEventListener('authStateChanged', (event) => {
  const { event: authEvent, session, user, isAuthenticated } = event.detail;
  console.log('Auth state changed:', authEvent, isAuthenticated);
});
```

## File Structure

```
homeigo_withAR/
├── index.html          # Main application page
├── login.html          # Authentication page
├── dashboard.html      # Protected user dashboard
├── config.js           # Configuration file
├── session.js          # Session management module
├── script.js           # Main application logic
├── style.css           # Custom styles
└── README.md           # This file
```

## Security Features

- **JWT Tokens**: Secure authentication using Supabase JWT
- **Row Level Security**: Database-level access control
- **HTTPS Only**: Secure communication (in production)
- **Session Validation**: Automatic token refresh
- **CSRF Protection**: Built into Supabase Auth

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

To run the project locally:

1. Clone the repository
2. Update `config.js` with your Supabase credentials
3. Serve the files using a local server (e.g., `python -m http.server 8000`)
4. Open `http://localhost:8000` in your browser

## Production Deployment

1. Update `config.js` with production Supabase credentials
2. Deploy to your hosting provider (Netlify, Vercel, etc.)
3. Configure environment variables if needed
4. Set up custom domain and SSL

## Troubleshooting

### Common Issues

1. **"Supabase not initialized"**: Check your credentials in `config.js`
2. **"User not authenticated"**: Ensure user has completed email verification
3. **"Database errors"**: Verify RLS policies are correctly set up
4. **"CORS errors"**: Check Supabase project settings for allowed origins

### Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
localStorage.setItem('debug', 'homego:*');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
