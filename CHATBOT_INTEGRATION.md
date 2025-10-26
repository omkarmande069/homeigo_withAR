# AI Chatbot Integration - HomeGo

## Overview
The HomeGo AI Chatbot is now integrated with **role-based access control**, ensuring that only authorized user types can access the chatbot on specific pages.

## Features
- ✅ **Role-Based Access Control** - Chatbot only appears for authorized user roles
- ✅ **Google Gemini AI** - Powered by Google's Gemini Pro API
- ✅ **MongoDB Integration** - Fetches live data from your backend
- ✅ **Personalized Responses** - Context-aware based on user session
- ✅ **Multi-User Support** - Different roles see different chatbot experiences

## Integration by Page

### 1. **index.html** (Customer Homepage)
- **Allowed Roles:** `customer` only
- **Purpose:** Help customers browse products, track orders, and get support
- **Usage:** Chatbot appears for logged-in customers and guests

### 2. **seller.html** (Seller Dashboard)
- **Allowed Roles:** `seller` only
- **Purpose:** Help sellers manage products, track sales, and get business insights
- **Usage:** Only visible to users logged in as sellers

### 3. **admin.html** (Admin Dashboard)
- **Allowed Roles:** `admin` only
- **Purpose:** Help admins manage the platform, view analytics, and handle support tickets
- **Usage:** Only visible to users logged in as admins

### 4. **customer-support.html** (Support Page)
- **Allowed Roles:** `customer`, `support`
- **Purpose:** Assist customers with support tickets and help support staff respond
- **Usage:** Available for both customers seeking help and support staff

## Technical Implementation

### Chatbot Initialization
Each page initializes the chatbot with specific role restrictions:

```javascript
const GEMINI_API_KEY = 'AIzaSyD3EZAjIV5vNvJR2Gdo41lqrQ8Jy9dwfYM';
new HomeGoChatbot(GEMINI_API_KEY, {
  allowedRoles: ['customer', 'seller', 'admin', 'support']
});
```

### Role Detection
The chatbot checks the user's role from the session stored in `localStorage`:

```javascript
const session = localStorage.getItem('userSession');
// Expected format: { userId, email, name, role }
```

### Authorization Logic
- If **no session** exists → User is treated as a guest `customer`
- If **session exists** → Role is checked against `allowedRoles`
- If **not authorized** → Chatbot does not initialize

## User Session Format
The chatbot expects the following session format in `localStorage`:

```json
{
  "userId": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "customer"
}
```

**Supported Roles:**
- `customer` - Regular shoppers
- `seller` - Product vendors
- `admin` - Platform administrators
- `support` - Customer support staff

## How to Test

### 1. Test as Customer (index.html)
1. Navigate to `index.html`
2. Chatbot should appear in bottom-right corner
3. Click to test customer-focused features

### 2. Test as Seller (seller.html)
1. Log in as a seller through `login.html`
2. Navigate to `seller.html`
3. Chatbot should appear with seller-specific context

### 3. Test as Admin (admin.html)
1. Log in as admin
2. Navigate to `admin.html`
3. Chatbot should appear with admin-specific features

### 4. Test Access Control
1. Try accessing pages without proper login
2. Chatbot should not appear or show "not authorized"
3. Log in with correct role to see chatbot

## Customizing Roles

To change which roles can access the chatbot on a page, modify the initialization:

```javascript
// Example: Only allow sellers and admins
new HomeGoChatbot(GEMINI_API_KEY, {
  allowedRoles: ['seller', 'admin']
});

// Example: All roles
new HomeGoChatbot(GEMINI_API_KEY, {
  allowedRoles: ['customer', 'seller', 'admin', 'support']
});

// Example: Customers only
new HomeGoChatbot(GEMINI_API_KEY, {
  allowedRoles: ['customer']
});
```

## Security Notes

1. **API Key Protection**: The Gemini API key is currently client-side. For production, consider moving it to the backend.

2. **Session Management**: User roles are stored in `localStorage`. Ensure your authentication system validates roles on the backend.

3. **Role Validation**: The chatbot performs client-side role checking. Always validate permissions on the backend for sensitive operations.

## Backend Integration

The chatbot connects to your MongoDB backend via the `API` class in `api.js`:

- `API.getProducts()` - Fetch product catalog
- `API.getOrders()` - Fetch order data
- `API.getSellerStats()` - Get seller statistics
- `API.getSupportTickets()` - Retrieve support tickets

## Troubleshooting

### Chatbot Not Appearing
1. Check browser console for errors
2. Verify `api.js` and `chatbot.js` are loaded
3. Check user session in localStorage
4. Verify role matches `allowedRoles`

### Wrong User Experience
1. Check `userSession` role in localStorage
2. Verify initialization `allowedRoles` array
3. Clear cache and reload page

### API Errors
1. Ensure MongoDB backend is running on `http://localhost:3000`
2. Check CORS settings in `server.js`
3. Verify Google Gemini API key is valid

## Future Enhancements
- [ ] Backend API key management
- [ ] More granular permissions (e.g., `seller:premium`)
- [ ] Chat history persistence in MongoDB
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] File attachment support

## Support
For issues or questions, contact the development team or create a support ticket through the chatbot itself!
