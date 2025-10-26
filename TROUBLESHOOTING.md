# Troubleshooting Guide

## 🔧 Common Issues & Solutions

### Issue 1: Chatbot Button Not Appearing

**Symptoms:**
- No chat button in bottom-right corner
- Page loads but chatbot is missing

**Solutions:**

1. **Check Browser Console (F12)**
   - Look for initialization message: `✅ Chatbot initialized successfully`
   - Check for errors in red

2. **Verify Files Are Loaded**
   ```
   Open DevTools (F12) → Network Tab → Reload Page
   Check that these files load successfully:
   - api.js
   - chatbot.js
   ```

3. **Check User Role Authorization**
   ```
   Open DevTools (F12) → Console Tab
   Type: localStorage.getItem('userSession')
   
   Verify role matches page requirements:
   - index.html → role: "customer"
   - seller.html → role: "seller"
   - admin.html → role: "admin"
   ```

4. **Clear Cache and Reload**
   - Press Ctrl+Shift+Delete
   - Clear cache and cookies
   - Hard reload: Ctrl+Shift+R

### Issue 2: Navigation Menu Missing

**Symptoms:**
- Top navigation bar is empty
- Menu items not showing

**Solutions:**

1. **Check script.js is Loading**
   ```
   Open DevTools → Network Tab
   Verify script.js loads without errors
   ```

2. **Wait for Full Page Load**
   - Navigation is injected by JavaScript
   - Wait 2-3 seconds after page loads
   - Check if error occurs in console

3. **Verify File Paths**
   ```html
   <!-- Make sure this line exists in index.html -->
   <script type="module" src="/script.js"></script>
   ```

4. **Check for JavaScript Errors**
   - Open Console (F12)
   - Look for red error messages
   - Fix any errors before navigation loads

### Issue 3: Chatbot Opens But Doesn't Respond

**Symptoms:**
- Chat window opens
- Can type messages but no response
- Or gets error message

**Solutions:**

1. **Verify API Key**
   ```javascript
   // Check if API key is correct in page
   const GEMINI_API_KEY = 'AIzaSyD3EZAjIV5vNvJR2Gdo41lqrQ8Jy9dwfYM';
   ```

2. **Check Internet Connection**
   - Chatbot needs internet to connect to Google Gemini API
   - Test: Open google.com in new tab

3. **Check MongoDB Backend**
   ```bash
   # Make sure backend is running
   # Should see: Server running on http://localhost:3000
   ```

4. **Review Console Errors**
   ```
   F12 → Console
   Look for errors starting with:
   "Chatbot error:" or "API Request failed:"
   ```

### Issue 4: Wrong Chatbot Experience for User Type

**Symptoms:**
- Logged in as seller but seeing customer chatbot
- Wrong features showing

**Solutions:**

1. **Check Session Role**
   ```javascript
   // In console:
   const session = JSON.parse(localStorage.getItem('userSession'));
   console.log(session.role); // Should match your user type
   ```

2. **Clear and Reset Session**
   ```javascript
   // In console:
   localStorage.removeItem('userSession');
   // Then login again
   ```

3. **Verify Page Configuration**
   ```
   - seller.html should have: allowedRoles: ['seller']
   - admin.html should have: allowedRoles: ['admin']
   - index.html should have: allowedRoles: ['customer']
   ```

### Issue 5: Multiple Chatbot Buttons

**Symptoms:**
- Two or more chat buttons appear
- Chatbot UI is duplicated

**Solutions:**

1. **Check for Double Initialization**
   ```
   Search all HTML files for "new HomeGoChatbot"
   Should only appear ONCE per page
   ```

2. **Clear Browser Cache**
   - Old cached scripts might conflict
   - Ctrl+Shift+Delete → Clear cache

3. **Reload Without Cache**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### Issue 6: Chatbot Covers Content

**Symptoms:**
- Chat window blocks important content
- Can't access elements behind chatbot

**Solutions:**

1. **Close the Chatbot**
   - Click the X button in chat window
   - Or click the floating button again

2. **Adjust Z-Index (Developer)**
   ```css
   /* In chatbot.js styles, modify: */
   .chatbot-container {
     z-index: 9999; /* Lower this number if needed */
   }
   ```

## 🧪 Testing Procedure

### Basic Functionality Test

1. **Open Test Page**
   ```
   Open test-chatbot.html in browser
   Check all status indicators turn green ✅
   ```

2. **Test Each Page**
   - index.html → Should show chatbot
   - seller.html → Should show chatbot (when logged in as seller)
   - admin.html → Should show chatbot (when logged in as admin)
   - customer-support.html → Should show chatbot

3. **Test Chat Functionality**
   - Click chat button → Window opens
   - Type "Hello" → Send → Wait for response
   - Try quick action buttons
   - Close and reopen → History persists

### Role Authorization Test

1. **No Login Test**
   ```
   Clear localStorage
   Visit seller.html → Chatbot should NOT appear
   Visit admin.html → Chatbot should NOT appear
   Visit index.html → Chatbot SHOULD appear (guest)
   ```

2. **Seller Login Test**
   ```
   Login as seller
   Visit seller.html → Chatbot SHOULD appear
   Visit admin.html → Chatbot should NOT appear
   ```

3. **Admin Login Test**
   ```
   Login as admin
   Visit admin.html → Chatbot SHOULD appear
   Visit seller.html → Chatbot should NOT appear
   ```

## 📋 Verification Checklist

Before reporting an issue, verify:

- [ ] Browser console shows no errors
- [ ] All script files load successfully (Network tab)
- [ ] MongoDB backend is running (if applicable)
- [ ] User session has correct role in localStorage
- [ ] Cache has been cleared
- [ ] Page has fully loaded (wait 3 seconds)
- [ ] Internet connection is working
- [ ] API key is correct

## 🔍 Debug Commands

### Check Chatbot Status
```javascript
// In browser console:
console.log('Chatbot instance:', window.homeGoChatbot);
console.log('User session:', localStorage.getItem('userSession'));
console.log('Chatbot class available:', typeof HomeGoChatbot);
```

### Force Chatbot Initialization
```javascript
// In browser console (after page loads):
const GEMINI_API_KEY = 'AIzaSyD3EZAjIV5vNvJR2Gdo41lqrQ8Jy9dwfYM';
window.homeGoChatbot = new HomeGoChatbot(GEMINI_API_KEY, {
  allowedRoles: ['customer', 'seller', 'admin', 'support']
});
```

### Clear All Chatbot Data
```javascript
// In browser console:
localStorage.removeItem('chatbot_history');
localStorage.removeItem('userSession');
location.reload();
```

## 🆘 Still Having Issues?

1. **Check Documentation**
   - `README_CHATBOT.md` - Overview
   - `CHATBOT_INTEGRATION.md` - Technical details
   - `CHATBOT_ACCESS_GUIDE.md` - Role matrix

2. **Use Test Page**
   - Open `test-chatbot.html`
   - Check all debug indicators
   - Review console messages

3. **Browser Compatibility**
   - Tested on: Chrome, Firefox, Edge
   - Requires: Modern browser with ES6 support
   - Enable JavaScript

4. **Check Backend**
   ```bash
   # Verify MongoDB is running
   # Verify server.js is running on port 3000
   # Check for CORS errors in console
   ```

---

**Quick Fix Commands:**
```javascript
// Run these in browser console if chatbot isn't working:

// 1. Clear everything
localStorage.clear();

// 2. Set test session
localStorage.setItem('userSession', JSON.stringify({
  userId: 'test',
  email: 'test@test.com',
  name: 'Test User',
  role: 'customer'
}));

// 3. Reload page
location.reload();
```
