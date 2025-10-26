# MongoDB Connection Troubleshooting Guide

## ✅ Current Status: Connection Working!
Your MongoDB Atlas connection is successful.

## 🔧 Common Issues & Solutions

### 1. **Network Access Issues**
**Symptoms**: `MongoNetworkError`, connection timeout
**Solutions**:
- Check MongoDB Atlas Network Access settings
- Add your current IP address: `0.0.0.0/0` (for development)
- Verify firewall settings

### 2. **Authentication Problems**
**Symptoms**: `MongoAuthError`, invalid credentials
**Solutions**:
- Verify username/password in connection string
- Check database user permissions
- Ensure user has read/write access to database

### 3. **Connection String Issues**
**Symptoms**: Invalid connection string format
**Solutions**:
```javascript
// Correct format:
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

// Common mistakes:
// - Missing protocol (mongodb+srv://)
// - Wrong cluster name
// - Special characters in password not URL encoded
```

### 4. **Environment Variables Not Loading**
**Symptoms**: Connection using fallback values
**Solutions**:
- Ensure `.env` file is in server directory
- Check `require('dotenv').config()` is at top of server.js
- Verify environment variable names match

### 5. **Database/Collection Access**
**Symptoms**: Connected but operations fail
**Solutions**:
- Check database name in connection string
- Verify collection names in your code
- Ensure proper schema definitions

## 🔍 Quick Diagnostics

### Test Connection:
```bash
cd server
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'your-connection-string')
  .then(() => console.log('✅ Connection successful'))
  .catch(err => console.error('❌ Connection failed:', err.message));
"
```

### Check Environment Variables:
```bash
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI);"
```

## 🛡️ Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use strong, unique passwords**
3. **Restrict network access to specific IPs in production**
4. **Use database-specific users with minimal permissions**
5. **Enable MongoDB Atlas security features**

## 📊 Connection Monitoring

Add this to your server.js for better monitoring:
```javascript
mongoose.connection.on('connected', () => {
    console.log('📘 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('📕 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📙 Mongoose disconnected');
});
```