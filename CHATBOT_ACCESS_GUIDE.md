# Chatbot Access Guide - Quick Reference

## 📋 Chatbot Availability by Page

| Page | File | Allowed User Types | Purpose |
|------|------|-------------------|---------|
| **Homepage** | `index.html` | 👤 Customer | Browse products, track orders, shopping help |
| **Seller Dashboard** | `seller.html` | 🏪 Seller | Manage products, view sales, business insights |
| **Admin Dashboard** | `admin.html` | 👨‍💼 Admin | Platform management, analytics, support tickets |
| **Support Page** | `customer-support.html` | 👤 Customer<br>🎧 Support Staff | Submit tickets, get help, support assistance |

## 🔐 User Roles

### Customer (`customer`)
- **Access:** Homepage, Support Page
- **Features:** Product search, order tracking, general help
- **Default role** for guests/non-logged-in users

### Seller (`seller`)
- **Access:** Seller Dashboard
- **Features:** Product management, sales analytics, inventory help
- **Must be logged in** as seller

### Admin (`admin`)
- **Access:** Admin Dashboard
- **Features:** Platform management, user oversight, system analytics
- **Must be logged in** as admin

### Support Staff (`support`)
- **Access:** Support Page
- **Features:** Ticket management, customer assistance
- **Must be logged in** as support

## 🚀 How It Works

### Authorization Flow
```
User visits page
    ↓
Chatbot checks localStorage for userSession
    ↓
Role extracted from session.role
    ↓
Role compared to allowedRoles for that page
    ↓
✅ Authorized → Chatbot appears
❌ Not authorized → Chatbot hidden
```

### Session Structure
```json
{
  "userId": "unique-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "customer|seller|admin|support"
}
```

## 🛠️ Testing Checklist

- [ ] **Test 1:** Visit `index.html` → Chatbot should appear for everyone
- [ ] **Test 2:** Login as seller → Visit `seller.html` → Chatbot appears
- [ ] **Test 3:** Login as admin → Visit `admin.html` → Chatbot appears
- [ ] **Test 4:** Login as customer → Visit `customer-support.html` → Chatbot appears
- [ ] **Test 5:** Login as seller → Visit `admin.html` → Chatbot should NOT appear
- [ ] **Test 6:** No login → Visit `seller.html` → Chatbot should NOT appear

## 💡 Quick Tips

1. **Chatbot not showing?**
   - Check browser console for errors
   - Verify user session in localStorage (F12 → Application → Local Storage)
   - Ensure you're on the correct page for your role

2. **Wrong chatbot experience?**
   - Logout and login again with correct role
   - Clear browser cache
   - Check that session.role matches your user type

3. **Need to customize?**
   - Edit the `allowedRoles` array in each page's initialization code
   - See `CHATBOT_INTEGRATION.md` for detailed customization guide

## 📦 Files Modified

- ✅ `chatbot.js` - Added role-based access control
- ✅ `index.html` - Chatbot for customers
- ✅ `seller.html` - Chatbot for sellers
- ✅ `admin.html` - Chatbot for admins
- ✅ `customer-support.html` - Chatbot for customers & support

## 🔗 Related Documentation

- **Full Integration Guide:** `CHATBOT_INTEGRATION.md`
- **API Documentation:** `api.js` comments
- **Backend Setup:** `server.js`

---

**Note:** Login pages (`login.html`, `unified-login.html`) intentionally do NOT have the chatbot to keep the authentication flow clean.
