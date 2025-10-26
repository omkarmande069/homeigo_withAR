require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://omkar:omkar@ghar.qbuckf8.mongodb.net/?retryWrites=true&w=majority&appName=Ghar';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', MONGODB_URI.split('@')[1]?.split('?')[0] || 'Unknown');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Check your connection string and network access');
    process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-fallback-please-change-in-production';

// Import routes
const productRoutes = require('./routes/products');

// Routes
app.use('/api/products', productRoutes);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, userType } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            fullName,
            userType: userType || 'customer'
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Protected route middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        
        try {
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(403).json({ message: 'User not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(403).json({ message: 'Invalid token' });
        }
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Seller middleware
const requireSeller = (req, res, next) => {
    if (req.user.userType !== 'seller' && req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Seller access required' });
    }
    next();
};

// Protected route example
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.get('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const Product = require('./models/Product');
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // For now, return empty array since we don't have Order model yet
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Customer Routes
app.get('/api/orders/user/:userId', authenticateToken, async (req, res) => {
    try {
        // For now, return empty array since we don't have Order model yet
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user orders' });
    }
});

app.get('/api/wishlist/user/:userId', authenticateToken, async (req, res) => {
    try {
        // For now, return empty array since we don't have Wishlist model yet
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
